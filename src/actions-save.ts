import type { Action, Settings } from './settings.ts'

import { editorState, findAction } from './options-state.ts'
import { saveSettings } from './ui.ts'

let saveTimer: ReturnType<typeof setTimeout> | undefined

export function saveActionsNow(extra: Partial<Settings> = {}) {
	clearTimeout(saveTimer)

	saveTimer = undefined

	void saveSettings({ actions: editorState.actions, ...extra })
}

export function saveActionsSoon() {
	clearTimeout(saveTimer)

	saveTimer = setTimeout(saveActionsNow, 400)
}

export function savePendingActions() {
	if (saveTimer !== undefined) {
		saveActionsNow()
	}
}

export function updateAction(actionId: string, changes: Partial<Action>) {
	const action = findAction(actionId)

	if (action !== undefined) {
		Object.assign(action, changes)
	}
}
