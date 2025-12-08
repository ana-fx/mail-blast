'use client'

import { useMemo, useEffect } from 'react'
import { WorkflowEngine } from '../workflow-engine'
import { domainVerificationMachine } from '../domainVerification.machine'
import { useWorkflow } from './useWorkflow'
import type { DomainVerificationContext, WorkflowConfig } from '../types'

export function useDomainVerification(config?: Partial<WorkflowConfig>) {
  const engine = useMemo(() => {
    const workflowConfig: WorkflowConfig = {
      id: 'domainVerification',
      persistKey: 'domain-verification-workflow',
      ...config,
    }
    return new WorkflowEngine<DomainVerificationContext>(domainVerificationMachine, workflowConfig)
  }, [config])

  const workflow = useWorkflow<DomainVerificationContext>(engine)

  useEffect(() => {
    engine.start()
  }, [engine])

  return {
    ...workflow,
    domain: workflow.context.domain,
    domainId: workflow.context.domainId,
    dnsRecords: workflow.context.dnsRecords,
    verificationStatus: workflow.context.verificationStatus,
  }
}

