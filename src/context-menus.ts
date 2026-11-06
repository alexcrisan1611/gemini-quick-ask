import type { Action, Settings } from './settings.ts'

import { sendToGemini } from './gemini-tabs.ts'
import { actionPrompt, getSettings } from './settings.ts'

const ACTION_MENU_PREFIX = 'gemini-action-'

const ACTION_CONTEXTS: [
	`${chrome.contextMenus.ContextType}`,
	...`${chrome.contextMenus.ContextType}`[],
] = ['selection', 'link']

function isMenuAction(action: Action) {
	return (
		action.show && action.title.trim() !== '' && action.prompt.trim() !== ''
	)
}

function createAskMenus(settings: Settings) {
	if (settings.showAskSelection) {
		chrome.contextMenus.create({
			id: 'gemini-ask-selection',
			title: 'Ask Gemini: "%s"',
			contexts: ['selection'],
		})
	}

	if (settings.showAskLink) {
		chrome.contextMenus.create({
			id: 'gemini-ask-link',
			title: 'Ask Gemini about this link',
			contexts: ['link'],
		})
	}

	if (settings.showAskPage) {
		chrome.contextMenus.create({
			id: 'gemini-ask-page',
			title: 'Ask Gemini about this page',
			contexts: ['page'],
		})
	}
}

function createActionMenus(settings: Settings) {
	const actions = settings.actions.filter(isMenuAction)

	if (!settings.showActions || actions.length === 0) {
		return
	}

	chrome.contextMenus.create({
		id: 'gemini-actions',
		title: 'Actions',
		contexts: ACTION_CONTEXTS,
	})

	for (const action of actions) {
		chrome.contextMenus.create({
			id: ACTION_MENU_PREFIX + action.id,
			parentId: 'gemini-actions',
			title: action.title.trim(),
			contexts: ACTION_CONTEXTS,
		})
	}
}

async function buildMenus() {
	const settings = await getSettings()

	await chrome.contextMenus.removeAll()

	createAskMenus(settings)

	createActionMenus(settings)
}

let menuQueue = Promise.resolve()

async function buildMenusAfterQueue() {
	try {
		await menuQueue

		await buildMenus()
	} catch (error) {
		console.warn('[Quick Ask for Gemini]', error)
	}
}

export function setupMenus() {
	menuQueue = buildMenusAfterQueue()
}

async function actionMenuPrompt(
	menuId: string,
	info: chrome.contextMenus.OnClickData,
) {
	if (!menuId.startsWith(ACTION_MENU_PREFIX)) {
		return ''
	}

	const { actions } = await getSettings()

	const action = actions.find(
		(candidate) => ACTION_MENU_PREFIX + candidate.id === menuId,
	)

	const target =
		[info.selectionText, info.linkUrl]
			.find((text) => text !== undefined && text !== '')
			?.trim() ?? ''

	return action !== undefined && target !== ''
		? actionPrompt(action, target)
		: ''
}

function askPrompt(menuId: string, info: chrome.contextMenus.OnClickData) {
	switch (menuId) {
		case 'gemini-ask-selection': {
			return info.selectionText?.trim() ?? ''
		}
		case 'gemini-ask-link': {
			return info.linkUrl?.trim() ?? ''
		}
		case 'gemini-ask-page': {
			return info.pageUrl?.trim() ?? ''
		}
		default: {
			return null
		}
	}
}

export async function handleMenuClick(
	info: chrome.contextMenus.OnClickData,
	currentTab: chrome.tabs.Tab | undefined,
) {
	const menuId = String(info.menuItemId)

	const promptText =
		askPrompt(menuId, info) ?? (await actionMenuPrompt(menuId, info))

	if (promptText) {
		await sendToGemini(promptText, currentTab)
	}
}
