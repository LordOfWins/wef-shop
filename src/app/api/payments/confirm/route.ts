// src/app/api/payments/confirm/route.ts
import { sendLicenseEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { cancelPayment, confirmPayment } from '@/lib/toss'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET: 토스 결제 완료 redirect callback
 * - 결제 승인이나 주문 생성을 하지 않음
 * - 파라미터를 그대로 전달하여 /payment/success로 redirect
 * - 실제 처리는 POST 핸들러에서 수행
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const customerName = searchParams.get('customerName') || ''
  const customerEmail = searchParams.get('customerEmail') || ''

  // 필수 파라미터 검증
  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(
      new URL(
        `/payment/fail?code=INVALID_PARAMS&message=${encodeURIComponent(
          '결제 정보가 올바르지 않습니다'
        )}`,
        request.nextUrl.origin
      )
    )
  }

  // ★ FIX: 토스 승인/주문 생성을 하지 않고 파라미터만 전달하여 redirect
  return NextResponse.redirect(
    new URL(
      `/payment/success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}&customerName=${encodeURIComponent(
        customerName
      )}&customerEmail=${encodeURIComponent(customerEmail)}`,
      request.nextUrl.origin
    )
  )
}

/**
 * POST: 클라이언트에서 confirm 호출 (장바구니 데이터 포함)
 * - 토스 결제 승인 → 주문 생성 → 키 할당 → 이메일 발송
 * - 유일한 결제 처리 경로 (이중 주문 방지)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      paymentKey,
      orderId,
      amount,
      customerName,
      customerEmail,
      cartItems,
    } = body

    // 필수값 검증
    if (!paymentKey || !orderId || !amount || !cartItems?.length) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      )
    }

    const parsedAmount = Number(amount)

    // ★ 이중 주문 방지: 이미 같은 orderId로 주문이 존재하는지 확인
    const supabaseAdmin = createAdminClient()
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('toss_order_id', orderId)
      .maybeSingle()

    if (existingOrder) {
      // 이미 처리된 주문 — 성공으로 응답 (멱등성 보장)
      return NextResponse.json({
        success: true,
        orderNumber: existingOrder.order_number,
        orderId: existingOrder.id,
        emailSent: true,
        message: '이미 처리된 주문입니다',
      })
    }

    // 1) 토스 결제 승인
    const tossResult = await confirmPayment({
      paymentKey,
      orderId,
      amount: parsedAmount,
    })

    // 2) 현재 로그인 사용자 확인
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const emailTo = user?.email || customerEmail

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
      .single()

    if (orderError) {
      console.error('주문 생성 실패:', orderError)
      await cancelPayment(paymentKey, '주문 생성 실패로 인한 자동 취소')
      return NextResponse.json(
        { success: false, message: '주문 생성에 실패했습니다' },
        { status: 500 }
      )
    }

    // 4) order_items INSERT + 라이선스 키 할당
    const emailItems: { productName: string; licenseKeys: string[] }[] = []
    let allKeysAssigned = true

    for (const cartItem of cartItems) {
      // order_items INSERT
      const { error: itemError } = await supabaseAdmin
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: cartItem.productId,
          product_name: cartItem.name,
          quantity: cartItem.quantity,
          price: cartItem.price,
        })

      if (itemError) {
        console.error('주문 항목 생성 실패:', itemError)
        continue
      }

      // 라이선스 키 할당 (RPC)
      try {
        const { data: assignedKeys, error: assignError } =
          await supabaseAdmin.rpc('assign_license_keys', {
            p_product_id: cartItem.productId,
            p_quantity: cartItem.quantity,
            p_order_id: order.id,
          })

        if (assignError) {
          console.error('라이선스 키 할당 실패:', assignError)
          allKeysAssigned = false
          continue
        }

        if (assignedKeys && assignedKeys.length > 0) {
          emailItems.push({
            productName: cartItem.name,
            licenseKeys: assignedKeys.map(
              (k: { license_key: string }) => k.license_key
            ),
          })
        }
      } catch (rpcError) {
        console.error('RPC 호출 실패:', rpcError)
        allKeysAssigned = false
      }
    }

    // 5) 주문 상태 업데이트
    if (allKeysAssigned && emailItems.length > 0) {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', order.id)
    }

    // 6) 이메일 발송 (실패해도 결제는 성공 처리)
    let emailSent = false
    if (emailTo && emailItems.length > 0) {
      try {
        await sendLicenseEmail({
          to: emailTo,
          orderNumber: orderId,
          items: emailItems,
        })
        emailSent = true

        await supabaseAdmin
          .from('orders')
          .update({ email_sent: true })
          .eq('id', order.id)
      } catch (emailError) {
        console.error('이메일 발송 실패:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: orderId,
      orderId: order.id,
      emailSent,
    })
  } catch (error: any) {
    console.error('결제 확인 처리 실패:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || '결제 처리 중 오류가 발생했습니다',
      },
      { status: 500 }
    )
  }
}
