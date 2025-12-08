'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Save, Play, Pause, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import FlowCanvas from '@/components/automation/FlowCanvas'
import NodePalette from '@/components/automation/NodePalette'
import { useAutomationFlow, useAutomationFlowActions } from '@/hooks/useAutomation'
import { useAutomationStore } from '@/store/automationStore'

export default function FlowEditorPage() {
  const params = useParams() as any
  const flowId = params?.id as string
  const [queryClient] = useState(() => new QueryClient())
  const { data: flow, isLoading } = useAutomationFlow(flowId)
  const { update, publish, unpublish, validate, isUpdating, isPublishing, validationResult } =
    useAutomationFlowActions()
  const { nodes, edges, setNodes, setEdges } = useAutomationStore()

  useEffect(() => {
    if (flow) {
      setNodes(flow.nodes as any)
      setEdges(flow.edges as any)
    }
  }, [flow, setNodes, setEdges])

  const handleSave = () => {
    if (flow) {
      update({
        id: flowId,
        data: {
          nodes: nodes as any,
          edges: edges as any,
        },
      })
    }
  }

  const handlePublish = () => {
    validate(flowId)
    if (validationResult?.valid) {
      publish(flowId)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!flow) {
    return <div>Flow not found</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <NodePalette />
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">{flow.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {flow.status === 'published' ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Published
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500">
                    <XCircle className="h-3 w-3" />
                    Draft
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isUpdating}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              {flow.status === 'published' ? (
                <Button variant="outline" onClick={() => unpublish(flowId)} disabled={isPublishing}>
                  <Pause className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
              ) : (
                <Button onClick={handlePublish} disabled={isPublishing}>
                  <Play className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1">
            <FlowCanvas />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

