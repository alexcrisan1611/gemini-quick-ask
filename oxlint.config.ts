import type { OxlintConfig } from 'oxlint'

import { defineConfig } from 'oxlint'

type RestrictedImports = NonNullable<
	OxlintConfig['rules']
>['no-restricted-imports']

const dropped = 'Dropped from the stack.'

const orpcErrors =
	'Declare errors in the contract with .errors() and throw errors.CODE(...).'

const banned = [
	{ name: 'bun', message: 'Extension code runs in the browser.' },
	{ name: 'dayjs', message: 'Use temporal-polyfill.' },
	{ name: 'date-fns', message: 'Use temporal-polyfill.' },
	{ name: 'moment', message: 'Use temporal-polyfill.' },
	{ name: 'nodemailer', message: 'Use the send_email binding.' },
	{ name: 'ky', message: 'Use fetch.' },
	{ name: 'axios', message: 'Use fetch.' },
	{ name: 'superjson', message: 'oRPC handles serialisation.' },
	{ name: 'pino', message: 'Use console and Workers Logs.' },
	{ name: 'consola', message: 'Use console and Workers Logs.' },
	{ name: 'dotenv', message: 'Use .dev.vars and bindings.' },
	{ name: 'fuse.js', message: 'Use Orama.' },
	{ name: 'bcryptjs', message: 'better-auth handles hashing.' },
	{ name: 'zod/v3', message: 'Use Zod 4.' },
	{ name: 'effect', message: orpcErrors },
	{ name: '@orpc/server', importNames: ['ORPCError'], message: orpcErrors },
	{ name: '@orpc/client', importNames: ['ORPCError'], message: orpcErrors },
	{ name: '@orpc/contract', importNames: ['ORPCError'], message: orpcErrors },
	{ name: 'try', message: dropped },
	{ name: 'url-slug', message: dropped },
	{ name: 'react-markdown', message: dropped },
	{ name: 'schema-dts', message: dropped },
	{ name: '@faker-js/faker', message: dropped },
	{ name: 'xml2js', message: dropped },
]

const bannedPatterns = [
	{ group: ['@radix-ui/*', '@mui/*', '@emotion/*'], message: 'Use Base UI.' },
	{ group: ['lodash', 'lodash/*', 'lodash-es'], message: 'Use Remeda.' },
	{ group: ['@trpc/*'], message: 'Use oRPC.' },
	{ group: ['@effect/*'], message: orpcErrors },
	{
		group: ['@aws-sdk/*', 'ioredis', 'redis'],
		message: 'Use R2, KV, Durable Objects or Queues.',
	},
]

function restrictImports(
	paths: typeof banned,
	...extraPatterns: typeof bannedPatterns
) {
	return [
		'error',
		{ paths, patterns: [...bannedPatterns, ...extraPatterns] },
	] satisfies RestrictedImports
}

const bunAllowed = banned.filter(({ name }) => name !== 'bun')

export default defineConfig({
	options: { typeAware: true, reportUnusedDisableDirectives: 'error' },
	plugins: [
		'eslint',
		'typescript',
		'unicorn',
		'oxc',
		'react',
		'jsx-a11y',
		'import',
		'promise',
	],
	jsPlugins: ['./lint/plugin.ts'],
	categories: {
		correctness: 'error',
		suspicious: 'error',
		pedantic: 'error',
		perf: 'error',
	},
	env: { builtin: true, es2026: true },
	ignorePatterns: [
		'**/*.gen.ts',
		'**/worker-configuration.d.ts',
		'**/paraglide/**',
		'**/generated/**',
	],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'typescript/prefer-readonly-parameter-types': 'off',
		'typescript/consistent-return': 'off',
		'typescript/explicit-function-return-type': 'off',
		'typescript/explicit-module-boundary-types': 'off',
		'unicorn/prefer-top-level-await': 'off',
		'no-negated-condition': 'off',
		'no-warning-comments': 'off',
		'no-inline-comments': 'off',
		'require-await': 'off',
		'import/no-unassigned-import': [
			'error',
			{ allow: ['**/*.css', '@total-typescript/ts-reset'] },
		],

		'max-lines': [
			'error',
			{ max: 125, skipBlankLines: true, skipComments: true },
		],
		'max-lines-per-function': [
			'error',
			{ max: 100, skipBlankLines: true, skipComments: true },
		],
		'max-params': 'error',
		'max-statements': 'error',
		complexity: 'error',
		'react/jsx-max-depth': ['error', { max: 4 }],

		curly: 'error',
		'func-style': ['error', 'declaration'],
		'prefer-const': 'error',
		'no-var': 'error',
		'object-shorthand': 'error',
		'prefer-template': 'error',
		'logical-assignment-operators': 'error',
		'no-implicit-coercion': 'error',
		'no-nested-ternary': 'error',
		'no-sequences': 'error',
		'no-return-assign': 'error',
		'no-multi-assign': 'error',
		'default-param-last': 'error',
		'no-template-curly-in-string': 'error',
		'no-new-func': 'error',
		'no-param-reassign': [
			'error',
			{ props: true, ignorePropertyModificationsFor: ['draft'] },
		],
		'no-shadow': ['error', { ignoreOnInitialization: true }],
		'no-unused-vars': ['error', { ignoreRestSiblings: true }],
		'no-void': ['error', { allowAsStatement: true }],
		'no-useless-assignment': 'error',
		'new-cap': [
			'error',
			{ capIsNewExceptions: ['NumberFormat'], properties: false },
		],
		'id-denylist': [
			'error',
			'e',
			'cb',
			'tmp',
			'temp',
			'obj',
			'val',
			'res',
			'item',
		],

		'typescript/no-explicit-any': 'error',
		'typescript/no-non-null-assertion': 'error',
		'typescript/no-import-type-side-effects': 'error',
		'typescript/consistent-type-imports': 'error',
		'typescript/consistent-type-exports': 'error',
		'typescript/consistent-type-definitions': ['error', 'type'],
		'typescript/consistent-type-assertions': [
			'error',
			{ assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
		],
		'typescript/use-unknown-in-catch-callback-variable': 'error',
		'typescript/method-signature-style': 'error',
		'typescript/no-unnecessary-condition': 'error',
		'typescript/promise-function-async': 'error',
		'typescript/dot-notation': [
			'error',
			{ allowIndexSignaturePropertyAccess: true },
		],
		'typescript/array-type': 'error',
		'typescript/consistent-indexed-object-style': 'error',
		'typescript/consistent-generic-constructors': 'error',
		'typescript/no-inferrable-types': 'error',
		'typescript/no-namespace': 'error',
		'typescript/parameter-properties': 'error',
		'typescript/no-dynamic-delete': 'error',
		'typescript/switch-exhaustiveness-check': [
			'error',
			{
				considerDefaultExhaustiveForUnions: false,
				requireDefaultForNonUnion: true,
			},
		],
		'typescript/only-throw-error': [
			'error',
			{
				allow: [
					{
						from: 'package',
						name: ['Redirect', 'NotFoundError'],
						package: '@tanstack/react-router',
					},
					{
						from: 'package',
						name: ['Redirect', 'NotFoundError'],
						package: '@tanstack/router-core',
					},
				],
			},
		],

		'unicorn/filename-case': ['error', { case: 'kebabCase' }],
		'unicorn/numeric-separators-style': 'error',
		'unicorn/prefer-module': 'error',
		'unicorn/prefer-node-protocol': 'error',
		'unicorn/no-abusive-eslint-disable': 'error',
		'unicorn/catch-error-name': 'error',
		'unicorn/throw-new-error': 'error',
		'unicorn/error-message': 'error',
		'unicorn/custom-error-definition': 'error',

		'import/first': 'error',
		'import/no-cycle': 'error',
		'import/no-default-export': 'error',
		'import/no-anonymous-default-export': 'error',
		'import/no-duplicates': 'error',
		'import/no-mutable-exports': 'error',
		'import/no-namespace': 'error',
		'import/no-relative-parent-imports': 'error',
		'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
		'oxc/no-barrel-file': ['error', { threshold: 0 }],
		'promise/prefer-await-to-then': 'error',

		'react/button-has-type': 'error',
		'react/hook-use-state': ['error', { allowDestructuredState: true }],
		'react/jsx-boolean-value': 'error',
		'react/jsx-curly-brace-presence': 'error',
		'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
		'react/jsx-fragments': 'error',
		'react/jsx-handler-names': 'error',
		'react/jsx-no-literals': 'error',
		'react/no-clone-element': 'error',
		'react/no-danger': 'error',
		'react/no-multi-comp': 'error',
		'react/no-react-children': 'error',
		'react/only-export-components': ['error', { allowConstantExport: true }],
		'react/self-closing-comp': 'error',

		'no-restricted-globals': [
			'error',
			{ name: 'Bun', message: 'Extension code runs in the browser.' },
		],
		'no-restricted-imports': restrictImports(banned),

		'local/component-name-matches-file': 'error',
		'local/no-comments': 'error',
		'local/no-return-types': 'error',
		'local/oklch-only': 'error',
		'local/padding-line-between-statements': 'error',
		'local/prisma-select-only': 'error',
		'local/query-results': 'error',
		'local/require-disable-reason': 'error',
	},
	overrides: [
		{
			files: ['src/**'],
			rules: { 'import/no-nodejs-modules': 'error' },
		},
		{
			files: ['*.config.ts', '**/*.config.ts', 'lint/plugin.ts'],
			rules: { 'import/no-default-export': 'off' },
		},
		{
			files: ['**/*.cjs'],
			rules: { 'unicorn/prefer-module': 'off' },
		},
		{
			files: [
				'lint/**',
				'**/scripts/**',
				'**/*.test.ts',
				'**/*.test.tsx',
				'tests/**',
			],
			rules: {
				'no-restricted-globals': 'off',
				'no-restricted-imports': restrictImports(bunAllowed),
			},
		},
		{
			files: ['**/*.test.ts', '**/*.test.tsx', 'tests/**'],
			rules: {
				'max-lines': 'off',
				'max-lines-per-function': 'off',
				'max-statements': 'off',
				'no-await-in-loop': 'off',
			},
		},
		{
			files: ['oxlint.config.ts'],
			rules: { 'max-lines': 'off' },
		},
		{
			files: ['lint/**'],
			rules: { 'local/oklch-only': 'off' },
		},
	],
})
