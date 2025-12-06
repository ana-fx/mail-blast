'use client'

import React, { useState } from 'react'
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview'
import { AnalyticsTimelineChart } from '@/components/analytics/AnalyticsTimelineChart'
import { TopClickedLinks } from '@/components/analytics/TopClickedLinks'
import { EmailEventsModal } from '@/components/analytics/EmailEventsModal'

export default function AnalyticsPage() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Email Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time email performance metrics and insights
          </p>
        </div>

        <AnalyticsOverview />

        <AnalyticsTimelineChart />

        <TopClickedLinks />

        {selectedMessageId && (
          <EmailEventsModal
            messageId={selectedMessageId}
            onClose={() => setSelectedMessageId(null)}
          />
        )}
      </div>
    </div>
  )
}

