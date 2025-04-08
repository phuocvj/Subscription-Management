/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlusCircle, FaFolderOpen, FaSun, FaMoon, FaFacebookSquare, FaEnvelope } from 'react-icons/fa'
import { SiThreads } from 'react-icons/si'
import { QRCodeCanvas } from 'qrcode.react'
import ThemeToggleButton from './components/ThemeToggleButton'
import vietqr from '../vietqr.gif'
import { supabase } from './lib/supabase'

type SubscriptionMeta = {
  code: string
  name: string
  createdAt: string | null
}
export default function HomePage() {
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [qrCodeToShow, setQrCodeToShow] = useState<string | null>(null)
  const qrRef = useRef<HTMLCanvasElement | null>(null)
  const [showZoomQR, setShowZoomQR] = useState(false)
  const [passwordPrompt, setPasswordPrompt] = useState<{ code: string; requirePassword: boolean } | null>(null)
  const [passwordInput, setPasswordInput] = useState('')

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, name, created_at, password, note')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Lỗi khi lấy danh sách subscriptions:', error)
        return
      }
      setSubs(data)
    }

    fetchSubscriptions()
  }, [])

  const openSubscription = async (code: string) => {
    const sub = subs.find(s => s.id === code)
    if (sub?.password) {
      setPasswordPrompt({ code, requirePassword: true })
    } else {
      router.push(`/manage/${code}`)
    }
  }

  const confirmPassword = async () => {
    const sub = subs.find(s => s.id === passwordPrompt?.code)
    if (!sub || !sub.password) return

    if (sub.password === passwordInput) {
      setPasswordPrompt(null)
      setPasswordInput('')
      router.push(`/manage/${sub.id}`)
    } else {
      alert('❌ Sai mật khẩu, vui lòng thử lại.')
    }
  }


  return (
    <main className="flex flex-col justify-center items-center space-y-10 px-6 min-h-screen">


      <h1 className="font-bold text-4xl text-center">📋 Subscription Manager</h1>

      <div className="flex flex-wrap justify-center gap-6">
        <button onClick={() => router.push('/create')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-md px-6 py-4 rounded-lg text-white text-lg transition">
          <FaPlusCircle size={24} /> Create A Subscription
        </button>
        <button onClick={() => router.push('/open')} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 shadow-md px-6 py-4 rounded-lg text-white text-lg transition">
          <FaFolderOpen size={24} /> Open A Subscription
        </button>
      </div>

      <div className="flex lg:flex-row flex-col justify-center items-start gap-10 w-full">
        <div className="mt-10 w-full max-w-xl">
          {subs.length > 0 && (
            <>
              <h2 className="mb-4 font-semibold text-xl">📦 Các Subscription đã tạo</h2>
              <ul className="space-y-3">
                {subs.map(sub => (
                  <li key={sub.id} className="flex justify-between items-center gap-4 hover:bg-blue-50 dark:hover:bg-blue-900 shadow px-4 py-3 border rounded transition cursor-pointer" onClick={() => openSubscription(sub.id)}>
                    <div className="flex-1">
                      <div className="font-mono text-gray-500 text-sm">Mã: {sub.id}</div>
                      <div className="font-semibold text-lg">{sub.name}</div>
                      {sub.created_at && (
                        <div className="mt-1 text-gray-500 text-sm">
                          📅 Ngày đăng ký: {new Date(sub.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                    <QRCodeCanvas
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/manage/${sub.id}`}
                      size={64}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      className="rounded cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation()
                        setQrCodeToShow(sub.id)
                      }}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Donation box nằm bên phải trên desktop */}
        <div className="flex flex-col items-center w-full lg:w-96">
          <div className="space-y-4 text-center">
            <p className="">
              💬 Hiện tại mình chưa có kinh phí để thuê server, vì vậy toàn bộ dữ liệu subscription đang được lưu
              <strong> trên một server miễn phí (Supabase) và có giới hạn</strong>. Tuy nhiên dữ liệu này hoàn toàn riêng tư và không ai khác có thể truy cập.
            </p>
            <p className="">
              ⚠️ Nếu có kinh phí triển khai server và database, hệ thống sẽ lưu trữ vĩnh viễn và đồng bộ mọi lúc, mọi nơi.
            </p>
            <p className="font-semibold">
              🙏 Nếu bạn thấy dự án hữu ích, hãy ủng hộ một chút chi phí để mình có thể duy trì và phát triển thêm nhé!
            </p>
            <hr className="my-4 border-gray-300 dark:border-zinc-600" />
            <p className="dark:text-neutral-400 text-sm italic">
              💬 Currently, due to limited budget, I don't have a server — so your data is stored supabase (no-free tier) and is fully private.
              . A database would allow permanent, secure storage.
              If you find this tool useful, consider supporting this project!
            </p>
          </div>

          <div className="mt-10 text-center">
            <h3 className="mb-2 font-semibold text-xl">🎁 Ủng hộ tác giả</h3>
            <p className="mb-4 text-gray-500">Quét mã QR để chuyển khoản Vietinbank</p>
            <div className="inline-block p-4 rounded-lg">
              <img
                src="/vietqr.gif"
                alt="QR Vietinbank"
                className="rounded-md w-64 h-64 object-contain hover:scale-105 transition cursor-pointer"
                onClick={() => setShowZoomQR(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Liên hệ */}
      <div className="space-y-3 mt-10 text-center">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">📬 Liên hệ & Kết nối</h4>
        <div className="flex justify-center gap-6 text-blue-600 dark:text-blue-400 text-2xl">
          <a href="https://www.facebook.com/605255262" target="_blank" rel="noopener noreferrer" title="Facebook">
            <FaFacebookSquare />
          </a>
          <a href="https://www.threads.net/@beony.dev" target="_blank" rel="noopener noreferrer" title="Threads">
            <SiThreads />
          </a>
          <a href="mailto:lethienphuoc@outlook.com" title="Email">
            <FaEnvelope />
          </a>
        </div>
      </div>

      {/* Popup zoom QR */}
      {showZoomQR && (
        <div className="z-50 fixed inset-0 flex justify-center items-center" onClick={() => setShowZoomQR(false)}>
          <img
            src="/vietqr.gif"
            alt="QR Vietinbank"
            className="rounded-lg w-80 md:w-[500px] h-80 md:h-[500px] object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Popup xác thực mật khẩu */}
      {passwordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-2xl w-96 animate-popup-zoom transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔐</span>
              <h2 className="text-xl font-bold">Nhập mật khẩu để mở Subscription</h2>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Subscription <span className="font-mono text-blue-700 dark:text-blue-300">{passwordPrompt.code}</span> đang được bảo vệ.
            </p>

            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu..."
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPasswordPrompt(null)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Huỷ
              </button>
              <button
                onClick={confirmPassword}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                Mở khoá
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}