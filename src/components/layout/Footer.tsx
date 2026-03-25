// src/components/layout/Footer.tsx
import { FileText, Mail, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400">
      {/* 상단 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-xl font-bold text-white">위프 (WEEP)</span>
            </div>
            <p className="text-sm leading-relaxed">
              정품 윈도우 · MS 오피스 라이선스 전문 스토어
            </p>
            <p className="text-sm mt-2">
              100% 정품 제품키 · 5분 내 즉시 발송 · 정품 보증
            </p>
          </div>

          {/* 바로가기 */}
          <div>
            <h3 className="text-white font-semibold mb-4">바로가기</h3>
            <div className="space-y-2.5">
              <Link href="/products" className="block text-sm hover:text-white transition-colors">전체 상품</Link>
              <Link href="/reviews" className="block text-sm hover:text-white transition-colors">구매후기</Link>
              <Link href="/faq" className="block text-sm hover:text-white transition-colors">자주 묻는 질문</Link>
            </div>
          </div>

          {/* 고객센터 */}
          <div>
            <h3 className="text-white font-semibold mb-4">고객센터</h3>
            <div className="space-y-2.5">
              <a href="mailto:support@weep.kr" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                support@weep.kr
              </a>
              <p className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                평일 10:00 ~ 18:00
              </p>
              <p className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                1:1 문의는 이메일을 이용해주세요
              </p>
              {/* 카카오톡 문의하기 */}
              <a
                href="#kakao-channel"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-sm font-semibold hover:bg-[#FDD835] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                카카오톡 문의하기
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-500">
            <div className="space-y-1">
              <p>상호명: 위프 | 대표: 강경제 | 사업자등록번호: 납품 후 등록 예정</p>
              <p>사업장 주소: 납품 후 등록 예정 | 통신판매업신고: 납품 후 등록 예정</p>
            </div>
            <p>&copy; {new Date().getFullYear()} 위프 (WEEP) All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
