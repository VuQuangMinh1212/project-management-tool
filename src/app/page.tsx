"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const redirect = () => {
      try {
        router.replace("/login")
        setTimeout(() => {
          if (window.location.pathname === "/") {
            window.location.href = "/login"
          }
        }, 100)
      } catch (error) {
        window.location.href = "/login"
      }
    }
    
    redirect()
  }, [router])

  return null
}
