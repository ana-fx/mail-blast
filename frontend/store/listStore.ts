'use client'

import { create } from 'zustand'

interface ListStore {
  selectedList: string | null
  selectedContacts: string[]
  setSelectedList: (id: string | null) => void
  setSelectedContacts: (ids: string[]) => void
  toggleContact: (id: string) => void
  reset: () => void
}

export const useListStore = create<ListStore>((set) => ({
  selectedList: null,
  selectedContacts: [],
  setSelectedList: (id) => set({ selectedList: id }),
  setSelectedContacts: (ids) => set({ selectedContacts: ids }),
  toggleContact: (id) => set((state) => ({
    selectedContacts: state.selectedContacts.includes(id)
      ? state.selectedContacts.filter((cid) => cid !== id)
      : [...state.selectedContacts, id],
  })),
  reset: () => set({
    selectedList: null,
    selectedContacts: [],
  }),
}))

