import { openGemini, sendToGemini } from './gemini-tabs.ts'
import { actionPrompt, getSettings } from './settings.ts'

const ACTION_COMMAND_PREFIX = 'action-'

async function getSelectedText(tab: chrome.tabs.Tab) {
	try {
		const [frame] = await chrome.scripting.executeScript({
			target: { tabId: tab.id ?? chrome.tabs.TAB_ID_NONE },
			func: () => getSelection()?.toString() ?? '',
		})

		return (frame?.result ?? '').trim()
	} catch {
		return ''
	}
}

async function actionCommandPrompt(
	command: string,
	tab: chrome.tabs.Tab,
	pageUrl: string,
) {
	const { actions, actionSlots } = await getSettings()

	const slot = Number(command.slice(ACTION_COMMAND_PREFIX.length)) - 1

	const action = actions.find((candidate) => candidate.id === actionSlots[slot])

	const target = (await getSelectedText(tab)) || pageUrl

	return action !== undefined && action.prompt.trim() !== '' && target !== ''
		? actionPrompt(action, target)
		: ''
}

async function commandPrompt(command: string, tab: chrome.tabs.Tab) {
	const pageUrl = tab.url ?? ''

	if (command === 'ask-page') {
		return pageUrl
	}

	if (command === 'ask-selection') {
		return (await getSelectedText(tab)) || pageUrl
	}

	if (command.startsWith(ACTION_COMMAND_PREFIX)) {
		return actionCommandPrompt(command, tab, pageUrl)
	}

	return ''
}

export async function handleCommand(
	command: string,
	tab: chrome.tabs.Tab | undefined,
) {
	if (command === 'open-gemini') {
		await openGemini(tab)

		return
	}

	if (!tab) {
		return
	}

	const promptText = await commandPrompt(command, tab)

	if (promptText) {
		await sendToGemini(promptText, tab)
	}
}
