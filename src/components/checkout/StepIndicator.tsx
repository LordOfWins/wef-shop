'use client'

import { cn } from '@/lib/utils'
import { Check, ShoppingCart, User, CreditCard } from 'lucide-react'

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3
}

const steps = [
    { step: 1, label: '장바구니', icon: ShoppingCart },
    { step: 2, label: '정보입력', icon: User },
    { step: 3, label: '결제', icon: CreditCard },
] as const

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-0 mb-10">
            {steps.map((s, i) => {
                const Icon = s.icon
                const isCompleted = s.step < currentStep
                const isActive = s.step === currentStep
                const isLast = i === steps.length - 1

                return (
                    <div key={s.step} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                                    isCompleted
                                        ? 'bg-primary-600 text-white'
                                        : isActive
                                            ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                            : 'bg-slate-100 text-slate-400'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    isActive || isCompleted ? 'text-primary-600' : 'text-slate-400'
                                )}
                            >
                                {s.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div
                                className={cn(
                                    'w-16 sm:w-24 h-0.5 mx-3 mb-6 rounded-full',
                                    s.step < currentStep ? 'bg-primary-600' : 'bg-slate-200'
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
