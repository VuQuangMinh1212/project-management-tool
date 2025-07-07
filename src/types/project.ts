export interface Project {
  id: string
  name: string
  description?: string
  color: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  manager: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  members: ProjectMember[]
  tasks: string[] // Task IDs
  createdAt: string
  updatedAt: string
}

export enum ProjectStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
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
  color: string
  startDate: string
  endDate?: string
  memberIds: string[]
}

export interface UpdateProjectData {
  name?: string
  description?: string
  color?: string
  status?: ProjectStatus
  startDate?: string
  endDate?: string
  memberIds?: string[]
}
