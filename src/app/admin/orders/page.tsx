// src/app/admin/orders/page.tsx
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: '주문 관리' }

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        product_name,
        price,
        quantity,
        license_key_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // license_keys는 별도 조회 필요할 때만 상세에서 fetch
  return <AdminOrdersClient initialOrders={orders ?? []} />
}
