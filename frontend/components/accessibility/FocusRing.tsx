'use client'

import { useEffect } from 'react'

// Global focus ring management for keyboard navigation
export function FocusRingManager() {
  useEffect(() => {
    let isKeyboardUser = false

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUser = true
        document.body.classList.add('keyboard-user')
      }
    }

    const handleMouseDown = () => {
      if (isKeyboardUser) {
        isKeyboardUser = false
        document.body.classList.remove('keyboard-user')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return null
}

