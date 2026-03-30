import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/ui/PageTransition'
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
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {(products as (Product & { category: { name: string; slug: string } })[]).map(
            (product) => {
              const isOutOfStock = product.stock_count <= 0
              const discountRate = calcDiscountRate(product.original_price, product.sale_price)

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`group relative bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 ${isOutOfStock
                      ? 'opacity-75 grayscale pointer-events-none'
                      : 'hover:shadow-xl hover:shadow-slate-200/60 hover:border-primary-200'
                    }`}
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={800}
                        height={600}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${!isOutOfStock ? 'group-hover:scale-[1.07]' : ''
                          }`}
                      />
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-400">
                          {product.category?.name}
                        </p>
                      </div>
                    )}

                    {/* 글래스모피즘 오버레이 (hover 시) */}
                    {!isOutOfStock && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    {/* 품절 오버레이 */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="bg-slate-900/80 text-white text-sm font-bold px-6 py-2 rounded-full">
                          품절
                        </span>
                      </div>
                    )}

                    {/* 상품 뱃지 (좌상단) */}
                    {product.badge && !isOutOfStock && (
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

                    {/* 할인율 리본 (우상단) */}
                    {discountRate > 0 && !isOutOfStock && (
                      <div className="discount-ribbon">
                        {discountRate}% OFF
                      </div>
                    )}

                    {/* 장바구니 담기 버튼 (hover 시 슬라이드업) */}
                    {!isOutOfStock && (
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <div className="flex items-center justify-center gap-2 py-3 bg-primary-600/95 backdrop-blur-sm text-white text-sm font-semibold">
                          <ShoppingCart className="w-4 h-4" />
                          자세히 보기
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-xs text-primary-500 font-medium mb-1">
                      {product.category?.name}
                    </p>
                    <h3 className="font-bold text-navy-900 mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors leading-snug text-sm sm:text-base line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4 line-clamp-1 hidden sm:block">
                      {product.short_description}
                    </p>

                    <div className="flex items-end gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      {discountRate > 0 && (
                        <span className="text-sm sm:text-base font-black text-red-500">
                          {discountRate}%
                        </span>
                      )}
                      <span className="text-lg sm:text-2xl font-black text-navy-900">
                        {formatPrice(product.sale_price)}
                      </span>
                    </div>
                    {product.original_price > product.sale_price && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through block mb-2 sm:mb-3">
                        {formatPrice(product.original_price)}
                      </span>
                    )}

                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-400">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-accent-400 text-accent-400" />
                        <span>
                          {Number(product.review_avg) > 0
                            ? Number(product.review_avg).toFixed(1)
                            : '-'}
                        </span>
                        {product.review_count > 0 && (
                          <span className="hidden sm:inline">({product.review_count})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            }
          )}
        </div>
      )}
    </PageTransition>
  )
}
