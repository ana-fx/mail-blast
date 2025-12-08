'use client'

import { setup, assign } from 'xstate'
import type { ContactImportContext } from './types'

export const contactImportMachine = setup({
  types: {
    context: {} as ContactImportContext,
    events: {} as
      | { type: 'START' }
      | { type: 'NEXT' }
      | { type: 'BACK' }
      | { type: 'UPDATE'; data: Partial<ContactImportContext> }
      | { type: 'UPLOAD_FILE'; file: File }
      | { type: 'MAP_FIELDS'; mapping: Record<string, string> }
      | { type: 'CONFIRM_IMPORT' }
      | { type: 'RESET' }
      | { type: 'CANCEL' }
      | { type: 'ERROR'; error: Error },
  },
  guards: {
    hasFile: ({ context }) => !!context.file,
    isCSV: ({ context }) => {
      if (!context.file) return false
      return context.file.type === 'text/csv' || context.file.name.endsWith('.csv')
    },
    hasMapping: ({ context }) => {
      return !!context.fieldMapping && Object.keys(context.fieldMapping).length > 0
    },
    hasEmailMapping: ({ context }) => {
      return !!(context.fieldMapping && Object.values(context.fieldMapping).includes('email'))
    },
  },
  actions: {
    updateContext: assign(({ event }) => {
      if (event.type === 'UPDATE') {
        return { ...event.data }
      }
      if (event.type === 'UPLOAD_FILE') {
        return { file: event.file }
      }
      if (event.type === 'MAP_FIELDS') {
        return { fieldMapping: event.mapping }
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
  id: 'contactImport',
  initial: 'upload_file',
  context: {
    file: undefined,
    fileData: undefined,
    fieldMapping: undefined,
    previewData: undefined,
    importResult: undefined,
  },
  states: {
    upload_file: {
      on: {
        UPLOAD_FILE: {
          guard: 'isCSV',
          target: 'map_fields',
          actions: 'updateContext',
        },
        ERROR: {
          actions: 'setError',
        },
      },
    },
    map_fields: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        MAP_FIELDS: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'upload_file',
        },
        NEXT: {
          guard: 'hasEmailMapping',
          target: 'preview_data',
        },
        ERROR: {
          actions: 'setError',
        },
      },
    },
    preview_data: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'map_fields',
        },
        NEXT: {
          target: 'confirm_import',
        },
      },
    },
    confirm_import: {
      on: {
        BACK: {
          target: 'preview_data',
        },
        CONFIRM_IMPORT: {
          target: 'processing',
        },
        CANCEL: {
          target: 'upload_file',
        },
      },
    },
    processing: {
      on: {
        NEXT: [
          {
            guard: ({ context }) => context.importResult !== undefined,
            target: 'completed',
          },
        ],
        ERROR: {
          target: 'upload_file',
          actions: 'setError',
        },
      },
    },
    completed: {
      type: 'final',
    },
  },
  on: {
    RESET: {
      target: '.upload_file',
      actions: 'clearErrors',
    },
    CANCEL: {
      target: '.upload_file',
    },
  },
})

