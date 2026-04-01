// src/__tests__/api/payments-confirm.test.ts
import {
  createMockAdminClient,
  createMockQueryBuilder,
  createMockSupabaseClient,
} from '@/__tests__/mocks/supabase'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Module mocks ──
// 반드시 vi.mock으로 실제 모듈을 가로챔

const mockConfirmPayment = vi.fn()
const mockCancelPayment = vi.fn()

vi.mock('@/lib/toss', () => ({
  confirmPayment: (...args: unknown[]) => mockConfirmPayment(...args),
  cancelPayment: (...args: unknown[]) => mockCancelPayment(...args),
}))

const mockSendLicenseEmail = vi.fn()

vi.mock('@/lib/email', () => ({
  sendLicenseEmail: (...args: unknown[]) => mockSendLicenseEmail(...args),
}))

const mockServerClient = createMockSupabaseClient({
  user: { id: 'user-001', email: 'test@example.com' },
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockServerClient),
}))

// Admin client mock — 더 정교한 체이닝 필요
const mockAdminFrom = vi.fn()
const mockAdminRpc = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
    rpc: mockAdminRpc,
  })),
}))

// ── 헬퍼: NextRequest 생성 ──
function createPostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/payments/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

function createGetRequest(params: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/payments/confirm')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const req = new Request(url.toString(), { method: 'GET' })
  // NextRequest에는 nextUrl이 필요
  Object.defineProperty(req, 'nextUrl', {
    value: url,
    writable: false,
  })
  return req as unknown as import('next/server').NextRequest
}

// ── 테스트 ──
describe('api/payments/confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 기본 admin mock 설정
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        const builder = createMockQueryBuilder({
          data: {
            id: 'order-001',
            order_number: 'WEF-20260401-TEST',
          },
          error: null,
        })
        // maybeSingle은 기존 주문 없음으로 설정 (이중 주문 체크)
        builder.maybeSingle = vi.fn().mockResolvedValue({
          data: null,
          error: null,
        })
        return builder
      }

      if (table === 'order_items') {
        return createMockQueryBuilder({ data: {}, error: null })
      }

      return createMockQueryBuilder({ data: null, error: null })
    })

    mockAdminRpc.mockResolvedValue({
      data: [{ license_key: 'AAAAA-BBBBB-CCCCC-DDDDD-EEEEE' }],
      error: null,
    })

    mockConfirmPayment.mockResolvedValue({
      paymentKey: 'tpk_test',
      orderId: 'WEF-20260401-TEST',
      totalAmount: 17900,
      method: 'card',
      status: 'DONE',
    })

    mockCancelPayment.mockResolvedValue({ status: 'CANCELED' })
    mockSendLicenseEmail.mockResolvedValue({ id: 'email-001' })
  })

  // ─────────────────────────────────────
  // GET 핸들러 — redirect만 수행
  // ─────────────────────────────────────
  describe('GET (redirect only)', () => {
    it('파라미터를 전달하여 /payment/success로 redirect한다', async () => {
      const { GET } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createGetRequest({
        paymentKey: 'tpk_test',
        orderId: 'WEF-20260401-TEST',
        amount: '17900',
        customerName: '홍길동',
        customerEmail: 'test@example.com',
      })

      const res = await GET(req)

      // redirect 응답
      expect(res.status).toBe(307) // NextResponse.redirect
      const location = res.headers.get('location') || ''
      expect(location).toContain('/payment/success')
      expect(location).toContain('paymentKey=tpk_test')
      expect(location).toContain('orderId=WEF-20260401-TEST')
      expect(location).toContain('amount=17900')
    })

    it('GET에서는 confirmPayment가 호출되지 않는다 (이중 승인 방지)', async () => {
      const { GET } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createGetRequest({
        paymentKey: 'tpk_test',
        orderId: 'WEF-20260401-TEST',
        amount: '17900',
      })

      await GET(req)

      expect(mockConfirmPayment).not.toHaveBeenCalled()
    })

    it('GET에서는 orders INSERT가 호출되지 않는다 (이중 주문 방지)', async () => {
      const { GET } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createGetRequest({
        paymentKey: 'tpk_test',
        orderId: 'WEF-20260401-TEST',
        amount: '17900',
      })

      await GET(req)

      // from('orders')가 호출되지 않아야 함
      expect(mockAdminFrom).not.toHaveBeenCalledWith('orders')
    })

    it('필수 파라미터 누락 시 /payment/fail로 redirect한다', async () => {
      const { GET } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createGetRequest({ paymentKey: 'tpk_test' }) // orderId, amount 누락

      const res = await GET(req)
      const location = res.headers.get('location') || ''
      expect(location).toContain('/payment/fail')
      expect(location).toContain('INVALID_PARAMS')
    })
  })

  // ─────────────────────────────────────
  // POST 핸들러 — 전체 결제 플로우
  // ─────────────────────────────────────
  describe('POST (confirm flow)', () => {
    const validBody = {
      paymentKey: 'tpk_test',
      orderId: 'WEF-20260401-TEST',
      amount: 17900,
      customerName: '홍길동',
      customerEmail: 'test@example.com',
      cartItems: [
        {
          productId: 'prod-001',
          name: 'Microsoft Office 365',
          price: 17900,
          quantity: 1,
        },
      ],
    }

    it('정상 결제 플로우: 토스 승인 → 주문 → 키 할당 → 이메일', async () => {
      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest(validBody)
      const res = await POST(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.orderNumber).toBe('WEF-20260401-TEST')
      expect(mockConfirmPayment).toHaveBeenCalledOnce()
      expect(mockSendLicenseEmail).toHaveBeenCalledOnce()
    })

    it('필수 파라미터 누락 시 400 에러', async () => {
      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest({
        paymentKey: 'tpk_test',
        // orderId, amount, cartItems 누락
      })

      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('cartItems가 빈 배열이면 400 에러', async () => {
      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest({ ...validBody, cartItems: [] })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('이미 처리된 주문이면 성공 응답 (멱등성)', async () => {
      // 기존 주문이 있는 경우
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          const builder = createMockQueryBuilder({
            data: {
              id: 'order-001',
              order_number: 'WEF-20260401-TEST',
            },
            error: null,
          })
          builder.maybeSingle = vi.fn().mockResolvedValue({
            data: {
              id: 'order-001',
              order_number: 'WEF-20260401-TEST',
            },
            error: null,
          })
          return builder
        }
        return createMockQueryBuilder({ data: null, error: null })
      })

      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest(validBody)
      const res = await POST(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.message).toContain('이미 처리된')
      // 토스 승인이 다시 호출되지 않아야 함
      expect(mockConfirmPayment).not.toHaveBeenCalled()
    })

    it('토스 결제 승인 실패 시 500 에러', async () => {
      mockConfirmPayment.mockRejectedValue(
        new Error('결제 승인에 실패했습니다')
      )

      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest(validBody)
      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('주문 생성 실패 시 결제 취소가 호출된다', async () => {
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          const builder = createMockQueryBuilder({
            data: null,
            error: null,
          })
          builder.maybeSingle = vi.fn().mockResolvedValue({
            data: null,
            error: null,
          })
          // insert → select → single 체인에서 에러 반환
          builder.single = vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'DB error' },
          })
          return builder
        }
        return createMockQueryBuilder({ data: null, error: null })
      })

      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest(validBody)
      const res = await POST(req)

      expect(res.status).toBe(500)
      expect(mockCancelPayment).toHaveBeenCalledWith(
        'tpk_test',
        '주문 생성 실패로 인한 자동 취소'
      )
    })

    it('라이선스 키 할당 실패해도 결제는 성공 처리된다', async () => {
      mockAdminRpc.mockResolvedValue({
        data: null,
        error: { message: '키 부족' },
      })

      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest(validBody)
      const res = await POST(req)
      const data = await res.json()

      // 결제 자체는 성공
      expect(data.success).toBe(true)
      // 이메일은 발송되지 않음 (키가 없으므로)
      expect(data.emailSent).toBe(false)
    })

    it('이메일 발송 실패해도 결제는 성공 처리된다', async () => {
      mockSendLicenseEmail.mockRejectedValue(
        new Error('이메일 발송 실패')
      )

      const { POST } = await import(
        '@/app/api/payments/confirm/route'
      )

      const req = createPostRequest(validBody)
      const res = await POST(req)
      const data = await res.json()

      expect(data.success).toBe(true)
      expect(data.emailSent).toBe(false)
    })
  })
})
