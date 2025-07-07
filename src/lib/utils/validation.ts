import { z } from "zod"

export const emailSchema = z.string().email("Please enter a valid email address")

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  )

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-$$$$]+$/, "Please enter a valid phone number")
  .optional()

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`
  }
  return null
}
