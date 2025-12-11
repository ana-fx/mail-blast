'use client'

import { useEffect } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { useCampaignStore } from '@/store/campaignStore'
import BuilderSidebar from './builder/BuilderSidebar'
import Canvas from './builder/Canvas'
import { exportToHTML } from '@/lib/builder/htmlExport'
import { Button } from '@/components/ui/button'
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export default function IntegratedBuilder() {
    const { blocks, setBlocks, reorderBlocks } = useBuilderStore()
    const { step2Data, setStep2Data } = useCampaignStore()

    // Initialize store from campaign store data
    useEffect(() => {
        if (step2Data.blocks && step2Data.blocks.length > 0) {
            setBlocks(step2Data.blocks)
        } else {
            // Initialize with empty array or default blocks if needed
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

    return (
        <div className="flex flex-col lg:flex-row h-[800px] lg:h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-sm">
            {/* Sidebar */}
            <BuilderSidebar />

            {/* Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Canvas />
            </div>
        </div>
    )
}
