'use client'

import { setup, assign } from 'xstate'
import type { TemplateBuilderContext } from './types'

export const templateBuilderMachine = setup({
  types: {
    context: {} as TemplateBuilderContext,
    events: {} as
      | { type: 'START' }
      | { type: 'NEXT' }
      | { type: 'BACK' }
      | { type: 'UPDATE'; data: Partial<TemplateBuilderContext> }
      | { type: 'SELECT_LAYOUT'; layout: string }
      | { type: 'EDIT_BLOCKS'; blocks: any[] }
      | { type: 'CONFIGURE_STYLES'; styles: Record<string, any> }
      | { type: 'AUTO_SAVE' }
      | { type: 'SAVE_TEMPLATE' }
      | { type: 'PUBLISH' }
      | { type: 'RESET' }
      | { type: 'CANCEL' }
      | { type: 'ERROR'; error: Error },
  },
  guards: {
    hasLayout: ({ context }) => !!context.layout,
    hasBlocks: ({ context }) => !!(context.blocks && context.blocks.length > 0),
  },
  actions: {
    updateContext: assign(({ event }) => {
      if (event.type === 'UPDATE') {
        return { ...event.data }
      }
      if (event.type === 'SELECT_LAYOUT') {
        return { layout: event.layout }
      }
      if (event.type === 'EDIT_BLOCKS') {
        return { blocks: event.blocks }
      }
      if (event.type === 'CONFIGURE_STYLES') {
        return { styles: event.styles }
      }
      return {}
    }),
    enableAutoSave: assign({
      autoSaveEnabled: () => true,
    }),
    disableAutoSave: assign({
      autoSaveEnabled: () => false,
    }),
  },
}).createMachine({
  id: 'templateBuilder',
  initial: 'layout_select',
  context: {
    templateId: undefined,
    layout: undefined,
    blocks: undefined,
    styles: undefined,
    autoSaveEnabled: false,
  },
  states: {
    layout_select: {
      on: {
        SELECT_LAYOUT: {
          target: 'edit_blocks',
          actions: 'updateContext',
        },
        CANCEL: {
          target: 'exit_or_publish',
        },
      },
    },
    edit_blocks: {
      entry: 'enableAutoSave',
      exit: 'disableAutoSave',
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        EDIT_BLOCKS: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'layout_select',
        },
        NEXT: {
          guard: 'hasBlocks',
          target: 'style_config',
        },
        AUTO_SAVE: {
          actions: 'updateContext',
        },
      },
    },
    style_config: {
      on: {
        UPDATE: {
          actions: 'updateContext',
        },
        CONFIGURE_STYLES: {
          actions: 'updateContext',
        },
        BACK: {
          target: 'edit_blocks',
        },
        NEXT: {
          target: 'save_template',
        },
      },
    },
    save_template: {
      on: {
        SAVE_TEMPLATE: {
          target: 'exit_or_publish',
        },
        BACK: {
          target: 'style_config',
        },
      },
    },
    exit_or_publish: {
      type: 'final',
      on: {
        PUBLISH: {
          target: 'exit_or_publish',
        },
      },
    },
  },
  on: {
    RESET: {
      target: '.layout_select',
    },
    CANCEL: {
      target: '.exit_or_publish',
    },
  },
})

