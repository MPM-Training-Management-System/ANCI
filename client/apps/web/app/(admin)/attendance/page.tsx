
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  AttendanceRecordDto,
  TrainingBatch,
  TrainingSession,
} from "@repo/types";

import {
  attendanceApi,
  trainingBatchApi,
} from "@/lib/api";

import type { Html5Qrcode } from "html5-qrcode";

import {
  Button,
  DataTable,
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import { columns } from "./columns";

import {
  BookA,
  CheckCircle,
  Clock1,
  User2,
} from "lucide-react";

type AttendanceRecordWithProfile = AttendanceRecordDto & {
  profileImageUrl?: string | null;
};

export default function TrainerAttendancePage() {
  const [batches, setBatches] = useState<TrainingBatch[]>([]);
  const selectedBatch = useMemo(() => batches[0] ?? null, [batches]);
  const assignedBatchId = selectedBatch?.id ?? "";

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [selectedTrainingSessionId, setSelectedTrainingSessionId] = useState("");

  const [records, setRecords] = useState<AttendanceRecordWithProfile[]>([]);
  const [openSessionId, setOpenSessionId] = useState<string | null>(null);
  const [manualAttendanceOpen, setManualAttendanceOpen] = useState(false);

  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpeningManual, setIsOpeningManual] = useState(false);
  const [isClosingManual, setIsClosingManual] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const [scannedToken, setScannedToken] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingScanRef = useRef(false);

  // LOAD ASSIGNED BATCHES

  const loadBatches = useCallback(async () => {
    try {
      setIsLoadingBatches(true);
      setError(null);

      const result = await trainingBatchApi.getAssigned();
      setBatches(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Unable to load assigned training batch:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load training batch.",
      );
      setBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  // LOAD TRAINING SESSIONS

  const loadTrainingSessions = useCallback(async (batchId: string) => {
    if (!batchId) {
      setTrainingSessions([]);
      setSelectedTrainingSessionId("");
      return;
    }

    try {
      const result = await trainingBatchApi.getSchedule(batchId);
      const sessions = Array.isArray(result) ? result : [];

      setTrainingSessions(sessions);
      setSelectedTrainingSessionId((current) =>
        sessions.some((session) => session.id === current)
          ? current
          : sessions[0]?.id ?? "",
      );
    } catch (err) {
      console.error("Unable to load training sessions:", err);
      setTrainingSessions([]);
      setSelectedTrainingSessionId("");
    }
  }, []);

  // LOAD ATTENDANCE RECORDS

  const loadAttendance = useCallback(async (batchId: string) => {
    if (!batchId) {
      setRecords([]);
      return;
    }

    try {
      setIsLoadingAttendance(true);
      setError(null);

      const result = await attendanceApi.getBatch(batchId);
      setRecords(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Unable to load attendance:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance records.",
      );
      setRecords([]);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, []);

  // CHECK ACTIVE SESSION

  const loadOpenSession = useCallback(
    async (batchId: string, trainingSessionId: string) => {
      if (!batchId || !trainingSessionId) {
        setOpenSessionId(null);
        setManualAttendanceOpen(false);
        return null;
      }

      try {
        setIsCheckingSession(true);

        const result = await attendanceApi.getOpenSession(
          batchId,
          trainingSessionId,
        );

        if (!result?.isOpen || !result.attendanceSessionId) {
          setOpenSessionId(null);
          setManualAttendanceOpen(false);
          return null;
        }

        setOpenSessionId(result.attendanceSessionId);
        setManualAttendanceOpen(Boolean(result.manualAttendanceOpen));

        return result.attendanceSessionId;
      } catch (err) {
        console.error("Unable to check attendance session:", err);
        setOpenSessionId(null);
        setManualAttendanceOpen(false);
        return null;
      } finally {
        setIsCheckingSession(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    if (!assignedBatchId) {
      setRecords([]);
      setOpenSessionId(null);
      setManualAttendanceOpen(false);
      setSelectedDate("");
      setSearch("");
      setTrainingSessions([]);
      setSelectedTrainingSessionId("");
      return;
    }

    setOpenSessionId(null);
    setManualAttendanceOpen(false);

    void loadTrainingSessions(assignedBatchId);
    void loadAttendance(assignedBatchId);
  }, [assignedBatchId, loadTrainingSessions, loadAttendance]);

  useEffect(() => {
    if (!assignedBatchId || !selectedTrainingSessionId) {
      setOpenSessionId(null);
      setManualAttendanceOpen(false);
      return;
    }

    void loadOpenSession(assignedBatchId, selectedTrainingSessionId);
  }, [assignedBatchId, selectedTrainingSessionId, loadOpenSession]);

  // STOP QR SCANNER

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setIsScanning(false);
      return;
    }

    scannerRef.current = null;

    try {
      await scanner.stop();
    } catch {
      // Scanner may already be stopped.
    }

    try {
      scanner.clear();
    } catch {
      // Ignore cleanup errors.
    }

    setIsScanning(false);
  }, []);

  const closeCameraModal = useCallback(async () => {
    await stopScanner();
    setIsCameraModalOpen(false);
  }, [stopScanner]);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        void scanner.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  // RECORD SCANNED TOKEN

  const recordScannedToken = useCallback(
    async (token: string) => {
      if (processingScanRef.current) return;

      if (!openSessionId) {
        setScanError("Open the attendance session before scanning.");
        return;
      }

      const cleanToken = token.trim();

      if (!cleanToken) {
        setScanError("The QR code does not contain a valid attendance token.");
        return;
      }

      processingScanRef.current = true;

      try {
        setScanError(null);
        setError(null);
        setSuccessMessage(null);
        setScanResult(null);

        await attendanceApi.scan({
          attendanceSessionId: openSessionId,
          token: cleanToken,
        });

        setScannedToken(cleanToken);
        setScanResult("Participant attendance recorded.");
        setSuccessMessage(
          "Attendance recorded successfully. Scan the same QR again at Time Out.",
        );

        if (assignedBatchId) {
          await loadAttendance(assignedBatchId);
        }
      } catch (err) {
        console.error("QR ATTENDANCE SCAN ERROR:", err);
        setScanError(
          err instanceof Error ? err.message : "Unable to record attendance.",
        );
      } finally {
        processingScanRef.current = false;
      }
    },
    [openSessionId, assignedBatchId, loadAttendance],
  );

  // START CAMERA SCANNER

  const startScanner = useCallback(async () => {
    if (!openSessionId) {
      setScanError("Open the attendance session first.");
      return;
    }

    if (scannerRef.current) return;

    try {
      setScanError(null);
      setError(null);
      setScanResult(null);

      const { Html5Qrcode } = await import("html5-qrcode");
      const readerElement = document.getElementById("attendance-qr-reader");

      if (!readerElement) {
        throw new Error("QR scanner container was not found.");
      }

      readerElement.innerHTML = "";

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        throw new Error("No camera was found on this device.");
      }

      const realCameras = cameras.filter((camera) => {
        const label = camera.label.toLowerCase();

        return !(
          label.includes("obs virtual camera") ||
          label.includes("virtual camera") ||
          label.includes("obs camera")
        );
      });

      if (!realCameras.length) {
        throw new Error(
          "No physical camera was found. Please connect or enable your laptop/USB camera.",
        );
      }

      const environmentCamera = realCameras.find((camera) =>
        /back|rear|environment/i.test(camera.label),
      );

      const orderedCameras = [
        ...(environmentCamera ? [environmentCamera] : []),
        ...realCameras.filter(
          (camera) => camera.id !== environmentCamera?.id,
        ),
      ];

      const scannerConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };

      let started = false;

      for (const camera of orderedCameras) {
        if (started) break;

        let scanner: Html5Qrcode | null = null;

        try {
          const container = document.getElementById("attendance-qr-reader");
          if (container) container.innerHTML = "";

          scanner = new Html5Qrcode("attendance-qr-reader");

          await scanner.start(
            camera.id,
            scannerConfig,
            async (decodedText) => {
              if (processingScanRef.current) return;

              await stopScanner();
              setIsCameraModalOpen(false);
              await recordScannedToken(decodedText);
            },
            () => {
              // QR code not detected yet.
            },
          );

          scannerRef.current = scanner;
          setIsScanning(true);
          started = true;
        } catch (cameraError) {
          console.error("Failed to start camera:", camera.label || camera.id, cameraError);

          try {
            if (scanner) {
              await scanner.stop().catch(() => {});
              scanner.clear();
            }
          } catch {
            // Ignore cleanup errors.
          }

          scannerRef.current = null;
          setIsScanning(false);

          const container = document.getElementById("attendance-qr-reader");
          if (container) container.innerHTML = "";
        }
      }

      if (!started) {
        throw new Error(
          "Could not start any available camera. Please close other apps or browser tabs using the camera, then try again.",
        );
      }
    } catch (err) {
      console.error("QR SCANNER START ERROR:", err);

      setIsScanning(false);
      scannerRef.current = null;

      const errorName = err instanceof DOMException ? err.name : "";
      const message = err instanceof Error ? err.message : String(err);

      if (errorName === "NotAllowedError" || /permission|denied/i.test(message)) {
        setScanError(
          "Camera permission was denied. Please allow camera access in Chrome settings and try again.",
        );
      } else if (
        errorName === "NotReadableError" ||
        /Could not start video source/i.test(message)
      ) {
        setScanError(
          "The camera is currently unavailable. Please close other apps or browser tabs using the camera, then try again.",
        );
      } else if (errorName === "OverconstrainedError") {
        setScanError("The selected camera is not available. Please try another camera.");
      } else if (errorName === "NotFoundError") {
        setScanError("No camera was found on this device.");
      } else {
        setScanError(message || "Unable to start the QR scanner.");
      }
    }
  }, [openSessionId, stopScanner, recordScannedToken]);

  const openCameraModal = useCallback(() => {
    if (!openSessionId) {
      setScanError("Open the attendance session first.");
      return;
    }

    setScanError(null);
    setScanResult(null);
    setIsCameraModalOpen(true);
  }, [openSessionId]);

  useEffect(() => {
    if (!isCameraModalOpen) return;

    const timer = window.setTimeout(() => {
      void startScanner();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [isCameraModalOpen, startScanner]);

  const handleManualToken = useCallback(async () => {
    await recordScannedToken(scannedToken);
  }, [scannedToken, recordScannedToken]);

  // OPEN ATTENDANCE SESSION

  const handleOpenAttendance = useCallback(async () => {
    if (!assignedBatchId) {
      setError("No training batch is assigned to this trainer.");
      return;
    }

    if (!selectedTrainingSessionId) {
      setError("Please select a training session first.");
      return;
    }

    try {
      setIsOpening(true);
      setError(null);
      setScanError(null);
      setSuccessMessage(null);

      await attendanceApi.openSession({
        trainingBatchId: assignedBatchId,
        trainingSessionId: selectedTrainingSessionId,
      });

      const sessionId = await loadOpenSession(
        assignedBatchId,
        selectedTrainingSessionId,
      );

      if (!sessionId) {
        throw new Error(
          "Session was started, but the active session could not be retrieved.",
        );
      }

      await loadAttendance(assignedBatchId);
      setSuccessMessage("Training session is now open.");
    } catch (err) {
      console.error("START SESSION ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Unable to start training session.",
      );
    } finally {
      setIsOpening(false);
    }
  }, [
    assignedBatchId,
    selectedTrainingSessionId,
    loadOpenSession,
    loadAttendance,
  ]);

  const handleRequestCloseAttendance = useCallback(() => {
    if (openSessionId) setIsCloseSessionModalOpen(true);
  }, [openSessionId]);

  // CLOSE ATTENDANCE SESSION

  const handleConfirmCloseAttendance = useCallback(async () => {
    if (!openSessionId) return;

    try {
      setIsClosing(true);
      setError(null);
      setScanError(null);
      setSuccessMessage(null);

      await closeCameraModal();
      await attendanceApi.closeSession(openSessionId);

      setOpenSessionId(null);
      setManualAttendanceOpen(false);
      setIsCloseSessionModalOpen(false);

      if (assignedBatchId) {
        await loadAttendance(assignedBatchId);
        await loadOpenSession(assignedBatchId, selectedTrainingSessionId);
      }

      setScannedToken("");
      setScanResult(null);
      setSuccessMessage(
        "Training session has ended. Manual attendance is also closed.",
      );
    } catch (err) {
      console.error("END SESSION ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Unable to end training session.",
      );
    } finally {
      setIsClosing(false);
    }
  }, [
    openSessionId,
    assignedBatchId,
    selectedTrainingSessionId,
    closeCameraModal,
    loadAttendance,
    loadOpenSession,
  ]);

  // OPEN MANUAL ATTENDANCE

  const handleOpenManualAttendance = useCallback(async () => {
    if (!openSessionId) {
      setError("Start the training session first.");
      return;
    }

    try {
      setIsOpeningManual(true);
      setError(null);
      setScanError(null);
      setSuccessMessage(null);

      await attendanceApi.openManualAttendance(openSessionId);

      if (assignedBatchId) {
        await loadOpenSession(assignedBatchId, selectedTrainingSessionId);
      }

      setSuccessMessage("Manual attendance is now open.");
    } catch (err) {
      console.error("OPEN MANUAL ATTENDANCE ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open manual attendance.",
      );
    } finally {
      setIsOpeningManual(false);
    }
  }, [
    openSessionId,
    assignedBatchId,
    selectedTrainingSessionId,
    loadOpenSession,
  ]);

  // CLOSE MANUAL ATTENDANCE

  const handleCloseManualAttendance = useCallback(async () => {
    if (!openSessionId) return;

    try {
      setIsClosingManual(true);
      setError(null);
      setScanError(null);
      setSuccessMessage(null);

      await attendanceApi.closeManualAttendance(openSessionId);

      if (assignedBatchId) {
        await loadOpenSession(assignedBatchId, selectedTrainingSessionId);
      }

      setSuccessMessage("Manual attendance is closed. QR scanning remains available.");
    } catch (err) {
      console.error("CLOSE MANUAL ATTENDANCE ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to close manual attendance.",
      );
    } finally {
      setIsClosingManual(false);
    }
  }, [
    openSessionId,
    assignedBatchId,
    selectedTrainingSessionId,
    loadOpenSession,
  ]);

  // REFRESH

  const handleRefresh = useCallback(async () => {
    setError(null);
    setScanError(null);
    setSuccessMessage(null);

    if (!assignedBatchId) {
      await loadBatches();
      return;
    }

    await Promise.all([
      loadAttendance(assignedBatchId),
      loadOpenSession(assignedBatchId, selectedTrainingSessionId),
    ]);
  }, [
    assignedBatchId,
    selectedTrainingSessionId,
    loadAttendance,
    loadOpenSession,
    loadBatches,
  ]);

  // FILTER RECORDS

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const participantName = record.participantName?.toLowerCase() ?? "";
      const status = record.status?.toLowerCase() ?? "";
      const method = record.method?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        participantName.includes(query) ||
        status.includes(query) ||
        method.includes(query);

      if (!matchesSearch) return false;
      if (!selectedDate) return true;

      const sourceDate = record.timeIn ?? record.timeOut;
      if (!sourceDate) return false;

      const date = new Date(sourceDate);
      if (Number.isNaN(date.getTime())) return false;

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}` === selectedDate;
    });
  }, [records, search, selectedDate]);

  // SUMMARY COUNTS

  const presentCount = filteredRecords.filter(
    (record) => record.status?.toLowerCase() === "present",
  ).length;

  const lateCount = filteredRecords.filter(
    (record) => record.status?.toLowerCase() === "late",
  ).length;

  const incompleteCount = filteredRecords.filter((record) => {
    const status = record.status?.toLowerCase().replace(/[\s_-]/g, "");
    return status === "timeinonly" || status === "timeoutonly";
  }).length;

  if (isLoadingBatches) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#002b5c]" />
          <p className="mt-3 text-sm text-gray-500">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 bg-[#f7f9fb] p-4 sm:p-6">
      <PageSection
        title="Attendance Management"
        description="Manage training attendance and participant records."
        actions={
          <Button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isLoadingAttendance || isCheckingSession}
          >
            <RefreshIcon />
            Refresh
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          title="Attendance error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          title="Success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* SIMPLIFIED ASSIGNED BATCH AND SESSION CONTROLS */}

      {selectedBatch && (
        <>
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3B7597]">
                  Assigned Batch
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#0d2142]">
                  {selectedBatch.batchCode}
                </h2>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {selectedBatch.programName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <InfoPill>
                  {selectedBatch.enrolledCount} Participants
                </InfoPill>
                <InfoPill>{selectedBatch.status}</InfoPill>
              </div>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label
                  htmlFor="attendance-session"
                  className="mb-2 block text-xs font-semibold text-gray-600"
                >
                  Training Session
                </label>

                <select
                  id="attendance-session"
                  value={selectedTrainingSessionId}
                  onChange={(event) =>
                    setSelectedTrainingSessionId(event.target.value)
                  }
                  disabled={Boolean(openSessionId) || isCheckingSession}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#3B7597] focus:ring-2 focus:ring-[#3B7597]/10 disabled:cursor-not-allowed disabled:bg-gray-100 sm:max-w-xl"
                >
                  <option value="">Select training session</option>
                  {trainingSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      Session {session.sessionNumber} —{" "}
                      {new Date(session.sessionDate).toLocaleDateString()} —{" "}
                      {session.startTime} - {session.endTime}
                    </option>
                  ))}
                </select>

                {trainingSessions.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    No training sessions available.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <StatusPill open={Boolean(openSessionId)} />

                {!openSessionId ? (
                  <button
                    type="button"
                    onClick={() => void handleOpenAttendance()}
                    disabled={
                      isOpening ||
                      isCheckingSession ||
                      !selectedTrainingSessionId
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PlayIcon />
                    {isOpening ? "Starting..." : "Start Session"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestCloseAttendance}
                    disabled={isClosing || isCheckingSession}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0d2142] px-5 text-xs font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <StopIcon />
                    End Session
                  </button>
                )}
              </div>
            </div>

            {/* COMPACT MANUAL ATTENDANCE */}

            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#3B7597] ring-1 ring-gray-200">
                  <ManualIcon />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#0d2142]">
                      Manual Attendance
                    </p>
                    <StatusPill open={manualAttendanceOpen} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {manualAttendanceOpen
                      ? "Participant Time In and Time Out are enabled."
                      : "Manual attendance is currently disabled."}
                  </p>
                </div>
              </div>

              {!openSessionId ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-400"
                >
                  <LockIcon />
                  Start Session First
                </button>
              ) : manualAttendanceOpen ? (
                <button
                  type="button"
                  onClick={() => void handleCloseManualAttendance()}
                  disabled={isClosingManual || isCheckingSession}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  <StopIcon />
                  {isClosingManual ? "Closing..." : "Close Manual Attendance"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleOpenManualAttendance()}
                  disabled={isOpeningManual || isCheckingSession}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <PlayIcon />
                  {isOpeningManual ? "Opening..." : "Open Manual Attendance"}
                </button>
              )}
            </div>
          </section>

          {/* SIMPLIFIED QR ATTENDANCE */}

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d2142] text-white">
                  <QrIcon />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0d2142]">
                    QR Attendance
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Scan a participant QR code to record attendance.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openCameraModal}
                disabled={!openSessionId || isCheckingSession}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0d2142] px-4 text-xs font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CameraIcon />
                Open Camera
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#3B7597] ring-1 ring-gray-200">
                    <ScanIcon />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {openSessionId ? "Ready to scan" : "Session is closed"}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      {openSessionId
                        ? "First scan records Time In; the second records Time Out."
                        : "Start the attendance session to enable QR scanning."}
                    </p>
                  </div>
                </div>
                <StatusPill open={Boolean(openSessionId)} />
              </div>

              {scanResult && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <CheckIcon className="mt-0.5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      Scan successful
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                      {scanResult}
                    </p>
                  </div>
                </div>
              )}

              <details className="rounded-xl border border-gray-200">
                <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-gray-600">
                  Use QR token manually
                </summary>
                <div className="flex flex-col gap-2 border-t border-gray-100 p-3 sm:flex-row">
                  <input
                    value={scannedToken}
                    onChange={(event) => setScannedToken(event.target.value)}
                    disabled={!openSessionId}
                    placeholder="Paste decoded QR token..."
                    className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none transition focus:border-[#3B7597] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => void handleManualToken()}
                    disabled={!openSessionId || !scannedToken.trim()}
                    className="h-10 rounded-lg bg-[#0d2142] px-4 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Submit Token
                  </button>
                </div>
              </details>

              {scanError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <ErrorIcon className="mt-0.5 text-red-600" />
                  <div>
                    <p className="text-xs font-semibold text-red-700">
                      Scan failed
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-600">
                      {scanError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* STATGRID - PRESERVED */}

      {selectedBatch && (
        <section>
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#3B7597]">
              Attendance Overview
            </p>
            <h2 className="mt-1 text-base font-bold text-[#0d2142]">
              Attendance Summary
            </h2>
          </div>

          <StatGrid>
            <StatCard
              title="Showing"
              variant="primary"
              icon={User2}
              value={filteredRecords.length}
            />
            <StatCard
              title="Present"
              variant="success"
              icon={CheckCircle}
              value={presentCount}
            />
            <StatCard
              title="Late"
              variant="warning"
              icon={Clock1}
              value={lateCount}
            />
            <StatCard
              title="Incomplete"
              variant="danger"
              icon={BookA}
              value={incompleteCount}
            />
          </StatGrid>
        </section>
      )}

      {/* DATATABLE - PRESERVED */}

      {selectedBatch && (
        <section>
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#3B7597]">
              Attendance Records
            </p>
            <h2 className="mt-1 text-base font-bold text-[#0d2142]">
              Participant Attendance
            </h2>
          </div>

          {isLoadingAttendance ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#002b5c]" />
                <p className="mt-3 text-xs text-gray-400">
                  Loading attendance records...
                </p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <EmptyState search={Boolean(search.trim() || selectedDate)} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <DataTable
                columns={columns}
                data={filteredRecords}
                searchable
                showPagination
                toolbar={
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs text-gray-600 outline-none focus:border-[#3B7597] sm:w-44"
                    />
                    {selectedDate && (
                      <button
                        type="button"
                        onClick={() => setSelectedDate("")}
                        className="h-10 shrink-0 rounded-lg border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-500 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                }
              />
            </div>
          )}
        </section>
      )}

      {/* NO ASSIGNED BATCH */}

      {batches.length === 0 && (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <BatchIcon />
          </div>
          <h2 className="mt-4 text-base font-bold text-[#0d2142]">
            No Training Batch Assigned
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-500">
            There is currently no training batch assigned to your trainer account.
          </p>
          <button
            type="button"
            onClick={() => void loadBatches()}
            className="mt-5 rounded-lg bg-[#0d2142] px-4 py-2.5 text-xs font-semibold text-white hover:bg-black"
          >
            Reload
          </button>
        </section>
      )}

      {/* END SESSION CONFIRMATION MODAL */}

      {isCloseSessionModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isClosing) {
              setIsCloseSessionModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-gray-100 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <WarningIcon />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0d2142]">
                  End Attendance Session?
                </h2>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  QR scanning will stop and manual attendance will close.
                  Existing records will remain saved.
                </p>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-gray-400">
                    Batch
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-gray-700">
                    {selectedBatch?.batchCode ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-[10px] font-semibold uppercase text-gray-400">
                    Session
                  </p>
                  <p className="mt-1 text-xs font-bold text-gray-700">
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsCloseSessionModalOpen(false)}
                disabled={isClosing}
                className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCloseAttendance()}
                disabled={isClosing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0d2142] px-4 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                <StopIcon />
                {isClosing ? "Ending Session..." : "Yes, End Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}

      {isCameraModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              void closeCameraModal();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d2142] text-white">
                  <CameraIcon />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#3B7597]">
                    QR Attendance
                  </p>
                  <h2 className="mt-1 text-sm font-bold text-gray-900">
                    Scan Participant QR
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void closeCameraModal()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close camera"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              <div className="relative overflow-hidden rounded-xl bg-black">
                <div
                  id="attendance-qr-reader"
                  className="min-h-[320px] w-full"
                />

                {!isScanning && (
                  <div className="absolute inset-0 flex min-h-[320px] flex-col items-center justify-center bg-gray-950 px-6 text-center">
                    <CameraIcon className="!h-10 !w-10 text-white" />
                    <p className="mt-4 text-sm font-semibold text-white">
                      Starting camera...
                    </p>
                    <p className="mt-2 max-w-xs text-xs leading-5 text-white/60">
                      Please allow camera access when Chrome asks for permission.
                    </p>
                  </div>
                )}

                {isScanning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[250px] w-[250px] rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    {isScanning ? "Scanning..." : "Starting camera..."}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Place the participant QR code inside the frame.
                  </p>
                </div>

                {isScanning && (
                  <button
                    type="button"
                    onClick={() => void closeCameraModal()}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white hover:bg-black"
                  >
                    <StopIcon />
                    Stop
                  </button>
                )}
              </div>

              {scanError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-700">
                    Scan failed
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {scanError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SMALL REUSABLE COMPONENTS

function StatusPill({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        open
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          open ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {open ? "OPEN" : "CLOSED"}
    </span>
  );
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-semibold text-gray-500">
      {children}
    </span>
  );
}

function EmptyState({ search }: { search: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        {search ? <SearchIcon /> : <UsersIcon />}
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-700">
        {search ? "No matching attendance records" : "No attendance records"}
      </p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-500">
        {search
          ? "Try another participant name or select a different date."
          : "Attendance records will appear here after a participant is recorded."}
      </p>
    </div>
  );
}

function Alert({
  type,
  title,
  message,
  onClose,
}: {
  type: "error" | "success";
  title: string;
  message: string;
  onClose: () => void;
}) {
  const success = type === "success";

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${
        success
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-2">
        {success ? (
          <CheckIcon className="mt-0.5 text-emerald-600" />
        ) : (
          <ErrorIcon className="mt-0.5 text-red-600" />
        )}
        <div>
          <p
            className={`text-xs font-semibold ${
              success ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {title}
          </p>
          <p
            className={`mt-1 text-xs leading-5 ${
              success ? "text-emerald-600" : "text-red-600"
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

type IconProps = {
  className?: string;
};

function RefreshIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

function BatchIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 4v16M16 4v16M3 9h18M3 15h18" />
    </svg>
  );
}

function UnlockIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 7.8-1" />
    </svg>
  );
}

function LockIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function PlayIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function QrIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
    </svg>
  );
}

function CameraIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h4l2-2h4l2 2h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ScanIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M7 12h10M7 15h10M7 9h10" />
    </svg>
  );
}

function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M16 11a3 3 0 1 0 0-6M17 14.5a4 4 0 0 1 4 4V20" />
    </svg>
  );
}

function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ManualIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 17.5V20h2.5L18 8.5 15.5 6z" />
      <path d="m14 7.5 2.5 2.5M19 4l1 1" />
    </svg>
  );
}

function ErrorIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

function WarningIcon({ className = "" }: IconProps) {
  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
