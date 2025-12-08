'use client'

import { useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageBlockProps {
  block: any
}

export default function ImageBlock({ block }: ImageBlockProps) {
  const { selectedBlockId, selectBlock, updateBlock } = useBuilderStore()
  const [isUploading, setIsUploading] = useState(false)
  const isSelected = selectedBlockId === block.id

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    // TODO: Upload to backend
    // For now, use data URL
    const reader = new FileReader()
    reader.onloadend = () => {
      updateBlock(block.id, { src: reader.result as string })
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
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
      }}
      style={{ textAlign: block.props.align || 'center' }}
    >
      {block.props.src ? (
        <div className="relative">
          <img
            src={block.props.src}
            alt={block.props.alt || ''}
            className="max-w-full h-auto rounded-lg"
            style={{ width: block.props.width || '100%' }}
          />
          {isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                updateBlock(block.id, { src: null })
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-600">Click to upload image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  )
}

