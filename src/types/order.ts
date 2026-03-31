import type { LicenseKey } from './license'

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled' | 'refunded'

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  guest_name: string | null
  status: OrderStatus
  total_amount: number
  toss_payment_key: string | null
  toss_order_id: string | null
  payment_method: string | null
  paid_at: string | null
  email_sent: boolean
  email_sent_at: string | null
  created_at: string
  updated_at: string
  // joined
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  license_key_id: string | null
  created_at: string
  // joined
  license_key?: LicenseKey
}
