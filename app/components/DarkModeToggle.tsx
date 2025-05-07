'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { ThemeAnimationType, useModeAnimation } from 'react-theme-switch-animation'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    animationType: ThemeAnimationType.BLUR_CIRCLE,
    blurAmount: 2,
    duration: 1000,
  })

  useLayoutEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const useDark = saved === 'dark' || (!saved && prefersDark)
    setIsDark(useDark)
    document.documentElement.classList.toggle('dark', useDark)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    toggleSwitchTheme()
  }

  return (
    <div className="top-4 right-4 z-50 fixed">
      <div ref={containerRef} className="relative">
        {/* Button */}
        <button
          onClick={toggleTheme}
          className="z-10 relative bg-white/30 dark:bg-black/30 shadow-md backdrop-blur-md p-3 border border-white/20 rounded-full hover:scale-110 transition"
          aria-label="Toggle theme"
        >
          <div className={`transition-transform duration-500 ease-in-out ${isDarkMode ? 'rotate-360' : ''}`}>
            {isDarkMode ? 
              <Sun className="w-6 h-6 text-amber-500" /> : 
              <Moon className="w-6 h-6 text-indigo-600" />
            }
          </div>
        </button>

        {/* Animation Circle */}
        <div
          ref={ref as unknown as React.RefObject<HTMLDivElement>}
          className="z-0 absolute inset-0 rounded-full pointer-events-none"
        />
      </div>
    </div>
  )
}
