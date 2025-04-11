'use client'

import React from 'react'

export default function SnowParticles() {
  const snowflakes = Array.from({ length: 80 })

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {snowflakes.map((_, i) => {
        const size = Math.random() * 8 + 4 // 4px ~ 12px
        const duration = Math.random() * 2 + 1.5 // 1.5s ~ 3.5s
        const left = Math.random() * 100 // %
        const delay = Math.random() * 1.5 // 0 ~ 1.5s
        return (
          <span
            key={i}
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
            className="absolute top-0 rounded-full bg-white opacity-70 animate-snow"
          />
        )
      })}
    </div>
  )
}
