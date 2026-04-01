// src/app/terms/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '이용약관',
    description: '위프(WEF) 서비스 이용약관입니다.',
}

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-navy-900 mb-3">서비스 이용약관</h1>
                <p className="text-slate-500">최종 수정일: 2026년 3월 30일</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-10">
                {/* 제1조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제1조 (목적)</h2>
                    <p className="text-slate-600 leading-relaxed">
                        본 약관은 위프(WEF)(이하 &quot;플랫폼&quot;)이 제공하는 웹사이트 운영 도구 및
                        관련 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 플랫폼과 이용자 간의 권리,
                        의무 및 책임 사항을 규정함을 목적으로 합니다.
                    </p>
                </section>

                {/* 제2조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제2조 (정의)</h2>
                    <div className="space-y-2 text-slate-600 leading-relaxed">
                        <p>
                            ① &quot;플랫폼&quot;이란 위프(WEF)이 운영하는 웹사이트 및 관련 시스템을 말합니다.
                        </p>
                        <p>
                            ② &quot;이용자&quot;란 본 약관에 따라 플랫폼이 제공하는 서비스를 이용하는 자를 말합니다.
                        </p>
                        <p>
                            ③ &quot;운영자(판매자)&quot;란 플랫폼을 통해 상품을 등록하고 판매하는 자를 말합니다.
                        </p>
                    </div>
                </section>

                {/* 제3조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제3조 (서비스의 내용)</h2>
                    <p className="text-slate-600 leading-relaxed">
                        플랫폼은 디지털 상품(소프트웨어 라이선스 키 등)의 자동 발송을 위한 웹사이트
                        운영 도구를 제공합니다. 플랫폼은 거래의 중개 또는 기술적 도구 제공의 역할을 하며,
                        상품 자체의 공급자가 아닙니다.
                    </p>
                </section>

                {/* 제4조 — 핵심 면책 조항 */}
                <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-amber-900 mb-3">제4조 (책임의 범위)</h2>
                    <div className="space-y-2 text-amber-800 leading-relaxed">
                        <p>
                            ① 본 플랫폼은 웹사이트 운영 도구를 제공하며, 판매 상품의 저작권 및
                            적법성에 대한 책임은 판매자(운영자)에게 있습니다.
                        </p>
                        <p>
                            ② 플랫폼은 운영자가 등록한 상품 정보, 라이선스 키의 유효성, 진위 여부 등에
                            대해 보증하지 않으며, 이로 인해 발생하는 분쟁에 대해 책임을 지지 않습니다.
                        </p>
                        <p>
                            ③ 이용자와 운영자 간의 거래에서 발생하는 분쟁은 당사자 간 해결을 원칙으로 하며,
                            플랫폼은 분쟁 해결을 위한 중재 역할을 수행할 수 있으나 의무는 아닙니다.
                        </p>
                    </div>
                </section>

                {/* 제5조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제5조 (이용자의 의무)</h2>
                    <div className="space-y-2 text-slate-600 leading-relaxed">
                        <p>
                            ① 이용자는 본 약관 및 관련 법령을 준수하여야 합니다.
                        </p>
                        <p>
                            ② 이용자는 타인의 정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.
                        </p>
                        <p>
                            ③ 이용자는 구매한 라이선스 키를 제3자에게 무단 공유, 재판매해서는 안 됩니다.
                        </p>
                    </div>
                </section>

                {/* 제6조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제6조 (결제 및 환불)</h2>
                    <div className="space-y-2 text-slate-600 leading-relaxed">
                        <p>
                            ① 결제는 플랫폼이 지원하는 결제 수단을 통해 이루어지며, 결제 완료 시
                            디지털 상품이 자동 발송됩니다.
                        </p>
                        <p>
                            ② 디지털 상품의 특성상, 라이선스 키가 발송된 이후에는 환불이 제한될 수 있습니다.
                            다만, 발송된 키가 정상적으로 작동하지 않는 경우 교환 또는 환불이 가능합니다.
                        </p>
                        <p>
                            ③ 환불 요청은 결제일로부터 7일 이내에 고객센터를 통해 접수해야 합니다.
                        </p>
                    </div>
                </section>

                {/* 제7조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제7조 (개인정보 보호)</h2>
                    <p className="text-slate-600 leading-relaxed">
                        플랫폼은 이용자의 개인정보를 관련 법령에 따라 보호하며, 수집된 개인정보는
                        서비스 제공 목적으로만 사용됩니다. 자세한 내용은 별도의 개인정보처리방침을
                        따릅니다.
                    </p>
                </section>

                {/* 제8조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제8조 (약관의 변경)</h2>
                    <p className="text-slate-600 leading-relaxed">
                        플랫폼은 필요한 경우 관련 법령에 위배되지 않는 범위 내에서 본 약관을 변경할 수
                        있으며, 변경된 약관은 웹사이트에 공지함으로써 효력이 발생합니다.
                    </p>
                </section>

                {/* 제9조 */}
                <section>
                    <h2 className="text-lg font-bold text-navy-900 mb-3">제9조 (분쟁 해결)</h2>
                    <p className="text-slate-600 leading-relaxed">
                        본 약관과 관련하여 분쟁이 발생한 경우 대한민국 법률을 준거법으로 하며,
                        관할 법원은 민사소송법에 따른 법원으로 합니다.
                    </p>
                </section>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-400">
                    본 약관에 대한 문의는{' '}
                    <a
                        href="mailto:support@WEF.kr"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        support@WEF.kr
                    </a>
                    로 연락해주세요.
                </p>
            </div>
        </div>
    )
}
