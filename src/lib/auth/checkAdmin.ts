// src/lib/auth/checkAdmin.ts
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * 관리자 인증 체크 — 공용 헬퍼
 * 로그인 + profiles.role === 'admin' 검증
 * @returns 관리자 User 또는 null
 */
export async function checkAdmin(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
}
