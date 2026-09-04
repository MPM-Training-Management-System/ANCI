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


// ============================================================
// ATTENDANCE HOOK
//
// Shared by:
// - Trainer Web
// - Participant Mobile
// - Admin Web
//
// IMPORTANT:
// AttendanceSession status comes from backend.
// We DO NOT infer OPEN/CLOSED from QR.
// ============================================================

export function useAttendance(
  api: AttendanceApi
) {

  // ==========================================================
  // ATTENDANCE RECORDS
  // ==========================================================

  const [
    attendanceRecords,
    setAttendanceRecords,
  ] = useState<AttendanceRecordDto[]>([]);


  // ==========================================================
  // BATCH ATTENDANCE
  // ==========================================================

  const [
    batchAttendance,
    setBatchAttendance,
  ] = useState<AttendanceRecordDto[]>([]);


  // ==========================================================
  // QR
  // ==========================================================

  const [
    attendanceQr,
    setAttendanceQr,
  ] = useState<AttendanceQrDto | null>(null);


  // ==========================================================
  // ACTIVE OPEN SESSION
  //
  // null = no open session
  // value = actual AttendanceSession ID
  // ==========================================================

  const [
    openSessionId,
    setOpenSessionId,
  ] = useState<string | null>(null);


  // ==========================================================
  // OPEN SESSION LOADING
  // ==========================================================

  const [
    isLoadingOpenSession,
    setIsLoadingOpenSession,
  ] = useState(false);


  // ==========================================================
  // OPEN SESSION ERROR
  // ==========================================================

  const [
    openSessionError,
    setOpenSessionError,
  ] = useState<Error | null>(null);


  // ==========================================================
  // GENERAL LOADING
  // ==========================================================

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  // ==========================================================
  // SUBMITTING
  // ==========================================================

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  // ==========================================================
  // QR LOADING
  // ==========================================================

  const [
    isLoadingQr,
    setIsLoadingQr,
  ] = useState(false);


  // ==========================================================
  // GENERAL ERROR
  // ==========================================================

  const [
    error,
    setError,
  ] = useState<Error | null>(null);


  // ==========================================================
  // QR ERROR
  // ==========================================================

  const [
    qrError,
    setQrError,
  ] = useState<Error | null>(null);


  // ==========================================================
  // GET CURRENT OPEN SESSION
  //
  // GET
  // /api/attendance/batch/{batchId}/open
  //
  // 200:
  // {
  //   attendanceSessionId: "..."
  // }
  //
  // 404:
  // No active session
  // ==========================================================

  const loadOpenAttendanceSession =
    useCallback(
      async (
        batchId: string
      ) => {

        if (!batchId) {
          setOpenSessionId(null);
          return null;
        }

        try {

          setIsLoadingOpenSession(true);
          setOpenSessionError(null);

          const result =
            await api.getOpenSession(
              batchId
            );

          const sessionId =
            result.attendanceSessionId;

          setOpenSessionId(
            sessionId
          );

          return sessionId;

        } catch (err) {

          /*
           * IMPORTANT
           *
           * 404 means there is no open
           * attendance session.
           *
           * This is NOT treated as a
           * fatal application error.
           */

          setOpenSessionId(null);

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "No open attendance session."
                );

          setOpenSessionError(
            normalizedError
          );

          return null;

        } finally {

          setIsLoadingOpenSession(
            false
          );

        }

      },
      [api]
    );


  // ==========================================================
  // GET ATTENDANCE SESSION RECORDS
  // ==========================================================

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


  // ==========================================================
  // GET BATCH ATTENDANCE
  // ==========================================================

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


  // ==========================================================
  // OPEN ATTENDANCE
  // ==========================================================

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

          /*
           * Immediately ask backend for
           * the real active session.
           */

          const sessionId =
            await api.getOpenSession(
              request.trainingBatchId
            );

          setOpenSessionId(
            sessionId.attendanceSessionId
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


  // ==========================================================
  // CLOSE ATTENDANCE
  // ==========================================================

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

          /*
           * Backend is now closed.
           */

          setOpenSessionId(
            null
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


  // ==========================================================
  // LOAD PARTICIPANT QR
  //
  // NOTE:
  // This endpoint is session-based in the
  // current API.
  //
  // The UI should not use QR availability
  // to determine OPEN/CLOSED.
  // ==========================================================

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
                  "Failed to load attendance QR."
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


  // ==========================================================
  // SCAN ATTENDANCE QR
  // ==========================================================

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


  // ==========================================================
  // MANUAL TIME IN / TIME OUT
  // ==========================================================

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


  // ==========================================================
  // REFRESH OPEN SESSION
  // ==========================================================

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


  // ==========================================================
  // REFRESH SESSION RECORDS
  // ==========================================================

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


  // ==========================================================
  // REFRESH BATCH
  // ==========================================================

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


  // ==========================================================
  // CLEAR QR
  // ==========================================================

  const clearAttendanceQr =
    useCallback(() => {

      setAttendanceQr(null);
      setQrError(null);

    }, []);


  // ==========================================================
  // RESET
  // ==========================================================

  const reset =
    useCallback(() => {

      setAttendanceRecords([]);

      setBatchAttendance([]);

      setAttendanceQr(null);

      setOpenSessionId(null);

      setOpenSessionError(null);

      setError(null);

      setQrError(null);

    }, []);


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    // --------------------------------------------------------
    // Records
    // --------------------------------------------------------

    attendanceRecords,

    batchAttendance,


    // --------------------------------------------------------
    // Session
    // --------------------------------------------------------

    openSessionId,

    isLoadingOpenSession,

    openSessionError,

    loadOpenAttendanceSession,

    refreshOpenAttendanceSession,


    // --------------------------------------------------------
    // Attendance session
    // --------------------------------------------------------

    loadAttendanceSession,

    refreshAttendanceSession,

    openAttendance,

    closeAttendance,


    // --------------------------------------------------------
    // Batch
    // --------------------------------------------------------

    loadBatchAttendance,

    refreshBatchAttendance,


    // --------------------------------------------------------
    // QR
    // --------------------------------------------------------

    attendanceQr,

    loadAttendanceQr,

    clearAttendanceQr,


    // --------------------------------------------------------
    // Scanner
    // --------------------------------------------------------

    scanAttendance,


    // --------------------------------------------------------
    // Manual
    // --------------------------------------------------------

    manualAttendance,


    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

    isLoading,

    isSubmitting,

    isLoadingQr,

    error,

    qrError,


    // --------------------------------------------------------
    // Reset
    // --------------------------------------------------------

    reset,
  };
}