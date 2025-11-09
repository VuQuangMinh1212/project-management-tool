"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";

export function AppInitializer() {
  const initialize = useAuth((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
