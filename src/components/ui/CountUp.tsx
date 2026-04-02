// src/components/ui/CountUp.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { formatPrice } from '@/lib/utils'

interface CountUpProps {
    end: number
    duration?: number
    prefix?: string
    suffix?: string
    className?: string
    format?: 'price' | 'number'
}

export function CountUp({
    end,
    duration = 1.5,
    prefix = '',
    suffix = '',
    className,
    format = 'number',
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, margin: '-40px' })
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        if (!isInView) return

        let startTime: number
        let animationFrame: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime
            const progress = Math.min(elapsed / (duration * 1000), 1)

            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const currentValue = Math.round(eased * end)

            setDisplayValue(currentValue)

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [isInView, end, duration])

    const formatted = format === 'price'
        ? formatPrice(displayValue)
        : displayValue.toLocaleString('ko-KR')

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3 }}
            className={className}
        >
            {prefix}
            {formatted}
            {suffix}
        </motion.span>
    )
}
