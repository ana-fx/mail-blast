'use client'

import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useBuilderStore } from '@/store/builderStore'
import BlockRenderer from './BlockRenderer'

export default function Canvas() {
    const { blocks, isMobilePreview } = useBuilderStore()

    return (
        <div className="min-h-full bg-slate-50 dark:bg-slate-900 p-4 md:p-8 overflow-y-auto transition-all duration-300">
            <div 
                className={`mx-auto min-h-[400px] md:min-h-[600px] bg-white shadow-lg rounded-sm transition-all duration-300 ${
                    isMobilePreview ? 'max-w-[375px]' : 'max-w-[600px]'
                }`}
            >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col min-h-full">
                        {blocks.map((block) => (
                            <BlockRenderer key={block.id} block={block} />
                        ))}

                        {blocks.length === 0 && (
                            <div className="flex-1 flex items-center justify-center p-12 py-24 border-2 border-dashed border-slate-300 dark:border-slate-600 m-8 rounded-lg text-slate-400 dark:text-slate-500">
                                <div className="text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="text-sm font-medium mb-1">Drag blocks here</p>
                                    <p className="text-xs">Or click blocks from the sidebar to add them</p>
                                </div>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    )
}
