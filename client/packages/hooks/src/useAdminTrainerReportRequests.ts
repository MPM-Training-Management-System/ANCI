"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  AdminTrainerReportRequest,
  ReviewTrainerReportRequest,
} from "@repo/types";

import type {
  TrainerReportRequestApi,
} from "@repo/api";

export function useAdminTrainerReportRequests(
  trainerReportRequestApi: TrainerReportRequestApi
) {
  const [
    requests,
    setRequests,
  ] = useState<AdminTrainerReportRequest[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processingId,
    setProcessingId,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  // =========================================================
  // LOAD
  // =========================================================

  const loadRequests =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await trainerReportRequestApi
            .getAdminRequests();

        setRequests(
          response ?? []
        );
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
  // APPROVE
  // =========================================================

  const approveRequest =
    useCallback(
      async (
        id: string,
        payload: ReviewTrainerReportRequest
      ) => {
        try {
          setProcessingId(id);
          setError(null);

          const updated =
            await trainerReportRequestApi
              .approveRequest(
                id,
                payload
              );

          setRequests(
            current =>
              current.map(
                request =>
                  request.id === id
                    ? updated
                    : request
              )
          );

          return updated;
        } catch (err) {
          console.error(
            "Failed to approve trainer report request:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to approve report request.";

          setError(message);

          throw err;
        } finally {
          setProcessingId(null);
        }
      },
      [trainerReportRequestApi]
    );

  // =========================================================
  // REJECT
  // =========================================================

  const rejectRequest =
    useCallback(
      async (
        id: string,
        payload: ReviewTrainerReportRequest
      ) => {
        try {
          setProcessingId(id);
          setError(null);

          const updated =
            await trainerReportRequestApi
              .rejectRequest(
                id,
                payload
              );

          setRequests(
            current =>
              current.map(
                request =>
                  request.id === id
                    ? updated
                    : request
              )
          );

          return updated;
        } catch (err) {
          console.error(
            "Failed to reject trainer report request:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to reject report request.";

          setError(message);

          throw err;
        } finally {
          setProcessingId(null);
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

    processingId,

    error,

    loadRequests,

    approveRequest,

    rejectRequest,
  };
}