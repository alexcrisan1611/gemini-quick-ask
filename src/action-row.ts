import type { Action } from './settings.ts'

import { renderSlots } from './action-slots.ts'
import {
	saveActionsNow,
	saveActionsSoon,
	updateAction,
} from './actions-save.ts'
import { requireChild, requireElement } from './dom.ts'

const template = requireElement('actionTemplate', HTMLTemplateElement)

function cloneActionRow() {
	const row = template.content.firstElementChild?.cloneNode(true)

	if (!(row instanceof HTMLElement)) {
		throw new TypeError('Missing action row template')
	}

	return row
}

function bindTitle(row: HTMLElement, action: Action) {
	const title = requireChild(row, '.title', HTMLInputElement)

	title.value = action.title

	title.addEventListener('input', () => {
		updateAction(action.id, { title: title.value })

		saveActionsSoon()

		renderSlots()
	})
}

function bindPrompt(row: HTMLElement, action: Action) {
	const prompt = requireChild(row, '.prompt', HTMLTextAreaElement)

	prompt.value = action.prompt

	prompt.addEventListener('input', () => {
		updateAction(action.id, { prompt: prompt.value })

		saveActionsSoon()
	})
}

function bindShow(row: HTMLElement, action: Action) {
	const show = requireChild(row, '.show', HTMLInputElement)

	show.checked = action.show

	show.addEventListener('change', () => {
		updateAction(action.id, { show: show.checked })

		saveActionsNow()
	})
}

export function renderActionRow(
	action: Action,
	onDelete: (actionId: string) => void,
) {
	const row = cloneActionRow()

	bindTitle(row, action)

	bindPrompt(row, action)

	bindShow(row, action)

	requireChild(row, '.delete', HTMLButtonElement).addEventListener(
		'click',
		() => {
			onDelete(action.id)
		},
	)

	return row
}
