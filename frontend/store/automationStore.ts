'use client'

import { create } from 'zustand'
import { FlowNode, FlowEdge } from '@/lib/api/automation'

interface AutomationState {
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNode: string | null
  viewport: { x: number; y: number; zoom: number }
  setNodes: (nodes: FlowNode[]) => void
  setEdges: (edges: FlowEdge[]) => void
  addNode: (node: FlowNode) => void
  updateNode: (id: string, data: Partial<FlowNode>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: FlowEdge) => void
  deleteEdge: (id: string) => void
  setSelectedNode: (id: string | null) => void
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  reset: () => void
}

const initialState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  viewport: { x: 0, y: 0, zoom: 1 },
}

export const useAutomationStore = create<AutomationState>((set) => ({
  ...initialState,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  deleteEdge: (id) => set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),
  setSelectedNode: (id) => set({ selectedNode: id }),
  setViewport: (viewport) => set({ viewport }),
  reset: () => set(initialState),
}))

