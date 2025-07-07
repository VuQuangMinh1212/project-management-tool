export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, any>
}

export interface ApiErrorResponse {
  error: ApiError
  success: false
  timestamp: string
}

export interface QueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: "asc" | "desc"
  search?: string
  filters?: Record<string, any>
}

export interface UploadResponse {
  url: string
  filename: string
  size: number
  type: string
  id: string
}
