// src/components/admin/AdminSidebar.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Box,
  Home,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  ShoppingBag,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface AdminSidebarProps {
  counts: {
    pendingOrders: number
    totalProducts: number
    pendingReviews: number
    availableKeys: number
  }
}

const menuItems = [
  {
    href: '/admin',
    label: '대시보드',
    icon: LayoutDashboard,
    countKey: null,
  },
  {
    href: '/admin/products',
    label: '상품 관리',
    icon: Box,
    countKey: 'totalProducts' as const,
  },
  {
    href: '/admin/license-keys',
    label: '라이선스 키',
    icon: Key,
    countKey: 'availableKeys' as const,
  },
  {
    href: '/admin/orders',
    label: '주문 관리',
    icon: ShoppingBag,
    countKey: 'pendingOrders' as const,
  },
  {
    href: '/admin/reviews',
    label: '리뷰 관리',
    icon: MessageSquare,
    countKey: 'pendingReviews' as const,
  },
]

export function AdminSidebar({ counts }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* 로고 */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div>
            <p className="text-lg font-bold text-navy-900">WEEP</p>
            <p className="text-xs text-slate-500">관리자 패널</p>
          </div>
        </Link>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const count = item.countKey ? counts[item.countKey] : null

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-full" />
              )}
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {count !== null && count > 0 && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold',
                    active
                      ? 'bg-white/20 text-white'
                      : item.countKey === 'pendingOrders'
                        ? 'bg-red-100 text-red-600'
                        : item.countKey === 'pendingReviews'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* 하단 */}
      <div className="p-4 border-t border-slate-200 space-y-1">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-navy-900 transition-all duration-200"
        >
          <Home className="w-5 h-5" />
          쇼핑몰로 돌아가기
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-xl shadow-md border border-slate-200 text-slate-600 hover:text-navy-900 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30">
        <SidebarContent />
      </aside>

      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
