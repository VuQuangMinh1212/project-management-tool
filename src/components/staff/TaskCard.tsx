"use client";

import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Task } from "@/types/task";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from "@/constants/taskStatus"; // Updated imports
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isOverdue && "border-red-200 bg-red-50/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Priority and Project */}
          <div className="flex items-center justify-between">
            <Badge
              variant="secondary"
              className={cn("text-xs", TASK_PRIORITY_COLORS[task.priority])}
            >
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
            <div className="flex items-center space-x-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: task.project?.color || "#e2e8f0" }}
              />
              <span className="text-xs text-muted-foreground">
                {task.project?.name}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm line-clamp-2 leading-tight">
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {(task.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags?.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-1 py-0"
                >
                  {tag}
                </Badge>
              ))}
              {(task.tags?.length ?? 0) > 2 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{(task.tags?.length ?? 0) - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              {/* Assignee */}
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assigneeAvatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {task.assigneeName
                    ? task.assigneeName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "NA"}{" "}
                </AvatarFallback>
              </Avatar>

              {/* Metadata */}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {(task.comments?.length ?? 0) > 0 && (
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{task.comments?.length}</span>
                  </div>
                )}
                {(task.attachments?.length ?? 0) > 0 && (
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-3 w-3" />
                    <span>{task.attachments?.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center space-x-1 text-xs",
                  isOverdue ? "text-red-600" : "text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
