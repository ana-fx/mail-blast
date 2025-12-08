'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useFeatureFlags, useFeatureFlagActions } from '@/hooks/useInternal'
import { FeatureFlag } from '@/lib/api/internal'
import { formatDateTime } from '@/lib/utils'

export default function FeatureFlagsToggle() {
  const { data: flags, isLoading } = useFeatureFlags()
  const { update, isUpdating } = useFeatureFlagActions()

  const handleToggle = (key: string, enabled: boolean) => {
    update({ key, enabled })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Feature Flags</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Enable or disable features</p>
      </div>

      {/* Flags Grid */}
      {isLoading ? (
        <div>Loading...</div>
      ) : flags && flags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.map((flag) => (
            <Card key={flag.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{flag.name}</CardTitle>
                  <Badge variant={flag.enabled ? 'default' : 'outline'}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {flag.description}
                </p>
                <div className="flex items-center justify-between">
                  <Label htmlFor={flag.key} className="text-sm">
                    Toggle Feature
                  </Label>
                  <Switch
                    id={flag.key}
                    checked={flag.enabled}
                    onCheckedChange={(checked) => handleToggle(flag.key, checked)}
                    disabled={isUpdating}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last updated: {formatDateTime(flag.updated_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-slate-500 dark:text-slate-400">
            No feature flags found
          </CardContent>
        </Card>
      )}
    </div>
  )
}

