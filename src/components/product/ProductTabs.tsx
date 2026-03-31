'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useState } from 'react'

interface ProductTabsProps {
    description: string
}

const tabs = [
    { id: 'description', label: '상품 설명' },
    { id: 'installation', label: '설치 방법' },
    { id: 'refund', label: '환불 정책' },
] as const

type TabId = (typeof tabs)[number]['id']

export function ProductTabs({ description }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>('description')

    return (
        <div>
            {/* 탭 헤더 */}
            <div className="border-b border-slate-200 mb-8">
                <div className="flex gap-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'relative px-6 py-4 text-sm font-semibold transition-colors cursor-pointer',
                                activeTab === tab.id
                                    ? 'text-primary-600'
                                    : 'text-slate-400 hover:text-slate-600'
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="product-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 탭 콘텐츠 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'description' && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8">
                            <div className="flex items-start gap-4 mb-8 pb-8 border-b border-slate-100">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-navy-900 mb-1">배송 안내</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        배송방법: 이메일 발송 / 배송비: 무료 / 소요시간: 결제 완료 후 5분 내 자동 발송
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {description}
                            </p>
                        </div>
                    )}

                    {activeTab === 'installation' && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6">
                            <div>
                                <h4 className="font-bold text-navy-900 mb-3">Windows 제품키 인증 방법</h4>
                                <ol className="space-y-3 text-sm text-slate-600">
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                        <span><strong>설정</strong> → <strong>시스템</strong> → <strong>제품 인증</strong>으로 이동합니다.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                        <span><strong>&quot;제품 키 변경&quot;</strong> 버튼을 클릭합니다.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                        <span>이메일로 받은 <strong>제품키 25자리</strong>를 입력합니다.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                        <span>&quot;인증&quot; 버튼을 눌러 정품 인증을 완료합니다.</span>
                                    </li>
                                </ol>
                            </div>
                            <div>
                                <h4 className="font-bold text-navy-900 mb-3">MS Office 설치 방법</h4>
                                <ol className="space-y-3 text-sm text-slate-600">
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                        <span><strong>office.com/setup</strong> 에 접속합니다.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                        <span>Microsoft 계정으로 로그인 후 제품키를 입력합니다.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                        <span>설치 파일을 다운로드하고 실행합니다.</span>
                                    </li>
                                </ol>
                            </div>
                            <div className="bg-primary-50 rounded-xl p-5 text-sm text-primary-700">
                                <strong>💡 어려우신가요?</strong> 이메일(support@weep.kr)로 문의 주시면 원격 지원도 가능합니다.
                            </div>
                        </div>
                    )}

                    {activeTab === 'refund' && (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8">
                            <div className="bg-amber-50 rounded-xl p-6 mb-6">
                                <h4 className="font-bold text-amber-800 mb-3">환불 정책</h4>
                                <ul className="space-y-2 text-sm text-amber-700">
                                    <li>• 제품키 발송 전: <strong>100% 환불 가능</strong></li>
                                    <li>• 제품키 발송 후, 미인증 상태: <strong>환불 가능</strong> (고객센터 문의)</li>
                                    <li>• 제품키 인증 후: <strong>환불 불가</strong> (제품 특성상)</li>
                                </ul>
                            </div>
                            <div className="space-y-4 text-sm text-slate-600">
                                <div>
                                    <h4 className="font-bold text-navy-900 mb-2">A/S 안내</h4>
                                    <p>기술적 문제 발생 시 <strong>90일 이내 무상 A/S</strong>를 지원합니다. 키가 작동하지 않는 경우 교체 키를 발급해드립니다.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-navy-900 mb-2">유의 사항</h4>
                                    <p>제품키는 수령 후 <strong>20일 이내</strong> 사용을 권장합니다. 입력하신 이메일 주소가 정확해야 정상 발송됩니다.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
