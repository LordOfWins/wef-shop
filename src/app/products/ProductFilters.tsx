'use client'

import { cn } from '@/lib/utils'
import type { Category } from '@/types'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface ProductFiltersProps {
  categories: Category[]
  currentCategory?: string
  currentSort?: string
  currentQuery?: string
}

const sortOptions = [
  { value: '', label: '기본 정렬' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '최신순' },
]

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
  currentQuery,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentQuery ?? '')

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/products?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams('q', searchValue)
  }

  return (
    <div className="space-y-4">
      {/* 검색 + 정렬 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="상품명 검색..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </form>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={currentSort ?? ''}
            onChange={(e) => updateParams('sort', e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 카테고리 필터 칩 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams('category', '')}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer',
            !currentCategory
              ? 'bg-primary-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParams('category', cat.slug)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer',
              currentCategory === cat.slug
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
