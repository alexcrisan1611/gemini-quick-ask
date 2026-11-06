const banner = document.createElement('div')

function hudMarkup(icon: string, text: string) {
	return `
      <span style="font-size: 16px;">${icon}</span>
      <span>${text}</span>
    `
}

export function showHud() {
	banner.id = 'gemini-quick-ask-hud'

	Object.assign(banner.style, {
		position: 'fixed',
		bottom: '24px',
		right: '24px',
		zIndex: '999999',
		backgroundColor: 'oklch(0.2006 0.0305 274.68 / 0.94)',
		color: 'oklch(1 0 0)',
		padding: '12px 20px',
		borderRadius: '12px',
		boxShadow: '0 8px 32px oklch(0 0 0 / 0.45)',
		fontFamily: 'Google Sans, Roboto, system-ui, -apple-system, sans-serif',
		fontSize: '13px',
		fontWeight: '500',
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		border: '1px solid oklch(0.6057 0.224 285.06 / 0.4)',
		backdropFilter: 'blur(12px)',
		transition: 'opacity 0.4s ease, transform 0.4s ease',
	} satisfies Partial<CSSStyleDeclaration>)

	banner.innerHTML = `
    <span style="font-size: 16px;">✨</span>
    <span><strong>Quick Ask for Gemini:</strong> Preparing prompt...</span>
  `

	document.body.append(banner)
}

function dismissHud() {
	banner.style.opacity = '0'

	banner.style.transform = 'translateY(10px)'

	setTimeout(() => {
		banner.remove()
	}, 400)
}

export function updateHud(icon: string, text: string, autoDismiss = false) {
	banner.innerHTML = hudMarkup(icon, text)

	if (autoDismiss) {
		setTimeout(dismissHud, 2500)
	}
}
