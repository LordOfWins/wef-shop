// src/components/admin/AdminOrdersClient.tsx
'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { cn, formatDate, formatDateTime, formatPrice } from '@/lib/utils'
import { ChevronDown, ChevronUp, Mail, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const statusConfig: Record<
  string,
  { label: string; variant: 'success' | 'default' | 'danger' | 'best' | 'sale' }
> = {
  pending: { label: '대기', variant: 'default' },
  paid: { label: '결제완료', variant: 'best' },
  delivered: { label: '발송완료', variant: 'success' },
  cancelled: { label: '취소', variant: 'danger' },
  refunded: { label: '환불', variant: 'sale' },
}

const statusFilters = ['all', 'pending', 'paid', 'delivered', 'cancelled', 'refunded']

export function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
        toast('success', '주문 상태가 변경되었습니다')
      } else {
        toast('error', data.error)
      }
    } catch {
      toast('error', '상태 변경 실패')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleResendEmail = async (orderId: string) => {
    setResendingId(orderId)
    try {
      const res = await fetch('/api/admin/orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, email_sent: true } : o))
        )
        toast('success', '이메일이 발송되었습니다')
      } else {
        toast('error', data.error)
      }
    } catch {
      toast('error', '이메일 발송 실패')
    } finally {
      setResendingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">주문 관리</h1>
        <p className="text-slate-500 mt-1">총 {orders.length}건</p>
      </div>

      {/* 상태 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer',
              filter === s
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {s === 'all' ? '전체' : statusConfig[s]?.label ?? s}
            {s !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 주문 목록 */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const status = statusConfig[order.status] ?? statusConfig.pending
          const isExpanded = expandedId === order.id
          const customerName = order.profiles?.name || order.guest_name || '비회원'
          const customerEmail = order.profiles?.email || order.guest_email || '-'
          const showResend = !order.email_sent || order.status !== 'delivered'

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              {/* 주문 요약 행 */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-mono font-semibold text-navy-900">
                    {order.order_number}
                  </span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="text-sm text-slate-600">{customerName}</span>
                  <span className="text-sm font-semibold text-navy-900">
                    {formatPrice(order.total_amount)}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
                  {!order.email_sent && (
                    <Badge variant="danger">이메일 미발송</Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* 상세 내용 */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* 고객 정보 */}
                    <div>
                      <h4 className="text-sm font-bold text-navy-900 mb-3">고객 정보</h4>
                      <div className="space-y-1.5 text-sm">
                        <p><span className="text-slate-500">이름:</span> {customerName}</p>
                        <p><span className="text-slate-500">이메일:</span> {customerEmail}</p>
                        <p><span className="text-slate-500">결제일:</span> {order.paid_at ? formatDateTime(order.paid_at) : '-'}</p>
                        <p><span className="text-slate-500">결제방법:</span> {order.payment_method ?? '-'}</p>
                      </div>
                    </div>

                    {/* 주문 아이템 */}
                    <div>
                      <h4 className="text-sm font-bold text-navy-900 mb-3">주문 상품</h4>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-navy-800">{item.product_name}</p>
                              <p className="text-xs text-slate-400">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-navy-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 flex-wrap">
                    {/* 상태 변경 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">상태 변경:</span>
                      {(['delivered', 'cancelled', 'refunded'] as const).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={
                            s === 'delivered' ? 'primary'
                              : s === 'cancelled' ? 'danger'
                                : 'outline'
                          }
                          disabled={order.status === s || updatingId === order.id}
                          isLoading={updatingId === order.id}
                          onClick={() => handleStatusChange(order.id, s)}
                        >
                          {statusConfig[s].label}
                        </Button>
                      ))}
                    </div>

                    {/* 이메일 재발송 */}
                    {showResend && (
                      <Button
                        size="sm"
                        variant="ghost"
                        isLoading={resendingId === order.id}
                        onClick={() => handleResendEmail(order.id)}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        이메일 재발송
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-400">주문이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
