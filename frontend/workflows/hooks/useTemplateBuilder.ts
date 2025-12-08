'use client'

import { useMemo, useEffect } from 'react'
import { WorkflowEngine } from '../workflow-engine'
import { templateBuilderMachine } from '../templateBuilder.machine'
import { useWorkflow } from './useWorkflow'
import type { TemplateBuilderContext, WorkflowConfig } from '../types'

export function useTemplateBuilder(config?: Partial<WorkflowConfig>) {
  const engine = useMemo(() => {
    const workflowConfig: WorkflowConfig = {
      id: 'templateBuilder',
      persistKey: 'template-builder-workflow',
      ...config,
    }
    return new WorkflowEngine<TemplateBuilderContext>(templateBuilderMachine, workflowConfig)
  }, [config])

  const workflow = useWorkflow<TemplateBuilderContext>(engine)

  useEffect(() => {
    engine.start()
  }, [engine])

  // Auto-save every 5 seconds when in edit_blocks state
  useEffect(() => {
    if (workflow.step === 'edit_blocks' && workflow.context.autoSaveEnabled) {
      const interval = setInterval(() => {
        workflow.send({ type: 'AUTO_SAVE' })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [workflow.step, workflow.context.autoSaveEnabled, workflow.send])

  return {
    ...workflow,
    templateId: workflow.context.templateId,
    layout: workflow.context.layout,
    blocks: workflow.context.blocks,
    styles: workflow.context.styles,
  }
}

