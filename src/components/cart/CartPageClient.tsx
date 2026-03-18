'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPageClient() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-600">
          장바구니가 비어있습니다
        </h2>
        <p className="text-gray-400">마음에 드는 상품을 담아보세요</p>
        <Link href="/products">
          <Button variant="primary" size="lg">
            상품 보러가기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 장바구니 상품 목록 */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            장바구니 <Badge variant="primary">{getTotalItems()}개</Badge>
          </h2>
          <Button variant="ghost" size="sm" onClick={clearCart}>
            <Trash2 className="w-4 h-4 mr-1" />
            전체 삭제
          </Button>
        </div>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex gap-4">
                {/* 상품 이미지 */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>
                  {item.option && (
                    <p className="text-sm text-gray-500 mt-1">{item.option}</p>
                  )}
                  <p className="text-primary font-semibold mt-2">
                    {formatPrice(item.price)}
                  </p>

                  {/* 수량 조절 + 삭제 */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
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
                          const val = parseInt(e.target.value);
                          if (val >= 1 && val <= 99) {
                            updateQuantity(item.id, val);
                          }
                        }}
                        className="w-14 h-8 text-center text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, Math.min(99, item.quantity + 1))
                        }
                        disabled={item.quantity >= 99}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 w-8 h-8 p-0"
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
          <h3 className="text-lg font-semibold mb-4">주문 요약</h3>

          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate mr-2">
                  {item.name} x {item.quantity}
                </span>
                <span className="text-gray-900 font-medium flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-gray-200 mb-4" />

          <div className="flex justify-between items-center mb-6">
            <span className="text-base font-semibold">총 결제 금액</span>
            <span className="text-xl font-bold text-primary">
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
  );
}
