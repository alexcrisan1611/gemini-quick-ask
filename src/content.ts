import type { PromptResponse } from './messages.ts'

import { showHud, updateHud } from './hud.ts'
import { enterPrompt, submitPrompt } from './prompt-box.ts'

async function requestPendingPrompt() {
	try {
		const response = await chrome.runtime.sendMessage<
			{ type: string },
			PromptResponse | undefined
		>({ type: 'GET_PENDING_PROMPT' })

		return response ?? null
	} catch {
		return null
	}
}

async function typeAndSend(prompt: string, autoSubmit: boolean) {
	updateHud('⏳', 'Connecting to Gemini prompt box...')

	const editor = await enterPrompt(prompt)

	if (!autoSubmit) {
		editor.focus()

		updateHud('✍️', 'Prompt ready. Press Enter to send.', true)

		return
	}

	updateHud('🚀', 'Submitting query...')

	await submitPrompt(editor)

	updateHud('✅', 'Answer generating...', true)
}

async function run() {
	const response = await requestPendingPrompt()

	if (response === null || response.prompt === null || response.prompt === '') {
		return
	}

	showHud()

	try {
		await typeAndSend(response.prompt, response.autoSubmit)
	} catch (error) {
		console.warn('[Quick Ask for Gemini]', error)

		updateHud(
			'⚠️',
			'Could not auto-submit prompt. Please click Send manually.',
			true,
		)
	}
}

void run()
