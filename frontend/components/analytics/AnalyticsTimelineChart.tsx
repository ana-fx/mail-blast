'use client'

import React, { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTimeline } from '@/hooks/useAnalytics'

const RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
]

export function AnalyticsTimelineChart() {
  const [range, setRange] = useState('7d')
  const { data, loading, error } = useTimeline(range)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-red-600 dark:text-red-400">Failed to load timeline data</p>
        {error && (
          <p className="text-sm text-red-500 dark:text-red-300 mt-2">
            Error: {error.message}
          </p>
        )}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">No timeline data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Email Performance Timeline
        </h2>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                range === r.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis className="text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--foreground)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="sent"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Sent"
          />
          <Line
            type="monotone"
            dataKey="delivered"
            stroke="#10b981"
            strokeWidth={2}
            name="Delivered"
          />
          <Line
            type="monotone"
            dataKey="opens"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Opens"
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#6366f1"
            strokeWidth={2}
            name="Clicks"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bounces & Complaints
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis className="text-gray-600 dark:text-gray-400" tick={{ fill: 'currentColor' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--foreground)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="bounces" fill="#f59e0b" name="Bounces" />
            <Bar dataKey="complaints" fill="#ef4444" name="Complaints" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

