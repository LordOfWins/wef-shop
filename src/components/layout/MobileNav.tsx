'use client'

import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import { ChevronDown, LogOut, Package, Shield, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavLink {
  href: string
  label: string
  children?: { href: string; label: string }[]
}

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  navLinks: NavLink[]
  user: User | null
  isAdmin: boolean
  onSignOut: () => void
}

export function MobileNav({
  isOpen,
  onClose,
  navLinks,
  user,
  isAdmin,
  onSignOut,
}: MobileNavProps) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : [...prev, label]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-30 lg:hidden">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* 사이드 패널 */}
      <div className="absolute top-16 right-0 w-80 max-w-[85vw] h-[calc(100vh-4rem)] bg-white shadow-2xl overflow-y-auto">
        <div className="p-6 space-y-2">
          {/* 사용자 정보 */}
          {user && (
            <div className="pb-4 mb-4 border-b border-slate-100">
              <p className="text-sm text-slate-500">안녕하세요</p>
              <p className="font-semibold text-navy-900">{user.email}</p>
            </div>
          )}

          {/* 네비게이션 링크 */}
          {navLinks.map((link) => (
            <div key={link.label}>
              {link.children ? (
                <>
                  <button
                    onClick={() => toggleSection(link.label)}
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer',
                      'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        openSections.includes(link.label) && 'rotate-180'
                      )}
                    />
                  </button>
                  {openSections.includes(link.label) && (
                    <div className="ml-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            'block px-4 py-2.5 rounded-lg text-sm transition-colors',
                            pathname === child.href
                              ? 'text-primary-600 bg-primary-50 font-medium'
                              : 'text-slate-500 hover:text-navy-900 hover:bg-slate-50'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  )}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}

          {/* 하단 액션 */}
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-accent-600 hover:bg-accent-500/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                관리자 페이지
              </Link>
            )}

            {user ? (
              <>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  주문내역
                </Link>
                <button
                  onClick={() => {
                    onSignOut()
                    onClose()
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                로그인 / 회원가입
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
