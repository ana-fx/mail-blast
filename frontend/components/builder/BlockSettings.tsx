'use client'

import { useBuilderStore } from '@/store/builderStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BlockSettings() {
  const { blocks, selectedBlockId, updateBlock } = useBuilderStore()
  
  const selectedBlock = selectedBlockId
    ? findBlock(blocks, selectedBlockId)
    : null

  if (!selectedBlock) {
    return null
  }

  const handleChange = (key: string, value: any) => {
    updateBlock(selectedBlock.id, { [key]: value })
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm capitalize">{selectedBlock.type} Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedBlock.type === 'section' && (
            <>
              <div className="space-y-2">
                <Label>Padding</Label>
                <Input
                  value={selectedBlock.props.padding || '32px'}
                  onChange={(e) => handleChange('padding', e.target.value)}
                  placeholder="32px"
                />
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={selectedBlock.props.background || '#ffffff'}
                  onChange={(e) => handleChange('background', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={selectedBlock.props.align || 'center'}
                  onValueChange={(value) => handleChange('align', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedBlock.type === 'heading' && (
            <>
              <div className="space-y-2">
                <Label>Size</Label>
                <Select
                  value={selectedBlock.props.size || 'xl'}
                  onValueChange={(value) => handleChange('size', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedBlock.props.color || '#1e293b'}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={selectedBlock.props.align || 'left'}
                  onValueChange={(value) => handleChange('align', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedBlock.type === 'paragraph' && (
            <>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedBlock.props.color || '#64748b'}
                  onChange={(e) => handleChange('color', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={selectedBlock.props.align || 'left'}
                  onValueChange={(value) => handleChange('align', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedBlock.type === 'button' && (
            <>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={selectedBlock.props.url || '#'}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <Select
                  value={selectedBlock.props.style || 'solid'}
                  onValueChange={(value) => handleChange('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={selectedBlock.props.bgColor || '#2563eb'}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select
                  value={selectedBlock.props.align || 'center'}
                  onValueChange={(value) => handleChange('align', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedBlock.type === 'spacer' && (
            <div className="space-y-2">
              <Label>Height (px)</Label>
              <Input
                type="number"
                value={selectedBlock.props.height || 32}
                onChange={(e) => handleChange('height', parseInt(e.target.value) || 32)}
                min={0}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function findBlock(blocks: any[], id: string): any | null {
  for (const block of blocks) {
    if (block.id === id) return block
    if (block.children) {
      const found = findBlock(block.children, id)
      if (found) return found
    }
  }
  return null
}

