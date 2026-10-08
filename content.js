(async function () {
  "use strict";

  // Request pending prompt from background service worker
  let response;
  try {
    response = await chrome.runtime.sendMessage({ type: "GET_PENDING_PROMPT" });
  } catch (e) {
    // Service worker might be sleeping or context invalidated
    return;
  }

  if (!response || !response.prompt) {
    return;
  }

  const promptText = response.prompt;

  // Show a sleek notification banner
  const banner = document.createElement("div");
  banner.id = "gemini-quick-ask-hud";
  banner.style.position = "fixed";
  banner.style.bottom = "24px";
  banner.style.right = "24px";
  banner.style.zIndex = "999999";
  banner.style.backgroundColor = "rgba(18, 21, 36, 0.94)";
  banner.style.color = "#FFFFFF";
  banner.style.padding = "12px 20px";
  banner.style.borderRadius = "12px";
  banner.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.45)";
  banner.style.fontFamily = "Google Sans, Roboto, system-ui, -apple-system, sans-serif";
  banner.style.fontSize = "13px";
  banner.style.fontWeight = "500";
  banner.style.display = "flex";
  banner.style.alignItems = "center";
  banner.style.gap = "10px";
  banner.style.border = "1px solid rgba(123, 97, 255, 0.4)";
  banner.style.backdropFilter = "blur(12px)";
  banner.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  banner.innerHTML = `
    <span style="font-size: 16px;">✨</span>
    <span><strong>Quick Ask for Gemini:</strong> Preparing prompt...</span>
  `;
  document.body.appendChild(banner);

  function updateHUD(icon, text, autoDismiss = false) {
    banner.innerHTML = `
      <span style="font-size: 16px;">${icon}</span>
      <span>${text}</span>
    `;
    if (autoDismiss) {
      setTimeout(() => {
        banner.style.opacity = "0";
        banner.style.transform = "translateY(10px)";
        setTimeout(() => banner.remove(), 400);
      }, 2500);
    }
  }

  // Poll for element in DOM
  function waitFor(selector, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const interval = 100;
      let elapsed = 0;
      const timer = setInterval(() => {
        const found = document.querySelector(selector);
        if (found) {
          clearInterval(timer);
          resolve(found);
        }
        elapsed += interval;
        if (elapsed >= timeoutMs) {
          clearInterval(timer);
          reject(new Error("Timeout waiting for " + selector));
        }
      }, interval);
    });
  }

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  try {
    updateHUD("⏳", "Connecting to Gemini prompt box...");

    // Selectors for Gemini's prompt input
    const inputSelector = [
      'rich-textarea [contenteditable="true"]',
      'div.ql-editor[contenteditable="true"]',
      '[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea[aria-label*="prompt" i]',
      'textarea'
    ].join(", ");

    const editor = await waitFor(inputSelector, 20000);

    updateHUD("✍️", "Inserting prompt...");
    editor.focus();
    await delay(150);

    // Try modern execCommand first (best for Quill / rich text reactive state)
    let inserted = document.execCommand("insertText", false, promptText);

    // If editor still empty, inject directly and dispatch input events
    if (!inserted || !editor.innerText || !editor.innerText.trim()) {
      editor.innerText = promptText;
      editor.dispatchEvent(new Event("beforeinput", { bubbles: true }));
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      editor.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }

    await delay(250);

    // Auto-submit turned off in settings: leave the prompt for the user to review
    if (response.autoSubmit === false) {
      editor.focus();
      updateHUD("✍️", "Prompt ready. Press Enter to send.", true);
      return;
    }

    updateHUD("🚀", "Submitting query...");

    // Find the send button
    const sendButtonSelector = [
      'button[aria-label*="Send message" i]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="Submit" i]',
      'button.send-button',
      'button[jsname="Qx7uuf"]',
      '.send-button-container button',
      'rich-textarea ~ button'
    ].join(", ");

    // Wait up to 3 seconds for button to become enabled
    let buttonClicked = false;
    const startWait = Date.now();
    while (Date.now() - startWait < 3000) {
      const btn = document.querySelector(sendButtonSelector);
      if (btn && !btn.disabled && btn.getAttribute("aria-disabled") !== "true") {
        btn.click();
        buttonClicked = true;
        break;
      }
      await delay(150);
    }

    // Fallback: If button was not clicked, dispatch Enter key
    if (!buttonClicked) {
      editor.focus();
      editor.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        })
      );
    }

    updateHUD("✅", "Answer generating...", true);
  } catch (err) {
    console.warn("[Quick Ask for Gemini]", err);
    updateHUD("⚠️", "Could not auto-submit prompt. Please click Send manually.", true);
  }
})();
