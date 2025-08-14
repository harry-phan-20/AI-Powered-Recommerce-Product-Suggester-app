import type { FormInput, SuggestionResult } from './types'

export interface ApiConfig {
  baseUrl: string
  apiKey?: string
  timeout?: number
}

export class ApiError extends Error {
  public code?: string
  public details?: unknown

  constructor(message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
  }
}

class ApiClient {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 30000,
      ...config
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }
    
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code || `HTTP_${response.status}`,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ApiError) {
        throw error
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes('AbortError')) {
        throw new ApiError('Request timeout', 'TIMEOUT')
      }
      
      throw new ApiError(
        errorMessage || 'Network error',
        'NETWORK_ERROR',
        error
      )
    }
  }

  async generateSuggestions(input: FormInput): Promise<SuggestionResult> {
    return this.request<SuggestionResult>('/api/suggest', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/api/health')
  }
}

export function createApiClient(config?: Partial<ApiConfig>): ApiClient {
  const isProduction = import.meta.env.PROD
  const hasBackendUrl = import.meta.env.VITE_BACKEND_URL
  
  if (isProduction && hasBackendUrl) {
    const productionConfig: ApiConfig = {
      baseUrl: import.meta.env.VITE_BACKEND_URL,
      apiKey: import.meta.env.VITE_API_KEY
    }
    if (config) {
      Object.assign(productionConfig, config)
    }
    return new ApiClient(productionConfig)
  } else {
    const devConfig: ApiConfig = {
      baseUrl: '/api'
    }
    if (config) {
      Object.assign(devConfig, config)
    }
    return new ApiClient(devConfig)
  }
}

export const apiClient = createApiClient()
