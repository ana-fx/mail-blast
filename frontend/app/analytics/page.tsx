import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import OverviewCards from '@/components/analytics/OverviewCards'
import ChartLoader from '@/components/loaders/ChartLoader'
import TopLinksTable from '@/components/analytics/TopLinksTable'
import RecentEventsFeed from '@/components/analytics/RecentEventsFeed'

// Server Component - fetches initial data
async function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track your email campaign performance
        </p>
      </div>

      {/* Overview Cards - Fast, no Suspense */}
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCards />
      </Suspense>

      {/* Timeline Chart - Heavy, behind Suspense */}
      <Suspense fallback={<ChartSkeleton />}>
        <ChartLoader initialRange="30d" />
      </Suspense>

      {/* Top Links & Recent Events - Secondary content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<TableSkeleton />}>
          <TopLinksTable />
        </Suspense>
        <Suspense fallback={<FeedSkeleton />}>
          <RecentEventsFeed />
        </Suspense>
      </div>
    </div>
  )
}

function OverviewCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FeedSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default AnalyticsPage
