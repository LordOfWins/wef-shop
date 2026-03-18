import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/server'
import { calcDiscountRate, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import {
  Check,
  Clock,
  Mail,
  Monitor,
  Package,
  Shield,
  Star,
  Truck,
} from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AddToCartButton } from './AddToCartButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) return { title: '상품을 찾을 수 없습니다' }

  return {
    title: product.name,
    description: product.short_description,
    openGraph: {
      title: `${product.name} | 위프 (WEEP)`,
      description: product.short_description,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const typedProduct = product as Product & {
    category: { name: string; slug: string }
  }

  const discountRate = calcDiscountRate(
    typedProduct.original_price,
    typedProduct.sale_price
  )

  const features: string[] =
    typeof typedProduct.features === 'string'
      ? JSON.parse(typedProduct.features)
      : Array.isArray(typedProduct.features)
        ? typedProduct.features
        : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <a href="/" className="hover:text-primary-500 transition-colors">홈</a>
        <span>/</span>
        <a href="/products" className="hover:text-primary-500 transition-colors">전체 상품</a>
        <span>/</span>
        <a
          href={`/category/${typedProduct.category?.slug}`}
          className="hover:text-primary-500 transition-colors"
        >
          {typedProduct.category?.name}
        </a>
        <span>/</span>
        <span className="text-navy-900 font-medium">{typedProduct.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* 좌측: 이미지 */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl aspect-square flex items-center justify-center">
          {typedProduct.image_url ? (
            <img
              src={typedProduct.image_url}
              alt={typedProduct.name}
              className="max-w-[80%] max-h-[80%] object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-primary-500" />
              </div>
              <p className="text-lg font-medium text-slate-400">
                {typedProduct.category?.name}
              </p>
              <p className="text-sm text-slate-300 mt-1">Digital License</p>
            </div>
          )}
        </div>

        {/* 우측: 상품 정보 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            {typedProduct.badge && (
              <Badge
                variant={
                  typedProduct.badge === 'BEST'
                    ? 'best'
                    : typedProduct.badge === 'HOT'
                      ? 'sale'
                      : 'timesale'
                }
              >
                {typedProduct.badge}
              </Badge>
            )}
            {typedProduct.license_type === 'permanent' ? (
              <Badge variant="success">영구 라이선스</Badge>
            ) : (
              <Badge variant="default">
                {typedProduct.license_duration} 사용권
              </Badge>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-2 leading-tight">
            {typedProduct.name}
          </h1>
          <p className="text-slate-500 mb-6">{typedProduct.short_description}</p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              {discountRate > 0 && (
                <span className="text-3xl font-black text-red-500">
                  {discountRate}%
                </span>
              )}
              <span className="text-3xl font-black text-navy-900">
                {formatPrice(typedProduct.sale_price)}
              </span>
            </div>
            {typedProduct.original_price > typedProduct.sale_price && (
              <p className="text-sm text-slate-400 line-through">
                정가 {formatPrice(typedProduct.original_price)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Truck className="w-4 h-4 text-primary-500 shrink-0" />
              이메일 즉시 발송
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-primary-500 shrink-0" />
              5분 내 자동 발송
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-primary-500 shrink-0" />
              100% 정품 보증
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Monitor className="w-4 h-4 text-primary-500 shrink-0" />
              {typedProduct.max_devices}대 사용 가능
            </div>
          </div>

          <AddToCartButton product={typedProduct} />

          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="font-bold text-navy-900 mb-4">제품 특징</h3>
            <ul className="space-y-3">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {typedProduct.review_count > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-accent-400 text-accent-400" />
                <span className="font-bold text-navy-900">
                  {Number(typedProduct.review_avg).toFixed(1)}
                </span>
                <span className="text-sm text-slate-400">
                  ({typedProduct.review_count}개 후기)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상세 설명 */}
      <div className="mt-12 lg:mt-16">
        <div className="border-b border-slate-200 mb-8">
          <h2 className="inline-block pb-4 border-b-2 border-primary-600 font-bold text-navy-900 text-lg">
            상세 정보
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <div className="flex items-start gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-bold text-navy-900 mb-1">배송 안내</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                배송방법: 이메일 발송 / 배송비: 무료 / 소요시간: 결제 완료 후 5분 내 자동 발송
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
            {typedProduct.description}
          </p>

          <div className="mt-8 bg-amber-50 rounded-xl p-6">
            <h4 className="font-bold text-amber-800 mb-3">유의 사항</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• 제품키 발송 후에는 제품 특성상 교환/환불이 제한됩니다</li>
              <li>• 기술적 문제 발생 시 90일 이내 무상 A/S 지원</li>
              <li>• 제품키는 수령 후 20일 이내 사용을 권장합니다</li>
              <li>• 입력하신 이메일 주소가 정확해야 정상 발송됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
