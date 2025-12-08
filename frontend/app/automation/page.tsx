'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAutomationFlows } from '@/hooks/useAutomation'
import Link from 'next/link'

export default function AutomationPage() {
  const [queryClient] = useState(() => new QueryClient())
  const { data: flows, isLoading } = useAutomationFlows()

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Marketing Automation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Build automated email workflows
            </p>
          </div>
          <Link href="/automation/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Flow
            </Button>
          </Link>
        </motion.div>

        {/* Flows Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : flows && flows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flows.map((flow) => (
              <Link key={flow.id} href={`/automation/${flow.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{flow.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          flow.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : flow.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {flow.status}
                      </span>
                    </div>
                    {flow.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {flow.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{flow.nodes.length} nodes</span>
                      <span>v{flow.version}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                No automation flows yet. Create your first flow to get started.
              </p>
              <Link href="/automation/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Flow
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </QueryClientProvider>
  )
}

