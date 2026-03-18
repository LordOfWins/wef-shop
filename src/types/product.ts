export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type ProductStatus = 'active' | 'draft' | 'out_of_stock'

export interface ProductOption {
  label: string
  value: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  short_description: string
  description: string
  original_price: number
  sale_price: number
  image_url: string | null
  badge: string | null
  features: string[]
  options: ProductOption[]
  license_type: 'permanent' | 'subscription'
  license_duration: string | null
  max_devices: number
  platform: 'windows' | 'mac' | 'both'
  status: ProductStatus
  is_featured: boolean
  sort_order: number
  stock_count: number
  sold_count: number
  review_count: number
  review_avg: number
  created_at: string
  updated_at: string
  // joined
  category?: Category
}
