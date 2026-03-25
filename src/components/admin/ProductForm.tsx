// src/components/admin/ProductForm.tsx
'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import type { Category, Product } from '@/types'
import { Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface ProductFormData {
  name: string
  slug: string
  category_id: string
  short_description: string
  description: string
  original_price: number
  sale_price: number
  image_url: string
  badge: string
  features: string
  license_type: 'permanent' | 'subscription'
  license_duration: string
  max_devices: number
  platform: 'windows' | 'mac' | 'both'
  status: 'active' | 'draft' | 'out_of_stock'
  is_featured: boolean
  sort_order: number
}

interface ProductFormProps {
  categories: Category[]
  initialData?: Product
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url ?? '')
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      category_id: initialData?.category_id ?? '',
      short_description: initialData?.short_description ?? '',
      description: initialData?.description ?? '',
      original_price: initialData?.original_price ?? 0,
      sale_price: initialData?.sale_price ?? 0,
      image_url: initialData?.image_url ?? '',
      badge: initialData?.badge ?? '',
      features: initialData?.features?.join('\n') ?? '',
      license_type: initialData?.license_type ?? 'permanent',
      license_duration: initialData?.license_duration ?? '',
      max_devices: initialData?.max_devices ?? 1,
      platform: initialData?.platform ?? 'windows',
      status: initialData?.status ?? 'active',
      is_featured: initialData?.is_featured ?? false,
      sort_order: initialData?.sort_order ?? 0,
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setValue('image_url', data.url)
        setImagePreview(data.url)
        toast('success', '이미지가 업로드되었습니다')
      } else {
        toast('error', data.error || '업로드 실패')
      }
    } catch {
      toast('error', '업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...(initialData ? { id: initialData.id } : {}),
        name: formData.name,
        slug: formData.slug,
        category_id: formData.category_id,
        short_description: formData.short_description,
        description: formData.description,
        original_price: Number(formData.original_price),
        sale_price: Number(formData.sale_price),
        image_url: formData.image_url || null,
        badge: formData.badge || null,
        features: formData.features.split('\n').filter(Boolean),
        options: initialData?.options ?? [],
        license_type: formData.license_type,
        license_duration: formData.license_duration || null,
        max_devices: Number(formData.max_devices),
        platform: formData.platform,
        status: formData.status,
        is_featured: formData.is_featured,
        sort_order: Number(formData.sort_order),
      }

      const res = await fetch('/api/admin/products', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        toast('success', initialData ? '상품이 수정되었습니다' : '상품이 등록되었습니다')
        router.push('/admin/products')
        router.refresh()
      } else {
        toast('error', data.error || '처리에 실패했습니다')
      }
    } catch {
      toast('error', '오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 자동 slug 생성
  const autoSlug = () => {
    const name = watch('name')
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setValue('slug', slug)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-navy-900 mb-6">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="상품명 *"
              {...register('name', { required: '상품명을 입력하세요' })}
              error={errors.name?.message}
              onBlur={autoSlug}
            />
          </div>
          <div>
            <Input
              label="슬러그 (URL) *"
              {...register('slug', { required: '슬러그를 입력하세요' })}
              error={errors.slug?.message}
              placeholder="windows-11-pro"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">카테고리 *</label>
            <select
              {...register('category_id', { required: '카테고리를 선택하세요' })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>
            )}
          </div>
          <div>
            <Input
              label="뱃지"
              {...register('badge')}
              placeholder="BEST, 할인, 신상품 등"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="짧은 설명 *"
              {...register('short_description', { required: '짧은 설명을 입력하세요' })}
              error={errors.short_description?.message}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-navy-800 mb-1.5">상세 설명 *</label>
            <textarea
              {...register('description', { required: '상세 설명을 입력하세요' })}
              rows={5}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-y"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 가격 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-navy-900 mb-6">가격</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="정가 (원) *"
            type="number"
            {...register('original_price', { required: true, min: 0 })}
          />
          <Input
            label="판매가 (원) *"
            type="number"
            {...register('sale_price', { required: true, min: 0 })}
          />
        </div>
      </div>

      {/* 이미지 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-navy-900 mb-6">상품 이미지</h2>
        <div className="flex items-start gap-6">
          {imagePreview ? (
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200">
              <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview('')
                  setValue('image_url', '')
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-400 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs text-slate-400">
                {uploading ? '업로드 중...' : '이미지 선택'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
          <input type="hidden" {...register('image_url')} />
        </div>
      </div>

      {/* 라이선스 정보 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-navy-900 mb-6">라이선스 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">라이선스 유형</label>
            <select
              {...register('license_type')}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="permanent">영구 라이선스</option>
              <option value="subscription">구독형</option>
            </select>
          </div>
          <Input
            label="라이선스 기간"
            {...register('license_duration')}
            placeholder="1년, 평생 등"
          />
          <Input
            label="최대 기기 수"
            type="number"
            {...register('max_devices', { min: 1 })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">플랫폼</label>
            <select
              {...register('platform')}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="windows">Windows</option>
              <option value="mac">Mac</option>
              <option value="both">Windows + Mac</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">상태</label>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="active">판매중</option>
              <option value="draft">숨김</option>
              <option value="out_of_stock">품절</option>
            </select>
          </div>
        </div>
      </div>

      {/* 추가 설정 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-navy-900 mb-6">추가 설정</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="정렬 순서"
            type="number"
            {...register('sort_order')}
          />
          <div className="flex items-center gap-3 pt-7">
            <input
              type="checkbox"
              id="is_featured"
              {...register('is_featured')}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-navy-800">
              인기 상품으로 표시 (메인 페이지 노출)
            </label>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-navy-800 mb-1.5">
            주요 특징 (줄바꿈으로 구분)
          </label>
          <textarea
            {...register('features')}
            rows={4}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-y"
            placeholder="정품 인증&#10;영구 사용&#10;무제한 업데이트"
          />
        </div>
      </div>

      {/* 제출 */}
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          {initialData ? '상품 수정' : '상품 등록'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
        >
          취소
        </Button>
      </div>
    </form>
  )
}
