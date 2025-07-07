"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, File, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  progress?: number
}

interface FileUploadProps {
  label?: string
  description?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  value?: UploadedFile[]
  onChange?: (files: UploadedFile[]) => void
  onUpload?: (file: File) => Promise<UploadedFile>
  error?: string
  required?: boolean
  className?: string
}

export function FileUpload({
  label,
  description,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  value = [],
  onChange,
  onUpload,
  error,
  required,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File) => {
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`
    }
    if (accept && !accept.split(",").some((type) => file.type.match(type.trim()))) {
      return "File type not supported"
    }
    return null
  }

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    }

    // Check max files limit
    if (value.length + validFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`)
      return
    }

    if (errors.length > 0) {
      console.error("File validation errors:", errors)
      return
    }

    // Upload files
    const newFiles: UploadedFile[] = []
    for (const file of validFiles) {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

      // Add to uploading state
      setUploading((prev) => [...prev, fileId])

      try {
        if (onUpload) {
          const uploadedFile = await onUpload(file)
          newFiles.push(uploadedFile)
        } else {
          // Create a mock uploaded file for demo
          const mockFile: UploadedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
          }
          newFiles.push(mockFile)
        }
      } catch (error) {
        console.error("Upload failed:", error)
      } finally {
        setUploading((prev) => prev.filter((id) => id !== fileId))
      }
    }

    onChange?.([...value, ...newFiles])
  }

  const removeFile = (fileId: string) => {
    const newFiles = value.filter((file) => file.id !== fileId)
    onChange?.(newFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ""
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-red-500",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Drag and drop files here, or{" "}
            <Button type="button" variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>
              browse
            </Button>
          </p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          <p className="text-xs text-muted-foreground">
            Max file size: {formatFileSize(maxSize)} • Max files: {maxFiles}
          </p>
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => (
            <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                {file.progress !== undefined && file.progress < 100 && (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                disabled={uploading.includes(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
