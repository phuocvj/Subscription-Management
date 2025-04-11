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
    <html lang="en" className={`${inter.variable} dark:bg-yellow-900`} >
      <body className="font-sans transition-colors duration-300">
        <Providers>
          <ThemeTransitionOverlay />
          {/* <ConfettiCanvas /> */}

          {/* <Sidebar /> */}

          {/* Main content */}
          <div className="ml-0 md:ml-16 pl-6 transition-all duration-300">
            <div className="relative z-10 px-4 py-6">
              {children}
            </div>
          </div>

          {/* 🔥 Nút ở giữa cạnh phải */}
          <div className="fixed bottom-2 right-0 transform -translate-y-1/2 z-50">
            <ThemeToggleButton />
          </div>
        </Providers>
      </body>
    </html >
  )
}

