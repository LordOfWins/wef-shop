// src/app/api/reviews/route.ts
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, productId, rating, content } = body

    if (!orderId || !productId || !rating || !content) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // 해당 주문이 본인 것인지 + delivered 상태인지 확인
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .in('status', ['paid', 'delivered'])
      .single()

    if (!order) {
      return NextResponse.json({ error: '유효한 주문이 아닙니다' }, { status: 400 })
    }

    // 이미 이 주문+상품에 리뷰를 작성했는지 확인
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 리뷰를 작성하셨습니다' }, { status: 400 })
    }

    // 프로필에서 이름 가져오기
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        order_id: orderId,
        product_id: productId,
        user_id: user.id,
        author_name: profile?.name || profile?.email || '고객',
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        content,
        is_visible: false, // 관리자 승인 후 노출
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
