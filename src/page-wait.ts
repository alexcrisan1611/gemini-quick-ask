const POLL_INTERVAL_MS = 100

export async function delay(ms: number) {
	await new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

export async function waitFor(selector: string, timeoutMs = 20_000) {
	const matched = await new Promise<Element>((resolve, reject) => {
		const element = document.querySelector(selector)

		if (element) {
			resolve(element)

			return
		}

		let elapsed = 0

		const timer = setInterval(() => {
			const found = document.querySelector(selector)

			if (found) {
				clearInterval(timer)

				resolve(found)
			}

			elapsed += POLL_INTERVAL_MS

			if (elapsed >= timeoutMs) {
				clearInterval(timer)

				reject(new Error(`Timeout waiting for ${selector}`))
			}
		}, POLL_INTERVAL_MS)
	})

	return matched
}
