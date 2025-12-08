'use client'

import { motion } from 'framer-motion'
import { Clock, Check, RotateCcw, Eye, GitCompare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TemplateVersion } from '@/lib/api/templates'
import { formatDateTime } from '@/lib/utils'

interface TemplateVersionListProps {
  versions: TemplateVersion[]
  currentVersionId?: string
  onCompare: (versionId: string) => void
  onRestore: (versionId: string) => void
  onPreview: (versionId: string, html: string) => void
  onSetDefault?: (versionId: string) => void
}

export default function TemplateVersionList({
  versions,
  currentVersionId,
  onCompare,
  onRestore,
  onPreview,
  onSetDefault,
}: TemplateVersionListProps) {
  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <motion.div
          key={version.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={version.is_default ? 'border-blue-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Version {version.version}
                    </span>
                    {version.is_default && (
                      <Badge variant="default" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(version.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(version.id, version.html)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  {version.id !== currentVersionId && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCompare(version.id)}
                      >
                        <GitCompare className="h-4 w-4 mr-2" />
                        Compare
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRestore(version.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </>
                  )}
                  {onSetDefault && !version.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetDefault(version.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

