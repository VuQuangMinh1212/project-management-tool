export interface Project {
  id: string
  name: string
  description?: string
  managerId: string
  managerName?: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  managers?: {
    id: string
    email: string
    fullName: string
    role: string
    avatarUrl?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }[]
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface ProjectMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: ProjectRole
  joinedAt: string
}

export enum ProjectRole {
  MEMBER = "member",
  LEAD = "lead",
  MANAGER = "manager",
}

export interface CreateProjectData {
  name: string
  description?: string
  managerId: string
  managerIds?: string[]
  startDate: string
  endDate?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  managerId?: string
  managerIds?: string[]
  status?: ProjectStatus
  startDate?: string
  endDate?: string
}

export interface ProjectFilters {
  name?: string
  managerId?: string
  status?: ProjectStatus
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
}
