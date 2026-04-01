// src/app/api/admin/license-keys/route.ts
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

    const { productId, keys } = (await request.json()) as {
      productId: string
      keys: string[]
    }

    if (!productId || !keys?.length) {
      return NextResponse.json(
        { error: '상품ID와 키가 필요합니다' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    const { data: existingKeys } = await supabaseAdmin
      .from('license_keys')
      .select('license_key')
      .in('license_key', keys)

    const existingSet = new Set(existingKeys?.map((k) => k.license_key) ?? [])
    const newKeys = keys.filter((k) => !existingSet.has(k))
    const duplicates = keys.filter((k) => existingSet.has(k))

    let inserted = 0
    if (newKeys.length > 0) {
      const rows = newKeys.map((key) => ({
        product_id: productId,
        license_key: key,
        status: 'available' as const,
      }))

      const { error } = await supabaseAdmin.from('license_keys').insert(rows)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      inserted = newKeys.length
    }

    return NextResponse.json({
      success: true,
      report: {
        total: keys.length,
        inserted,
        duplicates: duplicates.length,
        duplicateKeys: duplicates,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID와 상태가 필요합니다' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('license_keys')
      .update({ status })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
