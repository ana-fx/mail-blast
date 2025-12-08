'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'

function TriggerNode({ data, selected }: NodeProps) {
  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-4 w-4 text-blue-600" />
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
            Trigger
          </Badge>
        </div>
        <p className="font-medium text-sm">{data.label || data.nodeType}</p>
        {data.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.description}</p>
        )}
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
}

export default memo(TriggerNode)

