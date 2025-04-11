'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SnowParticles from './SnowParticles'

export default function ThemeTransitionOverlay() {
    const { theme } = useTheme()
    const [showSnow, setShowSnow] = useState(false)

    useEffect(() => {
        setShowSnow(true)
        const timeout = setTimeout(() => setShowSnow(false), 1500)
        return () => clearTimeout(timeout)
    }, [theme])

    return (
        <AnimatePresence>
            {showSnow && (
                <motion.div
                    key="snow-transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
                    aria-hidden="true"
                >
                    {/* 💫 Lớp backdrop-blur phía sau */}
                    <motion.div
                        className="absolute inset-0  bg-white/10 dark:bg-black/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
