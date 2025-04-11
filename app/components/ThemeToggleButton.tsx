'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useConfettiBoom } from '../hooks/useConfettiBoom'

type ThemeMode = 'light' | 'dark' | 'system'

// Extend Window interface to include the myConfettiBoom property
declare global {
  interface Window {
    myConfettiBoom?: () => void;
  }
}

export default function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const boom = useConfettiBoom()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getNextTheme = (current: ThemeMode): ThemeMode => {
    switch (current) {
      case 'light':
        return 'dark'
      case 'dark':
        return 'system'
      default:
        return 'light'
    }
  }

  const handleToggle = () => {
    if (!theme) return
    const next = getNextTheme(theme as ThemeMode)
    setTheme(next)

    boom()
  }

  if (!mounted) return null

  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const currentIcon =
    theme === 'system' ? <FaAdjust /> :
      currentTheme === 'light' ? <FaSun /> :
        <FaMoon />

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleToggle}
      whileTap={{ scale: 0.9 }}
      className="z-50 relative bg-gray-200 dark:bg-zinc-800 p-4 rounded-full text-yellow-600 dark:text-yellow-200 text-xl hover:scale-110 transition"
      title={`Chế độ: ${theme}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.5 }}
        >
          {currentIcon}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
