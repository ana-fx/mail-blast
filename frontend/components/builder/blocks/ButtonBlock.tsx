'use client'

import { useState, useRef, useEffect } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { cn } from '@/lib/utils'

interface ButtonBlockProps {
  block: any
}

export default function ButtonBlock({ block }: ButtonBlockProps) {
  const { selectedBlockId, selectBlock, updateBlock } = useBuilderStore()
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(block.props.text || 'Button')
  const [url, setUrl] = useState(block.props.url || '#')
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
    updateBlock(block.id, { text, url })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
    }
  }

  return (
    <div
      className={cn(
        'relative group',
        isSelected && 'ring-2 ring-blue-500 ring-offset-1 rounded'
      )}
      onClick={(e) => {
        e.stopPropagation()
        selectBlock(block.id)
        if (!isEditing) {
          setIsEditing(true)
        }
      }}
      style={{ textAlign: block.props.align || 'center' }}
    >
      {isEditing ? (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border border-slate-300 rounded-md"
            placeholder="Button text"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleBlur}
            className="w-full px-4 py-2 border border-slate-300 rounded-md text-sm"
            placeholder="https://example.com"
          />
        </div>
      ) : (
        <a
          href={url}
          className={cn(
            'inline-block px-6 py-3 rounded-lg font-medium text-white transition-colors',
            block.props.style === 'outline'
              ? 'bg-transparent border-2 border-blue-600 text-blue-600'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
          style={{
            backgroundColor: block.props.style !== 'outline' ? (block.props.bgColor || '#2563eb') : undefined,
            color: block.props.style === 'outline' ? (block.props.color || '#2563eb') : undefined,
            borderColor: block.props.style === 'outline' ? (block.props.color || '#2563eb') : undefined,
          }}
          onClick={(e) => {
            e.preventDefault()
            selectBlock(block.id)
            setIsEditing(true)
          }}
        >
          {text}
        </a>
      )}
    </div>
  )
}

