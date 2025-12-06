'use client'

import React from 'react'
import { useTopLinks } from '@/hooks/useAnalytics'
import { formatNumber, formatDateTime } from '@/lib/utils'

export function TopClickedLinks() {
  const { data, loading, error } = useTopLinks(10)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">No click data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Top Clicked Links
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                URL
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Clicks
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Last Clicked
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((link, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="py-3 px-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-md block"
                    title={link.url}
                  >
                    {link.url.length > 60 ? `${link.url.substring(0, 60)}...` : link.url}
                  </a>
                </td>
                <td className="text-right py-3 px-4 text-gray-900 dark:text-white font-medium">
                  {formatNumber(link.click_count)}
                </td>
                <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(link.last_clicked)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

