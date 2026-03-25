// src/app/admin/reviews/page.tsx
import { AdminReviewsClient } from '@/components/admin/AdminReviewsClient'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: '리뷰 관리' }

export default async function AdminReviewsPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products:product_id(name, slug)')
    .order('created_at', { ascending: false })

  return <AdminReviewsClient initialReviews={reviews ?? []} />
}
