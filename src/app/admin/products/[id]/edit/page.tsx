// src/app/admin/products/[id]/edit/page.tsx
import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const metadata = { title: '상품 수정' }

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">상품 수정</h1>
        <p className="text-slate-500 mt-1">{product.name}</p>
      </div>
      <ProductForm categories={categories ?? []} initialData={product} />
    </div>
  )
}
