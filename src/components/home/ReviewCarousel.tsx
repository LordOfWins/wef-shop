'use client'

import { maskName, formatDate } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface ReviewItem {
    id: string
    author_name: string
    rating: number
    content: string
    created_at: string
    product_name?: string
}

interface ReviewCarouselProps {
    reviews: ReviewItem[]
}

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(0)

    const next = useCallback(() => {
        setDirection(1)
        setCurrent((prev) => (prev + 1) % reviews.length)
    }, [reviews.length])

    const prev = useCallback(() => {
        setDirection(-1)
        setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length)
    }, [reviews.length])

    // 자동 슬라이드 (5초)
    useEffect(() => {
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [next])

    if (reviews.length === 0) return null

    const review = reviews[current]

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 80 : -80,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -80 : 80,
            opacity: 0,
        }),
    }

    return (
        <div className="relative max-w-2xl mx-auto">
            {/* 따옴표 데코 */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center z-10">
                <Quote className="w-5 h-5 text-primary-400" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-8 pt-10 pb-8 min-h-[200px] flex flex-col items-center justify-center overflow-hidden relative">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={review.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="text-center w-full"
                    >
                        {/* 별점 */}
                        <div className="flex items-center justify-center gap-0.5 mb-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-4 h-4 ${s <= review.rating
                                            ? 'fill-accent-400 text-accent-400'
                                            : 'fill-slate-200 text-slate-200'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* 리뷰 내용 */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3 max-w-lg mx-auto">
                            &ldquo;{review.content}&rdquo;
                        </p>

                        {/* 작성자 정보 */}
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <span className="font-semibold text-navy-800">
                                {maskName(review.author_name)}
                            </span>
                            {review.product_name && (
                                <>
                                    <span>·</span>
                                    <span className="text-primary-500">{review.product_name}</span>
                                </>
                            )}
                            <span>·</span>
                            <span>{formatDate(review.created_at)}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 네비게이션 */}
            {reviews.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-navy-900 hover:shadow-lg transition-all cursor-pointer"
                        aria-label="이전 리뷰"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-navy-900 hover:shadow-lg transition-all cursor-pointer"
                        aria-label="다음 리뷰"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* 인디케이터 닷 */}
                    <div className="flex items-center justify-center gap-2 mt-5">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setDirection(i > current ? 1 : -1)
                                    setCurrent(i)
                                }}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === current
                                        ? 'w-6 bg-primary-500'
                                        : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                                    }`}
                                aria-label={`리뷰 ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
