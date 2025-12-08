'use client'

import { motion } from 'framer-motion'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface IntegrationCardProps {
  name: string
  description: string
  icon: React.ReactNode
  status?: 'available' | 'coming_soon' | 'beta'
  onConfigure?: () => void
  children?: React.ReactNode
}

export default function IntegrationCard({
  name,
  description,
  icon,
  status = 'available',
  onConfigure,
  children,
}: IntegrationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {icon}
              </div>
              <div>
                <CardTitle className="text-lg">{name}</CardTitle>
                {status !== 'available' && (
                  <Badge variant="outline" className="mt-1">
                    {status === 'coming_soon' ? 'Coming Soon' : 'Beta'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <CardDescription className="mt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          {onConfigure && status === 'available' && (
            <Button
              onClick={onConfigure}
              className="w-full mt-4"
              variant="outline"
            >
              Configure
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

