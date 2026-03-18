import CheckoutForm from '@/components/checkout/CheckoutForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '결제하기 | WEEP',
  description: '소프트웨어 라이선스 결제를 진행합니다',
};

export default function CheckoutPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">결제하기</h1>
      <CheckoutForm />
    </main>
  );
}
