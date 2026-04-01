import { http, HttpResponse } from 'msw'

const TOSS_API_URL = 'https://api.tosspayments.com/v1'

export const handlers = [
  http.post(`${TOSS_API_URL}/payments/confirm`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    if (!body.paymentKey || !body.orderId || !body.amount) {
      return HttpResponse.json(
        { code: 'INVALID_REQUEST', message: '필수 파라미터 누락' },
        { status: 400 }
      )
    }

    if (body.paymentKey === 'FAIL_KEY') {
      return HttpResponse.json(
        { code: 'PAYMENT_FAILED', message: '결제 승인 실패' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      paymentKey: body.paymentKey,
      orderId: body.orderId,
      totalAmount: body.amount,
      method: 'card',
      status: 'DONE',
      approvedAt: new Date().toISOString(),
    })
  }),

  http.post(`${TOSS_API_URL}/payments/:paymentKey/cancel`, async () => {
    return HttpResponse.json({
      status: 'CANCELED',
      canceledAt: new Date().toISOString(),
    })
  }),
]
