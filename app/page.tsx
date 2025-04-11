// Trang homepage có chức năng đăng nhập bằng Google trước khi hiển thị dữ liệu Subscription
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlusCircle, FaFolderOpen, FaGoogle, FaFacebookSquare, FaEnvelope, FaSignOutAlt } from 'react-icons/fa'
import { SiThreads } from 'react-icons/si'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from './lib/supabase'
import ThemeToggleButton from './components/ThemeToggleButton'

export default function HomePage() {
  const router = useRouter()
  const [subs, setSubs] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [invitedMap, setInvitedMap] = useState<Record<string, string>>({})
  const [qrCodeToShow, setQrCodeToShow] = useState<string | null>(null) // cho QR subscriptions
  const [showZoomQRDonation, setShowZoomQRDonation] = useState(false)   // cho QR donation
  const [redirectTo, setRedirectTo] = useState('')
  const [searchText, setSearchText] = useState('')



  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!session?.user) return

      // 1. Lấy danh sách subscription mà user sở hữu
      const { data: owned, error: ownedError } = await supabase
        .from('subscriptions')
        .select('id, name, created_at, password')
        .eq('owner_id', session.user.id)

      // 2. Lấy các subscription mà user được mời làm editor
      const { data: invitedEditors = [] as any[], error: invitedError } = await supabase
        .from('subscription_editors')
        .select('subscription_id, email, inviter_email') // 👈 đừng quên lấy inviter_email nếu bạn dùng
        .eq('email', session.user.email.toLowerCase())
        .eq('accepted', true)

      let invitedSubs: any[] = []
      let inviterMap: Record<string, string> = {}

      if (invitedEditors != null && invitedEditors?.length > 0) {
        const ids = invitedEditors.map(i => i.subscription_id)
        const { data: extraSubs, error: extraErr } = await supabase
          .from('subscriptions')
          .select('id, name, created_at, password')
          .in('id', ids)

        if (extraErr) {
          console.error('Lỗi khi lấy subscriptions được mời:', extraErr)
        } else {
          invitedSubs = extraSubs || []
          invitedEditors.forEach(i => {
            inviterMap[i.subscription_id] = i.inviter_email
          })
        }
      }

      if (invitedError) {
        console.error('Lỗi khi lấy danh sách người được mời:', invitedError)
        return
      }

      if (ownedError || invitedError) {
        console.error('Lỗi khi lấy subscriptions:', ownedError || invitedError)
        return
      }

      setInvitedMap(inviterMap)
      setSubs([...(owned || []), ...invitedSubs])
    }

    fetchSubscriptions()
  }, [session])

  const signInWithGoogle = async () => {
    const redirectTo =
      window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://subs.info.vn'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' })
    } catch (err) {
      console.warn('⚠️ Logout global failed, fallback to local')
      await supabase.auth.signOut({ scope: 'local' })
    }
  }

  const openSubscription = async (code: string) => {
    router.push(`/manage/${code}`)
  }


  return (
    <main className="relative flex flex-col justify-center items-center space-y-10 px-6 min-h-screen overflow-hidden">
      <div className="-z-10 absolute inset-0 bg-gradient-to-br from-blue-300 via-pink-200 to-yellow-200 opacity-20 dark:opacity-10 blur-3xl animate-gradient" />
      <h1 className="font-bold text-4xl text-center">📋 Subscription Manager</h1>
      {session ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => router.push('/create')}
              className="group relative flex justify-center items-center bg-blue-600 hover:bg-blue-700 shadow-md sm:px-6 sm:py-4 rounded-full sm:rounded-lg w-[72px] sm:w-auto h-[72px] sm:h-auto text-white text-lg transition"
            >
              <FaPlusCircle className="sm:text-xl text-4xl transition-all duration-300" />
              <span className="sm:static absolute opacity-0 sm:opacity-100 ml-2 max-w-0 sm:max-w-full overflow-hidden whitespace-nowrap transition-all duration-300">
                Create A Subscription
              </span>
            </button>

            <button
              onClick={() => router.push('/open')}
              className="group relative flex justify-center items-center bg-green-600 hover:bg-green-700 shadow-md sm:px-6 sm:py-4 rounded-full sm:rounded-lg w-[72px] sm:w-auto h-[72px] sm:h-auto text-white text-lg transition"
            >
              <FaFolderOpen className="sm:text-xl text-4xl transition-all duration-300" />
              <span className="sm:static absolute opacity-0 sm:opacity-100 ml-2 max-w-0 sm:max-w-full overflow-hidden whitespace-nowrap transition-all duration-300">
                Open A Subscription
              </span>
            </button>

          </div>

          <div className="flex flex-col items-center mt-2 text-sm text-center">
            <span className="mb-1 text-center">
              👋 Xin chào, <strong>{session.user.user_metadata.full_name} ({session.user.user_metadata.email})</strong>
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-sm hover:shadow-md px-4 py-2 rounded-md text-blue-600 dark:text-blue-400 transition-all"
            >
              <FaSignOutAlt />
              Đăng xuất
            </button>

          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button onClick={signInWithGoogle} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 shadow-md px-6 py-4 rounded-lg text-white text-lg transition">
            <FaGoogle size={24} /> Đăng nhập với Google
          </button>
        </div>
      )}

      {session && (
        <div className="gap-10 grid grid-cols-1 lg:grid-cols-3 mt-10 w-full max-w-6xl">
          <div className="space-y-4 lg:col-span-2 shadow-md p-6 border-2 border-gray-300 dark:border-zinc-600 rounded-lg">
            {subs.length > 0 && (
              <>
                <h2 className="mb-4 font-semibold text-xl">📦 Các Subscription</h2>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="🔍 Tìm theo tên hoặc mã subscription..."
                  className="bg-white dark:bg-zinc-900 mb-4 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
                />
                <ul className="space-y-3">
                  {subs.filter(sub => {
                    const keyword = searchText.trim().toLowerCase()
                    return (
                      sub.id.toLowerCase().includes(keyword) ||
                      (sub.name && sub.name.toLowerCase().includes(keyword))
                    )
                  }).map(sub => (
                    <li key={sub.id} className="flex justify-between items-center gap-4 shadow px-4 py-3 border rounded hover:scale-105 transition cursor-pointer" onClick={() => openSubscription(sub.id)}>
                      <div className="flex-1">
                        <div className="font-mono text-gray-500 text-sm">Mã: {sub.id}</div>
                        <div className="font-semibold text-lg">{sub.name}</div>
                        {invitedMap[sub.id] && (
                          <div className="text-yellow-600 text-sm">🔗 Được mời bởi: {invitedMap[sub.id]}</div>
                        )}
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
              <p>
                💬 Hiện tại mình chưa có kinh phí để thuê server, vì vậy toàn bộ dữ liệu subscription đang được lưu
                <strong> trên một server miễn phí (Supabase) và có giới hạn</strong>. Tuy nhiên dữ liệu này hoàn toàn riêng tư và không ai khác có thể truy cập.
              </p>
              <p>
                ⚠️ Nếu có kinh phí triển khai server và database, hệ thống sẽ lưu trữ vĩnh viễn và đồng bộ mọi lúc, mọi nơi.
              </p>
              <p className="font-semibold">
                🙏 Nếu bạn thấy dự án hữu ích, hãy ủng hộ một chút chi phí để mình có thể duy trì và phát triển thêm nhé!
              </p>
              <hr className="my-4 border-gray-300 dark:border-zinc-600" />
              <p className="dark:text-neutral-400 text-sm italic">
                💬 Currently, due to limited budget, I don't have a server — so your data is stored supabase (no-free tier) and is fully private.
                A database would allow permanent, secure storage. If you find this tool useful, consider supporting this project!
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
                  onClick={() => setShowZoomQRDonation(true)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {qrCodeToShow && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={() => setQrCodeToShow(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 shadow-2xl p-6 rounded-2xl animate-popup-zoom"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-xl text-center">📱 Quét QR để mở Subscription</h2>
            <QRCodeCanvas
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/manage/${qrCodeToShow}`}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              className="mx-auto rounded"
            />
            <button
              onClick={() => setQrCodeToShow(null)}
              className="bg-blue-600 hover:bg-blue-700 mt-6 px-4 py-2 rounded-lg w-full text-white transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      {showZoomQRDonation && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={() => setShowZoomQRDonation(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 shadow-2xl p-6 rounded-2xl animate-popup-zoom"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-xl text-center">🎁 Quét QR để ủng hộ tác giả</h2>
            <img
              src="/vietqr.gif"
              alt="QR Vietinbank"
              className="mx-auto w-80 h-auto object-contain"
            />
            <button
              onClick={() => setShowZoomQRDonation(false)}
              className="bg-indigo-600 hover:bg-indigo-700 mt-6 px-4 py-2 rounded-lg w-full text-white transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </main >
  )
}