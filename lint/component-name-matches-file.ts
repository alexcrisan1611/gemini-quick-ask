import type { NodeOf, Rule } from './types.ts'

function expectedName(filename: string) {
	const base = filename.split(/[\\/]/u).at(-1) ?? ''

	const [stem = ''] = base.split('.')

	return stem
		.split(/[-_]/u)
		.filter((part) => part.length > 0)
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join('')
}

function isFunction(node: NodeOf<'VariableDeclarator'>['init']) {
	return (
		node?.type === 'ArrowFunctionExpression' ||
		node?.type === 'FunctionExpression'
	)
}

export const componentNameMatchesFile = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require exported components to be named after their file.',
		},
		messages: {
			nameMismatch:
				'Name this component "{{expected}}" to match its file, or move "{{name}}" to its own file.',
		},
		schema: [],
	},
	create(context) {
		if (!context.filename.endsWith('.tsx')) {
			return {}
		}

		const expected = expectedName(context.filename)

		function check(id: NodeOf<'Identifier'> | null) {
			if (id && /^[A-Z]/u.test(id.name) && id.name !== expected) {
				context.report({
					node: id,
					messageId: 'nameMismatch',
					data: { expected, name: id.name },
				})
			}
		}

		return {
			ExportNamedDeclaration(node) {
				const { declaration } = node

				if (declaration?.type === 'FunctionDeclaration') {
					check(declaration.id)
				}

				if (declaration?.type !== 'VariableDeclaration') {
					return
				}
				for (const declarator of declaration.declarations) {
					if (
						isFunction(declarator.init) &&
						declarator.id.type === 'Identifier'
					) {
						check(declarator.id)
					}
				}
			},
		}
	},
} satisfies Rule
