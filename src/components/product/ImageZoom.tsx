'use client'

import Image from 'next/image'
import { Package } from 'lucide-react'
import { useRef, useState } from 'react'

interface ImageZoomProps {
    src: string | null
    alt: string
    fallbackLabel?: string
}

export function ImageZoom({ src, alt, fallbackLabel }: ImageZoomProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isZooming, setIsZooming] = useState(false)
    const [position, setPosition] = useState({ x: 50, y: 50 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setPosition({ x, y })
    }

    if (!src) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl aspect-square flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-12 h-12 text-primary-500" />
                    </div>
                    <p className="text-lg font-medium text-slate-400">{fallbackLabel}</p>
                    <p className="text-sm text-slate-300 mt-1">Digital License</p>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl aspect-square flex items-center justify-center overflow-hidden cursor-zoom-in relative"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
        >
            <Image
                src={src}
                alt={alt}
                width={800}
                height={800}
                className="max-w-[80%] max-h-[80%] object-contain transition-transform duration-200"
                style={
                    isZooming
                        ? {
                            transform: 'scale(1.8)',
                            transformOrigin: `${position.x}% ${position.y}%`,
                        }
                        : undefined
                }
            />
            {/* 줌 힌트 */}
            {!isZooming && (
                <div className="absolute bottom-4 right-4 bg-navy-900/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                    마우스를 올려 확대
                </div>
            )}
        </div>
    )
}
