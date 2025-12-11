'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Save, ArrowLeft, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '@/store/builderStore'
import { campaignsApi } from '@/lib/api/campaigns'
import BuilderSidebar from '@/components/builder/BuilderSidebar'
import Canvas from '@/components/builder/Canvas'
import { exportToHTML } from '@/lib/builder/htmlExport'

export default function CampaignBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = (params?.id as string) || ''
  const [queryClient] = useState(() => new QueryClient())

  const { blocks, setBlocks } = useBuilderStore()

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.get(campaignId),
    enabled: !!campaignId,
  })

  const { data: template } = useQuery({
    queryKey: ['campaign-template', campaignId],
    queryFn: () => campaignsApi.getTemplate(campaignId),
    enabled: !!campaignId,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const template = {
        version: 1,
        blocks: blocks,
      }
      await campaignsApi.saveTemplate(campaignId, template)

      // Also save HTML version
      const html = exportToHTML(blocks)
      await campaignsApi.update(campaignId, { content: html })
    },
  })

  useEffect(() => {
    if (template?.blocks) {
      setBlocks(template.blocks)
    }
  }, [template, setBlocks])

  const handleSave = () => {
    saveMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <BuilderSidebar />

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-20 relative">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/campaigns/${campaignId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {campaign?.title || 'Email Builder'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Drag & Drop Builder
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const html = exportToHTML(blocks)
                  const newWindow = window.open()
                  newWindow?.document.write(html)
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <Canvas />
        </div>
      </div>
    </QueryClientProvider>
  )
}
