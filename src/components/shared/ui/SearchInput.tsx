"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/ui/useDebounce"

interface SearchInputProps {
  placeholder?: string
  value?: string
  onSearch: (query: string) => void
  debounceMs?: number
  className?: string
  showClearButton?: boolean
}

export function SearchInput({
  placeholder = "Search...",
  value = "",
  onSearch,
  debounceMs = 300,
  className,
  showClearButton = true,
}: SearchInputProps) {
  const [searchQuery, setSearchQuery] = useState(value)
  const debouncedQuery = useDebounce(searchQuery, debounceMs)

  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {showClearButton && searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
