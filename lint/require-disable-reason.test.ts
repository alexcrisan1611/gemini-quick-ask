import { requireDisableReason } from './require-disable-reason.ts'
import { testRule } from './test-rule.ts'

testRule('require-disable-reason', requireDisableReason, {
	valid: [
		'// oxlint-disable-next-line no-console -- debugging a deploy\nconsole.log(1)',
		'console.log(1) // eslint-disable-line no-console -- CLI output',
		'/* oxlint-disable no-await-in-loop -- D1 needs one write at a time */',
		'/* oxlint-enable no-await-in-loop */',
		'// the oxlint-disable syntax is documented elsewhere',
	],
	invalid: [
		{
			code: '// oxlint-disable-next-line no-console\nconsole.log(1)',
			errors: [{ messageId: 'missingReason' }],
		},
		{
			code: 'console.log(1) // eslint-disable-line no-console',
			errors: [{ messageId: 'missingReason' }],
		},
		{
			code: '/* oxlint-disable no-console */\nconsole.log(1)',
			errors: [{ messageId: 'missingReason' }],
		},
		{
			code: '// oxlint-disable-next-line no-console --\nconsole.log(1)',
			errors: [{ messageId: 'missingReason' }],
		},
	],
})
