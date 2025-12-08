'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { domainApi, Domain } from '@/lib/api/automation'

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: () => domainApi.listDomains(),
  })
}

export function useDomain(id: string) {
  return useQuery({
    queryKey: ['domain', id],
    queryFn: () => domainApi.getDomain(id),
    enabled: !!id,
    refetchInterval: 30000, // Poll every 30 seconds for verification status
  })
}

export function useDomainActions() {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (domain: string) => domainApi.addDomain(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (id: string) => domainApi.verifyDomain(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['domain', id] })
      queryClient.invalidateQueries({ queryKey: ['domains'] })
    },
  })

  const recheckMutation = useMutation({
    mutationFn: (id: string) => domainApi.recheckDNS(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['domain', id] })
      queryClient.invalidateQueries({ queryKey: ['domains'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => domainApi.deleteDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
    },
  })

  return {
    add: (domain: string, options?: { onSuccess?: (data: any) => void }) =>
      addMutation.mutate(domain, options as any),
    verify: (id: string, options?: { onSuccess?: () => void }) =>
      verifyMutation.mutate(id, options as any),
    recheck: recheckMutation.mutate,
    delete: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isRechecking: recheckMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

