import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { ArrowLeft, Key, Mail } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import ResendEmailButton from './ResendEmailButton';

export const metadata: Metadata = {
  title: '주문 상세 | WEF',
  description: '주문 상세 정보를 확인하세요',
};

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/orders');
  }

  // 주문 조회
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!order) {
    notFound();
  }

  // 주문 아이템 조회
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  // 라이선스 키 조회 (delivered 상태일 때만)
  let licenseKeys: any[] = [];
  if (order.status === 'delivered' || order.status === 'paid') {
    const { data: keys } = await supabase
      .from('license_keys')
      .select('*, products:product_id(name)')
      .eq('order_id', order.id)
      .eq('status', 'sold');

    licenseKeys = keys || [];
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        주문내역으로 돌아가기
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">주문 상세</h1>
        {getStatusBadge(order.status)}
      </div>

      {/* 주문 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">주문 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500 block">주문번호</span>
            <span className="text-sm font-medium">{order.order_number}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">주문일시</span>
            <span className="text-sm font-medium">
              {formatDateTime(order.created_at)}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">결제 금액</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(order.total_amount)}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500 block">결제 수단</span>
            <span className="text-sm font-medium">
              {order.payment_method || '카드'}
            </span>
          </div>
        </div>
      </div>

      {/* 주문 상품 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
        <div className="space-y-3">
          {orderItems?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <span className="font-medium text-gray-900">
                  {item.product_name}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  x {item.quantity}
                </span>
              </div>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 라이선스 키 */}
      {licenseKeys.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">라이선스 키</h2>
          </div>
          <div className="space-y-3">
            {licenseKeys.map((key) => (
              <div
                key={key.id}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <span className="text-xs text-gray-500 block mb-1">
                  {key.products?.name || '상품'}
                </span>
                <span className="font-mono text-sm font-semibold text-blue-800 break-all">
                  {key.license_key}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 이메일 재발송 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              이메일 발송 상태:{' '}
              {order.email_sent ? (
                <Badge variant="success">발송완료</Badge>
              ) : (
                <Badge variant="default">미발송</Badge>
              )}
            </span>
          </div>
          <ResendEmailButton orderId={order.id} />
        </div>
      </div>
    </main>
  );
}
