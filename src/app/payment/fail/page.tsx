'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { RefreshCw, ShoppingCart, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'UNKNOWN';
  const message =
    searchParams.get('message') || '결제 처리 중 문제가 발생했습니다';

  return (
    <main className="container mx-auto px-4 py-20 max-w-lg min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="bg-red-50 rounded-full p-4 inline-block mb-6">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          결제에 실패했습니다
        </h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">에러 코드</span>
              <span className="text-sm font-mono text-red-600">{code}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">
                실패 사유
              </span>
              <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">
                {decodeURIComponent(message)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link href="/checkout">
            <Button variant="primary" className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 결제하기
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" className="w-full sm:w-auto">
              <ShoppingCart className="w-4 h-4 mr-2" />
              장바구니로 이동
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
