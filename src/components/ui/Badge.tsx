import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'sale' | 'best' | 'timesale' | 'success' | 'danger'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    sale: 'bg-red-500 text-white',
    best: 'bg-primary-600 text-white',
    timesale: 'bg-accent-500 text-white animate-pulse',
    success: 'bg-emerald-500 text-white',
    danger: 'bg-red-500 text-white',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
