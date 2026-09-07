"use client";

import {
    SetStateAction,
  useMemo,
  useState,
} from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import { columns } from "./columns";

import type {
  ReportRecord,
  ReportType,
} from "./type";

/* =========================================================
   MOCK DATA
========================================================= */

const mockReports: ReportRecord[] = [
  {
    id: "RPT-001",
    participantId: "PT-001",
    participantName: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    enrollmentDate: "August 10, 2026",
    attendance: 18,
    sessions: 20,
    score: 88,
    status: "Passed",
  },

  {
    id: "RPT-002",
    participantId: "PT-002",
    participantName: "Maria Garcia",
    email: "maria.garcia@email.com",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    trainer: "Maria Santos",
    enrollmentDate: "August 11, 2026",
    attendance: 19,
    sessions: 20,
    score: 92,
    status: "Completed",
  },

  {
    id: "RPT-003",
    participantId: "PT-003",
    participantName: "Pedro Reyes",
    email: "pedro.reyes@email.com",
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-01",
    trainer: "John Cruz",
    enrollmentDate: "August 12, 2026",
    attendance: 15,
    sessions: 20,
    score: 68,
    status: "Failed",
  },

  {
    id: "RPT-004",
    participantId: "PT-004",
    participantName: "Ana Mendoza",
    email: "ana.mendoza@email.com",
    training:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Robert Flores",
    enrollmentDate: "August 13, 2026",
    attendance: 17,
    sessions: 20,
    score: 81,
    status: "Active",
  },

  {
    id: "RPT-005",
    participantId: "PT-005",
    participantName: "Mark Villanueva",
    email: "mark.villanueva@email.com",
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-01",
    trainer: "John Cruz",
    enrollmentDate: "August 13, 2026",
    attendance: 20,
    sessions: 20,
    score: 95,
    status: "Passed",
  },

  {
    id: "RPT-006",
    participantId: "PT-006",
    participantName: "Sofia Ramos",
    email: "sofia.ramos@email.com",
    training:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Robert Flores",
    enrollmentDate: "August 14, 2026",
    attendance: 14,
    sessions: 20,
    score: 76,
    status: "Active",
  },

  {
    id: "RPT-007",
    participantId: "PT-007",
    participantName: "Daniel Flores",
    email: "daniel.flores@email.com",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-02",
    trainer: "Maria Santos",
    enrollmentDate: "August 14, 2026",
    attendance: 16,
    sessions: 20,
    score: 84,
    status: "Active",
  },

  {
    id: "RPT-008",
    participantId: "PT-008",
    participantName: "Rachel Cruz",
    email: "rachel.cruz@email.com",
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    trainer: "John Cruz",
    enrollmentDate: "August 15, 2026",
    attendance: 19,
    sessions: 20,
    score: 90,
    status: "Completed",
  },

  {
    id: "RPT-009",
    participantId: "PT-009",
    participantName: "Kevin Santos",
    email: "kevin.santos@email.com",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-02",
    trainer: "Maria Santos",
    enrollmentDate: "August 15, 2026",
    attendance: 10,
    sessions: 20,
    score: 65,
    status: "Failed",
  },

  {
    id: "RPT-010",
    participantId: "PT-010",
    participantName: "Angela Bautista",
    email: "angela.bautista@email.com",
    training:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Robert Flores",
    enrollmentDate: "August 16, 2026",
    attendance: 18,
    sessions: 20,
    score: 87,
    status: "Completed",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ReportsPage() {
  const [reportType, setReportType] =
    useState<ReportType>("Enrollment");

  const [trainingFilter, setTrainingFilter] =
    useState("All Trainings");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [selected, setSelected] =
    useState<ReportRecord | null>(null);

  const trainings = useMemo(
    () => [
      "All Trainings",
      ...Array.from(
        new Set(
          mockReports.map(
            (item) => item.training,
          ),
        ),
      ),
    ],
    [],
  );

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredReports = useMemo(() => {
    return mockReports.filter(
      (record) => {
        const matchesTraining =
          trainingFilter ===
            "All Trainings" ||
          record.training ===
            trainingFilter;

        const matchesStatus =
          statusFilter ===
            "All Status" ||
          record.status ===
            statusFilter;

        return (
          matchesTraining &&
          matchesStatus
        );
      },
    );
  }, [
    trainingFilter,
    statusFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalParticipants =
    filteredReports.length;

  const activeParticipants =
    filteredReports.filter(
      (item) =>
        item.status === "Active",
    ).length;

  const completedParticipants =
    filteredReports.filter(
      (item) =>
        item.status ===
          "Completed" ||
        item.status === "Passed",
    ).length;

  const averageAttendance =
    filteredReports.length > 0
      ? Math.round(
          filteredReports.reduce(
            (total, item) =>
              total +
              (item.attendance /
                item.sessions) *
                100,
            0,
          ) /
            filteredReports.length,
        )
      : 0;

  const averageScore =
    filteredReports.filter(
      (item) =>
        item.score !== null,
    ).length > 0
      ? Math.round(
          filteredReports
            .filter(
              (item) =>
                item.score !== null,
            )
            .reduce(
              (total, item) =>
                total +
                (item.score ?? 0),
              0,
            ) /
              filteredReports.filter(
                (item) =>
                  item.score !==
                  null,
              ).length,
        )
      : 0;

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  function exportCSV() {
    const headers = [
      "Participant ID",
      "Participant",
      "Email",
      "Training",
      "Batch",
      "Trainer",
      "Enrollment Date",
      "Attendance",
      "Sessions",
      "Attendance Rate",
      "Assessment Score",
      "Status",
    ];

    const rows =
      filteredReports.map(
        (record) => {
          const attendanceRate =
            record.sessions > 0
              ? Math.round(
                  (record.attendance /
                    record.sessions) *
                    100,
                )
              : 0;

          return [
            record.participantId,
            record.participantName,
            record.email,
            record.training,
            record.batch,
            record.trainer,
            record.enrollmentDate,
            record.attendance,
            record.sessions,
            `${attendanceRate}%`,
            record.score === null
              ? "N/A"
              : `${record.score}%`,
            record.status,
          ];
        },
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text =
              String(value);

            return `"${text.replace(
              /"/g,
              '""',
            )}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a",
      );

    link.href = url;

    link.download =
      `anci-${reportType.toLowerCase()}-report.csv`;

    document.body.appendChild(
      link,
    );

    link.click();

    document.body.removeChild(
      link,
    );

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <span>Administration</span>
          <span>/</span>
          <span className="font-medium text-gray-600">
            Reports
          </span>
        </div>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
              Reports
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Generate and review training
              management reports for
              participants, attendance,
              assessments, and training
              operations.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#191c1e] px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Export CSV
          </button>

        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <StatGrid>

        <StatCard
          title="Total Participants"
          value={totalParticipants}
          description="Participants in current report"
        />

        <StatCard
          title="Active Participants"
          value={activeParticipants}
          description="Currently undergoing training"
        />

        <StatCard
          title="Completed"
          value={completedParticipants}
          description="Completed or passed"
        />

        <StatCard
          title="Attendance Rate"
          value={`${averageAttendance}%`}
          description="Average attendance"
        />

        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          description="Average assessment score"
        />

      </StatGrid>

      {/* =====================================================
          REPORT FILTERS
      ===================================================== */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">
            Report Filters
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Filter the report data before
            exporting.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          {/* REPORT TYPE */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(event) =>
                setReportType(
                  event.target.value as ReportType,
                )
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
            >
              <option value="Enrollment">
                Enrollment
              </option>

              <option value="Training">
                Training
              </option>

              <option value="Attendance">
                Attendance
              </option>

              <option value="Assessment">
                Assessment
              </option>

              <option value="Trainer">
                Trainer
              </option>
            </select>
          </div>

          {/* TRAINING */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Training
            </label>

            <select
              value={trainingFilter}
              onChange={(event) =>
                setTrainingFilter(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
            >
              {trainings.map(
                (training) => (
                  <option
                    key={training}
                    value={training}
                  >
                    {training}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
            >
              <option value="All Status">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Passed">
                Passed
              </option>

              <option value="Failed">
                Failed
              </option>

              <option value="Pending">
                Pending
              </option>
            </select>
          </div>

          {/* DATE FROM */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Date From
            </label>

            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
            />
          </div>

          {/* DATE TO */}

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Date To
            </label>

            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-gray-400"
            />
          </div>

        </div>

      </section>

      {/* =====================================================
          REPORT TABLE
      ===================================================== */}

      <DataTable
        title={`${reportType} Report`}
        description={`Showing ${filteredReports.length} records based on the selected filters.`}
        columns={columns}
        data={filteredReports}
        searchable
        searchPlaceholder="Search participant, training, or trainer..."
        meta={{
          onView: (record: SetStateAction<ReportRecord | null>) =>
            setSelected(record),
        }}
      />

      {/* =====================================================
          VIEW REPORT MODAL
      ===================================================== */}

      {selected && (
        <ReportDetailsModal
          record={selected}
          onClose={() =>
            setSelected(null)
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   REPORT DETAILS MODAL
========================================================= */

function ReportDetailsModal({
  record,
  onClose,
}: {
  record: ReportRecord;
  onClose: () => void;
}) {
  const attendanceRate =
    record.sessions > 0
      ? Math.round(
          (record.attendance /
            record.sessions) *
            100,
        )
      : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">

      <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Report Record
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Participant Details
            </h2>

            <p className="mt-1 font-mono text-[10px] text-gray-400">
              {record.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        {/* SCROLLABLE CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

          {/* PARTICIPANT */}

          <div className="rounded-2xl bg-gray-50 p-4">

            <p className="text-lg font-bold text-gray-900">
              {record.participantName}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {record.participantId}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {record.email}
            </p>

          </div>

          {/* TRAINING */}

          <div className="mt-6">

            <h3 className="text-sm font-bold text-gray-900">
              Training Information
            </h3>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">

              <ReportInfo
                label="Training"
                value={record.training}
              />

              <ReportInfo
                label="Batch"
                value={record.batch}
              />

              <ReportInfo
                label="Trainer"
                value={record.trainer}
              />

              <ReportInfo
                label="Enrollment Date"
                value={record.enrollmentDate}
              />

            </div>

          </div>

          {/* ATTENDANCE */}

          <div className="mt-6 rounded-2xl border border-gray-200 p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-bold">
                  Attendance
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {record.attendance} of{" "}
                  {record.sessions} sessions
                </p>
              </div>

              <span className="text-xl font-bold">
                {attendanceRate}%
              </span>

            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-[#191c1e]"
                style={{
                  width: `${attendanceRate}%`,
                }}
              />

            </div>

          </div>

          {/* ASSESSMENT */}

          <div className="mt-4 rounded-2xl border border-gray-200 p-4">

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Assessment
            </p>

            <div className="mt-3 flex items-center justify-between">

              <span className="text-sm font-semibold">
                Final Score
              </span>

              <span
                className={`text-xl font-bold ${
                  record.score !== null &&
                  record.score >= 75
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {record.score === null
                  ? "Not Taken"
                  : `${record.score}%`}
              </span>

            </div>

          </div>

          {/* STATUS */}

          <div className="mt-4 rounded-2xl border border-gray-200 p-4">

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Current Status
            </p>

            <p className="mt-2 text-sm font-bold text-gray-900">
              {record.status}
            </p>

          </div>

        </div>

        {/* FOOTER */}

        <div className="shrink-0 border-t border-gray-200 px-5 py-4">

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   INFO COMPONENT
========================================================= */

function ReportInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-5 text-gray-900">
        {value}
      </p>
    </div>
  );
}