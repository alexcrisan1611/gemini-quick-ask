import { prismaSelectOnly } from './prisma-select-only.ts'
import { testRule } from './test-rule.ts'

testRule('prisma-select-only', prismaSelectOnly, {
	valid: [
		'prisma.order.findMany({ select: { id: true, items: { select: { id: true } } } })',
		'prisma.user.findUnique({ where: { id }, omit: { passwordHash: true } })',
		'const files = glob({ include: ["src/**"] })',
		'const config = { include: ["src"] }',
		'prisma.order[method]({ include: { items: true } })',
	],
	invalid: [
		{
			code: 'prisma.order.findMany({ include: { items: true } })',
			errors: [{ messageId: 'noInclude' }],
		},
		{
			code: 'db.order.update({ where: { id }, data, "include": { items: true } })',
			errors: [{ messageId: 'noInclude' }],
		},
		{
			code: 'prisma.order.findFirst({ select: { items: { include: { product: true } } } })',
			errors: [{ messageId: 'noInclude' }],
		},
		{
			code: 'tx.order.upsert({ where: { id }, create: {}, update: {}, include: { items: true } })',
			errors: [{ messageId: 'noInclude' }],
		},
	],
})
