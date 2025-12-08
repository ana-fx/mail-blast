'use client'

import { useBuilderStore } from '@/store/builderStore'
import { GripVertical, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SectionBlockProps {
  block: any
  children?: React.ReactNode
}

export default function SectionBlock({ block, children }: SectionBlockProps) {
  const { selectedBlockId, selectBlock, removeBlock, duplicateBlock } = useBuilderStore()
  const isSelected = selectedBlockId === block.id

  return (
    <div
      className={cn(
        'relative group',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2'
      )}
      style={{
        padding: block.props.padding || '32px',
        backgroundColor: block.props.background || '#ffffff',
        textAlign: block.props.align || 'left',
      }}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
      }}
    >
      {/* Block Controls */}
      {isSelected && (
        <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              duplicateBlock(block.id)
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Delete this block?')) {
                removeBlock(block.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Drag Handle */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-slate-400" />
      </div>

      {children}
    </div>
  )
}

