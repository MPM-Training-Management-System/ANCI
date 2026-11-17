
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  AttendanceRecordDto,
  TrainingBatch,
} from "@repo/types";

import {
  attendanceApi,
  trainingBatchApi,
} from "@/lib/api";

import { useAttendance } from "@repo/hooks";

export function useAttendanceManagement() {
  const { isLoading } = useAttendance(attendanceApi);

  const [batches, setBatches] = useState<TrainingBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [records, setRecords] = useState<AttendanceRecordDto[]>([]);
  const [search, setSearch] = useState("");

  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRecordDto | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  // ============================================================
  // SELECTED BATCH
  // ============================================================

  const selectedBatch = useMemo(() => {
    return (
      batches.find((batch) => batch.id === selectedBatchId) ?? null
    );
  }, [batches, selectedBatchId]);

  // ============================================================
  // LOAD TRAINING BATCHES
  // ============================================================

  const loadBatches = useCallback(async () => {
    try {
      setIsLoadingBatches(true);
      setError(null);

      const result = await trainingBatchApi.getAll();

      setBatches(result);

      setSelectedBatchId((currentId) => {
        if (result.some((batch) => batch.id === currentId)) {
          return currentId;
        }

        return result[0]?.id ?? "";
      });

      if (result.length === 0) {
        setRecords([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load training batches.",
      );
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  // ============================================================
  // LOAD ATTENDANCE RECORDS
  // ============================================================

  const loadAttendance = useCallback(async (batchId: string) => {
    if (!batchId) {
      setRecords([]);
      setIsLoadingAttendance(false);
      return;
    }

    try {
      setIsLoadingAttendance(true);
      setError(null);
      setSuccessMessage(null);

      const result = await attendanceApi.getBatch(batchId);

      setRecords(result);
    } catch (err) {
      setRecords([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance records.",
      );
    } finally {
      setIsLoadingAttendance(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  // ============================================================
  // LOAD ATTENDANCE WHEN BATCH CHANGES
  // ============================================================

  useEffect(() => {
    if (!selectedBatchId) {
      setRecords([]);
      return;
    }

    void loadAttendance(selectedBatchId);
  }, [selectedBatchId, loadAttendance]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);

    await loadBatches();

    // Attendance is reloaded by the selectedBatchId effect
    // if refreshing changes the selected batch.
    // Otherwise, refresh its records directly.
    if (selectedBatchId) {
      await loadAttendance(selectedBatchId);
    }
  }, [loadBatches, loadAttendance, selectedBatchId]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter(
      (record) =>
        (record.participantName ?? "").toLowerCase().includes(query) ||
        (record.status ?? "").toLowerCase().includes(query) ||
        (record.method ?? "").toLowerCase().includes(query) ||
        (record.id ?? "").toLowerCase().includes(query),
    );
  }, [records, search]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalRecords = records.length;

  const presentCount = records.filter(
    (record) => record.status === "Present",
  ).length;

  const lateCount = records.filter(
    (record) => record.status === "Late",
  ).length;

  const absentCount = records.filter(
    (record) => record.status === "Absent",
  ).length;

  // ============================================================
  // VIEW / CLOSE ATTENDANCE DETAILS
  // ============================================================

  const handleView = useCallback((record: AttendanceRecordDto) => {
    setSelectedRecord(record);
    setShowDetails(true);
  }, []);

  const closeDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedRecord(null);
  }, []);

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const handleExport = useCallback(() => {
    if (filteredRecords.length === 0) {
      setError("There are no attendance records to export.");
      return;
    }

    const rows = filteredRecords
      .map((record) =>
        [
          record.id,
          record.participantName,
          formatDateTime(record.timeIn),
          formatDateTime(record.timeOut),
          record.status,
          record.method || "—",
        ]
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`,
          )
          .join(","),
      )
      .join("\n");

    const csv = [
      "Attendance ID,Participant,Time In,Time Out,Status,Method",
      rows,
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const batchName = selectedBatch
      ? getBatchLabel(selectedBatch)
      : "attendance";

    link.href = url;
    link.download = `${sanitizeFileName(batchName)}-attendance.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccessMessage("Attendance exported successfully.");
  }, [filteredRecords, selectedBatch]);

  // ============================================================
  // RETURN VALUES TO PAGE
  // ============================================================

  return {
    batches,
    selectedBatchId,
    setSelectedBatchId,
    selectedBatch,

    records,
    filteredRecords,
    search,
    setSearch,

    isLoading,
    isLoadingBatches,
    isLoadingAttendance,

    error,
    setError,
    successMessage,
    setSuccessMessage,

    selectedRecord,
    showDetails,

    totalRecords,
    presentCount,
    lateCount,
    absentCount,

    loadBatches,
    loadAttendance,
    handleRefresh,
    handleView,
    closeDetails,
    handleExport,
  };
}

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(
  value: Date | string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getBatchLabel(batch: TrainingBatch) {
  const item = batch as TrainingBatch & Record<string, unknown>;

  const programName =
    typeof item.programName === "string"
      ? item.programName
      : typeof item.trainingName === "string"
        ? item.trainingName
        : null;

  const batchCode =
    typeof item.batchCode === "string"
      ? item.batchCode
      : null;

  if (programName && batchCode) {
    return `${programName} — ${batchCode}`;
  }

  if (programName) {
    return programName;
  }

  if (batchCode) {
    return batchCode;
  }

  return batch.id;
}

function sanitizeFileName(value: string) {
  return value
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
