import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { useRouter } from 'next/navigation'
import { FaLock, FaUnlock } from 'react-icons/fa'

interface SubscriptionListProps {
  subs: any[]
  invitedMap: Record<string, string>
  onQrCodeClick: (id: string) => void
}

export default function SubscriptionList({ subs, invitedMap, onQrCodeClick }: SubscriptionListProps) {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [rememberedIds, setRememberedIds] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [qrModalId, setQrModalId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const remembered = JSON.parse(localStorage.getItem('subscription_remember') || '{}')
      setRememberedIds(remembered)
    }
  }, [])
  const openSubscription = (code: string) => {
    router.push(`/manage/${code}`)
  }

  const isRemembered = (id: string) => rememberedIds[id]


  return (
    <div className="space-y-4 lg:col-span-2 bg-gradient-to-br from-white/20 dark:from-gray-800 via-gray-100/25 dark:via-gray-900/20 to-gray-200/20 dark:to-black shadow-md backdrop-blur-md p-6 border-2 rounded-lg">
      {subs.length > 0 && (
        <div className="rounded-2xl">
          <h2 className="flex items-center gap-2 mb-4 font-mono font-bold text-2xl">📦 Subscription List</h2>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="✨ Tìm theo tên hoặc mã subscription..."
            className="mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-black dark:text-white text-sm"
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
                className="flex justify-between items-center gap-4 bg-white/10 shadow-sm p-4 border rounded-xl hover:scale-[1.01] transition cursor-pointer"
                onClick={() => openSubscription(sub.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-xs">Mã: {sub.id}</div>
                    {sub.password && (
                      <>
                        {isRemembered(sub.id) ? (
                          <div
                            className="flex justify-center items-center bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 border border-white/30 dark:border-white/20 rounded-full w-9 h-9 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                            title="Đã ghi nhớ - click để khoá lại"
                            onClick={(e) => {
                              e.stopPropagation()
                              const confirmLock = window.confirm('Bạn có muốn khoá lại subscription này không? Lần sau vào bạn phải nhập mật khẩu đó nha.')
                              if (confirmLock) {
                                const updated = { ...rememberedIds }
                                delete updated[sub.id]
                                localStorage.setItem('subscription_remember', JSON.stringify(updated))
                                setRememberedIds(updated)
                                setToastMessage('🔒 Đã khoá lại subscription!')
                                setShowToast(true)
                                setTimeout(() => setShowToast(false), 3000)
                              }
                            }}
                          >
                            <FaUnlock className="text-green-500 text-lg" />
                          </div>
                        ) : (
                          <div className="flex justify-center items-center bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-full w-9 h-9">
                            <FaLock className="text-yellow-500 text-lg" title="Có mật khẩu bảo vệ" />
                          </div>
                        )}
                      </>
                    )}

                  </div>
                  <div className="font-mono font-bold text-lg">{sub.name}</div>
                  {invitedMap[sub.id] && (
                    <div className="text-yellow-600 text-sm">🔗 Được mời bởi: {invitedMap[sub.id]}</div>
                  )}
                  {sub.created_at && (
                    <div className="mt-1 font-mono text-sm">
                      📅 Ngày đăng ký: {new Date(sub.registered_at).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
                <div
                  className="bg-gradient-to-br from-white/80 dark:from-white via-gray-200 dark:via-gray-400 to-white/70 dark:to-gray-700 shadow-lg hover:shadow-2xl p-2 rounded-2xl transition-all duration-300 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQrModalId(sub.id); // Mở popup
                  }}
                  title="Click để xem QR lớn"
                >
                  <QRCodeCanvas
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/manage/${sub.id}`}
                    size={72}
                    bgColor="transparent"
                    fgColor="#000000"
                    className="rounded-lg"
                  />
                </div>

              </li>
            ))}
          </ul>
        </div>
      )}

      {showToast && (
        <div className="right-6 bottom-6 fixed bg-white/30 dark:bg-zinc-800/40 shadow-lg backdrop-blur-md px-4 py-3 border border-white/20 rounded-xl text-black dark:text-white animate-fade-in">
          {toastMessage}
        </div>
      )}

      {qrModalId && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center backdrop-blur-lg animate-fade-in"
          onClick={() => setQrModalId(null)}
        >
          <div
            className="relative flex flex-col items-center bg-gradient-to-br from-white/80 dark:from-white via-gray-200 dark:via-gray-400 to-white/70 dark:to-gray-700 shadow-2xl p-6 rounded-2xl max-w-[90%] max-h-[90%] animate-zoom-in"
            onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click vào bên trong QR
          >
            <button
              className="top-2 right-2 absolute text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
              onClick={() => setQrModalId(null)}
            >
              ×
            </button>
            <QRCodeCanvas
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/manage/${qrModalId}`}
              size={300}
              bgColor="transparent"
              fgColor="#000000"
              className="rounded-lg"
            />
           
          </div>
        </div>
      )}

    </div>
  )
}