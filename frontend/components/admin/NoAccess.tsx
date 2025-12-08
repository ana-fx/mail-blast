'use client'

import { motion } from 'framer-motion'
import { ShieldOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NoAccess() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ShieldOff className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You don't have permission to access this page. Please contact your administrator.
            </p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

