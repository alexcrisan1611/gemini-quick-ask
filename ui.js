// Shared by popup.html and options.html: binds every input whose id is a setting key
const statusEl = document.getElementById("status");
let statusTimer;

function showStatus(text, durationMs = 1500) {
  statusEl.textContent = text;
  statusEl.classList.add("visible");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => statusEl.classList.remove("visible"), durationMs);
}

async function saveSettings(values) {
  try {
    await chrome.storage.sync.set(values);
    showStatus("Saved");
  } catch (err) {
    showStatus(`Couldn't save: ${err.message}`, 5000);
  }
}

// Show a command's keys as <kbd> chips, e.g. Alt + Shift + G
function renderKeys(el, shortcut) {
  el.classList.toggle("unset", !shortcut);
  if (!shortcut) {
    el.textContent = "Not set";
    return;
  }
  el.replaceChildren(...shortcut.split("+").map((key) => {
    const kbd = document.createElement("kbd");
    kbd.textContent = key;
    return kbd;
  }));
}

// Fill every element with data-command="<command name>" with its current keys
async function renderShortcutKeys() {
  const commands = await chrome.commands.getAll();
  for (const el of document.querySelectorAll("[data-command]")) {
    const command = commands.find((c) => c.name === el.dataset.command);
    renderKeys(el, command && command.shortcut);
  }
}

// Fill the account picker: Default account, Account 2 ... Account 10
const accountSelect = document.getElementById("accountIndex");
for (let i = 0; i < MAX_ACCOUNTS; i++) {
  accountSelect.add(new Option(i === 0 ? "Default account" : `Account ${i + 1}`, i));
}

// Load saved values into the form
getSettings().then((settings) => {
  for (const [key, value] of Object.entries(settings)) {
    const input = document.getElementById(key);
    if (!input) continue;
    if (input.type === "checkbox") {
      input.checked = value;
    } else {
      input.value = value;
    }
  }
});

// Save each setting as soon as it changes
document.addEventListener("change", (event) => {
  const input = event.target;
  if (!(input.id in DEFAULT_SETTINGS)) return;

  const value = input.type === "checkbox" ? input.checked : Number(input.value);
  saveSettings({ [input.id]: value });
});

renderShortcutKeys();
