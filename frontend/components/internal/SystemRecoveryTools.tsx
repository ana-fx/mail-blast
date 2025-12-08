'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  RefreshCw,
  Trash2,
  AlertTriangle,
  StopCircle,
  Calculator,
  Database,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSystemRecovery } from '@/hooks/useInternal'

export default function SystemRecoveryTools() {
  const {
    rebuildIndex,
    flushCache,
    fixCampaign,
    stopWorker,
    recalculate,
    isRebuilding,
    isFlushing,
    isFixing,
    isStopping,
    isRecalculating,
  } = useSystemRecovery()
  const [campaignId, setCampaignId] = useState('')

  const tools = [
    {
      name: 'Rebuild Search Index',
      description: 'Rebuild Meilisearch index from database',
      icon: <Database className="h-5 w-5" />,
      action: () => {
        if (confirm('Rebuild search index? This may take a few minutes.')) {
          rebuildIndex()
        }
      },
      loading: isRebuilding,
      variant: 'default' as const,
    },
    {
      name: 'Flush Cache',
      description: 'Clear all Redis cache',
      icon: <Trash2 className="h-5 w-5" />,
      action: () => {
        if (confirm('Flush all cache? This will clear all cached data.')) {
          flushCache()
        }
      },
      loading: isFlushing,
      variant: 'default' as const,
    },
    {
      name: 'Fix Campaign Status',
      description: 'Reset stuck campaigns to draft',
      icon: <RefreshCw className="h-5 w-5" />,
      action: () => {
        if (confirm('Fix campaign status? This will reset stuck campaigns.')) {
          fixCampaign(campaignId || undefined)
        }
      },
      loading: isFixing,
      variant: 'default' as const,
      requiresInput: true,
    },
    {
      name: 'Force Stop Worker',
      description: 'Emergency stop all workers',
      icon: <StopCircle className="h-5 w-5" />,
      action: () => {
        if (confirm('Force stop all workers? This will interrupt all running jobs.')) {
          stopWorker()
        }
      },
      loading: isStopping,
      variant: 'destructive' as const,
    },
    {
      name: 'Recalculate Analytics',
      description: 'Recalculate all analytics metrics',
      icon: <Calculator className="h-5 w-5" />,
      action: () => {
        if (confirm('Recalculate analytics? This may take a while.')) {
          recalculate()
        }
      },
      loading: isRecalculating,
      variant: 'default' as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          System Recovery Tools
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Emergency recovery and maintenance tools
        </p>
      </div>

      {/* Warning */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Use with caution
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                These tools can affect system stability. Only use when necessary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign ID (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="campaign-id">Campaign ID</Label>
            <Input
              id="campaign-id"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="Leave empty to fix all stuck campaigns"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a specific campaign ID, or leave empty to fix all stuck campaigns
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card key={tool.name} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {tool.icon}
                </div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {tool.description}
              </p>
              <Button
                variant={tool.variant}
                className="w-full"
                onClick={tool.action}
                disabled={tool.loading}
              >
                {tool.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {tool.icon}
                    <span className="ml-2">Execute</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

