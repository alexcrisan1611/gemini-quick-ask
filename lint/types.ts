import type { RuleTester } from 'oxlint/plugins-dev'

export type Rule = Parameters<RuleTester['run']>[1]

export type Context = Parameters<NonNullable<Rule['create']>>[0]

export type AstNode = NonNullable<
	ReturnType<Context['sourceCode']['getNodeByRangeIndex']>
>

export type NodeOf<Type extends AstNode['type']> = Extract<
	AstNode,
	{ type: Type }
>
