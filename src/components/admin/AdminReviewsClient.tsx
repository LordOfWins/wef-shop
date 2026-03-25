// src/components/admin/AdminReviewsClient.tsx
'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { cn, formatDate, maskName } from '@/lib/utils'
import { Eye, EyeOff, MessageSquare, Send, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ReviewData {
  id: string
  product_id: string
  author_name: string
  rating: number
  content: string
  is_visible: boolean
  admin_reply: string | null
  created_at: string
  products: { name: string; slug: string } | null
}

export function AdminReviewsClient({ initialReviews }: { initialReviews: ReviewData[] }) {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    setLoadingId(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_visible: !currentVisible }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_visible: !currentVisible } : r))
        )
        toast('success', !currentVisible ? '리뷰가 공개되었습니다' : '리뷰가 숨겨졌습니다')
      }
    } catch {
      toast('error', '처리 실패')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReply = async (id: string) => {
    if (!replyText.trim()) {
      toast('error', '답글을 입력하세요')
      return
    }
    setLoadingId(id)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_reply: replyText.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, admin_reply: replyText.trim() } : r))
        )
        setReplyingId(null)
        setReplyText('')
        toast('success', '답글이 등록되었습니다')
      }
    } catch {
      toast('error', '답글 등록 실패')
    } finally {
      setLoadingId(null)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            'w-4 h-4',
            s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          )}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">리뷰 관리</h1>
        <p className="text-slate-500 mt-1">
          총 {reviews.length}개 ·{' '}
          <span className="text-amber-600">
            승인 대기 {reviews.filter((r) => !r.is_visible).length}개
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={cn(
              'bg-white rounded-2xl p-6 shadow-sm border transition-colors',
              review.is_visible ? 'border-slate-100' : 'border-amber-200 bg-amber-50/30'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-navy-800">
                    {maskName(review.author_name)}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                  {review.is_visible ? (
                    <Badge variant="success">공개</Badge>
                  ) : (
                    <Badge variant="default">숨김</Badge>
                  )}
                </div>
                <p className="text-xs text-primary-600 mb-2">{review.products?.name ?? '-'}</p>
                <p className="text-sm text-navy-800 leading-relaxed">{review.content}</p>

                {/* 관리자 답글 */}
                {review.admin_reply && (
                  <div className="mt-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
                    <p className="text-xs font-semibold text-primary-600 mb-1">관리자 답글</p>
                    <p className="text-sm text-navy-800">{review.admin_reply}</p>
                  </div>
                )}

                {/* 답글 작성 폼 */}
                {replyingId === review.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-y"
                      placeholder="답글을 입력하세요..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(review.id)}
                        isLoading={loadingId === review.id}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        등록
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setReplyingId(null); setReplyText('') }}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleToggleVisibility(review.id, review.is_visible)}
                  disabled={loadingId === review.id}
                  className={cn(
                    'p-2 rounded-lg transition-colors cursor-pointer',
                    review.is_visible
                      ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                      : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                  )}
                  title={review.is_visible ? '숨기기' : '공개하기'}
                >
                  {review.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setReplyingId(review.id)
                    setReplyText(review.admin_reply ?? '')
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                  title="답글 작성"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-400">리뷰가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
