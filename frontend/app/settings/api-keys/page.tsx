'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiKeys, useApiKeyActions } from '@/hooks/useApiKeys'
import { useHasPermission } from '@/hooks/useHasPermission'
import ApiKeyList from '@/components/settings/ApiKeyList'
import ApiKeyCreateModal from '@/components/settings/ApiKeyCreateModal'
import NoAccess from '@/components/admin/NoAccess'
import SettingsSidebar from '@/components/settings/SettingsSidebar'
import { CreateApiKeyResponse } from '@/lib/api/settings'

export default function ApiKeysPage() {
  const [queryClient] = useState(() => new QueryClient())
  const hasPermission = useHasPermission('settings.update')
  const { data: apiKeys, isLoading } = useApiKeys()
  const { create, regenerate, isCreating, isRegenerating } = useApiKeyActions()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false)
  const [regeneratedKey, setRegeneratedKey] = useState<CreateApiKeyResponse | null>(null)

  const handleCreate = (data: any, options?: { onSuccess?: (data: CreateApiKeyResponse) => void }) => {
    create(data, {
      onSuccess: (result) => {
        options?.onSuccess?.(result)
        setCreateModalOpen(false)
      },
    })
  }

  const handleRegenerate = (id: string) => {
    regenerate(id, {
      onSuccess: (result) => {
        setRegeneratedKey(result)
        setRegenerateModalOpen(true)
      },
    })
  }

  if (!hasPermission) {
    return <NoAccess />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <SettingsSidebar />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    API Keys
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Manage API keys for programmatic access
                  </p>
                </div>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New API Key
                </Button>
              </div>
            </motion.div>

            {/* API Keys List */}
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
              ) : apiKeys && apiKeys.length > 0 ? (
                <ApiKeyList
                  apiKeys={apiKeys}
                  onRegenerate={handleRegenerate}
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      No API keys found. Create your first API key to get started.
                    </p>
                    <Button
                      onClick={() => setCreateModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Create Modal */}
            <ApiKeyCreateModal
              open={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
              onSubmit={handleCreate}
              isSubmitting={isCreating}
            />

            {/* Regenerate Modal */}
            {regeneratedKey && (
              <ApiKeyCreateModal
                open={regenerateModalOpen}
                onClose={() => {
                  setRegenerateModalOpen(false)
                  setRegeneratedKey(null)
                }}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            )}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

