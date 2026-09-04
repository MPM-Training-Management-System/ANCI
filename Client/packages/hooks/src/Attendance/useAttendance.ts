import {
  useCallback,
  useState,
} from "react";

import type {
  AttendanceRecordDto,
  AttendanceQrDto,
  ManualAttendanceRequest,
  OpenAttendanceRequest,
  ScanAttendanceRequest,
} from "@repo/types";

import type {
  AttendanceApi,
} from "@repo/api";


// =========================================================
// TYPES
// =========================================================

export type OpenAttendanceSessionDto = {
  attendanceSessionId: string;
};


// =========================================================
// ATTENDANCE HOOK
//
// Shared by:
// - Trainer Web
// - Participant Mobile
// - Admin Web
//
// Handles:
// - Opening attendance session
// - Closing attendance session
// - Loading attendance session
// - Checking open attendance session
// - Generating attendance QR
// - Scanning participant QR
// - Manual Time In / Time Out
// - Loading batch attendance
// =========================================================

export function useAttendance(
  api: AttendanceApi
) {

  // =======================================================
  // STATE
  // =======================================================

  const [attendanceRecords, setAttendanceRecords] =
    useState<AttendanceRecordDto[]>([]);

  const [batchAttendance, setBatchAttendance] =
    useState<AttendanceRecordDto[]>([]);

  const [attendanceQr, setAttendanceQr] =
    useState<AttendanceQrDto | null>(null);


  // =======================================================
  // GENERAL STATE
  // =======================================================

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);


  // =======================================================
  // QR STATE
  // =======================================================

  const [isLoadingQr, setIsLoadingQr] =
    useState(false);

  const [qrError, setQrError] =
    useState<Error | null>(null);


  // =======================================================
  // OPEN ATTENDANCE SESSION STATE
  //
  // Used by Participant Mobile to determine whether the
  // trainer currently has an attendance session open.
  // =======================================================

  const [openSessionId, setOpenSessionId] =
    useState<string | null>(null);

  const [isLoadingOpenSession, setIsLoadingOpenSession] =
    useState(false);

  const [openSessionError, setOpenSessionError] =
    useState<Error | null>(null);


  // =========================================================
  // GET ATTENDANCE SESSION
  //
  // Trainer / Participant / Admin:
  //
  // GET /api/attendance/sessions/{id}
  // =========================================================

  const loadAttendanceSession =
    useCallback(
      async (
        sessionId: string
      ) => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await api.getSession(
              sessionId
            );

          setAttendanceRecords(
            result
          );

          return result;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to load attendance session."
                );

          setError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsLoading(false);

        }

      },
      [api]
    );


  // =========================================================
  // GET BATCH ATTENDANCE
  //
  // Trainer / Participant / Admin:
  //
  // GET /api/attendance/batch/{batchId}
  // =========================================================

  const loadBatchAttendance =
    useCallback(
      async (
        batchId: string
      ) => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await api.getBatch(
              batchId
            );

          setBatchAttendance(
            result
          );

          return result;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to load batch attendance."
                );

          setError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsLoading(false);

        }

      },
      [api]
    );


  // =========================================================
  // GET OPEN ATTENDANCE SESSION
  //
  // Participant:
  //
  // GET /api/attendance/batch/{batchId}/open
  //
  // Returns the currently open attendance session.
  //
  // If there is no open session, openSessionId becomes null.
  // =========================================================

  const loadOpenAttendanceSession =
    useCallback(
      async (
        batchId: string
      ) => {

        try {

          setIsLoadingOpenSession(
            true
          );

          setOpenSessionError(
            null
          );

          const result =
            await api.openSession(
              { trainingBatchId: batchId }
            );

          const sessionId =
            result.attendanceSessionId;

          setOpenSessionId(
            sessionId
          );

          return sessionId;

        } catch (err) {

          setOpenSessionId(
            null
          );

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "No open attendance session."
                );

          setOpenSessionError(
            normalizedError
          );

          // Do not throw here.
          //
          // A 404 simply means attendance is closed.
          // The participant screen should still work and
          // display the permanent QR.

          return null;

        } finally {

          setIsLoadingOpenSession(
            false
          );

        }

      },
      [api]
    );


  // =========================================================
  // REFRESH OPEN ATTENDANCE SESSION
  // =========================================================

  const refreshOpenAttendanceSession =
    useCallback(
      async (
        batchId: string
      ) => {

        return loadOpenAttendanceSession(
          batchId
        );

      },
      [
        loadOpenAttendanceSession,
      ]
    );


  // =========================================================
  // CLEAR OPEN ATTENDANCE SESSION
  // =========================================================

  const clearOpenAttendanceSession =
    useCallback(() => {

      setOpenSessionId(
        null
      );

      setOpenSessionError(
        null
      );

    }, []);


  // =========================================================
  // OPEN ATTENDANCE SESSION
  //
  // Trainer:
  //
  // POST /api/attendance/sessions/open
  // =========================================================

  const openAttendance =
    useCallback(
      async (
        request: OpenAttendanceRequest
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.openSession(
            request
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to open attendance session."
                );

          setError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // CLOSE ATTENDANCE SESSION
  //
  // Trainer:
  //
  // POST /api/attendance/sessions/{id}/close
  // =========================================================

  const closeAttendance =
    useCallback(
      async (
        sessionId: string
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.closeSession(
            sessionId
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to close attendance session."
                );

          setError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // GET ATTENDANCE QR
  //
  // Trainer:
  //
  // GET /api/attendance/sessions/{id}/qr
  // =========================================================

  const loadAttendanceQr =
    useCallback(
      async (
        sessionId: string,
        enrollmentId: string
      ) => {

        try {

          setIsLoadingQr(true);
          setQrError(null);

          const result =
            await api.getQr(
              sessionId,
              enrollmentId
            );

          setAttendanceQr(
            result
          );

          return result;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to generate attendance QR."
                );

          setQrError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsLoadingQr(false);

        }

      },
      [api]
    );


  // =========================================================
  // SCAN ATTENDANCE QR
  //
  // Trainer:
  //
  // POST /api/attendance/scan
  // =========================================================

  const scanAttendance =
    useCallback(
      async (
        request: ScanAttendanceRequest
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.scan(
            request
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to scan attendance QR."
                );

          setError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // MANUAL ATTENDANCE
  //
  // Participant:
  //
  // POST /api/attendance/manual
  //
  // Action:
  // - TimeIn
  // - TimeOut
  //
  // Only allowed while attendance session is OPEN.
  // =========================================================

  const manualAttendance =
    useCallback(
      async (
        request: ManualAttendanceRequest
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.manual(
            request
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to record manual attendance."
                );

          setError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // REFRESH SESSION ATTENDANCE
  // =========================================================

  const refreshAttendanceSession =
    useCallback(
      async (
        sessionId: string
      ) => {

        return loadAttendanceSession(
          sessionId
        );

      },
      [
        loadAttendanceSession,
      ]
    );


  // =========================================================
  // REFRESH BATCH ATTENDANCE
  // =========================================================

  const refreshBatchAttendance =
    useCallback(
      async (
        batchId: string
      ) => {

        return loadBatchAttendance(
          batchId
        );

      },
      [
        loadBatchAttendance,
      ]
    );


  // =========================================================
  // CLEAR QR
  // =========================================================

  const clearAttendanceQr =
    useCallback(() => {

      setAttendanceQr(
        null
      );

      setQrError(
        null
      );

    }, []);


  // =========================================================
  // RESET
  // =========================================================

  const reset =
    useCallback(() => {

      setAttendanceRecords(
        []
      );

      setBatchAttendance(
        []
      );

      setAttendanceQr(
        null
      );

      setOpenSessionId(
        null
      );

      setError(
        null
      );

      setQrError(
        null
      );

      setOpenSessionError(
        null
      );

    }, []);


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // -------------------------------------------------------
    // Session Attendance
    // -------------------------------------------------------

    attendanceRecords,

    loadAttendanceSession,

    refreshAttendanceSession,


    // -------------------------------------------------------
    // Batch Attendance
    // -------------------------------------------------------

    batchAttendance,

    loadBatchAttendance,

    refreshBatchAttendance,


    // -------------------------------------------------------
    // Attendance Session
    // -------------------------------------------------------

    openAttendance,

    closeAttendance,


    // -------------------------------------------------------
    // OPEN SESSION
    // -------------------------------------------------------

    openSessionId,

    loadOpenAttendanceSession,

    refreshOpenAttendanceSession,

    clearOpenAttendanceSession,

    isLoadingOpenSession,

    openSessionError,


    // -------------------------------------------------------
    // QR Attendance
    // -------------------------------------------------------

    attendanceQr,

    loadAttendanceQr,

    clearAttendanceQr,


    // -------------------------------------------------------
    // QR Scanning
    // -------------------------------------------------------

    scanAttendance,


    // -------------------------------------------------------
    // Manual Attendance
    // -------------------------------------------------------

    manualAttendance,


    // -------------------------------------------------------
    // General State
    // -------------------------------------------------------

    isLoading,

    isSubmitting,

    error,


    // -------------------------------------------------------
    // QR State
    // -------------------------------------------------------

    isLoadingQr,

    qrError,


    // -------------------------------------------------------
    // Reset
    // -------------------------------------------------------

    reset,
  };
}