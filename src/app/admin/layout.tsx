// src/app/admin/layout.tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '관리자',
}

async function getAdminCounts() {
  const supabase = await createClient()

  const [
    { count: pendingOrders },
    { count: totalProducts },
    { count: pendingReviews },
    { count: availableKeys },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'paid']),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'draft'),
    supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_visible', false),
    supabase
      .from('license_keys')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available'),
  ])

  return {
    pendingOrders: pendingOrders ?? 0,
    totalProducts: totalProducts ?? 0,
    pendingReviews: pendingReviews ?? 0,
    availableKeys: availableKeys ?? 0,
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const counts = await getAdminCounts()

  return (
    <>
      {/* 루트 layout의 Header/Footer/헤더 패딩 숨김 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body > div > header,
            body > div > footer,
            body > div > header + div {
              display: none !important;
            }
            body > div > main {
              flex: unset !important;
            }
          `,
        }}
      />
      <div className="min-h-screen bg-slate-50 flex">
        <AdminSidebar counts={counts} />
        {/* main이 아닌 div — 루트 layout에 이미 <main>이 있으므로 중첩 방지 */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </>
  )
}
