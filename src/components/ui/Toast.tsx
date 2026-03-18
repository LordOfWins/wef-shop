'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

let addToastFn: ((toast: Omit<ToastMessage, 'id'>) => void) | null = null

export function toast(type: ToastMessage['type'], message: string) {
  addToastFn?.({ type, message })
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    addToastFn = ({ type, message }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    }
    return () => { addToastFn = null }
  }, [])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg border animate-slide-up',
            t.type === 'error' && 'border-red-200',
            t.type === 'success' && 'border-emerald-200',
            t.type === 'info' && 'border-primary-200'
          )}
        >
          {icons[t.type]}
          <span className="text-sm font-medium text-navy-900">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
