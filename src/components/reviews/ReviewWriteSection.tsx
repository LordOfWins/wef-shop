// src/components/reviews/ReviewWriteSection.tsx
'use client'

import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { Pencil, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
}

interface Order {
  id: string
  order_number: string
  order_items: OrderItem[]
}

export function ReviewWriteSection({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedOrder = orders.find((o) => o.id === selectedOrderId)
  const products = selectedOrder?.order_items ?? []

  const handleSubmit = async () => {
    if (!selectedOrderId || !selectedProductId || !content.trim()) {
      toast('error', '주문, 상품, 내용을 모두 입력해주세요')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          productId: selectedProductId,
          rating,
          content: content.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast('success', '리뷰가 등록되었습니다. 관리자 승인 후 공개됩니다.')
        setIsOpen(false)
        setContent('')
        setRating(5)
        setSelectedOrderId('')
        setSelectedProductId('')
        router.refresh()
      } else {
        toast('error', data.error || '등록에 실패했습니다')
      }
    } catch {
      toast('error', '오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="mb-8">
        <Button onClick={() => setIsOpen(true)} variant="outline">
          <Pencil className="w-4 h-4 mr-2" />
          리뷰 작성하기
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-navy-900 mb-4">리뷰 작성</h3>

      <div className="space-y-4">
        {/* 주문 선택 */}
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1.5">주문 선택</label>
          <select
            value={selectedOrderId}
            onChange={(e) => {
              setSelectedOrderId(e.target.value)
              setSelectedProductId('')
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="">주문을 선택하세요</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number}
              </option>
            ))}
          </select>
        </div>

        {/* 상품 선택 */}
        {selectedOrderId && (
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">상품 선택</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="">상품을 선택하세요</option>
              {products.map((item) => (
                <option key={item.id} value={item.product_id}>
                  {item.product_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 별점 */}
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1.5">별점</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="cursor-pointer p-0.5"
              >
                <Star
                  className={cn(
                    'w-7 h-7 transition-colors',
                    s <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200'
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-slate-500">{rating}점</span>
          </div>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1.5">리뷰 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-y"
            placeholder="구매하신 상품에 대한 솔직한 후기를 남겨주세요."
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} isLoading={submitting}>
            리뷰 등록
          </Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            취소
          </Button>
        </div>
      </div>
    </div>
  )
}
