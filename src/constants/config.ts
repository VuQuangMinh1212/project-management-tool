export const APP_CONFIG = {
  name: "TaskFlow",
  description: "Internal project and task management tool",
  version: "1.0.0",
  author: "Your Company",

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    timeout: 10000,
  },

  // Socket Configuration
  socket: {
    url: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // File Upload
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"],
  },

  // Theme
  theme: {
    defaultMode: "light" as "light" | "dark" | "system",
  },
} as const

export const ROUTES_CONFIG = {
  redirectAfterLogin: {
    staff: "/staff/dashboard",
    manager: "/manager/dashboard",
    admin: "/admin/dashboard",
  },
  publicRoutes: ["/login", "/register"],
  protectedRoutes: ["/staff", "/manager", "/admin"],
} as const
