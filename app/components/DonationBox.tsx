import { useState } from 'react'

export default function DonationBox() {
  const [showZoomQRDonation, setShowZoomQRDonation] = useState(false)

  return (
    <div className="flex flex-col items-center w-full lg:w-96">
      <div className="space-y-6 bg-white/20 dark:bg-zinc-800/30 shadow-lg backdrop-blur-md p-6 border border-white/30 dark:border-white/20 rounded-2xl w-full animate-fade-in">

        {/* Thông tin */}
        <div className="space-y-4 text-gray-800 dark:text-gray-300 text-center">
          <p>
            💬 Hiện tại mình chưa có kinh phí để thuê server, vì vậy toàn bộ dữ liệu subscription đang được lưu
            <strong> trên một server miễn phí (Supabase)</strong> và có giới hạn.
          </p>
          <p>
            ⚠️ Nếu có kinh phí triển khai server và database, hệ thống sẽ lưu trữ vĩnh viễn và đồng bộ mọi lúc, mọi nơi.
          </p>
          <p className="font-semibold">
            🙏 Nếu bạn thấy dự án hữu ích, hãy ủng hộ một chút chi phí để mình duy trì và phát triển nhé!
          </p>
          <hr className="my-4 border-gray-300 dark:border-zinc-600 border-t" />
          <p className="text-gray-600 dark:text-neutral-400 text-sm italic">
            💬 Currently, due to limited budget, data is stored on free Supabase.
            Permanent storage needs a real database.
            If you find this project useful, consider supporting it!
          </p>
        </div>

        {/* QR Donation */}
        <div className="space-y-2 text-center">
          <h3 className="font-bold text-indigo-600 dark:text-indigo-400 text-2xl">🎁 Ủng hộ tác giả</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Quét mã QR để chuyển khoản Vietinbank</p>
          <div className="inline-block bg-white/40 dark:bg-white/10 shadow-md hover:shadow-2xl p-4 border border-white/30 dark:border-white/20 rounded-2xl hover:scale-105 transition cursor-pointer"
            onClick={() => setShowZoomQRDonation(true)}
          >
            <img
              src="/vietqr.gif"
              alt="QR Vietinbank"
              className="rounded-xl w-52 h-52 object-contain"
            />
          </div>
        </div>

        {/* Liên hệ */}
        <div className="mt-6 space-y-2 text-gray-600 dark:text-gray-400 text-sm text-center">
          <div>
            Mọi chi tiết đóng góp xin liên hệ{' '}
            <a href="mailto:lebaokhaky@gmail.com" className="font-semibold hover:text-indigo-500 underline">
              lebaokhaky@gmail.com
            </a>
          </div>

          {/* Góp ý / Báo lỗi */}
          <div>
            🛠️ Góp ý hoặc báo lỗi tại:{' '}
            <a
              href="https://subsmanager.userjot.com/?cursor=1&order=top&limit=10"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-indigo-500 underline"
            >
              SubsManager Feedback
            </a>
          </div>
        </div>
      </div>

      {/* Popup QR */}
      {showZoomQRDonation && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowZoomQRDonation(false)}
        >
          <div
            className="flex flex-col items-center bg-white/30 dark:bg-zinc-800/40 shadow-2xl backdrop-blur-md p-6 border border-white/20 dark:border-white/10 rounded-2xl animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-bold text-gray-800 dark:text-gray-200 text-xl text-center">🎁 Ủng hộ tác giả</h2>
            <img
              src="/vietqr.gif"
              alt="QR Vietinbank"
              className="rounded-xl w-80 h-auto object-contain"
            />
            <button
              onClick={() => setShowZoomQRDonation(false)}
              className="bg-indigo-600 hover:bg-indigo-700 mt-6 px-6 py-2 rounded-xl text-white transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* 👇 thêm animation style */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes zoom-in {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .animate-zoom-in {
          animation: zoom-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
