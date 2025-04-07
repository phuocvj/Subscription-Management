'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlusCircle, FaFolderOpen } from 'react-icons/fa'
import { QRCodeCanvas } from 'qrcode.react'
import { useTheme } from '@/app/hook/useTheme'
import { FaSun, FaMoon } from 'react-icons/fa'
import ThemeToggleButton from './components/ThemeToggleButton'
import { FaFacebookSquare, FaEnvelope } from 'react-icons/fa'
import { SiThreads } from 'react-icons/si' // Threads
import vietqr from '../vietqr.gif'
type SubscriptionPreview = {
  code: string
  name: string
  createdAt?: string
}
export default function HomePage() {
  const router = useRouter()
  const [subs, setSubs] = useState<SubscriptionPreview[]>([])
  const [qrCodeToShow, setQrCodeToShow] = useState<string | null>(null)
  const qrRef = useRef<HTMLCanvasElement | null>(null)
  const { theme, toggleTheme } = useTheme()
  const [showZoomQR, setShowZoomQR] = useState(false)

  const handleDownloadQR = () => {
    const canvas = qrRef.current
    if (!canvas) return
    const dataURL = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `subscription-${qrCodeToShow}.png`
    link.click()
  }
  useEffect(() => {
    const list: SubscriptionPreview[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('subscription:')) {
        const code = key.replace('subscription:', '')
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          list.push({
            code,
            name: data.name || '(chưa đặt tên)',
            createdAt: data.createdAt || null
          })
        } catch (e) {
          console.error('Không đọc được subscription', key)
        }
      }
    }

    setSubs(list)
  }, [])

  return (
    <main className="flex flex-col justify-center items-center space-y-10 px-6 min-h-screen">
      <div className="top-4 right-4 absolute">
        <ThemeToggleButton />
      </div>
      <h1 className="font-bold text-4xl text-center">📋 Subscription Manager</h1>

      {/* Buttons */}
      <div className="flex gap-6">
        <button
          onClick={() => router.push('/create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-md px-6 py-4 rounded-lg text-white text-lg transition"
        >
          <FaPlusCircle size={24} />
          Create A Subscription
        </button>

        <button
          onClick={() => router.push('/open')}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 shadow-md px-6 py-4 rounded-lg text-white text-lg transition"
        >
          <FaFolderOpen size={24} />
          Open A Subscription
        </button>
      </div>

      {/* Danh sách subscription */}
      {subs.length > 0 && (
        <div className="mt-10 w-full max-w-xl">
          <h2 className="mb-4 font-semibold text-xl">📦 Các Subscription đã tạo</h2>
          <ul className="space-y-3">
            {subs.map(sub => (
              <li
                key={sub.code}
                className="flex justify-between items-center gap-4 hover:bg-blue-50 dark:hover:bg-blue-900 shadow px-4 py-3 border rounded transition cursor-pointer"
                onClick={() => router.push(`/manage/${sub.code}`)}
              >
                <div className="flex-1">
                  <div className="font-mono text-gray-500 text-sm">Mã: {sub.code}</div>
                  <div className="font-semibold text-lg">{sub.name}</div>
                  {sub.createdAt && (
                    <div className="mt-1 text-gray-500 text-sm">
                      📅 Ngày đăng ký: {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>

                {/* QR CODE */}
                <QRCodeCanvas
                  value={`${window.location.origin}/manage/${sub.code}`}
                  size={64}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  className="rounded cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation() // tránh trigger router.push
                    setQrCodeToShow(sub.code)
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {qrCodeToShow && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
          onClick={() => setQrCodeToShow(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 shadow-lg p-6 rounded-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 font-semibold">Mã QR cho: <span className="font-mono">{qrCodeToShow}</span></h3>
            <QRCodeCanvas
              value={`${window.location.origin}/manage/${qrCodeToShow}`}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              className="mx-auto"
            />
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={handleDownloadQR}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                📥 Tải mã QR
              </button>
              <button
                onClick={() => setQrCodeToShow(null)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donate Section */}
      {/* 💖 Lời kêu gọi ủng hộ (light/dark mode tương thích) */}
      <div className="space-y-4 mx-auto mt-10 px-4 max-w-xl text-center">
        <p className="text-neutral-700 dark:text-neutral-300 text-base">
          💬 Hiện tại mình chưa có kinh phí để thuê server, vì vậy toàn bộ dữ liệu subscription đang được lưu
          <strong> cục bộ trên thiết bị của bạn</strong>. Dữ liệu này hoàn toàn riêng tư và không ai khác có thể truy cập.
        </p>

        <p className="text-neutral-700 dark:text-neutral-300 text-base">
          ⚠️ Tuy nhiên, nếu bạn cài lại máy hoặc mất thiết bị thì dữ liệu sẽ bị mất. Nếu có kinh phí triển khai server và database,
          hệ thống sẽ lưu trữ vĩnh viễn và đồng bộ mọi lúc, mọi nơi.
        </p>

        <p className="font-semibold text-neutral-900 dark:text-white text-base">
          🙏 Nếu bạn thấy dự án hữu ích, hãy ủng hộ một chút chi phí để mình có thể duy trì và phát triển thêm nhé!
        </p>

        <hr className="my-4 border-gray-300 dark:border-zinc-600" />

        <p className="text-neutral-500 dark:text-neutral-400 text-sm italic">
          💬 Currently, due to limited budget, I don't have a server — so your data is stored locally and is fully private.
          However, it will be lost if you reinstall or lose your device. A database would allow permanent, secure storage.
          If you find this tool useful, consider supporting this project!
        </p>
      </div>


      <div className="mt-20 text-center">
        <h3 className="mb-2 font-semibold text-xl">🎁 Ủng hộ tác giả</h3>
        <p className="mb-4 text-gray-500">Quét mã QR để chuyển khoản Vietinbank</p>

        <div className="inline-block bg-white dark:bg-zinc-800 shadow p-4 rounded-lg">
          <img
            src='./vietqr.gif' // ← bạn nhớ đổi tên đúng ảnh bạn sẽ upload
            alt="QR Vietinbank"
            className="rounded-md w-64 h-64 object-contain hover:scale-105 transition cursor-pointer"
            onClick={() => setShowZoomQR(true)}

          />
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
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/60"
          onClick={() => setShowZoomQR(false)}
        >
          <img
            src="/vietqr.gif"
            alt="QR Vietinbank"
            className="rounded-lg w-80 md:w-[500px] h-80 md:h-[500px] object-contain"
            onClick={e => e.stopPropagation()} // để không tắt popup khi click vào ảnh
          />
        </div>
      )}
    </main >
  )
}
