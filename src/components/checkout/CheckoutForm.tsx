'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import {
  ANONYMOUS,
  loadTossPayments,
  TossPaymentsWidgets,
} from '@tosspayments/tosspayments-sdk';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';

// Zod 스키마 (비회원용)
const guestSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상 입력해 주세요'),
  email: z.string().email('올바른 이메일을 입력해 주세요'),
});

type GuestFormValues = z.infer<typeof guestSchema>;

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function CheckoutForm() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { items, getTotalPrice, getTotalItems } = useCartStore();

  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  // 비회원 폼
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<GuestFormValues>({
    defaultValues: {
      name: profile?.full_name || '',
      email: user?.email || '',
    },
  });

  const totalAmount = getTotalPrice();

  // 장바구니 비었으면 리다이렉트
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items, router]);

  // 토스 결제위젯 초기화
  useEffect(() => {
    if (items.length === 0) return;

    async function initWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 회원이면 user.id를 customerKey로 / 비회원이면 ANONYMOUS
        const customerKey = user?.id || ANONYMOUS;

        const w = tossPayments.widgets({
          customerKey: customerKey === ANONYMOUS ? ANONYMOUS : customerKey,
        });

        setWidgets(w);
      } catch (error) {
        console.error('토스페이먼츠 초기화 실패:', error);
      }
    }

    initWidgets();
  }, [user, items.length]);

  // 결제위젯 렌더링
  useEffect(() => {
    if (!widgets || items.length === 0) return;

    async function renderWidgets() {
      try {
        // 금액 설정 (renderPaymentMethods보다 반드시 선행)
        await widgets!.setAmount({
          currency: 'KRW',
          value: totalAmount,
        });

        // 결제 UI 렌더링
        await widgets!.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        });

        // 약관 UI 렌더링
        await widgets!.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        });

        setReady(true);
      } catch (error) {
        console.error('결제위젯 렌더링 실패:', error);
      }
    }

    renderWidgets();
  }, [widgets, totalAmount, items.length]);

  // 금액 변경 시 업데이트
  useEffect(() => {
    if (widgets && ready) {
      widgets.setAmount({
        currency: 'KRW',
        value: totalAmount,
      });
    }
  }, [totalAmount, widgets, ready]);

  // 결제 요청
  const handlePayment = async (formData?: GuestFormValues) => {
    if (!widgets || !ready) return;

    setIsProcessing(true);

    try {
      const customerName = user ? profile?.full_name || '회원' : formData?.name || '';
      const customerEmail = user ? user.email || '' : formData?.email || '';
      const orderId = generateOrderNumber();

      // 주문명 생성
      const firstItem = items[0]?.name || '상품';
      const orderName =
        items.length > 1
          ? `${firstItem} 외 ${items.length - 1}건`
          : firstItem;

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

      await widgets.requestPayment({
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl: `${baseUrl}/api/payments/confirm?customerName=${encodeURIComponent(customerName)}&customerEmail=${encodeURIComponent(customerEmail)}`,
        failUrl: `${baseUrl}/payment/fail`,
      });
    } catch (error: any) {
      // 사용자 취소는 에러가 아님
      if (error?.code !== 'USER_CANCEL') {
        console.error('결제 요청 실패:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 좌측: 주문 정보 + 결제위젯 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 주문자 정보 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">주문자 정보</h2>
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16">이름</span>
                <span className="text-sm font-medium">
                  {profile?.full_name || '회원'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-16">이메일</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ※ 라이선스 키가 위 이메일로 발송됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <Input
                  {...register('name')}
                  placeholder="주문자 이름"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="라이선스 키를 받을 이메일"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400">
                ※ 라이선스 키가 위 이메일로 발송됩니다
              </p>
            </div>
          )}
        </div>

        {/* 토스 결제위젯 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">결제 수단</h2>
          <div id="payment-method" ref={paymentMethodRef} />
          <div id="agreement" ref={agreementRef} className="mt-4" />
        </div>
      </div>

      {/* 우측: 주문 요약 + 결제 버튼 */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
          <h3 className="text-lg font-semibold mb-4">주문 요약</h3>

          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
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
              {formatPrice(totalAmount)}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!ready || isProcessing}
            isLoading={isProcessing}
            onClick={() => {
              if (user) {
                handlePayment();
              } else {
                handleSubmit((data) => handlePayment(data))();
              }
            }}
          >
            <Lock className="w-4 h-4 mr-2" />
            {formatPrice(totalAmount)} 결제하기
          </Button>

          <Link
            href="/cart"
            className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            <ArrowLeft className="w-3 h-3" />
            장바구니로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
