// src/__tests__/api/admin-products.test.ts
import {
  createMockQueryBuilder,
} from '@/__tests__/mocks/supabase'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Module mocks ──
const mockCheckAdmin = vi.fn()
vi.mock('@/lib/auth/checkAdmin', () => ({
  checkAdmin: () => mockCheckAdmin(),
}))

const mockAdminFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

function createRequest(
  method: string,
  body?: Record<string, unknown>,
  searchParams?: Record<string, string>
) {
  const url = new URL('http://localhost:3000/api/admin/products')
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      url.searchParams.set(k, v)
    }
  }

  const init: RequestInit = { method }
  if (body) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }

  return new Request(url.toString(), init) as unknown as import('next/server').NextRequest
}

const validProduct = {
  category_id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Product',
  slug: 'test-product',
  short_description: 'Short desc',
  description: 'Full description',
  original_price: 100000,
  sale_price: 50000,
  license_type: 'permanent',
  platform: 'windows',
}

describe('api/admin/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockCheckAdmin.mockResolvedValue({
      id: 'admin-001',
      email: 'admin@wefsoft.kr',
    })

    mockAdminFrom.mockImplementation(() =>
      createMockQueryBuilder({
        data: { id: 'prod-new', ...validProduct },
        error: null,
      })
    )
  })

  // ─────────────────────────────────────
  // 인증 테스트 (공통)
  // ─────────────────────────────────────
  describe('인증', () => {
    it('비로그인 사용자는 403 에러', async () => {
      mockCheckAdmin.mockResolvedValue(null)

      const { POST } = await import('@/app/api/admin/products/route')
      const req = createRequest('POST', validProduct)
      const res = await POST(req)

      expect(res.status).toBe(403)
    })

    it('일반 사용자(non-admin)는 403 에러', async () => {
      mockCheckAdmin.mockResolvedValue(null)

      const { PUT } = await import('@/app/api/admin/products/route')
      const req = createRequest('PUT', {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated',
      })
      const res = await PUT(req)

      expect(res.status).toBe(403)
    })
  })

  // ─────────────────────────────────────
  // POST — 상품 등록 + Zod validation
  // ─────────────────────────────────────
  describe('POST (상품 등록)', () => {
    it('유효한 데이터로 상품을 등록한다', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const req = createRequest('POST', validProduct)
      const res = await POST(req)
      const data = await res.json()

      expect(data.success).toBe(true)
    })

    it('name이 없으면 400 에러 (validation)', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const { name, ...noName } = validProduct
      const req = createRequest('POST', noName)
      const res = await POST(req)

      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.details).toBeDefined()
    })

    it('slug에 대문자가 있으면 400 에러', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const req = createRequest('POST', {
        ...validProduct,
        slug: 'Invalid-Slug',
      })
      const res = await POST(req)

      expect(res.status).toBe(400)
    })

    it('sale_price가 음수이면 400 에러', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const req = createRequest('POST', {
        ...validProduct,
        sale_price: -1000,
      })
      const res = await POST(req)

      expect(res.status).toBe(400)
    })

    it('license_type이 잘못된 값이면 400 에러', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const req = createRequest('POST', {
        ...validProduct,
        license_type: 'invalid',
      })
      const res = await POST(req)

      expect(res.status).toBe(400)
    })

    it('category_id가 UUID가 아니면 400 에러', async () => {
      const { POST } = await import('@/app/api/admin/products/route')
      const req = createRequest('POST', {
        ...validProduct,
        category_id: 'not-a-uuid',
      })
      const res = await POST(req)

      expect(res.status).toBe(400)
    })
  })

  // ─────────────────────────────────────
  // PUT — 상품 수정
  // ─────────────────────────────────────
  describe('PUT (상품 수정)', () => {
    it('유효한 데이터로 상품을 수정한다', async () => {
      const { PUT } = await import('@/app/api/admin/products/route')
      const req = createRequest('PUT', {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Product',
      })
      const res = await PUT(req)
      const data = await res.json()

      expect(data.success).toBe(true)
    })

    it('id가 없으면 400 에러', async () => {
      const { PUT } = await import('@/app/api/admin/products/route')
      const req = createRequest('PUT', { name: 'Updated' })
      const res = await PUT(req)

      expect(res.status).toBe(400)
    })
  })

  // ─────────────────────────────────────
  // DELETE — 상품 삭제 (soft delete)
  // ─────────────────────────────────────
  describe('DELETE (soft delete)', () => {
    it('상품을 soft delete한다', async () => {
      const { DELETE } = await import('@/app/api/admin/products/route')
      const req = createRequest('DELETE', undefined, {
        id: '550e8400-e29b-41d4-a716-446655440000',
      })
      const res = await DELETE(req)
      const data = await res.json()

      expect(data.success).toBe(true)
    })

    it('id가 없으면 400 에러', async () => {
      const { DELETE } = await import('@/app/api/admin/products/route')
      const req = createRequest('DELETE')
      const res = await DELETE(req)

      expect(res.status).toBe(400)
    })
  })
})
