import { sendLicenseEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';
import { cancelPayment, confirmPayment } from '@/lib/toss';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabase Admin (service_role — RLS 우회)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const customerName = searchParams.get('customerName') || '';
  const customerEmail = searchParams.get('customerEmail') || '';

  // 필수 파라미터 검증
  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(
      new URL(
        `/payment/fail?code=INVALID_PARAMS&message=${encodeURIComponent('결제 정보가 올바르지 않습니다')}`,
        request.nextUrl.origin
      )
    );
  }

  const parsedAmount = Number(amount);

  try {
    // 1) 토스 결제 승인 API 호출
    const tossResult = await confirmPayment({
      paymentKey,
      orderId,
      amount: parsedAmount,
    });

    // 2) 현재 로그인 사용자 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 이메일 결정: 로그인 -> user.email / 비회원 -> customerEmail
    const emailTo = user?.email || customerEmail;

    // 3) 장바구니 데이터 복원 (클라이언트에서 localStorage로 관리)
    // => successUrl로 redirect되므로 서버에서 cart 접근 불가
    // => orderId에 매핑된 cart를 미리 저장하거나 메타데이터 활용
    // => 간단한 방법: tossResult.orderName + amount로 처리하되
    //    실무에서는 결제 전 서버에 임시 주문 저장 권장
    //
    // 여기서는 토스 결과의 메타데이터와 별도 로직 사용

    // 4) orders 테이블 INSERT
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderId,
        user_id: user?.id || null,
        guest_email: user ? null : customerEmail,
        guest_name: user ? null : customerName,
        total_amount: parsedAmount,
        toss_payment_key: paymentKey,
        toss_order_id: orderId,
        status: 'paid',
        payment_method: tossResult.method || 'card',
        email_sent: false,
      })
      .select()
      .single();

    if (orderError) {
      console.error('주문 생성 실패:', orderError);
      // 결제는 성공했으나 주문 생성 실패 -> 결제 취소
      await cancelPayment(paymentKey, '주문 생성 실패로 인한 자동 취소');
      return NextResponse.redirect(
        new URL(
          `/payment/fail?code=ORDER_CREATE_FAILED&message=${encodeURIComponent('주문 생성에 실패했습니다')}`,
          request.nextUrl.origin
        )
      );
    }

    // 5) 임시 주문 아이템에서 상품 정보 조회
    //    결제 전에 pending_orders 테이블에 저장하거나
    //    메타데이터에서 cart 정보를 가져와야 함
    //    => 실용적 해법: 클라이언트가 checkout 시 pending_order_items를 미리 저장
    //    => 현 구현: cart를 쿠키/세션으로 전달할 수 없으므로
    //       결제 전 pre-order API를 추가하거나
    //       메타데이터 방식 사용

    // *** 중요: 결제 전 카트 아이템을 서버에 저장하는 별도 플로우가 필요 ***
    // 아래는 pending_order_items 테이블이 있다고 가정하는 대안 대신
    // confirm에서 POST 방식으로 전환하여 cart 데이터를 받는 방식 채택

    // => 실제로는 successUrl redirect이므로 GET으로 옴
    // => 해결: successUrl 페이지에서 confirm API를 POST로 호출

    // 이 파일은 GET redirect 핸들러이므로 /payment/success로 넘긴 후
    // 클라이언트에서 POST confirm을 호출하도록 변경

    return NextResponse.redirect(
      new URL(
        `/payment/success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}&customerName=${encodeURIComponent(customerName)}&customerEmail=${encodeURIComponent(customerEmail)}`,
        request.nextUrl.origin
      )
    );
  } catch (error: any) {
    console.error('결제 승인 실패:', error);
    return NextResponse.redirect(
      new URL(
        `/payment/fail?code=CONFIRM_FAILED&message=${encodeURIComponent(error.message || '결제 승인에 실패했습니다')}`,
        request.nextUrl.origin
      )
    );
  }
}

// POST: 클라이언트에서 confirm 호출 (장바구니 데이터 포함)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentKey,
      orderId,
      amount,
      customerName,
      customerEmail,
      cartItems,
    } = body;

    // 필수값 검증
    if (!paymentKey || !orderId || !amount || !cartItems?.length) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);

    // 1) 토스 결제 승인
    const tossResult = await confirmPayment({
      paymentKey,
      orderId,
      amount: parsedAmount,
    });

    // 2) 현재 로그인 사용자 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const emailTo = user?.email || customerEmail;

    // 3) orders INSERT
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderId,
        user_id: user?.id || null,
        guest_email: user ? null : customerEmail,
        guest_name: user ? null : customerName,
        total_amount: parsedAmount,
        toss_payment_key: paymentKey,
        toss_order_id: orderId,
        status: 'paid',
        payment_method: tossResult.method || 'card',
        email_sent: false,
      })
      .select()
      .single();

    if (orderError) {
      console.error('주문 생성 실패:', orderError);
      await cancelPayment(paymentKey, '주문 생성 실패로 인한 자동 취소');
      return NextResponse.json(
        { success: false, message: '주문 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    // 4) order_items INSERT + 라이선스 키 할당
    const emailItems: { productName: string; licenseKeys: string[] }[] = [];
    let allKeysAssigned = true;

    for (const cartItem of cartItems) {
      // order_items INSERT
      const { error: itemError } = await supabaseAdmin
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: cartItem.productId,
          product_name: cartItem.name,
          quantity: cartItem.quantity,
          unit_price: cartItem.price,
          subtotal: cartItem.price * cartItem.quantity,
        });

      if (itemError) {
        console.error('주문 항목 생성 실패:', itemError);
        continue;
      }

      // 라이선스 키 할당 (RPC)
      try {
        const { data: assignedKeys, error: assignError } = await supabaseAdmin
          .rpc('assign_license_keys', {
            p_product_id: cartItem.productId,
            p_quantity: cartItem.quantity,
            p_order_id: order.id,
          });

        if (assignError) {
          console.error('라이선스 키 할당 실패:', assignError);
          allKeysAssigned = false;
          continue;
        }

        if (assignedKeys && assignedKeys.length > 0) {
          emailItems.push({
            productName: cartItem.name,
            licenseKeys: assignedKeys.map(
              (k: { license_key: string }) => k.license_key
            ),
          });
        }
      } catch (rpcError) {
        console.error('RPC 호출 실패:', rpcError);
        allKeysAssigned = false;
      }
    }

    // 5) 주문 상태 업데이트
    if (allKeysAssigned && emailItems.length > 0) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', order.id);
    }

    // 6) 이메일 발송 (실패해도 결제는 성공 처리)
    let emailSent = false;
    if (emailTo && emailItems.length > 0) {
      try {
        await sendLicenseEmail({
          to: emailTo,
          orderNumber: orderId,
          items: emailItems,
        });
        emailSent = true;

        await supabaseAdmin
          .from('orders')
          .update({ email_sent: true })
          .eq('id', order.id);
      } catch (emailError) {
        console.error('이메일 발송 실패:', emailError);
        // email_sent = false 유지
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: orderId,
      orderId: order.id,
      emailSent,
    });
  } catch (error: any) {
    console.error('결제 확인 처리 실패:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '결제 처리 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
