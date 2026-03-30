// src/app/reviews/page.tsx
import { ReviewWriteSection } from '@/components/reviews/ReviewWriteSection'
import { PageTransition } from '@/components/ui/PageTransition'
import { createClient } from '@/lib/supabase/server'
import { formatDate, maskName } from '@/lib/utils'
import { Star } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '구매후기',
  description: '위프 고객님들의 생생한 구매후기를 확인하세요.',
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Number(pageStr) || 1
  const perPage = 10
  const offset = (page - 1) * perPage

  const supabase = await createClient()

  const [{ data: reviews, count }, { data: { user } }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*, products:product_id(name, slug)', { count: 'exact' })
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1),
    supabase.auth.getUser(),
  ])

  const totalPages = Math.ceil((count ?? 0) / perPage)

  // 로그인한 유저의 리뷰 가능한 주문 조회
  let reviewableOrders: any[] = []
  if (user) {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, order_items(id, product_id, product_name)')
      .eq('user_id', user.id)
      .in('status', ['paid', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(20)

    reviewableOrders = orders ?? []
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  )

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-navy-900 mb-3">구매후기</h1>
        <p className="text-slate-500">고객님들의 생생한 후기를 확인하세요</p>
      </div>

      {/* 리뷰 작성 섹션 (로그인한 구매자만) */}
      {user && reviewableOrders.length > 0 && (
        <ReviewWriteSection orders={reviewableOrders} />
      )}

      {/* 리뷰 목록 */}
      <div className="space-y-6">
        {(reviews ?? []).map((review: any) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {renderStars(review.rating)}
              <span className="text-sm font-semibold text-navy-800">
                {maskName(review.author_name)}
              </span>
              <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
              {review.products?.name && (
                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-lg font-medium">
                  {review.products.name}
                </span>
              )}
            </div>
            <p className="text-sm text-navy-800 leading-relaxed">{review.content}</p>

            {review.admin_reply && (
              <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">W</span>
                  </div>
                  <span className="text-xs font-semibold text-primary-600">위프 관리자</span>
                </div>
                <p className="text-sm text-navy-800">{review.admin_reply}</p>
              </div>
            )}
          </div>
        ))}

        {(!reviews || reviews.length === 0) && (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">아직 후기가 없습니다</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/reviews?page=${p}`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${p === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </PageTransition>
  )
}
