import type { Rule } from './types.ts'

import { componentNameMatchesFile } from './component-name-matches-file.ts'
import { noComments } from './no-comments.ts'
import { noReturnTypes } from './no-return-types.ts'
import { oklchOnly } from './oklch-only.ts'
import { paddingLineBetweenStatements } from './padding-line-between-statements.ts'
import { prismaSelectOnly } from './prisma-select-only.ts'
import { queryResults } from './query-results.ts'
import { requireDisableReason } from './require-disable-reason.ts'

const plugin = {
	meta: { name: 'local' },
	rules: {
		'component-name-matches-file': componentNameMatchesFile,
		'no-comments': noComments,
		'no-return-types': noReturnTypes,
		'oklch-only': oklchOnly,
		'padding-line-between-statements': paddingLineBetweenStatements,
		'prisma-select-only': prismaSelectOnly,
		'query-results': queryResults,
		'require-disable-reason': requireDisableReason,
	},
} satisfies { meta: { name: string }; rules: Record<string, Rule> }

export default plugin
