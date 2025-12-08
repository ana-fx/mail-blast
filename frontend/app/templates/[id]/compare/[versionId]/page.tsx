'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { templatesApi } from '@/lib/api/templates'
import TemplateDiffView from '@/components/templates/TemplateDiffView'

export default function TemplateComparePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = (params?.id as string) || ''
  const versionId = (params?.versionId as string) || ''
  const [queryClient] = useState(() => new QueryClient())

  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => templatesApi.get(templateId),
    enabled: !!templateId,
  })

  const { data: oldVersion, isLoading: oldVersionLoading } = useQuery({
    queryKey: ['template-version', templateId, versionId],
    queryFn: () => templatesApi.getVersion(templateId, versionId),
    enabled: !!templateId && !!versionId,
  })

  const currentVersion = template?.latest_version

  if (templateLoading || oldVersionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!template || !oldVersion || !currentVersion) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Version not found</h1>
        <Button onClick={() => router.push(`/templates/${templateId}`)}>
          Back to Template
        </Button>
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
              onClick={() => router.push(`/templates/${templateId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Compare Versions
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {template.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Diff View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TemplateDiffView
            oldHtml={oldVersion.html}
            newHtml={currentVersion.html}
            oldVersion={oldVersion.version}
            newVersion={currentVersion.version}
          />
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

