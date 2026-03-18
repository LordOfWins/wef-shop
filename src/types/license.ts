export type LicenseStatus = 'available' | 'reserved' | 'sold' | 'revoked'

export interface LicenseKey {
  id: string
  product_id: string
  license_key: string
  status: LicenseStatus
  order_id: string | null
  sold_at: string | null
  created_at: string
}
