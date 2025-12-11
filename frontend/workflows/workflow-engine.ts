'use client'

import { ActorRefFrom, createActor } from 'xstate'
import type { WorkflowContext, WorkflowConfig, WorkflowState } from './types'

export class WorkflowEngine<TContext extends WorkflowContext = WorkflowContext> {
  private actor: ActorRefFrom<any> | null = null
  private config: WorkflowConfig
  private machine: any

  constructor(machine: any, config: WorkflowConfig) {
    this.machine = machine
    this.config = config
    this.initialize()
  }

  private initialize() {
    const machineWithContext = this.machine.provide({
      context: () => ({
        ...this.machine.context,
        ...this.config.initialContext,
        ...this.loadPersistedState(),
      }),
    })

    this.actor = createActor(machineWithContext)
    this.actor.start()

    // Persist state changes
    this.actor.subscribe((state) => {
      if (this.config.persistKey) {
        this.persistState((state as any).context)
      }
    })
  }

  private loadPersistedState(): Partial<TContext> {
    if (typeof window === 'undefined' || !this.config.persistKey) {
      return {}
    }

    try {
      const stored = localStorage.getItem(this.config.persistKey)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  private persistState(context: TContext) {
    if (typeof window === 'undefined' || !this.config.persistKey) {
      return
    }

    try {
      localStorage.setItem(this.config.persistKey, JSON.stringify(context))
    } catch (error) {
      console.error('Failed to persist workflow state:', error)
    }
  }

  start() {
    if (this.actor) {
      this.actor.send({ type: 'START' })
    }
  }

  stop() {
    if (this.actor) {
      this.actor.send({ type: 'STOP' })
    }
  }

  reset() {
    if (this.actor) {
      this.actor.send({ type: 'RESET' })
      if (this.config.persistKey && typeof window !== 'undefined') {
        localStorage.removeItem(this.config.persistKey)
      }
    }
  }

  next() {
    if (this.actor) {
      this.actor.send({ type: 'NEXT' })
    }
  }

  back() {
    if (this.actor) {
      this.actor.send({ type: 'BACK' })
    }
  }

  update(data: Partial<TContext>) {
    if (this.actor) {
      this.actor.send({ type: 'UPDATE', data })
    }
  }

  send(event: { type: string; [key: string]: any }) {
    if (this.actor) {
      this.actor.send(event)
    }
  }

  getState(): WorkflowState | null {
    if (!this.actor) return null

    const snapshot = this.actor.getSnapshot() as any
    const value = typeof snapshot.value === 'string' ? snapshot.value : Object.keys(snapshot.value)[0]

    return {
      value,
      context: snapshot.context as TContext,
      canNext: this.canNext(),
      canBack: this.canBack(),
      isComplete: snapshot.status === 'done',
      isError: snapshot.status === 'error',
      error: snapshot.error,
    }
  }

  canNext(): boolean {
    if (!this.actor) return false
    const snapshot = this.actor.getSnapshot() as any
    // Check if there's a valid next transition
    return snapshot.can({ type: 'NEXT' }) || false
  }

  canBack(): boolean {
    if (!this.actor) return false
    const snapshot = this.actor.getSnapshot() as any
    // Check if there's a valid back transition
    return snapshot.can({ type: 'BACK' }) || false
  }

  cancel() {
    if (this.actor) {
      this.actor.send({ type: 'CANCEL' })
      if (this.config.onCancel) {
        this.config.onCancel()
      }
    }
  }

  subscribe(callback: (state: WorkflowState) => void) {
    if (!this.actor) return () => {}

    return this.actor.subscribe((state) => {
      const snapshot = state as any
      const value = typeof snapshot.value === 'string' ? snapshot.value : Object.keys(snapshot.value)[0]
      callback({
        value,
        context: snapshot.context as TContext,
        canNext: this.canNext(),
        canBack: this.canBack(),
        isComplete: snapshot.status === 'done',
        isError: snapshot.status === 'error',
        error: snapshot.error,
      })
    }).unsubscribe
  }
}

