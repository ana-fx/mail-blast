'use client'

import { useMemo, useEffect } from 'react'
import { WorkflowEngine } from '../workflow-engine'
import { campaignSendingMachine } from '../campaignSending.machine'
import { useWorkflow } from './useWorkflow'
import type { CampaignSendingContext, WorkflowConfig } from '../types'

export function useCampaignSending(config?: Partial<WorkflowConfig>) {
  const engine = useMemo(() => {
    const workflowConfig: WorkflowConfig = {
      id: 'campaignSending',
      persistKey: 'campaign-sending-workflow',
      ...config,
    }
    return new WorkflowEngine<CampaignSendingContext>(campaignSendingMachine, workflowConfig)
  }, [config])

  const workflow = useWorkflow<CampaignSendingContext>(engine)

  // Auto-start on mount
  useEffect(() => {
    engine.start()
  }, [engine])

  return {
    ...workflow,
    campaignId: workflow.context.campaignId,
    campaign: workflow.context.campaign,
    subject: workflow.context.subject,
    template: workflow.context.template,
    audience: workflow.context.audience,
    settings: workflow.context.settings,
    validationErrors: workflow.context.validationErrors,
    sendingResult: workflow.context.sendingResult,
  }
}

