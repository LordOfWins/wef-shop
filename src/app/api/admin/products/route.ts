// src/app/api/admin/products/route.ts
import { checkAdmin } from '@/lib/auth/checkAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createProductSchema,
  updateProductSchema,
} from '@/lib/validations/product'
import { NextRequest, NextResponse } from 'next/server'

// 상품 등록
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()

    // ★ FIX: Zod validation 추가
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: '입력값이 올바르지 않습니다',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(parsed.data)
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

// 상품 수정
export async function PUT(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()

    // ★ FIX: Zod validation 추가
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: '입력값이 올바르지 않습니다',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { id, ...updateData } = parsed.data
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
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

// 상품 삭제 (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: '상품 ID가 필요합니다' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
      .from('products')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
