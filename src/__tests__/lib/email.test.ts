// src/__tests__/lib/email.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Module mocks ──
const mockRender = vi.fn().mockResolvedValue('<html>License Email</html>')
vi.mock('@react-email/render', () => ({
  render: (...args: unknown[]) => mockRender(...args),
}))

vi.mock('@/emails/LicenseDeliveryEmail', () => ({
  LicenseDeliveryEmail: vi.fn(() => '<LicenseDeliveryEmail />'),
}))

const mockResendSend = vi.fn()
vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: (...args: unknown[]) => mockResendSend(...args),
    },
  },
}))

describe('sendLicenseEmail()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 환경변수 설정
    process.env.RESEND_FROM_EMAIL = 'noreply@wefsoft.kr'
  })

  it('정상적으로 이메일을 발송한다', async () => {
    mockResendSend.mockResolvedValue({
      data: { id: 'email-001' },
      error: null,
    })

    const { sendLicenseEmail } = await import('@/lib/email')

    const result = await sendLicenseEmail({
      to: 'customer@example.com',
      orderNumber: 'WEF-20260401-A1B2',
      items: [
        {
          productName: 'Microsoft Office 365',
          licenseKeys: ['XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'],
        },
      ],
    })

    expect(result).toEqual({ id: 'email-001' })
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@wefsoft.kr',
        to: 'customer@example.com',
        subject: expect.stringContaining('WEF-20260401-A1B2'),
      })
    )
  })

  it('여러 상품의 라이선스 키를 발송한다', async () => {
    mockResendSend.mockResolvedValue({
      data: { id: 'email-002' },
      error: null,
    })

    const { sendLicenseEmail } = await import('@/lib/email')

    await sendLicenseEmail({
      to: 'customer@example.com',
      orderNumber: 'WEF-20260401-TEST',
      items: [
        {
          productName: 'Office 365',
          licenseKeys: ['KEY-1', 'KEY-2'],
        },
        {
          productName: 'Windows 11',
          licenseKeys: ['KEY-3'],
        },
      ],
    })

    expect(mockRender).toHaveBeenCalledOnce()
    expect(mockResendSend).toHaveBeenCalledOnce()
  })

  it('Resend 에러 시 예외를 throw한다', async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' },
    })

    const { sendLicenseEmail } = await import('@/lib/email')

    await expect(
      sendLicenseEmail({
        to: 'customer@example.com',
        orderNumber: 'WEF-TEST',
        items: [
          { productName: 'Test', licenseKeys: ['KEY-1'] },
        ],
      })
    ).rejects.toThrow()
  })

  it('RESEND_FROM_EMAIL이 없으면 기본값을 사용한다', async () => {
    delete process.env.RESEND_FROM_EMAIL
    mockResendSend.mockResolvedValue({
      data: { id: 'email-003' },
      error: null,
    })

    // 모듈 캐시 리셋으로 환경변수 재평가
    vi.resetModules()

    // re-mock after resetModules
    vi.doMock('@react-email/render', () => ({
      render: vi.fn().mockResolvedValue('<html></html>'),
    }))
    vi.doMock('@/emails/LicenseDeliveryEmail', () => ({
      LicenseDeliveryEmail: vi.fn(() => ''),
    }))
    const localMockSend = vi.fn().mockResolvedValue({
      data: { id: 'email-003' },
      error: null,
    })
    vi.doMock('@/lib/resend', () => ({
      resend: { emails: { send: localMockSend } },
    }))

    const { sendLicenseEmail } = await import('@/lib/email')

    await sendLicenseEmail({
      to: 'test@example.com',
      orderNumber: 'WEF-TEST',
      items: [{ productName: 'Test', licenseKeys: ['K1'] }],
    })

    expect(localMockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@wefsoft.kr',
      })
    )
  })
})
