// Open a settings section, reusing the settings tab if it's already open
async function openSettings(section) {
  const view = chrome.extension.getViews({ type: "tab" })
    .find((v) => v.location.pathname === "/options.html");

  if (view) {
    view.location.hash = section;
    const tab = await view.chrome.tabs.getCurrent();
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: `options.html#${section}` });
  }
  window.close();
}

document.getElementById("openGemini").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "OPEN_GEMINI" });
  window.close();
});

document.getElementById("openSettings").addEventListener("click", () => openSettings("general"));

for (const link of document.querySelectorAll("footer a")) {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openSettings(link.dataset.section);
  });
}
