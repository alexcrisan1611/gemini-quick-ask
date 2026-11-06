import { noComments } from './no-comments.ts'
import { testRule } from './test-rule.ts'

testRule('no-comments', noComments, {
	valid: [
		'const total = 1',
		'// oxlint-disable-next-line no-console -- debugging a deploy\nconsole.log(1)',
		'/* eslint-disable no-console -- CLI output */',
		'// @ts-expect-error the library types are wrong\nconst total: number = "1"',
		'/// <reference types="vite/client" />',
		'const page = import(/* @vite-ignore */ path)',
		'const value = /*#__PURE__*/ create()',
		'#!/usr/bin/env bun\nconst total = 1',
	],
	invalid: [
		{
			code: '// adds the totals\nconst total = 1',
			errors: [{ messageId: 'noComments' }],
		},
		{
			code: 'const total = 1 /* one */',
			errors: [{ messageId: 'noComments' }],
		},
		{
			code: '// TODO: remove\nconst total = 1',
			errors: [{ messageId: 'noComments' }],
		},
		{
			code: 'const view = <div>{/* header */}</div>',
			errors: [{ messageId: 'noComments' }],
		},
		{
			code: '/**\n * Adds totals.\n */\nfunction add() {}',
			errors: [{ messageId: 'noComments' }],
		},
	],
})
