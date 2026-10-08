# Chrome Web Store submission kit

Everything to paste into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Before you start

1. Register as a Chrome Web Store developer (one-time $5.00 fee) at the dashboard link above.
2. Build the package from the project folder:
   ```powershell
   .\build.ps1
   ```
   This creates `dist\quick-ask-for-gemini-<version>.zip` with only the files the extension needs.
3. In the dashboard, click **New item** and upload the zip.

---

## Store listing tab

**Name** (from the manifest): Quick Ask for Gemini

**Summary** (from the manifest, max 132 characters):
> Right-click or press a shortcut to send any text, link, or page to Gemini, with automatic submission. Not affiliated with Google.

**Category:** Tools (alternative: Productivity)

**Language:** English (United States)

**Description:**

```text
Send anything on the web to Gemini in one step. Quick Ask for Gemini opens Gemini, types your prompt, and sends it for you.

ASK ABOUT ANYTHING
• Highlight text, right-click, and choose "Ask Gemini".
• Right-click a link to ask about it.
• Right-click empty space on any page to ask about the page.

ACTIONS
Summarize, explain simply, translate to English, fact-check, or find counterarguments in one click. Edit the built-in actions or write your own prompts.

KEYBOARD SHORTCUTS
• Alt+Shift+G: ask about the current page
• Alt+Shift+S: ask about the selected text
• Alt+Shift+O: open Gemini
• Up to 5 action shortcuts, each running the action you choose
Change keys any time at chrome://extensions/shortcuts.

WORKS YOUR WAY
• Reuse one Gemini tab instead of opening a new one each time
• Review prompts before they're sent, or let them send automatically
• Stay on your page while Gemini works in the background
• Choose which signed-in Google account Gemini opens under
• Show or hide each right-click item

PRIVATE BY DESIGN
No servers, no analytics, no tracking. Text only leaves your browser when you send it to Gemini.

Quick Ask for Gemini is an independent extension. It isn't made by, affiliated with, or endorsed by Google. Gemini is a trademark of Google LLC.
```

**Store icon:** `icon128.png` (128×128)

**Screenshots** (1280×800, in this order):
1. `store/screenshots/1-about.png`
2. `store/screenshots/2-general.png`
3. `store/screenshots/3-shortcuts.png`
4. `store/screenshots/4-actions.png`

Optional but recommended: add a screenshot of the right-click menu on a real web page, which you can only capture in Chrome itself (Windows: Win+Shift+S, then crop or pad to 1280×800).

**Small promo tile (440×280):** optional; skip for the first submission.

**Homepage URL:** https://github.com/alexcrisan1611/gemini-quick-ask

**Support URL:** https://github.com/alexcrisan1611/gemini-quick-ask/issues

---

## Privacy practices tab

**Single purpose:**
> Send text, links, or page addresses the user chooses to Google Gemini, and type and submit them as a prompt.

**Permission justifications:**

| Permission | Justification |
|---|---|
| `contextMenus` | Adds "Ask Gemini" items and the Actions submenu to the right-click menu. |
| `storage` | Saves the user's settings and custom actions, and briefly holds the prompt until the Gemini tab types it in. |
| `activeTab` | When the user presses a keyboard shortcut, reads the address of the current tab so it can be sent to Gemini. |
| `scripting` | When the user presses a keyboard shortcut, reads the selected text on the current tab. Runs only on that tab, only when the user asks. |
| Host permission `https://gemini.google.com/*` | Runs the content script that types the prompt into Gemini and sends it, and finds an open Gemini tab to reuse. |

**Remote code:** No, I am not using remote code.

**Data usage:** check **Website content** (the selected text or page address the user chooses to send). Leave every other category unchecked.

Then tick all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** https://github.com/alexcrisan1611/gemini-quick-ask/blob/main/PRIVACY.md

---

## Distribution tab

- **Visibility:** Public (or Unlisted to test with a link first)
- **Regions:** All regions

## Account tab

Fill in a contact email and verify it. The dashboard won't let you publish until it's verified.

## Submit

Click **Submit for review**. Reviews usually take from a few days to a few weeks. Extensions with `scripting` and host permissions can take longer.
