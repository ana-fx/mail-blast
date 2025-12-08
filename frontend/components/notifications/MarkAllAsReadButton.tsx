'use client'

import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarkAllAsReadButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function MarkAllAsReadButton({
  onClick,
  disabled = false,
}: MarkAllAsReadButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <CheckCheck className="h-4 w-4 mr-2" />
      Mark All as Read
    </Button>
  )
}

