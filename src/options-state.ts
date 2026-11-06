import type { Action } from './settings.ts'

export const editorState: { actions: Action[]; slots: (string | null)[] } = {
	actions: [],
	slots: [],
}

export function findAction(actionId: string | null) {
	return editorState.actions.find((action) => action.id === actionId)
}
