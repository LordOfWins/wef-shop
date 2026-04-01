import type { Product } from '@/types'

export const mockProduct: Product = {
  id: 'prod-001',
  category_id: 'cat-001',
  name: 'Microsoft Office 365',
  slug: 'microsoft-office-365',
  short_description: 'Office 365 영구 라이선스',
  description: '워드, 엑셀, 파워포인트 포함',
  original_price: 109000,
  sale_price: 17900,
  image_url: null,
  badge: 'BEST',
  features: ['워드', '엑셀', '파워포인트'],
  options: [{ label: '플랫폼', value: 'Windows' }],
  license_type: 'permanent',
  license_duration: null,
  max_devices: 1,
  platform: 'windows',
  status: 'active',
  is_featured: true,
  sort_order: 0,
  stock_count: 100,
  sold_count: 50,
  review_count: 10,
  review_avg: 4.5,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export const mockProduct2: Product = {
  ...mockProduct,
  id: 'prod-002',
  name: 'Windows 11 Pro',
  slug: 'windows-11-pro',
  original_price: 208000,
  sale_price: 35900,
  badge: 'HOT',
}

export const mockAdminUser = {
  id: 'user-admin-001',
  email: 'admin@wefsoft.kr',
}

export const mockCustomerUser = {
  id: 'user-customer-001',
  email: 'customer@example.com',
}

export const mockOrder = {
  id: 'order-001',
  order_number: 'WEF-20260401-A1B2',
  user_id: 'user-customer-001',
  guest_email: null,
  guest_name: null,
  status: 'paid' as const,
  total_amount: 17900,
  toss_payment_key: 'tpk_test_001',
  toss_order_id: 'WEF-20260401-A1B2',
  payment_method: 'card',
  paid_at: '2026-04-01T12:00:00Z',
  email_sent: false,
  email_sent_at: null,
  created_at: '2026-04-01T12:00:00Z',
  updated_at: '2026-04-01T12:00:00Z',
}

export const mockLicenseKeys = [
  {
    id: 'lk-001',
    product_id: 'prod-001',
    license_key: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
    status: 'sold' as const,
    order_id: 'order-001',
    sold_at: '2026-04-01T12:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
    products: { name: 'Microsoft Office 365' },
  },
]
