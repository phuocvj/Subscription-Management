// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import ThemeProvider from './components/ThemeProvider'
import ThemeToggleButton from './components/ThemeToggleButton'

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
      <body className="font-sans">
        <ThemeProvider>
          <div className="top-4 right-4 absolute">
            <ThemeToggleButton />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
