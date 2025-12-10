import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import OverviewCards from '@/components/analytics/OverviewCards'
import ChartLoader from '@/components/loaders/ChartLoader'

// Server Component - streams content
async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Welcome back! Here's your email marketing overview.
        </p>
      </div>

      {/* Overview Cards - Fast, stream first */}
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCards />
      </Suspense>

      {/* Chart - Heavy, stream later */}
      <Suspense fallback={<ChartSkeleton />}>
        <ChartLoader initialRange="30d" />
      </Suspense>
    </div>
  )
}

function OverviewCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}

export default DashboardPage
