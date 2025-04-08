'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

export default function OpenPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    const { data, error: supaError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('id', code.trim().toUpperCase())
      .maybeSingle()

    setLoading(false)

    if (supaError) {
      console.error('Lỗi khi truy vấn Supabase:', supaError)
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
      return
    }

    if (data) {
      router.push(`/manage/${data.id}`)
    } else {
      setError('❌ Mã không tồn tại. Vui lòng kiểm tra lại.')
    }
  }

  return (
    <div className="mx-auto p-6 max-w-md">
      <h2 className="mb-4 font-bold text-xl">Nhập mã Subscription</h2>
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        className="mb-3 px-3 py-2 border rounded w-full"
        placeholder="Ví dụ: ABC123"
      />
      {error && <p className="mb-2 text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? '🔍 Đang kiểm tra...' : 'Mở Subscription'}
      </button>
    </div>
  )
}
