'use client'

import { setup, assign } from 'xstate'
import type { CampaignSendingContext } from './types'

export const campaignSendingMachine = setup({
  types: {
    context: {} as CampaignSendingContext,
    events: {} as
      | { type: 'START' }
      | { type: 'NEXT' }
      | { type: 'BACK' }
      | { type: 'UPDATE'; data: Partial<CampaignSendingContext> }
      | { type: 'VALIDATE' }
      | { type: 'SEND' }
      | { type: 'RESET' }
      | { type: 'CANCEL' }
      | { type: 'ERROR'; error: Error },
  },
  guards: {
    hasSubject: ({ context }) => !!context.subject && context.subject.length > 0,
    hasTemplate: ({ context }) => !!context.template || !!context.campaign?.content,
    hasAudience: ({ context }) => {
      return !!(context.audience?.listId || context.audience?.segmentId) && (context.audience?.count || 0) > 0
    },
    hasSettings: ({ context }) => {
      return !!(context.settings?.fromName && context.settings?.fromEmail)
    },
    canProceed: ({ context, guard }) => {
      // Dynamic guard based on current state
      return true
    },
  },
  actions: {
    updateContext: assign(({ event }) => {
      if (event.type === 'UPDATE') {
        return { ...event.data }
      }
      return {}
    }),
    clearErrors: assign({
      validationErrors: () => undefined,
    }),
    setError: assign(({ event }) => {
      if (event.type === 'ERROR') {
        return { validationErrors: { general: [event.error.message] } }
      }
      return {}
    }),
  },
}).createMachine({
  id: 'campaignSending',
  initial: 'draft',
  context: {
    campaignId: undefined,
    campaign: undefined,
    subject: undefined,
    template: undefined,
    audience: undefined,
    settings: undefined,
    validationErrors: undefined,
    sendingResult: undefined,
  },
  states: {
    draft: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        NEXT: {
          guard: 'hasSubject',
          target: 'design_review',
        },
        ERROR: {
          actions: 'setError',
        },
      },
    },
    design_review: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'draft',
        },
        NEXT: {
          guard: 'hasTemplate',
          target: 'audience_select',
        },
        ERROR: {
          actions: 'setError',
        },
      },
    },
    audience_select: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'design_review',
        },
        NEXT: {
          guard: 'hasAudience',
          target: 'settings_config',
        },
        ERROR: {
          actions: 'setError',
        },
      },
    },
    settings_config: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'audience_select',
        },
        NEXT: {
          guard: 'hasSettings',
          target: 'confirm',
        },
        ERROR: {
          actions: 'setError',
        },
      },
    },
    confirm: {
      on: {
        BACK: {
          target: 'settings_config',
        },
        SEND: {
          target: 'queueing',
        },
        CANCEL: {
          target: 'draft',
        },
      },
    },
    queueing: {
      on: {
        NEXT: [
          {
            guard: ({ context }) => context.sendingResult?.success === true,
            target: 'result_success',
          },
          {
            guard: ({ context }) => context.sendingResult?.success === false,
            target: 'result_failed',
          },
        ],
        ERROR: {
          target: 'result_failed',
        },
      },
    },
    result_success: {
      type: 'final',
    },
    result_failed: {
      on: {
        BACK: {
          target: 'confirm',
        },
        RESET: {
          target: 'draft',
          actions: 'clearErrors',
        },
      },
    },
  },
  on: {
    RESET: {
      target: '.draft',
      actions: 'clearErrors',
    },
    CANCEL: {
      target: '.draft',
    },
  },
})

