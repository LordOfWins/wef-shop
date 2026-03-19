import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'
import { calcDiscountRate, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import {
  ArrowRight,
  Award,
  Package,
  Shield,
  ShoppingCart,
  Star,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('sort_order')
    .limit(3)

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-primary-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-primary-300 mb-8">
              <Zap className="w-4 h-4" />
              결제 완료 후 5분 내 즉시 발송
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              정품 라이선스를
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                최저가
              </span>
              로 만나보세요
            </h1>

            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
              Windows 10/11 · MS Office 전 시리즈
              <br />
              100% 정품 제품키 · 즉시 이메일 발송 · 영구 보증
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  상품 보러가기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/reviews">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 border-white/30 text-white hover:bg-white/10"
                >
                  구매후기 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 신뢰 배지 */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-navy-900">100% 정품 보증</p>
                <p className="text-sm text-slate-500">Microsoft 공식 라이선스</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <p className="font-bold text-navy-900">5분 내 즉시 발송</p>
                <p className="text-sm text-slate-500">결제 즉시 이메일 자동 발송</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-end">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-navy-900">영구 사용 가능</p>
                <p className="text-sm text-slate-500">기간 제한 없는 영구 라이선스</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 인기 상품 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-3">인기 상품</h2>
            <p className="text-slate-500">가장 많이 찾는 정품 라이선스</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts && featuredProducts.length > 0
              ? (
                featuredProducts as (Product & {
                  category: { name: string; slug: string }
                })[]
              ).map((product) => (
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
                        priority
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
                          {calcDiscountRate(
                            product.original_price,
                            product.sale_price
                          )}
                          %
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
              ))
              : [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-6"
                >
                  <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/products">
              <Button variant="outline" size="lg" className="px-8">
                전체 상품 보기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
