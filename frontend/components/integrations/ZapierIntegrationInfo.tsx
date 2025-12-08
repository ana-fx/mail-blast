'use client'

import { ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function ZapierIntegrationInfo() {
  const zapierLink = 'https://zapier.com/apps/mailblast/integrations'

  const handleCopyLink = () => {
    navigator.clipboard.writeText(zapierLink)
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Event Triggers:
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">Campaign Sent</Badge>
          <Badge variant="outline" className="text-xs">Email Opened</Badge>
          <Badge variant="outline" className="text-xs">Email Clicked</Badge>
          <Badge variant="outline" className="text-xs">Email Bounced</Badge>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Actions:
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">Create Campaign</Badge>
          <Badge variant="outline" className="text-xs">Add Contact</Badge>
          <Badge variant="outline" className="text-xs">Send Email</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <code className="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate mr-2">
              {zapierLink}
            </code>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleCopyLink}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => window.open(zapierLink, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

