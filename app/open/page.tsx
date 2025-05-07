'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { FaSearch, FaArrowLeft } from 'react-icons/fa'

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-800/20 dark:via-gray-900/10 dark:to-black/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h2 className="text-2xl font-bold text-center flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Nhập mã Subscription
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 transition-all duration-300"
              placeholder="Ví dụ: ABC123"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500/90 to-purple-500/90 dark:from-indigo-600/90 dark:to-purple-600/90 hover:from-indigo-600/90 hover:to-purple-600/90 dark:hover:from-indigo-500/90 dark:hover:to-purple-500/90 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              'Mở Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
