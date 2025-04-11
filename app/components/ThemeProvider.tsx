// app/providers.tsx (Next.js App Router)
'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen transition-colors duration-300">
        {children}
      </div>
    </ThemeProvider>
  )
}
