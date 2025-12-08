'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActor } from '@xstate/react'
import { WorkflowEngine } from '../workflow-engine'
import type { WorkflowState, WorkflowConfig, WorkflowContext } from '../types'

export function useWorkflow<TContext extends WorkflowContext = WorkflowContext>(
  engine: WorkflowEngine<TContext> | null
) {
  const [state, setState] = useState<WorkflowState | null>(null)

  useEffect(() => {
    if (!engine) return

    const unsubscribe = engine.subscribe((newState) => {
      setState(newState)
    })

    // Get initial state
    setState(engine.getState())

    return unsubscribe
  }, [engine])

  const next = useCallback(() => {
    engine?.next()
  }, [engine])

  const back = useCallback(() => {
    engine?.back()
  }, [engine])

  const update = useCallback((data: Partial<TContext>) => {
    engine?.update(data)
  }, [engine])

  const reset = useCallback(() => {
    engine?.reset()
  }, [engine])

  const cancel = useCallback(() => {
    engine?.cancel()
  }, [engine])

  const send = useCallback((event: { type: string; [key: string]: any }) => {
    engine?.send(event)
  }, [engine])

  return {
    state,
    step: state?.value || '',
    context: (state?.context || {}) as TContext,
    canNext: state?.canNext || false,
    canBack: state?.canBack || false,
    isComplete: state?.isComplete || false,
    isError: state?.isError || false,
    error: state?.error,
    next,
    back,
    update,
    reset,
    cancel,
    send,
  }
}

