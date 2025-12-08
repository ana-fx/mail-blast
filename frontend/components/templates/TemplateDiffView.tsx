'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TemplateDiffViewProps {
  oldHtml: string
  newHtml: string
  oldVersion: number
  newVersion: number
}

export default function TemplateDiffView({
  oldHtml,
  newHtml,
  oldVersion,
  newVersion,
}: TemplateDiffViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Version {oldVersion}</CardTitle>
            <Badge variant="outline">Old</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: oldHtml }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Version {newVersion}</CardTitle>
            <Badge variant="default">New</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none border-2 border-blue-500 rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: newHtml }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

