'use client'

import { create } from 'zustand'

interface SettingsStore {
  activeTab: 'profile' | 'workspace' | 'admin'
  setActiveTab: (tab: 'profile' | 'workspace' | 'admin') => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  activeTab: 'profile',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))

