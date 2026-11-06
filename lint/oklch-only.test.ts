import { oklchOnly } from './oklch-only.ts'
import { testRule } from './test-rule.ts'

testRule('oklch-only', oklchOnly, {
	valid: [
		'const accent = "oklch(0.57 0.142 47)"',
		'const tint = "oklch(0.57 0.142 47 / 0.5)"',
		'export function Card() { return <div className="bg-accent text-on-accent p-4" /> }',
		'export function Skip() { return <a href="#fade">Skip</a> }',
		'const label = "red"',
		'export function Logo() { return <svg fill="currentColor" /> }',
		'const style = { backgroundColor: "transparent", borderColor: "var(--color-subtle)" }',
		'const query = "select rgb from colours"',
		'const route = { to: "#add" }',
	],
	invalid: [
		{
			code: 'const style = { color: "#fff" }',
			errors: [{ messageId: 'useOklch', data: { found: '#fff' } }],
		},
		{
			code: 'export function Badge() { return <div className="bg-[#ff6600] p-4" /> }',
			errors: [{ messageId: 'useOklch', data: { found: '#ff6600' } }],
		},
		{
			code: 'const border = "1px solid rgba(0, 0, 0, 0.1)"',
			errors: [
				{ messageId: 'useOklch', data: { found: 'rgba(0, 0, 0, 0.1)' } },
			],
		},
		{
			code: 'const theme = { tintColor: "hsl(20 80% 50%)" }',
			errors: [{ messageId: 'useOklch', data: { found: 'hsl(20 80% 50%)' } }],
		},
		{
			code: 'export function Dot() { return <circle stroke="white" /> }',
			errors: [{ messageId: 'useOklch', data: { found: 'white' } }],
		},
		{
			code: 'export function Shape() { return <path fill={"#000"} /> }',
			errors: [{ messageId: 'useOklch', data: { found: '#000' } }],
		},
		{
			code: 'const shadow = `0 1px 2px #00000033`',
			errors: [{ messageId: 'useOklch', data: { found: '#00000033' } }],
		},
	],
})
