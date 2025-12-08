'use client'

import { useMemo, useEffect } from 'react'
import { WorkflowEngine } from '../workflow-engine'
import { contactImportMachine } from '../contactImport.machine'
import { useWorkflow } from './useWorkflow'
import type { ContactImportContext, WorkflowConfig } from '../types'

export function useContactImport(config?: Partial<WorkflowConfig>) {
  const engine = useMemo(() => {
    const workflowConfig: WorkflowConfig = {
      id: 'contactImport',
      persistKey: 'contact-import-workflow',
      ...config,
    }
    return new WorkflowEngine<ContactImportContext>(contactImportMachine, workflowConfig)
  }, [config])

  const workflow = useWorkflow<ContactImportContext>(engine)

  useEffect(() => {
    engine.start()
  }, [engine])

  return {
    ...workflow,
    file: workflow.context.file,
    fileData: workflow.context.fileData,
    fieldMapping: workflow.context.fieldMapping,
    previewData: workflow.context.previewData,
    importResult: workflow.context.importResult,
  }
}

