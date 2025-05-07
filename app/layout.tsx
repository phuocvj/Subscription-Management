// app/layout.tsx
import './globals.css'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import DarkModeToggle from './components/DarkModeToggle'
import { ThemeProvider } from './components/ThemeProvider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata = {
  title: 'Subscription Manager',
  description: 'Quản lý subscription dễ dàng cùng team!'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br dark:bg-gradient-to-br from-indigo-200/95 dark:from-gray-900 via-purple-100/90 dark:via-gray-800 to-pink-200/95 dark:to-gray-900 `}>
        <ThemeProvider>
          <main className='flex justify-center items-center px-6 py-12 w-full min-h-screen transition-colors duration-500'>{children}
          </main>
          <DarkModeToggle />
        </ThemeProvider>

      </body>
    </html>
  );
}

