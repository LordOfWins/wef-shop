// src/__tests__/integration/customer-journey.test.ts
import {
  createMockQueryBuilder,
  createMockSupabaseClient,
} from '@/__tests__/mocks/supabase'
import { CART_STORAGE_KEY, useCartStore } from '@/store/cartStore'
import { mockProduct, mockProduct2 } from '@/__tests__/helpers/fixtures'
import { generateOrderNumber } from '@/lib/utils'
import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Module mocks ──
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
  user: { id: 'user-001', email: 'customer@example.com' },
  profile: { role: 'customer' },
})
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockServerClient),
}))

const mockAdminFrom = vi.fn()
const mockAdminRpc = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
    rpc: mockAdminRpc,
  })),
}))

function createPostRequest(url: string, body: Record<string, unknown>) {
  return new Request(`http://localhost:3000${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest
}

describe('고객 여정: 상품 조회 → 장바구니 → 결제 → 키 발송', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCartStore.getState().clearCart()
    localStorage.clear()
  })

  it('전체 구매 플로우를 완료한다', async () => {
    // ─── Step 1: 장바구니에 상품 추가 ───
    act(() => {
      useCartStore.getState().addItem(mockProduct)
      useCartStore.getState().addItem(mockProduct2)
    })

    const { items } = useCartStore.getState()
    expect(items).toHaveLength(2)
    expect(useCartStore.getState().getTotalPrice()).toBe(
      mockProduct.sale_price + mockProduct2.sale_price
    )

    // localStorage에 persist 확인
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    expect(stored).not.toBeNull()

    // ─── Step 2: 주문번호 생성 ───
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toMatch(/^WEF-\d{8}-[A-Z0-9]{4}$/)

    // ─── Step 3: 결제 API 호출 (POST confirm) ───
    mockConfirmPayment.mockResolvedValue({
      paymentKey: 'tpk_journey_test',
      orderId: orderNumber,
      totalAmount: mockProduct.sale_price + mockProduct2.sale_price,
      method: 'card',
      status: 'DONE',
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        const builder = createMockQueryBuilder({
          data: {
            id: 'order-journey-001',
            order_number: orderNumber,
          },
          error: null,
        })
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
      data: [
        { license_key: 'AAAAA-11111-22222-33333-44444' },
      ],
      error: null,
    })

    mockSendLicenseEmail.mockResolvedValue({ id: 'email-journey' })

    const { POST } = await import('@/app/api/payments/confirm/route')

    const cartItems = items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.sale_price,
      quantity: item.quantity,
    }))

    const req = createPostRequest('/api/payments/confirm', {
      paymentKey: 'tpk_journey_test',
      orderId: orderNumber,
      amount: mockProduct.sale_price + mockProduct2.sale_price,
      customerName: '',
      customerEmail: '',
      cartItems,
    })

    const res = await POST(req)
    const data = await res.json()

    // ─── Step 4: 결과 검증 ───
    expect(data.success).toBe(true)
    expect(data.orderNumber).toBe(orderNumber)

    // 토스 승인 호출 확인
    expect(mockConfirmPayment).toHaveBeenCalledWith({
      paymentKey: 'tpk_journey_test',
      orderId: orderNumber,
      amount: mockProduct.sale_price + mockProduct2.sale_price,
    })

    // 라이선스 키 할당 호출 확인 (상품 2개이므로 2번)
    expect(mockAdminRpc).toHaveBeenCalledTimes(2)

    // 이메일 발송 확인
    expect(mockSendLicenseEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@example.com',
        orderNumber,
      })
    )

    // ─── Step 5: 장바구니 클리어 시뮬레이션 ───
    act(() => {
      useCartStore.getState().clearCart()
    })
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('비회원 구매 플로우', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCartStore.getState().clearCart()
    localStorage.clear()
  })

  it('비회원이 이메일로 구매를 완료한다', async () => {
    // 비회원 — user가 null
    mockServerClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    act(() => {
      useCartStore.getState().addItem(mockProduct)
    })

    mockConfirmPayment.mockResolvedValue({
      paymentKey: 'tpk_guest',
      orderId: 'WEF-GUEST-TEST',
      totalAmount: mockProduct.sale_price,
      method: 'card',
      status: 'DONE',
    })

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        const builder = createMockQueryBuilder({
          data: {
            id: 'order-guest-001',
            order_number: 'WEF-GUEST-TEST',
            user_id: null,
            guest_email: 'guest@example.com',
          },
          error: null,
        })
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
      data: [{ license_key: 'GUEST-KEY-12345' }],
      error: null,
    })

    mockSendLicenseEmail.mockResolvedValue({ id: 'email-guest' })

    const { POST } = await import('@/app/api/payments/confirm/route')

    const req = createPostRequest('/api/payments/confirm', {
      paymentKey: 'tpk_guest',
      orderId: 'WEF-GUEST-TEST',
      amount: mockProduct.sale_price,
      customerName: '비회원',
      customerEmail: 'guest@example.com',
      cartItems: [
        {
          productId: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.sale_price,
          quantity: 1,
        },
      ],
    })

    const res = await POST(req)
    const data = await res.json()

    expect(data.success).toBe(true)

    // 비회원 이메일로 발송 확인
    expect(mockSendLicenseEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'guest@example.com',
      })
    )
  })
})

describe('관리자 플로우: 상품 등록 → 키 등록 → 이메일 재발송', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('관리자가 상품을 등록한다', async () => {
    const mockCheckAdmin = vi.fn().mockResolvedValue({
      id: 'admin-001',
      email: 'admin@wefsoft.kr',
    })
    vi.doMock('@/lib/auth/checkAdmin', () => ({
      checkAdmin: () => mockCheckAdmin(),
    }))

    mockAdminFrom.mockImplementation(() =>
      createMockQueryBuilder({
        data: {
          id: 'prod-new',
          name: 'New Product',
          slug: 'new-product',
        },
        error: null,
      })
    )

    const { POST } = await import('@/app/api/admin/products/route')

    const req = createPostRequest('/api/admin/products', {
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'New Product',
      slug: 'new-product',
      short_description: 'New product desc',
      description: 'Full description of new product',
      original_price: 200000,
      sale_price: 100000,
      license_type: 'permanent',
      platform: 'both',
    })

    const res = await POST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
  })

  it('관리자가 라이선스 키를 등록한다', async () => {
    const mockCheckAdmin = vi.fn().mockResolvedValue({
      id: 'admin-001',
      email: 'admin@wefsoft.kr',
    })
    vi.doMock('@/lib/auth/checkAdmin', () => ({
      checkAdmin: () => mockCheckAdmin(),
    }))

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'license_keys') {
        const builder = createMockQueryBuilder({
          data: [],
          error: null,
        })
        // select (중복 체크) — 빈 배열 반환
        builder.then = vi.fn((resolve: (v: unknown) => void) =>
          resolve({ data: [], error: null })
        )
        return builder
      }
      return createMockQueryBuilder({ data: null, error: null })
    })

    const { POST } = await import('@/app/api/admin/license-keys/route')

    const req = createPostRequest('/api/admin/license-keys', {
      productId: 'prod-001',
      keys: [
        'KEY-AAAAA-BBBBB',
        'KEY-CCCCC-DDDDD',
        'KEY-EEEEE-FFFFF',
      ],
    })

    const res = await POST(req)
    const data = await res.json()

    expect(data.success).toBe(true)
  })
})
