"use client"

import { useState } from "react"
import { Plus, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface WorkflowStep {
  id: string
  name: string
  type: "approval" | "assignment" | "notification" | "condition"
  assignee?: string
  conditions?: string[]
  description?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger: string
  steps: WorkflowStep[]
  active: boolean
}

interface WorkflowBuilderProps {
  workflow?: Workflow
  onSave: (workflow: Workflow) => void
  onCancel: () => void
}

export function WorkflowBuilder({ workflow, onSave, onCancel }: WorkflowBuilderProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>(
    workflow || {
      id: "",
      name: "",
      description: "",
      trigger: "",
      steps: [],
      active: false,
    },
  )

  const [newStep, setNewStep] = useState<Partial<WorkflowStep>>({
    name: "",
    type: "approval",
  })

  const stepTypes = [
    { value: "approval", label: "Approval Required" },
    { value: "assignment", label: "Task Assignment" },
    { value: "notification", label: "Send Notification" },
    { value: "condition", label: "Conditional Logic" },
  ]

  const triggers = [
    { value: "task_created", label: "Task Created" },
    { value: "task_completed", label: "Nhiệm vụ Hoàn thành" },
    { value: "project_started", label: "Project Started" },
    { value: "deadline_approaching", label: "Deadline Approaching" },
  ]

  const addStep = () => {
    if (!newStep.name || !newStep.type) return

    const step: WorkflowStep = {
      id: Date.now().toString(),
      name: newStep.name,
      type: newStep.type,
      assignee: newStep.assignee,
      conditions: newStep.conditions,
      description: newStep.description,
    }

    setCurrentWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, step],
    }))

    setNewStep({ name: "", type: "approval" })
  }

  const removeStep = (stepId: string) => {
    setCurrentWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }))
  }

  const handleSave = () => {
    if (!currentWorkflow.name || !currentWorkflow.trigger) return

    const workflowToSave: Workflow = {
      ...currentWorkflow,
      id: currentWorkflow.id || Date.now().toString(),
    }

    onSave(workflowToSave)
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "approval":
        return "✓"
      case "assignment":
        return "👤"
      case "notification":
        return "📧"
      case "condition":
        return "?"
      default:
        return "•"
    }
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case "approval":
        return "bg-blue-100 text-blue-800"
      case "assignment":
        return "bg-green-100 text-green-800"
      case "notification":
        return "bg-orange-100 text-orange-800"
      case "condition":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Workflow Details */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Configuration</CardTitle>
          <CardDescription>Define the basic workflow settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={currentWorkflow.name}
                onChange={(e) => setCurrentWorkflow((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger Event</Label>
              <Select
                value={currentWorkflow.trigger}
                onValueChange={(value) => setCurrentWorkflow((prev) => ({ ...prev, trigger: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={currentWorkflow.description}
              onChange={(e) => setCurrentWorkflow((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this workflow does"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>Define the sequence of actions for this workflow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Steps */}
          {currentWorkflow.steps.length > 0 && (
            <div className="space-y-3">
              {currentWorkflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStepColor(step.type)}>
                        {getStepIcon(step.type)} {step.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                      <span className="font-medium">{step.name}</span>
                    </div>
                    {step.description && <p className="text-sm text-muted-foreground mt-1">{step.description}</p>}
                  </div>
                  {index < currentWorkflow.steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  <Button variant="ghost" size="sm" onClick={() => removeStep(step.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Step */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stepName">Step Name</Label>
                <Input
                  id="stepName"
                  value={newStep.name}
                  onChange={(e) => setNewStep((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Step name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stepType">Step Type</Label>
                <Select
                  value={newStep.type}
                  onValueChange={(value) => setNewStep((prev) => ({ ...prev, type: value as WorkflowStep["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stepTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stepDescription">Description</Label>
                <Input
                  id="stepDescription"
                  value={newStep.description || ""}
                  onChange={(e) => setNewStep((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addStep} disabled={!newStep.name || !newStep.type}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!currentWorkflow.name || !currentWorkflow.trigger}>
          Save Workflow
        </Button>
      </div>
    </div>
  )
}
