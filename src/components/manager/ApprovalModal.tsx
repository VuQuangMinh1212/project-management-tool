"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, X } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const approvalSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  comments: z.string().optional(),
})

type ApprovalFormData = z.infer<typeof approvalSchema>

interface ApprovalRequest {
  id: string
  type: "task_completion" | "time_off" | "expense" | "project_change"
  title: string
  description: string
  requestedBy: {
    id: string
    name: string
    avatar?: string
  }
  requestedAt: string
  details: any
}

interface ApprovalModalProps {
  request: ApprovalRequest | null
  open: boolean
  onClose: () => void
  onApprove: (id: string, comments?: string) => void
  onReject: (id: string, comments?: string) => void
}

export function ApprovalModal({ request, open, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
  })

  const onSubmit = (data: ApprovalFormData) => {
    if (!request || !decision) return

    if (decision === "approved") {
      onApprove(request.id, data.comments)
    } else {
      onReject(request.id, data.comments)
    }

    reset()
    setDecision(null)
    onClose()
  }

  const handleDecision = (newDecision: "approved" | "rejected") => {
    setDecision(newDecision)
  }

  if (!request) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Xem xét yêu cầu phê duyệt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={request.requestedBy.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {request.requestedBy.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{request.title}</h3>
                <p className="text-sm text-muted-foreground">Yêu cầu bởi {request.requestedBy.name}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {request.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
            </div>

            <p className="text-muted-foreground">{request.description}</p>

            {/* Type-specific details */}
            <div className="p-4 bg-muted rounded-lg">
              {request.type === "task_completion" && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Số giờ đã ghi:</strong> {request.details.hoursLogged}
                  </p>
                  <p className="text-sm">
                    <strong>Ghi chú hoàn thành:</strong> {request.details.completionNotes}
                  </p>
                </div>
              )}

              {request.type === "time_off" && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Thời gian:</strong> {request.details.days} ngày
                  </p>
                  <p className="text-sm">
                    <strong>Ngày:</strong> {request.details.startDate} đến {request.details.endDate}
                  </p>
                  <p className="text-sm">
                    <strong>Lý do:</strong> {request.details.reason}
                  </p>
                </div>
              )}

              {request.type === "expense" && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Số tiền:</strong> ${request.details.amount}
                  </p>
                  <p className="text-sm">
                    <strong>Danh mục:</strong> {request.details.category}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant={decision === "approved" ? "default" : "outline"}
              onClick={() => handleDecision("approved")}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Phê duyệt
            </Button>
            <Button
              variant={decision === "rejected" ? "destructive" : "outline"}
              onClick={() => handleDecision("rejected")}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
          </div>

          {/* Comments Form */}
          {decision && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comments">
                  Nhận xét {decision === "rejected" && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="comments"
                  {...register("comments", {
                    required: decision === "rejected" ? "Nhận xét bắt buộc khi từ chối" : false,
                  })}
                  placeholder={
                    decision === "approved"
                      ? "Thêm nhận xét bổ sung (tùy chọn)"
                      : "Vui lòng cung cấp lý do từ chối"
                  }
                  rows={3}
                />
                {errors.comments && <p className="text-sm text-red-500">{errors.comments.message}</p>}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant={decision === "approved" ? "default" : "destructive"}
                  className="min-w-24"
                >
                  {decision === "approved" ? "Phê duyệt" : "Từ chối"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
