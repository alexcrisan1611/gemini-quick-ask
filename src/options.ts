import { bindActionsEditor, loadActions } from './actions-editor.ts'
import { requireElement } from './dom.ts'
import { bindSections } from './options-sections.ts'
import { bindSettingsForm, renderShortcutKeys } from './ui.ts'

bindSettingsForm()

bindSections()

bindActionsEditor()

requireElement('changeShortcuts', HTMLButtonElement).addEventListener(
	'click',
	() => {
		void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
	},
)

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') {
		void renderShortcutKeys()
	}
})

requireElement('version', HTMLElement).textContent =
	`Version ${chrome.runtime.getManifest().version}`

void loadActions()
