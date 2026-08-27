import { useCallback, useState } from "react";
import { AuthApi } from "@repo/api";
import type { MeUser } from "@repo/types";

export function useMe(authApi: AuthApi) {
  const [user, setUser] =
    useState<MeUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await authApi.me();

      setUser(response.user);

      return response.user;
    } catch (error) {
      setUser(null);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve authenticated user."
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authApi]);

  const reset = () => {
    setUser(null);
    setIsLoading(false);
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    fetchMe,
    reset,
  };
}