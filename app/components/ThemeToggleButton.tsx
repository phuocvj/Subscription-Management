'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'

export default function ThemeToggleButton() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [showPopup, setShowPopup] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('theme') || 'light'
        setTheme(saved as 'light' | 'dark')
        if (saved === 'dark') document.documentElement.classList.add('dark')
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', newTheme)
        document.documentElement.classList.toggle('dark')
        setTheme(newTheme)
        setShowPopup(true)
        setTimeout(() => setShowPopup(false), 1200)
    }

    return (
        <>
            <motion.button
                onClick={toggleTheme}
                whileTap={{ rotate: 180, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="z-50 relative bg-gray-200 dark:bg-zinc-800 p-2 rounded-full text-yellow-600 dark:text-yellow-200 hover:scale-110 transition"
                title="Chuyển giao diện"
            >
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
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
                        {theme === 'dark' ? <FaMoon size={100} /> : <FaSun size={100} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}