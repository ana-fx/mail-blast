'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SystemSettings } from '@/lib/api/settings'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { useEffect } from 'react'

const systemSettingsSchema = z.object({
  app_name: z.string().min(1, 'App name is required'),
  default_from_email: z.string().email('Invalid email address'),
  default_from_name: z.string().min(1, 'From name is required'),
  reply_to_email: z.string().email('Invalid email address'),
  timezone: z.string().min(1, 'Timezone is required'),
  base_url: z.string().url('Invalid URL'),
})

type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>

interface SystemSettingsFormProps {
  initialData?: SystemSettings
  onSubmit: (data: Partial<SystemSettings>) => void
  isSubmitting?: boolean
}

export default function SystemSettingsForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: SystemSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      app_name: initialData?.app_name || '',
      default_from_email: initialData?.default_from_email || '',
      default_from_name: initialData?.default_from_name || '',
      reply_to_email: initialData?.reply_to_email || '',
      timezone: initialData?.timezone || 'UTC',
      base_url: initialData?.base_url || '',
    },
  })

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof SystemSettingsFormData, value as any)
      })
    }
  }, [initialData, setValue])

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure system-wide settings for your email platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app_name">App Name *</Label>
            <Input
              id="app_name"
              {...register('app_name')}
              placeholder="MailBlast"
            />
            {errors.app_name && (
              <p className="text-sm text-red-600">{errors.app_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_from_email">Default From Email *</Label>
              <Input
                id="default_from_email"
                type="email"
                {...register('default_from_email')}
                placeholder="noreply@example.com"
              />
              {errors.default_from_email && (
                <p className="text-sm text-red-600">{errors.default_from_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_from_name">Default From Name *</Label>
              <Input
                id="default_from_name"
                {...register('default_from_name')}
                placeholder="MailBlast"
              />
              {errors.default_from_name && (
                <p className="text-sm text-red-600">{errors.default_from_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply_to_email">Reply-To Email *</Label>
            <Input
              id="reply_to_email"
              type="email"
              {...register('reply_to_email')}
              placeholder="support@example.com"
            />
            {errors.reply_to_email && (
              <p className="text-sm text-red-600">{errors.reply_to_email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Select
                value={watch('timezone')}
                onValueChange={(value) => setValue('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-red-600">{errors.timezone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_url">Base URL *</Label>
              <Input
                id="base_url"
                {...register('base_url')}
                placeholder="https://mailblast.example.com"
              />
              {errors.base_url && (
                <p className="text-sm text-red-600">{errors.base_url.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}

