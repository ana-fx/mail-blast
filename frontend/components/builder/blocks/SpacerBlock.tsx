'use client'

import { useBuilderStore } from '@/store/builderStore'
import { cn } from '@/lib/utils'

interface SpacerBlockProps {
  block: any
}

export default function SpacerBlock({ block }: SpacerBlockProps) {
  const { selectedBlockId, selectBlock } = useBuilderStore()
  const isSelected = selectedBlockId === block.id

  return (
    <div
      className={cn(
        'relative group cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 ring-offset-1 rounded'
      )}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
      }}
      style={{
        height: `${block.props.height || 32}px`,
      }}
    >
      {isSelected && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded flex items-center justify-center">
          <span className="text-xs text-blue-500 font-medium">
            {block.props.height || 32}px
          </span>
        </div>
      )}
    </div>
  )
}

