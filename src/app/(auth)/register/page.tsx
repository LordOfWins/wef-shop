'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    toast('success', '회원가입이 완료되었습니다! 이메일을 확인해주세요')
    router.push('/login')
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-navy-900">회원가입</h1>
        <p className="text-sm text-slate-500 mt-2">
          간편하게 가입하고 최저가 라이선스를 구매하세요
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          id="name"
          label="이름"
          type="text"
          placeholder="홍길동"
          value={form.name}
          onChange={(e) => updateForm('name', e.target.value)}
          required
          autoComplete="name"
        />

        <Input
          id="email"
          label="이메일"
          type="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
          required
          autoComplete="email"
        />

        <div className="relative">
          <Input
            id="password"
            label="비밀번호"
            type={showPw ? 'text' : 'password'}
            placeholder="6자 이상 입력하세요"
            value={form.password}
            onChange={(e) => updateForm('password', e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          id="confirmPassword"
          label="비밀번호 확인"
          type={showPw ? 'text' : 'password'}
          placeholder="비밀번호를 다시 입력하세요"
          value={form.confirmPassword}
          onChange={(e) => updateForm('confirmPassword', e.target.value)}
          required
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          가입하기
        </Button>
      </form>

      {/* 하단 링크 */}
      <p className="text-center text-sm text-slate-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-primary-600 font-semibold hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
