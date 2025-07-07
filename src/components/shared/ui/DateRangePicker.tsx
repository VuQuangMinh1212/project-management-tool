"use client"

import { useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DateRange } from "@/lib/utils/dateRanges"
import { getDateRangeOptions, getDateRangeForPeriod, getCustomDateRange } from "@/lib/utils/dateRanges"

interface DateRangePickerProps {
  value?: DateRange | null
  onChange: (dateRange: DateRange | null) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  const [customStart, setCustomStart] = useState<Date>()
  const [customEnd, setCustomEnd] = useState<Date>()

  const presetOptions = getDateRangeOptions()

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue)
    
    if (presetValue === "custom") {
      // Switch to custom mode
      setCustomStart(value?.start)
      setCustomEnd(value?.end)
      return
    }
    
    const preset = presetOptions.find(opt => opt.value === presetValue)
    if (preset) {
      const dateRange = getDateRangeForPeriod(preset.period, preset.offset)
      onChange(dateRange)
      setIsOpen(false)
    }
  }

  const handleCustomDateChange = () => {
    if (customStart && customEnd) {
      const customRange = getCustomDateRange(
        format(customStart, "yyyy-MM-dd"),
        format(customEnd, "yyyy-MM-dd")
      )
      if (customRange) {
        onChange(customRange)
        setIsOpen(false)
      }
    }
  }

  const displayText = value 
    ? `${format(value.start, "MMM dd")} - ${format(value.end, "MMM dd, yyyy")}`
    : "Select date range"

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Select</label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a preset" />
              </SelectTrigger>
              <SelectContent>
                {presetOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedPreset === "custom" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  className="rounded-md border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  className="rounded-md border"
                  disabled={(date) => customStart ? date < customStart : false}
                />
              </div>
              <Button 
                onClick={handleCustomDateChange}
                className="w-full"
                disabled={!customStart || !customEnd}
              >
                Apply Custom Range
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
