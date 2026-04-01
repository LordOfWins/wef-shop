import CartPageClient from '@/components/cart/CartPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '장바구니 | WEF',
  description: '장바구니에 담긴 소프트웨어 라이선스를 확인하세요',
};

export default function CartPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">장바구니</h1>
      <CartPageClient />
    </main>
  );
}
