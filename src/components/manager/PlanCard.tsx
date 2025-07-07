"use client"

import { Calendar, Users, Target, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Plan {
  id: string
  title: string
  description: string
  status: "planning" | "active" | "completed" | "on_hold"
  priority: "low" | "medium" | "high"
  progress: number
  startDate: string
  endDate: string
  teamSize: number
  budget?: number
  spent?: number
  objectives: string[]
  assignedTo: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

interface PlanCardProps {
  plan: Plan
  onClick?: () => void
}

export function PlanCard({ plan, onClick }: PlanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "on_hold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{plan.title}</CardTitle>
            <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Badge className={getStatusColor(plan.status)}>
              {plan.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
            <Badge className={getPriorityColor(plan.priority)}>
              {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{plan.progress}%</span>
          </div>
          <Progress value={plan.progress} className="h-2" />
        </div>

        {/* Timeline */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
          </span>
        </div>

        {/* Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{plan.teamSize} members</span>
          </div>
          <div className="flex -space-x-2">
            {plan.assignedTo.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={member.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
            {plan.assignedTo.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{plan.assignedTo.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Budget (if available) */}
        {plan.budget && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Budget</span>
            </div>
            <span className="font-medium">
              ${plan.spent?.toLocaleString() || 0} / ${plan.budget.toLocaleString()}
            </span>
          </div>
        )}

        {/* Objectives */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Key Objectives</span>
          <div className="space-y-1">
            {plan.objectives.slice(0, 2).map((objective, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground line-clamp-1">{objective}</span>
              </div>
            ))}
            {plan.objectives.length > 2 && (
              <span className="text-xs text-muted-foreground">+{plan.objectives.length - 2} more objectives</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
