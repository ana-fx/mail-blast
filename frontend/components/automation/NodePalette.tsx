'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Zap, GitBranch, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAutomationStore } from '@/store/automationStore'
import { FlowNode } from '@/lib/api/automation'

const triggerTypes = [
  { type: 'on_subscriber_added', label: 'Subscriber Added', icon: Play },
  { type: 'on_tag_added', label: 'Tag Added', icon: Play },
  { type: 'on_date', label: 'On Date', icon: Play },
  { type: 'on_segment_match', label: 'Segment Match', icon: Play },
]

const actionTypes = [
  { type: 'send_email', label: 'Send Email', icon: Zap },
  { type: 'wait', label: 'Wait', icon: Zap },
  { type: 'add_tag', label: 'Add Tag', icon: Zap },
  { type: 'move_to_segment', label: 'Move to Segment', icon: Zap },
  { type: 'exit', label: 'Exit', icon: Zap },
]

const conditionTypes = [
  { type: 'if_else', label: 'If/Else', icon: GitBranch },
  { type: 'property_check', label: 'Property Check', icon: GitBranch },
]

export default function NodePalette() {
  const { addNode, nodes } = useAutomationStore()
  const [expanded, setExpanded] = useState(true)

  const handleAddNode = (nodeType: string, type: 'trigger' | 'action' | 'condition') => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type,
      nodeType,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: nodeType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        nodeType,
      },
    }
    addNode(newNode)
  }

  return (
    <Card className="w-64 h-full overflow-y-auto">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Add Node</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            <Plus className={`h-4 w-4 transition-transform ${expanded ? 'rotate-45' : ''}`} />
          </Button>
        </div>

        {expanded && (
          <div className="space-y-4">
            {/* Triggers */}
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">TRIGGERS</p>
              <div className="space-y-1">
                {triggerTypes.map((trigger) => {
                  const Icon = trigger.icon
                  return (
                    <Button
                      key={trigger.type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleAddNode(trigger.type, 'trigger')}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {trigger.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">ACTIONS</p>
              <div className="space-y-1">
                {actionTypes.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleAddNode(action.type, 'action')}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Conditions */}
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">CONDITIONS</p>
              <div className="space-y-1">
                {conditionTypes.map((condition) => {
                  const Icon = condition.icon
                  return (
                    <Button
                      key={condition.type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleAddNode(condition.type, 'condition')}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {condition.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

