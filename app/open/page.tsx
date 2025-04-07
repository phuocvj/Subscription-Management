'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OpenPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = () => {
    const data = localStorage.getItem(`subscription:${code}`)
    if (data) {
      router.push(`/manage/${code}`)
    } else {
      setError('Mã không tồn tại. Vui lòng kiểm tra lại.')
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
        className="bg-green-600 px-4 py-2 rounded text-white"
      >
        Mở Subscription
      </button>
    </div>
  )
}
