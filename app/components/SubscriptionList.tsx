import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useRouter } from 'next/navigation'
import { FaLock } from 'react-icons/fa'

interface SubscriptionListProps {
  subs: any[]
  invitedMap: Record<string, string>
  onQrCodeClick: (id: string) => void
}

export default function SubscriptionList({ subs, invitedMap, onQrCodeClick }: SubscriptionListProps) {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')

  const openSubscription = (code: string) => {
    router.push(`/manage/${code}`)
  }

  return (
    <div className="space-y-4 lg:col-span-2 shadow-md dark:bg-amber-400 p-6 rounded-lg">
      {subs.length > 0 && (
        <div className="rounded-2xl">
          <h2 className="mb-4 font-bold text-2xl flex items-center gap-2">📦 Các Subscription</h2>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="✨ Tìm theo tên hoặc mã subscription..."
            className="mb-6 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
          />
          <ul className="space-y-4">
            {subs.filter(sub => {
              const keyword = searchText.trim().toLowerCase()
              return (
                sub.id.toLowerCase().includes(keyword) ||
                (sub.name && sub.name.toLowerCase().includes(keyword))
              )
            }).map(sub => (
              <li
                key={sub.id}
                className="flex justify-between items-center gap-4 p-4 border rounded-xl shadow-sm bg-white/10 hover:scale-[1.01] transition cursor-pointer"
                onClick={() => openSubscription(sub.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-gray-500 text-xs">Mã: {sub.id}</div>
                    {sub.password && (
                      <FaLock className="text-yellow-500 text-sm" title="Có mật khẩu bảo vệ" />
                    )}
                  </div>
                  <div className="font-semibold text-lg">{sub.name}</div>
                  {invitedMap[sub.id] && (
                    <div className="text-yellow-600 text-sm">🔗 Được mời bởi: {invitedMap[sub.id]}</div>
                  )}
                  {sub.created_at && (
                    <div className="mt-1 text-gray-500 text-sm">
                      📅 Ngày đăng ký: {new Date(sub.registered_at).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
                <QRCodeCanvas
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/manage/${sub.id}`}
                  size={64}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  className="rounded cursor-zoom-in shadow"
                  onClick={(e) => {
                    e.stopPropagation()
                    onQrCodeClick(sub.id)
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 