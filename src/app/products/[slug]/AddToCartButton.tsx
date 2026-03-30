'use client'

import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { Check, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      {/* 데스크톱 버튼 */}
      <div className="hidden sm:flex gap-3">
        <Button
          size="lg"
          className="flex-1 text-base"
          onClick={handleAdd}
          disabled={added}
        >
          {added ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              담았습니다!
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              장바구니 담기
            </>
          )}
        </Button>
      </div>

      {/* 모바일 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate">{product.name}</p>
            <p className="text-lg font-black text-navy-900">
              {formatPrice(product.sale_price)}
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 px-6"
            onClick={handleAdd}
            disabled={added}
          >
            {added ? (
              <>
                <Check className="w-5 h-5 mr-1" />
                담음
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-1" />
                담기
              </>
            )}
          </Button>
        </div>
      </div>
      {/* 모바일 바 높이만큼 여백 */}
      <div className="h-20 sm:hidden" />
    </>
  )
}
