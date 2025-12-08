'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useState } from 'react'

const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  default_from_name: z.string().min(1, 'From name is required'),
  default_from_email: z.string().email('Invalid email address'),
})

type WorkspaceFormData = z.infer<typeof workspaceSchema>

export default function WorkspaceForm() {
  const { workspace, updateWorkspace, testWebhook, isUpdating, isTestingWebhook } = useWorkspace()
  const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    values: workspace ? {
      name: workspace.name,
      default_from_name: workspace.default_from_name,
      default_from_email: workspace.default_from_email,
    } : undefined,
  })

  const onSubmit = (data: WorkspaceFormData) => {
    updateWorkspace(data, {
      onSuccess: () => {
        // Toast success
      },
      onError: (error: any) => {
        // Toast error
        console.error('Failed to update workspace:', error)
      },
    })
  }

  const handleTestWebhook = () => {
    testWebhook(undefined, {
      onSuccess: (result) => {
        setWebhookTestResult(result)
        setTimeout(() => setWebhookTestResult(null), 5000)
      },
      onError: () => {
        setWebhookTestResult({ success: false, message: 'Webhook test failed' })
        setTimeout(() => setWebhookTestResult(null), 5000)
      },
    })
  }

  if (!workspace) {
    return <div>Loading...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Workspace Settings */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>Manage your workspace configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="My Workspace"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Default From Name */}
            <div className="space-y-2">
              <Label htmlFor="default_from_name">Default From Name</Label>
              <Input
                id="default_from_name"
                {...register('default_from_name')}
                placeholder="Your Company"
                className={errors.default_from_name ? 'border-red-500' : ''}
              />
              {errors.default_from_name && (
                <p className="text-xs text-red-500">{errors.default_from_name.message}</p>
              )}
            </div>

            {/* Default From Email */}
            <div className="space-y-2">
              <Label htmlFor="default_from_email">Default From Email</Label>
              <Input
                id="default_from_email"
                type="email"
                {...register('default_from_email')}
                placeholder="noreply@example.com"
                className={errors.default_from_email ? 'border-red-500' : ''}
              />
              {errors.default_from_email && (
                <p className="text-xs text-red-500">{errors.default_from_email.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tracking Configuration (Read-only) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tracking Configuration</CardTitle>
          <CardDescription>Email tracking settings (managed by backend)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pixel Tracking */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-slate-900">Pixel Tracking</Label>
              <p className="text-xs text-slate-500 mt-1">Track email opens</p>
            </div>
            <div className="flex items-center gap-2">
              {workspace.pixel_tracking_enabled ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm text-slate-600">
                {workspace.pixel_tracking_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Click Tracking */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-slate-900">Click Tracking</Label>
              <p className="text-xs text-slate-500 mt-1">Track link clicks</p>
            </div>
            <div className="flex items-center gap-2">
              {workspace.click_tracking_enabled ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm text-slate-600">
                {workspace.click_tracking_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Webhook Endpoint */}
          {workspace.webhook_endpoint && (
            <div className="space-y-2">
              <Label>Webhook Endpoint</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={workspace.webhook_endpoint}
                  readOnly
                  className="bg-slate-50 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                >
                  {isTestingWebhook ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
              </div>
              {webhookTestResult && (
                <div
                  className={`text-sm p-2 rounded ${
                    webhookTestResult.success
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {webhookTestResult.message}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

