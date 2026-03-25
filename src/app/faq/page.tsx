// src/app/faq/page.tsx
import { FaqAccordion } from '@/components/faq/FaqAccordion'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '자주 묻는 질문',
  description: '위프 라이선스 구매 관련 자주 묻는 질문과 답변입니다.',
}

const faqItems = [
  {
    question: '제품키는 어떻게 받나요?',
    answer:
      '결제 완료 즉시 입력하신 이메일로 제품키가 자동 발송됩니다. 보통 1~5분 이내에 수신되며, 스팸 폴더도 확인해주세요. 만약 30분 이상 수신되지 않는 경우 고객센터로 문의해주시면 즉시 재발송해드립니다.',
  },
  {
    question: '영구 라이선스인가요?',
    answer:
      '네, 위프에서 판매하는 Windows 및 Office 제품은 모두 영구 라이선스입니다. 한 번 구매하시면 추가 비용 없이 평생 사용하실 수 있습니다. 단, Office 365의 경우 1년 구독형 라이선스입니다.',
  },
  {
    question: '몇 대까지 사용 가능한가요?',
    answer:
      '일반적으로 1개의 제품키는 PC 1대에서 사용 가능합니다. 각 상품 페이지에서 "최대 기기 수"를 확인해주세요. 여러 대의 PC에 설치하셔야 하는 경우 수량을 추가하여 구매해주시면 됩니다.',
  },
  {
    question: '환불이 가능한가요?',
    answer:
      '제품키 발송 전에는 100% 환불이 가능합니다. 제품키 발송 후에도 아직 인증하지 않으셨다면 환불이 가능하니 고객센터로 연락해주세요. 단, 이미 인증에 사용된 키는 환불이 불가합니다.',
  },
  {
    question: '설치 방법을 모르겠어요',
    answer:
      '구매 확인 이메일에 상세한 설치 가이드 링크가 포함되어 있습니다. Windows의 경우 설정 → 시스템 → 정품 인증에서 "제품 키 변경"을 클릭하여 입력하시면 됩니다. Office는 office.com/setup에서 설치하실 수 있습니다. 어려우시다면 원격 지원도 가능하니 편하게 문의해주세요.',
  },
  {
    question: '키가 작동하지 않아요',
    answer:
      '제품키 입력 시 오류가 발생하는 경우 다음을 확인해주세요: ①입력한 키에 오타가 없는지 확인 ②구매한 제품과 설치된 버전이 일치하는지 확인 (예: Windows 11 Home 키를 Pro에 입력하면 안 됩니다) ③인터넷 연결 상태 확인. 그래도 해결되지 않으면 고객센터로 연락주시면 교체 키를 발급해드립니다.',
  },
  {
    question: 'MS 정품 인증 리셀러인가요?',
    answer:
      '위프는 Microsoft 정품 소프트웨어 라이선스를 취급하는 합법적인 리셀러입니다. 모든 제품키는 정품이며, Microsoft의 공식 인증 서버를 통해 정상적으로 인증됩니다. 사업자등록 정보는 사이트 하단에서 확인하실 수 있습니다.',
  },
]

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-navy-900 mb-3">자주 묻는 질문</h1>
        <p className="text-slate-500">궁금한 점이 있으시면 아래에서 찾아보세요</p>
      </div>

      <FaqAccordion items={faqItems} />

      <div className="mt-12 text-center p-8 bg-primary-50 rounded-2xl border border-primary-100">
        <p className="text-sm text-navy-800 font-medium mb-2">
          원하시는 답변을 찾지 못하셨나요?
        </p>
        <p className="text-sm text-slate-500">
          <a href="mailto:support@weep.kr" className="text-primary-600 hover:text-primary-700 font-medium">
            support@weep.kr
          </a>
          로 문의해주시면 빠르게 답변드리겠습니다.
        </p>
      </div>
    </div>
  )
}
