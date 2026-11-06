import { requireElement } from './dom.ts'
import { bindSettingsForm } from './ui.ts'

async function openSettings(section: string) {
	const view = chrome.extension
		.getViews({ type: 'tab' })
		.find((candidate) => candidate.location.pathname === '/options.html')

	if (view) {
		view.location.hash = section

		const tab = await view.chrome.tabs.getCurrent()

		if (tab?.id !== undefined) {
			await chrome.tabs.update(tab.id, { active: true })

			await chrome.windows.update(tab.windowId, { focused: true })
		}
	} else {
		await chrome.tabs.create({ url: `options.html#${section}` })
	}

	window.close()
}

async function handleOpenGemini() {
	await chrome.runtime.sendMessage({ type: 'OPEN_GEMINI' })

	window.close()
}

bindSettingsForm()

requireElement('openGemini', HTMLButtonElement).addEventListener(
	'click',
	() => {
		void handleOpenGemini()
	},
)

requireElement('openSettings', HTMLButtonElement).addEventListener(
	'click',
	() => {
		void openSettings('general')
	},
)

for (const link of document.querySelectorAll<HTMLAnchorElement>('footer a')) {
	link.addEventListener('click', (event) => {
		event.preventDefault()

		void openSettings(link.dataset['section'] ?? '')
	})
}
