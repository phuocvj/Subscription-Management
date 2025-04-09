'use client'

import React, { useEffect, useState } from 'react'
import { useModeAnimation, ThemeAnimationType } from 'react-theme-switch-animation'
import { motion } from 'framer-motion'
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa'

type ThemeMode = 'light' | 'dark' | 'auto'

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<ThemeMode>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  const { ref, toggleSwitchTheme, isDarkMode } = useModeAnimation({
    animationType: ThemeAnimationType.CIRCLE,
    blurAmount: 4, // Optional: adjust blur intensity
    duration: 1000, // Optional: adjust animation duration
  })

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as ThemeMode) || 'auto'
    setTheme(saved)
  }, [])


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
    toggleSwitchTheme()
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

  return (
    <motion.button
      ref={ref}
      onClick={toggleTheme}
      whileTap={{ rotate: 180, scale: 0.9 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="z-50 relative bg-gray-200 dark:bg-zinc-800 p-2 rounded-full text-yellow-600 dark:text-yellow-200 hover:scale-110 transition"
      title={`Chế độ giao diện: ${theme}`}
    >
      {renderIcon()}
    </motion.button>
  )
}
