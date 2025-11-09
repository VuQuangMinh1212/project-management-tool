"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { ModernToast, ModernToastProps } from "./modern-toast";
import { createPortal } from "react-dom";

interface ToastContextType {
  showToast: (toast: Omit<ModernToastProps, "id" | "onClose">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useModernToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useModernToast must be used within a ModernToastProvider");
  }
  return context;
}

interface Toast extends Omit<ModernToastProps, "onClose"> {
  id: string;
}

export function ModernToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (toast: Omit<ModernToastProps, "id" | "onClose">) => {
    addToast(toast);
  };

  const success = (message: string, title?: string) => {
    addToast({ type: "success", message, title });
  };

  const error = (message: string, title?: string) => {
    addToast({ type: "error", message, title });
  };

  const info = (message: string, title?: string) => {
    addToast({ type: "info", message, title });
  };

  const warning = (message: string, title?: string) => {
    addToast({ type: "warning", message, title });
  };

  const contextValue: ToastContextType = {
    showToast,
    success,
    error,
    info,
    warning,
  };

  if (!mounted) {
    return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
          {toasts.map((toast) => (
            <ModernToast
              key={toast.id}
              {...toast}
              onClose={removeToast}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}