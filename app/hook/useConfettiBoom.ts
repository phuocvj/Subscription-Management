'use client'

import { useCallback } from 'react'

export function useConfettiBoom() {
  const fire = useCallback(() => {
    if (typeof window === 'undefined' || !window.myConfettiBoom) return
    window.myConfettiBoom()
  }, [])

  return fire
}
