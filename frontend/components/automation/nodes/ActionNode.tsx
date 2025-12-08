'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

function ActionNode({ data, selected }: NodeProps) {
  return (
    <Card className={`min-w-[200px] ${selected ? 'ring-2 ring-green-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-green-600" />
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
            Action
          </Badge>
        </div>
        <p className="font-medium text-sm">{data.label || data.nodeType}</p>
        {data.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.description}</p>
        )}
      </CardContent>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  )
}

export default memo(ActionNode)

