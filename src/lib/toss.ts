const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;
const TOSS_API_URL = 'https://api.tosspayments.com/v1';

// 시크릿키를 Base64로 인코딩 (Basic Auth)
function getAuthHeader(): string {
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
  return `Basic ${encoded}`;
}

export async function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}) {
  const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey: params.paymentKey,
      orderId: params.orderId,
      amount: params.amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '결제 승인에 실패했습니다');
  }

  return data;
}

export async function cancelPayment(paymentKey: string, reason: string) {
  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancelReason: reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '결제 취소에 실패했습니다');
  }

  return data;
}
