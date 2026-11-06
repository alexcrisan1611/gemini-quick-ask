import type { Settings } from './settings.ts'

import { requireElement } from './dom.ts'
import { DEFAULT_SETTINGS, getSettings, MAX_ACCOUNTS } from './settings.ts'

const statusElement = requireElement('status', HTMLElement)

let statusTimer: ReturnType<typeof setTimeout> | undefined

function showStatus(text: string, durationMs = 1500) {
	statusElement.textContent = text

	statusElement.classList.add('visible')

	clearTimeout(statusTimer)

	statusTimer = setTimeout(() => {
		statusElement.classList.remove('visible')
	}, durationMs)
}

export async function saveSettings(values: Partial<Settings>) {
	try {
		await chrome.storage.sync.set(values)

		showStatus('Saved')
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)

		showStatus(`Couldn't save: ${message}`, 5000)
	}
}

function keyChips(shortcut: string) {
	if (shortcut === '') {
		return ['Not set']
	}

	return shortcut.split('+').map((key) => {
		const kbd = document.createElement('kbd')

		kbd.textContent = key

		return kbd
	})
}

export async function renderShortcutKeys() {
	const commands = await chrome.commands.getAll()

	for (const element of document.querySelectorAll<HTMLElement>(
		'[data-command]',
	)) {
		const command = commands.find(
			(candidate) => candidate.name === element.dataset['command'],
		)

		const shortcut = command?.shortcut ?? ''

		element.classList.toggle('unset', shortcut === '')

		element.replaceChildren(...keyChips(shortcut))
	}
}

function fillAccountPicker() {
	const accountSelect = requireElement('accountIndex', HTMLSelectElement)

	for (let index = 0; index < MAX_ACCOUNTS; index++) {
		const label = index === 0 ? 'Default account' : `Account ${index + 1}`

		accountSelect.add(new Option(label, String(index)))
	}
}

async function loadForm() {
	const settings = await getSettings()

	for (const [key, value] of Object.entries(settings)) {
		const input = document.querySelector(`#${key}`)

		if (input instanceof HTMLInputElement && input.type === 'checkbox') {
			input.checked = value === true
		} else if (
			(input instanceof HTMLInputElement ||
				input instanceof HTMLSelectElement) &&
			typeof value === 'number'
		) {
			input.value = String(value)
		}
	}
}

function handleChange(event: Event) {
	const input = event.target

	if (!(
		input instanceof HTMLInputElement || input instanceof HTMLSelectElement
	)) {
		return
	}

	if (!(input.id in DEFAULT_SETTINGS)) {
		return
	}

	const value =
		input instanceof HTMLInputElement && input.type === 'checkbox'
			? input.checked
			: Number(input.value)

	void saveSettings({ [input.id]: value })
}

export function bindSettingsForm() {
	fillAccountPicker()

	void loadForm()

	document.addEventListener('change', handleChange)

	void renderShortcutKeys()
}
