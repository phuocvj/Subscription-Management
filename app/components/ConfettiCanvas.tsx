'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    })

    const fire = () => {
      const duration = 2000
      const animationEnd = Date.now() + duration
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) {
          clearInterval(interval)
          return
        }

        const particleCount = 200 * (timeLeft / duration)
        myConfetti({
          ...defaults,
          particleCount,
          origin: {
            x: Math.random(),
            y: Math.random() * 0.6,
          },
        })
      }, 200)
    }

    // Gắn global
    window.myConfettiBoom = fire

    return () => {
      window.myConfettiBoom = undefined
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[1000]"
    />
  )
}
