/**
 * Centralized API client with error handling, retries, and type safety
 */

import { logger } from './logger'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: Record<string, unknown>
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
  retryDelay?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number = 30000
  private defaultRetries: number = 3
  private defaultRetryDelay: number = 1000

  constructor(baseURL: string = '/api', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
    } = config

    const url = `${this.baseURL}${endpoint}`
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const responseData = await response.json()

        if (!response.ok) {
          throw new ApiError(
            responseData.error || `HTTP ${response.status}`,
            response.status,
            responseData
          )
        }

        logger.apiResponse(endpoint, response.status, Date.now())

        return responseData
      } catch (error) {
        lastError = error as Error
        
        if (attempt < retries && this.shouldRetry(error as Error)) {
          logger.warn(`API request failed, retrying (${attempt + 1}/${retries})`, {
            endpoint,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          await this.delay(retryDelay * Math.pow(2, attempt)) // Exponential backoff
          continue
        }

        logger.error(`API request failed after ${attempt + 1} attempts`, error as Error, {
          endpoint,
          method,
        })
        break
      }
    }

    if (lastError instanceof ApiError) {
      throw lastError
    }

    throw new ApiError(
      lastError?.message || 'Request failed',
      0,
      lastError ? { message: lastError.message, name: lastError.name } : undefined
    )
  }

  private shouldRetry(error: Error): boolean {
    if (error instanceof ApiError) {
      // Retry on server errors (5xx) but not client errors (4xx)
      return error.status >= 500 || error.status === 0
    }
    
    // Retry on network errors
    return error.name === 'AbortError' || error.name === 'TypeError'
  }

  // HTTP method helpers
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // Utility methods
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key]
  }

  setAuthToken(token: string): void {
    this.setDefaultHeader('Authorization', `Bearer ${token}`)
  }

  clearAuthToken(): void {
    this.removeDefaultHeader('Authorization')
  }
}

// Default API client instance
export const apiClient = new ApiClient()

// Typed API methods for common endpoints
export const api = {
  // Sites
  sites: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : ''
      return apiClient.get(`/sites${query}`)
    },
    get: (id: string) => apiClient.get(`/sites/${id}`),
    create: (data: Record<string, unknown>) => apiClient.post('/sites', data),
    update: (id: string, data: Record<string, unknown>) => apiClient.put(`/sites/${id}`, data),
    delete: (id: string) => apiClient.delete(`/sites/${id}`),
    generate: (data: Record<string, unknown>) => apiClient.post('/sites/generate', data),
  },

  // Leads
  leads: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : ''
      return apiClient.get(`/leads${query}`)
    },
    get: (id: string) => apiClient.get(`/leads/${id}`),
    create: (data: Record<string, unknown>) => apiClient.post('/leads', data),
    update: (id: string, data: Record<string, unknown>) => apiClient.put(`/leads/${id}`, data),
    enrich: (id: string) => apiClient.post(`/leads/${id}/enrich`),
  },

  // Research
  research: {
    niche: (data: Record<string, unknown>) => apiClient.post('/research', data),
  },

  // Content
  content: {
    generate: (data: Record<string, unknown>) => apiClient.post('/content', data),
    generateWebsite: (data: Record<string, unknown>) => apiClient.put('/content/website', data),
  },

  // Analytics
  analytics: {
    dashboard: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : ''
      return apiClient.get(`/analytics${query}`)
    },
    generateReport: (data: Record<string, unknown>) => apiClient.post('/analytics', { action: 'generateReport', ...data }),
    scheduleReport: (data: Record<string, unknown>) => apiClient.post('/analytics', { action: 'scheduleReport', ...data }),
  },

  // User
  user: {
    profile: () => apiClient.get('/user/profile'),
    updateProfile: (data: Record<string, unknown>) => apiClient.put('/user/profile', data),
  },

  // Jobs
  jobs: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : ''
      return apiClient.get(`/jobs${query}`)
    },
    create: (data: Record<string, unknown>) => apiClient.post('/jobs', data),
  },
}
