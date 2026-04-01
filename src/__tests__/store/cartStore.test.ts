// src/__tests__/store/cartStore.test.ts
import { CART_STORAGE_KEY, useCartStore } from '@/store/cartStore'
import { mockProduct, mockProduct2 } from '@/__tests__/helpers/fixtures'
import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Zustand persist는 localStorage를 사용하므로
// 각 테스트 전에 store를 리셋
function resetStore() {
  const { clearCart } = useCartStore.getState()
  clearCart()
  localStorage.clear()
}

describe('CartStore', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    resetStore()
  })

  // ─────────────────────────────────────
  // CART_STORAGE_KEY 상수
  // ─────────────────────────────────────
  describe('CART_STORAGE_KEY', () => {
    it('올바른 localStorage key를 사용한다', () => {
      expect(CART_STORAGE_KEY).toBe('wef-cart')
    })

    it('persist가 올바른 key로 저장한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      const stored = localStorage.getItem(CART_STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.items).toHaveLength(1)
      expect(parsed.state.items[0].product.id).toBe(mockProduct.id)
    })

    it('이전 키(dewif-cart)로는 데이터가 저장되지 않는다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      const oldKey = localStorage.getItem('dewif-cart')
      expect(oldKey).toBeNull()
    })
  })

  // ─────────────────────────────────────
  // addItem()
  // ─────────────────────────────────────
  describe('addItem()', () => {
    it('빈 장바구니에 상품을 추가한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe(mockProduct.id)
      expect(items[0].quantity).toBe(1)
    })

    it('같은 상품을 추가하면 수량이 증가한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(2)
    })

    it('다른 상품을 추가하면 별도 항목으로 추가된다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct2)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(2)
    })

    it('같은 상품 3번 추가하면 수량이 3이 된다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct)
      })

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(3)
    })
  })

  // ─────────────────────────────────────
  // removeItem()
  // ─────────────────────────────────────
  describe('removeItem()', () => {
    it('상품을 제거한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct2)
        useCartStore.getState().removeItem(mockProduct.id)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe(mockProduct2.id)
    })

    it('존재하지 않는 상품 제거 시 에러가 나지 않는다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().removeItem('non-existent-id')
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
    })

    it('마지막 상품 제거 시 빈 배열이 된다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().removeItem(mockProduct.id)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })
  })

  // ─────────────────────────────────────
  // updateQuantity()
  // ─────────────────────────────────────
  describe('updateQuantity()', () => {
    it('수량을 변경한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().updateQuantity(mockProduct.id, 5)
      })

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(5)
    })

    it('수량을 0으로 설정하면 상품이 제거된다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().updateQuantity(mockProduct.id, 0)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })

    it('수량을 음수로 설정하면 상품이 제거된다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().updateQuantity(mockProduct.id, -1)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })

    it('존재하지 않는 상품의 수량 변경은 무시된다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().updateQuantity('non-existent', 10)
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(1)
    })
  })

  // ─────────────────────────────────────
  // clearCart()
  // ─────────────────────────────────────
  describe('clearCart()', () => {
    it('장바구니를 비운다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct2)
        useCartStore.getState().clearCart()
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })

    it('이미 빈 장바구니를 비워도 에러가 없다', () => {
      act(() => {
        useCartStore.getState().clearCart()
      })

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })
  })

  // ─────────────────────────────────────
  // getTotalPrice()
  // ─────────────────────────────────────
  describe('getTotalPrice()', () => {
    it('총 금액을 계산한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct) // 17900
        useCartStore.getState().addItem(mockProduct2) // 35900
      })

      const total = useCartStore.getState().getTotalPrice()
      expect(total).toBe(17900 + 35900)
    })

    it('수량이 반영된 총 금액을 계산한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct) // 17900
        useCartStore.getState().addItem(mockProduct) // 17900 x2
      })

      const total = useCartStore.getState().getTotalPrice()
      expect(total).toBe(17900 * 2)
    })

    it('빈 장바구니의 총 금액은 0이다', () => {
      const total = useCartStore.getState().getTotalPrice()
      expect(total).toBe(0)
    })
  })

  // ─────────────────────────────────────
  // getTotalItems()
  // ─────────────────────────────────────
  describe('getTotalItems()', () => {
    it('총 아이템 수를 계산한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct2)
      })

      const totalItems = useCartStore.getState().getTotalItems()
      expect(totalItems).toBe(2)
    })

    it('같은 상품 수량이 반영된 총 아이템 수를 계산한다', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct)
        useCartStore.getState().addItem(mockProduct2)
      })

      const totalItems = useCartStore.getState().getTotalItems()
      expect(totalItems).toBe(3) // 2 + 1
    })

    it('빈 장바구니의 총 아이템 수는 0이다', () => {
      const totalItems = useCartStore.getState().getTotalItems()
      expect(totalItems).toBe(0)
    })
  })

  // ─────────────────────────────────────
  // localStorage 복원 시나리오 (결제 성공 페이지)
  // ─────────────────────────────────────
  describe('localStorage 복원', () => {
    it('CART_STORAGE_KEY로 저장된 데이터를 복원할 수 있다', () => {
      // cart에 추가
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      // localStorage에서 직접 읽기 (payment/success 페이지 시나리오)
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      expect(raw).not.toBeNull()

      const parsed = JSON.parse(raw!)
      const restoredItems = parsed.state?.items || []
      expect(restoredItems).toHaveLength(1)
      expect(restoredItems[0].product.id).toBe(mockProduct.id)
    })

    it('이전 키 dewif-cart로는 복원이 불가능하다 (버그 수정 확인)', () => {
      act(() => {
        useCartStore.getState().addItem(mockProduct)
      })

      // 이전 키로 시도
      const raw = localStorage.getItem('dewif-cart')
      expect(raw).toBeNull()
    })
  })
})
