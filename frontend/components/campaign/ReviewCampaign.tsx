'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Calendar, Users, Eye } from 'lucide-react'
import { Campaign } from '@/lib/api/campaigns'
import { formatDateTime } from '@/lib/utils'

interface ReviewCampaignProps {
  campaign: Campaign
}

export default function ReviewCampaign({ campaign }: ReviewCampaignProps) {
  return (
    <div className="space-y-6">
      {/* Campaign Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Review your campaign before sending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Subject</label>
                <p className="text-base text-slate-900 font-medium">{campaign.subject}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">From</label>
                <p className="text-base text-slate-900">
                  {campaign.from_name} &lt;{campaign.from_email}&gt;
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Reply-To</label>
                <p className="text-base text-slate-900">{campaign.reply_to}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Status</label>
                <div>
                  <Badge variant={campaign.status === 'draft' ? 'secondary' : 'default'}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Email Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-slate-500" />
              <CardTitle>Email Preview</CardTitle>
            </div>
            <CardDescription>How your email will appear to recipients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-slate-200 rounded-lg p-6 bg-white">
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-sm text-slate-500 mb-1">Subject:</p>
                <p className="text-base font-medium text-slate-900">{campaign.subject}</p>
              </div>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.content || '<p>No content</p>' }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audience Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              <CardTitle>Audience</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Campaign will be sent to selected contact lists and segments.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

