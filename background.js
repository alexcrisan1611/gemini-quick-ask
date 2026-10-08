importScripts("settings.js");

const ACTION_MENU_PREFIX = "gemini-action-";
const ACTION_COMMAND_PREFIX = "action-";
// "Ask about this page" stays the only page item, so Chrome shows it at the top level
const ACTION_CONTEXTS = ["selection", "link"];

// Gemini URL for the chosen signed-in account (0 = default account)
function geminiUrl(accountIndex) {
  return accountIndex > 0
    ? `https://gemini.google.com/u/${accountIndex}/app`
    : "https://gemini.google.com/app";
}

// Read the account index from a Gemini tab URL (e.g. /u/1/app); no /u/ means the default account
function accountIndexOf(url) {
  const match = new URL(url).pathname.match(/^\/u\/(\d+)(\/|$)/);
  return match ? Number(match[1]) : 0;
}

// Actions with an empty name or prompt stay out of the menu until filled in
function isMenuAction(action) {
  return action.show && action.title.trim() && action.prompt.trim();
}

// Build context menus from the current settings
async function buildMenus() {
  const settings = await getSettings();
  await chrome.contextMenus.removeAll();

  // 1. Right-click on selected text
  if (settings.showAskSelection) {
    chrome.contextMenus.create({
      id: "gemini-ask-selection",
      title: 'Ask Gemini: "%s"',
      contexts: ["selection"]
    });
  }

  // 2. Right-click on a hyperlink
  if (settings.showAskLink) {
    chrome.contextMenus.create({
      id: "gemini-ask-link",
      title: "Ask Gemini about this link",
      contexts: ["link"]
    });
  }

  // 3. Right-click on empty page space: ask about the current page URL
  if (settings.showAskPage) {
    chrome.contextMenus.create({
      id: "gemini-ask-page",
      title: "Ask Gemini about this page",
      contexts: ["page"]
    });
  }

  // 4. Actions submenu: applies to the selection or link that was right-clicked
  const actions = settings.actions.filter(isMenuAction);
  if (settings.showActions && actions.length) {
    chrome.contextMenus.create({
      id: "gemini-actions",
      title: "Actions",
      contexts: ACTION_CONTEXTS
    });
    for (const action of actions) {
      chrome.contextMenus.create({
        id: ACTION_MENU_PREFIX + action.id,
        parentId: "gemini-actions",
        title: action.title.trim(),
        contexts: ACTION_CONTEXTS
      });
    }
  }
}

// Rebuild menus one at a time so overlapping rebuilds can't create duplicate ids
let menuQueue = Promise.resolve();
function setupMenus() {
  menuQueue = menuQueue.then(buildMenus).catch((err) => console.warn("[Quick Ask for Gemini]", err));
  return menuQueue;
}

chrome.runtime.onInstalled.addListener(setupMenus);
chrome.runtime.onStartup.addListener(setupMenus);

// Settings changed in the popup or settings page: update the menu right away
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") setupMenus();
});

// Find an open Gemini tab on the given account, preferring one in the current window
async function findGeminiTab(currentTab, accountIndex) {
  const tabs = (await chrome.tabs.query({ url: "https://gemini.google.com/*" }))
    .filter((t) => t.url && accountIndexOf(t.url) === accountIndex);
  if (!tabs.length) return null;
  return tabs.find((t) => currentTab && t.windowId === currentTab.windowId) || tabs[0];
}

async function focusTab(tab) {
  await chrome.tabs.update(tab.id, { active: true });
  await chrome.windows.update(tab.windowId, { focused: true });
}

async function savePendingPrompt(tabId, text) {
  const payload = {
    text,
    timestamp: Date.now()
  };
  // Save under tab-specific key AND global latest key as fallback
  await chrome.storage.local.set({
    [`prompt_tab_${tabId}`]: payload,
    latest_pending_prompt: payload
  });
}

// Open Gemini without a prompt (always switches to it)
async function openGemini(currentTab) {
  const { reuseTab, accountIndex } = await getSettings();
  const existing = reuseTab ? await findGeminiTab(currentTab, accountIndex) : null;

  if (existing) {
    await focusTab(existing);
  } else {
    await chrome.tabs.create({ url: geminiUrl(accountIndex) });
  }
}

// Open Gemini and hand the prompt to the content script
async function sendToGemini(promptText, currentTab) {
  const { reuseTab, accountIndex, openInBackground } = await getSettings();
  const url = geminiUrl(accountIndex);
  const existing = reuseTab ? await findGeminiTab(currentTab, accountIndex) : null;

  if (existing) {
    // Save first, then load a fresh chat in that tab so the content script picks it up
    await savePendingPrompt(existing.id, promptText);
    await chrome.tabs.update(existing.id, { url });
    if (!openInBackground) await focusTab(existing);
    return;
  }

  const newTab = await chrome.tabs.create({ url, active: !openInBackground });
  if (newTab && newTab.id) {
    await savePendingPrompt(newTab.id, promptText);
  }
}

// Selected text in the tab's top frame; empty on pages Chrome blocks (chrome://, Web Store, PDFs)
async function getSelectedText(tab) {
  try {
    const [frame] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => getSelection().toString()
    });
    return (frame && frame.result ? frame.result : "").trim();
  } catch {
    return "";
  }
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, currentTab) => {
  const menuId = String(info.menuItemId);
  let promptText = "";

  if (menuId === "gemini-ask-selection") {
    promptText = info.selectionText ? info.selectionText.trim() : "";
  } else if (menuId === "gemini-ask-link") {
    promptText = info.linkUrl ? info.linkUrl.trim() : "";
  } else if (menuId === "gemini-ask-page") {
    promptText = info.pageUrl ? info.pageUrl.trim() : "";
  } else if (menuId.startsWith(ACTION_MENU_PREFIX)) {
    const { actions } = await getSettings();
    const action = actions.find((a) => ACTION_MENU_PREFIX + a.id === menuId);
    // Most specific target first: selected text, then link
    const target = (info.selectionText || info.linkUrl || "").trim();
    if (action && target) {
      promptText = actionPrompt(action, target);
    }
  }

  if (!promptText) return;

  await sendToGemini(promptText, currentTab);
});

// Handle keyboard shortcuts (keys are set at chrome://extensions/shortcuts)
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "open-gemini") {
    await openGemini(tab);
    return;
  }
  if (!tab) return;

  const pageUrl = tab.url || "";
  let promptText = "";

  if (command === "ask-page") {
    promptText = pageUrl;
  } else if (command === "ask-selection") {
    // Nothing selected: ask about the page instead
    promptText = (await getSelectedText(tab)) || pageUrl;
  } else if (command.startsWith(ACTION_COMMAND_PREFIX)) {
    const { actions, actionSlots } = await getSettings();
    const slot = Number(command.slice(ACTION_COMMAND_PREFIX.length)) - 1;
    // Hidden actions still run from their shortcut; "Show in menu" only affects the menu
    const action = actions.find((a) => a.id === actionSlots[slot]);
    const target = (await getSelectedText(tab)) || pageUrl;
    if (action && action.prompt.trim() && target) {
      promptText = actionPrompt(action, target);
    }
  }

  if (!promptText) return;

  await sendToGemini(promptText, tab);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // "Open Gemini" button in the toolbar popup
  if (message.type === "OPEN_GEMINI") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true })
      .then(([tab]) => openGemini(tab))
      .then(() => sendResponse({ ok: true }));
    return true; // Keep message port open for async response
  }

  // Provide prompt to content script upon request
  if (message.type === "GET_PENDING_PROMPT") {
    const tabId = sender.tab ? sender.tab.id : null;
    const tabKey = tabId ? `prompt_tab_${tabId}` : null;

    chrome.storage.local.get(tabKey ? [tabKey, "latest_pending_prompt"] : ["latest_pending_prompt"]).then(async (data) => {
      let promptData = null;
      let usedKey = null;

      if (tabKey && data[tabKey]) {
        promptData = data[tabKey];
        usedKey = tabKey;
      } else if (data.latest_pending_prompt) {
        // Only use latest_pending_prompt if it was created within the last 60 seconds
        if (Date.now() - data.latest_pending_prompt.timestamp < 60000) {
          promptData = data.latest_pending_prompt;
          usedKey = "latest_pending_prompt";
        }
      }

      if (promptData) {
        // Clean up consumed prompt
        const keysToRemove = ["latest_pending_prompt"];
        if (usedKey) keysToRemove.push(usedKey);
        await chrome.storage.local.remove(keysToRemove);

        const { autoSubmit } = await getSettings();
        sendResponse({ prompt: promptData.text, autoSubmit });
      } else {
        sendResponse({ prompt: null });
      }
    });

    return true; // Keep message port open for async response
  }
});
