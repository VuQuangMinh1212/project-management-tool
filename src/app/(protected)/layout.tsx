"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/shared/layout/Sidebar";
import { useAuth } from "@/hooks/auth/useAuth";
import { ROUTES } from "@/constants/routes";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading, initialize } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      }
    };
    
    initAuth();
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show better loading UI for improved UX
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        {/* Sidebar skeleton */}
        <div className="w-64 bg-card border-r border-border p-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
