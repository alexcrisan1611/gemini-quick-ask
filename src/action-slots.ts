import { requireChild, requireElement } from './dom.ts'
import { editorState, findAction } from './options-state.ts'
import { renderShortcutKeys, saveSettings } from './ui.ts'

const slotList = requireElement('slotList', HTMLElement)

function slotOptions() {
	return [
		new Option('None', ''),
		...editorState.actions.map(
			(action) =>
				new Option(action.title.trim() || 'Untitled action', action.id),
		),
	]
}

function renderSlot(actionId: string | null, index: number) {
	const row = document.createElement('div')

	row.className = 'row'

	row.innerHTML = `
      <span class="row-title">Action shortcut ${index + 1}</span>
      <span class="slot-controls">
        <select aria-label="Action for shortcut ${index + 1}"></select>
        <span class="keys" data-command="action-${index + 1}"></span>
      </span>`

	const select = requireChild(row, 'select', HTMLSelectElement)

	select.append(...slotOptions())

	select.value = findAction(actionId)?.id ?? ''

	select.addEventListener('change', () => {
		editorState.slots[index] = select.value || null

		void saveSettings({ actionSlots: editorState.slots })
	})

	return row
}

export function renderSlots() {
	slotList.replaceChildren(
		...editorState.slots.map((actionId, index) => renderSlot(actionId, index)),
	)

	void renderShortcutKeys()
}
