'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Download, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { templatesApi } from '@/lib/api/templates'
import { useTemplateActions } from '@/hooks/useTemplateActions'
import { useTemplateVersions } from '@/hooks/useTemplateVersions'
import TemplateVersionList from '@/components/templates/TemplateVersionList'
import TemplatePreviewModal from '@/components/templates/TemplatePreviewModal'
import { formatDateTime } from '@/lib/utils'

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = (params?.id as string) || ''
  const [queryClient] = useState(() => new QueryClient())
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => templatesApi.get(templateId),
    enabled: !!templateId,
  })

  const { versions, isLoading: versionsLoading, restoreVersion, setDefaultVersion } = useTemplateVersions(templateId)
  const { duplicate } = useTemplateActions()

  const handleCompare = (versionId: string) => {
    router.push(`/templates/${templateId}/compare/${versionId}`)
  }

  const handlePreview = (versionId: string, html: string) => {
    setPreviewHtml(html)
    setPreviewOpen(true)
  }

  const handleRestore = (versionId: string) => {
    if (confirm('Restore this version? This will create a new version with this content.')) {
      restoreVersion(versionId)
    }
  }

  const handleExport = () => {
    if (!template) return
    const blob = new Blob([template.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCreateVersion = () => {
    if (!template) return
    router.push(`/templates/${templateId}/edit?newVersion=true`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Template not found</h1>
        <Button onClick={() => router.push('/templates')}>Back to Templates</Button>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/templates')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {template.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicate({ id: templateId })}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Template Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Information</CardTitle>
                <Button
                  onClick={handleCreateVersion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Version
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Created</span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {formatDateTime(template.created_at)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Last Updated</span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {formatDateTime(template.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Versions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Versions ({versions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {versionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <TemplateVersionList
                  versions={versions}
                  currentVersionId={template.latest_version?.id}
                  onCompare={handleCompare}
                  onRestore={handleRestore}
                  onPreview={handlePreview}
                  onSetDefault={setDefaultVersion}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <TemplatePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          html={previewHtml}
          title={template.name}
        />
      </div>
    </QueryClientProvider>
  )
}

