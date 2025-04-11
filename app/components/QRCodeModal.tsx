import { QRCodeCanvas } from 'qrcode.react'

interface QRCodeModalProps {
  subscriptionId: string
  onClose: () => void
}

export default function QRCodeModal({ subscriptionId, onClose }: QRCodeModalProps) {
  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 shadow-2xl p-6 rounded-2xl animate-popup-zoom"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-bold text-xl text-center">📱 Quét QR để mở Subscription</h2>
        <QRCodeCanvas
          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/manage/${subscriptionId}`}
          size={256}
          bgColor="#ffffff"
          fgColor="#000000"
          className="mx-auto rounded"
        />
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 mt-6 px-4 py-2 rounded-lg w-full text-white transition"
        >
          Đóng
        </button>
      </div>
    </div>
  )
} 