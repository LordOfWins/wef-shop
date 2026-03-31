'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다'
          : authError.message
      )
      setLoading(false)
      return
    }

    toast('success', '로그인 되었습니다')
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900">로그인</h1>
        <p className="text-sm text-slate-500 mt-2">
          계정에 로그인하고 구매 내역을 관리하세요
        </p>
      </div>

      {/* 이메일 로그인 폼 */}
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          id="email"
          label="이메일"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="relative">
          <Input
            id="password"
            label="비밀번호"
            type={showPw ? 'text' : 'password'}
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          로그인
        </Button>
      </form>

      {/* 하단 링크 */}
      <p className="text-center text-sm text-slate-500">
        아직 계정이 없으신가요?{' '}
        <Link href="/register" className="text-primary-600 font-semibold hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
