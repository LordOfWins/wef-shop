// src/components/admin/AdminProductActions.tsx
'use client'

import { toast } from '@/components/ui/Toast'
import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminProductActions({
  productId,
  productName,
}: {
  productId: string
  productName: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`"${productName}" 상품을 숨김 처리하시겠습니까?`)) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast('success', '상품이 숨김 처리되었습니다')
        router.refresh()
      } else {
        toast('error', data.error || '처리에 실패했습니다')
      }
    } catch {
      toast('error', '오류가 발생했습니다')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
