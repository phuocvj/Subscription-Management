import './globals.css'

export const metadata = {
  title: 'Subscription Manager',
  description: 'Quản lý subscription dễ dàng cùng team!'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-white dark:bg-zinc-900 p-4 text-black dark:text-white transition-colors duration-300">
        {children}
      </body>
    </html>
  )
}

