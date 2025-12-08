'use client'

import { create } from 'zustand'

interface ModalState {
  id: string
  component: React.ComponentType<any>
  props?: Record<string, any>
}

interface ModalStore {
  modals: ModalState[]
  openModal: (id: string, component: React.ComponentType<any>, props?: Record<string, any>) => void
  closeModal: (id: string) => void
  closeAll: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],
  openModal: (id, component, props) =>
    set((state) => ({
      modals: [...state.modals.filter((m) => m.id !== id), { id, component, props }],
    })),
  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    })),
  closeAll: () => set({ modals: [] }),
}))

