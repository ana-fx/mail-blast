'use client'

import { create } from 'zustand'

interface ContactFilters {
  search: string
  status: string
  page: number
  limit: number
}

interface ImportConfig {
  email_field: string
  first_name_field?: string
  last_name_field?: string
}

interface ContactStore {
  filters: ContactFilters
  importConfig: ImportConfig
  selectedContacts: string[]
  setFilters: (filters: Partial<ContactFilters>) => void
  setImportConfig: (config: Partial<ImportConfig>) => void
  setSelectedContacts: (ids: string[]) => void
  toggleContact: (id: string) => void
  reset: () => void
}

const initialFilters: ContactFilters = {
  search: '',
  status: '',
  page: 1,
  limit: 20,
}

const initialImportConfig: ImportConfig = {
  email_field: 'email',
  first_name_field: 'first_name',
  last_name_field: 'last_name',
}

export const useContactStore = create<ContactStore>((set) => ({
  filters: initialFilters,
  importConfig: initialImportConfig,
  selectedContacts: [],
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setImportConfig: (config) => set((state) => ({ importConfig: { ...state.importConfig, ...config } })),
  setSelectedContacts: (ids) => set({ selectedContacts: ids }),
  toggleContact: (id) => set((state) => ({
    selectedContacts: state.selectedContacts.includes(id)
      ? state.selectedContacts.filter((cid) => cid !== id)
      : [...state.selectedContacts, id],
  })),
  reset: () => set({
    filters: initialFilters,
    importConfig: initialImportConfig,
    selectedContacts: [],
  }),
}))

