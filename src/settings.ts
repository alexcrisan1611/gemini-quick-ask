export type Action = {
	id: string
	title: string
	prompt: string
	show: boolean
}

export type Settings = {
	reuseTab: boolean
	autoSubmit: boolean
	openInBackground: boolean
	accountIndex: number
	showAskSelection: boolean
	showAskLink: boolean
	showAskPage: boolean
	showActions: boolean
	actions: Action[]
	actionSlots: (string | null)[]
}

export const DEFAULT_ACTIONS: Action[] = [
	{
		id: 'summarize',
		title: 'Summarize',
		prompt: 'Summarize this:',
		show: true,
	},
	{
		id: 'explain',
		title: 'Explain simply',
		prompt: 'Explain this in simple terms:',
		show: true,
	},
	{
		id: 'translate',
		title: 'Translate to English',
		prompt: 'Translate this to English:',
		show: true,
	},
	{
		id: 'fact-check',
		title: 'Fact-check',
		prompt: 'Fact-check this. Point out anything wrong or misleading:',
		show: true,
	},
	{
		id: 'counter',
		title: 'Find counterarguments',
		prompt: 'What are the strongest counterarguments to this?',
		show: true,
	},
]

export const MAX_ACCOUNTS = 10

export const ACTION_SLOT_COUNT = 5

export const DEFAULT_SETTINGS: Settings = {
	reuseTab: false,
	autoSubmit: true,
	openInBackground: false,
	accountIndex: 0,
	showAskSelection: true,
	showAskLink: true,
	showAskPage: true,
	showActions: true,
	actions: DEFAULT_ACTIONS,
	actionSlots: DEFAULT_ACTIONS.slice(0, ACTION_SLOT_COUNT).map(
		(action) => action.id,
	),
}

export async function getSettings() {
	const settings = await chrome.storage.sync.get<Settings>(DEFAULT_SETTINGS)

	return settings
}

export function actionPrompt(action: Action, target: string) {
	return `${action.prompt.trim()}\n\n${target}`
}
