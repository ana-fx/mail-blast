'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { TrackingSettings } from '@/lib/api/settings'
import { useState, useEffect } from 'react'

interface TrackingSettingsFormProps {
  initialData?: TrackingSettings
  onSubmit: (data: TrackingSettings) => void
  isSubmitting?: boolean
}

export default function TrackingSettingsForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: TrackingSettingsFormProps) {
  const [openTracking, setOpenTracking] = useState(initialData?.open_tracking ?? true)
  const [clickTracking, setClickTracking] = useState(initialData?.click_tracking ?? true)
  const [customDomain, setCustomDomain] = useState(initialData?.custom_tracking_domain || '')

  useEffect(() => {
    if (initialData) {
      setOpenTracking(initialData.open_tracking)
      setClickTracking(initialData.click_tracking)
      setCustomDomain(initialData.custom_tracking_domain || '')
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      open_tracking: openTracking,
      click_tracking: clickTracking,
      custom_tracking_domain: customDomain || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tracking Settings</CardTitle>
          <CardDescription>
            Configure email tracking options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="open_tracking">Open Tracking</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track when emails are opened
              </p>
            </div>
            <Switch
              id="open_tracking"
              checked={openTracking}
              onCheckedChange={setOpenTracking}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="click_tracking">Click Tracking</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track when links are clicked
              </p>
            </div>
            <Switch
              id="click_tracking"
              checked={clickTracking}
              onCheckedChange={setClickTracking}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_tracking_domain">Custom Tracking Domain (CNAME)</Label>
            <Input
              id="custom_tracking_domain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="track.example.com"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optional: Use a custom domain for tracking links
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Tracking Settings'}
        </Button>
      </div>
    </form>
  )
}

