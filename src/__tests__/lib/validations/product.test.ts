// src/__tests__/lib/validations/product.test.ts
import { createProductSchema, updateProductSchema } from '@/lib/validations/product'
import { describe, expect, it } from 'vitest'

const validInput = {
  category_id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Microsoft Office 365',
  slug: 'microsoft-office-365',
  short_description: 'Office 영구 라이선스',
  description: '워드, 엑셀, 파워포인트 포함 영구 라이선스입니다.',
  original_price: 109000,
  sale_price: 17900,
  license_type: 'permanent' as const,
  platform: 'windows' as const,
}

describe('createProductSchema', () => {
  it('유효한 입력을 통과시킨다', () => {
    const result = createProductSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('필수 필드 누락 시 실패한다', () => {
    const result = createProductSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('name이 빈 문자열이면 실패한다', () => {
    const result = createProductSchema.safeParse({ ...validInput, name: '' })
    expect(result.success).toBe(false)
  })

  it('slug에 대문자가 있으면 실패한다', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      slug: 'Invalid-Slug',
    })
    expect(result.success).toBe(false)
  })

  it('slug에 공백이 있으면 실패한다', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      slug: 'invalid slug',
    })
    expect(result.success).toBe(false)
  })

  it('original_price가 음수이면 실패한다', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      original_price: -1,
    })
    expect(result.success).toBe(false)
  })

  it('sale_price가 소수이면 실패한다', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      sale_price: 17900.5,
    })
    expect(result.success).toBe(false)
  })

  it('license_type이 잘못된 값이면 실패한다', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      license_type: 'yearly',
    })
    expect(result.success).toBe(false)
  })

  it('platform이 잘못된 값이면 실패한다', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      platform: 'linux',
    })
    expect(result.success).toBe(false)
  })

  it('category_id가 UUID 형식이 아니면 실패한다', () => {
    const result = createProductSchema.safeParse({
      ...validInput,
      category_id: 'not-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('선택 필드에 기본값이 적용된다', () => {
    const result = createProductSchema.safeParse(validInput)
    if (result.success) {
      expect(result.data.features).toEqual([])
      expect(result.data.options).toEqual([])
      expect(result.data.max_devices).toBe(1)
      expect(result.data.status).toBe('draft')
      expect(result.data.is_featured).toBe(false)
      expect(result.data.sort_order).toBe(0)
    }
  })
})

describe('updateProductSchema', () => {
  it('id + 일부 필드만으로 통과한다', () => {
    const result = updateProductSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Updated Name',
    })
    expect(result.success).toBe(true)
  })

  it('id가 없으면 실패한다', () => {
    const result = updateProductSchema.safeParse({ name: 'Updated' })
    expect(result.success).toBe(false)
  })

  it('id가 UUID가 아니면 실패한다', () => {
    const result = updateProductSchema.safeParse({
      id: 'bad-id',
      name: 'Updated',
    })
    expect(result.success).toBe(false)
  })
})
