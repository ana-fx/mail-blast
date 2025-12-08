'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { templatesApi } from '@/lib/api/templates'

export function useTemplateVersions(templateId: string) {
  const queryClient = useQueryClient()

  const { data: versions, isLoading } = useQuery({
    queryKey: ['template-versions', templateId],
    queryFn: () => templatesApi.getVersions(templateId),
    enabled: !!templateId,
  })

  const createVersionMutation = useMutation({
    mutationFn: (html: string) => templatesApi.createVersion(templateId, html),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-versions', templateId] })
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
    },
  })

  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) => templatesApi.restoreVersion(templateId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-versions', templateId] })
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
    },
  })

  const setDefaultVersionMutation = useMutation({
    mutationFn: (versionId: string) => templatesApi.setDefaultVersion(templateId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-versions', templateId] })
      queryClient.invalidateQueries({ queryKey: ['template', templateId] })
    },
  })

  return {
    versions: versions || [],
    isLoading,
    createVersion: createVersionMutation.mutate,
    restoreVersion: restoreVersionMutation.mutate,
    setDefaultVersion: setDefaultVersionMutation.mutate,
    isCreating: createVersionMutation.isPending,
    isRestoring: restoreVersionMutation.isPending,
    isSettingDefault: setDefaultVersionMutation.isPending,
  }
}

