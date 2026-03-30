import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import { calcDiscountRate, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { Package, ShoppingCart, Star } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ProductFilters } from './ProductFilters'

export const metadata: Metadata = {
  title: '전체 상품',
  description:
    '위프(WEEP) 윈도우·MS 오피스 라이선스 전체 상품을 확인하세요. Windows 10/11, Office 2024/2021/2019/2016/365 최저가 즉시 발송.',
}

interface PageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    q?: string
  }>
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('status', 'active')

  if (params.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }

  switch (params.sort) {
    case 'price-asc':
      query = query.order('sale_price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('sale_price', { ascending: false })
      break
    case 'popular':
      query = query.order('sold_count', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('sort_order', { ascending: true })
  }

  const { data: products } = await query
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">전체 상품</h1>
        <p className="text-slate-500">
          윈도우·MS 오피스 라이선스를 만나보세요
        </p>
      </div>

      <ProductFilters
        categories={categories ?? []}
        currentCategory={params.category}
        currentSort={params.sort}
        currentQuery={params.q}
      />

      {!products || products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-500">
            조건에 맞는 상품이 없습니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {(products as (Product & { category: { name: string; slug: string } })[]).map(
            (product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Package className="w-8 h-8 text-primary-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-400">
                        {product.category?.name}
                      </p>
                    </div>
                  )}

                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={
                          product.badge === 'BEST'
                            ? 'best'
                            : product.badge === 'HOT'
                              ? 'sale'
                              : 'timesale'
                        }
                      >
                        {product.badge}
                      </Badge>
                    </div>
                  )}

                  {product.original_price > product.sale_price && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="sale">
                        {calcDiscountRate(product.original_price, product.sale_price)}%
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs text-primary-500 font-medium mb-1">
                    {product.category?.name}
                  </p>
                  <h3 className="font-bold text-navy-900 mb-3 group-hover:text-primary-600 transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                    {product.short_description}
                  </p>

                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-2xl font-black text-navy-900">
                      {formatPrice(product.sale_price)}
                    </span>
                    {product.original_price > product.sale_price && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Star className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
                      <span>
                        {Number(product.review_avg) > 0
                          ? Number(product.review_avg).toFixed(1)
                          : '-'}
                      </span>
                      {product.review_count > 0 && (
                        <span>({product.review_count})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      담기
                    </div>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}
