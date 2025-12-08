'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  html: z.string().min(1, 'HTML content is required'),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface TemplateFormProps {
  initialData?: {
    name?: string
    description?: string
    html?: string
  }
  onSubmit: (data: TemplateFormData) => void
  isSubmitting?: boolean
}

export default function TemplateForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: TemplateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      html: initialData?.html || '',
    },
  })

  const html = watch('html')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Email Template"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="A brief description of this template"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTML Content *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              {...register('html')}
              placeholder="<html>...</html>"
              rows={15}
              className="font-mono text-sm"
            />
            {errors.html && (
              <p className="text-sm text-red-600">{errors.html.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </form>
  )
}

