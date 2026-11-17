
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
// ============================================================

export function useAttendance(api: AttendanceApi) {

  // ==========================================================
  // RECORDS
  // ==========================================================

  const [
    attendanceRecords,
    setAttendanceRecords,
  ] = useState<AttendanceRecordDto[]>([]);

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
  // ACTIVE SESSION
  // ==========================================================

  const [
    openSessionId,
    setOpenSessionId,
  ] = useState<string | null>(null);

  // ==========================================================
  // MANUAL ATTENDANCE
  // ==========================================================

  const [
    manualAttendanceOpen,
    setManualAttendanceOpen,
  ] = useState(false);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    isLoadingOpenSession,
    setIsLoadingOpenSession,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isLoadingQr,
    setIsLoadingQr,
  ] = useState(false);

  // ==========================================================
  // ERRORS
  // ==========================================================

  const [
    openSessionError,
    setOpenSessionError,
  ] = useState<Error | null>(null);

  const [
    error,
    setError,
  ] = useState<Error | null>(null);

  const [
    qrError,
    setQrError,
  ] = useState<Error | null>(null);

  // ==========================================================
  // ERROR NORMALIZER
  // ==========================================================

  const normalizeError = (
    err: unknown,
    fallback: string
  ): Error => {
    return err instanceof Error
      ? err
      : new Error(fallback);
  };

  // ==========================================================
  // GET OPEN ATTENDANCE SESSION
  //
  // Checks:
  // 1. Attendance session status
  // 2. Manual attendance status
  //
  // IMPORTANT:
  // These are separate states.
  // ==========================================================

  const loadOpenAttendanceSession =
    useCallback(
      async (
        batchId: string,
        trainingSessionId: string
      ) => {

        try {

          setIsLoadingOpenSession(true);
          setOpenSessionError(null);

          console.log(
            "======================================"
          );

          console.log(
            "CHECKING OPEN ATTENDANCE SESSION"
          );

          console.log({
            batchId,
            trainingSessionId,
          });

          const result =
            await api.getOpenSession(
              batchId,
              trainingSessionId
            );

          console.log(
            "OPEN SESSION API RESPONSE:",
            JSON.stringify(result, null, 2)
          );

          // ----------------------------------------------
          // DETERMINE SESSION STATUS
          // ----------------------------------------------

          const isOpen = Boolean(
            result?.isOpen &&
            result?.attendanceSessionId
          );

          const sessionId = isOpen
            ? result.attendanceSessionId
            : null;

          const isManualOpen = Boolean(
            isOpen &&
            result?.manualAttendanceOpen
          );

          // ----------------------------------------------
          // UPDATE STATES
          // ----------------------------------------------

          setOpenSessionId(sessionId);

          setManualAttendanceOpen(
            isManualOpen
          );

          console.log(
            "UPDATED ATTENDANCE STATE:",
            {
              isOpen,
              sessionId,
              isManualOpen,
            }
          );

          console.log(
            "======================================"
          );

          return result;

        } catch (err) {

          console.error(
            "FAILED TO LOAD OPEN ATTENDANCE SESSION:",
            err
          );

          const normalizedError =
            normalizeError(
              err,
              "Failed to load attendance session."
            );

          setOpenSessionId(null);
          setManualAttendanceOpen(false);

          setOpenSessionError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsLoadingOpenSession(false);

        }
      },
      [api]
    );

  // ==========================================================
  // LOAD ATTENDANCE SESSION RECORDS
  // ==========================================================

  const loadAttendanceSession =
    useCallback(
      async (sessionId: string) => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await api.getSession(sessionId);

          setAttendanceRecords(result);

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to load attendance session."
            );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsLoading(false);

        }
      },
      [api]
    );

  // ==========================================================
  // LOAD BATCH ATTENDANCE
  // ==========================================================

  const loadBatchAttendance =
    useCallback(
      async (batchId: string) => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await api.getBatch(batchId);

          setBatchAttendance(result);

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to load batch attendance."
            );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsLoading(false);

        }
      },
      [api]
    );

  // ==========================================================
  // OPEN ATTENDANCE SESSION
  // ==========================================================

  const openAttendance =
    useCallback(
      async (request: OpenAttendanceRequest) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.openSession(request);

          const result =
            await api.getOpenSession(
              request.trainingBatchId,
              request.trainingSessionId
            );

          const isOpen = Boolean(
            result?.isOpen &&
            result?.attendanceSessionId
          );

          setOpenSessionId(
            isOpen
              ? result.attendanceSessionId
              : null
          );

          setManualAttendanceOpen(
            isOpen &&
            Boolean(result?.manualAttendanceOpen)
          );

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to open attendance session."
            );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }
      },
      [api]
    );

  // ==========================================================
  // CLOSE ATTENDANCE SESSION
  // ==========================================================

  const closeAttendance =
    useCallback(
      async (sessionId: string) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.closeSession(sessionId);

          setOpenSessionId(null);
          setManualAttendanceOpen(false);

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to close attendance session."
            );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }
      },
      [api]
    );

  // ==========================================================
  // OPEN MANUAL ATTENDANCE
  // ==========================================================

  const openManualAttendance =
    useCallback(
      async (sessionId: string) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.openManualAttendance(
            sessionId
          );

          setManualAttendanceOpen(true);

          console.log(
            "MANUAL ATTENDANCE OPENED"
          );

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to open manual attendance."
            );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }
      },
      [api]
    );

  // ==========================================================
  // CLOSE MANUAL ATTENDANCE
  // ==========================================================

  const closeManualAttendance =
    useCallback(
      async (sessionId: string) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.closeManualAttendance(
            sessionId
          );

          setManualAttendanceOpen(false);

          console.log(
            "MANUAL ATTENDANCE CLOSED"
          );

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to close manual attendance."
            );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }
      },
      [api]
    );

  // ==========================================================
  // LOAD ATTENDANCE QR
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

          setAttendanceQr(result);

          return result;

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to load attendance QR."
            );

          setQrError(normalizedError);

          throw normalizedError;

        } finally {

          setIsLoadingQr(false);

        }
      },
      [api]
    );

  // ==========================================================
  // SCAN ATTENDANCE
  // ==========================================================

  const scanAttendance =
    useCallback(
      async (request: ScanAttendanceRequest) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.scan(request);

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to scan attendance QR."
            );

          setError(normalizedError);

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
      async (request: ManualAttendanceRequest) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.manual(request);

        } catch (err) {

          const normalizedError =
            normalizeError(
              err,
              "Failed to record manual attendance."
            );

          setError(normalizedError);

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
        batchId: string,
        trainingSessionId: string
      ) => {

        return loadOpenAttendanceSession(
          batchId,
          trainingSessionId
        );

      },
      [
        loadOpenAttendanceSession,
      ]
    );

  // ==========================================================
  // REFRESH ATTENDANCE SESSION
  // ==========================================================

  const refreshAttendanceSession =
    useCallback(
      async (sessionId: string) => {

        return loadAttendanceSession(
          sessionId
        );

      },
      [loadAttendanceSession]
    );

  // ==========================================================
  // REFRESH BATCH
  // ==========================================================

  const refreshBatchAttendance =
    useCallback(
      async (batchId: string) => {

        return loadBatchAttendance(
          batchId
        );

      },
      [loadBatchAttendance]
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
      setManualAttendanceOpen(false);

      setIsLoadingOpenSession(false);

      setOpenSessionError(null);
      setError(null);
      setQrError(null);

    }, []);

  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    attendanceRecords,
    batchAttendance,

    openSessionId,
    manualAttendanceOpen,

    isLoadingOpenSession,
    openSessionError,

    loadOpenAttendanceSession,
    refreshOpenAttendanceSession,

    openAttendance,
    closeAttendance,

    openManualAttendance,
    closeManualAttendance,

    loadAttendanceSession,
    refreshAttendanceSession,

    loadBatchAttendance,
    refreshBatchAttendance,

    attendanceQr,
    loadAttendanceQr,
    clearAttendanceQr,

    scanAttendance,
    manualAttendance,

    isLoading,
    isSubmitting,
    isLoadingQr,

    error,
    qrError,

    reset,
  };
}
