export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}
