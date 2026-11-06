const sections = [...document.querySelectorAll<HTMLElement>('main > section')]

const navLinks = [
	...document.querySelectorAll<HTMLAnchorElement>('.sidebar nav a'),
]

function showSection() {
	const requested = location.hash.slice(1)

	const current = sections.some(
		(section) => section.dataset['section'] === requested,
	)
		? requested
		: 'general'

	for (const section of sections) {
		section.hidden = section.dataset['section'] !== current
	}

	for (const link of navLinks) {
		if (link.hash === `#${current}`) {
			link.setAttribute('aria-current', 'page')
		} else {
			link.removeAttribute('aria-current')
		}
	}

	window.scrollTo(0, 0)
}

export function bindSections() {
	window.addEventListener('hashchange', showSection)

	showSection()
}
