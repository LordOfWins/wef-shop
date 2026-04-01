// src/__tests__/api/resend-email.test.ts
import {
  createMockQueryBuilder,
  createMockSupabaseClient,
} from '@/__tests__/mocks/supabase'
import { mockLicenseKeys, mockOrder } from '@/__tests__/helpers/fixtures'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Module mocks ──
const mockSendLicenseEmail = vi.fn()
vi.mock('@/lib/email', () => ({
  sendLicenseEmail: (...args: unknown[]) => mockSendLicenseEmail(...args),
}))

const mockServerClient = createMockSupabaseClient({
  user: { id: 'user-customer-001', email: 'customer@example.com' },
})
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockServerClient),
}))

const mockAdminFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

function createPostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/orders/resend-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

describe('api/orders/resend-email (고객용)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendLicenseEmail.mockResolvedValue({ id: 'email-001' })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return createMockQueryBuilder({
          data: mockOrder,
          error: null,
        })
      }
      if (table === 'license_keys') {
        const builder = createMockQueryBuilder({
          data: mockLicenseKeys,
          error: null,
        })
        // override: license_keys는 배열로 반환 (single이 아니라 then으로)
        builder.then = vi.fn((resolve: (v: unknown) => void) =>
          resolve({ data: mockLicenseKeys, error: null })
        )
        return builder
      }
      return createMockQueryBuilder({ data: null, error: null })
    })
  })

  it('정상 재발송: 주문 조회 → 키 조회 → 이메일 발송', async () => {
    const { POST } = await import('@/app/api/orders/resend-email/route')
    const req = createPostRequest({ orderId: 'order-001' })
    const res = await POST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(mockSendLicenseEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@example.com',
        orderNumber: mockOrder.order_number,
      })
    )
  })

  it('orderId 누락 시 400 에러', async () => {
    const { POST } = await import('@/app/api/orders/resend-email/route')
    const req = createPostRequest({})
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  it('비로그인 사용자는 401 에러', async () => {
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const { POST } = await import('@/app/api/orders/resend-email/route')
    const req = createPostRequest({ orderId: 'order-001' })
    const res = await POST(req)

    expect(res.status).toBe(401)
  })

  it('주문이 없으면 404 에러', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return createMockQueryBuilder({
          data: null,
          error: { message: 'not found' },
        })
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const { POST } = await import('@/app/api/orders/resend-email/route')
    const req = createPostRequest({ orderId: 'nonexistent' })
    const res = await POST(req)

    expect(res.status).toBe(404)
  })

  it('라이선스 키가 없으면 400 에러', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return createMockQueryBuilder({
          data: mockOrder,
          error: null,
        })
      }
      if (table === 'license_keys') {
        const builder = createMockQueryBuilder({ data: [], error: null })
        builder.then = vi.fn((resolve: (v: unknown) => void) =>
          resolve({ data: [], error: null })
        )
        return builder
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const { POST } = await import('@/app/api/orders/resend-email/route')
    const req = createPostRequest({ orderId: 'order-001' })
    const res = await POST(req)

    expect(res.status).toBe(400)
  })
})
