export function requireElement<T extends Element>(
	id: string,
	type: new () => T,
) {
	const element = document.querySelector(`#${id}`)

	if (!(element instanceof type)) {
		throw new TypeError(`Missing #${id}`)
	}

	return element
}

export function requireChild<T extends Element>(
	parent: ParentNode,
	selector: string,
	type: new () => T,
) {
	const element = parent.querySelector(selector)

	if (!(element instanceof type)) {
		throw new TypeError(`Missing ${selector}`)
	}

	return element
}
