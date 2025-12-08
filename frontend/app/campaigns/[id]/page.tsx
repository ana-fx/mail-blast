'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { campaignsApi } from '@/lib/api/campaigns'
import { formatDateTime } from '@/lib/utils'
import { Copy, Send } from 'lucide-react'

export default function CampaignViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : ''

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.get(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Campaign not found</h1>
        <Button onClick={() => router.push('/campaigns')}>Back to Campaigns</Button>
      </div>
    )
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{campaign.title}</h1>
          <p className="text-slate-600 mt-1">{campaign.subject}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            onClick={() => router.push(`/campaigns/${id}/review`)}
          >
            <Send className="h-4 w-4 mr-2" />
            Review & Send
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-900">{formatDateTime(campaign.created_at)}</p>
              </CardContent>
            </Card>
            {campaign.send_at && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-600">Scheduled</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-900">{formatDateTime(campaign.send_at)}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-slate-900">-</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Open Rate</p>
                  <p className="text-2xl font-bold text-slate-900">-</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Click Rate</p>
                  <p className="text-2xl font-bold text-slate-900">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.content }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Audience information will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">From Name</label>
                <p className="text-slate-900">{campaign.from_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">From Email</label>
                <p className="text-slate-900">{campaign.from_email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Reply-To</label>
                <p className="text-slate-900">{campaign.reply_to}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

