"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import type { LoginUser } from "@repo/api";

export function useCurrentUser() {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authApi.me();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    user,
    loading,
    isAdmin: user?.role === "Admin",
    isTrainer: user?.role === "Trainer",
    isParticipant: user?.role === "Participant",
  };
}