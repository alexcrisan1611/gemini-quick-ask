import type { Rule } from './types.ts'

const suffixByHook = new Map([
	['useInfiniteQuery', 'Query'],
	['useMutation', 'Mutation'],
	['useQuery', 'Query'],
	['useSuspenseInfiniteQuery', 'Query'],
	['useSuspenseQuery', 'Query'],
])

export const queryResults = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Keep TanStack Query results whole and name them after what they hold.',
		},
		messages: {
			noDestructuring:
				'Do not destructure the result of {{hook}}. Assign it to one variable, such as `orders{{suffix}}`.',
			suffix: 'Name the result of {{hook}} with a "{{suffix}}" suffix.',
		},
		schema: [],
	},
	create(context) {
		return {
			VariableDeclarator(node) {
				const { id, init } = node

				if (
					init?.type !== 'CallExpression' ||
					init.callee.type !== 'Identifier'
				) {
					return
				}

				const hook = init.callee.name

				const suffix = suffixByHook.get(hook)

				if (suffix === undefined) {
					return
				}

				if (id.type !== 'Identifier') {
					context.report({
						node: id,
						messageId: 'noDestructuring',
						data: { hook, suffix },
					})
				} else if (!id.name.endsWith(suffix)) {
					context.report({
						node: id,
						messageId: 'suffix',
						data: { hook, suffix },
					})
				}
			},
		}
	},
} satisfies Rule
