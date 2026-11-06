import { handleMenuClick, setupMenus } from './context-menus.ts'
import { handleMessage } from './messages.ts'
import { handleCommand } from './shortcuts.ts'

chrome.runtime.onInstalled.addListener(setupMenus)

chrome.runtime.onStartup.addListener(setupMenus)

chrome.storage.onChanged.addListener((_changes, area) => {
	if (area === 'sync') {
		setupMenus()
	}
})

chrome.contextMenus.onClicked.addListener((info, currentTab) => {
	void handleMenuClick(info, currentTab)
})

chrome.commands.onCommand.addListener((command, tab) => {
	void handleCommand(command, tab)
})

// oxlint-disable-next-line typescript/strict-void-return -- Chrome keeps the message channel open for sendResponse only when the listener returns true
chrome.runtime.onMessage.addListener(handleMessage)
