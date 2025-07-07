import type { User } from "@/types/user"

/**
 * Storage keys for authentication data
 */
const STORAGE_KEYS = {
  USER: "auth_user",
  SESSION: "auth_session",
  PREFERENCES: "auth_preferences",
  LAST_ACTIVITY: "auth_last_activity",
  REMEMBER_ME: "auth_remember_me",
} as const

/**
 * Session data interface
 */
interface SessionData {
  user: User
  loginTime: number
  lastActivity: number
  expiresAt: number
  rememberMe: boolean
}

/**
 * User preferences interface
 */
interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  dashboard: {
    layout: "grid" | "list"
    itemsPerPage: number
  }
}

/**
 * Authentication storage utilities
 */
export class AuthStorage {
  private static instance: AuthStorage
  private storage: Storage | null = null

  constructor() {
    // Use localStorage if available, fallback to memory storage
    if (typeof window !== "undefined") {
      this.storage = window.localStorage
    }
  }

  static getInstance(): AuthStorage {
    if (!AuthStorage.instance) {
      AuthStorage.instance = new AuthStorage()
    }
    return AuthStorage.instance
  }

  /**
   * Check if storage is available
   */
  private isStorageAvailable(): boolean {
    return this.storage !== null
  }

  /**
   * Safe storage getter
   */
  private getItem(key: string): string | null {
    if (!this.isStorageAvailable()) return null

    try {
      return this.storage!.getItem(key)
    } catch (error) {
      console.error("Error reading from storage:", error)
      return null
    }
  }

  /**
   * Safe storage setter
   */
  private setItem(key: string, value: string): void {
    if (!this.isStorageAvailable()) return

    try {
      this.storage!.setItem(key, value)
    } catch (error) {
      console.error("Error writing to storage:", error)
    }
  }

  /**
   * Safe storage remover
   */
  private removeItem(key: string): void {
    if (!this.isStorageAvailable()) return

    try {
      this.storage!.removeItem(key)
    } catch (error) {
      console.error("Error removing from storage:", error)
    }
  }

  /**
   * Store user session data
   */
  setSession(user: User, rememberMe = false): void {
    const now = Date.now()
    const expiresAt = rememberMe
      ? now + 30 * 24 * 60 * 60 * 1000 // 30 days
      : now + 24 * 60 * 60 * 1000 // 24 hours

    const sessionData: SessionData = {
      user,
      loginTime: now,
      lastActivity: now,
      expiresAt,
      rememberMe,
    }

    this.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData))
    this.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    this.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString())
    this.updateLastActivity()
  }

  /**
   * Get current session data
   */
  getSession(): SessionData | null {
    const sessionStr = this.getItem(STORAGE_KEYS.SESSION)
    if (!sessionStr) return null

    try {
      const session: SessionData = JSON.parse(sessionStr)

      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error("Error parsing session data:", error)
      this.clearSession()
      return null
    }
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    const session = this.getSession()
    if (!session) return null

    return session.user
  }

  /**
   * Update user data in storage
   */
  updateUser(user: User): void {
    const session = this.getSession()
    if (!session) return

    const updatedSession: SessionData = {
      ...session,
      user,
      lastActivity: Date.now(),
    }

    this.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession))
    this.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    const session = this.getSession()
    if (!session) return

    const updatedSession: SessionData = {
      ...session,
      lastActivity: Date.now(),
    }

    this.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession))
    this.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    const session = this.getSession()
    if (!session) return false

    const now = Date.now()
    const isExpired = now > session.expiresAt
    const isInactive = now - session.lastActivity > 2 * 60 * 60 * 1000 // 2 hours

    return !isExpired && !isInactive
  }

  /**
   * Check if user chose "remember me"
   */
  isRememberMeEnabled(): boolean {
    const rememberMe = this.getItem(STORAGE_KEYS.REMEMBER_ME)
    return rememberMe === "true"
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    this.removeItem(STORAGE_KEYS.SESSION)
    this.removeItem(STORAGE_KEYS.USER)
    this.removeItem(STORAGE_KEYS.LAST_ACTIVITY)
    this.removeItem(STORAGE_KEYS.REMEMBER_ME)
  }

  /**
   * Store user preferences
   */
  setPreferences(preferences: UserPreferences): void {
    this.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
  }

  /**
   * Get user preferences
   */
  getPreferences(): UserPreferences | null {
    const prefsStr = this.getItem(STORAGE_KEYS.PREFERENCES)
    if (!prefsStr) return null

    try {
      return JSON.parse(prefsStr)
    } catch (error) {
      console.error("Error parsing preferences:", error)
      return null
    }
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      theme: "system",
      language: "en",
      notifications: {
        email: true,
        push: true,
        desktop: false,
      },
      dashboard: {
        layout: "grid",
        itemsPerPage: 10,
      },
    }
  }

  /**
   * Update specific preference
   */
  updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    const currentPrefs = this.getPreferences() || this.getDefaultPreferences()
    const updatedPrefs = { ...currentPrefs, [key]: value }
    this.setPreferences(updatedPrefs)
  }

  /**
   * Clear user preferences
   */
  clearPreferences(): void {
    this.removeItem(STORAGE_KEYS.PREFERENCES)
  }

  /**
   * Clear all authentication data
   */
  clearAll(): void {
    this.clearSession()
    this.clearPreferences()
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    const session = this.getSession()
    if (!session) return 0

    return Date.now() - session.loginTime
  }

  /**
   * Get time until session expires
   */
  getTimeUntilExpiry(): number {
    const session = this.getSession()
    if (!session) return 0

    return Math.max(0, session.expiresAt - Date.now())
  }

  /**
   * Check if session will expire soon (within 5 minutes)
   */
  isSessionExpiringSoon(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry()
    return timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Extend session expiry
   */
  extendSession(additionalTime: number = 24 * 60 * 60 * 1000): void {
    const session = this.getSession()
    if (!session) return

    const updatedSession: SessionData = {
      ...session,
      expiresAt: session.expiresAt + additionalTime,
      lastActivity: Date.now(),
    }

    this.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession))
  }
}

// Export singleton instance
export const authStorage = AuthStorage.getInstance()

// Export types
export type { SessionData, UserPreferences }
