"use client";

import { useQuery } from "@tanstack/react-query";
import type { User, ApiResponse } from "@/lib/types";

async function fetchSession(): Promise<User> {
  const res = await fetch("/api/auth/me");
  const data: ApiResponse<User> = await res.json();

  if (!data.success || !data.data) {
    throw new Error("Not authenticated");
  }

  return data.data;
}

export function useSession() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
