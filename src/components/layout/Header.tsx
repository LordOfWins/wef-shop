'use client'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { ChevronDown, Menu, Shield, ShoppingCart, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MobileNav } from './MobileNav'

const navLinks = [
  { href: '/products', label: '전체 상품' },
  {
    href: '#',
    label: '윈도우',
    children: [
      { href: '/category/windows-11', label: 'Windows 11' },
      { href: '/category/windows-10', label: 'Windows 10' },
    ],
  },
  {
    href: '#',
    label: 'MS 오피스',
    children: [
      { href: '/category/office-2024', label: 'Office 2024' },
      { href: '/category/office-2021', label: 'Office 2021' },
      { href: '/category/office-2019', label: 'Office 2019' },
      { href: '/category/office-2016', label: 'Office 2016' },
      { href: '/category/office-365', label: 'Office 365' },
    ],
  },
  { href: '/reviews', label: '구매후기' },
  { href: '/faq', label: 'FAQ' },
]

export function Header() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  )
  const { user, profile, signOut, isAdmin, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
            : 'bg-white'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn(
            'flex items-center justify-between transition-all duration-300',
            isScrolled ? 'h-14 lg:h-16' : 'h-16 lg:h-18'
          )}>

            {/* 로고 */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-navy-900">
                WEF
              </span>
            </Link>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {link.children ? (
                    <button
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                        'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                      )}
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        pathname === link.href
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                      )}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* 드롭다운 */}
                  {link.children && openDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-1 min-w-[180px]">
                      <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-2 overflow-hidden">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-4 py-2.5 text-sm transition-colors',
                              pathname === child.href
                                ? 'text-primary-600 bg-primary-50 font-medium'
                                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* 우측 액션 */}
            <div className="flex items-center gap-2">
              {/* 관리자 링크 */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-accent-600 hover:bg-accent-500/10 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden md:inline">관리자</span>
                </Link>
              )}

              {/* 장바구니 */}
              <Link
                href="/cart"
                className="relative p-2.5 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                suppressHydrationWarning
              >
                <ShoppingCart className="w-5 h-5" />
                <span
                  suppressHydrationWarning
                  className={cn(
                    "absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                    totalItems > 0 ? "flex" : "hidden"
                  )}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              </Link>

              {/* 로그인/프로필 */}
              {loading ? (
                <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse" />
              ) : user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/orders"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                  >
                    주문내역
                  </Link>
                  <button
                    onClick={signOut}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  로그인
                </Link>
              )}

              {/* 모바일 메뉴 버튼 */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 헤더 높이만큼 패딩 */}
      <div className="h-16 lg:h-18" />

      {/* 모바일 네비게이션 */}
      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={navLinks}
        user={user}
        isAdmin={isAdmin}
        onSignOut={signOut}
      />
    </>
  )
}
