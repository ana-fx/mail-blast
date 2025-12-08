'use client'

import api from '@/lib/axios'

// Automation Flow Types
export interface AutomationFlow {
  id: string
  name: string
  description?: string
  status: 'draft' | 'published' | 'paused'
  nodes: FlowNode[]
  edges: FlowEdge[]
  version: number
  created_at: string
  updated_at: string
}

export interface FlowNode {
  id: string
  type: 'trigger' | 'action' | 'condition'
  nodeType: string // e.g., 'on_subscriber_added', 'send_email', 'wait', 'if_else'
  position: { x: number; y: number }
  data: Record<string, any>
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface AutomationExecution {
  id: string
  flow_id: string
  contact_id: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  current_node_id?: string
  started_at: string
  completed_at?: string
  logs: ExecutionLog[]
}

export interface ExecutionLog {
  node_id: string
  node_name: string
  status: 'success' | 'failed' | 'skipped'
  message?: string
  timestamp: string
}

// Domain & DNS Types
export interface Domain {
  id: string
  domain: string
  status: 'pending' | 'verifying' | 'verified' | 'failed'
  dns_records: DNSRecord[]
  verification_started_at?: string
  verified_at?: string
  created_at: string
}

export interface DNSRecord {
  type: 'SPF' | 'DKIM' | 'DMARC' | 'CNAME'
  name: string
  value: string
  ttl: number
  status: 'pending' | 'propagating' | 'verified' | 'failed'
}

export const automationApi = {
  // Flows
  listFlows: async (): Promise<AutomationFlow[]> => {
    const response = await api.get<AutomationFlow[]>('/automation/flows')
    return response.data
  },
  getFlow: async (id: string): Promise<AutomationFlow> => {
    const response = await api.get<AutomationFlow>(`/automation/flows/${id}`)
    return response.data
  },
  createFlow: async (data: Partial<AutomationFlow>): Promise<AutomationFlow> => {
    const response = await api.post<AutomationFlow>('/automation/flows', data)
    return response.data
  },
  updateFlow: async (id: string, data: Partial<AutomationFlow>): Promise<AutomationFlow> => {
    const response = await api.put<AutomationFlow>(`/automation/flows/${id}`, data)
    return response.data
  },
  deleteFlow: async (id: string): Promise<void> => {
    await api.delete(`/automation/flows/${id}`)
  },
  publishFlow: async (id: string): Promise<AutomationFlow> => {
    const response = await api.post<AutomationFlow>(`/automation/flows/${id}/publish`)
    return response.data
  },
  unpublishFlow: async (id: string): Promise<AutomationFlow> => {
    const response = await api.post<AutomationFlow>(`/automation/flows/${id}/unpublish`)
    return response.data
  },
  validateFlow: async (id: string): Promise<{ valid: boolean; errors: string[] }> => {
    const response = await api.post<{ valid: boolean; errors: string[] }>(`/automation/flows/${id}/validate`)
    return response.data
  },

  // Executions
  getExecutions: async (flowId: string): Promise<AutomationExecution[]> => {
    const response = await api.get<AutomationExecution[]>(`/automation/flows/${flowId}/executions`)
    return response.data
  },
  getExecution: async (executionId: string): Promise<AutomationExecution> => {
    const response = await api.get<AutomationExecution>(`/automation/executions/${executionId}`)
    return response.data
  },
}

export const domainApi = {
  listDomains: async (): Promise<Domain[]> => {
    const response = await api.get<Domain[]>('/domains')
    return response.data
  },
  getDomain: async (id: string): Promise<Domain> => {
    const response = await api.get<Domain>(`/domains/${id}`)
    return response.data
  },
  addDomain: async (domain: string): Promise<Domain> => {
    const response = await api.post<Domain>('/domains', { domain })
    return response.data
  },
  verifyDomain: async (id: string): Promise<Domain> => {
    const response = await api.post<Domain>(`/domains/${id}/verify`)
    return response.data
  },
  deleteDomain: async (id: string): Promise<void> => {
    await api.delete(`/domains/${id}`)
  },
  recheckDNS: async (id: string): Promise<Domain> => {
    const response = await api.post<Domain>(`/domains/${id}/recheck`)
    return response.data
  },
}

