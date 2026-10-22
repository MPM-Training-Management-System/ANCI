import { useCallback, useState } from "react";

import type {
  FullUserRecoveryPreview,
  FullUserRecoveryResult,
} from "@repo/types";

import {
  AdminRecoveryApi,
  type ApiClient,
} from "@repo/api";

export function useFullUserRecovery(api: ApiClient) {
  const recoveryApi = new AdminRecoveryApi(api);

  const [preview, setPreview] =
    useState<FullUserRecoveryPreview | null>(null);

  const [restoreResult, setRestoreResult] =
    useState<FullUserRecoveryResult | null>(null);

  const [isLoadingPreview, setIsLoadingPreview] =
    useState(false);

  const [isRestoring, setIsRestoring] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearRecovery = useCallback(() => {
    setPreview(null);
    setRestoreResult(null);
    setError(null);
  }, []);

  const loadPreview = useCallback(
    async (userId: string) => {
      if (!userId.trim()) {
        throw new Error("User ID is required.");
      }

      setIsLoadingPreview(true);
      setError(null);
      setRestoreResult(null);

      try {
        const data =
          await recoveryApi.previewFullUserRecovery(userId);

        setPreview(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load the full user recovery preview.";

        setError(message);
        throw err;
      } finally {
        setIsLoadingPreview(false);
      }
    },
    [api],
  );

  const restoreFullUser = useCallback(
    async (userId: string) => {
      if (!userId.trim()) {
        throw new Error("User ID is required.");
      }

      setIsRestoring(true);
      setError(null);

      try {
        const data =
          await recoveryApi.restoreFullUser(userId);

        setRestoreResult(data);

        // Refresh the preview after a successful restore.
        if (data.success) {
          try {
            const refreshed =
              await recoveryApi.previewFullUserRecovery(userId);

            setPreview(refreshed);
          } catch {
            // Keep the restore result even if preview refresh fails.
          }
        }

        if (!data.success) {
          setError(
            data.messages?.join("\n") ||
              "Full user recovery failed.",
          );
        }

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to restore the user records.";

        setError(message);
        throw err;
      } finally {
        setIsRestoring(false);
      }
    },
    [api],
  );

  return {
    preview,
    restoreResult,

    isLoadingPreview,
    isRestoring,
    isLoading: isLoadingPreview || isRestoring,

    error,

    loadPreview,
    restoreFullUser,
    clearError,
    clearRecovery,
  };
}