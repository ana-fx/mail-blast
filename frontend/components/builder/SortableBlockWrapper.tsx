'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '@/store/builderStore'
import { cn } from '@/lib/utils'

interface SortableBlockWrapperProps {
    id: string
    children: React.ReactNode
}

export default function SortableBlockWrapper({ id, children }: SortableBlockWrapperProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const { selectedBlockId, selectBlock, removeBlock, duplicateBlock } = useBuilderStore()
    const isSelected = selectedBlockId === id

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 999 : (isSelected ? 50 : 'auto'),
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative -ml-4 pl-4', // Negative margin hack to make space for drag handle without affecting layout
                isSelected && 'ring-2 ring-blue-500 ring-offset-4 rounded-sm'
            )}
            onClick={(e) => {
                e.stopPropagation()
                selectBlock(id)
            }}
        >
            {/* Block Controls - Only visible on hover or selection */}
            <div
                className={cn(
                    "absolute -left-8 top-0 flex flex-col gap-1 z-50",
                    isSelected || "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
            >
                <div
                    className="cursor-move p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 outline-none"
                    {...listeners}
                    {...attributes}
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {isSelected && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={(e) => {
                                e.stopPropagation()
                                duplicateBlock(id)
                            }}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                            onClick={(e) => {
                                e.stopPropagation()
                                // Simple confirmation for now - could be a dialog
                                if (confirm('Delete this block?')) {
                                    removeBlock(id)
                                }
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </>
                )}
            </div>

            {children}
        </div>
    )
}
