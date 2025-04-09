'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa'

type ThemeMode = 'light' | 'dark' | 'auto'

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<ThemeMode>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [showPopup, setShowPopup] = useState(false)

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Lấy theme từ localStorage khi mounted
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as ThemeMode) || 'auto'
    setTheme(saved)
  }, [])

  // Áp dụng theme khi thay đổi theme hoặc mounted
  useEffect(() => {
    const apply = () => {
      const appliedTheme = theme === 'auto' ? getSystemTheme() : theme
      setResolvedTheme(appliedTheme)
      document.documentElement.classList.toggle('dark', appliedTheme === 'dark')
    }

    apply()
  }, [theme])

  // Theo dõi thay đổi hệ thống nếu đang là auto
  useEffect(() => {
    if (theme !== 'auto' || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const systemChangeListener = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setResolvedTheme(newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    // Lắng nghe sự kiện
    mediaQuery.addEventListener('change', systemChangeListener)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', systemChangeListener)
    }
  }, [theme])

  const nextTheme = (current: ThemeMode): ThemeMode => {
    switch (current) {
      case 'light':
        return 'dark'
      case 'dark':
        return 'auto'
      default:
        return 'light'
    }
  }

  const toggleTheme = () => {
    const newTheme = nextTheme(theme)
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 1200)
  }

  const renderIcon = () => {
    switch (theme) {
      case 'light':
        return <FaSun />
      case 'dark':
        return <FaMoon />
      default:
        return <FaAdjust />
    }
  }

  const renderPopupIcon = () => {
    switch (resolvedTheme) {
      case 'light':
        return <FaSun size={100} />
      case 'dark':
        return <FaMoon size={100} />
    }
  }

  return (
    <>
      <motion.button
        onClick={toggleTheme}
        whileTap={{ rotate: 180, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="z-50 relative bg-gray-200 dark:bg-zinc-800 p-2 rounded-full text-yellow-600 dark:text-yellow-200 hover:scale-110 transition"
        title={`Chế độ giao diện: ${theme}`}
      >
        {renderIcon()}
      </motion.button>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="top-1/2 left-1/2 z-[9999] fixed flex justify-center items-center bg-white/30 dark:bg-zinc-800/30 shadow-lg backdrop-blur-md rounded-xl w-50 h-50 text-black dark:text-white -translate-x-1/2 -translate-y-1/2"
          >
            {renderPopupIcon()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
