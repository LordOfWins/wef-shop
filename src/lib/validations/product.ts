// src/lib/validations/product.ts
import { z } from 'zod'

export const createProductSchema = z.object({
  category_id: z.string().uuid('유효한 카테고리 ID가 필요합니다'),
  name: z
    .string()
    .min(1, '상품명은 필수입니다')
    .max(200, '상품명은 200자 이하여야 합니다'),
  slug: z
    .string()
    .min(1, 'slug는 필수입니다')
    .regex(/^[a-z0-9-]+$/, 'slug는 영문 소문자, 숫자, 하이픈만 가능합니다'),
  short_description: z
    .string()
    .min(1, '짧은 설명은 필수입니다')
    .max(500, '짧은 설명은 500자 이하여야 합니다'),
  description: z.string().min(1, '상세 설명은 필수입니다'),
  original_price: z
    .number()
    .int('정가는 정수여야 합니다')
    .min(0, '정가는 0 이상이어야 합니다'),
  sale_price: z
    .number()
    .int('판매가는 정수여야 합니다')
    .min(0, '판매가는 0 이상이어야 합니다'),
  image_url: z.string().url('유효한 URL이어야 합니다').nullable().optional(),
  badge: z.string().max(20).nullable().optional(),
  features: z.array(z.string()).default([]),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .default([]),
  license_type: z.enum(['permanent', 'subscription']),
  license_duration: z.string().nullable().optional(),
  max_devices: z.number().int().min(1).default(1),
  platform: z.enum(['windows', 'mac', 'both']),
  status: z.enum(['active', 'draft', 'out_of_stock']).default('draft'),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid('유효한 상품 ID가 필요합니다'),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
