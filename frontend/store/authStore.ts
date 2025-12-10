'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: string
  client_id?: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState & { _hasHydrated: boolean }>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true })
      },
      setToken: (token) => {
        set({ token, isAuthenticated: !!token })
      },
      setUser: (user) => {
        set({ user, isAuthenticated: !!user && !!get().token })
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating auth store:', error)
            return
          }
          // Set isAuthenticated based on token after rehydration
          if (state?.token) {
            state.isAuthenticated = true
          }
          // Mark as hydrated
          state._hasHydrated = true
        }
      },
    }
  )
)

