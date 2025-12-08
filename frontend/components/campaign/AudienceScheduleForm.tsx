'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCampaignStore } from '@/store/campaignStore'
import { useState } from 'react'
import { format } from 'date-fns'

interface AudienceScheduleFormProps {
  onFinish: (sendNow: boolean) => void
  onBack: () => void
}

export default function AudienceScheduleForm({ onFinish, onBack }: AudienceScheduleFormProps) {
  const { step3Data, setStep3Data } = useCampaignStore()
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const handleScheduleChange = () => {
    if (scheduleDate && scheduleTime) {
      const dateTime = new Date(`${scheduleDate}T${scheduleTime}`)
      setStep3Data({ send_at: dateTime.toISOString() })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Audience Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Audience</CardTitle>
          <CardDescription>Select who will receive this campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="contact_list" className="text-sm font-medium text-slate-700">
              Contact List
            </label>
            <select
              id="contact_list"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              value={step3Data.contact_list_id || ''}
              onChange={(e) => setStep3Data({ contact_list_id: e.target.value || undefined })}
            >
              <option value="">Select a contact list</option>
              <option value="all">All Contacts</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="exclude_unsubscribed"
              checked={step3Data.exclude_unsubscribed}
              onChange={(e) => setStep3Data({ exclude_unsubscribed: e.target.checked })}
              className="rounded border-slate-300"
            />
            <label htmlFor="exclude_unsubscribed" className="text-sm text-slate-600">
              Exclude unsubscribed contacts
            </label>
          </div>

          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Estimated recipients:</span> All active contacts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Choose when to send this campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="send_now"
                name="send_type"
                checked={step3Data.send_type === 'now'}
                onChange={() => setStep3Data({ send_type: 'now' })}
                className="border-slate-300"
              />
              <label htmlFor="send_now" className="text-sm font-medium text-slate-700">
                Send Now
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="schedule_later"
                name="send_type"
                checked={step3Data.send_type === 'later'}
                onChange={() => setStep3Data({ send_type: 'later' })}
                className="border-slate-300"
              />
              <label htmlFor="schedule_later" className="text-sm font-medium text-slate-700">
                Schedule Later
              </label>
            </div>
          </div>

          {step3Data.send_type === 'later' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-4 border-t"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="schedule_date" className="text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <Input
                    id="schedule_date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => {
                      setScheduleDate(e.target.value)
                      handleScheduleChange()
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="schedule_time" className="text-sm font-medium text-slate-700">
                    Time
                  </label>
                  <Input
                    id="schedule_time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => {
                      setScheduleTime(e.target.value)
                      handleScheduleChange()
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-3">
              {step3Data.send_type === 'later' && (
                <Button onClick={() => onFinish(false)}>
                  Finish & Schedule
                </Button>
              )}
              <Button onClick={() => onFinish(true)}>
                Finish & Send Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

