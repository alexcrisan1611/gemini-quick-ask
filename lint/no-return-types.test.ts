import { noReturnTypes } from './no-return-types.ts'
import { testRule } from './test-rule.ts'

testRule('no-return-types', noReturnTypes, {
	valid: [
		'function total(prices: number[]) { return prices.length }',
		'const total = (prices: number[]) => prices.length',
		'function isOrder(value: unknown): value is Order { return value !== null }',
		'function assertOrder(value: unknown): asserts value is Order {}',
		'function assertDefined(value: unknown): asserts value {}',
		'function parse(text: string): number\nfunction parse(text: string) { return Number(text) }',
		'type Total = (prices: number[]) => number',
		'class Cart { get size() { return 0 } }',
	],
	invalid: [
		{
			code: 'function total(prices: number[]): number { return prices.length }',
			errors: [
				{
					messageId: 'noReturnType',
					suggestions: [
						{
							messageId: 'removeReturnType',
							output:
								'function total(prices: number[]) { return prices.length }',
						},
					],
				},
			],
		},
		{
			code: 'const total = (prices: number[]): number => prices.length',
			errors: [
				{
					messageId: 'noReturnType',
					suggestions: [
						{
							messageId: 'removeReturnType',
							output: 'const total = (prices: number[]) => prices.length',
						},
					],
				},
			],
		},
		{
			code: 'class Cart { get size(): number { return 0 } }',
			errors: [
				{
					messageId: 'noReturnType',
					suggestions: [
						{
							messageId: 'removeReturnType',
							output: 'class Cart { get size() { return 0 } }',
						},
					],
				},
			],
		},
		{
			code: 'export function OrderCard(): JSX.Element { return <div /> }',
			errors: [
				{
					messageId: 'noReturnType',
					suggestions: [
						{
							messageId: 'removeReturnType',
							output: 'export function OrderCard() { return <div /> }',
						},
					],
				},
			],
		},
	],
})
