"use client"

import { useState } from "react"
import { ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
  type?: "single" | "multiple"
}

interface FilterDropdownProps {
  groups: FilterGroup[]
  selectedFilters: Record<string, string[]>
  onFiltersChange: (filters: Record<string, string[]>) => void
  className?: string
}

export function FilterDropdown({ groups, selectedFilters, onFiltersChange, className }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)

  const handleFilterChange = (groupId: string, value: string, checked: boolean) => {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return

    const currentFilters = selectedFilters[groupId] || []

    let newFilters: string[]
    if (group.type === "single") {
      newFilters = checked ? [value] : []
    } else {
      if (checked) {
        newFilters = [...currentFilters, value]
      } else {
        newFilters = currentFilters.filter((f) => f !== value)
      }
    }

    onFiltersChange({
      ...selectedFilters,
      [groupId]: newFilters,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const clearGroupFilters = (groupId: string) => {
    const newFilters = { ...selectedFilters }
    delete newFilters[groupId]
    onFiltersChange(newFilters)
  }

  const getTotalFilterCount = () => {
    return Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0)
  }

  const getGroupFilterCount = (groupId: string) => {
    return selectedFilters[groupId]?.length || 0
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-between", className)}>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>lọc</span>
            {getTotalFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTotalFilterCount()}
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" side="bottom">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">lọc</h4>
            {getTotalFilterCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Xóa tất cả
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {groups.map((group, groupIndex) => (
              <div key={group.id}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">{group.label}</Label>
                  {getGroupFilterCount(group.id) > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearGroupFilters(group.id)}
                      className="h-auto p-0"
                    >
                      Xóa
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isSelected = selectedFilters[group.id]?.includes(option.value) || false
                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${group.id}-${option.value}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleFilterChange(group.id, option.value, checked as boolean)}
                        />
                        <Label
                          htmlFor={`${group.id}-${option.value}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <span className="text-muted-foreground">({option.count})</span>
                            )}
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </div>

                {groupIndex < groups.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
