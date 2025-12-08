'use client'

import { useState, useRef, useEffect } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { cn } from '@/lib/utils'

interface HeadingBlockProps {
  block: any
}

const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

export default function HeadingBlock({ block }: HeadingBlockProps) {
  const { selectedBlockId, selectBlock, updateBlock } = useBuilderStore()
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(block.props.text || '')
  const inputRef = useRef<HTMLInputElement>(null)
  const isSelected = selectedBlockId === block.id

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    updateBlock(block.id, { text })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setText(block.props.text || '')
      setIsEditing(false)
    }
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
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full bg-transparent border-none outline-none focus:outline-none',
            sizeMap[block.props.size as keyof typeof sizeMap] || sizeMap.md,
            'font-bold',
            'text-slate-900'
          )}
          style={{ color: block.props.color || '#1e293b' }}
        />
      ) : (
        <h2
          className={cn(
            sizeMap[block.props.size as keyof typeof sizeMap] || sizeMap.md,
            'font-bold',
            'text-slate-900'
          )}
          style={{
            color: block.props.color || '#1e293b',
            textAlign: block.props.align || 'left',
          }}
        >
          {text || 'Click to edit heading'}
        </h2>
      )}
    </div>
  )
}

