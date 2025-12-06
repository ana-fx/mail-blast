'use client'

import React, { useEffect } from 'react'
import { useEmailEvents } from '@/hooks/useAnalytics'
import { formatDateTime } from '@/lib/utils'

interface EmailEventsModalProps {
  messageId: string | null
  onClose: () => void
}

export function EmailEventsModal({ messageId, onClose }: EmailEventsModalProps) {
  const { data, loading, error } = useEmailEvents(messageId)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!messageId) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Email Events: {messageId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">Failed to load events</p>
            </div>
          )}

          {data && data.events.length === 0 && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No events found for this email
            </div>
          )}

          {data && data.events.length > 0 && (
            <div className="space-y-4">
              {data.events.map((event, index) => (
                <div
                  key={event.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.event_type === 'sent' || event.event_type === 'delivered'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : event.event_type === 'open' || event.event_type === 'click'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                          : event.event_type === 'bounce' || event.event_type === 'failed'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {event.event_type}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(event.created_at)}
                    </span>
                  </div>
                  {event.meta && Object.keys(event.meta).length > 0 && (
                    <div className="mt-3 bg-gray-50 dark:bg-gray-900/50 rounded p-3">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {JSON.stringify(event.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

