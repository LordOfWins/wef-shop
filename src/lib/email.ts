import { LicenseDeliveryEmail } from '@/emails/LicenseDeliveryEmail';
import { resend } from '@/lib/resend';

interface SendLicenseEmailParams {
  to: string;
  orderNumber: string;
  items: {
    productName: string;
    licenseKeys: string[];
  }[];
}

export async function sendLicenseEmail(params: SendLicenseEmailParams) {
  const { to, orderNumber, items } = params;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@weep.kr',
    to,
    subject: `[위프] 주문 완료 — 라이선스 키 안내 (${orderNumber})`,
    react: LicenseDeliveryEmail({ orderNumber, items }),
  });

  if (error) {
    console.error('이메일 발송 실패:', error);
    throw error;
  }

  return data;
}
