// src/app/admin/license-keys/page.tsx
import { AdminLicenseKeysClient } from '@/components/admin/AdminLicenseKeysClient'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: '라이선스 키 관리' }

export default async function AdminLicenseKeysPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: licenseKeys }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name')
      .order('name'),
    supabase
      .from('license_keys')
      .select('*, products:product_id(name)')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  return (
    <AdminLicenseKeysClient
      products={products ?? []}
      initialKeys={licenseKeys ?? []}
    />
  )
}
