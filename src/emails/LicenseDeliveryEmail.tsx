import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components';

interface LicenseDeliveryEmailProps {
  orderNumber: string;
  items: {
    productName: string;
    licenseKeys: string[];
  }[];
}

export function LicenseDeliveryEmail({
  orderNumber,
  items,
}: LicenseDeliveryEmailProps) {
  return (
    <Html lang="ko">
      <Head />
      <Preview>위프(WEF) 라이선스 키가 발급되었습니다</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* 헤더 */}
          <Section style={headerSection}>
            <Heading style={logo}>WEF</Heading>
            <Text style={headerSubtitle}>소프트웨어 라이선스 스토어</Text>
          </Section>

          <Hr style={divider} />

          {/* 인사말 */}
          <Section style={contentSection}>
            <Heading as="h2" style={title}>
              라이선스 키 발급 완료
            </Heading>
            <Text style={paragraph}>
              주문해 주셔서 감사합니다! 아래에서 라이선스 키를 확인해 주세요
            </Text>
            <Text style={orderNumberText}>
              주문번호: <strong>{orderNumber}</strong>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* 상품별 라이선스 키 */}
          {items.map((item, index) => (
            <Section key={index} style={productSection}>
              <Text style={productName}>{item.productName}</Text>
              {item.licenseKeys.map((key, keyIndex) => (
                <Section key={keyIndex} style={licenseKeyBox}>
                  <Text style={licenseKeyText}>{key}</Text>
                </Section>
              ))}
            </Section>
          ))}

          <Hr style={divider} />

          {/* 설치 가이드 */}
          <Section style={contentSection}>
            <Heading as="h3" style={guideTitle}>
              설치 가이드
            </Heading>
            <Text style={paragraph}>
              1) 소프트웨어를 다운로드하세요
            </Text>
            <Text style={paragraph}>
              2) 설치 후 라이선스 키 입력 화면에서 위 키를 입력하세요
            </Text>
            <Text style={paragraph}>
              3) 활성화가 완료되면 모든 기능을 이용할 수 있습니다
            </Text>
            <Text style={cautionText}>
              ※ 라이선스 키는 타인에게 공유하지 마세요
            </Text>
          </Section>

          <Hr style={divider} />

          {/* 푸터 */}
          <Section style={footerSection}>
            <Text style={footerText}>
              문의사항이 있으시면 support@WEF.kr로 연락해 주세요
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} WEF. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default LicenseDeliveryEmail;

// 스타일
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 0',
  maxWidth: '600px',
};

const headerSection = {
  backgroundColor: '#2563eb',
  padding: '32px 40px',
  borderRadius: '12px 12px 0 0',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700' as const,
  margin: '0 0 4px',
  letterSpacing: '2px',
};

const headerSubtitle = {
  color: '#bfdbfe',
  fontSize: '13px',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '0',
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '32px 40px',
};

const title = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px',
};

const orderNumberText = {
  color: '#2563eb',
  fontSize: '14px',
  fontWeight: '500' as const,
  margin: '12px 0 0',
};

const productSection = {
  backgroundColor: '#ffffff',
  padding: '24px 40px',
};

const productName = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
};

const licenseKeyBox = {
  backgroundColor: '#f0f7ff',
  border: '1px dashed #2563eb',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '8px',
};

const licenseKeyText = {
  color: '#1e40af',
  fontSize: '15px',
  fontWeight: '600' as const,
  fontFamily: '"Courier New", monospace',
  margin: '0',
  letterSpacing: '0.5px',
  wordBreak: 'break-all' as const,
};

const guideTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 12px',
};

const cautionText = {
  color: '#ef4444',
  fontSize: '13px',
  margin: '16px 0 0',
};

const footerSection = {
  backgroundColor: '#f9fafb',
  padding: '24px 40px',
  borderRadius: '0 0 12px 12px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0 0 8px',
};

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
};
