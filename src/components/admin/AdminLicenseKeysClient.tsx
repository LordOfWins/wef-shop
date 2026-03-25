// src/components/admin/AdminLicenseKeysClient.tsx
'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { cn, formatDateTime } from '@/lib/utils'
import { Ban, Key, Plus, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LicenseKeyWithProduct {
  id: string
  product_id: string
  license_key: string
  status: string
  order_id: string | null
  created_at: string
  products: { name: string } | null
}

interface Props {
  products: { id: string; name: string }[]
  initialKeys: LicenseKeyWithProduct[]
}

export function AdminLicenseKeysClient({ products, initialKeys }: Props) {
  const router = useRouter()
  const [keys, setKeys] = useState(initialKeys)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)

  // 단건 등록
  const [singleKey, setSingleKey] = useState('')
  const [singleProductId, setSingleProductId] = useState('')
  const [addingKey, setAddingKey] = useState(false)

  // 벌크 등록
  const [bulkKeys, setBulkKeys] = useState('')
  const [bulkProductId, setBulkProductId] = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [bulkReport, setBulkReport] = useState<{
    total: number
    inserted: number
    duplicates: number
    duplicateKeys: string[]
  } | null>(null)

  const filteredKeys = keys.filter((k) => {
    if (statusFilter !== 'all' && k.status !== statusFilter) return false
    if (productFilter !== 'all' && k.product_id !== productFilter) return false
    return true
  })

  const statusColors: Record<string, { label: string; variant: 'success' | 'default' | 'danger' | 'best' }> = {
    available: { label: '미사용', variant: 'success' },
    reserved: { label: '예약', variant: 'best' },
    sold: { label: '판매됨', variant: 'default' },
    revoked: { label: '폐기', variant: 'danger' },
  }

  const handleAddSingle = async () => {
    if (!singleKey.trim() || !singleProductId) {
      toast('error', '상품과 키를 모두 입력하세요')
      return
    }
    setAddingKey(true)
    try {
      const res = await fetch('/api/admin/license-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: singleProductId, keys: [singleKey.trim()] }),
      })
      const data = await res.json()
      if (data.success) {
        if (data.report.inserted > 0) {
          toast('success', '키가 등록되었습니다')
        } else {
          toast('info', '이미 존재하는 키입니다')
        }
        setSingleKey('')
        setShowAddModal(false)
        router.refresh()
      } else {
        toast('error', data.error)
      }
    } catch {
      toast('error', '등록 중 오류 발생')
    } finally {
      setAddingKey(false)
    }
  }

  const handleBulkAdd = async () => {
    if (!bulkKeys.trim() || !bulkProductId) {
      toast('error', '상품과 키를 모두 입력하세요')
      return
    }
    setBulkSubmitting(true)
    setBulkReport(null)
    try {
      const keyList = bulkKeys
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean)

      if (keyList.length === 0) {
        toast('error', '등록할 키가 없습니다')
        return
      }

      const res = await fetch('/api/admin/license-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: bulkProductId, keys: keyList }),
      })
      const data = await res.json()
      if (data.success) {
        setBulkReport(data.report)
        toast('success', `${data.report.inserted}개 등록 완료`)
        router.refresh()
      } else {
        toast('error', data.error)
      }
    } catch {
      toast('error', '등록 중 오류 발생')
    } finally {
      setBulkSubmitting(false)
    }
  }

  const handleRevoke = async (keyId: string) => {
    if (!confirm('이 키를 폐기 처리하시겠습니까?')) return
    try {
      const res = await fetch('/api/admin/license-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyId, status: 'revoked' }),
      })
      const data = await res.json()
      if (data.success) {
        toast('success', '키가 폐기 처리되었습니다')
        setKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k))
        )
      } else {
        toast('error', data.error)
      }
    } catch {
      toast('error', '처리 중 오류 발생')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">라이선스 키 관리</h1>
          <p className="text-slate-500 mt-1">총 {keys.length}개 키</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowAddModal(true)
              setShowBulkModal(false)
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            단건 등록
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowBulkModal(true)
              setShowAddModal(false)
              setBulkReport(null)
            }}
          >
            <Upload className="w-4 h-4 mr-1" />
            벌크 등록
          </Button>
        </div>
      </div>

      {/* 단건 등록 모달 */}
      {showAddModal && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold text-navy-900">키 단건 등록</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">상품 선택</label>
              <select
                value={singleProductId}
                onChange={(e) => setSingleProductId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="">상품 선택</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">라이선스 키</label>
              <input
                value={singleKey}
                onChange={(e) => setSingleKey(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddSingle} isLoading={addingKey}>등록</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddModal(false)}>닫기</Button>
          </div>
        </div>
      )}

      {/* 벌크 등록 모달 */}
      {showBulkModal && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold text-navy-900">키 벌크 등록</h3>
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">상품 선택</label>
            <select
              value={bulkProductId}
              onChange={(e) => setBulkProductId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            >
              <option value="">상품 선택</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1.5">
              라이선스 키 (줄바꿈으로 구분)
            </label>
            <textarea
              value={bulkKeys}
              onChange={(e) => setBulkKeys(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-navy-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-y"
              placeholder={"XXXXX-XXXXX-XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY-YYYYY-YYYYY\nZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ"}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBulkAdd} isLoading={bulkSubmitting}>일괄 등록</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowBulkModal(false); setBulkReport(null) }}>닫기</Button>
          </div>

          {/* 벌크 등록 결과 리포트 */}
          {bulkReport && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-navy-900 mb-2">등록 결과</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-navy-900">{bulkReport.total}</p>
                  <p className="text-xs text-slate-500">전체</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{bulkReport.inserted}</p>
                  <p className="text-xs text-slate-500">등록 성공</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{bulkReport.duplicates}</p>
                  <p className="text-xs text-slate-500">중복 스킵</p>
                </div>
              </div>
              {bulkReport.duplicateKeys.length > 0 && (
                <div className="mt-3 text-xs text-slate-500">
                  <p className="font-medium text-amber-600 mb-1">중복된 키:</p>
                  {bulkReport.duplicateKeys.map((k) => (
                    <p key={k} className="font-mono">{k}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 필터 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">상태:</span>
          {['all', 'available', 'sold', 'revoked'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {s === 'all' ? '전체' : statusColors[s]?.label ?? s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">상품:</span>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-navy-900 focus:border-primary-500 focus:outline-none"
          >
            <option value="all">전체 상품</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 키 목록 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">키</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">상품</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-6 py-4">상태</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">등록일</th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase px-6 py-4">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredKeys.map((k) => {
                const statusInfo = statusColors[k.status] ?? statusColors.available
                return (
                  <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-navy-900">{k.license_key}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{k.products?.name ?? '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{formatDateTime(k.created_at)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {k.status === 'available' && (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="폐기 처리"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredKeys.length === 0 && (
          <div className="py-16 text-center">
            <Key className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-400">
              {statusFilter !== 'all' || productFilter !== 'all'
                ? '조건에 맞는 키가 없습니다'
                : '등록된 키가 없습니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
