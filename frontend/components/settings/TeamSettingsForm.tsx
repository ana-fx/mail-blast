'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TeamSettings } from '@/lib/api/settings'
import { useEffect } from 'react'

const teamSettingsSchema = z.object({
  organization_name: z.string().min(1, 'Organization name is required'),
  industry: z.string().optional(),
  branding_color: z.string().optional(),
})

type TeamSettingsFormData = z.infer<typeof teamSettingsSchema>

interface TeamSettingsFormProps {
  initialData?: TeamSettings
  onSubmit: (data: Partial<TeamSettings>) => void
  isSubmitting?: boolean
}

export default function TeamSettingsForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: TeamSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeamSettingsFormData>({
    resolver: zodResolver(teamSettingsSchema),
    defaultValues: {
      organization_name: initialData?.organization_name || '',
      industry: initialData?.industry || '',
      branding_color: initialData?.branding_color || '#2563eb',
    },
  })

  useEffect(() => {
    if (initialData) {
      setValue('organization_name', initialData.organization_name)
      setValue('industry', initialData.industry || '')
      setValue('branding_color', initialData.branding_color || '#2563eb')
    }
  }, [initialData, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Profile</CardTitle>
          <CardDescription>
            Configure your organization's profile and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization Name *</Label>
            <Input
              id="organization_name"
              {...register('organization_name')}
              placeholder="Acme Inc."
            />
            {errors.organization_name && (
              <p className="text-sm text-red-600">{errors.organization_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              {...register('industry')}
              placeholder="Technology"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branding_color">Branding Color</Label>
            <div className="flex gap-2">
              <Input
                id="branding_color"
                type="color"
                {...register('branding_color')}
                className="w-20 h-10"
              />
              <Input
                value={watch('branding_color')}
                onChange={(e) => setValue('branding_color', e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Logo upload coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Team Settings'}
        </Button>
      </div>
    </form>
  )
}

