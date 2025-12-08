'use client'

import { Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function MakeIntegrationInfo() {
  const webhookTemplate = `{
  "url": "https://your-app.com/webhook",
  "event_types": [
    "campaign.sent",
    "email.opened",
    "email.clicked"
  ]
}`

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookTemplate)
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Use Make.com's Webhook module to receive events from MailBlast.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Webhook Template:
        </p>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <pre className="text-xs text-slate-600 dark:text-slate-400 flex-1 overflow-x-auto">
                {webhookTemplate}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Available Events:
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">campaign.*</Badge>
          <Badge variant="outline" className="text-xs">email.*</Badge>
          <Badge variant="outline" className="text-xs">contact.*</Badge>
        </div>
      </div>
    </div>
  )
}

