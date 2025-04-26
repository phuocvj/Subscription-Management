'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"         // Dùng class "dark"
      defaultTheme="system"     // Cho phép lấy theo system
      enableSystem
    >
      {children}
    </NextThemesProvider>
  )
}
