// app/layout.tsx
import './globals.css'
import ThemeProvider from './components/ThemeProvider'
import ThemeToggleButton from './components/ThemeToggleButton'
// file layout.tsx hoặc root layout
import { Lobster } from 'next/font/google'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
const lobster = Lobster({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})


export const metadata = {
  title: 'Subscription Manager',
  description: 'Quản lý subscription dễ dàng cùng team!'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" >
      <body className={`${inter.className}`}>

        <ThemeProvider>

          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
