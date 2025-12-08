// Workflow Types
export interface WorkflowContext {
  [key: string]: any
}

export interface WorkflowEvent {
  type: string
  [key: string]: any
}

export interface WorkflowState {
  value: string
  context: WorkflowContext
  canNext: boolean
  canBack: boolean
  isComplete: boolean
  isError: boolean
  error?: Error | null
}

export interface WorkflowConfig {
  id: string
  initialContext?: WorkflowContext
  persistKey?: string
  onComplete?: (context: WorkflowContext) => void
  onError?: (error: Error) => void
  onCancel?: () => void
}

export interface WorkflowStep {
  id: string
  label: string
  component?: React.ComponentType<any>
  validate?: (context: WorkflowContext) => Promise<boolean> | boolean
  guard?: (context: WorkflowContext) => boolean
}

// Campaign Sending Types
export interface CampaignSendingContext extends WorkflowContext {
  campaignId?: string
  campaign?: any
  subject?: string
  template?: any
  audience?: {
    listId?: string
    segmentId?: string
    excludeUnsubscribed?: boolean
    count?: number
  }
  settings?: {
    fromName?: string
    fromEmail?: string
    replyTo?: string
    sendAt?: string
  }
  validationErrors?: Record<string, string[]>
  sendingResult?: {
    success: boolean
    message?: string
    jobId?: string
  }
}

// Contact Import Types
export interface ContactImportContext extends WorkflowContext {
  file?: File
  fileData?: any[]
  fieldMapping?: Record<string, string>
  previewData?: any[]
  importResult?: {
    imported: number
    failed: number
    errors?: any[]
  }
}

// Template Builder Types
export interface TemplateBuilderContext extends WorkflowContext {
  templateId?: string
  layout?: string
  blocks?: any[]
  styles?: Record<string, any>
  autoSaveEnabled?: boolean
}

// Domain Verification Types
export interface DomainVerificationContext extends WorkflowContext {
  domain?: string
  domainId?: string
  dnsRecords?: any[]
  verificationStatus?: 'pending' | 'verifying' | 'verified' | 'failed'
  currentStep?: number
}

