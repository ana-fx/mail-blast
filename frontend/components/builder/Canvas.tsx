'use client'

import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import { useBuilderStore } from '@/store/builderStore'
import BlockRenderer from './BlockRenderer'
import { useState } from 'react'
import { createPortal } from 'react-dom'

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
}

export default function Canvas() {
    const { blocks, reorderBlocks, addBlock } = useBuilderStore()
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        // If dropping a sidebar item
        if (active.data.current?.isSidebar) {
            const type = active.data.current.type
            const newBlock: any = {
                id: `${type}-${Date.now()}`,
                type,
                props: getDefaultProps(type),
            }

            if (type === 'section') {
                newBlock.children = []
            }

            // If dropped over a specific index (placeholder logic for now)
            // For now we just append to the end
            addBlock(newBlock)
            return
        }

        // Reordering sorting items
        if (active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b.id === active.id)
            const newIndex = blocks.findIndex((b) => b.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderBlocks(oldIndex, newIndex)
            }
        }
    }

    const getDefaultProps = (type: string) => {
        switch (type) {
            case 'section':
                return { padding: '32px', background: '#ffffff', align: 'center' }
            case 'heading':
                return { text: 'Heading', size: 'xl', align: 'left', color: '#1e293b' }
            case 'paragraph':
                return { text: 'Paragraph text', align: 'left', color: '#64748b' }
            case 'button':
                return { text: 'Button', url: '#', style: 'solid', bgColor: '#2563eb', align: 'center' }
            case 'image':
                return { src: null, alt: '', width: '100%', align: 'center' }
            case 'spacer':
                return { height: 32 }
            default:
                return {}
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-full bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
                <div className="max-w-[600px] mx-auto min-h-[600px] md:min-h-[800px] bg-white shadow-lg">
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col min-h-full">
                            {blocks.map((block) => (
                                <BlockRenderer key={block.id} block={block} />
                            ))}

                            {blocks.length === 0 && (
                                <div className="flex-1 flex items-center justify-center p-12 py-24 border-2 border-dashed border-slate-200 m-8 rounded-lg text-slate-400">
                                    Drag blocks here or click from sidebar
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </div>
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <div className="p-4 bg-white shadow-xl rounded w-[300px] opacity-80 cursor-grabbing border-2 border-blue-500">
                            Dragging Item
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
