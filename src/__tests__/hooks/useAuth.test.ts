import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockClient: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

describe('useAuth()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('로그인된 일반 사용자를 반환한다', async () => {
    mockClient = createMockSupabaseClient({
      user: { id: 'user-001', email: 'test@example.com' },
      profile: { role: 'customer' },
    })

    const { useAuth } = await import('@/hooks/useAuth')
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user?.id).toBe('user-001')
    expect(result.current.user?.email).toBe('test@example.com')
    expect(result.current.profile?.role).toBe('customer')
    expect(result.current.isAdmin).toBe(false)
  })

  it('로그인된 관리자를 반환한다', async () => {
    mockClient = createMockSupabaseClient({
      user: { id: 'admin-001', email: 'admin@wefsoft.kr' },
      profile: { role: 'admin' },
    })

    vi.resetModules()
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => mockClient,
    }))

    const { useAuth } = await import('@/hooks/useAuth')
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.profile?.role).toBe('admin')
  })

  it('비로그인 상태를 반환한다', async () => {
    mockClient = createMockSupabaseClient({
      user: null,
      profile: null,
    })

    vi.resetModules()
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => mockClient,
    }))

    const { useAuth } = await import('@/hooks/useAuth')
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
    expect(result.current.isAdmin).toBe(false)
  })

  it('signOut을 호출하면 user와 profile이 null이 된다', async () => {
    mockClient = createMockSupabaseClient({
      user: { id: 'user-001', email: 'test@example.com' },
      profile: { role: 'customer' },
    })

    // signOut 호출 시 onAuthStateChange 콜백도 트리거되도록 설정
    let authChangeCallback: ((event: string, session: unknown) => void) | null = null

    mockClient.auth.onAuthStateChange = vi.fn((callback) => {
      authChangeCallback = callback
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      }
    })

    mockClient.auth.signOut = vi.fn(async () => {
      // signOut이 호출되면 onAuthStateChange에 SIGNED_OUT 이벤트 전달
      if (authChangeCallback) {
        authChangeCallback('SIGNED_OUT', null)
      }
      return { error: null }
    })

    vi.resetModules()
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => mockClient,
    }))

    const { useAuth } = await import('@/hooks/useAuth')
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).not.toBeNull()

    // act로 감싸서 상태 변경을 올바르게 처리
    await act(async () => {
      await result.current.signOut()
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.profile).toBeNull()
    })
  })

  it('onAuthStateChange 구독을 설정한다', async () => {
    mockClient = createMockSupabaseClient({
      user: { id: 'user-001', email: 'test@example.com' },
      profile: { role: 'customer' },
    })

    vi.resetModules()
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => mockClient,
    }))

    const { useAuth } = await import('@/hooks/useAuth')
    renderHook(() => useAuth())

    await waitFor(() => {
      expect(mockClient.auth.onAuthStateChange).toHaveBeenCalledOnce()
    })
  })

  it('unmount 시 subscription을 해제한다', async () => {
    const mockUnsubscribe = vi.fn()
    mockClient = createMockSupabaseClient({
      user: null,
    })
    mockClient.auth.onAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    })

    vi.resetModules()
    vi.doMock('@/lib/supabase/client', () => ({
      createClient: () => mockClient,
    }))

    const { useAuth } = await import('@/hooks/useAuth')
    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})
