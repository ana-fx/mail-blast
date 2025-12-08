'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTemplateActions } from '@/hooks/useTemplateActions'
import TemplateForm from '@/components/templates/TemplateForm'
import { CreateTemplateRequest } from '@/lib/api/templates'

export default function NewTemplatePage() {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())
  const { create, isCreating } = useTemplateActions()

  const handleSubmit = (data: CreateTemplateRequest) => {
    create(data, {
      onSuccess: (template) => {
        router.push(`/templates/${template.id}`)
      },
    })
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
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Create New Template
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Build a reusable email template
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <TemplateForm onSubmit={handleSubmit} isSubmitting={isCreating} />
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

