"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainerDashboard,
} from "@repo/types";

import type {
  TrainerDashboardApi,
} from "@repo/api";

export function useTrainerDashboard(
  trainerDashboardApi: TrainerDashboardApi
) {
  // =========================================================
  // STATE
  // =========================================================

  const [dashboard, setDashboard] =
    useState<TrainerDashboard | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const data =
          await trainerDashboardApi.getDashboard();

        setDashboard(data);
      } catch (err) {
        console.error(
          "Failed to load trainer dashboard:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load trainer dashboard.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [trainerDashboardApi]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =========================================================
  // REFRESH
  // =========================================================

  const refresh = useCallback(async () => {
    await fetchDashboard(true);
  }, [fetchDashboard]);

  // =========================================================
  // RETURN
  // =========================================================

  return {
    dashboard,

    loading,

    refreshing,

    error,

    refresh,

    refetch: fetchDashboard,
  };
}