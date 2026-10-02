"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  CreateTrainerReportRequest,
  TrainerReportRequest,
} from "@repo/types";

import type {
  TrainerReportRequestApi,
} from "@repo/api";

export function useTrainerReportRequests(
  trainerReportRequestApi: TrainerReportRequestApi
) {
  const [requests, setRequests] = useState<
    TrainerReportRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // LOAD MY REQUESTS
  // =========================================================

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await trainerReportRequestApi.getMyRequests();

      setRequests(response.items ?? []);
    } catch (err) {
      console.error(
        "Failed to load trainer report requests:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load report requests."
      );
    } finally {
      setLoading(false);
    }
  }, [trainerReportRequestApi]);

  // =========================================================
  // CREATE REQUEST
  // =========================================================

  const createRequest = useCallback(
    async (
      payload: CreateTrainerReportRequest
    ) => {
      try {
        setSubmitting(true);
        setError(null);

        const created =
          await trainerReportRequestApi.createRequest(
            payload
          );

        setRequests((current) => [
          created,
          ...current,
        ]);

        return created;
      } catch (err) {
        console.error(
          "Failed to create trainer report request:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Failed to submit report request.";

        setError(message);

        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [trainerReportRequestApi]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return {
    requests,
    loading,
    submitting,
    error,

    loadRequests,
    createRequest,
  };
}