'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  Type,
  FileText,
  MousePointerClick,
  Image,
  Minus,
  Layout,
  Settings,
  Smartphone,
  Monitor
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBuilderStore } from '@/store/builderStore'
import BlockSettings from './BlockSettings'

const blockTypes = [
  { type: 'section', label: 'Section', icon: Layout, description: 'Container with background' },
  { type: 'heading', label: 'Heading', icon: Type, description: 'Text heading' },
  { type: 'paragraph', label: 'Paragraph', icon: FileText, description: 'Text content' },
  { type: 'button', label: 'Button', icon: MousePointerClick, description: 'Call-to-action button' },
  { type: 'image', label: 'Image', icon: Image, description: 'Image block' },
  { type: 'spacer', label: 'Spacer', icon: Minus, description: 'Vertical spacing' },
]

function DraggableBlock({ type, label, icon: Icon, description, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type,
      isSidebar: true,
    },
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card
          className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-slate-200 dark:border-slate-700 h-full"
          onClick={onClick}
        >
          <CardContent className="p-3 md:p-4 flex flex-col items-center text-center gap-2 h-full justify-between">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
              <Icon className="h-4 w-4 md:h-5 md:w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="w-full">
              <p className="text-xs md:text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                {label}
              </p>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-[28px] md:h-[32px]">
                {description}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function BuilderSidebar() {
  const { addBlock, selectedBlockId, isMobilePreview, toggleMobilePreview } = useBuilderStore()
  const [activeTab, setActiveTab] = useState('blocks')

  const handleAddBlock = (type: string) => {
    const newBlock: any = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type),
    }

    if (type === 'section') {
      newBlock.children = []
    }

    addBlock(newBlock)
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
    <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 flex flex-col max-h-[400px] lg:max-h-none lg:h-full z-10 shrink-0">


      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 shrink-0 rounded-none h-12">
          <TabsTrigger value="blocks" className="text-xs md:text-sm h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none bg-transparent">Blocks</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:shadow-none bg-transparent">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0 mt-3 md:mt-4">
          <div className="grid grid-cols-2 gap-2 md:gap-3 pb-4">
            {blockTypes.map((blockType) => (
              <div key={blockType.type} className="aspect-[4/3]">
                <DraggableBlock
                  {...blockType}
                  onClick={() => handleAddBlock(blockType.type)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-y-auto min-h-0 mt-3 md:mt-4">
          {selectedBlockId ? (
            <BlockSettings />
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              <Settings className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs md:text-sm">Select a block to edit settings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

