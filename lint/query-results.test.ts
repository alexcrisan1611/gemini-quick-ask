import { queryResults } from './query-results.ts'
import { testRule } from './test-rule.ts'

testRule('query-results', queryResults, {
	valid: [
		'const ordersQuery = useQuery(orpc.orders.list.queryOptions())',
		'const orderQuery = useSuspenseQuery(orderOptions)',
		'const ordersQuery = useInfiniteQuery(ordersOptions)',
		'const updateMutation = useMutation(orpc.orders.update.mutationOptions())',
		'const { data } = useSomethingElse()',
		'const results = useQueries({ queries })',
	],
	invalid: [
		{
			code: 'const { data, isPending } = useQuery(ordersOptions)',
			errors: [
				{
					messageId: 'noDestructuring',
					data: { hook: 'useQuery', suffix: 'Query' },
				},
			],
		},
		{
			code: 'const { mutate } = useMutation(updateOptions)',
			errors: [{ messageId: 'noDestructuring' }],
		},
		{
			code: 'const orders = useQuery(ordersOptions)',
			errors: [
				{ messageId: 'suffix', data: { hook: 'useQuery', suffix: 'Query' } },
			],
		},
		{
			code: 'const updateOrder = useMutation(updateOptions)',
			errors: [{ messageId: 'suffix' }],
		},
		{
			code: 'const ordersQuery = useMutation(updateOptions)',
			errors: [{ messageId: 'suffix' }],
		},
	],
})
