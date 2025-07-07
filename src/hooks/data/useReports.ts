"use client"

import { useQuery } from "@tanstack/react-query"
import { reportsService, type ReportFilters } from "@/services/api/reports"

export function useTaskReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "tasks", filters],
    queryFn: () => reportsService.getTaskReport(filters),
  })
}

export function useProductivityReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "productivity", filters],
    queryFn: () => reportsService.getProductivityReport(filters),
  })
}

export function useProjectReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "projects", filters],
    queryFn: () => reportsService.getProjectReport(filters),
  })
}

export function useTimeReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "time", filters],
    queryFn: () => reportsService.getTimeReport(filters),
  })
}
