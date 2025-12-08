'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'
import { analyticsApi, type TopLink } from '@/lib/api/analytics'
import { formatDateTime } from '@/lib/utils'

interface TopLinksTableProps {
  onLinkClick?: (url: string) => void
}

export default function TopLinksTable({ onLinkClick }: TopLinksTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'top-links', 10],
    queryFn: () => analyticsApi.getTopLinks(10),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Top Clicked Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-slate-500">
            No links clicked yet
          </div>
        </CardContent>
      </Card>
    )
  }

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Top Clicked Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">URL</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Clicks</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Last Clicked</th>
                </tr>
              </thead>
              <tbody>
                {data.map((link, index) => (
                  <motion.tr
                    key={link.url}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    role="row"
                    onClick={() => onLinkClick?.(link.url)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onLinkClick?.(link.url)
                      }
                    }}
                    tabIndex={0}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 max-w-md">
                        <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span
                          className="text-sm text-slate-900 truncate"
                          title={link.url}
                        >
                          {truncateUrl(link.url)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-slate-900">
                        {link.click_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-500">
                        {formatDateTime(link.last_clicked)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

