'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CreateApiKeyRequest, CreateApiKeyResponse } from '@/lib/api/settings'
import ApiKeyScopesSelector from './ApiKeyScopesSelector'

interface ApiKeyCreateModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateApiKeyRequest, options?: { onSuccess?: (data: CreateApiKeyResponse) => void }) => void
  isSubmitting?: boolean
}

const availableScopes = [
  'campaigns.read',
  'campaigns.write',
  'contacts.read',
  'contacts.write',
  'templates.read',
  'templates.write',
  'analytics.read',
  'tracking.read',
]

export default function ApiKeyCreateModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ApiKeyCreateModalProps) {
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>([])
  const [expiresIn, setExpiresIn] = useState<string>('never')
  const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || scopes.length === 0) return

    const data: CreateApiKeyRequest = {
      name,
      scopes,
      expires_in_days: expiresIn === 'never' ? undefined : parseInt(expiresIn),
    }

    onSubmit(data, {
      onSuccess: (result) => {
        setCreatedKey(result)
      },
    })
  }

  const handleCopy = () => {
    if (createdKey?.key) {
      navigator.clipboard.writeText(createdKey.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setCreatedKey(null)
    setName('')
    setScopes([])
    setExpiresIn('never')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for programmatic access
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                API Key Created Successfully
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mb-4">
                Copy this key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white dark:bg-slate-800 px-3 py-2 rounded border text-sm font-mono break-all">
                  {createdKey.key}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">API Key Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Production API Key"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Scopes *</Label>
              <ApiKeyScopesSelector
                availableScopes={availableScopes}
                selectedScopes={scopes}
                onChange={setScopes}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_in">Expiration</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name || scopes.length === 0}>
                {isSubmitting ? 'Creating...' : 'Create API Key'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

