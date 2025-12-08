'use client'

import { setup, assign } from 'xstate'
import type { DomainVerificationContext } from './types'

export const domainVerificationMachine = setup({
  types: {
    context: {} as DomainVerificationContext,
    events: {} as
      | { type: 'START' }
      | { type: 'NEXT' }
      | { type: 'BACK' }
      | { type: 'UPDATE'; data: Partial<DomainVerificationContext> }
      | { type: 'CHECK_STATUS' }
      | { type: 'DNS_SETUP' }
      | { type: 'VERIFY' }
      | { type: 'RECHECK' }
      | { type: 'MANUAL_OVERRIDE' }
      | { type: 'RESET' }
      | { type: 'CANCEL' }
      | { type: 'ERROR'; error: Error },
  },
  guards: {
    hasDomain: ({ context }) => !!context.domain,
    isVerified: ({ context }) => context.verificationStatus === 'verified',
    isFailed: ({ context }) => context.verificationStatus === 'failed',
    hasDNSRecords: ({ context }) => !!(context.dnsRecords && context.dnsRecords.length > 0),
  },
  actions: {
    updateContext: assign(({ event }) => {
      if (event.type === 'UPDATE') {
        return { ...event.data }
      }
      return {}
    }),
    setVerificationStatus: assign(({ event, context }) => {
      // This would be set by external events
      return {}
    }),
  },
}).createMachine({
  id: 'domainVerification',
  initial: 'check_status',
  context: {
    domain: undefined,
    domainId: undefined,
    dnsRecords: undefined,
    verificationStatus: 'pending',
    currentStep: 1,
  },
  states: {
    check_status: {
      on: {
        CHECK_STATUS: {
          target: 'dns_setup',
        },
        UPDATE: {
          actions: 'updateContext',
        },
      },
    },
    dns_setup: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'check_status',
        },
        NEXT: {
          guard: 'hasDNSRecords',
          target: 'waiting_propagation',
        },
        VERIFY: {
          target: 'waiting_propagation',
        },
      },
    },
    waiting_propagation: {
      on: {
        RECHECK: {
          target: 'waiting_propagation',
        },
        NEXT: [
          {
            guard: 'isVerified',
            target: 'success',
          },
          {
            guard: 'isFailed',
            target: 'manual_override_error',
          },
        ],
        UPDATE: {
          actions: 'updateContext',
        },
      },
    },
    success: {
      type: 'final',
    },
    manual_override_error: {
      on: {
        BACK: {
          target: 'dns_setup',
        },
        RECHECK: {
          target: 'waiting_propagation',
        },
        RESET: {
          target: 'check_status',
        },
      },
    },
  },
  on: {
    RESET: {
      target: '.check_status',
    },
    CANCEL: {
      target: '.check_status',
    },
  },
})

