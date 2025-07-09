"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Task } from "@/types/task";
import { TaskStatus, TaskPriority } from "@/types/task";
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/constants/taskStatus"; // Updated imports

interface ReportChartProps {
  tasks: Task[];
  type?: "status" | "priority";
  excludeStatuses?: TaskStatus[]; // New prop to exclude certain statuses
}

const COLORS = {
  [TaskStatus.DRAFT]: "#6b7280",
  [TaskStatus.PENDING_APPROVAL]: "#f59e0b",
  [TaskStatus.APPROVED]: "#8b5cf6",
  [TaskStatus.TODO]: "#94a3b8",
  [TaskStatus.IN_PROGRESS]: "#3b82f6",
  [TaskStatus.DONE]: "#10b981",
  [TaskStatus.FINISHED]: "#059669",
  [TaskStatus.DELAYED]: "#dc2626",
  [TaskStatus.CANCELLED]: "#6b7280",
  [TaskStatus.REJECTED]: "#ef4444",
  [TaskStatus.OVERDUE]: "#dc2626",
};

const PRIORITY_COLORS = {
  [TaskPriority.LOW]: "#94a3b8",
  [TaskPriority.MEDIUM]: "#3b82f6",
  [TaskPriority.HIGH]: "#f59e0b",
  [TaskPriority.URGENT]: "#ef4444",
};

export function ReportChart({ tasks, type = "status", excludeStatuses = [] }: ReportChartProps) {
  if (type === "status") {
    const statusesToShow = Object.values(TaskStatus).filter(status => !excludeStatuses.includes(status));
    
    const statusData = statusesToShow.map((status) => ({
      name: TASK_STATUS_LABELS[status],
      value: tasks.filter((task) => task.status === status).length,
      color: COLORS[status],
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={statusData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "priority") {
    const priorityData = Object.values(TaskPriority).map((priority) => ({
      name: TASK_PRIORITY_LABELS[priority], // Use TASK_PRIORITY_LABELS
      value: tasks.filter((task) => task.priority === priority).length,
      color: PRIORITY_COLORS[priority],
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={priorityData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {priorityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
