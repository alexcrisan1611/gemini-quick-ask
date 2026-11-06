import type { NodeOf, Rule } from './types.ts'

type FunctionNode = {
	returnType?: NodeOf<'TSTypeAnnotation'> | null | undefined
}

export const noReturnTypes = {
	meta: {
		type: 'suggestion',
		docs: { description: 'Disallow return types; let TypeScript infer them.' },
		hasSuggestions: true,
		messages: {
			noReturnType:
				'Remove the return type. Use `satisfies` on the returned value if it needs checking.',
			removeReturnType: 'Remove the return type.',
		},
		schema: [],
	},
	create(context) {
		function check(node: FunctionNode) {
			const { returnType } = node

			if (!returnType || returnType.typeAnnotation.type === 'TSTypePredicate') {
				return
			}

			context.report({
				node: returnType,
				messageId: 'noReturnType',
				suggest: [
					{
						messageId: 'removeReturnType',
						fix: (fixer) => fixer.remove(returnType),
					},
				],
			})
		}

		return {
			ArrowFunctionExpression: check,
			FunctionDeclaration: check,
			FunctionExpression: check,
		}
	},
} satisfies Rule
