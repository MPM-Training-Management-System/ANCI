"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  AttendanceRecordDto,
  TrainingBatch,
} from "@repo/types";

type AttendanceRecordWithProfile = AttendanceRecordDto & {
  profileImageUrl?: string | null;
};

import {
  attendanceApi,
  trainingBatchApi,
} from "@/lib/api";

import type { Html5Qrcode } from "html5-qrcode";

export default function TrainerAttendancePage() {
  // =========================================================
  // TRAINING BATCHES
  // =========================================================

  const [batches, setBatches] = useState<TrainingBatch[]>([]);

  const [selectedBatchId, setSelectedBatchId] =
    useState<string>("");

  // =========================================================
  // ATTENDANCE
  // =========================================================

  const [records, setRecords] =
    useState<AttendanceRecordWithProfile[]>([]);

  const [openSessionId, setOpenSessionId] =
    useState<string | null>(null);

  // =========================================================
  // UI STATE
  // =========================================================

  const [search, setSearch] = useState("");

  const [isLoadingBatches, setIsLoadingBatches] =
    useState(true);

  const [isLoadingAttendance, setIsLoadingAttendance] =
    useState(false);

  const [isOpening, setIsOpening] = useState(false);

  const [isClosing, setIsClosing] = useState(false);

  const [isScanning, setIsScanning] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [scanError, setScanError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [scanResult, setScanResult] =
    useState<string | null>(null);

  // =========================================================
  // QR
  // =========================================================

  const [scannedToken, setScannedToken] =
    useState("");

  // =========================================================
  // QR SCANNER REFS
  // =========================================================

  const scannerRef =
    useRef<Html5Qrcode | null>(null);

  const processingScanRef =
    useRef(false);

  // =========================================================
  // SELECTED BATCH
  // =========================================================

  const selectedBatch = useMemo(() => {
    return (
      batches.find(
        batch => batch.id === selectedBatchId
      ) ?? null
    );
  }, [
    batches,
    selectedBatchId,
  ]);

  // =========================================================
  // LOAD BATCHES
  // =========================================================

  const loadBatches = useCallback(async () => {
    try {
      setIsLoadingBatches(true);
      setError(null);

      const result =
        await trainingBatchApi.getAll();

      setBatches(result);

      const firstBatch =
        result.at(0);

      if (
        firstBatch &&
        !selectedBatchId
      ) {
        setSelectedBatchId(
          firstBatch.id
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load training batches."
      );
    } finally {
      setIsLoadingBatches(false);
    }
  }, [
    selectedBatchId,
  ]);

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  const loadAttendance = useCallback(
    async (batchId: string) => {
      try {
        setIsLoadingAttendance(true);
        setError(null);

        const result =
          await attendanceApi.getBatch(
            batchId
          );

        setRecords(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance records."
        );

        setRecords([]);
      } finally {
        setIsLoadingAttendance(false);
      }
    },
    []
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    void loadBatches();
  }, [
    loadBatches,
  ]);

  // =========================================================
  // RESTORE OPEN SESSION
  // =========================================================

  useEffect(() => {
    if (!selectedBatchId) {
      setOpenSessionId(null);
      return;
    }

    const storageKey =
      `attendance-session-${selectedBatchId}`;

    const savedSessionId =
      window.localStorage.getItem(
        storageKey
      );

    if (savedSessionId) {
      setOpenSessionId(
        savedSessionId
      );
    } else {
      setOpenSessionId(null);
    }
  }, [
    selectedBatchId,
  ]);

  // =========================================================
  // LOAD ATTENDANCE WHEN BATCH CHANGES
  // =========================================================

  useEffect(() => {
    if (!selectedBatchId) {
      setRecords([]);
      return;
    }

    void loadAttendance(
      selectedBatchId
    );
  }, [
    selectedBatchId,
    loadAttendance,
  ]);

  // =========================================================
  // STOP SCANNER
  // =========================================================

  const stopScanner = useCallback(
    async () => {
      const scanner =
        scannerRef.current;

      if (!scanner) {
        setIsScanning(false);
        return;
      }

      try {
        await scanner.stop();
      } catch {
        // Scanner may already be stopped.
      }

      try {
        scanner.clear();
      } catch {
        // Ignore clear errors.
      }

      scannerRef.current = null;

      setIsScanning(false);
    },
    []
  );

  // =========================================================
  // CLEANUP SCANNER
  // =========================================================

  useEffect(() => {
    return () => {
      const scanner =
        scannerRef.current;

      if (scanner) {
        void scanner
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  // =========================================================
  // RECORD SCANNED TOKEN
  // =========================================================

  const recordScannedToken =
    useCallback(
      async (token: string) => {
        if (
          processingScanRef.current
        ) {
          return;
        }

        if (!openSessionId) {
          setScanError(
            "Open the attendance session before scanning."
          );
          return;
        }

        const cleanToken =
          token.trim();

        if (!cleanToken) {
          setScanError(
            "The QR code does not contain a valid attendance token."
          );
          return;
        }

        processingScanRef.current =
          true;

        try {
          setScanError(null);
          setError(null);
          setSuccessMessage(null);
          setScanResult(null);

          await attendanceApi.scan({
            attendanceSessionId:
              openSessionId,

            token:
              cleanToken,
          });

          setScannedToken(
            cleanToken
          );

          setScanResult(
            "Participant attendance recorded."
          );

          setSuccessMessage(
            "Attendance recorded successfully. Scan the same QR again at Time Out."
          );

          if (selectedBatchId) {
            await loadAttendance(
              selectedBatchId
            );
          }
        } catch (err) {
          console.error(
            "QR ATTENDANCE SCAN ERROR:",
            err
          );

          setScanError(
            err instanceof Error
              ? err.message
              : "Unable to record attendance."
          );
        } finally {
          processingScanRef.current =
            false;
        }
      },
      [
        openSessionId,
        selectedBatchId,
        loadAttendance,
      ]
    );
const startScanner = useCallback(async () => {
  if (!openSessionId) {
    setScanError("Open the attendance session first.");
    return;
  }

  if (isScanning) {
    return;
  }

  try {
    setScanError(null);
    setError(null);
    setScanResult(null);

    const { Html5Qrcode } = await import("html5-qrcode");

    const readerElement = document.getElementById(
      "attendance-qr-reader"
    );

    if (!readerElement) {
      throw new Error(
        "QR scanner container was not found."
      );
    }

    // Prevent an old scanner instance from holding the camera.
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore if already stopped.
      }

      try {
        scannerRef.current.clear();
      } catch {
        // Ignore clear errors.
      }

      scannerRef.current = null;
    }

    // Ask browser for camera permission first.
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "environment",
        },
      },
      audio: false,
    });

    // We only needed this to verify that the camera can actually open.
    stream.getTracks().forEach(track => track.stop());

    const scanner = new Html5Qrcode(
      "attendance-qr-reader"
    );

    scannerRef.current = scanner;

    await scanner.start(
      {
        facingMode: "environment",
      },
      {
        fps: 10,
        qrbox: {
          width: 280,
          height: 280,
        },
        aspectRatio: 1,
      },
      async decodedText => {
        console.log(
          "QR DECODED:",
          decodedText
        );

        if (processingScanRef.current) {
          return;
        }

        await stopScanner();

        await recordScannedToken(
          decodedText
        );
      },
      () => {
        // QR not detected yet.
      }
    );

    setIsScanning(true);

    console.log(
      "QR SCANNER STARTED SUCCESSFULLY"
    );
  } catch (err) {
    console.error(
      "QR SCANNER START ERROR:",
      err
    );

    setIsScanning(false);

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore cleanup errors.
      }

      try {
        scannerRef.current.clear();
      } catch {
        // Ignore cleanup errors.
      }

      scannerRef.current = null;
    }

    if (
      err instanceof DOMException &&
      err.name === "NotAllowedError"
    ) {
      setScanError(
        "Camera permission was denied. Please allow camera access in Chrome settings."
      );
    } else if (
      err instanceof DOMException &&
      err.name === "NotReadableError"
    ) {
      setScanError(
        "The camera could not be started. Another app or browser tab may already be using the camera. Close other camera apps/tabs and try again."
      );
    } else {
      setScanError(
        err instanceof Error
          ? err.message
          : "Unable to start the QR scanner."
      );
    }
  }
}, [
  openSessionId,
  isScanning,
  stopScanner,
  recordScannedToken,
]);

  // =========================================================
  // MANUAL TOKEN SUBMIT
  // =========================================================

  const handleManualToken =
    useCallback(async () => {
      await recordScannedToken(
        scannedToken
      );
    }, [
      scannedToken,
      recordScannedToken,
    ]);

  // =========================================================
  // OPEN ATTENDANCE
  // =========================================================

  const handleOpenAttendance =
    useCallback(async () => {
      if (!selectedBatchId) {
        return;
      }

      try {
        setIsOpening(true);
        setError(null);
        setScanError(null);
        setSuccessMessage(null);

        const result =
          await attendanceApi.openSession({
            trainingBatchId:
              selectedBatchId,
          });

        const sessionId =
          result.attendanceSessionId;

        if (!sessionId) {
          throw new Error(
            "The server did not return an attendance session ID."
          );
        }

        setOpenSessionId(
          sessionId
        );

        window.localStorage.setItem(
          `attendance-session-${selectedBatchId}`,
          sessionId
        );

        await loadAttendance(
          selectedBatchId
        );

        setSuccessMessage(
          "Attendance session is now open."
        );
      } catch (err) {
        console.error(
          "OPEN ATTENDANCE ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to open attendance session."
        );
      } finally {
        setIsOpening(false);
      }
    }, [
      selectedBatchId,
      loadAttendance,
    ]);

  // =========================================================
  // CLOSE ATTENDANCE
  // =========================================================

  const handleCloseAttendance =
    useCallback(async () => {
      if (!openSessionId) {
        return;
      }

      try {
        setIsClosing(true);
        setError(null);
        setScanError(null);
        setSuccessMessage(null);

        await stopScanner();

        await attendanceApi.closeSession(
          openSessionId
        );

        setOpenSessionId(
          null
        );

        if (selectedBatchId) {
          window.localStorage.removeItem(
            `attendance-session-${selectedBatchId}`
          );

          await loadAttendance(
            selectedBatchId
          );
        }

        setScannedToken("");
        setScanResult(null);

        setSuccessMessage(
          "Attendance session has been closed."
        );
      } catch (err) {
        console.error(
          "CLOSE ATTENDANCE ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to close attendance session."
        );
      } finally {
        setIsClosing(false);
      }
    }, [
      openSessionId,
      selectedBatchId,
      stopScanner,
      loadAttendance,
    ]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh =
    useCallback(async () => {
      setError(null);
      setScanError(null);
      setSuccessMessage(null);

      if (selectedBatchId) {
        await loadAttendance(
          selectedBatchId
        );
      } else {
        await loadBatches();
      }
    }, [
      selectedBatchId,
      loadAttendance,
      loadBatches,
    ]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return records;
      }

      return records.filter(
        record =>
          record.participantName
            ?.toLowerCase()
            .includes(query) ||
          record.status
            ?.toLowerCase()
            .includes(query) ||
          record.method
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      records,
      search,
    ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const presentCount =
    records.filter(
      record =>
        record.status
          ?.toLowerCase() ===
        "present"
    ).length;

  const lateCount =
    records.filter(
      record =>
        record.status
          ?.toLowerCase() ===
        "late"
    ).length;

  const incompleteCount =
    records.filter(
      record => {
        const status =
          record.status
            ?.toLowerCase();

        return (
          status ===
            "timeinonly" ||
          status ===
            "timeoutonly"
        );
      }
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoadingBatches) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-full space-y-6 pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
            <span>
              Trainer
            </span>

            <span>/</span>

            <span className="font-medium text-gray-700">
              Attendance
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#17191c]">
            Attendance
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Manage your training sessions,
            monitor participant attendance,
            and record attendance using
            permanent participant QR codes.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            void handleRefresh()
          }
          disabled={
            isLoadingAttendance ||
            isLoadingBatches
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshIcon />

          Refresh
        </button>

      </header>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <Alert
          type="error"
          title="Attendance error"
          message={error}
          onClose={() =>
            setError(null)
          }
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title="Success"
          message={successMessage}
          onClose={() =>
            setSuccessMessage(null)
          }
        />
      )}

      {/* =====================================================
          BATCH + SESSION
      ===================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.3fr]">

        {/* ===================================================
            BATCH
        =================================================== */}

        <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <BatchIcon />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                Training batch
              </p>

              <h2 className="mt-1 text-sm font-bold text-gray-900">
                Select Batch
              </h2>

            </div>

          </div>

          <div className="mt-5">

            <select
              value={selectedBatchId}
              onChange={event => {

                void stopScanner();

                setSelectedBatchId(
                  event.target.value
                );

                setOpenSessionId(
                  null
                );

                setSearch("");

                setScannedToken("");

                setScanResult(null);

                setScanError(null);

                setError(null);

                setSuccessMessage(
                  null
                );
              }}
              className="h-12 w-full rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] px-4 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
            >

              <option value="">
                Select training batch
              </option>

              {batches.map(
                batch => (
                  <option
                    key={batch.id}
                    value={batch.id}
                  >
                    {batch.batchCode}
                    {" — "}
                    {batch.programName}
                  </option>
                )
              )}

            </select>

          </div>

          {selectedBatch && (

            <div className="mt-4 rounded-xl bg-[#f8f9fa] p-4">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-lg font-bold text-gray-900">
                    {selectedBatch.batchCode}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedBatch.programName}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-bold text-gray-900">
                    {selectedBatch.enrolledCount}
                  </p>

                  <p className="text-[9px] font-medium uppercase tracking-wider text-gray-400">
                    Enrolled
                  </p>

                </div>

              </div>

              <div className="mt-4 flex flex-wrap gap-2">

                <InfoPill>
                  {selectedBatch.status}
                </InfoPill>

                {selectedBatch.location && (
                  <InfoPill>
                    {selectedBatch.location}
                  </InfoPill>
                )}

              </div>

            </div>

          )}

        </section>

        {/* ===================================================
            SESSION
        =================================================== */}

        {selectedBatch ? (

          <section
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ${
              openSessionId
                ? "border-emerald-200 bg-emerald-50/40"
                : "border-[#e7e9ec] bg-white"
            }`}
          >

            <div className="relative flex h-full flex-col justify-between gap-6">

              <div className="flex items-start justify-between gap-5">

                <div className="flex items-start gap-4">

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      openSessionId
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-900 text-white"
                    }`}
                  >
                    {openSessionId ? (
                      <UnlockIcon />
                    ) : (
                      <LockIcon />
                    )}
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-sm font-bold text-gray-900">
                        Attendance Session
                      </h2>

                      <StatusPill
                        open={
                          Boolean(
                            openSessionId
                          )
                        }
                      />

                    </div>

                    <p className="mt-1 text-xs text-gray-500">

                      {selectedBatch.batchCode}

                      {" · "}

                      {selectedBatch.programName}

                    </p>

                  </div>

                </div>

                <div className="hidden sm:block">

                  <p className="text-right text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Session
                  </p>

                  <p className="mt-1 font-mono text-[9px] text-gray-400">
                    {openSessionId
                      ? openSessionId.slice(
                          0,
                          8
                        )
                      : "—"}
                  </p>

                </div>

              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="max-w-lg text-xs leading-5 text-gray-500">

                  {openSessionId
                    ? "Attendance is active. Scan participant QR codes for Time In and Time Out."
                    : "Attendance is currently closed. Open a session before recording participant attendance."}

                </p>

                {!openSessionId ? (

                  <button
                    type="button"
                    onClick={() =>
                      void handleOpenAttendance()
                    }
                    disabled={isOpening}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <PlayIcon />

                    {isOpening
                      ? "Opening..."
                      : "Open Attendance"}

                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      void handleCloseAttendance()
                    }
                    disabled={isClosing}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <StopIcon />

                    {isClosing
                      ? "Closing..."
                      : "Close Attendance"}

                  </button>

                )}

              </div>

            </div>

          </section>

        ) : (

          <section className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-6">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <BatchIcon />
              </div>

              <p className="mt-3 text-sm font-bold text-gray-700">
                Select a training batch
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Choose a batch to manage attendance.
              </p>

            </div>

          </section>

        )}

      </div>

      {/* =====================================================
          QR SCANNER
      ===================================================== */}

      {selectedBatch && (

        <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">

          <div className="border-b border-[#eef0f2] p-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                  <QrIcon />
                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                    QR attendance
                  </p>

                  <h2 className="mt-1 text-base font-bold text-gray-900">
                    Scan Participant QR
                  </h2>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
                    Use the camera to scan the participant's permanent attendance QR.
                  </p>

                </div>

              </div>

              <StatusPill
                open={
                  Boolean(
                    openSessionId
                  )
                }
              />

            </div>

          </div>

          <div className="p-5">

            {/* =================================================
                CAMERA AREA
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,430px)_1fr]">

              <div>

                {/* =================================================
                    IMPORTANT:
                    attendance-qr-reader ALWAYS EXISTS IN DOM
                ================================================= */}

                <div
                  className={`relative overflow-hidden rounded-2xl border ${
                    isScanning
                      ? "border-emerald-300 bg-black"
                      : "border-gray-200 bg-[#f8f9fa]"
                  }`}
                >

                  {/* =================================================
                      REAL HTML5 QR SCANNER CONTAINER

                      DO NOT PUT THIS INSIDE {!isScanning}.
                  ================================================= */}

                  <div
                    id="attendance-qr-reader"
                    className="min-h-[360px] w-full"
                  />

                  {/* =================================================
                      PLACEHOLDER
                  ================================================= */}

                  {!isScanning && (

                    <div className="absolute inset-0 flex min-h-[360px] flex-col items-center justify-center bg-[#f8f9fa] px-6 text-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm">
                        <CameraIcon />
                      </div>

                      <h3 className="mt-5 text-sm font-bold text-gray-800">
                        Camera Scanner
                      </h3>

                      <p className="mt-2 max-w-xs text-xs leading-5 text-gray-400">
                        Start the camera and point it at the participant's permanent QR code.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          void startScanner()
                        }
                        disabled={
                          !openSessionId
                        }
                        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-xs font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        <CameraIcon />

                        Start Scanner

                      </button>

                    </div>

                  )}

                  {/* =================================================
                      SCANNING OVERLAY
                  ================================================= */}

                  {isScanning && (

                    <>

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                        <div className="h-[280px] w-[280px] rounded-3xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.28)]" />

                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">

                        <button
                          type="button"
                          onClick={() =>
                            void stopScanner()
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-gray-800 shadow-lg"
                        >

                          <StopIcon />

                          Stop Camera

                        </button>

                      </div>

                    </>

                  )}

                </div>

                <p className="mt-3 text-center text-[10px] text-gray-400">

                  {isScanning
                    ? "Point the participant QR inside the scanning frame."
                    : "Camera permission is required to scan QR codes."}

                </p>

              </div>

              {/* =================================================
                  SCAN INFORMATION
              ================================================= */}

              <div className="flex flex-col justify-between">

                <div>

                  <div className="rounded-2xl border border-gray-200 bg-[#fafbfc] p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <ScanIcon />
                      </div>

                      <div>

                        <h3 className="text-sm font-bold text-gray-800">
                          Automatic Time In / Time Out
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-gray-500">
                          The same permanent participant QR is used for both actions.
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 space-y-3">

                      <StepItem
                        number="1"
                        title="First scan"
                        description="Creates the participant's Time In record."
                      />

                      <StepItem
                        number="2"
                        title="Second scan"
                        description="Records Time Out for the same session."
                      />

                      <StepItem
                        number="3"
                        title="Complete"
                        description="A third scan is rejected once attendance is complete."
                      />

                    </div>

                  </div>

                  {scanResult && (

                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                      <div className="flex items-start gap-3">

                        <div className="mt-0.5 text-emerald-600">
                          <CheckIcon />
                        </div>

                        <div>

                          <p className="text-xs font-bold text-emerald-700">
                            Scan successful
                          </p>

                          <p className="mt-1 text-[10px] leading-5 text-emerald-600">
                            {scanResult}
                          </p>

                        </div>

                      </div>

                    </div>

                  )}

                </div>

                {/* =================================================
                    MANUAL TOKEN FALLBACK
                ================================================= */}

                <div className="mt-5">

                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    QR Token fallback
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row">

                    <input
                      value={scannedToken}
                      onChange={event =>
                        setScannedToken(
                          event.target.value
                        )
                      }
                      disabled={
                        !openSessionId
                      }
                      placeholder="Paste decoded QR token..."
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] px-4 text-xs outline-none transition focus:border-gray-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        void handleManualToken()
                      }
                      disabled={
                        !openSessionId ||
                        !scannedToken.trim()
                      }
                      className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Submit
                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* =====================================================
                SCAN ERROR
            ===================================================== */}

            {scanError && (

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                <div className="mt-0.5 text-red-600">
                  <ErrorIcon />
                </div>

                <div>

                  <p className="text-xs font-bold text-red-700">
                    Scan failed
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-red-600">
                    {scanError}
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>

      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      {selectedBatch && (

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <SummaryCard
            label="Total Records"
            value={records.length}
            icon={<UsersIcon />}
          />

          <SummaryCard
            label="Present"
            value={presentCount}
            variant="success"
            icon={<CheckIcon />}
          />

          <SummaryCard
            label="Late"
            value={lateCount}
            variant="warning"
            icon={<ClockIcon />}
          />

          <SummaryCard
            label="Incomplete"
            value={incompleteCount}
            variant="info"
            icon={<IncompleteIcon />}
          />

        </div>

      )}

      {/* =====================================================
          RECORDS
      ===================================================== */}

      {selectedBatch && (

        <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">

          <div className="border-b border-[#eef0f2] p-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-base font-bold text-gray-900">
                    Attendance Records
                  </h2>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-bold text-gray-500">
                    {records.length}
                  </span>

                </div>

                <p className="mt-1 text-xs text-gray-500">

                  Live records for{" "}

                  <span className="font-semibold text-gray-700">
                    {selectedBatch.batchCode}
                  </span>

                  .

                </p>

              </div>

              <div className="relative w-full md:w-72">

                <SearchIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 !h-4 !w-4 text-gray-400"
                />

                <input
                  value={search}
                  onChange={event =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search participant..."
                  className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] pl-9 pr-3 text-xs outline-none transition focus:bg-white"
                />

              </div>

            </div>

          </div>

          {isLoadingAttendance ? (

            <div className="flex min-h-[280px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

                <p className="mt-3 text-xs text-gray-400">
                  Loading attendance records...
                </p>

              </div>

            </div>

          ) : filteredRecords.length === 0 ? (

            <EmptyState
              search={
                Boolean(
                  search.trim()
                )
              }
            />

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[780px]">

                <thead>

                  <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                    <TableHeader>
                      Participant
                    </TableHeader>

                    <TableHeader>
                      Status
                    </TableHeader>

                    <TableHeader>
                      Time In
                    </TableHeader>

                    <TableHeader>
                      Time Out
                    </TableHeader>

                    <TableHeader>
                      Method
                    </TableHeader>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[#eef0f2]">

                  {filteredRecords.map(
                    record => (

                      <tr
                        key={record.id}
                        className="transition hover:bg-[#fafbfc]"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">

                              {record.profileImageUrl ? (
                                <img
                                  src={record.profileImageUrl}
                                  alt={record.participantName}
                                  className="h-full w-full object-cover"
                                  onError={event => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-600">
                                  {getInitials(
                                    record.participantName
                                  )}
                                </div>
                              )}

                            </div>

                            <div>

                              <p className="text-xs font-bold text-gray-800">
                                {record.participantName}
                              </p>

                              <p className="mt-0.5 font-mono text-[8px] text-gray-400">
                                {record.id.slice(
                                  0,
                                  8
                                )}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <AttendanceStatusBadge
                            status={
                              record.status
                            }
                          />

                        </td>

                        <td className="px-5 py-4">

                          <TimeValue
                            value={
                              record.timeIn
                            }
                          />

                        </td>

                        <td className="px-5 py-4">

                          <TimeValue
                            value={
                              record.timeOut
                            }
                          />

                        </td>

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[9px] font-bold text-gray-600">

                            {record.method ===
                            "QR" ? (

                              <QrIcon
                                className="!h-3 !w-3"
                              />

                            ) : (

                              <ManualIcon />

                            )}

                            {record.method ||
                              "Unknown"}

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      )}

      {/* =====================================================
          NO BATCHES
      ===================================================== */}

      {batches.length === 0 && (

        <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <BatchIcon />
          </div>

          <h2 className="mt-4 text-sm font-bold text-gray-800">
            No Training Batches
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-400">
            There are currently no training batches available for attendance management.
          </p>

          <button
            type="button"
            onClick={() =>
              void loadBatches()
            }
            className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-[11px] font-bold text-white transition hover:bg-black"
          >
            Reload Batches
          </button>

        </section>

      )}

    </div>
  );
}

// =============================================================
// STEP ITEM
// =============================================================

function StepItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
        {number}
      </div>

      <div>

        <p className="text-xs font-bold text-gray-700">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] leading-5 text-gray-400">
          {description}
        </p>

      </div>

    </div>
  );
}

// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "info";
}) {
  const iconClass =
    variant === "success"
      ? "bg-emerald-50 text-emerald-600"
      : variant === "warning"
        ? "bg-amber-50 text-amber-600"
        : variant === "info"
          ? "bg-blue-50 text-blue-600"
          : "bg-gray-100 text-gray-600";

  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

// =============================================================
// STATUS PILL
// =============================================================

function StatusPill({
  open,
}: {
  open: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold ${
        open
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >

      <span
        className={`h-1.5 w-1.5 rounded-full ${
          open
            ? "bg-emerald-500"
            : "bg-gray-400"
        }`}
      />

      {open
        ? "OPEN"
        : "CLOSED"}

    </span>
  );
}

// =============================================================
// ATTENDANCE STATUS
// =============================================================

function AttendanceStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status
      ?.toLowerCase()
      .replace(
        /[\s_-]/g,
        ""
      );

  let className =
    "border-gray-200 bg-gray-50 text-gray-600";

  if (
    normalized ===
    "present"
  ) {
    className =
      "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized ===
    "late"
  ) {
    className =
      "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized ===
    "absent"
  ) {
    className =
      "border-red-200 bg-red-50 text-red-700";
  }

  if (
    normalized ===
    "timeinonly"
  ) {
    className =
      "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (
    normalized ===
    "timeoutonly"
  ) {
    className =
      "border-purple-200 bg-purple-50 text-purple-700";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1.5 text-[9px] font-bold ${className}`}
    >
      {status || "Unknown"}
    </span>
  );
}

// =============================================================
// TIME
// =============================================================

function TimeValue({
  value,
}: {
  value: string | null;
}) {
  if (!value) {
    return (
      <span className="text-xs text-gray-300">
        —
      </span>
    );
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return (
      <span className="text-xs text-gray-500">
        {value}
      </span>
    );
  }

  return (
    <div>

      <p className="text-xs font-semibold text-gray-700">
        {date.toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )}
      </p>

      <p className="mt-0.5 text-[9px] text-gray-400">
        {date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        )}
      </p>

    </div>
  );
}

// =============================================================
// EMPTY STATE
// =============================================================

function EmptyState({
  search,
}: {
  search: boolean;
}) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

        {search ? (
          <SearchIcon
            className="!h-5 !w-5"
          />
        ) : (
          <UsersIcon
            className="!h-5 !w-5"
          />
        )}

      </div>

      <p className="mt-4 text-sm font-bold text-gray-700">
        {search
          ? "No matching participants"
          : "No attendance records"}
      </p>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-400">
        {search
          ? "Try another participant name, status, or attendance method."
          : "Attendance records will appear here after a participant is recorded."}
      </p>

    </div>
  );
}

// =============================================================
// ALERT
// =============================================================

function Alert({
  type,
  title,
  message,
  onClose,
}: {
  type:
    | "error"
    | "success";
  title: string;
  message: string;
  onClose: () => void;
}) {
  const success =
    type === "success";

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
        success
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >

      <div className="flex items-start gap-3">

        <div
          className={
            success
              ? "text-emerald-600"
              : "text-red-600"
          }
        >
          {success ? (
            <CheckIcon />
          ) : (
            <ErrorIcon />
          )}
        </div>

        <div>

          <p
            className={`text-xs font-bold ${
              success
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-[10px] leading-5 ${
              success
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>

        </div>

      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-lg leading-none text-gray-400 hover:text-gray-700"
        aria-label="Close"
      >
        ×
      </button>

    </div>
  );
}

// =============================================================
// INFO PILL
// =============================================================

function InfoPill({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[9px] font-bold text-gray-500">
      {children}
    </span>
  );
}

// =============================================================
// TABLE HEADER
// =============================================================

function TableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-gray-400">
      {children}
    </th>
  );
}

// =============================================================
// INITIALS
// =============================================================

function getInitials(
  name: string
) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      part =>
        part[0]?.toUpperCase() ??
        ""
    )
    .join("");
}

// =============================================================
// ICON PROPS
// =============================================================

type IconProps = {
  className?: string;
};

// =============================================================
// REFRESH
// =============================================================

function RefreshIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />

      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

// =============================================================
// BATCH
// =============================================================

function BatchIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-5 !w-5 !shrink-0 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M8 4v16M16 4v16M3 9h18M3 15h18" />
    </svg>
  );
}

// =============================================================
// UNLOCK
// =============================================================

function UnlockIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-5 !w-5 !shrink-0 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 7.8-1" />
    </svg>
  );
}

// =============================================================
// LOCK
// =============================================================

function LockIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-5 !w-5 !shrink-0 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// =============================================================
// PLAY
// =============================================================

function PlayIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// =============================================================
// STOP
// =============================================================

function StopIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
      />
    </svg>
  );
}

// =============================================================
// QR
// =============================================================

function QrIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
      />

      <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
    </svg>
  );
}

// =============================================================
// CAMERA
// =============================================================

function CameraIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-5 !w-5 !shrink-0 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h4l2-2h4l2 2h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />

      <circle
        cx="12"
        cy="13"
        r="4"
      />
    </svg>
  );
}

// =============================================================
// SCAN
// =============================================================

function ScanIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />

      <path d="M7 12h10M7 15h10M7 9h10" />
    </svg>
  );
}

// =============================================================
// SEARCH
// =============================================================

function SearchIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="11"
        cy="11"
        r="6"
      />

      <path d="m16 16 4 4" />
    </svg>
  );
}

// =============================================================
// USERS
// =============================================================

function UsersIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-5 !w-5 !shrink-0 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />

      <circle
        cx="9.5"
        cy="7"
        r="3.5"
      />

      <path d="M16 11a3 3 0 1 0 0-6M17 14.5a4 4 0 0 1 4 4V20" />
    </svg>
  );
}

// =============================================================
// CHECK
// =============================================================

function CheckIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

// =============================================================
// CLOCK
// =============================================================

function ClockIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4l3 2" />
    </svg>
  );
}

// =============================================================
// INCOMPLETE
// =============================================================

function IncompleteIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

// =============================================================
// MANUAL
// =============================================================

function ManualIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-3.5 !w-3.5 !shrink-0 ${className}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 17.5V20h2.5L18 8.5 15.5 6z" />

      <path d="m14 7.5 2.5 2.5M19 4l1 1" />
    </svg>
  );
}

// =============================================================
// ERROR
// =============================================================

function ErrorIcon({
  className = "",
}: IconProps) {
  return (
    <svg
      className={`!h-4 !w-4 !shrink-0 ${className}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}