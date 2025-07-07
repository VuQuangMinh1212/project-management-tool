export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  bio?: string
  location?: string
  department?: string
  title?: string
  timezone?: string
  language?: string
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean
    types: NotificationType[]
  }
  dashboard: {
    layout: "grid" | "list"
    widgets: string[]
  }
}

export interface NotificationType {
  id: string
  name: string
  description: string
  enabled: boolean
}

export interface UserStats {
  tasksAssigned: number
  tasksCompleted: number
  tasksInProgress: number
  tasksOverdue: number
  productivity: number
  hoursLogged: number
  averageCompletionTime: number
  completionRate: number
}

export interface TeamMember extends UserProfile {
  role: "member" | "lead" | "manager"
  status: "active" | "inactive" | "away"
  joinedAt: string
  lastActive?: string
  stats: UserStats
}
