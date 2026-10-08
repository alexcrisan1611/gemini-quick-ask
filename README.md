# Quick Ask for Gemini — Chrome Extension

Right-click or press a shortcut to send any text, link, or page to Google Gemini. It opens Gemini, types your prompt, and sends it for you.

Quick Ask for Gemini is an independent extension. It isn't made by, affiliated with, or endorsed by Google. Gemini is a trademark of Google LLC. See the [privacy policy](PRIVACY.md).

---

## Features

- **Ask about selected text:** Highlight text, right-click → **Ask Gemini: "..."**.
- **Ask about a link:** Right-click a link → **Ask Gemini about this link**.
- **Ask about a page:** Right-click empty space on a page → **Ask Gemini about this page** (sends the page address). It's the only item there, so Chrome shows it directly in the menu.
- **Actions:** Right-click selected text or a link → **Actions** → Summarize, Explain simply, Translate to English, Fact-check, or Find counterarguments. Edit them or add your own.
- **Keyboard shortcuts:** Ask about the page or selection, open Gemini, open the popup, or run up to 5 actions without touching the mouse.
- **Zero-click submission:** Types the prompt into Gemini and sends it, with a small status note in the corner.
- **Quick settings popup:** Click the toolbar icon to open Gemini or change everyday settings.
- **About page:** A tour of everything the extension can do, plus privacy and permission details.

---

## Installation (Step-by-Step)

1. Open Google Chrome.
2. In the address bar, go to:
   ```text
   chrome://extensions
   ```
3. In the top-right corner, turn **ON** the **Developer mode** toggle.
4. Click the **Load unpacked** button in the top-left toolbar.
5. Select this folder:
   ```text
   C:\Users\NucBox K8\Projects\gemini-quick-ask
   ```
6. The **Quick Ask for Gemini** extension is now installed and active!

---

## How to Use

1. Go to any website (e.g. Wikipedia, a blog, GitHub, news).
2. **For the page:** Right-click an empty spot and select **"Ask Gemini about this page"**, or press **Alt+Shift+G**.
3. **For text:** Highlight text, right-click, and select **"Ask Gemini: ..."**, or press **Alt+Shift+S**.
4. **For links:** Right-click a link and select **"Ask Gemini about this link"**.
5. **For actions:** Right-click selected text or a link, open **Actions**, and pick what Gemini should do. Or press an action shortcut (Action shortcut 1 is **Alt+Shift+1**).
6. Gemini opens, the prompt is entered automatically, and the answer starts generating.

On selected text and links, Chrome groups the items under a **Quick Ask for Gemini** submenu, since there's more than one.

---

## Keyboard shortcuts

| Shortcut | Default keys |
|---|---|
| Ask Gemini about this page | Alt+Shift+G |
| Ask Gemini about selected text (uses the page if nothing is selected) | Alt+Shift+S |
| Open Gemini | Alt+Shift+O |
| Action shortcut 1 | Alt+Shift+1 |
| Action shortcuts 2–5 | Not set |
| Open the popup | Not set |

Change keys at `chrome://extensions/shortcuts`. Chrome only allows extensions 4 preset keys. If another extension already uses one, Chrome leaves it unset.

Action shortcuts start as the 5 built-in actions in order. Pick a different action for each on the **Shortcuts** page in settings. A shortcut still runs its action if the action is hidden from the menu; if the action is deleted, the shortcut switches to "None".

Shortcuts can't read selected text on `chrome://` pages, the Chrome Web Store, or PDFs, so they use the page address there.

---

## Settings

Click the toolbar icon to open the popup. Use the links at the bottom (or right-click the icon → **Options**) for the full settings page. Changes save automatically.

- **General:** Reuse one Gemini tab (only a tab already on your chosen account), send prompts automatically, open in background (asks and actions only; "Open Gemini" always switches), and Google account (matches the order in Google's account switcher).
- **Right-click menu:** Show or hide each Ask item and the Actions submenu.
- **Shortcuts:** See current keys and choose which action each action shortcut runs.
- **Actions:** Rename, reword, hide, or delete actions, or add your own. The selected text, link, or page address is added after your prompt. **Reset to defaults** restores the original 5.
- **About:** What the extension can do, how it works, privacy, and permissions.

---

## Files Included

- `manifest.json` — Chrome Extension Manifest V3 configuration, including keyboard shortcuts
- `background.js` — Background service worker managing context menus, shortcuts, and tab dispatch
- `content.js` — Script executing on Gemini to auto-type and submit
- `settings.js` — Default settings and built-in actions, shared by every part of the extension
- `ui.js`, `ui.css` — Form logic, shortcut display, and styles shared by the popup and the settings page
- `popup.html`, `popup.js` — Toolbar popup
- `options.html`, `options.js` — Settings page, actions editor, and About page
- `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png` — Icons
- `icon-source.png` — Full-size source image for the icons
