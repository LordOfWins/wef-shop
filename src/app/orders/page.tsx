import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { FileText, ShoppingBag } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '주문내역 | WEF',
  description: '주문 내역을 확인하세요',
};

// 주문 상태 뱃지 매핑
function getStatusBadge(status: string) {
  switch (status) {
    case 'paid':
      return <Badge variant="best">결제완료</Badge>;
    case 'delivered':
      return <Badge variant="success">발급완료</Badge>;
    case 'cancelled':
      return <Badge variant="danger">취소됨</Badge>;
    case 'refunded':
      return <Badge variant="sale">환불됨</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/orders');
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">주문내역</h1>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <FileText className="w-16 h-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600">
            주문 내역이 없습니다
          </h2>
          <Link href="/products">
            <Button variant="primary">
              <ShoppingBag className="w-4 h-4 mr-2" />
              상품 보러가기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
