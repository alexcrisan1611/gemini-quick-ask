// Shared by background.js (via importScripts), popup.html, and options.html

// Built-in actions for the "Actions" submenu; "Reset to defaults" restores these
const DEFAULT_ACTIONS = [
  { id: "summarize", title: "Summarize", prompt: "Summarize this:", show: true },
  { id: "explain", title: "Explain simply", prompt: "Explain this in simple terms:", show: true },
  { id: "translate", title: "Translate to English", prompt: "Translate this to English:", show: true },
  { id: "fact-check", title: "Fact-check", prompt: "Fact-check this. Point out anything wrong or misleading:", show: true },
  { id: "counter", title: "Find counterarguments", prompt: "What are the strongest counterarguments to this?", show: true }
];

// Google allows up to 10 signed-in accounts
const MAX_ACCOUNTS = 10;

// Number of "Action shortcut N" commands declared in manifest.json
const ACTION_SLOT_COUNT = 5;

const DEFAULT_SETTINGS = {
  reuseTab: false,
  autoSubmit: true,
  openInBackground: false,
  accountIndex: 0,
  showAskSelection: true,
  showAskLink: true,
  showAskPage: true,
  showActions: true,
  actions: DEFAULT_ACTIONS,
  // Action id run by each action shortcut (null = none); starts as the built-ins in order
  actionSlots: DEFAULT_ACTIONS.slice(0, ACTION_SLOT_COUNT).map((a) => a.id)
};

function getSettings() {
  return chrome.storage.sync.get(DEFAULT_SETTINGS);
}

// An action's prompt, followed by the text, link, or page URL it runs on
function actionPrompt(action, target) {
  return `${action.prompt.trim()}\n\n${target}`;
}
