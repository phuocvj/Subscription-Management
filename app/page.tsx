// Trang homepage có chức năng đăng nhập bằng Google trước khi hiển thị dữ liệu Subscription
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlusCircle, FaFolderOpen, FaGoogle, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from './hooks/useAuth'
import { useSubscriptions } from './hooks/useSubscriptions'
import SubscriptionList from './components/SubscriptionList'
import DonationBox from './components/DonationBox'
import QRCodeModal from './components/QRCodeModal'
import ThemeToggleButton from './components/ThemeToggleButton'

export default function HomePage() {
  const router = useRouter()
  const { session, signInWithGoogle, signOut } = useAuth()
  const { subs, invitedMap } = useSubscriptions(session)
  const [qrCodeToShow, setQrCodeToShow] = useState<string | null>(null)

  return (
    <main className="relative flex flex-col justify-center items-center space-y-10 px-6 min-h-screen overflow-hidden">
      <div className="-z-10 absolute inset-0 opacity-20 dark:opacity-10 blur-3xl animate-gradient" />
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
          <SubscriptionList 
            subs={subs} 
            invitedMap={invitedMap} 
            onQrCodeClick={setQrCodeToShow} 
          />
          <DonationBox />
        </div>
      )}

      {qrCodeToShow && (
        <QRCodeModal 
          subscriptionId={qrCodeToShow} 
          onClose={() => setQrCodeToShow(null)} 
        />
      )}
    </main>
  )
}