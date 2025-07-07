"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";

export function AppInitializer() {
  useEffect(() => {
    useAuth.getState().initialize();
  }, []);

  return null;
}
