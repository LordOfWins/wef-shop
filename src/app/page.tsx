import { ReviewCarousel } from '@/components/home/ReviewCarousel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { createClient } from '@/lib/supabase/server'
import { calcDiscountRate, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import {
  ArrowRight,
  Award,
  CheckCircle,
  Headphones,
  Package,
  Shield,
  ShoppingCart,
  Star,
  Zap
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: featuredProducts }, { data: recentReviews }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('sort_order')
      .limit(3),
    supabase
      .from('reviews')
      .select('id, author_name, rating, content, created_at, products:product_id(name)')
      .eq('is_visible', true)
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // 리뷰 데이터 정규화
  const reviewsForCarousel = (recentReviews ?? []).map((r: any) => ({
    id: r.id,
    author_name: r.author_name,
    rating: r.rating,
    content: r.content,
    created_at: r.created_at,
    product_name: r.products?.name ?? undefined,
  }))

  return (
    <div>
      {/* ─────────────────────────────────────────
          히어로 섹션
          ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-primary-900">
        {/* 그리드 + 도트 패턴 레이어 */}
        <div className="absolute inset-0 hero-grid-pattern" />
        <div className="absolute inset-0 hero-dot-pattern" />

        {/* 그라데이션 오브 (기존 + 미세하게 움직임) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl animate-shimmer-slow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl animate-shimmer-slow-reverse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-primary-300 mb-8">
              <Zap className="w-4 h-4" />
              결제 완료 후 5분 내 즉시 발송
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              소프트웨어 라이선스를
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                최저가
              </span>
              로 만나보세요
            </h1>

            <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
              Windows 10/11 · MS Office 전 시리즈
              <br />
              정식 라이선스 제품키 · 즉시 이메일 발송 · 영구 보증
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

            {/* 히어로 하단 수치 */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-md mx-auto">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">5분</p>
                <p className="text-xs text-slate-400 mt-1">평균 발송시간</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">100%</p>
                <p className="text-xs text-slate-400 mt-1">정품 보증</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">4.9</p>
                <p className="text-xs text-slate-400 mt-1">고객 만족도</p>
              </div>
            </div>
          </div>
        </div>

        {/* 히어로 하단 곡선 디바이더 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
            <path d="M0 56h1440V28C1440 28 1140 0 720 0S0 28 0 28v28z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          신뢰 배지 (Framer Motion hover는 클라이언트 래퍼 불필요 — CSS로 대체)
          ───────────────────────────────────────── */}
      <ScrollReveal>
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  iconBg: 'bg-primary-50',
                  iconColor: 'text-primary-600',
                  title: '정식 라이선스 보증',
                  desc: '정식 라이선스 제품키',
                },
                {
                  icon: Zap,
                  iconBg: 'bg-accent-50',
                  iconColor: 'text-accent-600',
                  title: '5분 내 즉시 발송',
                  desc: '결제 즉시 이메일 자동 발송',
                },
                {
                  icon: Award,
                  iconBg: 'bg-emerald-50',
                  iconColor: 'text-emerald-600',
                  title: '영구 사용 가능',
                  desc: '기간 제한 없는 영구 라이선스',
                },
              ].map((badge) => {
                const Icon = badge.icon
                return (
                  <div
                    key={badge.title}
                    className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 cursor-default"
                  >
                    <div
                      className={`w-12 h-12 ${badge.iconBg} rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`w-6 h-6 ${badge.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-navy-900">{badge.title}</p>
                      <p className="text-sm text-slate-500">{badge.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>
      {/* ─────────────────────────────────────────
          인기 상품
          ───────────────────────────────────────── */}
      <ScrollReveal>
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-2">
                Best Sellers
              </p>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">인기 상품</h2>
              <p className="text-slate-500">가장 많이 찾는 소프트웨어 라이선스</p>
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
                    className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:border-primary-200 transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={800}
                          height={600}
                          priority
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
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

                      {/* 글래스모피즘 오버레이 (hover 시) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                        <div className="flex items-center gap-1 text-sm text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          자세히 보기
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
      </ScrollReveal>
      {/* ─────────────────────────────────────────
          고객 리뷰 하이라이트
          ───────────────────────────────────────── */}
      {reviewsForCarousel.length > 0 && (
        <ScrollReveal>
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-2">
                  Reviews
                </p>
                <h2 className="text-3xl font-bold text-navy-900 mb-3">
                  고객 리뷰 하이라이트
                </h2>
                <p className="text-slate-500">
                  실제 구매 고객님들의 생생한 후기입니다
                </p>
              </div>

              <ReviewCarousel reviews={reviewsForCarousel} />

              <div className="text-center mt-10">
                <Link href="/reviews">
                  <Button variant="ghost" className="text-primary-600">
                    전체 리뷰 보기
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ─────────────────────────────────────────
          왜 WEF인가 (추가 신뢰 섹션)
          ───────────────────────────────────────── */}
      <ScrollReveal>
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-2">
                Why WEF?
              </p>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                왜 WEF일까요?
              </h2>
              <p className="text-slate-500">
                고객님의 소중한 시간과 비용을 아껴드립니다
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Zap,
                  title: '초고속 발송',
                  desc: '결제 완료 후 평균 5분 이내 제품키를 이메일로 자동 발송합니다.',
                  iconBg: 'bg-primary-50',
                  iconColor: 'text-primary-600',
                },
                {
                  icon: Shield,
                  title: '정품 100% 보증',
                  desc: '모든 제품키는 정품 인증 가능한 정식 라이선스입니다.',
                  iconBg: 'bg-emerald-50',
                  iconColor: 'text-emerald-600',
                },
                {
                  icon: Headphones,
                  title: '친절한 고객지원',
                  desc: '설치부터 인증까지, 어려움이 있으시면 언제든 도움을 드립니다.',
                  iconBg: 'bg-violet-50',
                  iconColor: 'text-violet-600',
                },
                {
                  icon: CheckCircle,
                  title: '최저가 보장',
                  desc: '불필요한 중간 유통 없이, 합리적인 가격으로 제공합니다.',
                  iconBg: 'bg-accent-50',
                  iconColor: 'text-accent-600',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="group text-center p-6 rounded-2xl bg-white border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
                  >
                    <div
                      className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>
      {/* ─────────────────────────────────────────
          CTA 배너 — 지금 시작하세요
          ───────────────────────────────────────── */}
      <ScrollReveal>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-navy-900 px-8 py-16 sm:px-16 sm:py-20 text-center">
              {/* 배경 패턴 */}
              <div className="absolute inset-0 hero-grid-pattern opacity-50" />
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-300 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  지금 시작하세요
                </h2>
                <p className="text-primary-100 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                  검증된 정품 라이선스를 최저가에 만나보세요.
                  <br className="hidden sm:block" />
                  결제 즉시 이메일로 제품키가 발송됩니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto text-base px-10 bg-white text-primary-700 hover:bg-slate-50 shadow-lg"
                    >
                      상품 보러가기
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto text-base px-10 border-white/30 text-white hover:bg-white/10"
                    >
                      자주 묻는 질문
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  )
}
