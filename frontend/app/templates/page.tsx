'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { templatesApi } from '@/lib/api/templates'
import { useTemplateActions } from '@/hooks/useTemplateActions'
import TemplateCard from '@/components/templates/TemplateCard'
import DeleteTemplateModal from '@/components/templates/DeleteTemplateModal'

export default function TemplatesPage() {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list(),
  })

  const { duplicate, isDuplicating } = useTemplateActions()

  const handleEdit = (id: string) => {
    router.push(`/templates/${id}/edit`)
  }

  const handleDuplicate = (id: string) => {
    duplicate({ id })
  }

  const handleDelete = (id: string) => {
    setSelectedTemplateId(id)
    setDeleteModalOpen(true)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Email Templates
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your reusable email templates
            </p>
          </div>
          <Button
            onClick={() => router.push('/templates/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No templates yet. Create your first template to get started.
            </p>
            <Button
              onClick={() => router.push('/templates/new')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </motion.div>
        )}

        <DeleteTemplateModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setSelectedTemplateId(null)
          }}
          templateId={selectedTemplateId}
        />
      </div>
    </QueryClientProvider>
  )
}

