import { updateHud } from './hud.ts'
import { delay, waitFor } from './page-wait.ts'

const INPUT_SELECTOR = [
	'rich-textarea [contenteditable="true"]',
	'div.ql-editor[contenteditable="true"]',
	'[contenteditable="true"][role="textbox"]',
	'div[contenteditable="true"]',
	'textarea[aria-label*="prompt" i]',
	'textarea',
].join(', ')

const SEND_BUTTON_SELECTOR = [
	'button[aria-label*="Send message" i]',
	'button[aria-label*="Send" i]',
	'button[aria-label*="Submit" i]',
	'button.send-button',
	'button[jsname="Qx7uuf"]',
	'.send-button-container button',
	'rich-textarea ~ button',
].join(', ')

const SEND_BUTTON_WAIT_MS = 3000

function dispatchEvents(editor: HTMLElement, types: string[]) {
	for (const type of types) {
		editor.dispatchEvent(new Event(type, { bubbles: true }))
	}
}

async function waitForEditor() {
	const editor = await waitFor(INPUT_SELECTOR, 20_000)

	if (!(editor instanceof HTMLElement)) {
		throw new TypeError('The Gemini prompt box is not editable')
	}

	return editor
}

export async function enterPrompt(text: string) {
	const editor = await waitForEditor()

	updateHud('✍️', 'Inserting prompt...')

	editor.focus()

	await delay(150)

	const filled =
		// oxlint-disable-next-line typescript/no-deprecated -- insertText through execCommand is the only insertion Gemini's rich text editor sees as typing
		document.execCommand('insertText', false, text) &&
		editor.innerText.trim() !== ''

	if (!filled) {
		editor.innerText = text
	}

	dispatchEvents(
		editor,
		filled ? ['input'] : ['beforeinput', 'input', 'change'],
	)

	await delay(250)

	return editor
}

function clickEnabledSendButton() {
	const button = document.querySelector(SEND_BUTTON_SELECTOR)

	if (
		!(button instanceof HTMLButtonElement) ||
		button.disabled ||
		button.getAttribute('aria-disabled') === 'true'
	) {
		return false
	}

	button.click()

	return true
}

async function clickSendButtonWithin(waitMs: number) {
	const deadline = Date.now() + waitMs

	const clicked = await new Promise<boolean>((resolve) => {
		function attempt() {
			if (Date.now() >= deadline) {
				resolve(false)

				return
			}

			if (clickEnabledSendButton()) {
				resolve(true)

				return
			}

			setTimeout(attempt, 150)
		}

		attempt()
	})

	return clicked
}

export async function submitPrompt(editor: HTMLElement) {
	const buttonClicked = await clickSendButtonWithin(SEND_BUTTON_WAIT_MS)

	if (buttonClicked) {
		return
	}

	editor.focus()

	editor.dispatchEvent(
		new KeyboardEvent('keydown', {
			key: 'Enter',
			code: 'Enter',
			// oxlint-disable-next-line typescript/no-deprecated -- Gemini's Enter handler may read keyCode on the synthetic event
			keyCode: 13,
			// oxlint-disable-next-line typescript/no-deprecated -- Gemini's Enter handler may read which on the synthetic event
			which: 13,
			bubbles: true,
			cancelable: true,
		}),
	)
}
