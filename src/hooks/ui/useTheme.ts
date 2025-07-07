"use client"

import { useEffect, useState } from "react"
import { useLocalStorage } from "./useLocalStorage"

type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>("theme", "system")
  const [theme, setTheme] = useState<Theme>(storedTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const setThemeAndStore = (newTheme: Theme) => {
    setTheme(newTheme)
    setStoredTheme(newTheme)
  }

  return {
    theme,
    setTheme: setThemeAndStore,
  }
}
