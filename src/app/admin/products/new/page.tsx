// src/app/admin/products/new/page.tsx
import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'
import { AlertTriangle } from 'lucide-react'

export const metadata = { title: '상품 등록' }

export default async function AdminProductNewPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">상품 등록</h1>
        <p className="text-slate-500 mt-1">새 상품을 등록합니다</p>
      </div>
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                    상품 정보 및 라이선스 키의 적법성에 대한 책임은 운영자에게 있습니다
                  </p>
              </div>

      <ProductForm categories={categories ?? []} />
    </div>
  )
}
