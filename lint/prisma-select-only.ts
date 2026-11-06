import type { NodeOf, Rule } from './types.ts'

const queryMethods = new Set([
	'create',
	'createManyAndReturn',
	'delete',
	'findFirst',
	'findFirstOrThrow',
	'findMany',
	'findUnique',
	'findUniqueOrThrow',
	'update',
	'updateManyAndReturn',
	'upsert',
])

function isQueryCall(node: NodeOf<'CallExpression'>) {
	const { callee } = node

	return (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier' &&
		queryMethods.has(callee.property.name)
	)
}

function isIncludeKey(property: NodeOf<'Property'>) {
	const { key } = property

	if (key.type === 'Identifier') {
		return !property.computed && key.name === 'include'
	}

	return key.type === 'Literal' && key.value === 'include'
}

export const prismaSelectOnly = {
	meta: {
		type: 'problem',
		docs: { description: 'Disallow `include` in Prisma queries.' },
		messages: {
			noInclude:
				'Use `select` (and `omit`) instead of `include`, so a query returns only the fields it needs.',
		},
		schema: [],
	},
	create(context) {
		function checkObject(object: NodeOf<'ObjectExpression'>) {
			for (const property of object.properties) {
				if (property.type !== 'Property') {
					continue
				}

				if (isIncludeKey(property)) {
					context.report({ node: property.key, messageId: 'noInclude' })
				}

				if (property.value.type === 'ObjectExpression') {
					checkObject(property.value)
				}
			}
		}

		return {
			CallExpression(node) {
				const [argument] = node.arguments

				if (isQueryCall(node) && argument?.type === 'ObjectExpression') {
					checkObject(argument)
				}
			},
		}
	},
} satisfies Rule
