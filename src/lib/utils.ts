// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 주문번호 prefix — 브랜드에 맞게 일원화 */
export const ORDER_PREFIX = 'WEF'

/** Tailwind 클래스 병합 유틸 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 가격 포맷 (예: 17900 -> "17,900원") */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`
}

/**
 * 할인율 계산 (예: 109000, 17900 -> 84)
 * - original <= 0 → 0
 * - sale >= original → 0 (음수 방지)
 */
export function calcDiscountRate(original: number, sale: number): number {
  if (original <= 0) return 0
  if (sale >= original) return 0
  return Math.round(((original - sale) / original) * 100)
}

/**
 * 주문번호 생성 (예: WEF-20260401-A1B2)
 * ← 기존: WIF- (오타) → WEF- 로 수정
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${ORDER_PREFIX}-${dateStr}-${random}`
}

/** 이름 마스킹 (예: "홍길동" -> "홍**") */
export function maskName(name: string): string {
  if (!name || name.length <= 1) return name ?? ''
  return name[0] + '*'.repeat(name.length - 1)
}

/**
 * 이메일 마스킹 (예: "test@gmail.com" -> "te***@gmail.com")
 * - @가 없으면 전체를 마스킹 처리
 */
export function maskEmail(email: string): string {
  if (!email) return ''
  const atIndex = email.indexOf('@')
  if (atIndex === -1) {
    // @가 없는 비정상 이메일
    if (email.length <= 2) return email + '***'
    return email.slice(0, 2) + '***'
  }

  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex + 1)
  if (local.length <= 2) return `${local}***@${domain}`
  return `${local.slice(0, 2)}***@${domain}`
}

/**
 * 날짜 포맷 (예: ISO -> "2026.03.16")
 * - 잘못된 날짜 → 빈 문자열 반환
 */
export function formatDate(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

/** 날짜+시간 포맷 — 잘못된 날짜 → 빈 문자열 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''
  return `${formatDate(isoString)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
