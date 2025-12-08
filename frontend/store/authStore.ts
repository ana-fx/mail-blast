'use client'

import { create } from 'zustand'

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

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}))

