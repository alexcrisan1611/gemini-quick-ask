import type { PendingPrompt } from './gemini-tabs.ts'

import { openGemini } from './gemini-tabs.ts'
import { getSettings } from './settings.ts'

const LATEST_KEY = 'latest_pending_prompt'

const LATEST_MAX_AGE_MS = 60_000

export type PromptResponse =
	{ prompt: string; autoSubmit: boolean } | { prompt: null }

type Message = { type?: unknown }

type SendResponse = (response: unknown) => void

async function openGeminiFromPopup(sendResponse: SendResponse) {
	const [tab] = await chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
	})

	await openGemini(tab)

	sendResponse({ ok: true })
}

type StoredPrompts = Partial<Record<string, PendingPrompt>>

function isFresh(prompt: PendingPrompt) {
	return Date.now() - prompt.timestamp < LATEST_MAX_AGE_MS
}

function pickPendingPrompt(stored: StoredPrompts, tabKey: string | null) {
	const tabPrompt = tabKey === null ? undefined : stored[tabKey]

	if (tabKey !== null && tabPrompt !== undefined) {
		return { prompt: tabPrompt, usedKeys: [LATEST_KEY, tabKey] }
	}

	const latest = stored[LATEST_KEY]

	if (latest !== undefined && isFresh(latest)) {
		return { prompt: latest, usedKeys: [LATEST_KEY] }
	}

	return null
}

async function takePendingPrompt(tabKey: string | null) {
	const keys = tabKey === null ? [LATEST_KEY] : [tabKey, LATEST_KEY]

	const stored = await chrome.storage.local.get<StoredPrompts>(keys)

	const pending = pickPendingPrompt(stored, tabKey)

	if (pending !== null) {
		await chrome.storage.local.remove(pending.usedKeys)
	}

	return pending?.prompt ?? null
}

async function answerPendingPrompt(
	sender: chrome.runtime.MessageSender,
	sendResponse: SendResponse,
) {
	const tabId = sender.tab?.id

	const tabKey = tabId === undefined ? null : `prompt_tab_${tabId}`

	const promptData = await takePendingPrompt(tabKey)

	if (promptData === null) {
		sendResponse({ prompt: null } satisfies PromptResponse)

		return
	}

	const { autoSubmit } = await getSettings()

	sendResponse({ prompt: promptData.text, autoSubmit } satisfies PromptResponse)
}

export function handleMessage(
	message: Message,
	sender: chrome.runtime.MessageSender,
	sendResponse: SendResponse,
) {
	if (message.type === 'OPEN_GEMINI') {
		void openGeminiFromPopup(sendResponse)

		return true
	}

	if (message.type === 'GET_PENDING_PROMPT') {
		void answerPendingPrompt(sender, sendResponse)

		return true
	}

	return false
}
