// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import ThemeToggleButton from './components/ThemeToggleButton'
import { Providers } from './components/ThemeProvider'
import ThemeTransitionOverlay from './components/ThemeTransitionOverlay'
import ConfettiCanvas from './components/ConfettiCanvas'

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
    <html lang="en" className={inter.variable}>
      <body className="font-sans transition-colors duration-300">
        <Providers>
          <ThemeTransitionOverlay />
          <ConfettiCanvas />

        

          {/* 🔥 Nút ở giữa cạnh phải */}
          <div className="fixed bottom-2 right-0 transform -translate-y-1/2 z-50">
            <ThemeToggleButton />
          </div>

          <div className="relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}

