import { format, parseISO, isValid, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns"

/**
 * Format a date string or Date object to a readable format
 */
export const formatDate = (date: string | Date, formatString = "MMM dd, yyyy"): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    if (!isValid(dateObj)) return "Invalid Date"
    return format(dateObj, formatString)
  } catch (error) {
    return "Invalid Date"
  }
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    if (!isValid(dateObj)) return "Invalid Date"

    const now = new Date()
    const diffInMinutes = differenceInMinutes(now, dateObj)
    const diffInHours = differenceInHours(now, dateObj)
    const diffInDays = differenceInDays(now, dateObj)

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`

    return formatDate(dateObj, "MMM dd, yyyy")
  } catch (error) {
    return "Invalid Date"
  }
}

/**
 * Check if a date is overdue
 */
export const isOverdue = (dueDate: string | Date): boolean => {
  try {
    const dateObj = typeof dueDate === "string" ? parseISO(dueDate) : dueDate
    if (!isValid(dateObj)) return false
    return dateObj < new Date()
  } catch (error) {
    return false
  }
}

/**
 * Get the number of days until a due date
 */
export const getDaysUntilDue = (dueDate: string | Date): number => {
  try {
    const dateObj = typeof dueDate === "string" ? parseISO(dueDate) : dueDate
    if (!isValid(dateObj)) return 0
    return differenceInDays(dateObj, new Date())
  } catch (error) {
    return 0
  }
}

/**
 * Format a date for form inputs (YYYY-MM-DD)
 */
export const formatDateForInput = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    if (!isValid(dateObj)) return ""
    return format(dateObj, "yyyy-MM-dd")
  } catch (error) {
    return ""
  }
}

/**
 * Get the start and end of the current week
 */
export const getCurrentWeekRange = (): { start: Date; end: Date } => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Check if a date is within the current week
 */
export const isThisWeek = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    if (!isValid(dateObj)) return false

    const { start, end } = getCurrentWeekRange()
    return dateObj >= start && dateObj <= end
  } catch (error) {
    return false
  }
}
