import { cp, rm } from 'node:fs/promises'

const outdir = 'dist/extension'

const entrypoints = ['background', 'content', 'popup', 'options'].map(
	(name) => `src/${name}.ts`,
)

const staticFiles = [
	'manifest.json',
	'popup.html',
	'options.html',
	'ui.css',
	'icon16.png',
	'icon32.png',
	'icon48.png',
	'icon128.png',
]

await rm(outdir, { recursive: true, force: true })

await Bun.build({
	entrypoints,
	outdir,
	target: 'browser',
	format: 'iife',
	naming: '[name].js',
})

await Promise.all(
	staticFiles.map(async (file) => {
		await cp(file, `${outdir}/${file}`)
	}),
)

console.log(`Built ${outdir}`)
