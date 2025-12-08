'use client'

import { useState, useRef, useEffect } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { cn } from '@/lib/utils'

interface ParagraphBlockProps {
  block: any
}

export default function ParagraphBlock({ block }: ParagraphBlockProps) {
  const { selectedBlockId, selectBlock, updateBlock } = useBuilderStore()
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(block.props.text || '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSelected = selectedBlockId === block.id

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    updateBlock(block.id, { text })
  }

  return (
    <div
      className={cn(
        'relative group cursor-text',
        isSelected && 'ring-2 ring-blue-500 ring-offset-1 rounded'
      )}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
        if (!isEditing) {
          setIsEditing(true)
        }
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          className="w-full bg-transparent border-none outline-none focus:outline-none resize-none text-slate-700 leading-relaxed"
          style={{ color: block.props.color || '#64748b' }}
          rows={3}
        />
      ) : (
        <p
          className="text-slate-700 leading-relaxed"
          style={{
            color: block.props.color || '#64748b',
            textAlign: block.props.align || 'left',
          }}
        >
          {text || 'Click to edit paragraph'}
        </p>
      )}
    </div>
  )
}

