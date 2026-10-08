// Settings page: section navigation, action shortcuts, actions editor, and About
// (plain settings inputs are handled by ui.js)

// ---------- Section navigation (#general, #menu, #shortcuts, #actions, #about) ----------
const sections = [...document.querySelectorAll("main > section")];
const navLinks = [...document.querySelectorAll(".sidebar nav a")];

function showSection() {
  const requested = location.hash.slice(1);
  const current = sections.some((s) => s.dataset.section === requested) ? requested : "general";

  for (const section of sections) {
    section.hidden = section.dataset.section !== current;
  }
  for (const link of navLinks) {
    if (link.hash === `#${current}`) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", showSection);
showSection();

// ---------- Actions editor ----------
const listEl = document.getElementById("actionList");
const template = document.getElementById("actionTemplate");
let actions = [];
let slots = [];
let saveTimer = null;

// Typing saves after a short pause, so Chrome's storage write limits aren't hit
function saveActionsSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveActionsNow, 400);
}

function saveActionsNow(extra = {}) {
  clearTimeout(saveTimer);
  saveTimer = null;
  saveSettings({ actions, ...extra });
}

function renderActions() {
  if (!actions.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No actions yet. Add one below.";
    listEl.replaceChildren(empty);
  } else {
    listEl.replaceChildren(...actions.map(renderAction));
  }
  renderSlots();
}

function renderAction(action) {
  const row = template.content.firstElementChild.cloneNode(true);
  const title = row.querySelector(".title");
  const prompt = row.querySelector(".prompt");
  const show = row.querySelector(".show");

  title.value = action.title;
  prompt.value = action.prompt;
  show.checked = action.show;

  title.addEventListener("input", () => {
    action.title = title.value;
    saveActionsSoon();
    renderSlots();
  });
  prompt.addEventListener("input", () => {
    action.prompt = prompt.value;
    saveActionsSoon();
  });
  show.addEventListener("change", () => {
    action.show = show.checked;
    saveActionsNow();
  });
  row.querySelector(".delete").addEventListener("click", () => {
    if (!confirm(`Delete "${action.title || "this action"}"?`)) return;
    actions = actions.filter((a) => a !== action);
    // Any shortcut that ran this action switches to "None"
    slots = slots.map((id) => (id === action.id ? null : id));
    saveActionsNow({ actionSlots: slots });
    renderActions();
  });

  return row;
}

document.getElementById("addAction").addEventListener("click", () => {
  actions.push({ id: `custom-${Date.now()}`, title: "", prompt: "", show: true });
  saveActionsNow();
  renderActions();
  listEl.lastElementChild.querySelector(".title").focus();
});

document.getElementById("resetActions").addEventListener("click", () => {
  if (!confirm("Restore the original 5 actions? Your edits and custom actions will be removed.")) return;
  actions = structuredClone(DEFAULT_ACTIONS);
  // Shortcuts that ran a removed custom action switch to "None"
  slots = slots.map((id) => (actions.some((a) => a.id === id) ? id : null));
  saveActionsNow({ actionSlots: slots });
  renderActions();
});

// Save a pending edit if the tab is closed mid-typing
window.addEventListener("pagehide", () => {
  if (saveTimer) saveActionsNow();
});

// ---------- Action shortcuts ----------
const slotList = document.getElementById("slotList");

function renderSlots() {
  slotList.replaceChildren(...slots.map((actionId, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span class="row-title">Action shortcut ${i + 1}</span>
      <span class="slot-controls">
        <select aria-label="Action for shortcut ${i + 1}"></select>
        <span class="keys" data-command="action-${i + 1}"></span>
      </span>`;

    const select = row.querySelector("select");
    select.add(new Option("None", ""));
    for (const action of actions) {
      select.add(new Option(action.title.trim() || "Untitled action", action.id));
    }
    select.value = actions.some((a) => a.id === actionId) ? actionId : "";
    select.addEventListener("change", () => {
      slots[i] = select.value || null;
      saveSettings({ actionSlots: slots });
    });

    return row;
  }));
  renderShortcutKeys();
}

document.getElementById("changeShortcuts").addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

// Coming back from Chrome's shortcuts page: show the new keys
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") renderShortcutKeys();
});

// ---------- About ----------
document.getElementById("version").textContent = `Version ${chrome.runtime.getManifest().version}`;

getSettings().then((settings) => {
  actions = settings.actions;
  slots = Array.from({ length: ACTION_SLOT_COUNT }, (_, i) => settings.actionSlots[i] ?? null);
  renderActions();
});
