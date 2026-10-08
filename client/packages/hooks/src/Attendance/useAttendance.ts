import {
  useCallback,
  useState,
} from "react";

import type {
  AttendanceRecordDto,
  AttendanceQrDto,
  ManualAttendanceRequest,
  OpenAttendanceRequest,
  OpenAttendanceSessionDto,
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
// Session status and Manual Attendance status
// are two DIFFERENT states.
//
// Session OPEN
//     ↓
// QR scanning is allowed
//
// Manual Attendance OPEN
//     ↓
// Participant manual Time In / Time Out is allowed
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
  // ACTIVE SESSION
  //
  // null = no active session
  // value = actual AttendanceSession ID
  //
  // IMPORTANT:
  // This controls SESSION / QR availability only.
  // ==========================================================

  const [
    openSessionId,
    setOpenSessionId,
  ] = useState<string | null>(null);


  // ==========================================================
  // MANUAL ATTENDANCE STATUS
  //
  // true  = participant manual attendance is enabled
  // false = participant manual attendance is disabled
  //
  // IMPORTANT:
  // This is NOT the same as openSessionId.
  // ==========================================================

  const [
    manualAttendanceOpen,
    setManualAttendanceOpen,
  ] = useState(false);


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
  // GET CURRENT SESSION STATE
  //
  // GET:
  // /api/attendance/batch/{batchId}/open
  //
  // Backend returns:
  //
  // {
  //   isOpen: boolean,
  //   attendanceSessionId: string | null,
  //   manualAttendanceOpen: boolean
  // }
  //
  // IMPORTANT:
  // We do NOT use QR to determine session state.
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
          "=============================================="
        );
        console.log(
          "MOBILE - CHECKING OPEN ATTENDANCE SESSION"
        );
        console.log(
          "batchId:",
          batchId
        );
        console.log(
          "trainingSessionId:",
          trainingSessionId
        );
        console.log(
          "=============================================="
        );

        const result =
          await api.getOpenSession(
            batchId,
            trainingSessionId
          );

        console.log(
          "MOBILE - OPEN ATTENDANCE RESPONSE"
        );

        console.log(
          "result:",
          JSON.stringify(
            result,
            null,
            2
          )
        );

        console.log(
          "result.isOpen:",
          result?.isOpen
        );

        console.log(
          "result.attendanceSessionId:",
          result?.attendanceSessionId
        );

        console.log(
          "result.manualAttendanceOpen:",
          result?.manualAttendanceOpen
        );

        console.log(
          "=============================================="
        );

        // ====================================================
        // SESSION IS CLOSED
        // ====================================================

        if (
          !result?.isOpen ||
          !result?.attendanceSessionId
        ) {
          setOpenSessionId(null);
          setManualAttendanceOpen(false);

          return;
        }

        // ====================================================
        // SESSION IS OPEN
        // ====================================================

        setOpenSessionId(
          result.attendanceSessionId
        );

        setManualAttendanceOpen(
          Boolean(
            result.manualAttendanceOpen
          )
        );

      } catch (error) {
        console.error(
          "Failed to load open attendance session:",
          error
        );

        setOpenSessionId(null);
        setManualAttendanceOpen(false);

        setOpenSessionError(
          error instanceof Error
            ? error
            : new Error(
                "Failed to load attendance session."
              )
        );
      } finally {
        setIsLoadingOpenSession(false);
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
  // START / OPEN SESSION
  //
  // Session becomes OPEN.
  //
  // Manual Attendance remains CLOSED
  // until trainer explicitly opens it.
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

          const result =
            await api.getOpenSession(
              request.trainingBatchId,
              request.trainingSessionId
            );

          if (result.isOpen) {

            setOpenSessionId(
              result.attendanceSessionId
            );

            setManualAttendanceOpen(
              result.manualAttendanceOpen
            );

          } else {

            setOpenSessionId(null);
            setManualAttendanceOpen(false);

          }

          return result;

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
  // END / CLOSE SESSION
  //
  // Session CLOSED
  // Manual Attendance automatically CLOSED.
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

          setOpenSessionId(null);

          setManualAttendanceOpen(false);

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
  // OPEN MANUAL ATTENDANCE
  //
  // Session must already be OPEN.
  //
  // Result:
  // Session = OPEN
  // Manual = OPEN
  // QR = ENABLED
  // ==========================================================

  const openManualAttendance =
    useCallback(
      async (
        sessionId: string
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.openManualAttendance(
            sessionId
          );

          setManualAttendanceOpen(
            true
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to open manual attendance."
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
  // CLOSE MANUAL ATTENDANCE
  //
  // Session remains OPEN.
  //
  // Result:
  // Session = OPEN
  // Manual = CLOSED
  // QR = ENABLED
  // ==========================================================

  const closeManualAttendance =
    useCallback(
      async (
        sessionId: string
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.closeManualAttendance(
            sessionId
          );

          setManualAttendanceOpen(
            false
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to close manual attendance."
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
  // QR is permanent.
  //
  // The QR itself does NOT determine whether
  // attendance is currently open.
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
  //
  // Trainer only.
  //
  // Backend checks:
  // Session OPEN.
  //
  // Manual Attendance status does NOT matter.
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
  //
  // Participant only.
  //
  // Backend checks:
  // Session OPEN
  // Manual Attendance OPEN
  //
  // IMPORTANT:
  // AttendanceApi.manual() requires:
  //
  // 1. request
  // 2. enrollmentId
  //
  // The enrollmentId is required so the backend knows
  // which participant enrollment should receive
  // the attendance record.
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

      setManualAttendanceOpen(false);

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

    manualAttendanceOpen,

    isLoadingOpenSession,

    openSessionError,

    loadOpenAttendanceSession,

    refreshOpenAttendanceSession,


    // --------------------------------------------------------
    // Session controls
    // --------------------------------------------------------

    openAttendance,

    closeAttendance,

    openManualAttendance,

    closeManualAttendance,


    // --------------------------------------------------------
    // Attendance session
    // --------------------------------------------------------

    loadAttendanceSession,

    refreshAttendanceSession,


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