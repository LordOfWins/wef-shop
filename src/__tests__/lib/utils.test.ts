import {
  calcDiscountRate,
  cn,
  formatDate,
  formatDateTime,
  formatPrice,
  generateOrderNumber,
  maskEmail,
  maskName,
  ORDER_PREFIX,
} from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('cn()', () => {
  it('단일 클래스를 그대로 반환한다', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('여러 클래스를 병합한다', () => {
    expect(cn('px-2', 'py-3')).toBe('px-2 py-3')
  })

  it('충돌하는 Tailwind 클래스를 올바르게 병합한다', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('falsy 값을 무시한다', () => {
    expect(cn('px-2', false && 'hidden', null, undefined, 'py-3')).toBe(
      'px-2 py-3'
    )
  })

  it('조건부 클래스를 지원한다', () => {
    const isActive = true
    expect(cn('btn', isActive && 'btn-active')).toBe('btn btn-active')
  })

  it('인자 없으면 빈 문자열을 반환한다', () => {
    expect(cn()).toBe('')
  })
})

describe('formatPrice()', () => {
  it('일반 가격을 포맷한다', () => {
    expect(formatPrice(17900)).toBe('17,900원')
  })

  it('0원을 포맷한다', () => {
    expect(formatPrice(0)).toBe('0원')
  })

  it('큰 금액을 포맷한다', () => {
    expect(formatPrice(1000000)).toBe('1,000,000원')
  })

  it('음수 가격도 포맷한다 (환불 등)', () => {
    expect(formatPrice(-5000)).toBe('-5,000원')
  })
})

describe('calcDiscountRate()', () => {
  it('정상 할인율을 계산한다', () => {
    expect(calcDiscountRate(109000, 17900)).toBe(84)
  })

  it('할인이 없으면 0을 반환한다', () => {
    expect(calcDiscountRate(10000, 10000)).toBe(0)
  })

  it('original이 0이면 0을 반환한다', () => {
    expect(calcDiscountRate(0, 5000)).toBe(0)
  })

  it('original이 음수이면 0을 반환한다', () => {
    expect(calcDiscountRate(-10000, 5000)).toBe(0)
  })

  it('sale이 original보다 크면 0을 반환한다 (음수 할인 방지)', () => {
    expect(calcDiscountRate(5000, 10000)).toBe(0)
  })

  it('100% 할인 (무료)', () => {
    expect(calcDiscountRate(10000, 0)).toBe(100)
  })

  it('소수점 반올림이 올바르게 동작한다', () => {
    expect(calcDiscountRate(100000, 66667)).toBe(33)
  })
})

describe('generateOrderNumber()', () => {
  it('WEF- prefix로 시작한다', () => {
    const orderNum = generateOrderNumber()
    expect(orderNum).toMatch(new RegExp(`^${ORDER_PREFIX}-`))
  })

  it('WEF-YYYYMMDD-XXXX 형식이다', () => {
    const orderNum = generateOrderNumber()
    expect(orderNum).toMatch(/^WEF-\d{8}-[A-Z0-9]{4}$/)
  })

  it('매번 다른 번호를 생성한다', () => {
    const nums = new Set(Array.from({ length: 100 }, () => generateOrderNumber()))
    expect(nums.size).toBeGreaterThanOrEqual(95)
  })

  it('오늘 날짜가 포함된다', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const orderNum = generateOrderNumber()
    expect(orderNum).toContain(today)
  })
})

describe('maskName()', () => {
  it('3글자 이름을 마스킹한다', () => {
    expect(maskName('홍길동')).toBe('홍**')
  })

  it('2글자 이름을 마스킹한다', () => {
    expect(maskName('홍길')).toBe('홍*')
  })

  it('1글자 이름은 그대로 반환한다', () => {
    expect(maskName('홍')).toBe('홍')
  })

  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(maskName('')).toBe('')
  })

  it('영문 이름도 마스킹한다', () => {
    expect(maskName('John')).toBe('J***')
  })
})

describe('maskEmail()', () => {
  it('일반 이메일을 마스킹한다', () => {
    expect(maskEmail('test@gmail.com')).toBe('te***@gmail.com')
  })

  it('로컬 파트가 2자 이하이면 그대로 + *** 처리한다', () => {
    expect(maskEmail('ab@gmail.com')).toBe('ab***@gmail.com')
    expect(maskEmail('a@gmail.com')).toBe('a***@gmail.com')
  })

  it('긴 이메일도 처리한다', () => {
    expect(maskEmail('verylongemail@domain.co.kr')).toBe('ve***@domain.co.kr')
  })

  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(maskEmail('')).toBe('')
  })

  it('@가 없는 비정상 이메일도 크래시 없이 처리한다', () => {
    const result = maskEmail('invalidemail')
    expect(result).not.toContain('undefined')
    expect(result).toBe('in***')
  })
})

describe('formatDate()', () => {
  it('ISO 문자열을 포맷한다', () => {
    expect(formatDate('2026-03-16T12:30:00Z')).toMatch(/2026\.03\.16/)
  })

  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(formatDate('')).toBe('')
  })

  it('잘못된 날짜 문자열은 빈 문자열을 반환한다', () => {
    expect(formatDate('not-a-date')).toBe('')
  })

  it('월/일이 한 자리일 때 0 패딩한다', () => {
    const result = formatDate('2026-01-05T00:00:00Z')
    expect(result).toMatch(/\.01\.05/)
  })
})

describe('formatDateTime()', () => {
  it('날짜와 시간을 포맷한다', () => {
    const result = formatDateTime('2026-03-16T14:30:00Z')
    expect(result).toMatch(/2026\.03\.\d{2} \d{2}:\d{2}/)
  })

  it('빈 문자열은 빈 문자열을 반환한다', () => {
    expect(formatDateTime('')).toBe('')
  })

  it('잘못된 날짜는 빈 문자열을 반환한다', () => {
    expect(formatDateTime('invalid')).toBe('')
  })
})
