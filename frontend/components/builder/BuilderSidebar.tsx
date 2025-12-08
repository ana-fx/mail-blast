'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Builder</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobilePreview}
          className="gap-2"
        >
          {isMobilePreview ? (
            <>
              <Monitor className="h-4 w-4" />
              Desktop
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4" />
              Mobile
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {blockTypes.map((blockType) => {
              const Icon = blockType.icon
              return (
                <motion.div
                  key={blockType.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 dark:border-slate-700"
                    onClick={() => handleAddBlock(blockType.type)}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {blockType.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {blockType.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-y-auto">
          {selectedBlockId ? (
            <BlockSettings />
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a block to edit settings</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

