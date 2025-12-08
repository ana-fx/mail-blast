'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAutomationStore } from '@/store/automationStore'
import TriggerNode from './nodes/TriggerNode'
import ActionNode from './nodes/ActionNode'
import ConditionNode from './nodes/ConditionNode'

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
}

interface FlowCanvasProps {
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
}

export default function FlowCanvas({ onNodesChange, onEdgesChange }: FlowCanvasProps) {
  const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges, viewport, setViewport } = useAutomationStore()

  const [nodes, setNodesState, onNodesChangeInternal] = useNodesState(storeNodes as Node[])
  const [edges, setEdgesState, onEdgesChangeInternal] = useEdgesState(storeEdges as Edge[])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        markerEnd: { type: MarkerType.ArrowClosed },
      }
      setEdgesState((eds) => addEdge(newEdge, eds))
      setEdges([...edges, newEdge as any])
    },
    [edges, setEdges, setEdgesState]
  )

  const onNodesChangeHandler = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes)
      const updatedNodes = nodes.map((n) => {
        const change = changes.find((c: any) => c.id === n.id)
        if (change) {
          if (change.type === 'position' && change.position) {
            return { ...n, position: change.position }
          }
        }
        return n
      })
      setNodes(updatedNodes as any)
      onNodesChange?.(updatedNodes)
    },
    [nodes, onNodesChangeInternal, setNodes, onNodesChange]
  )

  const onEdgesChangeHandler = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes)
      const updatedEdges = edges.filter((e) => !changes.some((c: any) => c.id === e.id && c.type === 'remove'))
      setEdges(updatedEdges as any)
      onEdgesChange?.(updatedEdges)
    },
    [edges, onEdgesChangeInternal, setEdges, onEdgesChange]
  )

  const onMove = useCallback(
    (_: any, viewport: any) => {
      setViewport({ x: viewport.x, y: viewport.y, zoom: viewport.zoom })
    },
    [setViewport]
  )

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onMove={onMove}
        nodeTypes={nodeTypes}
        fitView
        defaultViewport={viewport}
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

