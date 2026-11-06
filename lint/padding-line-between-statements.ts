import type { AstNode, Context, Rule } from './types.ts'

type Pair = { previous: AstNode; next: AstNode }

const kindByType = new Map([
	['ExportAllDeclaration', 'export'],
	['ExportDefaultDeclaration', 'export'],
	['ExportNamedDeclaration', 'export'],
	['ExpressionStatement', 'expression'],
	['FunctionDeclaration', 'function'],
	['IfStatement', 'if'],
	['ImportDeclaration', 'import'],
	['ReturnStatement', 'return'],
	['ThrowStatement', 'throw'],
	['TSTypeAliasDeclaration', 'type'],
])

const paddedVariableKinds = new Set(['const', 'let'])

function kindOf(statement: AstNode) {
	if (statement.type === 'VariableDeclaration') {
		return paddedVariableKinds.has(statement.kind) ? statement.kind : undefined
	}

	return kindByType.get(statement.type)
}

function needsPadding(previous: string | undefined, next: string | undefined) {
	if (next === 'import') {
		return false
	}

	return previous === 'import' || (previous !== undefined && next !== undefined)
}

function hasBlankLine(lines: readonly string[], pair: Pair) {
	return lines
		.slice(pair.previous.loc.end.line, pair.next.loc.start.line - 1)
		.some((line) => line.trim() === '')
}

function checkPair(context: Context, pair: Pair) {
	const previousKind = kindOf(pair.previous)

	const nextKind = kindOf(pair.next)

	if (
		!needsPadding(previousKind, nextKind) ||
		hasBlankLine(context.sourceCode.lines, pair)
	) {
		return
	}

	context.report({
		node: pair.next,
		messageId: 'blankLine',
		data: {
			previous: previousKind ?? 'statement',
			next: nextKind ?? 'statement',
		},
		fix(fixer) {
			const { text } = context.sourceCode

			const eol = text.includes('\r\n') ? '\r\n' : '\n'

			const newline = text.indexOf('\n', pair.previous.range[1])

			if (newline !== -1 && newline < pair.next.range[0]) {
				return fixer.insertTextAfterRange([newline, newline + 1], eol)
			}

			return fixer.insertTextBefore(pair.next, eol.repeat(2))
		},
	})
}

export const paddingLineBetweenStatements = {
	meta: {
		type: 'layout',
		docs: {
			description:
				'Require a blank line between statements, and after the imports.',
		},
		fixable: 'whitespace',
		messages: {
			blankLine:
				"Add a blank line between the '{{previous}}' and '{{next}}' statements.",
		},
		schema: [],
	},
	create(context) {
		function check(statements: readonly AstNode[]) {
			let previous: AstNode | undefined

			for (const next of statements) {
				if (previous !== undefined) {
					checkPair(context, { previous, next })
				}

				previous = next
			}
		}

		return {
			BlockStatement(node) {
				check(node.body)
			},
			Program(node) {
				check(node.body)
			},
			StaticBlock(node) {
				check(node.body)
			},
			SwitchCase(node) {
				check(node.consequent)
			},
			TSModuleBlock(node) {
				check(node.body)
			},
		}
	},
} satisfies Rule
