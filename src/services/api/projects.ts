import { apiClient } from '@/lib/api/client'
import { Project, CreateProjectData, UpdateProjectData, ProjectFilters } from '../../types/project'
import type { User } from '@/types/auth'

export const projectsService = {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams()
    
    if (filters?.name) params.append('name', filters.name)
    if (filters?.managerId) params.append('managerId', filters.managerId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.startDateFrom) params.append('startDateFrom', filters.startDateFrom)
    if (filters?.startDateTo) params.append('startDateTo', filters.startDateTo)
    if (filters?.endDateFrom) params.append('endDateFrom', filters.endDateFrom)
    if (filters?.endDateTo) params.append('endDateTo', filters.endDateTo)
    
    const queryString = params.toString()
    const url = queryString ? `/projects?${queryString}` : '/projects'
    
    return apiClient.get<Project[]>(url)
  },

  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`)
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    return apiClient.post<Project>('/projects', data)
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    return apiClient.put<Project>(`/projects/${id}`, data)
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  },

  async getProjectEmployees(projectId: string): Promise<User[]> {
    return apiClient.get<User[]>(`/projects/${projectId}/employees`)
  },
}