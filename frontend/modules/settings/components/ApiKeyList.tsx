'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Key, Copy, Check, Plus, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiKeys } from '@/hooks/useApiKeys'
import { formatDateTime } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>

export default function ApiKeyList() {
  const { apiKeys, isLoading, createApiKey, deleteApiKey, isCreating, isDeleting } = useApiKeys()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
  })

  const onSubmit = (data: CreateApiKeyFormData) => {
    createApiKey(data, {
      onSuccess: (response) => {
        setNewKey(response.key)
        reset()
        // Toast success
      },
      onError: (error: any) => {
        // Toast error
        console.error('Failed to create API key:', error)
      },
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Keys</CardTitle>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Key
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Key className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p>No API keys yet</p>
                <p className="text-sm mt-2">Generate your first API key to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key, index) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{key.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {key.key_prefix}...
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Created {formatDateTime(key.created_at)}
                        {key.last_used && ` • Last used ${formatDateTime(key.last_used)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Revoke API key "${key.name}"?`)) {
                          deleteApiKey(key.id)
                        }
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newKey ? 'API Key Created' : 'Generate API Key'}</DialogTitle>
          </DialogHeader>
          {newKey ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  ⚠️ Save this key now. You won't be able to see it again!
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={newKey}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newKey)}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => {
                  setNewKey(null)
                  setCreateDialogOpen(false)
                }}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Production API Key"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Key'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

