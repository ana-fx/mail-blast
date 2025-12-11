'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function PasswordForm() {
  const { changePassword, isChangingPassword } = useProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = (data: PasswordFormData) => {
    changePassword(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          reset()
          // Toast success
        },
        onError: (error: any) => {
          // Toast error
          console.error('Failed to change password:', error)
        },
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="current_password" className="text-sm font-medium text-slate-700">
                Current Password
              </label>
              <Input
                id="current_password"
                type="password"
                {...register('current_password')}
                className={errors.current_password ? 'border-red-500' : ''}
              />
              {errors.current_password && (
                <p className="text-xs text-red-500">{errors.current_password.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="new_password" className="text-sm font-medium text-slate-700">
                New Password
              </label>
              <Input
                id="new_password"
                type="password"
                {...register('new_password')}
                className={errors.new_password ? 'border-red-500' : ''}
              />
              {errors.new_password && (
                <p className="text-xs text-red-500">{errors.new_password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <Input
                id="confirm_password"
                type="password"
                {...register('confirm_password')}
                className={errors.confirm_password ? 'border-red-500' : ''}
              />
              {errors.confirm_password && (
                <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

