'use client'

import { useState, useRef, useEffect } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface ParagraphBlockProps {
  block: any
}

export default function ParagraphBlock({ block }: ParagraphBlockProps) {
  const { selectedBlockId, selectBlock, updateBlock } = useBuilderStore()
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(block.props.text || '')
  const isSelected = selectedBlockId === block.id

  const handleBlur = () => {
    // setIsEditing(false) // Keep editing active if clicking toolbar
    updateBlock(block.id, { text })
  }

  // Effect to sync store changes to local state
  useEffect(() => {
    setText(block.props.text || '')
  }, [block.props.text])

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
  }

  return (
    <div
      className={cn(
        'relative group cursor-text min-h-[50px] transition-all',
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
      {isSelected ? (
        <div className="text-slate-900" onClick={e => e.stopPropagation()}>
          <ReactQuill
            theme="snow"
            value={text}
            onChange={(content) => {
              setText(content)
              updateBlock(block.id, { text: content })
            }}
            modules={modules}
            className="rich-text-editor"
          />
        </div>
      ) : (
        <div
          className="text-slate-700 leading-relaxed prose prose-sm max-w-none pointer-events-none"
          style={{
            color: block.props.color || '#64748b',
            textAlign: block.props.align || 'left',
          }}
          dangerouslySetInnerHTML={{ __html: text || '<p>Click to edit paragraph</p>' }}
        />
      )}

      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 1rem;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
      `}</style>
    </div>
  )
}


