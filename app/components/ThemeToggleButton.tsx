'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'
import { MdSync } from 'react-icons/md' // icon auto

type ThemeMode = 'light' | 'dark' | 'auto'

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<ThemeMode>('auto')
  const [showPopup, setShowPopup] = useState(false)

  const applyTheme = (mode: ThemeMode) => {
    if (mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      document.documentElement.classList.toggle('dark', mode === 'dark')
    }
  }

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as ThemeMode) || 'auto'
    setTheme(saved)
    applyTheme(saved)
  }, [])

  const nextTheme = (current: ThemeMode): ThemeMode =>
    current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light'

  const toggleTheme = () => {
    const newTheme = nextTheme(theme)
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 1200)
  }

  const renderIcon = () => {
    if (theme === 'light') return <FaSun />
    if (theme === 'dark') return <FaMoon />
    return <MdSync />
  }

  const renderPopupIcon = () => {
    if (theme === 'light') return <FaSun size={100} />
    if (theme === 'dark') return <FaMoon size={100} />
    return <MdSync size={100} />
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
