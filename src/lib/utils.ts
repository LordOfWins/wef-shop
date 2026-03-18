import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind 클래스 병합 유틸 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 가격 포맷 (예: 17900 -> "17,900원") */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

/** 할인율 계산 (예: 109000, 17900 -> 84) */
export function calcDiscountRate(original: number, sale: number): number {
  if (original <= 0) return 0
  return Math.round(((original - sale) / original) * 100)
}

/** 주문번호 생성 (예: WIF-20260316-A1B2) */
export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WIF-${dateStr}-${random}`
}

/** 이름 마스킹 (예: "홍길동" -> "홍**") */
export function maskName(name: string): string {
  if (name.length <= 1) return name
  return name[0] + '*'.repeat(name.length - 1)
}

/** 이메일 마스킹 (예: "test@gmail.com" -> "te***@gmail.com") */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local}***@${domain}`
  return `${local.slice(0, 2)}***@${domain}`
}

/** 날짜 포맷 (예: ISO -> "2026.03.16") */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

/** 날짜+시간 포맷 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return `${formatDate(isoString)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
