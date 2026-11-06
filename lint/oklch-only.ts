import type { AstNode, Rule } from './types.ts'

const colourFunction = /\b(?:rgba?|hsla?|hwb)\([^)]*\)?/iu

const hexColour =
	/(?<=^|[\s(,:[])#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{3,4})(?=$|[\s),;\]/])/iu

const colourKey = /(?:color|colour|fill|stroke|tint)$/iu

const linkKeys = new Set(['hash', 'href', 'id', 'src', 'to'])

const namedColours = new Set([
	'aqua',
	'beige',
	'black',
	'blue',
	'brown',
	'coral',
	'crimson',
	'cyan',
	'fuchsia',
	'gold',
	'gray',
	'green',
	'grey',
	'indigo',
	'khaki',
	'lavender',
	'lime',
	'magenta',
	'maroon',
	'navy',
	'olive',
	'orange',
	'pink',
	'purple',
	'red',
	'salmon',
	'silver',
	'tan',
	'teal',
	'turquoise',
	'violet',
	'white',
	'yellow',
])

function ownerOf(node: AstNode) {
	const { parent } = node

	return parent?.type === 'JSXExpressionContainer' ? parent.parent : parent
}

function keyName(node: AstNode) {
	const owner = ownerOf(node)

	if (owner?.type === 'JSXAttribute' && owner.name.type === 'JSXIdentifier') {
		return owner.name.name
	}

	if (owner?.type !== 'Property' || owner.value !== node) {
		return ''
	}

	const { key } = owner

	if (key.type === 'Identifier') {
		return key.name
	}

	return key.type === 'Literal' ? String(key.value) : ''
}

function findColour(text: string, key: string) {
	if (linkKeys.has(key)) {
		return
	}

	const match = colourFunction.exec(text) ?? hexColour.exec(text)

	if (match !== null) {
		return match[0]
	}

	const word = text.trim().toLowerCase()

	return colourKey.test(key) && namedColours.has(word) ? word : undefined
}

export const oklchOnly = {
	meta: {
		type: 'problem',
		docs: { description: 'Require colours to be written in oklch.' },
		messages: {
			useOklch:
				"Write colours as oklch() tokens from packages/theme, not {{found}}. See the stack skill's references/colour.md.",
		},
		schema: [],
	},
	create(context) {
		function check(node: AstNode, text: string) {
			const found = findColour(text, keyName(node))

			if (found !== undefined) {
				context.report({ node, messageId: 'useOklch', data: { found } })
			}
		}

		return {
			Literal(node) {
				if (typeof node.value === 'string') {
					check(node, node.value)
				}
			},
			TemplateLiteral(node) {
				check(
					node,
					node.quasis.map((quasi) => quasi.value.cooked ?? '').join(' '),
				)
			},
		}
	},
} satisfies Rule
