'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useCampaignStore } from '@/store/campaignStore'

interface CampaignDetailsFormProps {
  onNext: () => void
  onCancel: () => void
}

export default function CampaignDetailsForm({ onNext, onCancel }: CampaignDetailsFormProps) {
  const { step1Data, setStep1Data } = useCampaignStore()

  const handleChange = (field: keyof typeof step1Data, value: string) => {
    setStep1Data({ [field]: value })
  }

  const handleNext = () => {
    // Validate all fields
    if (!step1Data.title || !step1Data.subject || !step1Data.from_name || !step1Data.from_email || !step1Data.reply_to) {
      return
    }
    onNext()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Enter the basic information for your email campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Campaign Name *
            </label>
            <Input
              id="title"
              placeholder="Summer Sale 2024"
              value={step1Data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-slate-700">
              Subject Line *
            </label>
            <Input
              id="subject"
              placeholder="Don't miss our summer sale!"
              value={step1Data.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="from_name" className="text-sm font-medium text-slate-700">
              From Name *
            </label>
            <Input
              id="from_name"
              placeholder="Your Company"
              value={step1Data.from_name}
              onChange={(e) => handleChange('from_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="from_email" className="text-sm font-medium text-slate-700">
              From Email *
            </label>
            <Input
              id="from_email"
              type="email"
              placeholder="noreply@example.com"
              value={step1Data.from_email}
              onChange={(e) => handleChange('from_email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reply_to" className="text-sm font-medium text-slate-700">
              Reply-To Email *
            </label>
            <Input
              id="reply_to"
              type="email"
              placeholder="support@example.com"
              value={step1Data.reply_to}
              onChange={(e) => handleChange('reply_to', e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleNext}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

