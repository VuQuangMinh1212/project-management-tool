"use client"

import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

interface BaseFieldProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
}

interface InputFieldProps extends BaseFieldProps {
  type: "text" | "email" | "password" | "number" | "tel" | "url"
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

interface TextareaFieldProps extends BaseFieldProps {
  type: "textarea"
  placeholder?: string
  value?: string
  rows?: number
  onChange?: (value: string) => void
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select"
  placeholder?: string
  value?: string
  options: Array<{ label: string; value: string }>
  onChange?: (value: string) => void
}

interface CheckboxFieldProps extends BaseFieldProps {
  type: "checkbox"
  checked?: boolean
  onChange?: (checked: boolean) => void
}

interface RadioFieldProps extends BaseFieldProps {
  type: "radio"
  value?: string
  options: Array<{ label: string; value: string }>
  onChange?: (value: string) => void
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps | CheckboxFieldProps | RadioFieldProps

export const FormField = forwardRef<HTMLElement, FormFieldProps>((props, ref) => {
  const { label, description, error, required, className } = props

  const renderField = () => {
    switch (props.type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "tel":
      case "url":
        return (
          <Input
            ref={ref as any}
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            onChange={(e) => props.onChange?.(e.target.value)}
            className={error ? "border-red-500" : ""}
          />
        )

      case "textarea":
        return (
          <Textarea
            ref={ref as any}
            placeholder={props.placeholder}
            value={props.value}
            rows={props.rows}
            onChange={(e) => props.onChange?.(e.target.value)}
            className={error ? "border-red-500" : ""}
          />
        )

      case "select":
        return (
          <Select value={props.value} onValueChange={props.onChange}>
            <SelectTrigger ref={ref as any} className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              ref={ref as any}
              checked={props.checked}
              onCheckedChange={props.onChange}
              className={error ? "border-red-500" : ""}
            />
            {label && (
              <Label className="text-sm font-normal">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
          </div>
        )

      case "radio":
        return (
          <RadioGroup value={props.value} onValueChange={props.onChange} className={error ? "border-red-500" : ""}>
            {props.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      default:
        return null
    }
  }

  if (props.type === "checkbox") {
    return (
      <div className={cn("space-y-2", className)}>
        {renderField()}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})

FormField.displayName = "FormField"
