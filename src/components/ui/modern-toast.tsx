import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ModernToastProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: "border-green-200 bg-green-50 text-green-800 shadow-green-100",
  error: "border-red-200 bg-red-50 text-red-800 shadow-red-100",
  info: "border-blue-200 bg-blue-50 text-blue-800 shadow-blue-100",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800 shadow-yellow-100",
};

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-yellow-500",
};

export function ModernToast({ id, type, title, message, onClose }: ModernToastProps) {
  const Icon = toastIcons[type];

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2",
        toastStyles[type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className={cn("h-5 w-5", iconStyles[type])} />
      </div>
      
      <div className="flex-1 space-y-1 min-w-0">
        {title && (
          <div className="text-sm font-semibold leading-tight">{title}</div>
        )}
        <div className="text-sm opacity-90 leading-tight break-words">{message}</div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-black/10 flex-shrink-0"
        onClick={() => onClose(id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Đóng</span>
      </Button>
    </div>
  );
}