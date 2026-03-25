// src/app/admin/products/new/page.tsx
import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'

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
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
