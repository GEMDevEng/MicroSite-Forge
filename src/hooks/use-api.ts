/**
 * Custom hooks for API interactions with SWR
 */

import useSWR, { SWRConfiguration, mutate as globalMutate } from 'swr'
import { useState } from 'react'
import { api, ApiResponse, ApiError } from '@/lib/api-client'
import { logger } from '@/lib/logger'
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
export function useMutation<TData = any, TVariables = any>() {
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
export function useSites(filters?: Record<string, any>) {
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
  const createSite = useMutation()
  const updateSite = useMutation()
  const deleteSite = useMutation()
  const generateSite = useMutation()

  return {
    createSite: (data: any) =>
      createSite.mutate(api.sites.create, data, {
        revalidate: ['/sites'],
      }),
    updateSite: (id: string, data: any) =>
      updateSite.mutate((data) => api.sites.update(id, data), data, {
        revalidate: ['/sites', `/sites/${id}`],
      }),
    deleteSite: (id: string) =>
      deleteSite.mutate(() => api.sites.delete(id), undefined, {
        revalidate: ['/sites'],
      }),
    generateSite: (data: any) =>
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
export function useLeads(filters?: Record<string, any>) {
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
  const createLead = useMutation()
  const updateLead = useMutation()
  const enrichLead = useMutation()

  return {
    createLead: (data: any) =>
      createLead.mutate(api.leads.create, data, {
        revalidate: ['/leads'],
      }),
    updateLead: (id: string, data: any) =>
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
  const research = useMutation()

  return {
    performResearch: (data: any) => research.mutate(api.research.niche, data),
    isLoading: research.isLoading,
    error: research.error,
  }
}

// Content API hooks
export function useContentMutations() {
  const generateContent = useMutation()
  const generateWebsite = useMutation()

  return {
    generateContent: (data: any) =>
      generateContent.mutate(api.content.generate, data),
    generateWebsite: (data: any) =>
      generateWebsite.mutate(api.content.generateWebsite, data),
    isLoading: generateContent.isLoading || generateWebsite.isLoading,
    error: generateContent.error || generateWebsite.error,
  }
}

// Analytics API hooks
export function useAnalytics(params?: Record<string, any>) {
  return useApi(
    params ? `/analytics?${new URLSearchParams(params).toString()}` : '/analytics',
    () => api.analytics.dashboard(params)
  )
}

export function useAnalyticsMutations() {
  const generateReport = useMutation()
  const scheduleReport = useMutation()

  return {
    generateReport: (data: any) =>
      generateReport.mutate(api.analytics.generateReport, data),
    scheduleReport: (data: any) =>
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
  const updateProfile = useMutation()

  return {
    updateProfile: (data: any) =>
      updateProfile.mutate(api.user.updateProfile, data, {
        revalidate: ['/user/profile'],
      }),
    isLoading: updateProfile.isLoading,
    error: updateProfile.error,
  }
}

// Jobs API hooks
export function useJobs(filters?: Record<string, any>) {
  return useApi(
    filters ? `/jobs?${new URLSearchParams(filters).toString()}` : '/jobs',
    () => api.jobs.list(filters)
  )
}

export function useJobMutations() {
  const createJob = useMutation()

  return {
    createJob: (data: any) =>
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
