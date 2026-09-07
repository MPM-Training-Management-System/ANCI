"use client";

import { useCallback, useState } from "react";
import type { AttendanceProgressDto } from "@repo/types";

export interface AttendanceProgressApi {
  getAttendanceProgress(): Promise<AttendanceProgressDto[]>;
}

export function useAttendanceProgress(
  api: AttendanceProgressApi
) {
  const [attendanceProgress, setAttendanceProgress] =
    useState<AttendanceProgressDto[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);

  const loadAttendanceProgress =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await api.getAttendanceProgress();

        setAttendanceProgress(result);

        return result;
      } catch (err) {
        const normalizedError =
          err instanceof Error
            ? err
            : new Error(
                "Failed to load attendance progress."
              );

        setError(normalizedError);
        throw normalizedError;
      } finally {
        setIsLoading(false);
      }
    }, [api]);

  return {
    attendanceProgress,
    loadAttendanceProgress,
    isLoading,
    error,
  };
}