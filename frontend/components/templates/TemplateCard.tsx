'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit, Copy, Trash2, Eye, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Template } from '@/lib/api/templates'
import { formatDateTime } from '@/lib/utils'
import TemplatePreviewModal from './TemplatePreviewModal'

interface TemplateCardProps {
  template: Template
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export default function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {template.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(template.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(template.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {/* Preview Thumbnail */}
            <div
              className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden border border-slate-200 dark:border-slate-700"
              onClick={() => setShowPreview(true)}
            >
              <div
                className="w-full h-full p-4 text-xs prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: template.html || template.latest_version?.html || '<p>No preview</p>',
                }}
                style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '333%', height: '333%' }}
              />
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{template.version_count} version{template.version_count !== 1 ? 's' : ''}</span>
              <span>{formatDateTime(template.updated_at)}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showPreview && (
        <TemplatePreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          html={template.html || template.latest_version?.html || ''}
          title={template.name}
        />
      )}
    </>
  )
}

