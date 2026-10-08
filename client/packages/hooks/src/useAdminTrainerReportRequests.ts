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
  AdminTrainerReportRequestApi,
} from "@repo/api";

export function useAdminTrainerReportRequests(
  trainerReportRequestApi: AdminTrainerReportRequestApi
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
  // LOAD REQUESTS
  // =========================================================

  const loadRequests =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await trainerReportRequestApi
            .getAllRequests();

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
  // APPROVE AND GENERATE REPORT
  // =========================================================

  const approveAndGenerate =
    useCallback(
      async (
        id: string,
        file: Blob,
        adminRemarks?: string | null
      ) => {
        try {
          setProcessingId(id);
          setError(null);

          const updated =
            await trainerReportRequestApi
              .approveAndGenerate(
                id,
                file,
                adminRemarks
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
            "Failed to approve and generate trainer report:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : "Failed to approve and generate report.";

          setError(message);

          throw err;
        } finally {
          setProcessingId(null);
        }
      },
      [trainerReportRequestApi]
    );

  // =========================================================
  // REJECT REQUEST
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
              .reject(
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

  // =========================================================
  // RETURN
  // =========================================================

  return {
    requests,

    loading,

    processingId,

    error,

    loadRequests,

    approveAndGenerate,

    rejectRequest,
  };
}