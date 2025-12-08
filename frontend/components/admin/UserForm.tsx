'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { CreateUserRequest } from '@/lib/api/admin'

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  send_invite: z.boolean().optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  initialData?: {
    name?: string
    email?: string
    role?: string
    status?: 'active' | 'disabled'
  }
  onSubmit: (data: CreateUserRequest) => void
  isSubmitting?: boolean
  showStatus?: boolean
}

export default function UserForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  showStatus = false,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData & { status?: 'active' | 'disabled' }>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      role: initialData?.role || 'viewer',
      send_invite: false,
      status: initialData?.status || 'active',
    },
  })

  const password = watch('password')
  const showPassword = watch('send_invite') === false

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {showPassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password {!initialData && '(optional)'}</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder={initialData ? 'Leave blank to keep current' : 'Auto-generate if blank'}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={watch('role')}
              onValueChange={(value) => setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {showStatus && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as 'active' | 'disabled')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!initialData && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="send_invite">Send Invite Email</Label>
                <p className="text-sm text-slate-500">
                  Send password reset link via email
                </p>
              </div>
              <Switch
                id="send_invite"
                checked={watch('send_invite')}
                onCheckedChange={(checked) => setValue('send_invite', checked)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}

