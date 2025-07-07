import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios"
import { tokenStorage } from "@/lib/auth/token"
import { authStorage } from "@/lib/auth/storage"
import toast from "react-hot-toast"

/**
 * Request interceptor configuration
 */
export interface RequestInterceptorConfig {
  addAuthToken?: boolean
  addTimestamp?: boolean
  addRequestId?: boolean
  logRequests?: boolean
}

/**
 * Response interceptor configuration
 */
export interface ResponseInterceptorConfig {
  handleAuthErrors?: boolean
  handleNetworkErrors?: boolean
  logResponses?: boolean
  showErrorToasts?: boolean
}

/**
 * Setup request interceptors for axios instance
 */
export function setupRequestInterceptors(axiosInstance: AxiosInstance, config: RequestInterceptorConfig = {}): void {
  const {
    addAuthToken = true,
    addTimestamp = true,
    addRequestId = true,
    logRequests = process.env.NODE_ENV === "development",
  } = config

  axiosInstance.interceptors.request.use(
    (requestConfig: AxiosRequestConfig) => {
      // Add authentication token
      if (addAuthToken) {
        const token = tokenStorage.getToken()
        if (token && !tokenStorage.isTokenExpired(token)) {
          requestConfig.headers = {
            ...requestConfig.headers,
            Authorization: `Bearer ${token}`,
          }
        }
      }

      // Add timestamp for cache busting
      if (addTimestamp) {
        const separator = requestConfig.url?.includes("?") ? "&" : "?"
        requestConfig.url += `${separator}_t=${Date.now()}`
      }

      // Add unique request ID for tracking
      if (addRequestId) {
        const requestId = generateRequestId()
        requestConfig.headers = {
          ...requestConfig.headers,
          "X-Request-ID": requestId,
        }

        // Store request ID for potential cancellation
        requestConfig.metadata = { requestId }
      }

      // Add user agent and app info
      requestConfig.headers = {
        ...requestConfig.headers,
        "X-App-Version": process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        "X-Client-Type": "web",
      }

      // Log request in development
      if (logRequests) {
        console.group(`🚀 API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`)
        console.log("Headers:", requestConfig.headers)
        if (requestConfig.data) {
          console.log("Data:", requestConfig.data)
        }
        if (requestConfig.params) {
          console.log("Params:", requestConfig.params)
        }
        console.groupEnd()
      }

      return requestConfig
    },
    (error: AxiosError) => {
      console.error("Request interceptor error:", error)
      return Promise.reject(error)
    },
  )
}

/**
 * Setup response interceptors for axios instance
 */
export function setupResponseInterceptors(axiosInstance: AxiosInstance, config: ResponseInterceptorConfig = {}): void {
  const {
    handleAuthErrors = true,
    handleNetworkErrors = true,
    logResponses = process.env.NODE_ENV === "development",
    showErrorToasts = true,
  } = config

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful response in development
      if (logResponses) {
        console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`)
        console.log("Status:", response.status)
        console.log("Headers:", response.headers)
        console.log("Data:", response.data)
        console.groupEnd()
      }

      // Handle response metadata
      if (response.headers["x-rate-limit-remaining"]) {
        const remaining = Number.parseInt(response.headers["x-rate-limit-remaining"])
        if (remaining < 10) {
          console.warn(`Rate limit warning: ${remaining} requests remaining`)
        }
      }

      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

      // Log error in development
      if (logResponses) {
        console.group(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`)
        console.log("Status:", error.response?.status)
        console.log("Error:", error.message)
        console.log("Response:", error.response?.data)
        console.groupEnd()
      }

      // Handle authentication errors
      if (handleAuthErrors && error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          // Try to refresh the token
          const refreshToken = tokenStorage.getRefreshToken()
          if (refreshToken) {
            const response = await axiosInstance.post("/auth/refresh", {
              refreshToken,
            })

            const { token } = response.data
            tokenStorage.setToken(token)

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }

            // Retry the original request
            return axiosInstance(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed, clear auth data and redirect to login
          authStorage.clearSession()

          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }

          return Promise.reject(refreshError)
        }
      }

      // Handle specific error types
      if (handleNetworkErrors) {
        handleSpecificErrors(error, showErrorToasts)
      }

      return Promise.reject(error)
    },
  )
}

/**
 * Handle specific error types with appropriate user feedback
 */
function handleSpecificErrors(error: AxiosError, showToasts: boolean): void {
  const status = error.response?.status
  const message = (error.response?.data as any)?.message || error.message

  switch (status) {
    case 400:
      if (showToasts) {
        toast.error(`Bad Request: ${message}`)
      }
      break

    case 403:
      if (showToasts) {
        toast.error("You don't have permission to perform this action")
      }
      break

    case 404:
      if (showToasts) {
        toast.error("The requested resource was not found")
      }
      break

    case 409:
      if (showToasts) {
        toast.error(`Conflict: ${message}`)
      }
      break

    case 422:
      if (showToasts) {
        toast.error(`Validation Error: ${message}`)
      }
      break

    case 429:
      if (showToasts) {
        toast.error("Too many requests. Please try again later.")
      }
      break

    case 500:
      if (showToasts) {
        toast.error("Internal server error. Please try again later.")
      }
      break

    case 502:
    case 503:
    case 504:
      if (showToasts) {
        toast.error("Service temporarily unavailable. Please try again later.")
      }
      break

    default:
      if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK") {
        if (showToasts) {
          toast.error("Network error. Please check your connection.")
        }
      } else if (error.code === "TIMEOUT") {
        if (showToasts) {
          toast.error("Request timeout. Please try again.")
        }
      } else if (showToasts && status && status >= 400) {
        toast.error(`Error ${status}: ${message}`)
      }
      break
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Request cancellation utilities
 */
export class RequestCancellation {
  private static cancelTokens = new Map<string, AbortController>()

  /**
   * Create cancellable request config
   */
  static createCancellableConfig(requestId: string): AxiosRequestConfig {
    const controller = new AbortController()
    this.cancelTokens.set(requestId, controller)

    return {
      signal: controller.signal,
      metadata: { requestId },
    }
  }

  /**
   * Cancel specific request
   */
  static cancelRequest(requestId: string): void {
    const controller = this.cancelTokens.get(requestId)
    if (controller) {
      controller.abort()
      this.cancelTokens.delete(requestId)
    }
  }

  /**
   * Cancel all pending requests
   */
  static cancelAllRequests(): void {
    this.cancelTokens.forEach((controller) => {
      controller.abort()
    })
    this.cancelTokens.clear()
  }

  /**
   * Get number of pending requests
   */
  static getPendingRequestsCount(): number {
    return this.cancelTokens.size
  }
}

/**
 * Request retry utilities
 */
export class RequestRetry {
  /**
   * Create retry config for axios
   */
  static createRetryConfig(maxRetries = 3, retryDelay = 1000) {
    return {
      retry: maxRetries,
      retryDelay: (retryCount: number) => {
        return Math.min(retryDelay * Math.pow(2, retryCount), 10000) // Exponential backoff with max 10s
      },
      retryCondition: (error: AxiosError) => {
        // Retry on network errors or 5xx status codes
        return !error.response || (error.response.status >= 500 && error.response.status <= 599)
      },
    }
  }
}

/**
 * Request caching utilities
 */
export class RequestCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Generate cache key from request config
   */
  static generateCacheKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config
    return `${method}_${url}_${JSON.stringify(params)}_${JSON.stringify(data)}`
  }

  /**
   * Get cached response
   */
  static get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set cached response
   */
  static set(key: string, data: any, ttl = 300000): void {
    // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Clear cache
   */
  static clear(): void {
    this.cache.clear()
  }

  /**
   * Clear expired entries
   */
  static clearExpired(): void {
    const now = Date.now()
    this.cache.forEach((value, key) => {
      if (now > value.timestamp + value.ttl) {
        this.cache.delete(key)
      }
    })
  }
}
