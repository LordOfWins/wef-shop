import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import { calcDiscountRate, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { Package, ShoppingCart, Star } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) return { title: '카테고리를 찾을 수 없습니다' }

  return {
    title: category.name,
    description:
      category.description ??
      `WEF ${category.name}  라이선스를 최저가로 구매하세요`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', category.id)
    .eq('status', 'active')
    .order('sort_order')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <a href="/" className="hover:text-primary-500 transition-colors">홈</a>
          <span>/</span>
          <a href="/products" className="hover:text-primary-500 transition-colors">전체 상품</a>
          <span>/</span>
          <span className="text-navy-900 font-medium">{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-navy-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-slate-500">{category.description}</p>
        )}
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-500">
            아직 등록된 상품이 없습니다
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(products as (Product & { category: { name: string; slug: string } })[]).map(
            (product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
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
