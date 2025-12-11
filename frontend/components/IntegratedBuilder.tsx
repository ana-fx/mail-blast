'use client'

import { useEffect, useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { useCampaignStore } from '@/store/campaignStore'
import BuilderSidebar from './builder/BuilderSidebar'
import Canvas from './builder/Canvas'
import { exportToHTML } from '@/lib/builder/htmlExport'
import { Button } from '@/components/ui/button'
import { Monitor, Smartphone } from 'lucide-react'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
    closestCenter,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
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

export default function IntegratedBuilder() {
    const { blocks, setBlocks, reorderBlocks, addBlock, isMobilePreview, toggleMobilePreview } = useBuilderStore()
    const { step2Data, setStep2Data } = useCampaignStore()
    const [activeId, setActiveId] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

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

    // Initialize store from campaign store data
    useEffect(() => {
        if (step2Data.blocks && step2Data.blocks.length > 0) {
            setBlocks(step2Data.blocks)
        } else {
            // Initialize with empty array
            setBlocks([])
        }
    }, []) // Run once on mount

    // Sync back to campaign store whenever blocks change
    useEffect(() => {
        const html = exportToHTML(blocks)
        setStep2Data({
            content: html,
            blocks: blocks
        })
    }, [blocks, setStep2Data])

    // For portal rendering
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        // If dropping a sidebar item (new block)
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

            addBlock(newBlock)
            return
        }

        // Reordering existing blocks
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

    const getActiveBlock = () => {
        if (!activeId) return null
        
        // Check if it's a sidebar item
        if (activeId.startsWith('sidebar-')) {
            const type = activeId.replace('sidebar-', '')
            return { type, text: type.charAt(0).toUpperCase() + type.slice(1) }
        }
        
        // Find from blocks
        const block = blocks.find(b => b.id === activeId)
        return block ? { type: block.type, text: block.type.charAt(0).toUpperCase() + block.type.slice(1) } : null
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col lg:flex-row min-h-[600px] lg:h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-sm">
                {/* Sidebar */}
                <BuilderSidebar />

                {/* Canvas */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <div className="h-12 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-end px-4 gap-2">
                         <div className="text-xs text-slate-500 mr-auto font-medium">Canvas</div>
                         <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMobilePreview}
                            className="gap-2 h-8 text-xs"
                        >
                            {isMobilePreview ? (
                                <>
                                    <Monitor className="h-3 w-3" />
                                    Desktop
                                </>
                            ) : (
                                <>
                                    <Smartphone className="h-3 w-3" />
                                    Mobile
                                </>
                            )}
                        </Button>
                    </div>
                    <Canvas />
                </div>
            </div>

            {mounted && createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <div className="p-4 bg-white shadow-2xl rounded-lg w-[280px] opacity-90 cursor-grabbing border-2 border-blue-500">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">
                                        {getActiveBlock()?.type.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="font-medium text-slate-900">
                                    {getActiveBlock()?.text || 'Block'}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
