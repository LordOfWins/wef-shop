'use client';

import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Mail } from 'lucide-react';
import { useState } from 'react';

export default function ResendEmailButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '이메일 재발송 완료',
          description: '라이선스 키가 이메일로 다시 발송되었습니다',
        });
      } else {
        toast({
          title: '재발송 실패',
          description: data.message || '잠시 후 다시 시도해 주세요',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: '오류 발생',
        description: '서버와의 통신 중 문제가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      isLoading={isLoading}
      disabled={isLoading}
    >
      <Mail className="w-3 h-3 mr-1" />
      이메일 재발송
    </Button>
  );
}
