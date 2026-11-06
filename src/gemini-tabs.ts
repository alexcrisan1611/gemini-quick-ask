import { getSettings } from './settings.ts'

const GEMINI_TABS = 'https://gemini.google.com/*'

export type PendingPrompt = {
	text: string
	timestamp: number
}

function geminiUrl(accountIndex: number) {
	return accountIndex > 0
		? `https://gemini.google.com/u/${accountIndex}/app`
		: 'https://gemini.google.com/app'
}

function accountIndexOf(url: string) {
	const match = /^\/u\/(\d+)(\/|$)/u.exec(new URL(url).pathname)

	return match ? Number(match[1]) : 0
}

async function findGeminiTab(
	currentTab: chrome.tabs.Tab | undefined,
	accountIndex: number,
) {
	const tabs = (await chrome.tabs.query({ url: GEMINI_TABS })).filter(
		(tab) =>
			tab.url !== undefined &&
			tab.url !== '' &&
			accountIndexOf(tab.url) === accountIndex,
	)

	return (
		tabs.find(
			(tab) => currentTab !== undefined && tab.windowId === currentTab.windowId,
		) ?? tabs[0]
	)
}

async function focusTab(tab: chrome.tabs.Tab) {
	await chrome.tabs.update(tab.id, { active: true })

	await chrome.windows.update(tab.windowId, { focused: true })
}

async function savePendingPrompt(tabId: number, text: string) {
	const payload = { text, timestamp: Date.now() } satisfies PendingPrompt

	await chrome.storage.local.set({
		[`prompt_tab_${tabId}`]: payload,
		latest_pending_prompt: payload,
	})
}

export async function openGemini(currentTab: chrome.tabs.Tab | undefined) {
	const { reuseTab, accountIndex } = await getSettings()

	const existing = reuseTab
		? await findGeminiTab(currentTab, accountIndex)
		: undefined

	await (existing
		? focusTab(existing)
		: chrome.tabs.create({ url: geminiUrl(accountIndex) }))
}

async function openPromptTab(
	url: string,
	promptText: string,
	openInBackground: boolean,
) {
	const newTab = await chrome.tabs.create({ url, active: !openInBackground })

	if (newTab.id !== undefined) {
		await savePendingPrompt(newTab.id, promptText)
	}
}

export async function sendToGemini(
	promptText: string,
	currentTab: chrome.tabs.Tab | undefined,
) {
	const { reuseTab, accountIndex, openInBackground } = await getSettings()

	const url = geminiUrl(accountIndex)

	const existing = reuseTab
		? await findGeminiTab(currentTab, accountIndex)
		: undefined

	if (existing?.id === undefined) {
		await openPromptTab(url, promptText, openInBackground)

		return
	}

	await savePendingPrompt(existing.id, promptText)

	await chrome.tabs.update(existing.id, { url })

	if (!openInBackground) {
		await focusTab(existing)
	}
}
