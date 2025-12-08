'use client'

import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTemplateActions } from '@/hooks/useTemplateActions'
import { useRouter } from 'next/navigation'

interface DeleteTemplateModalProps {
  open: boolean
  onClose: () => void
  templateId: string | null
}

export default function DeleteTemplateModal({
  open,
  onClose,
  templateId,
}: DeleteTemplateModalProps) {
  const router = useRouter()
  const { delete: deleteTemplate, isDeleting } = useTemplateActions()

  const handleDelete = () => {
    if (!templateId) return
    deleteTemplate(templateId, {
      onSuccess: () => {
        onClose()
        router.push('/templates')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <DialogTitle>Delete Template</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This template may be used in campaigns. Are you sure you want to delete it?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

