// src/components/faq/FaqAccordion.tsx
'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div
            key={index}
            className={cn(
              'bg-white rounded-2xl border transition-all duration-200',
              isOpen ? 'border-primary-200 shadow-md' : 'border-slate-100 shadow-sm'
            )}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
            >
              <span
                className={cn(
                  'text-sm font-semibold pr-4 transition-colors',
                  isOpen ? 'text-primary-600' : 'text-navy-900'
                )}
              >
                <span className="text-primary-400 mr-2">Q.</span>
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isOpen ? 'text-primary-500' : 'text-slate-400'
                  )}
                />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed pt-4">
                        <span className="text-primary-600 font-semibold mr-2">A.</span>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
