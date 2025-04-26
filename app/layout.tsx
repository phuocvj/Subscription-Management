// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import ThemeToggleButton from './components/ThemeToggleButton'
import { Providers } from './components/ThemeProvider'
import ThemeTransitionOverlay from './components/ThemeTransitionOverlay'
import ConfettiCanvas from './components/ConfettiCanvas'
import Sidebar from './components/Sidebar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'Subscription Manager',
  description: 'Quản lý subscription dễ dàng cùng team!'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} `} >
      <body className="font-sans transition-colors duration-300">
        <Providers>
          <ThemeTransitionOverlay />
          {/* <ConfettiCanvas /> */}

          {/* <Sidebar /> */}

          {/* Main content */}
          <div className="ml-0 md:ml-16 pl-6 transition-all duration-300">
            <div className="z-10 relative px-4 py-6">
              {children}
            </div>
          </div>

          {/* 🔥 Nút ở giữa cạnh phải */}
          <div className="right-10 bottom-2 z-50 fixed -translate-y-1/2 transform">
            <ThemeToggleButton />
          </div>
        </Providers>
      </body>
    </html >
  )
}

