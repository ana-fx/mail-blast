'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDomains, useDomainActions } from '@/hooks/useDomain'
import DomainOnboardingWizard from '@/components/domain/DomainOnboardingWizard'
import { formatDateTime } from '@/lib/utils'

export default function DomainsPage() {
  const [queryClient] = useState(() => new QueryClient())
  const { data: domains, isLoading } = useDomains()
  const { recheck, delete: deleteDomain, isRechecking } = useDomainActions()
  const [showWizard, setShowWizard] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'verifying':
        return <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Verified</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'verifying':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Verifying</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  if (showWizard) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="max-w-6xl mx-auto py-6">
          <DomainOnboardingWizard onComplete={() => setShowWizard(false)} />
        </div>
      </QueryClientProvider>
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
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Domain & DNS Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage sending domains and DNS verification
            </p>
          </div>
          <Button onClick={() => setShowWizard(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </Button>
        </motion.div>

        {/* Domains List */}
        {isLoading ? (
          <div>Loading...</div>
        ) : domains && domains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domains.map((domain) => (
              <Card key={domain.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{domain.domain}</CardTitle>
                    {getStatusIcon(domain.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(domain.status)}
                  </div>

                  {domain.verified_at && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Verified: {formatDateTime(domain.verified_at)}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => recheck(domain.id)}
                      disabled={isRechecking}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isRechecking ? 'animate-spin' : ''}`} />
                      Re-check
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this domain?')) {
                          deleteDomain(domain.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No domains configured. Add your first domain to get started.
              </p>
              <Button onClick={() => setShowWizard(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </QueryClientProvider>
  )
}

