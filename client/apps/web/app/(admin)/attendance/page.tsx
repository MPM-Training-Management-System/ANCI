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

type AttendanceRecordWithProfile =
  AttendanceRecordDto & {
    profileImageUrl?: string | null;
  };

export default function TrainerAttendancePage() {
  // =========================================================
  // ASSIGNED TRAINING BATCH
  // =========================================================

  const [batches, setBatches] = useState<TrainingBatch[]>([]);

  // The trainer has only one assigned batch.
  const selectedBatch = useMemo(
    () => batches[0] ?? null,
    [batches],
  );

  const assignedBatchId =
    selectedBatch?.id ?? "";

  // =========================================================
  // TRAINING SESSIONS
  // =========================================================

  const [trainingSessions, setTrainingSessions] =
    useState<TrainingSession[]>([]);

  const [selectedTrainingSessionId, setSelectedTrainingSessionId] =
    useState<string>("");

  // =========================================================
  // ATTENDANCE
  // =========================================================

  const [records, setRecords] =
    useState<AttendanceRecordWithProfile[]>([]);

  // =========================================================
  // ACTIVE SESSION
  // =========================================================

  const [openSessionId, setOpenSessionId] =
    useState<string | null>(null);

  const [manualAttendanceOpen, setManualAttendanceOpen] =
    useState(false);

  // =========================================================
  // UI STATE
  // =========================================================

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [isLoadingBatches, setIsLoadingBatches] =
    useState(true);

  const [isLoadingAttendance, setIsLoadingAttendance] =
    useState(false);

  const [isCheckingSession, setIsCheckingSession] =
    useState(false);

  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isOpeningManual, setIsOpeningManual] =
    useState(false);

  const [isClosingManual, setIsClosingManual] =
    useState(false);

  const [isScanning, setIsScanning] =
    useState(false);

  const [isCameraModalOpen, setIsCameraModalOpen] =
    useState(false);

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
  // LOAD ASSIGNED TRAINING BATCH
  // =========================================================

  const loadBatches = useCallback(async () => {
    try {
      setIsLoadingBatches(true);
      setError(null);

      const result =
        await trainingBatchApi.getAssigned();

      const safeResult =
        Array.isArray(result)
          ? result
          : [];

      setBatches(safeResult);
    } catch (err) {
      console.error(
        "Unable to load assigned training batch:",
        err,
      );

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

  // =========================================================
  // LOAD TRAINING SESSIONS
  // =========================================================

  const loadTrainingSessions =
    useCallback(
      async (batchId: string) => {
        if (!batchId) {
          setTrainingSessions([]);
          setSelectedTrainingSessionId("");
          return;
        }

        try {
          const result =
            await trainingBatchApi.getSchedule(
              batchId,
            );

          const sessions =
            Array.isArray(result)
              ? result
              : [];

          setTrainingSessions(
            sessions,
          );

          setSelectedTrainingSessionId(
            sessions[0]?.id ?? "",
          );
        } catch (err) {
          console.error(
            "Unable to load training sessions:",
            err,
          );

          setTrainingSessions([]);
          setSelectedTrainingSessionId("");
        }
      },
      [],
    );

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  const loadAttendance =
    useCallback(
      async (batchId: string) => {
        if (!batchId) {
          setRecords([]);
          return;
        }

        try {
          setIsLoadingAttendance(true);
          setError(null);

          const result =
            await attendanceApi.getBatch(
              batchId,
            );

          setRecords(
            Array.isArray(result)
              ? result
              : [],
          );
        } catch (err) {
          console.error(
            "Unable to load attendance:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load attendance records.",
          );

          setRecords([]);
        } finally {
          setIsLoadingAttendance(false);
        }
      },
      [],
    );

  // =========================================================
  // GET CURRENT OPEN SESSION
  // =========================================================

  const loadOpenSession =
    useCallback(
      async (
        batchId: string,
        trainingSessionId: string,
      ) => {
        if (
          !batchId ||
          !trainingSessionId
        ) {
          setOpenSessionId(null);
          setManualAttendanceOpen(false);

          return null;
        }

        try {
          setIsCheckingSession(true);

          const result =
            await attendanceApi.getOpenSession(
              batchId,
              trainingSessionId,
            );

          if (
            !result?.isOpen ||
            !result.attendanceSessionId
          ) {
            setOpenSessionId(null);
            setManualAttendanceOpen(false);

            return null;
          }

          setOpenSessionId(
            result.attendanceSessionId,
          );

          setManualAttendanceOpen(
            Boolean(
              result.manualAttendanceOpen,
            ),
          );

          return result.attendanceSessionId;
        } catch (err) {
          console.error(
            "Unable to check attendance session:",
            err,
          );

          setOpenSessionId(null);
          setManualAttendanceOpen(false);

          return null;
        } finally {
          setIsCheckingSession(false);
        }
      },
      [],
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
  // LOAD DATA WHEN ASSIGNED BATCH CHANGES
  // =========================================================

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

    void loadTrainingSessions(
      assignedBatchId,
    );

    void loadAttendance(
      assignedBatchId,
    );
  }, [
    assignedBatchId,
    loadTrainingSessions,
    loadAttendance,
  ]);

  // =========================================================
  // SYNC OPEN SESSION
  // =========================================================

  useEffect(() => {
    if (
      !assignedBatchId ||
      !selectedTrainingSessionId
    ) {
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

  // =========================================================
  // STOP SCANNER
  // =========================================================

  const stopScanner =
    useCallback(async () => {
      const scanner =
        scannerRef.current;

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

  // =========================================================
  // CLOSE CAMERA MODAL
  // =========================================================

  const closeCameraModal =
    useCallback(async () => {
      await stopScanner();

      setIsCameraModalOpen(false);
    }, [
      stopScanner,
    ]);

  // =========================================================
  // SCANNER CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      const scanner =
        scannerRef.current;

      if (scanner) {
        void scanner
          .stop()
          .catch(() => {});

        scannerRef.current = null;
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
            "Open the attendance session before scanning.",
          );

          return;
        }

        const cleanToken =
          token.trim();

        if (!cleanToken) {
          setScanError(
            "The QR code does not contain a valid attendance token.",
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
            token: cleanToken,
          });

          setScannedToken(
            cleanToken,
          );

          setScanResult(
            "Participant attendance recorded.",
          );

          setSuccessMessage(
            "Attendance recorded successfully. Scan the same QR again at Time Out.",
          );

          if (assignedBatchId) {
            await loadAttendance(
              assignedBatchId,
            );
          }
        } catch (err) {
          console.error(
            "QR ATTENDANCE SCAN ERROR:",
            err,
          );

          setScanError(
            err instanceof Error
              ? err.message
              : "Unable to record attendance.",
          );
        } finally {
          processingScanRef.current =
            false;
        }
      },
      [
        openSessionId,
        assignedBatchId,
        loadAttendance,
      ],
    );

  // =========================================================
  // START SCANNER
  // =========================================================

  const startScanner =
    useCallback(async () => {
      if (!openSessionId) {
        setScanError(
          "Open the attendance session first.",
        );

        return;
      }

      if (scannerRef.current) {
        return;
      }

      try {
        setScanError(null);
        setError(null);
        setScanResult(null);

        const {
          Html5Qrcode,
        } = await import(
          "html5-qrcode"
        );

        const readerElement =
          document.getElementById(
            "attendance-qr-reader",
          );

        if (!readerElement) {
          throw new Error(
            "QR scanner container was not found.",
          );
        }

        readerElement.innerHTML = "";

        const cameras =
          await Html5Qrcode.getCameras();

        if (!cameras.length) {
          throw new Error(
            "No camera was found on this device.",
          );
        }

        // =====================================================
        // REMOVE VIRTUAL CAMERAS
        // =====================================================

        const realCameras =
          cameras.filter(camera => {
            const label =
              camera.label.toLowerCase();

            return !(
              label.includes(
                "obs virtual camera",
              ) ||
              label.includes(
                "virtual camera",
              ) ||
              label.includes(
                "obs camera",
              )
            );
          });

        if (!realCameras.length) {
          throw new Error(
            "No physical camera was found. Please connect or enable your laptop/USB camera.",
          );
        }

        // =====================================================
        // PREFER REAR CAMERA
        // =====================================================

        const environmentCamera =
          realCameras.find(
            camera =>
              /back|rear|environment/i.test(
                camera.label,
              ),
          );

        const orderedCameras = [
          ...(environmentCamera
            ? [environmentCamera]
            : []),

          ...realCameras.filter(
            camera =>
              camera.id !==
              environmentCamera?.id,
          ),
        ];

        const scannerConfig = {
          fps: 10,
          qrbox: {
            width: 280,
            height: 280,
          },
          aspectRatio: 1,
        };

        let started = false;

        // =====================================================
        // TRY AVAILABLE PHYSICAL CAMERAS
        // =====================================================

        for (const camera of orderedCameras) {
          if (started) {
            break;
          }

          let scanner:
            | Html5Qrcode
            | null = null;

          try {
            console.log(
              "Trying camera:",
              camera.label ||
                camera.id,
            );

            const container =
              document.getElementById(
                "attendance-qr-reader",
              );

            if (container) {
              container.innerHTML = "";
            }

            scanner =
              new Html5Qrcode(
                "attendance-qr-reader",
              );

            await scanner.start(
              camera.id,
              scannerConfig,
              async decodedText => {
                if (
                  processingScanRef.current
                ) {
                  return;
                }

                await stopScanner();

                setIsCameraModalOpen(
                  false,
                );

                await recordScannedToken(
                  decodedText,
                );
              },
              () => {
                // QR not detected yet.
              },
            );

            scannerRef.current =
              scanner;

            setIsScanning(true);

            started = true;

            console.log(
              "QR scanner started successfully:",
              camera.label ||
                camera.id,
            );
          } catch (
            cameraError
          ) {
            console.error(
              "Failed to start camera:",
              camera.label ||
                camera.id,
              cameraError,
            );

            try {
              if (scanner) {
                await scanner
                  .stop()
                  .catch(() => {});

                scanner.clear();
              }
            } catch {
              // Ignore cleanup errors.
            }

            scannerRef.current =
              null;

            setIsScanning(false);

            const container =
              document.getElementById(
                "attendance-qr-reader",
              );

            if (container) {
              container.innerHTML = "";
            }
          }
        }

        if (!started) {
          throw new Error(
            "Could not start any available camera. Please close other apps or browser tabs using the camera, then try again.",
          );
        }
      } catch (err) {
        console.error(
          "QR SCANNER START ERROR:",
          err,
        );

        setIsScanning(false);
        scannerRef.current =
          null;

        const errorName =
          err instanceof DOMException
            ? err.name
            : "";

        const message =
          err instanceof Error
            ? err.message
            : String(err);

        if (
          errorName ===
            "NotAllowedError" ||
          /permission|denied/i.test(
            message,
          )
        ) {
          setScanError(
            "Camera permission was denied. Please allow camera access in Chrome settings and try again.",
          );
        } else if (
          errorName ===
            "NotReadableError" ||
          /NotReadableError|Could not start video source/i.test(
            message,
          )
        ) {
          setScanError(
            "The camera is currently unavailable. Please close other apps or browser tabs using the camera, then try again.",
          );
        } else if (
          errorName ===
          "OverconstrainedError"
        ) {
          setScanError(
            "The selected camera is not available. Please try another camera.",
          );
        } else if (
          errorName ===
          "NotFoundError"
        ) {
          setScanError(
            "No camera was found on this device.",
          );
        } else {
          setScanError(
            message ||
              "Unable to start the QR scanner.",
          );
        }
      }
    }, [
      openSessionId,
      stopScanner,
      recordScannedToken,
    ]);

  // =========================================================
  // OPEN CAMERA MODAL
  // =========================================================

  const openCameraModal =
    useCallback(() => {
      if (!openSessionId) {
        setScanError(
          "Open the attendance session first.",
        );

        return;
      }

      setScanError(null);
      setScanResult(null);
      setIsCameraModalOpen(true);
    }, [
      openSessionId,
    ]);

  // =========================================================
  // START CAMERA AFTER MODAL MOUNTS
  // =========================================================

  useEffect(() => {
    if (!isCameraModalOpen) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        void startScanner();
      }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    isCameraModalOpen,
    startScanner,
  ]);

  // =========================================================
  // MANUAL TOKEN SUBMIT
  // =========================================================

  const handleManualToken =
    useCallback(async () => {
      await recordScannedToken(
        scannedToken,
      );
    }, [
      scannedToken,
      recordScannedToken,
    ]);

  // =========================================================
  // START ATTENDANCE SESSION
  // =========================================================

  const handleOpenAttendance =
    useCallback(async () => {
      if (!assignedBatchId) {
        setError(
          "No training batch is assigned to this trainer.",
        );

        return;
      }

      if (!selectedTrainingSessionId) {
        setError(
          "Please select a training session first.",
        );

        return;
      }

      try {
        setIsOpening(true);
        setError(null);
        setScanError(null);
        setSuccessMessage(null);

        await attendanceApi.openSession({
          trainingBatchId:
            assignedBatchId,

          trainingSessionId:
            selectedTrainingSessionId,
        });

        const sessionId =
          await loadOpenSession(
            assignedBatchId,
            selectedTrainingSessionId,
          );

        if (!sessionId) {
          throw new Error(
            "Session was started, but the active session could not be retrieved.",
          );
        }

        await loadAttendance(
          assignedBatchId,
        );

        setSuccessMessage(
          "Training session is now open. QR scanning is enabled.",
        );
      } catch (err) {
        console.error(
          "START SESSION ERROR:",
          err,
        );

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

  // =========================================================
  // END ATTENDANCE SESSION
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

        await closeCameraModal();

        await attendanceApi.closeSession(
          openSessionId,
        );

        setOpenSessionId(null);
        setManualAttendanceOpen(false);

        if (assignedBatchId) {
          await loadAttendance(
            assignedBatchId,
          );

          await loadOpenSession(
            assignedBatchId,
            selectedTrainingSessionId,
          );
        }

        setScannedToken("");
        setScanResult(null);

        setSuccessMessage(
          "Training session has been ended. Manual attendance is also closed.",
        );
      } catch (err) {
        console.error(
          "END SESSION ERROR:",
          err,
        );

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

  // =========================================================
  // OPEN MANUAL ATTENDANCE
  // =========================================================

  const handleOpenManualAttendance =
    useCallback(async () => {
      if (!openSessionId) {
        setError(
          "Start the training session first.",
        );

        return;
      }

      try {
        setIsOpeningManual(true);
        setError(null);
        setScanError(null);
        setSuccessMessage(null);

        await attendanceApi.openManualAttendance(
          openSessionId,
        );

        if (assignedBatchId) {
          await loadOpenSession(
            assignedBatchId,
            selectedTrainingSessionId,
          );
        }

        setSuccessMessage(
          "Manual attendance is now open. Participants can use Time In and Time Out.",
        );
      } catch (err) {
        console.error(
          "OPEN MANUAL ATTENDANCE ERROR:",
          err,
        );

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

  // =========================================================
  // CLOSE MANUAL ATTENDANCE
  // =========================================================

  const handleCloseManualAttendance =
    useCallback(async () => {
      if (!openSessionId) {
        return;
      }

      try {
        setIsClosingManual(true);
        setError(null);
        setScanError(null);
        setSuccessMessage(null);

        await attendanceApi.closeManualAttendance(
          openSessionId,
        );

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
        console.error(
          "CLOSE MANUAL ATTENDANCE ERROR:",
          err,
        );

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

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh =
    useCallback(async () => {
      setError(null);
      setScanError(null);
      setSuccessMessage(null);

      if (!assignedBatchId) {
        await loadBatches();
        return;
      }

      await Promise.all([
        loadAttendance(
          assignedBatchId,
        ),

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

  // =========================================================
  // FILTER RECORDS
  // =========================================================

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return records.filter(
        record => {
          const participantName =
            record.participantName
              ?.toLowerCase() ?? "";

          const status =
            record.status
              ?.toLowerCase() ?? "";

          const method =
            record.method
              ?.toLowerCase() ?? "";

          const matchesSearch =
            !query ||
            participantName.includes(
              query,
            ) ||
            status.includes(query) ||
            method.includes(query);

          if (!matchesSearch) {
            return false;
          }

          if (!selectedDate) {
            return true;
          }

          const sourceDate =
            record.timeIn ??
            record.timeOut;

          if (!sourceDate) {
            return false;
          }

          const date =
            new Date(sourceDate);

          if (
            Number.isNaN(
              date.getTime(),
            )
          ) {
            return false;
          }

          const year =
            date.getFullYear();

          const month =
            String(
              date.getMonth() + 1,
            ).padStart(2, "0");

          const day =
            String(
              date.getDate(),
            ).padStart(2, "0");

          const recordDate =
            `${year}-${month}-${day}`;

          return (
            recordDate ===
            selectedDate
          );
        },
      );
    }, [
      records,
      search,
      selectedDate,
    ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const presentCount =
    filteredRecords.filter(
      record =>
        record.status
          ?.toLowerCase() ===
        "present",
    ).length;

  const lateCount =
    filteredRecords.filter(
      record =>
        record.status
          ?.toLowerCase() ===
        "late",
    ).length;

  const incompleteCount =
    filteredRecords.filter(
      record => {
        const status =
          record.status
            ?.toLowerCase()
            .replace(
              /[\s_-]/g,
              "",
            );

        return (
          status === "timeinonly" ||
          status === "timeoutonly"
        );
      },
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
    <div className="min-h-full space-y-6 p-6">

      <PageSection
        title="Attendance Management"
        description="Manage your training sessions, monitor participant attendance, and record attendance using permanent participant QR codes."
        actions={
          <Button
            type="button"
            onClick={() =>
              void handleRefresh()
            }
            disabled={
              isLoadingAttendance ||
              isCheckingSession
            }
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
          ASSIGNED BATCH + SESSION
      ===================================================== */}

      {selectedBatch && (
        <section
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ${
            openSessionId
              ? "border-emerald-200 bg-emerald-50/40"
              : "border-[#e7e9ec] bg-white"
          }`}
        >
          <div className="flex flex-col gap-6">

            {/* BATCH INFORMATION */}

            <div className="flex flex-col gap-4 rounded-2xl bg-[#f8f9fa] p-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <BatchIcon />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Assigned training batch
                  </p>

                  <h2 className="mt-1 text-sm font-bold text-gray-900">
                    {selectedBatch.batchCode}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedBatch.programName}
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">

                <InfoPill>
                  {selectedBatch.enrolledCount} Enrolled
                </InfoPill>

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

            {/* TRAINING SESSION */}

            <div>

              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Training Session
              </label>

              <select
                value={
                  selectedTrainingSessionId
                }
                onChange={event =>
                  setSelectedTrainingSessionId(
                    event.target.value,
                  )
                }
                disabled={
                  Boolean(openSessionId)
                }
                className="h-11 w-full rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] px-4 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  Select training session
                </option>

                {trainingSessions.map(
                  session => (
                    <option
                      key={session.id}
                      value={session.id}
                    >
                      Session{" "}
                      {session.sessionNumber}
                      {" — "}
                      {new Date(
                        session.sessionDate,
                      ).toLocaleDateString()}
                      {" — "}
                      {session.startTime}
                      {" - "}
                      {session.endTime}
                    </option>
                  ),
                )}
              </select>

              {trainingSessions.length ===
                0 && (
                <p className="mt-2 text-[10px] text-gray-400">
                  No approved training sessions are available for this batch.
                </p>
              )}

            </div>

            {/* SESSION HEADER */}

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
                      open={Boolean(
                        openSessionId,
                      )}
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
                        8,
                      )
                    : "—"}
                </p>

              </div>

            </div>

            {/* SESSION CONTROL */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="max-w-lg text-xs leading-5 text-gray-500">
                  {isCheckingSession
                    ? "Checking attendance session..."
                    : openSessionId
                      ? "Training session is active. Participant QR scanning is available."
                      : "Training session is currently closed. Start the session before recording attendance."}
                </p>

                {!isCheckingSession && (
                  <p className="mt-2 text-[9px] text-gray-400">
                    Session status is synchronized with the server.
                  </p>
                )}

              </div>

              {!openSessionId ? (
                <button
                  type="button"
                  onClick={() =>
                    void handleOpenAttendance()
                  }
                  disabled={
                    isOpening ||
                    isCheckingSession ||
                    !selectedTrainingSessionId
                  }
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PlayIcon />

                  {isOpening
                    ? "Starting..."
                    : "Start Session"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    void handleCloseAttendance()
                  }
                  disabled={
                    isClosing ||
                    isCheckingSession
                  }
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <StopIcon />

                  {isClosing
                    ? "Ending..."
                    : "End Session"}
                </button>
              )}

            </div>

            {/* MANUAL ATTENDANCE */}

            <div className="rounded-2xl border border-gray-200 bg-white p-4">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-3">

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      manualAttendanceOpen
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <ManualIcon />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="text-xs font-bold text-gray-800">
                        Manual Attendance
                      </p>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-bold ${
                          manualAttendanceOpen
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-gray-50 text-gray-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            manualAttendanceOpen
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                          }`}
                        />

                        {manualAttendanceOpen
                          ? "OPEN"
                          : "CLOSED"}
                      </span>

                    </div>

                    <p className="mt-1 max-w-xl text-[10px] leading-5 text-gray-400">
                      {manualAttendanceOpen
                        ? "Participants can now use Time In and Time Out from the mobile app."
                        : "Participants cannot manually record attendance. QR scanning remains available while the session is open."}
                    </p>

                  </div>

                </div>

                {!openSessionId ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-[10px] font-bold text-gray-400 disabled:cursor-not-allowed"
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
                      isClosingManual ||
                      isCheckingSession
                    }
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[10px] font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <StopIcon />

                    {isClosingManual
                      ? "Closing..."
                      : "Close Manual Attendance"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      void handleOpenManualAttendance()
                    }
                    disabled={
                      isOpeningManual ||
                      isCheckingSession
                    }
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PlayIcon />

                    {isOpeningManual
                      ? "Opening..."
                      : "Open Manual Attendance"}
                  </button>
                )}

              </div>

            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          QR SCANNER
      ===================================================== */}

      {selectedBatch && (
        <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">

          <div className="p-5">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
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
                    Scan the participant's permanent QR code to record attendance.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  openCameraModal
                }
                disabled={
                  !openSessionId ||
                  isCheckingSession
                }
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CameraIcon />
                Open Camera
              </button>

            </div>

            {/* SCANNER STATUS */}

            <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-[#fafbfc] px-4 py-3">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Scanner status
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {isCheckingSession
                    ? "Checking attendance session..."
                    : openSessionId
                      ? "Ready to scan participant QR"
                      : "Open attendance session first"}
                </p>

              </div>

              <StatusPill
                open={Boolean(
                  openSessionId,
                )}
              />

            </div>

            {/* SCAN INSTRUCTIONS */}

            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ScanIcon />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-gray-800">
                    Automatic Time In / Time Out
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    The same permanent participant QR is used for both actions.
                  </p>

                </div>

              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                <StepItem
                  number="1"
                  title="First scan"
                  description="Creates the participant's Time In record."
                />

                <StepItem
                  number="2"
                  title="Second scan"
                  description="Records Time Out for the same attendance day."
                />

                <StepItem
                  number="3"
                  title="Complete"
                  description="A third scan is rejected once attendance is complete."
                />

              </div>

            </div>

            {/* SCAN RESULT */}

            {scanResult && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

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

            {/* TOKEN FALLBACK */}

            <div className="mt-5">

              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                QR Token fallback
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">

                <input
                  value={scannedToken}
                  onChange={event =>
                    setScannedToken(
                      event.target.value,
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

            {/* SCAN ERROR */}

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
          CAMERA MODAL
      ===================================================== */}

      {isCameraModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (
              event.target ===
              event.currentTarget
            ) {
              void closeCameraModal();
            }
          }}
        >

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                  <CameraIcon />
                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600">
                    QR Attendance
                  </p>

                  <h2 className="mt-1 text-sm font-bold text-gray-900">
                    Scan Participant QR
                  </h2>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  void closeCameraModal()
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close camera"
              >
                ×
              </button>

            </div>

            <div className="p-5">

              <div className="relative overflow-hidden rounded-2xl bg-black">

                <div
                  id="attendance-qr-reader"
                  className="min-h-[360px] w-full"
                />

                {!isScanning && (
                  <div className="absolute inset-0 flex min-h-[360px] flex-col items-center justify-center bg-gray-950 px-6 text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <CameraIcon />
                    </div>

                    <p className="mt-4 text-sm font-bold text-white">
                      Starting camera...
                    </p>

                    <p className="mt-2 max-w-xs text-xs leading-5 text-white/60">
                      Please allow camera access when Chrome asks for permission.
                    </p>

                  </div>
                )}

                {isScanning && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                    <div className="h-[280px] w-[280px] rounded-3xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />

                  </div>
                )}

              </div>

              <div className="mt-4 flex items-center justify-between gap-3">

                <div>

                  <p className="text-xs font-bold text-gray-700">
                    {isScanning
                      ? "Scanning..."
                      : "Starting camera..."}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Point the participant QR inside the frame.
                  </p>

                </div>

                {isScanning && (
                  <button
                    type="button"
                    onClick={() =>
                      void closeCameraModal()
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-xs font-bold text-white transition hover:bg-black"
                  >
                    <StopIcon />
                    Stop
                  </button>
                )}

              </div>

              {scanError && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

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

          </div>

        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      {selectedBatch && (
        <StatGrid>

          <StatCard
            title="Showing"
            variant="primary"
            icon={User2}
            value={
              filteredRecords.length
            }
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
      )}

      {/* =====================================================
          ATTENDANCE TABLE
      ===================================================== */}

      {selectedBatch && (
        <section>

          {isLoadingAttendance ? (
            <div className="flex min-h-[280px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

                <p className="mt-3 text-xs text-gray-400">
                  Loading attendance records...
                </p>

              </div>

            </div>
          ) : filteredRecords.length ===
            0 ? (
            <EmptyState
              search={Boolean(
                search.trim() ||
                selectedDate,
              )}
            />
          ) : (
            <div className="rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">

              <div className="p-4 sm:p-5">

                <DataTable
                  columns={columns}
                  data={filteredRecords}
                  searchable
                  showPagination
                  toolbar={
                    <div className="flex w-full items-center gap-2 sm:w-auto">

                      <input
                        type="date"
                        value={
                          selectedDate
                        }
                        onChange={event =>
                          setSelectedDate(
                            event.target.value,
                          )
                        }
                        className="h-10 w-full rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300 focus:bg-white sm:w-44"
                      />

                      {selectedDate && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDate(
                              "",
                            )
                          }
                          className="h-10 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-[10px] font-bold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                        >
                          Clear
                        </button>
                      )}

                    </div>
                  }
                />

              </div>

            </div>
          )}

        </section>
      )}

      {/* =====================================================
          NO ASSIGNED BATCH
      ===================================================== */}

      {batches.length === 0 && (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <BatchIcon />
          </div>

          <h2 className="mt-4 text-sm font-bold text-gray-800">
            No Training Batch Assigned
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-400">
            There is currently no training batch assigned to your trainer account.
          </p>

          <button
            type="button"
            onClick={() =>
              void loadBatches()
            }
            className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-[11px] font-bold text-white transition hover:bg-black"
          >
            Reload
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
// EMPTY STATE
// =============================================================

function EmptyState({
  search,
}: {
  search: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

        {search ? (
          <SearchIcon className="!h-5 !w-5" />
        ) : (
          <UsersIcon className="!h-5 !w-5" />
        )}

      </div>

      <p className="mt-4 text-sm font-bold text-gray-700">

        {search
          ? "No matching attendance records"
          : "No attendance records"}

      </p>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-400">

        {search
          ? "Try another participant name or select a different date."
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
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[9px] font-bold text-gray-500">
      {children}
    </span>
  );
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