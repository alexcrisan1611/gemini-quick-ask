import type { Rule } from './types.ts'

const disableDirective =
	/^(?:eslint|oxlint)-disable(?:-next-line|-line)?(?:\s|$)/u

const reason = /\s--\s+\S/u

export const requireDisableReason = {
	meta: {
		type: 'suggestion',
		docs: { description: 'Require a reason on every lint disable comment.' },
		messages: {
			missingReason: 'Say why: add " -- <reason>" after the rule names.',
		},
		schema: [],
	},
	create(context) {
		return {
			Program() {
				for (const comment of context.sourceCode.getAllComments()) {
					const text = comment.value.trim()

					if (disableDirective.test(text) && !reason.test(text)) {
						context.report({ node: comment, messageId: 'missingReason' })
					}
				}
			},
		}
	},
} satisfies Rule
