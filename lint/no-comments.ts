import type { Rule } from './types.ts'

const toolPrefixes = [
	'eslint-disable',
	'eslint-enable',
	'oxlint-disable',
	'oxlint-enable',
	'@ts-expect-error',
	'@ts-ignore',
	'@ts-nocheck',
	'/ <reference ',
	'@vite-ignore',
	'#__PURE__',
	'@__PURE__',
	'#__NO_SIDE_EFFECTS__',
	'@__NO_SIDE_EFFECTS__',
]

function isToolComment(value: string) {
	const text = value.trim()

	return toolPrefixes.some((prefix) => text.startsWith(prefix))
}

export const noComments = {
	meta: {
		type: 'suggestion',
		docs: { description: 'Disallow comments, except the ones tools read.' },
		messages: {
			noComments:
				'Remove this comment. Put the reason in a name, a test name or the commit message.',
		},
		schema: [],
	},
	create(context) {
		return {
			Program() {
				for (const comment of context.sourceCode.getAllComments()) {
					if (comment.type !== 'Shebang' && !isToolComment(comment.value)) {
						context.report({ node: comment, messageId: 'noComments' })
					}
				}
			},
		}
	},
} satisfies Rule
