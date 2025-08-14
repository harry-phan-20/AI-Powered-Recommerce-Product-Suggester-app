interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, unknown>
}

interface PerformanceReport {
  metrics: PerformanceMetric[]
  summary: {
    totalRequests: number
    averageResponseTime: number
    slowestRequest: PerformanceMetric | null
    fastestRequest: PerformanceMetric | null
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled = process.env.NODE_ENV === 'development' || import.meta.env.DEV

  startTimer(name: string, metadata?: Record<string, unknown>): string {
    if (!this.isEnabled) return ''

    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.metrics.push({
      name,
      startTime: performance.now(),
      metadata
    })
    return id
  }

  endTimer(id: string, additionalMetadata?: Record<string, unknown>): void {
    if (!this.isEnabled || !id) return

    const metric = this.metrics.find(m => m.name === id.split('_')[0])
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
      if (additionalMetadata) {
        metric.metadata = { ...metric.metadata, ...additionalMetadata }
      }
    }
  }

  measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T> {
    if (!this.isEnabled) return fn()

    const startTime = performance.now()
    return fn().finally(() => {
      const duration = performance.now() - startTime
      this.metrics.push({
        name,
        startTime,
        endTime: startTime + duration,
        duration,
        metadata
      })
    })
  }

  getReport(): PerformanceReport {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined)
    
    if (completedMetrics.length === 0) {
      return {
        metrics: [],
        summary: {
          totalRequests: 0,
          averageResponseTime: 0,
          slowestRequest: null,
          fastestRequest: null
        }
      }
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    const averageResponseTime = totalDuration / completedMetrics.length

    const sortedByDuration = [...completedMetrics].sort((a, b) => (a.duration || 0) - (b.duration || 0))
    const fastestRequest = sortedByDuration[0]
    const slowestRequest = sortedByDuration[sortedByDuration.length - 1]

    return {
      metrics: completedMetrics,
      summary: {
        totalRequests: completedMetrics.length,
        averageResponseTime,
        slowestRequest,
        fastestRequest
      }
    }
  }

  clearMetrics(): void {
    this.metrics = []
  }

  logReport(): void {
    if (!this.isEnabled) return

    const report = this.getReport()
    console.group('🚀 Performance Report')
    console.log(`Total Requests: ${report.summary.totalRequests}`)
    console.log(`Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`)
    
    if (report.summary.slowestRequest) {
      console.log(`Slowest Request: ${report.summary.slowestRequest.name} (${report.summary.slowestRequest.duration?.toFixed(2)}ms)`)
    }
    
    if (report.summary.fastestRequest) {
      console.log(`Fastest Request: ${report.summary.fastestRequest.name} (${report.summary.fastestRequest.duration?.toFixed(2)}ms)`)
    }
    
    console.groupEnd()
  }
}

// Bundle size analyzer
export function analyzeBundleSize(): void {
  if (import.meta.env.DEV) {
    const modules = import.meta.glob('**/*', { eager: true })
    const moduleSizes = Object.entries(modules).map(([path, module]) => {
      const size = JSON.stringify(module).length
      return { path, size }
    }).sort((a, b) => b.size - a.size)

    console.group('📦 Bundle Size Analysis')
    moduleSizes.slice(0, 10).forEach(({ path, size }) => {
      console.log(`${path}: ${(size / 1024).toFixed(2)}KB`)
    })
    console.groupEnd()
  }
}

// Memory usage monitor
export function monitorMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    console.log('💾 Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    })
  }
}

// Network performance monitor
export function monitorNetworkPerformance(): void {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    console.log('🌐 Network Info:', {
      effectiveType: connection.effectiveType,
      downlink: `${connection.downlink}Mbps`,
      rtt: `${connection.rtt}ms`
    })
  }
}

// Lazy loading utility
export function createLazyLoader<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: T
): () => Promise<T> {
  let cached: T | null = null
  let loading: Promise<T> | null = null

  return async () => {
    if (cached) return cached
    if (loading) return loading

    loading = importFn().then(module => {
      cached = module.default
      loading = null
      return cached
    }).catch(error => {
      loading = null
      if (fallback) return fallback
      throw error
    })

    return loading
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Image optimization utility
export function optimizeImage(src: string, width: number, height: number): string {
  // Add image optimization parameters
  const url = new URL(src, window.location.origin)
  url.searchParams.set('w', width.toString())
  url.searchParams.set('h', height.toString())
  url.searchParams.set('q', '80') // quality
  url.searchParams.set('fm', 'webp') // format
  return url.toString()
}

// Export the performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Auto-log performance report on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.logReport()
  })
}
