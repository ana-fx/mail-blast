'use client'

import React, { useEffect, useState } from 'react'
import { useOverview } from '@/hooks/useAnalytics'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { testBackendConnection } from '@/lib/api/test-connection'
import { BarChart3, AlertTriangle } from 'lucide-react'

export function AnalyticsOverview() {
  const { data, loading, error } = useOverview()
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)

  useEffect(() => {
    testBackendConnection().then(setBackendConnected)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200 font-semibold">Failed to load analytics data</p>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            Error: {error.message}
          </p>
        )}
        {backendConnected === false && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Backend server is not accessible
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Make sure backend server is running: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">cd backend && go run cmd/server/main.go</code>
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}
            </p>
          </div>
        )}
        {backendConnected === null && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Checking backend connection...
          </p>
        )}
      </div>
    )
  }

  const bounceRate = data.total_delivered > 0 
    ? data.total_bounced / data.total_delivered 
    : 0
  const complaintRate = data.total_delivered > 0 
    ? data.total_complaint / data.total_delivered 
    : 0

  const cards = [
    {
      title: 'Total Sent',
      value: formatNumber(data.total_sent),
      color: 'bg-blue-500',
    },
    {
      title: 'Delivered',
      value: formatNumber(data.total_delivered),
      color: 'bg-green-500',
    },
    {
      title: 'Bounce Rate',
      value: formatPercentage(bounceRate),
      color: 'bg-yellow-500',
    },
    {
      title: 'Open Rate',
      value: formatPercentage(data.open_rate),
      color: 'bg-purple-500',
    },
    {
      title: 'Click Rate',
      value: formatPercentage(data.click_rate),
      color: 'bg-indigo-500',
    },
    {
      title: 'Complaint Rate',
      value: formatPercentage(complaintRate),
      color: 'bg-red-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {card.value}
              </p>
            </div>
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

