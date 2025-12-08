'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Edit, BarChart3, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { campaignsApi, type Campaign } from '@/lib/api/campaigns'
import { formatDateTime } from '@/lib/utils'

export default function CampaignList() {
  const router = useRouter()
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list(),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'sending':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'draft':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-slate-100 p-6 mb-4">
            <Mail className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h3>
          <p className="text-slate-600 mb-6">Get started by creating your first email campaign</p>
          <Button onClick={() => router.push('/campaigns/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Subject</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Created</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-4">
                  <div className="font-medium text-slate-900">{campaign.title}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-slate-600">{campaign.subject}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-slate-500">
                    {formatDateTime(campaign.created_at)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

