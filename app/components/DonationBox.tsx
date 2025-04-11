import { useState } from 'react'

export default function DonationBox() {
  const [showZoomQRDonation, setShowZoomQRDonation] = useState(false)

  return (
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
    </div>
  )
} 