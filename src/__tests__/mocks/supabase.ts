import { vi } from 'vitest'

export function createMockQueryBuilder(resolvedData: {
  data: unknown
  error: unknown
}) {
  const builder: Record<string, unknown> = {}

  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'in', 'gt', 'lt', 'gte', 'lte',
    'like', 'ilike', 'is', 'order', 'limit', 'range',
    'filter', 'match', 'not', 'or', 'contains',
    'containedBy', 'textSearch', 'maybeSingle',
  ]

  for (const method of chainMethods) {
    builder[method] = vi.fn().mockReturnValue(builder)
  }

  builder.single = vi.fn().mockResolvedValue(resolvedData)
  builder.then = vi.fn((resolve: (val: unknown) => void) =>
    resolve(resolvedData)
  )

  return builder
}

export function createMockSupabaseClient(overrides?: {
  user?: { id: string; email: string } | null
  profile?: { role: string } | null
  queryResults?: Record<string, { data: unknown; error: unknown }>
}) {
  const defaultUser = overrides?.user ?? null
  const defaultProfile = overrides?.profile ?? null
  const queryResults = overrides?.queryResults ?? {}

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: defaultUser },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: defaultUser ? { user: defaultUser } : null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: defaultUser, session: {} },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (queryResults[table]) {
        return createMockQueryBuilder(queryResults[table])
      }

      if (table === 'profiles' && defaultProfile) {
        return createMockQueryBuilder({
          data: { id: defaultUser?.id, ...defaultProfile },
          error: null,
        })
      }

      return createMockQueryBuilder({ data: null, error: null })
    }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  }
}

export function createMockAdminClient(
  queryResults?: Record<string, { data: unknown; error: unknown }>
) {
  return {
    from: vi.fn((table: string) => {
      if (queryResults && queryResults[table]) {
        return createMockQueryBuilder(queryResults[table])
      }
      return createMockQueryBuilder({ data: null, error: null })
    }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  }
}
