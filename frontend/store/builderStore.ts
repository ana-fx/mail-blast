'use client'

import { create } from 'zustand'

export interface BuilderBlock {
  id: string
  type: string
  props: Record<string, any>
  children?: BuilderBlock[]
}

interface BuilderState {
  blocks: BuilderBlock[]
  selectedBlockId: string | null
  history: BuilderBlock[][]
  historyIndex: number
  addBlock: (block: BuilderBlock, parentId?: string) => void
  updateBlock: (id: string, props: Partial<BuilderBlock>) => void
  deleteBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  reorderBlocks: (fromIndex: number, toIndex: number) => void
  setSelectedBlock: (id: string | null) => void
  undo: () => void
  redo: () => void
  saveHistory: () => void
  reset: () => void
}

const initialState = {
  blocks: [],
  selectedBlockId: null,
  history: [[]],
  historyIndex: 0,
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...initialState,
  addBlock: (block, parentId) => {
    const state = get()
    const newBlocks = parentId
      ? state.blocks.map((b) =>
          b.id === parentId
            ? { ...b, children: [...(b.children || []), block] }
            : b
        )
      : [...state.blocks, block]
    set({ blocks: newBlocks })
    get().saveHistory()
  },
  updateBlock: (id, props) => {
    const updateRecursive = (blocks: BuilderBlock[]): BuilderBlock[] =>
      blocks.map((b) =>
        b.id === id ? { ...b, ...props } : { ...b, children: b.children ? updateRecursive(b.children) : undefined }
      )
    set({ blocks: updateRecursive(get().blocks) })
    get().saveHistory()
  },
  deleteBlock: (id) => {
    const deleteRecursive = (blocks: BuilderBlock[]): BuilderBlock[] =>
      blocks.filter((b) => {
        if (b.id === id) return false
        if (b.children) {
          b.children = deleteRecursive(b.children)
        }
        return true
      })
    set({ blocks: deleteRecursive(get().blocks), selectedBlockId: null })
    get().saveHistory()
  },
  duplicateBlock: (id) => {
    const duplicateRecursive = (blocks: BuilderBlock[]): BuilderBlock[] =>
      blocks.map((b) => {
        if (b.id === id) {
          const duplicated = {
            ...b,
            id: `${b.id}-copy-${Date.now()}`,
            children: b.children ? duplicateRecursive(b.children) : undefined,
          }
          return duplicated
        }
        return { ...b, children: b.children ? duplicateRecursive(b.children) : undefined }
      })
    // Implementation simplified - would need to find parent and insert
    get().saveHistory()
  },
  reorderBlocks: (fromIndex, toIndex) => {
    const blocks = [...get().blocks]
    const [moved] = blocks.splice(fromIndex, 1)
    blocks.splice(toIndex, 0, moved)
    set({ blocks })
    get().saveHistory()
  },
  setSelectedBlock: (id) => set({ selectedBlockId: id }),
  undo: () => {
    const state = get()
    if (state.historyIndex > 0) {
      set({
        blocks: state.history[state.historyIndex - 1],
        historyIndex: state.historyIndex - 1,
      })
    }
  },
  redo: () => {
    const state = get()
    if (state.historyIndex < state.history.length - 1) {
      set({
        blocks: state.history[state.historyIndex + 1],
        historyIndex: state.historyIndex + 1,
      })
    }
  },
  saveHistory: () => {
    const state = get()
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(state.blocks)))
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },
  reset: () => set(initialState),
}))
