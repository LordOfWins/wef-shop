import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/components/ui/Toast'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '위프 (WEEP) - 정품 윈도우 · MS 오피스 전문 스토어',
    template: '%s | 위프 (WEEP)',
  },
  description:
    '정품 윈도우 10/11, MS 오피스 2024/2021/2019/2016/365 라이선스를 최저가로 즉시 발송합니다. 100% 정품 보증.',
  keywords: [
    '윈도우 정품',
    '윈도우 11',
    '윈도우 10',
    'MS 오피스',
    '오피스 2024',
    '오피스 2021',
    '정품 라이선스',
    '제품키',
  ],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '위프 (WEEP)',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastProvider />
      </body>
    </html>
  )
}
