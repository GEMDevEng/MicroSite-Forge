/**
 * Custom hooks for API interactions with SWR
 */

import useSWR, { SWRConfiguration, mutate as globalMutate } from 'swr'
import { useState } from 'react'
import { api, ApiResponse } from '@/lib/api-client'
import { handleClientError } from '@/lib/error-handler'

// Generic API hook
export function useApi<T>(
  key: string | null,
  fetcher?: () => Promise<ApiResponse<T>>,
  options?: SWRConfiguration
) {
  const { data, error, isLoading, mutate: mutateFn } = useSWR(
    key,
    fetcher || null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...options,
    }
  )

  return {
    data: data?.data,
    error: error || (data && !data.success ? data.error : null),
    isLoading,
    mutate: mutateFn,
  }
}

// Mutation hook for API operations
export function useMutation<TData = unknown, TVariables = unknown>() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (
    operation: (variables: TVariables) => Promise<ApiResponse<TData>>,
    variables: TVariables,
    options?: {
      onSuccess?: (data: TData) => void
      onError?: (error: string) => void
      revalidate?: string[]
    }
  ): Promise<TData | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await operation(variables)

      if (!response.success) {
        throw new Error(response.error || 'Operation failed')
      }

      // Revalidate specified SWR keys
      if (options?.revalidate) {
        options.revalidate.forEach((key) => globalMutate(key))
      }

      if (response.data) {
        options?.onSuccess?.(response.data)
        return response.data
      }
      return null
    } catch (err) {
      const errorMessage = handleClientError(err, 'API mutation')
      setError(errorMessage)
      options?.onError?.(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutate,
    isLoading,
    error,
    reset: () => {
      setError(null)
      setIsLoading(false)
    },
  }
}

// Sites API hooks
export function useSites(filters?: Record<string, string>) {
  return useApi(
    filters ? `/sites?${new URLSearchParams(filters).toString()}` : '/sites',
    () => api.sites.list(filters)
  )
}

export function useSite(id: string | null) {
  return useApi(
    id ? `/sites/${id}` : null,
    id ? () => api.sites.get(id) : undefined
  )
}

export function useSiteMutations() {
  const createSite = useMutation<unknown, Record<string, unknown>>()
  const updateSite = useMutation<unknown, Record<string, unknown>>()
  const deleteSite = useMutation<unknown, undefined>()
  const generateSite = useMutation<unknown, Record<string, unknown>>()

  return {
    createSite: (data: Record<string, unknown>) =>
      createSite.mutate(api.sites.create, data, {
        revalidate: ['/sites'],
      }),
    updateSite: (id: string, data: Record<string, unknown>) =>
      updateSite.mutate((data) => api.sites.update(id, data), data, {
        revalidate: ['/sites', `/sites/${id}`],
      }),
    deleteSite: (id: string) =>
      deleteSite.mutate(() => api.sites.delete(id), undefined, {
        revalidate: ['/sites'],
      }),
    generateSite: (data: Record<string, unknown>) =>
      generateSite.mutate(api.sites.generate, data, {
        revalidate: ['/sites'],
      }),
    isLoading:
      createSite.isLoading ||
      updateSite.isLoading ||
      deleteSite.isLoading ||
      generateSite.isLoading,
    error:
      createSite.error ||
      updateSite.error ||
      deleteSite.error ||
      generateSite.error,
  }
}

// Leads API hooks
export function useLeads(filters?: Record<string, string>) {
  return useApi(
    filters ? `/leads?${new URLSearchParams(filters).toString()}` : '/leads',
    () => api.leads.list(filters)
  )
}

export function useLead(id: string | null) {
  return useApi(
    id ? `/leads/${id}` : null,
    id ? () => api.leads.get(id) : undefined
  )
}

export function useLeadMutations() {
  const createLead = useMutation<unknown, Record<string, unknown>>()
  const updateLead = useMutation<unknown, Record<string, unknown>>()
  const enrichLead = useMutation<unknown, undefined>()

  return {
    createLead: (data: Record<string, unknown>) =>
      createLead.mutate(api.leads.create, data, {
        revalidate: ['/leads'],
      }),
    updateLead: (id: string, data: Record<string, unknown>) =>
      updateLead.mutate((data) => api.leads.update(id, data), data, {
        revalidate: ['/leads', `/leads/${id}`],
      }),
    enrichLead: (id: string) =>
      enrichLead.mutate(() => api.leads.enrich(id), undefined, {
        revalidate: ['/leads', `/leads/${id}`],
      }),
    isLoading:
      createLead.isLoading || updateLead.isLoading || enrichLead.isLoading,
    error: createLead.error || updateLead.error || enrichLead.error,
  }
}

// Research API hooks
export function useResearchMutation() {
  const research = useMutation<unknown, Record<string, unknown>>()

  return {
    performResearch: (data: Record<string, unknown>) => research.mutate(api.research.niche, data),
    isLoading: research.isLoading,
    error: research.error,
  }
}

// Content API hooks
export function useContentMutations() {
  const generateContent = useMutation<unknown, Record<string, unknown>>()
  const generateWebsite = useMutation<unknown, Record<string, unknown>>()

  return {
    generateContent: (data: Record<string, unknown>) =>
      generateContent.mutate(api.content.generate, data),
    generateWebsite: (data: Record<string, unknown>) =>
      generateWebsite.mutate(api.content.generateWebsite, data),
    isLoading: generateContent.isLoading || generateWebsite.isLoading,
    error: generateContent.error || generateWebsite.error,
  }
}

// Analytics API hooks
export function useAnalytics(params?: Record<string, string>) {
  return useApi(
    params ? `/analytics?${new URLSearchParams(params).toString()}` : '/analytics',
    () => api.analytics.dashboard(params)
  )
}

export function useAnalyticsMutations() {
  const generateReport = useMutation<unknown, Record<string, unknown>>()
  const scheduleReport = useMutation<unknown, Record<string, unknown>>()

  return {
    generateReport: (data: Record<string, unknown>) =>
      generateReport.mutate(api.analytics.generateReport, data),
    scheduleReport: (data: Record<string, unknown>) =>
      scheduleReport.mutate(api.analytics.scheduleReport, data),
    isLoading: generateReport.isLoading || scheduleReport.isLoading,
    error: generateReport.error || scheduleReport.error,
  }
}

// User API hooks
export function useUserProfile() {
  return useApi('/user/profile', api.user.profile)
}

export function useUserMutations() {
  const updateProfile = useMutation<unknown, Record<string, unknown>>()

  return {
    updateProfile: (data: Record<string, unknown>) =>
      updateProfile.mutate(api.user.updateProfile, data, {
        revalidate: ['/user/profile'],
      }),
    isLoading: updateProfile.isLoading,
    error: updateProfile.error,
  }
}

// Jobs API hooks
export function useJobs(filters?: Record<string, string>) {
  return useApi(
    filters ? `/jobs?${new URLSearchParams(filters).toString()}` : '/jobs',
    () => api.jobs.list(filters)
  )
}

export function useJobMutations() {
  const createJob = useMutation<unknown, Record<string, unknown>>()

  return {
    createJob: (data: Record<string, unknown>) =>
      createJob.mutate(api.jobs.create, data, {
        revalidate: ['/jobs'],
      }),
    isLoading: createJob.isLoading,
    error: createJob.error,
  }
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(key: string) {
  return {
    update: (updater: (current: T) => T) => {
      globalMutate(key, (current: T | undefined) => {
        if (current) {
          return updater(current)
        }
        return current
      }, { revalidate: false })
    },
    revert: () => {
      globalMutate(key)
    },
  }
}
