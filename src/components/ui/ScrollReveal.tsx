'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScrollRevealProps {
    children: ReactNode
    className?: string
    delay?: number
}

export function ScrollReveal({
    children,
    className,
    delay = 0,
}: ScrollRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
