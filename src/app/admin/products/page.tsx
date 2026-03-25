// src/app/admin/products/page.tsx
import { AdminProductActions } from '@/components/admin/AdminProductActions'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: '상품 관리' }

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories:category_id(name), license_keys(id, status)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  const productList = (products ?? []).map((p: any) => {
    const keys = Array.isArray(p.license_keys) ? p.license_keys : []
    const availableKeys = keys.filter((k: any) => k.status === 'available').length
    return { ...p, availableKeys, categoryName: p.categories?.name ?? '-' }
  })

  const statusMap: Record<string, { label: string; variant: 'success' | 'default' | 'danger' }> = {
    active: { label: '판매중', variant: 'success' },
    draft: { label: '숨김', variant: 'default' },
    out_of_stock: { label: '품절', variant: 'danger' },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">상품 관리</h1>
          <p className="text-slate-500 mt-1">총 {productList.length}개 상품</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          상품 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">상품명</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">카테고리</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">판매가</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-6 py-4">상태</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-6 py-4">재고</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-6 py-4">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productList.map((product: any) => {
                const status = statusMap[product.status] ?? statusMap.draft
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-navy-900">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{product.categoryName}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{formatPrice(product.sale_price)}</p>
                        {product.original_price > product.sale_price && (
                          <p className="text-xs text-slate-400 line-through">{formatPrice(product.original_price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.availableKeys <= 5 ? (
                        <Badge variant="danger">{product.availableKeys}개</Badge>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">{product.availableKeys}개</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <AdminProductActions productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {productList.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm">등록된 상품이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
