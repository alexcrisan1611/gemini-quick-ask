import type { Rule } from './types.ts'

import { describe, expect, test } from 'bun:test'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

type Case = { code: string; filename?: string }

type ExpectedError = {
	messageId: string
	data?: Record<string, string>
	suggestions?: { messageId: string; output: string }[]
}

type Cases = {
	valid: (Case | string)[]
	invalid: (Case & { errors: ExpectedError[] })[]
}

const root = await mkdtemp(join(tmpdir(), 'lint-rule-'))

const pluginPath = join(import.meta.dir, 'plugin.ts').replaceAll('\\', '/')

let caseCount = 0

async function writeCase(ruleName: string, testCase: Case) {
	caseCount += 1

	const directory = join(root, String(caseCount))

	const file = join(directory, testCase.filename ?? 'file.tsx')

	const config = {
		plugins: [],
		jsPlugins: [pluginPath],
		categories: { correctness: 'off' },
		rules: { [`local/${ruleName}`]: 'error' },
	}

	await mkdir(dirname(file), { recursive: true })

	await writeFile(file, testCase.code)

	await writeFile(join(directory, '.oxlintrc.json'), JSON.stringify(config))

	return { directory, file }
}

async function lint(directory: string, file: string, ...flags: string[]) {
	const config = join(directory, '.oxlintrc.json')

	const child = Bun.spawn(
		[process.execPath, 'lint', '-c', config, '-f', 'unix', ...flags, file],
		{ cwd: directory, stderr: 'pipe', stdout: 'pipe' },
	)

	const output = await new Response(child.stdout).text()

	await child.exited

	return output
}

function messagesFrom(output: string, ruleName: string) {
	const suffix = ` [Error/local(${ruleName})]`

	return output
		.split('\n')
		.map((line) => line.trimEnd())
		.filter((line) => line.endsWith(suffix))
		.map((line) => line.slice(0, -suffix.length).replace(/^.*?:\d+:\d+: /u, ''))
}

function expectedMessage(rule: Rule, expected: ExpectedError) {
	const template = rule.meta?.messages?.[expected.messageId] ?? ''

	return template.replaceAll(
		/\{\{(\w+)\}\}/gu,
		(placeholder, key: string) => expected.data?.[key] ?? placeholder,
	)
}

function matches(message: string | undefined, expected: string) {
	return expected
		.split(/\{\{\w+\}\}/u)
		.every((piece) => message?.includes(piece) === true)
}

function normalise(testCase: Case | string) {
	return typeof testCase === 'string' ? { code: testCase } : testCase
}

export function testRule(ruleName: string, rule: Rule, cases: Cases) {
	describe(ruleName, () => {
		for (const testCase of cases.valid.map(normalise)) {
			test(`valid: ${testCase.code}`, async () => {
				const { directory, file } = await writeCase(ruleName, testCase)

				const output = await lint(directory, file)

				expect(messagesFrom(output, ruleName)).toEqual([])
			})
		}
		for (const testCase of cases.invalid) {
			test(`invalid: ${testCase.code}`, async () => {
				const { directory, file } = await writeCase(ruleName, testCase)

				const messages = messagesFrom(await lint(directory, file), ruleName)

				expect(messages).toHaveLength(testCase.errors.length)
				for (const [index, expected] of testCase.errors.entries()) {
					const message = expectedMessage(rule, expected)

					expect(matches(messages[index], message)).toBe(true)
				}
				const suggestion = testCase.errors[0]?.suggestions?.[0]

				if (suggestion !== undefined) {
					await lint(directory, file, '--fix', '--fix-suggestions')

					expect(await readFile(file, 'utf8')).toBe(suggestion.output)
				}
			})
		}
	})
}
