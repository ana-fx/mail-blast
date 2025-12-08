'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebhooks, useWebhookActions } from '@/hooks/useWebhooks'
import WebhookList from '@/components/webhooks/WebhookList'
import WebhookCreateDialog from '@/components/webhooks/WebhookCreateDialog'
import WebhookEditDialog from '@/components/webhooks/WebhookEditDialog'
import WebhookEventTester from '@/components/webhooks/WebhookEventTester'
import { CreateWebhookRequest, UpdateWebhookRequest } from '@/lib/api/webhooks'

export default function WebhooksPage() {
  const [queryClient] = useState(() => new QueryClient())
  const { data: webhooks, isLoading } = useWebhooks()
  const { create, update, test, isCreating, isUpdating, isTesting, testResult } = useWebhookActions()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)

  const handleCreate = (data: CreateWebhookRequest) => {
    create(data, {
      onSuccess: () => {
        setCreateModalOpen(false)
      },
    })
  }

  const handleEdit = (id: string) => {
    setSelectedWebhook(id)
    setEditModalOpen(true)
  }

  const handleUpdate = (id: string, data: UpdateWebhookRequest) => {
    update({ id, data }, {
      onSuccess: () => {
        setEditModalOpen(false)
        setSelectedWebhook(null)
      },
    })
  }

  const handleTest = (id: string) => {
    setSelectedWebhook(id)
    setTestModalOpen(true)
    test(id)
  }

  const selectedWebhookData = webhooks?.find((w) => w.id === selectedWebhook)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Webhooks
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Receive real-time events from your email platform
              </p>
            </div>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Webhook
            </Button>
          </div>
        </motion.div>

        {/* Webhooks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ) : webhooks && webhooks.length > 0 ? (
            <WebhookList webhooks={webhooks} onEdit={handleEdit} onTest={handleTest} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No webhooks configured. Create your first webhook to start receiving events.
                </p>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Modals */}
        <WebhookCreateDialog
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isCreating}
        />

        {selectedWebhookData && (
          <>
            <WebhookEditDialog
              open={editModalOpen}
              onClose={() => {
                setEditModalOpen(false)
                setSelectedWebhook(null)
              }}
              webhook={selectedWebhookData}
              onSubmit={handleUpdate}
              isSubmitting={isUpdating}
            />

            {selectedWebhook && (
              <WebhookEventTester
                open={testModalOpen}
                onClose={() => {
                  setTestModalOpen(false)
                  setSelectedWebhook(null)
                }}
                webhookId={selectedWebhook}
                onTest={test}
                isTesting={isTesting}
                testResult={testResult}
              />
            )}
          </>
        )}
      </div>
    </QueryClientProvider>
  )
}

