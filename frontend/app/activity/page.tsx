'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useActivityLog } from '@/hooks/useActivityLog'
import ActivityTable from '@/components/activity/ActivityTable'
import ActivityFilters from '@/components/activity/ActivityFilters'

export default function ActivityPage() {
  const [queryClient] = useState(() => new QueryClient())
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [user, setUser] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const { data, isLoading } = useActivityLog({
    page,
    type: type || undefined,
    user: user || undefined,
    date_start: dateStart || undefined,
    date_end: dateEnd || undefined,
  })

  const handleReset = () => {
    setSearch('')
    setType('')
    setUser('')
    setDateStart('')
    setDateEnd('')
    setPage(1)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Activity Log
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Audit trail of all system activities
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ActivityFilters
            search={search}
            type={type}
            user={user}
            dateStart={dateStart}
            dateEnd={dateEnd}
            onSearchChange={setSearch}
            onTypeChange={setType}
            onUserChange={setUser}
            onDateStartChange={setDateStart}
            onDateEndChange={setDateEnd}
            onReset={handleReset}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ) : data?.logs && data.logs.length > 0 ? (
            <>
              <ActivityTable logs={data.logs} />
              {/* Pagination */}
              {data.total > data.per_page && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {((page - 1) * data.per_page) + 1} to {Math.min(page * data.per_page, data.total)} of {data.total} activities
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={!data.has_more}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400">
                  No activity logs found
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </QueryClientProvider>
  )
}

