'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Loader2, Mail, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, clearCart } = useCartStore();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const confirmCalled = useRef(false);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const customerName = searchParams.get('customerName') || '';
  const customerEmail = searchParams.get('customerEmail') || '';

  useEffect(() => {
    // 중복 호출 방지
    if (confirmCalled.current) return;
    if (!paymentKey || !orderId || !amount) return;

    confirmCalled.current = true;

    async function confirmOrder() {
      try {
        // localStorage에서 카트 아이템 가져오기
        const cartData = localStorage.getItem('dewif-cart');
        let cartItems: any[] = [];

        if (cartData) {
          try {
            const parsed = JSON.parse(cartData);
            cartItems = parsed.state?.items || [];
          } catch {
            cartItems = [];
          }
        }

        // 현재 store에 있는 items가 있으면 우선 사용
        const finalItems = items.length > 0 ? items : cartItems;

        if (finalItems.length === 0) {
          setStatus('error');
          setErrorMessage('장바구니 정보를 찾을 수 없습니다');
          return;
        }

        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            customerName,
            customerEmail,
            cartItems: finalItems.map((item: any) => ({
              productId: item.productId || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          }),
        });

        const data = await res.json();

        if (data.success) {
          setOrderNumber(data.orderNumber);
          setStatus('success');
          // 결제 성공 후 장바구니 비우기
          clearCart();
        } else {
          setStatus('error');
          setErrorMessage(data.message || '결제 처리 중 문제가 발생했습니다');
        }
      } catch (error: any) {
        console.error('결제 확인 실패:', error);
        setStatus('error');
        setErrorMessage('서버와의 통신 중 문제가 발생했습니다');
      }
    }

    confirmOrder();
  }, [paymentKey, orderId, amount, customerName, customerEmail, items, clearCart]);

  // 처리 중
  if (status === 'processing') {
    return (
      <main className="container mx-auto px-4 py-20 max-w-lg min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">
          결제를 처리하고 있습니다
        </h1>
        <p className="text-gray-500 text-sm">잠시만 기다려 주세요</p>
      </main>
    );
  }

  // 에러
  if (status === 'error') {
    return (
      <main className="container mx-auto px-4 py-20 max-w-lg min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-50 rounded-full p-4 mb-6">
          <FileText className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">
          결제 처리 중 문제가 발생했습니다
        </h1>
        <p className="text-gray-500 text-sm mb-8">{errorMessage}</p>
        <div className="flex gap-3">
          <Link href="/cart">
            <Button variant="outline">장바구니로 이동</Button>
          </Link>
          <Link href="/">
            <Button variant="primary">홈으로 이동</Button>
          </Link>
        </div>
      </main>
    );
  }

  // 성공
  return (
    <main className="container mx-auto px-4 py-20 max-w-lg min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="bg-green-50 rounded-full p-4 inline-block mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          결제가 완료되었습니다!
        </h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">주문번호</span>
              <Badge variant="primary">{orderNumber}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">결제 금액</span>
              <span className="font-semibold">
                {Number(amount).toLocaleString()}원
              </span>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4">
            <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                라이선스 키가 이메일로 발송되었습니다
              </p>
              <p className="text-xs text-gray-500 mt-1">
                이메일이 도착하지 않았다면 스팸 폴더를 확인해 주세요
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link href="/orders">
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              주문 내역 보기
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="primary" className="w-full sm:w-auto">
              <ShoppingBag className="w-4 h-4 mr-2" />
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
