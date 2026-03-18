import { sendLicenseEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: '주문 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // 로그인 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 주문 조회 (본인 주문만)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: '주문을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 라이선스 키 조회
    const { data: licenseKeys } = await supabaseAdmin
      .from('license_keys')
      .select('*, products:product_id(name)')
      .eq('order_id', orderId)
      .eq('status', 'sold');

    if (!licenseKeys || licenseKeys.length === 0) {
      return NextResponse.json(
        { success: false, message: '발급된 라이선스 키가 없습니다' },
        { status: 400 }
      );
    }

    // 상품별 라이선스 키 그룹핑
    const itemsMap = new Map<string, string[]>();
    for (const key of licenseKeys) {
      const productName = key.products?.name || '상품';
      if (!itemsMap.has(productName)) {
        itemsMap.set(productName, []);
      }
      itemsMap.get(productName)!.push(key.license_key);
    }

    const emailItems = Array.from(itemsMap.entries()).map(
      ([productName, keys]) => ({
        productName,
        licenseKeys: keys,
      })
    );

    // 이메일 발송
    await sendLicenseEmail({
      to: user.email!,
      orderNumber: order.order_number,
      items: emailItems,
    });

    // email_sent 업데이트
    await supabaseAdmin
      .from('orders')
      .update({ email_sent: true })
      .eq('id', orderId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('이메일 재발송 실패:', error);
    return NextResponse.json(
      { success: false, message: '이메일 발송에 실패했습니다' },
      { status: 500 }
    );
  }
}
