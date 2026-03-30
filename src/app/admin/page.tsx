// src/app/admin/page.tsx
import { Badge } from '@/components/ui/Badge'
import { CountUp } from '@/components/ui/CountUp'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatPrice } from '@/lib/utils'
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Key,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'

async function getDashboardData() {
  const supabase = await createClient()
  const now = new Date()

  // ── 기간 계산 ──
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString()
  const yesterdayEnd = todayStart

  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset)
  const weekStartStr = weekStart.toISOString()

  const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const lastWeekEnd = weekStartStr

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  // ── 병렬 쿼리 9개 ──
  const [
    { data: todayOrders },
    { data: yesterdayOrders },
    { data: weekOrders },
    { data: lastWeekOrders },
    { data: monthOrders },
    { data: lastMonthOrders },
    { data: recentOrders },
    { data: allActiveProducts },
    { data: dailySales },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'delivered'])
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd),
    supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'delivered'])
      .gte('created_at', yesterdayStart)
      .lt('created_at', yesterdayEnd),
    supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'delivered'])
      .gte('created_at', weekStartStr),
    supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'delivered'])
      .gte('created_at', lastWeekStart)
      .lt('created_at', lastWeekEnd),
    supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'delivered'])
      .gte('created_at', monthStart),
    supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'delivered'])
      .gte('created_at', lastMonthStart)
      .lt('created_at', lastMonthEnd),
    supabase
      .from('orders')
      .select('id, order_number, guest_email, guest_name, user_id, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, name')
      .eq('status', 'active')
      .order('name'),
    supabase
      .from('orders')
      .select('total_amount, created_at')
      .in('status', ['paid', 'delivered'])
      .gte('created_at', new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // ── 재고: 상품별 available 키 수 (별도 쿼리 — N+1 방지를 위해 한 번에) ──
  const { data: availableKeysRaw } = await supabase
    .from('license_keys')
    .select('product_id')
    .eq('status', 'available')

  const keyCountMap = new Map<string, number>()
  if (availableKeysRaw) {
    for (const row of availableKeysRaw) {
      keyCountMap.set(row.product_id, (keyCountMap.get(row.product_id) ?? 0) + 1)
    }
  }

  const stockList = (allActiveProducts ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    available: keyCountMap.get(p.id) ?? 0,
  }))

  // ── 합계 헬퍼 ──
  const sumAmount = (arr: { total_amount: number }[] | null) =>
    arr?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0

  const todayTotal = sumAmount(todayOrders)
  const yesterdayTotal = sumAmount(yesterdayOrders)
  const weekTotal = sumAmount(weekOrders)
  const lastWeekTotal = sumAmount(lastWeekOrders)
  const monthTotal = sumAmount(monthOrders)
  const lastMonthTotal = sumAmount(lastMonthOrders)

  // ── 증감률 ──
  const calcChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  // ── 주간 바 차트 (최근 7일) ──
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  const dailyMap = new Map<string, number>()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dailyMap.set(key, 0)
  }

  dailySales?.forEach((order) => {
    const d = new Date(order.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + order.total_amount)
    }
  })

  const chartData = Array.from(dailyMap.entries()).map(([dateStr, amount]) => {
    const d = new Date(dateStr + 'T00:00:00')
    return {
      label: weekDays[d.getDay()],
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      amount,
    }
  })

  return {
    summary: {
      today: { amount: todayTotal, change: calcChange(todayTotal, yesterdayTotal) },
      week: { amount: weekTotal, change: calcChange(weekTotal, lastWeekTotal) },
      month: { amount: monthTotal, change: calcChange(monthTotal, lastMonthTotal) },
    },
    chartData,
    recentOrders: recentOrders ?? [],
    stockList,
  }
}

export default async function AdminDashboardPage() {
  const { summary, chartData, recentOrders, stockList } = await getDashboardData()

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 1)

  const summaryCards = [
    {
      title: '오늘 매출',
      amount: summary.today.amount,
      change: summary.today.change,
      icon: DollarSign,
      color: 'bg-primary-600',
    },
    {
      title: '이번주 매출',
      amount: summary.week.amount,
      change: summary.week.change,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      title: '이번달 매출',
      amount: summary.month.amount,
      change: summary.month.change,
      icon: ShoppingCart,
      color: 'bg-violet-500',
    },
  ]

  const statusLabels: Record<string, { label: string; variant: 'success' | 'danger' | 'default' | 'sale' | 'best' }> = {
    pending: { label: '대기', variant: 'default' },
    paid: { label: '결제완료', variant: 'best' },
    delivered: { label: '발송완료', variant: 'success' },
    cancelled: { label: '취소', variant: 'danger' },
    refunded: { label: '환불', variant: 'sale' },
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">대시보드</h1>
        <p className="text-slate-500 mt-1">위프 쇼핑몰의 현황을 한눈에 확인하세요</p>
      </div>

      {/* ────────────────────────────────────────
          매출 요약 카드 3개
          ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          const isPositive = card.change >= 0

          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">{card.title}</span>
                <div
                  className={`${card.color} w-10 h-10 rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-navy-900">
                <CountUp
                  end={card.amount}
                  formatter={(v) => formatPrice(v)}
                  className="tabular-nums"
                />
              </p>
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
                >
                  {Math.abs(card.change)}%
                </span>
                <span className="text-xs text-slate-400 ml-1">전 기간 대비</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ────────────────────────────────────────
          주간 매출 바 차트  +  키 재고 현황
          ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* 바 차트 (SVG 직접 구현 — 차트 라이브러리 없음) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-bold text-navy-900 mb-6">주간 매출</h2>
          <div className="h-64">
            <svg
              viewBox="0 0 700 250"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* 가로 가이드라인 5줄 */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={`guide-${i}`}>
                  <line
                    x1="60"
                    y1={30 + i * 50}
                    x2="680"
                    y2={30 + i * 50}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x="55"
                    y={35 + i * 50}
                    textAnchor="end"
                    className="fill-slate-400"
                    fontSize="11"
                  >
                    {formatPrice(Math.round(maxChartAmount * (1 - i / 4)))}
                  </text>
                </g>
              ))}

              {/* 바 7개 (최근 7일) */}
              {chartData.map((d, i) => {
                const barWidth = 60
                const gap = (620 - barWidth * 7) / 6
                const x = 60 + i * (barWidth + gap)
                const barMaxHeight = 200
                const barHeight =
                  maxChartAmount > 0
                    ? (d.amount / maxChartAmount) * barMaxHeight
                    : 0
                const y = 230 - barHeight

                return (
                  <g key={`bar-${i}`}>
                    {/* 배경 바 */}
                    <rect
                      x={x}
                      y={30}
                      width={barWidth}
                      height={barMaxHeight}
                      rx="8"
                      className="fill-slate-50"
                    />
                    {/* 실제 값 바 */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="8"
                      className="fill-primary-500"
                      opacity="0.85"
                    />
                    {/* 금액 라벨 (0원이면 숨김) */}
                    {d.amount > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize="10"
                        className="fill-primary-600 font-semibold"
                      >
                        {d.amount >= 10000
                          ? `${Math.round(d.amount / 10000)}만`
                          : formatPrice(d.amount)}
                      </text>
                    )}
                    {/* 날짜 라벨 */}
                    <text
                      x={x + barWidth / 2}
                      y={248}
                      textAnchor="middle"
                      fontSize="11"
                      className="fill-slate-500"
                    >
                      {d.date}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* 키 재고 현황 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-navy-900">키 재고 현황</h2>
          </div>
          <div className="space-y-3 max-h-[280px] overflow-y-auto">
            {stockList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-primary-50/40 transition-colors"
              >
                <span className="text-sm font-medium text-navy-800 truncate flex-1 mr-3">
                  {item.name}
                </span>
                {item.available <= 5 ? (
                  <Badge variant="danger">{item.available}개</Badge>
                ) : (
                  <span className="text-sm font-semibold text-slate-600">
                    {item.available}개
                  </span>
                )}
              </div>
            ))}
            {stockList.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                  <Key className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">등록된 상품이 없습니다</p>
                <p className="text-xs text-slate-300">상품을 등록하면 재고가 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────
          최근 주문 5건
          ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-navy-900">최근 주문</h2>
          </div>
          <a
            href="/admin/orders"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            전체보기 →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-4">
                  주문번호
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-4">
                  고객
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-4">
                  금액
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3 pr-4">
                  상태
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase pb-3">
                  날짜
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.map((order: any) => {
                const status = statusLabels[order.status] ?? statusLabels.pending
                const customerName = order.guest_name || (order.user_id ? '회원' : '비회원')
                const customerEmail = order.guest_email || '-'

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-primary-50/40 transition-colors"
                  >
                    <td className="py-3.5 pr-4">
                      <span className="text-sm font-mono font-medium text-navy-900">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div>
                        <p className="text-sm font-medium text-navy-800">
                          {customerName}
                        </p>
                        <p className="text-xs text-slate-400">{customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="text-sm font-semibold text-navy-900">
                        {formatPrice(order.total_amount)}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="py-3.5">
                      <span className="text-sm text-slate-500">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center">
                        <Package className="w-7 h-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">
                        아직 주문이 없습니다
                      </p>
                      <p className="text-xs text-slate-300">
                        첫 번째 주문이 들어오면 여기에 표시됩니다
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
