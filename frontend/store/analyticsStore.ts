'use client'

import { create } from 'zustand'

interface AnalyticsStore {
  selectedRange: '7d' | '30d' | '90d'
  selectedCampaign: string | null
  selectedList: string | null
  setRange: (range: '7d' | '30d' | '90d') => void
  setCampaign: (campaignId: string | null) => void
  setList: (listId: string | null) => void
  reset: () => void
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  selectedRange: '30d',
  selectedCampaign: null,
  selectedList: null,
  setRange: (range) => set({ selectedRange: range }),
  setCampaign: (campaignId) => set({ selectedCampaign: campaignId }),
  setList: (listId) => set({ selectedList: listId }),
  reset: () => set({
    selectedRange: '30d',
    selectedCampaign: null,
    selectedList: null,
  }),
}))

