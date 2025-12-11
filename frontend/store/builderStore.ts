'use client'

import { create } from 'zustand'

export interface BuilderBlock {
  id: string
  type: string
  props: Record<string, any>
  children?: BuilderBlock[]
}

export type Block = BuilderBlock

interface BuilderState {
  blocks: BuilderBlock[]
  selectedBlockId: string | null
  history: BuilderBlock[][]
  historyIndex: number
  isMobilePreview: boolean
  setBlocks: (blocks: BuilderBlock[]) => void
  addBlock: (block: BuilderBlock, parentId?: string) => void
  updateBlock: (id: string, updates: Record<string, any>) => void
  deleteBlock: (id: string) => void
  removeBlock: (id: string) => void // Alias for deleteBlock
  duplicateBlock: (id: string) => void
  reorderBlocks: (fromIndex: number, toIndex: number) => void
  selectBlock: (id: string | null) => void // Alias for setSelectedBlock
  setSelectedBlock: (id: string | null) => void
  toggleMobilePreview: () => void
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
  isMobilePreview: false,
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...initialState,
  setBlocks: (blocks) => {
    set({ blocks })
    get().saveHistory()
  },
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
  updateBlock: (id, updates) => {
    const updateRecursive = (blocks: BuilderBlock[]): BuilderBlock[] =>
      blocks.map((b) => {
        if (b.id === id) {
          // Smart update: if updating root properties (id, type, children), update them on root
          // Otherwise, merge into props
          const rootKeys = ['id', 'type', 'children', 'props']
          const newBlock = { ...b }
          const newProps = { ...b.props }

          Object.entries(updates).forEach(([key, value]) => {
            if (rootKeys.includes(key)) {
              // @ts-ignore
              newBlock[key] = value
            } else {
              newProps[key] = value
            }
          })

          newBlock.props = newProps
          return newBlock
        }
        return { ...b, children: b.children ? updateRecursive(b.children) : undefined }
      })
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
  removeBlock: (id) => get().deleteBlock(id),
  duplicateBlock: (id) => {
    const duplicateRecursive = (blocks: BuilderBlock[]): BuilderBlock[] => {
      let inserted = false
      const newBlocks = blocks.reduce((acc: BuilderBlock[], b) => {
        if (b.id === id) {
          const duplicated = {
            ...b,
            id: `${b.type}-${Date.now()}`,
            children: b.children ? JSON.parse(JSON.stringify(b.children)) : undefined, // Deep copy children
          }
          // Rename children ids
          const updateIds = (nodes: BuilderBlock[]) => {
            nodes.forEach(node => {
              node.id = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              if (node.children) updateIds(node.children)
            })
          }
          if (duplicated.children) updateIds(duplicated.children)

          acc.push(b, duplicated)
          inserted = true
        } else {
          if (b.children) {
            const updatedChildren = duplicateRecursive(b.children)
            acc.push({ ...b, children: updatedChildren })
          } else {
            acc.push(b)
          }
        }
        return acc
      }, [])
      return newBlocks
    }

    set({ blocks: duplicateRecursive(get().blocks) })
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
  selectBlock: (id) => set({ selectedBlockId: id }),
  toggleMobilePreview: () => set((state) => ({ isMobilePreview: !state.isMobilePreview })),
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
