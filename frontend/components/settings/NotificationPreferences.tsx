'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { usePreferences } from '@/hooks/useProfile'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function NotificationPreferences() {
  const { preferences, updatePreferences, isUpdating } = usePreferences()
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    const updated = { ...localPreferences, [key]: value }
    setLocalPreferences(updated as any)
    updatePreferences({ [key]: value }, {
      onSuccess: () => {
        // Toast success
      },
      onError: () => {
        // Revert on error
        setLocalPreferences(preferences as any)
        // Toast error
      },
    })
  }

  if (!preferences && !localPreferences) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const prefs = localPreferences || preferences

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what email notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Digest */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly_digest" className="text-sm font-medium text-slate-900">
                Weekly Stats Digest
              </Label>
              <p className="text-xs text-slate-500">
                Receive a weekly summary of your email performance
              </p>
            </div>
            <Switch
              id="weekly_digest"
              checked={prefs?.weekly_digest || false}
              onCheckedChange={(checked) => handleToggle('weekly_digest', checked)}
              disabled={isUpdating}
            />
          </div>

          {/* Campaign Report Summary */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="campaign_report_summary" className="text-sm font-medium text-slate-900">
                Campaign Report Summary
              </Label>
              <p className="text-xs text-slate-500">
                Get a summary when campaigns complete
              </p>
            </div>
            <Switch
              id="campaign_report_summary"
              checked={prefs?.campaign_report_summary || false}
              onCheckedChange={(checked) => handleToggle('campaign_report_summary', checked)}
              disabled={isUpdating}
            />
          </div>

          {/* Alerts: Bounces */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts_bounces" className="text-sm font-medium text-slate-900">
                Bounce Alerts
              </Label>
              <p className="text-xs text-slate-500">
                Get notified when emails bounce
              </p>
            </div>
            <Switch
              id="alerts_bounces"
              checked={prefs?.alerts_bounces || false}
              onCheckedChange={(checked) => handleToggle('alerts_bounces', checked)}
              disabled={isUpdating}
            />
          </div>

          {/* Alerts: Failures */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alerts_failures" className="text-sm font-medium text-slate-900">
                Failure Alerts
              </Label>
              <p className="text-xs text-slate-500">
                Get notified when email sending fails
              </p>
            </div>
            <Switch
              id="alerts_failures"
              checked={prefs?.alerts_failures || false}
              onCheckedChange={(checked) => handleToggle('alerts_failures', checked)}
              disabled={isUpdating}
            />
          </div>

          {isUpdating && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving preferences...
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

