'use client'

import { FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CMSIntegrationGuides() {
  const guides = [
    { name: 'Webflow', url: '/docs/integrations/webflow' },
    { name: 'Custom CMS', url: '/docs/integrations/custom' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        Step-by-step guides for integrating MailBlast with popular CMS platforms.
      </p>
      {guides.map((guide) => (
        <Card key={guide.name}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">{guide.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => window.open(guide.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

