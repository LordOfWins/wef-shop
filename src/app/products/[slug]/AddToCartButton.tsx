'use client'

import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cartStore'
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
    <div className="flex gap-3">
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
  )
}
