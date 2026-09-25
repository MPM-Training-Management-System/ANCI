import {
  useCallback,
  useState,
} from "react";

import {
  AdminDashboardApi,
} from "@repo/api";

import type {
  AdminDashboard,
} from "@repo/types";

export function useAdminDashboard(
  adminDashboardApi: AdminDashboardApi,
) {
  const [dashboard, setDashboard] =
    useState<AdminDashboard | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const getDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await adminDashboardApi.getDashboard();

      setDashboard(response);

      return response;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data right now.",
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminDashboardApi]);

  const reset = useCallback(() => {
    setDashboard(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    dashboard,
    isLoading,
    error,
    getDashboard,
    reset,
  };
}