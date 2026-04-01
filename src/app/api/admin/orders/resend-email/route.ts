// src/app/api/admin/orders/resend-email/route.ts
import { sendLicenseEmail } from '@/lib/email'
import { checkAdmin } from '@/lib/auth/checkAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// ★ FIX: 로컬 checkAdmin() 제거, 공용 import 사용

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { orderId } = await request.json()
    const supabaseAdmin = createAdminClient()

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, profiles:user_id(email)')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const email = order.profiles?.email || order.guest_email
    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소가 없습니다' },
        { status: 400 }
      )
    }

    const { data: licenseKeys } = await supabaseAdmin
      .from('license_keys')
      .select('*, products:product_id(name)')
      .eq('order_id', orderId)
      .eq('status', 'sold')

    if (!licenseKeys?.length) {
      return NextResponse.json(
        { error: '발급된 라이선스 키가 없습니다' },
        { status: 400 }
      )
    }

    const itemsMap = new Map<string, string[]>()
    for (const key of licenseKeys) {
      const productName = key.products?.name || '상품'
      if (!itemsMap.has(productName)) itemsMap.set(productName, [])
      itemsMap.get(productName)!.push(key.license_key)
    }

    await sendLicenseEmail({
      to: email,
      orderNumber: order.order_number,
      items: Array.from(itemsMap.entries()).map(([productName, keys]) => ({
        productName,
        licenseKeys: keys,
      })),
    })

    await supabaseAdmin
      .from('orders')
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq('id', orderId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
