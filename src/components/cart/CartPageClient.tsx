'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StepIndicator } from '@/components/checkout/StepIndicator'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/store/cartStore'
import { useCartStore } from '@/store/cartStore'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Tag,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CartPageClient() {
  const router = useRouter()
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <StepIndicator currentStep={1} />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          {/* 애니메이션 빈 장바구니 아이콘 */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center"
          >
            <ShoppingBag className="w-12 h-12 text-slate-300" />
          </motion.div>
          <h2 className="text-xl font-semibold text-slate-600">
            장바구니가 비어있습니다
          </h2>
          <p className="text-slate-400">마음에 드는 상품을 담아보세요</p>
          <Link href="/products">
            <Button variant="primary" size="lg">
              상품 보러가기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      <StepIndicator currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 장바구니 상품 목록 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              장바구니{' '}
              <span className="text-primary-600 ml-1">{getTotalItems()}개</span>
            </h2>
            <Button variant="ghost" size="sm" onClick={clearCart}>
              <Trash2 className="w-4 h-4 mr-1" />
              전체 삭제
            </Button>
          </div>

          <AnimatePresence>
            {items.map((item: CartItem) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  {/* 상품 이미지 */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-navy-900 truncate">
                      {item.product.name}
                    </h3>
                    {item.product.original_price > item.product.sale_price && (
                      <p className="text-xs text-slate-400 line-through mt-0.5">
                        {formatPrice(item.product.original_price)}
                      </p>
                    )}
                    <p className="text-primary-600 font-semibold mt-1">
                      {formatPrice(item.product.sale_price)}
                    </p>

                    {/* 수량 조절 + 삭제 */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value)
                            if (val >= 1 && val <= 99) {
                              updateQuantity(item.product.id, val)
                            }
                          }}
                          className="w-16 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.min(99, item.quantity + 1)
                            )
                          }
                          disabled={item.quantity >= 99}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-navy-800">
                          {formatPrice(item.product.sale_price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.product.id)}
                          className="text-slate-400 hover:text-red-500 w-8 h-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4">주문 요약</h3>

            <div className="space-y-3 mb-6">
              {items.map((item: CartItem) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-slate-600 truncate mr-2">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="text-navy-900 font-medium flex-shrink-0">
                    {formatPrice(item.product.sale_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* 쿠폰 입력 UI */}
            <div className="mb-6">
              {!couponOpen ? (
                <button
                  onClick={() => setCouponOpen(true)}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors cursor-pointer"
                >
                  <Tag className="w-4 h-4" />
                  쿠폰 코드 입력
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="쿠폰 코드 입력"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="text-sm pr-8"
                      />
                      {couponCode && (
                        <button
                          onClick={() => setCouponCode('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-[42px]"
                      onClick={() => {
                        // 추후 쿠폰 적용 로직
                      }}
                    >
                      적용
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    쿠폰 기능은 곧 제공될 예정입니다
                  </p>
                </motion.div>
              )}
            </div>

            <hr className="border-slate-200 mb-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-semibold">총 결제 금액</span>
              <span className="text-xl font-bold text-primary-600">
                {formatPrice(getTotalPrice())}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/checkout')}
            >
              결제하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
