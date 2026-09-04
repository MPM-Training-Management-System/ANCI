"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import type {
  AttendanceRecordDto,
  TrainingBatch,
} from "@repo/types";

import {
  attendanceApi,
  trainingBatchApi,
} from "@/lib/api";

import {
  columns,
  type AdminAttendanceRecord,
} from "./column";

export default function AttendanceManagementPage() {
  // ============================================================
  // TRAINING BATCHES
  // ============================================================

  const [batches, setBatches] =
    useState<TrainingBatch[]>([]);

  const [selectedBatchId, setSelectedBatchId] =
    useState<string>("");

  // ============================================================
  // ATTENDANCE
  // ============================================================

  const [records, setRecords] =
    useState<AttendanceRecordDto[]>([]);

  // ============================================================
  // UI STATE
  // ============================================================

  const [search, setSearch] =
    useState("");

  const [isLoadingBatches, setIsLoadingBatches] =
    useState(true);

  const [isLoadingAttendance, setIsLoadingAttendance] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  // ============================================================
  // DETAILS
  // ============================================================

  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRecordDto | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  // ============================================================
  // SELECTED BATCH
  // ============================================================

  const selectedBatch = useMemo(() => {
    return (
      batches.find(
        (batch) =>
          batch.id === selectedBatchId,
      ) ?? null
    );
  }, [
    batches,
    selectedBatchId,
  ]);

  // ============================================================
  // LOAD TRAINING BATCHES
  // ============================================================

  const loadBatches = useCallback(
    async () => {
      try {
        setIsLoadingBatches(true);
        setError(null);

        const result =
          await trainingBatchApi.getAll();

        setBatches(result);

        if (
          result.length > 0 &&
          !selectedBatchId
        ) {
          setSelectedBatchId(
            result[0].id,
          );
        }

        if (
          result.length === 0
        ) {
          setSelectedBatchId("");
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
    },
    [selectedBatchId],
  );

  // ============================================================
  // LOAD ATTENDANCE
  // ============================================================

  const loadAttendance = useCallback(
    async (
      batchId: string,
    ) => {
      if (!batchId) {
        setRecords([]);
        return;
      }

      try {
        setIsLoadingAttendance(true);
        setError(null);
        setSuccessMessage(null);

        const result =
          await attendanceApi.getBatch(
            batchId,
          );

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
    },
    [],
  );

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

    void loadAttendance(
      selectedBatchId,
    );
  }, [
    selectedBatchId,
    loadAttendance,
  ]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh =
    useCallback(async () => {
      setError(null);
      setSuccessMessage(null);

      if (selectedBatchId) {
        await loadAttendance(
          selectedBatchId,
        );
      }
    }, [
      selectedBatchId,
      loadAttendance,
    ]);

  // ============================================================
  // SEARCH
  // ============================================================

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
        (record) =>
          record.participantName
            .toLowerCase()
            .includes(query) ||
          record.status
            .toLowerCase()
            .includes(query) ||
          record.method
            .toLowerCase()
            .includes(query) ||
          record.id
            .toLowerCase()
            .includes(query),
      );
    }, [
      records,
      search,
    ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalRecords =
    records.length;

  const presentCount =
    records.filter(
      (record) =>
        record.status ===
        "Present",
    ).length;

  const lateCount =
    records.filter(
      (record) =>
        record.status ===
        "Late",
    ).length;

  const absentCount =
    records.filter(
      (record) =>
        record.status ===
        "Absent",
    ).length;

  // ============================================================
  // VIEW RECORD
  // ============================================================

  function handleView(
    record: AttendanceRecordDto,
  ) {
    setSelectedRecord(record);
    setShowDetails(true);
  }

  // ============================================================
  // EXPORT
  // ============================================================

  function handleExport() {
    if (
      filteredRecords.length ===
      0
    ) {
      setError(
        "There are no attendance records to export.",
      );

      return;
    }

    const rows =
      filteredRecords
        .map(
          (record) =>
            [
              record.id,
              record.participantName,
              formatDateTime(
                record.timeIn,
              ),
              formatDateTime(
                record.timeOut,
              ),
              record.status,
              record.method ||
                "—",
            ]
              .map(
                (value) =>
                  `"${String(
                    value,
                  ).replace(
                    /"/g,
                    '""',
                  )}"`,
              )
              .join(","),
        )
        .join("\n");

    const csv = [
      "Attendance ID,Participant,Time In,Time Out,Status,Method",
      rows,
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href = url;

    const batchName =
      selectedBatch
        ? getBatchLabel(
            selectedBatch,
          )
        : "attendance";

    link.download =
      `${sanitizeFileName(
        batchName,
      )}-attendance.csv`;

    document.body.appendChild(
      link,
    );

    link.click();

    document.body.removeChild(
      link,
    );

    URL.revokeObjectURL(
      url,
    );

    setSuccessMessage(
      "Attendance exported successfully.",
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>
              Administration
            </span>

            <span>/</span>

            <span className="font-medium text-gray-600">
              Attendance
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Attendance Management
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Monitor participant attendance
            across training batches and
            review real-time attendance
            records.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleExport
          }
          disabled={
            filteredRecords.length ===
            0
          }
          className="rounded-xl bg-[#17191c] px-5 py-3 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export Attendance
        </button>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="text-xs font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-medium text-emerald-700">
              {successMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(
                  null,
                )
              }
              className="text-xs font-bold text-emerald-500 hover:text-emerald-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ======================================================
          TRAINING BATCH SELECTOR
      ====================================================== */}

      <div className="rounded-2xl border border-[#e7e9ec] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Training Batch
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={
                  selectedBatchId
                }
                onChange={(
                  event,
                ) => {
                  setSelectedBatchId(
                    event.target
                      .value,
                  );
                  setSearch("");
                  setSuccessMessage(
                    null,
                  );
                }}
                disabled={
                  isLoadingBatches ||
                  batches.length ===
                    0
                }
                className="h-11 w-full max-w-xl rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-4 text-sm font-semibold text-gray-700 outline-none transition focus:bg-white focus:ring-1 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {batches.length ===
                  0 && (
                  <option value="">
                    {isLoadingBatches
                      ? "Loading training batches..."
                      : "No training batches available"}
                  </option>
                )}

                {batches.map(
                  (
                    batch,
                  ) => (
                    <option
                      key={
                        batch.id
                      }
                      value={
                        batch.id
                      }
                    >
                      {getBatchLabel(
                        batch,
                      )}
                    </option>
                  ),
                )}
              </select>

              <button
                type="button"
                onClick={
                  handleRefresh
                }
                disabled={
                  isLoadingAttendance ||
                  !selectedBatchId
                }
                className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingAttendance
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {selectedBatch && (
              <p className="mt-2 text-xs text-gray-400">
                Batch ID:{" "}
                <span className="font-mono">
                  {selectedBatch.id}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Records Loaded
            </p>

            <p className="mt-1 text-xl font-bold text-gray-800">
              {totalRecords}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <StatGrid>
        <StatCard
          title="Total Records"
          value={
            totalRecords
          }
          description="Attendance records"
        />

        <StatCard
          title="Present"
          value={
            presentCount
          }
          description="Present participants"
        />

        <StatCard
          title="Late"
          value={
            lateCount
          }
          description="Late participants"
        />

        <StatCard
          title="Absent"
          value={
            absentCount
          }
          description="Absent participants"
        />
      </StatGrid>

      {/* ======================================================
          DATA TABLE
      ====================================================== */}

      <DataTable
        title="Participant Attendance"
        description={
          selectedBatch
            ? `Attendance records for ${getBatchLabel(
                selectedBatch,
              )}.`
            : "Select a training batch to view attendance."
        }
        columns={
          columns
        }
        data={
          filteredRecords.map(
            (
              record,
            ) =>
              ({
                ...record,
                searchValue:
                  [
                    record.participantName,
                    record.status,
                    record.method,
                    record.id,
                  ]
                    .filter(Boolean)
                    .join(" "),
              }) as AdminAttendanceRecord,
          )
        }
        searchable
        searchPlaceholder="Participant, status, method..."
        showPagination
        emptyTitle={
          isLoadingAttendance
            ? "Loading attendance..."
            : selectedBatchId
              ? "No attendance records found"
              : "Select a training batch"
        }
        emptyDescription={
          isLoadingAttendance
            ? "Fetching attendance records from the server."
            : selectedBatchId
              ? "There are no attendance records for this training batch yet."
              : "Choose a training batch above to load attendance."
        }
        meta={{
          onView:
            handleView,
        }}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search participant..."
                className="h-10 w-full min-w-[220px] rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setSearch(
                  "",
                )
              }
              disabled={
                !search
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        }
      />

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {showDetails &&
        selectedRecord && (
          <AttendanceDetailsModal
            record={
              selectedRecord
            }
            batch={
              selectedBatch
            }
            onClose={() => {
              setShowDetails(
                false,
              );
              setSelectedRecord(
                null,
              );
            }}
          />
        )}
    </div>
  );
}

function AttendanceDetailsModal({
  record,
  batch,
  onClose,
}: {
  record: AttendanceRecordDto;
  batch: TrainingBatch | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ==================================================
            HEADER - FIXED
        ================================================== */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-bold text-gray-900">
              Attendance Details
            </h2>

            <p className="mt-1 font-mono text-xs text-gray-400">
              {record.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ==================================================
            CONTENT - SCROLLABLE
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {/* PARTICIPANT */}

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Participant
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-50 text-sm font-bold text-purple-700">
                  {getInitials(
                    record.participantName,
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-800">
                    {record.participantName}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Attendance ID:{" "}
                    <span className="font-mono">
                      {record.id}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* TRAINING / ATTENDANCE INFO */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCard
                title="Training Batch"
                value={
                  batch
                    ? getBatchLabel(
                        batch,
                      )
                    : "—"
                }
              />

              <InfoCard
                title="Batch ID"
                value={
                  batch?.id ??
                  "—"
                }
              />

              <InfoCard
                title="Time In"
                value={formatDateTime(
                  record.timeIn,
                )}
              />

              <InfoCard
                title="Time Out"
                value={formatDateTime(
                  record.timeOut,
                )}
              />

              <InfoCard
                title="Method"
                value={
                  record.method ||
                  "—"
                }
              />

              <InfoCard
                title="Status"
                value={
                  record.status
                }
              />
            </div>

            {/* STATUS */}

            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Attendance Status
              </p>

              <div className="mt-3">
                <AttendanceBadge
                  status={
                    record.status
                  }
                />
              </div>
            </div>

            {/* EXTRA SPACE FOR MOBILE SCROLL */}

            <div className="h-2" />
          </div>
        </div>

        {/* ==================================================
            FOOTER - FIXED
        ================================================== */}

        <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {title}
      </p>

      <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-gray-800">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function AttendanceBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

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
    "excused"
  ) {
    className =
      "border-blue-200 bg-blue-50 text-blue-700";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

// ============================================================
// HELPERS
// ============================================================

function getInitials(
  name: string,
) {
  return name
    .trim()
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0),
    )
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDateTime(
  value: Date | string | null | undefined,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function getBatchLabel(
  batch: TrainingBatch,
) {
  const item =
    batch as TrainingBatch &
      Record<string, unknown>;

  const programName =
    typeof item.programName ===
    "string"
      ? item.programName
      : typeof item.trainingName ===
          "string"
        ? item.trainingName
        : null;

  const batchCode =
    typeof item.batchCode ===
    "string"
      ? item.batchCode
      : null;

  if (
    programName &&
    batchCode
  ) {
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

function sanitizeFileName(
  value: string,
) {
  return value
    .replace(
      /[^a-z0-9-_]+/gi,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    )
    .toLowerCase();
}