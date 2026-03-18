export interface Review {
  id: string
  product_id: string
  user_id: string | null
  order_id: string | null
  author_name: string
  rating: number
  content: string
  is_visible: boolean
  admin_reply: string | null
  created_at: string
  // joined
  product?: { name: string; slug: string }
}
