import { renderActionRow } from './action-row.ts'
import { renderSlots } from './action-slots.ts'
import { saveActionsNow, savePendingActions } from './actions-save.ts'
import { requireElement } from './dom.ts'
import { editorState, findAction } from './options-state.ts'
import { ACTION_SLOT_COUNT, DEFAULT_ACTIONS, getSettings } from './settings.ts'

const listElement = requireElement('actionList', HTMLElement)

function deleteAction(actionId: string) {
	const title = findAction(actionId)?.title ?? ''

	if (!confirm(`Delete "${title === '' ? 'this action' : title}"?`)) {
		return
	}

	editorState.actions = editorState.actions.filter(
		(action) => action.id !== actionId,
	)

	editorState.slots = editorState.slots.map((id) =>
		id === actionId ? null : id,
	)

	saveActionsNow({ actionSlots: editorState.slots })

	renderActions()
}

function renderActions() {
	if (editorState.actions.length === 0) {
		const empty = document.createElement('p')

		empty.className = 'empty'

		empty.textContent = 'No actions yet. Add one below.'

		listElement.replaceChildren(empty)
	} else {
		listElement.replaceChildren(
			...editorState.actions.map((action) =>
				renderActionRow(action, deleteAction),
			),
		)
	}

	renderSlots()
}

function handleAddAction() {
	editorState.actions.push({
		id: `custom-${Date.now()}`,
		title: '',
		prompt: '',
		show: true,
	})

	saveActionsNow()

	renderActions()

	listElement.lastElementChild?.querySelector<HTMLElement>('.title')?.focus()
}

function handleResetActions() {
	if (
		!confirm(
			'Restore the original 5 actions? Your edits and custom actions will be removed.',
		)
	) {
		return
	}

	editorState.actions = structuredClone(DEFAULT_ACTIONS)

	editorState.slots = editorState.slots.map((id) => findAction(id)?.id ?? null)

	saveActionsNow({ actionSlots: editorState.slots })

	renderActions()
}

export function bindActionsEditor() {
	requireElement('addAction', HTMLButtonElement).addEventListener(
		'click',
		handleAddAction,
	)

	requireElement('resetActions', HTMLButtonElement).addEventListener(
		'click',
		handleResetActions,
	)

	window.addEventListener('pagehide', savePendingActions)
}

export async function loadActions() {
	const settings = await getSettings()

	editorState.actions = settings.actions

	editorState.slots = Array.from(
		{ length: ACTION_SLOT_COUNT },
		(_, index) => settings.actionSlots[index] ?? null,
	)

	renderActions()
}
