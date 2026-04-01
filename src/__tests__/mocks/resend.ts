import { vi } from 'vitest'

export const mockResendSend = vi.fn().mockResolvedValue({
  data: { id: 'mock-email-id' },
  error: null,
})

export const mockResend = {
  emails: {
    send: mockResendSend,
  },
}
