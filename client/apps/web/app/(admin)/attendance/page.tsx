
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

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
  DataTable,
  StatCard,
  StatGrid,
  PageSectionHeader,
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
const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
const [summaryDate, setSummaryDate] = useState("");
  const selectedBatch = useMemo(
    () => batches[0] ?? null,
    [batches],
  );

  const assignedBatchId = selectedBatch?.id ?? "";

  const [trainingSessions, setTrainingSessions] = useState<
    TrainingSession[]
  >([]);

  const [selectedTrainingSessionId, setSelectedTrainingSessionId] =
    useState("");

  const [records, setRecords] = useState<
    AttendanceRecordWithProfile[]
  >([]);

  const [openSessionId, setOpenSessionId] = useState<string | null>(
    null,
  );

  const [manualAttendanceOpen, setManualAttendanceOpen] =
    useState(false);

  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] =
    useState(false);

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
  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  );
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
        err instanceof Error
          ? err.message
          : "Unable to load training batch.",
      );

      setBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  // LOAD TRAINING SESSIONS

  const loadTrainingSessions = useCallback(
    async (batchId: string) => {
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
    },
    [],
  );

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

        console.log("OPEN ATTENDANCE SESSION:", result);

        const isOpen = Boolean(
          result?.isOpen && result?.attendanceSessionId,
        );

        if (!isOpen) {
          setOpenSessionId(null);
          setManualAttendanceOpen(false);
          return null;
        }

        setOpenSessionId(result.attendanceSessionId);

        setManualAttendanceOpen(
          Boolean(result.manualAttendanceOpen),
        );

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

    void loadOpenSession(
      assignedBatchId,
      selectedTrainingSessionId,
    );
  }, [
    assignedBatchId,
    selectedTrainingSessionId,
    loadOpenSession,
  ]);

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
        setScanError(
          "Open the attendance session before scanning.",
        );
        return;
      }

      const cleanToken = token.trim();

      if (!cleanToken) {
        setScanError(
          "The QR code does not contain a valid attendance token.",
        );
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
          err instanceof Error
            ? err.message
            : "Unable to record attendance.",
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

      const readerElement = document.getElementById(
        "attendance-qr-reader",
      );

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
          const container = document.getElementById(
            "attendance-qr-reader",
          );

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
          console.error(
            "Failed to start camera:",
            camera.label || camera.id,
            cameraError,
          );

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

          const container = document.getElementById(
            "attendance-qr-reader",
          );

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

      const errorName =
        err instanceof DOMException ? err.name : "";

      const message =
        err instanceof Error ? err.message : String(err);

      if (
        errorName === "NotAllowedError" ||
        /permission|denied/i.test(message)
      ) {
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
        setScanError(
          "The selected camera is not available. Please try another camera.",
        );
      } else if (errorName === "NotFoundError") {
        setScanError("No camera was found on this device.");
      } else {
        setScanError(
          message || "Unable to start the QR scanner.",
        );
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
        err instanceof Error
          ? err.message
          : "Unable to start training session.",
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
    if (openSessionId) {
      setIsCloseSessionModalOpen(true);
    }
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

        await loadOpenSession(
          assignedBatchId,
          selectedTrainingSessionId,
        );
      }

      setScannedToken("");
      setScanResult(null);

      setSuccessMessage(
        "Training session has ended. Manual attendance is also closed.",
      );
    } catch (err) {
      console.error("END SESSION ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to end training session.",
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
        await loadOpenSession(
          assignedBatchId,
          selectedTrainingSessionId,
        );
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
        await loadOpenSession(
          assignedBatchId,
          selectedTrainingSessionId,
        );
      }

      setSuccessMessage(
        "Manual attendance is closed. QR scanning remains available.",
      );
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
      loadOpenSession(
        assignedBatchId,
        selectedTrainingSessionId,
      ),
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
      const participantName =
        record.participantName?.toLowerCase() ?? "";

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

 // ATTENDANCE SUMMARY FILTER

const summaryRecords = useMemo(() => {
  if (!summaryDate) return records;

  return records.filter((record) => {
    const sourceDate = record.timeIn ?? record.timeOut;

    if (!sourceDate) return false;

    const date = new Date(sourceDate);

    if (Number.isNaN(date.getTime())) return false;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}` === summaryDate;
  });
}, [records, summaryDate]);

// SUMMARY COUNTS

const presentCount = summaryRecords.filter(
  (record) => record.status?.toLowerCase() === "present",
).length;

const lateCount = summaryRecords.filter(
  (record) => record.status?.toLowerCase() === "late",
).length;

const incompleteCount = summaryRecords.filter((record) => {
  const status = record.status
    ?.toLowerCase()
    .replace(/[\s_-]/g, "");

  return (
    status === "timeinonly" ||
    status === "timeoutonly"
  );
}).length;

const selectedSession = trainingSessions.find(
  (session) => session.id === selectedTrainingSessionId,
);

const attendanceRate =
  summaryRecords.length > 0
    ? Math.round(
        (presentCount / summaryRecords.length) * 100,
      )
    : 0;

  // LOADING SCREEN

  if (isLoadingBatches) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#f4f7fc]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[#dce7f5] border-t-[#123d70]" />
          <p className="mt-4 text-sm font-semibold text-[#193657]">
            Loading attendance dashboard...
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Preparing your training records
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-7 bg-[#f4f7fc] p-4 sm:p-6 lg:p-8">

      {/* DASHBOARD HEADER */}
      

      <PageSectionHeader
  title="Attendance Management"
  description="Monitor participant attendance, manage training sessions, and record Time In and Time Out."
  badge="Trainer Workspace"
  stats={[
    {
      label: "Assigned Batch",
      value: selectedBatch?.batchCode ?? "No batch",
    },
    {
      label: "Participants",
      value: `${selectedBatch?.enrolledCount ?? 0} Enrolled`,
    },
  ]}
  actions={
  <><button
        type="button"
        onClick={() => void handleRefresh()}
        disabled={isLoadingAttendance || isCheckingSession}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 text-[10px] font-bold text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshIcon />
        Refresh
      </button>
       <button
        type="button"
        onClick={openCameraModal}
        disabled={!openSessionId || isCheckingSession}
        className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5cc7e6] to-[#3c9fd0] px-3.5 text-[11px] font-extrabold text-[#082541] shadow-md shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/25 transition group-hover:bg-white/40">
          <CameraIcon />
        </span>
        <span className="text-left">
          <span className="block">Open QR Scanner</span>
          <span className="mt-0.5 block text-[8px] font-semibold text-[#103b5b]/70">
            Scan participant attendance
          </span>
        </span>
      </button>
      </>
}
/>



      {/* NOTIFICATIONS */}

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
          title="Action completed"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* NO ASSIGNED BATCH */}

      {batches.length === 0 && (
        <section className="relative overflow-hidden rounded-[24px] border border-dashed border-[#cbd8e8] bg-white px-6 py-16 text-center shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#123d70] via-[#3b82b9] to-[#80c8e8]" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf4fb] text-[#24598b]">
            <BatchIcon className="!h-7 !w-7" />
          </div>

          <h2 className="mt-5 text-lg font-extrabold text-[#102b4c]">
            No Training Batch Assigned
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            There is currently no training batch assigned to your
            trainer account. Once a batch is assigned, its attendance
            management tools will appear here.
          </p>

          <button
            type="button"
            onClick={() => void loadBatches()}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#103967] px-5 text-xs font-bold text-white shadow-lg shadow-[#103967]/20 transition hover:-translate-y-0.5 hover:bg-[#0b2c50]"
          >
            <RefreshIcon />
            Reload Assigned Batches
          </button>
        </section>
      )}

      {/* BATCH AND SESSION MANAGEMENT */}

      {selectedBatch && (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">

            {/* SESSION CONTROL PANEL */}

            <div className="overflow-hidden rounded-[24px] border border-[#e1e9f2] bg-white shadow-[0_5px_20px_rgba(22,48,79,0.045)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f6] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf2fb] text-[#174b7d]">
                    <CalendarIcon />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#4b7ba5]">
                      Session Configuration
                    </p>
                    <h2 className="mt-1 text-base font-extrabold text-[#102b4c]">
                      Training Session
                    </h2>
                  </div>
                </div>

                <StatusPill open={Boolean(openSessionId)} />
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {/* BATCH INFORMATION */}

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#f0f5fb] to-[#f7faff] p-4">
                  <div className="absolute right-0 top-0 h-full w-1 bg-[#2c6599]" />

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#174b7d] shadow-sm">
                      <BatchIcon />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#64809c]">
                        Assigned Training Batch
                      </p>
                      <p className="mt-1 truncate text-sm font-extrabold text-[#14375d]">
                        {selectedBatch.batchCode}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#6b7e91]">
                        {selectedBatch.programName}
                      </p>
                    </div>

                    <div className="hidden rounded-xl border border-[#dce7f2] bg-white px-3 py-2 text-right sm:block">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                        Enrollment
                      </p>
                      <p className="mt-0.5 text-sm font-extrabold text-[#174b7d]">
                        {selectedBatch.enrolledCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SESSION SELECTOR */}

                <div>
                  <label
                    htmlFor="attendance-session"
                    className="mb-2 block text-xs font-bold text-[#344d68]"
                  >
                    Select Training Schedule
                  </label>

                  <div className="relative">
                    <select
                      id="attendance-session"
                      value={selectedTrainingSessionId}
                      onChange={(event) =>
                        setSelectedTrainingSessionId(
                          event.target.value,
                        )
                      }
                      disabled={
                        Boolean(openSessionId) || isCheckingSession
                      }
                      className="h-12 w-full appearance-none rounded-xl border border-[#dce5ef] bg-[#f9fbfe] px-4 pr-10 text-sm font-medium text-[#24415f] outline-none transition focus:border-[#3b7597] focus:bg-white focus:ring-4 focus:ring-[#3b7597]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="">
                        Select training session
                      </option>

                      {trainingSessions.map((session) => (
                        <option
                          key={session.id}
                          value={session.id}
                        >
                          Session {session.sessionNumber} —{" "}
                          {new Date(
                            session.sessionDate,
                          ).toLocaleDateString()}{" "}
                          — {session.startTime} - {session.endTime}
                        </option>
                      ))}
                    </select>

                    <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {trainingSessions.length === 0 && (
                    <p className="mt-2 text-xs text-gray-400">
                      No training sessions available for this batch.
                    </p>
                  )}

                  {openSessionId && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600">
                      <LockIcon className="!h-3 !w-3" />
                      End the active session before selecting another
                      schedule.
                    </p>
                  )}
                </div>

                {/* SELECTED SESSION DETAILS */}

                {selectedSession && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <SessionDetail
                      label="Session Number"
                      value={`Session ${selectedSession.sessionNumber}`}
                      icon={<BookA className="h-4 w-4" />}
                    />

                    <SessionDetail
                      label="Session Date"
                      value={new Date(
                        selectedSession.sessionDate,
                      ).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      icon={<CalendarIcon />}
                    />

                    <SessionDetail
                      label="Schedule"
                      value={`${selectedSession.startTime} - ${selectedSession.endTime}`}
                      icon={<Clock1 className="h-4 w-4" />}
                    />
                  </div>
                )}

                {/* SESSION ACTION */}

                <div className="flex flex-col gap-3 border-t border-[#edf1f6] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#253f5d]">
                      {openSessionId
                        ? "Attendance session is running"
                        : "Ready to begin attendance?"}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      {openSessionId
                        ? "Participants can record attendance according to the enabled methods."
                        : "Start the session to activate QR and manual attendance controls."}
                    </p>
                  </div>

                  {!openSessionId ? (
                    <button
                      type="button"
                      onClick={() => void handleOpenAttendance()}
                      disabled={
                        isOpening ||
                        isCheckingSession ||
                        !selectedTrainingSessionId
                      }
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#117a55] to-[#15966a] px-6 text-xs font-extrabold text-white shadow-lg shadow-emerald-800/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isOpening ? (
                        <SpinnerIcon />
                      ) : (
                        <PlayIcon />
                      )}
                      {isOpening
                        ? "Starting Session..."
                        : "Start Attendance Session"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestCloseAttendance}
                      disabled={isClosing || isCheckingSession}
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#122f50] px-6 text-xs font-extrabold text-white shadow-lg shadow-[#122f50]/15 transition hover:-translate-y-0.5 hover:bg-[#0a2039] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <StopIcon />
                      End Session
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MANUAL ATTENDANCE PANEL */}

            <div className="relative overflow-hidden rounded-[24px] border border-[#e1e9f2] bg-white shadow-[0_5px_20px_rgba(22,48,79,0.045)]">
              <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-[#1d4e80] via-[#3c86b7] to-[#7bc6db]" />

              <div className="flex items-center gap-3 border-b border-[#edf1f6] px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf2fb] text-[#174b7d]">
                  <ManualIcon className="!h-5 !w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#4b7ba5]">
                    Attendance Method
                  </p>
                  <h2 className="mt-1 text-base font-extrabold text-[#102b4c]">
                    Manual Attendance
                  </h2>
                </div>
              </div>

              <div className="flex h-[calc(100%-81px)] flex-col p-5 sm:p-6">
                <div
                  className={`relative overflow-hidden rounded-2xl p-5 ${
                    manualAttendanceOpen
                      ? "bg-gradient-to-br from-[#e6f8f0] to-[#f3fbf7]"
                      : "bg-gradient-to-br from-[#f1f4f8] to-[#f8fafc]"
                  }`}
                >
                  <div
                    className={`absolute -right-7 -top-7 h-28 w-28 rounded-full ${
                      manualAttendanceOpen
                        ? "bg-emerald-300/20"
                        : "bg-slate-300/20"
                    }`}
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Current Status
                      </p>

                      <p
                        className={`mt-2 text-2xl font-extrabold ${
                          manualAttendanceOpen
                            ? "text-emerald-800"
                            : "text-[#52677e]"
                        }`}
                      >
                        {manualAttendanceOpen
                          ? "Enabled"
                          : "Disabled"}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-500">
                        {manualAttendanceOpen
                          ? "Participant manual attendance is available."
                          : "Manual attendance is not currently accepting entries."}
                      </p>
                    </div>

                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        manualAttendanceOpen
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "bg-white text-gray-400 shadow-sm"
                      }`}
                    >
                      {manualAttendanceOpen ? (
                        <UnlockIcon className="!h-6 !w-6" />
                      ) : (
                        <LockIcon className="!h-6 !w-6" />
                      )}
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <StatusPill open={manualAttendanceOpen} />
                  </div>
                </div>

                <div className="my-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#edf4fb] text-[#24598b]">
                      <CheckIcon className="!h-3.5 !w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#304a66]">
                        Participant Time In
                      </p>
                      <p className="mt-0.5 text-[11px] leading-5 text-gray-400">
                        Participants can record when they arrive.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#edf4fb] text-[#24598b]">
                      <Clock1 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#304a66]">
                        Participant Time Out
                      </p>
                      <p className="mt-0.5 text-[11px] leading-5 text-gray-400">
                        Participants can record when they finish.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-[#edf1f6] pt-4">
                  {!openSessionId ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-400"
                    >
                      <LockIcon />
                      Start Session First
                    </button>
                  ) : manualAttendanceOpen ? (
                    <button
                      type="button"
                      onClick={() =>
                        void handleCloseManualAttendance()
                      }
                      disabled={
                        isClosingManual || isCheckingSession
                      }
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dce5ef] bg-white text-xs font-bold text-[#314c68] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      {isClosingManual ? (
                        <SpinnerIcon />
                      ) : (
                        <StopIcon />
                      )}
                      {isClosingManual
                        ? "Closing Manual Attendance..."
                        : "Close Manual Attendance"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        void handleOpenManualAttendance()
                      }
                      disabled={
                        isOpeningManual || isCheckingSession
                      }
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#117a55] to-[#15966a] text-xs font-bold text-white shadow-md shadow-emerald-800/10 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                    >
                      {isOpeningManual ? (
                        <SpinnerIcon />
                      ) : (
                        <PlayIcon />
                      )}
                      {isOpeningManual
                        ? "Opening Manual Attendance..."
                        : "Open Manual Attendance"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

         
        </>
      )}
{/* ATTENDANCE SUMMARY MODAL */}

{isSummaryModalOpen && (
  <div
    className="fixed inset-0 z-[10001] flex items-center justify-center bg-[#071a35]/75 p-4 backdrop-blur-md"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setIsSummaryModalOpen(false);
      }
    }}
  >
    <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[26px] border border-white/40 bg-[#f4f7fc] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
      {/* HEADER */}

      <div className="relative overflow-hidden bg-gradient-to-br from-[#071a35] via-[#103967] to-[#17619a] px-6 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[30px] border-white/[0.05]" />
        <div className="pointer-events-none absolute bottom-0 right-36 h-40 w-40 rounded-full bg-cyan-300/[0.08] blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              <ChartIcon className="!h-3.5 !w-3.5 text-cyan-200" />
              <span className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-cyan-100">
                Performance Overview
              </span>
            </div>

            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Attendance Summary
            </h2>

            <p className="mt-2 max-w-lg text-xs leading-5 text-blue-100/70">
              Review participant attendance performance, attendance
              status, and overall participation rate.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-100/60">
                  Training Batch
                </p>
                <p className="mt-1 text-xs font-extrabold">
                  {selectedBatch?.batchCode ?? "No batch"}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-100/60">
                  Training Session
                </p>
                <p className="mt-1 text-xs font-extrabold">
                  {selectedSession
                    ? `Session ${selectedSession.sessionNumber}`
                    : "All Sessions"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSummaryModalOpen(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl text-white transition hover:bg-white/20"
            aria-label="Close attendance summary"
          >
            ×
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        {/* FILTER */}

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e1e9f2] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-extrabold text-[#193653]">
              Filter Summary
            </p>
            <p className="mt-1 text-[10px] text-gray-400">
              Select a date to view attendance statistics for that day.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65809b]" />

              <input
                type="date"
                value={summaryDate}
                onChange={(event) =>
                  setSummaryDate(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-[#dfe7f0] bg-[#f9fbfe] pl-9 pr-3 text-xs font-medium text-[#526b84] outline-none transition focus:border-[#3b7597] focus:ring-4 focus:ring-[#3b7597]/10 sm:w-44"
              />
            </div>

            {summaryDate && (
              <button
                type="button"
                onClick={() => setSummaryDate("")}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f0] bg-white px-4 text-xs font-bold text-[#647a91] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <ClearIcon />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#dce8f5] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf2fb] text-[#27699c]">
                <UsersIcon />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#7890a8]">
                Total
              </span>
            </div>

            <p className="mt-4 text-3xl font-extrabold text-[#14375d]">
              {summaryRecords.length}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-gray-400">
              Attendance Records
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckIcon />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600">
                Present
              </span>
            </div>

            <p className="mt-4 text-3xl font-extrabold text-emerald-700">
              {presentCount}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-gray-400">
              Completed Attendance
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock1 />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600">
                Late
              </span>
            </div>

            <p className="mt-4 text-3xl font-extrabold text-amber-700">
              {lateCount}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-gray-400">
              Late Participants
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <WarningIcon />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-600">
                Incomplete
              </span>
            </div>

            <p className="mt-4 text-3xl font-extrabold text-red-700">
              {incompleteCount}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-gray-400">
              Missing Time In or Out
            </p>
          </div>
        </div>

        {/* ATTENDANCE RATE */}

        <div className="rounded-2xl border border-[#e1e9f2] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#63809c]">
                Overall Attendance Rate
              </p>

              <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#14375d]">
                {attendanceRate}%
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {summaryDate
                  ? `Attendance statistics for ${new Date(
                      `${summaryDate}T00:00:00`,
                    ).toLocaleDateString("en-PH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  : "Based on all available attendance records."}
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3fb] text-[#27699c]">
              <ChartIcon className="!h-7 !w-7" />
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf2f7]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#23689c] to-[#55b6cf] transition-all duration-500"
              style={{
                width: `${Math.min(attendanceRate, 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-400">
              Attendance performance
            </span>
            <span className="text-xs font-extrabold text-[#27699c]">
              {attendanceRate}%
            </span>
          </div>
        </div>

        {/* STATUS DISTRIBUTION */}

        <div className="rounded-2xl border border-[#e1e9f2] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-extrabold text-[#193653]">
              Attendance Breakdown
            </h3>
            <p className="mt-1 text-[10px] text-gray-400">
              Distribution of recorded participant attendance statuses.
            </p>
          </div>

          {summaryRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#dce5ef] bg-[#f9fbfe] px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf2fb] text-[#477ba7]">
                <RecordsIcon className="!h-6 !w-6" />
              </div>

              <p className="mt-3 text-xs font-extrabold text-[#294662]">
                No Attendance Data
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                No attendance records are available for this filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                {
                  label: "Present",
                  count: presentCount,
                  color: "bg-emerald-500",
                  text: "text-emerald-700",
                },
                {
                  label: "Late",
                  count: lateCount,
                  color: "bg-amber-400",
                  text: "text-amber-700",
                },
                {
                  label: "Incomplete",
                  count: incompleteCount,
                  color: "bg-red-500",
                  text: "text-red-700",
                },
              ].map((item) => {
                const percentage =
                  summaryRecords.length > 0
                    ? Math.round(
                        (item.count / summaryRecords.length) * 100,
                      )
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#405b76]">
                        {item.label}
                      </span>

                      <span className={`text-xs font-extrabold ${item.text}`}>
                        {item.count} ({percentage}%)
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2f7]">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-[#e4ebf3] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] leading-5 text-gray-400">
            Summary statistics are calculated from the currently loaded
            attendance records.
          </p>

          <button
            type="button"
            onClick={() => setIsSummaryModalOpen(false)}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#103967] px-6 text-xs font-extrabold text-white shadow-lg shadow-[#103967]/15 transition hover:-translate-y-0.5 hover:bg-[#0b2c50]"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* ATTENDANCE OVERVIEW */}

      {selectedBatch && (
        <section className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#2c75a8]" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#4b7ba5]">
                  Performance Overview
                </p>
              </div>

              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#102b4c]">
                Attendance Summary
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Overview of participant attendance records
                {selectedDate ? " for the selected date" : ""}.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[#e0e9f3] bg-white px-3 py-2 sm:self-auto">
              <CalendarIcon className="text-[#477ba7]" />
              <span className="text-[10px] font-bold text-[#516b86]">
                {selectedDate
                  ? new Date(
                      `${selectedDate}T00:00:00`,
                    ).toLocaleDateString("en-PH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "All Attendance Records"}
              </span>
            </div>
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

          {/* ATTENDANCE RATE */}

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-[#e1e9f2] bg-white p-5 shadow-[0_4px_16px_rgba(22,48,79,0.035)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#63809c]">
                    Attendance Rate
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#14375d]">
                    {attendanceRate}%
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf3fb] text-[#27699c]">
                  <ChartIcon className="!h-6 !w-6" />
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf2f7]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#23689c] to-[#55b6cf] transition-all duration-500"
                  style={{
                    width: `${Math.min(attendanceRate, 100)}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[10px] text-gray-400">
                Based on the currently displayed attendance records.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-[#e1e9f2] bg-white p-5 shadow-[0_4px_16px_rgba(22,48,79,0.035)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf7f2] text-emerald-700">
                <UsersIcon className="!h-6 !w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#63809c]">
                  Batch Enrollment
                </p>

                <p className="mt-1 text-2xl font-extrabold text-[#14375d]">
                  {selectedBatch.enrolledCount}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Participants enrolled in this training batch.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ATTENDANCE RECORDS */}

      {selectedBatch && (
        <section className="overflow-hidden rounded-[24px] border border-[#e1e9f2] bg-white shadow-[0_5px_20px_rgba(22,48,79,0.045)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#edf1f6] px-5 py-5 sm:px-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[#2c75a8]" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#4b7ba5]">
                  Attendance Database
                </p>
              </div>

              <h2 className="mt-2 text-lg font-extrabold text-[#102b4c]">
                Participant Attendance Records
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Review and filter participant Time In and Time Out
                records.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-[#e2eaf3] bg-[#f7faff] px-3 py-2">
              <RecordsIcon className="text-[#477ba7]" />
              <span className="text-[10px] font-bold text-[#47617c]">
                {filteredRecords.length} Records
              </span>
            </div>
          </div>

          <div className="border-b border-[#edf1f6] bg-[#f9fbfe] p-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search participant, status, or method..."
                  className="h-11 w-full rounded-xl border border-[#dfe7f0] bg-white pl-10 pr-4 text-xs text-[#314a65] outline-none transition placeholder:text-gray-400 focus:border-[#3b7597] focus:ring-4 focus:ring-[#3b7597]/10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65809b]" />

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) =>
                      setSelectedDate(event.target.value)
                    }
                    className="h-11 w-full rounded-xl border border-[#dfe7f0] bg-white pl-9 pr-3 text-xs font-medium text-[#526b84] outline-none transition focus:border-[#3b7597] focus:ring-4 focus:ring-[#3b7597]/10 sm:w-44"
                  />
                </div>

                {(selectedDate || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate("");
                      setSearch("");
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f0] bg-white px-4 text-xs font-bold text-[#647a91] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <ClearIcon />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-5">
            {isLoadingAttendance ? (
              <div className="flex min-h-[250px] items-center justify-center rounded-2xl bg-[#f8fafd]">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#dce7f5] border-t-[#123d70]" />
                  <p className="mt-3 text-xs font-semibold text-[#536c86]">
                    Loading attendance records...
                  </p>
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <EmptyState
                search={Boolean(search.trim() || selectedDate)}
              />
            ) : (
              <div className="overflow-hidden rounded-xl">
                <DataTable
                  columns={columns}
                  data={filteredRecords}
                  searchable
                  showPagination
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* END SESSION CONFIRMATION MODAL */}

      {isCloseSessionModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#071a35]/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isClosing
            ) {
              setIsCloseSessionModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/30 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#fff8e9] to-[#fffdf8] p-6">
              <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-amber-200/30 blur-2xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <WarningIcon className="!h-6 !w-6" />
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-[#193653]">
                    End Attendance Session?
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-[#748397]">
                    QR scanning will stop and manual attendance will
                    close. Existing attendance records will remain
                    saved.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#e7edf4] bg-[#f8fafd] p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                    Training Batch
                  </p>
                  <p className="mt-1.5 truncate text-xs font-extrabold text-[#294662]">
                    {selectedBatch?.batchCode ?? "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#e7edf4] bg-[#f8fafd] p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                    Session
                  </p>
                  <p className="mt-1.5 text-xs font-extrabold text-[#294662]">
                    {selectedSession
                      ? `Session ${selectedSession.sessionNumber}`
                      : "Active"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setIsCloseSessionModalOpen(false)
                  }
                  disabled={isClosing}
                  className="h-11 rounded-xl border border-[#dfe7f0] bg-white px-5 text-xs font-bold text-[#52677d] transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleConfirmCloseAttendance()
                  }
                  disabled={isClosing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#173957] px-5 text-xs font-bold text-white shadow-md transition hover:bg-[#0b2743] disabled:opacity-50"
                >
                  {isClosing ? (
                    <SpinnerIcon />
                  ) : (
                    <StopIcon />
                  )}
                  {isClosing
                    ? "Ending Session..."
                    : "Yes, End Session"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA MODAL */}

      {isCameraModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#06172d]/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              void closeCameraModal();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[26px] border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0a2545] to-[#174f7d] px-5 py-5 text-white">
              <div className="absolute -right-8 -top-14 h-36 w-36 rounded-full border-[18px] border-white/[0.05]" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-cyan-200">
                    <CameraIcon />
                  </div>

                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-cyan-200">
                      QR Attendance
                    </p>

                    <h2 className="mt-1 text-sm font-extrabold">
                      Scan Participant QR
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void closeCameraModal()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl text-white/80 transition hover:bg-white/20 hover:text-white"
                  aria-label="Close camera"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="relative overflow-hidden rounded-2xl bg-[#071a30] p-2">
                <div
                  id="attendance-qr-reader"
                  className="min-h-[320px] w-full overflow-hidden rounded-xl"
                />

                {!isScanning && (
                  <div className="absolute inset-2 flex min-h-[320px] flex-col items-center justify-center rounded-xl bg-[#071a30] px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-cyan-200">
                      <CameraIcon className="!h-8 !w-8" />
                    </div>

                    <p className="mt-4 text-sm font-extrabold text-white">
                      Starting Camera
                    </p>

                    <p className="mt-2 max-w-xs text-xs leading-5 text-blue-100/55">
                      Please allow camera access when Chrome asks for
                      permission.
                    </p>

                    <div className="mt-4 h-1 w-28 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300" />
                    </div>
                  </div>
                )}

                {isScanning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative h-[250px] w-[250px] rounded-2xl border-2 border-cyan-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                      <div className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,0.9)]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-extrabold text-[#294662]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isScanning
                          ? "animate-pulse bg-emerald-500"
                          : "bg-amber-400"
                      }`}
                    />
                    {isScanning ? "Scanner Active" : "Connecting..."}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Place the participant QR code inside the frame.
                  </p>
                </div>

                {isScanning && (
                  <button
                    type="button"
                    onClick={() => void closeCameraModal()}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#132e4d] px-4 text-[10px] font-bold text-white transition hover:bg-[#071a30]"
                  >
                    <StopIcon />
                    Stop Scanner
                  </button>
                )}
              </div>

              {scanError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold text-red-700">
                    <ErrorIcon />
                    Scanner Error
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-red-600">
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

// REUSABLE COMPONENTS

function StatusPill({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-extrabold tracking-wider ${
        open
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-[#e1e7ee] bg-[#f5f7fa] text-[#7b8b9b]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          open
            ? "animate-pulse bg-emerald-500"
            : "bg-gray-400"
        }`}
      />
      {open ? "OPEN" : "CLOSED"}
    </span>
  );
}

function SessionDetail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#e7edf4] bg-[#fbfcfe] p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4fb] text-[#477ba7]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>

        <p className="mt-1 truncate text-[11px] font-extrabold text-[#304c69]">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ search }: { search: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dce5ef] bg-[#f9fbfe] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf2fb] text-[#477ba7]">
        {search ? (
          <SearchIcon className="!h-6 !w-6" />
        ) : (
          <UsersIcon className="!h-6 !w-6" />
        )}
      </div>

      <p className="mt-4 text-sm font-extrabold text-[#294662]">
        {search
          ? "No Matching Attendance Records"
          : "No Attendance Records Yet"}
      </p>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-400">
        {search
          ? "No records match your search or selected date. Try changing your filters."
          : "Attendance records will appear here after a participant is recorded through QR or manual attendance."}
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
      className={`flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-sm ${
        success
          ? "border-emerald-200 bg-white"
          : "border-red-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            success
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {success ? <CheckIcon /> : <ErrorIcon />}
        </div>

        <div>
          <p
            className={`text-xs font-extrabold ${
              success ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-xs leading-5 ${
              success ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

// ICONS

type IconProps = {
  className?: string;
};

function RefreshIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

function BatchIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 4v16M16 4v16M3 9h18M3 15h18" />
    </svg>
  );
}

function UnlockIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 7.8-1" />
    </svg>
  );
}

function LockIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function PlayIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function QrIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" />
    </svg>
  );
}

function CameraIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h4l2-2h4l2 2h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M16 11a3 3 0 1 0 0-6M17 14.5a4 4 0 0 1 4 4V20" />
    </svg>
  );
}

function CheckIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ManualIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 17.5V20h2.5L18 8.5 15.5 6z" />
      <path d="m14 7.5 2.5 2.5M19 4l1 1" />
    </svg>
  );
}

function ErrorIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

function WarningIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SpinnerIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogInIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </svg>
  );
}

function LogOutIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 7l5 5-5 5M19 12H7" />
      <path d="M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
    </svg>
  );
}

function KeyboardIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8" />
    </svg>
  );
}

function ChartIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 3 6-7" />
    </svg>
  );
}

function RecordsIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function ClearIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}
