import { componentNameMatchesFile } from './component-name-matches-file.ts'
import { testRule } from './test-rule.ts'

testRule('component-name-matches-file', componentNameMatchesFile, {
	valid: [
		{
			code: 'export function OrderCard() { return <div /> }',
			filename: 'apps/web/src/components/order-card.tsx',
		},
		{
			code: 'export const OrderCard = () => <div />',
			filename: 'order-card.tsx',
		},
		{
			code: 'export function OrdersProvider() { return null }',
			filename: 'apps/web/src/orders_provider.tsx',
		},
		{
			code: 'export const Route = createFileRoute("/orders")({ component: OrdersPage })\nfunction OrdersPage() { return <div /> }',
			filename: 'apps/web/src/routes/orders.tsx',
		},
		{
			code: 'export function useOrders() { return [] }',
			filename: 'order-card.tsx',
		},
		{
			code: 'export function Anything() { return null }',
			filename: 'order-card.ts',
		},
	],
	invalid: [
		{
			code: 'export function OrderTile() { return <div /> }',
			filename: 'order-card.tsx',
			errors: [
				{
					messageId: 'nameMismatch',
					data: { expected: 'OrderCard', name: 'OrderTile' },
				},
			],
		},
		{
			code: 'export function OrderCard() { return <div /> }\nexport function OrderCardSkeleton() { return <div /> }',
			filename: 'order-card.tsx',
			errors: [{ messageId: 'nameMismatch' }],
		},
		{
			code: 'export const OrderTile = function () { return <div /> }',
			filename: 'order-card.tsx',
			errors: [{ messageId: 'nameMismatch' }],
		},
	],
})
