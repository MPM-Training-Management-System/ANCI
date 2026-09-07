"use client";

import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type TrainingOption = {
  name: string;
  code: string;
};

type ExamStatus =
  | "Passed"
  | "Failed"
  | "Pending";

type FinalStatus =
  | "Passed"
  | "Failed"
  | "Pending";

type ParticipantReport = {
  id: string;
  participantId: string;
  participantName: string;
  email: string;

  training: string;
  trainingCode: string;

  /* =========================
     ATTENDANCE
  ========================= */

  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;

  attendanceRate: number;

  /* =========================
     ASSESSMENTS
  ========================= */

  assessmentsCompleted: number;
  totalAssessments: number;

  assessmentAverage: number;

  /* =========================
     EXAM
  ========================= */

  examScore: number | null;

  examStatus: ExamStatus;

  /* =========================
     FINAL
  ========================= */

  finalStatus: FinalStatus;

  lastAttendance: string;
  lastAssessment: string;
  examDate: string | null;
};

/* =========================================================
   TRAININGS
========================================================= */

const trainingOptions: TrainingOption[] = [
  {
    name: "Computer Systems Servicing NC II",
    code: "CSS-NCII",
  },
  {
    name: "Electrical Installation and Maintenance NC II",
    code: "EIM-NCII",
  },
  {
    name: "Web Development Fundamentals",
    code: "WEB-DEV",
  },
];

/* =========================================================
   REQUIREMENTS
========================================================= */

const ATTENDANCE_PASSING = 80;
const ASSESSMENT_PASSING = 75;
const EXAM_PASSING = 75;

/* =========================================================
   MOCK DATA
========================================================= */

const initialReports: ParticipantReport[] = [
  {
    id: "RPT-001",

    participantId: "P-001",

    participantName: "Angela Bautista",

    email: "angela.bautista@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 20,

    late: 3,

    absent: 1,

    excused: 1,

    attendanceRate: 92,

    assessmentsCompleted: 3,

    totalAssessments: 3,

    assessmentAverage: 88,

    examScore: 91,

    examStatus: "Passed",

    finalStatus: "Passed",

    lastAttendance:
      "August 17, 2026",

    lastAssessment:
      "August 16, 2026",

    examDate:
      "August 17, 2026",
  },

  {
    id: "RPT-002",

    participantId: "P-002",

    participantName: "Juan Dela Cruz",

    email: "juan.delacruz@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 18,

    late: 3,

    absent: 3,

    excused: 1,

    attendanceRate: 84,

    assessmentsCompleted: 2,

    totalAssessments: 3,

    assessmentAverage: 76,

    examScore: null,

    examStatus: "Pending",

    finalStatus: "Pending",

    lastAttendance:
      "August 17, 2026",

    lastAssessment:
      "August 15, 2026",

    examDate: null,
  },

  {
    id: "RPT-003",

    participantId: "P-003",

    participantName: "Maria Santos",

    email: "maria.santos@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 22,

    late: 2,

    absent: 1,

    excused: 0,

    attendanceRate: 96,

    assessmentsCompleted: 3,

    totalAssessments: 3,

    assessmentAverage: 91,

    examScore: 89,

    examStatus: "Passed",

    finalStatus: "Passed",

    lastAttendance:
      "August 17, 2026",

    lastAssessment:
      "August 16, 2026",

    examDate:
      "August 17, 2026",
  },

  {
    id: "RPT-004",

    participantId: "P-004",

    participantName: "Pedro Garcia",

    email: "pedro.garcia@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 16,

    late: 2,

    absent: 6,

    excused: 1,

    attendanceRate: 72,

    assessmentsCompleted: 3,

    totalAssessments: 3,

    assessmentAverage: 68,

    examScore: 64,

    examStatus: "Failed",

    finalStatus: "Failed",

    lastAttendance:
      "August 16, 2026",

    lastAssessment:
      "August 16, 2026",

    examDate:
      "August 16, 2026",
  },

  {
    id: "RPT-005",

    participantId: "P-005",

    participantName: "Carlo Mendoza",

    email: "carlo.mendoza@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 21,

    late: 2,

    absent: 1,

    excused: 1,

    attendanceRate: 94,

    assessmentsCompleted: 3,

    totalAssessments: 3,

    assessmentAverage: 85,

    examScore: 84,

    examStatus: "Passed",

    finalStatus: "Passed",

    lastAttendance:
      "August 17, 2026",

    lastAssessment:
      "August 15, 2026",

    examDate:
      "August 17, 2026",
  },

  {
    id: "RPT-006",

    participantId: "P-006",

    participantName: "Sofia Reyes",

    email: "sofia.reyes@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 19,

    late: 3,

    absent: 2,

    excused: 1,

    attendanceRate: 88,

    assessmentsCompleted: 3,

    totalAssessments: 3,

    assessmentAverage: 79,

    examScore: 77,

    examStatus: "Passed",

    finalStatus: "Passed",

    lastAttendance:
      "August 17, 2026",

    lastAssessment:
      "August 16, 2026",

    examDate:
      "August 17, 2026",
  },

  {
    id: "RPT-007",

    participantId: "P-007",

    participantName: "Daniel Flores",

    email: "daniel.flores@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 17,

    late: 2,

    absent: 5,

    excused: 1,

    attendanceRate: 76,

    assessmentsCompleted: 2,

    totalAssessments: 3,

    assessmentAverage: 71,

    examScore: null,

    examStatus: "Pending",

    finalStatus: "Pending",

    lastAttendance:
      "August 15, 2026",

    lastAssessment:
      "August 14, 2026",

    examDate: null,
  },

  {
    id: "RPT-008",

    participantId: "P-008",

    participantName: "Rafael Navarro",

    email: "rafael.navarro@email.com",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    totalSessions: 25,

    present: 22,

    late: 1,

    absent: 1,

    excused: 1,

    attendanceRate: 96,

    assessmentsCompleted: 3,

    totalAssessments: 3,

    assessmentAverage: 94,

    examScore: 96,

    examStatus: "Passed",

    finalStatus: "Passed",

    lastAttendance:
      "August 17, 2026",

    lastAssessment:
      "August 16, 2026",

    examDate:
      "August 17, 2026",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TrainerReportsPage() {
  const [selectedTraining, setSelectedTraining] =
    useState(
      "Computer Systems Servicing NC II",
    );

  const [reports] =
    useState<ParticipantReport[]>(
      initialReports,
    );

  const [search, setSearch] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("2026-08-01");

  const [dateTo, setDateTo] =
    useState("2026-08-17");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | FinalStatus
    >("All");

  const [selectedParticipant, setSelectedParticipant] =
    useState<ParticipantReport | null>(
      null,
    );

  /* =======================================================
     FILTERED REPORTS
  ======================================================= */

  const filteredReports =
    useMemo(() => {
      const query =
        search.toLowerCase().trim();

      return reports
        .filter(
          (report) =>
            report.training ===
            selectedTraining,
        )
        .filter((report) => {
          if (!query) {
            return true;
          }

          return (
            report.participantName
              .toLowerCase()
              .includes(query) ||
            report.email
              .toLowerCase()
              .includes(query) ||
            report.participantId
              .toLowerCase()
              .includes(query)
          );
        })
        .filter((report) => {
          if (
            statusFilter ===
            "All"
          ) {
            return true;
          }

          return (
            report.finalStatus ===
            statusFilter
          );
        })
        .sort((a, b) =>
          getLastName(
            a.participantName,
          ).localeCompare(
            getLastName(
              b.participantName,
            ),
            undefined,
            {
              sensitivity:
                "base",
            },
          ),
        );
    }, [
      reports,
      selectedTraining,
      search,
      statusFilter,
    ]);

  /* =======================================================
     ATTENDANCE SUMMARY
  ======================================================= */

  const totalParticipants =
    filteredReports.length;

  const totalSessions =
    filteredReports.reduce(
      (sum, report) =>
        sum +
        report.totalSessions,
      0,
    );

  const totalPresent =
    filteredReports.reduce(
      (sum, report) =>
        sum + report.present,
      0,
    );

  const totalLate =
    filteredReports.reduce(
      (sum, report) =>
        sum + report.late,
      0,
    );

  const totalAbsent =
    filteredReports.reduce(
      (sum, report) =>
        sum + report.absent,
      0,
    );

  const totalExcused =
    filteredReports.reduce(
      (sum, report) =>
        sum + report.excused,
      0,
    );

  const attendanceRate =
    totalSessions > 0
      ? Math.round(
          ((totalPresent +
            totalLate) /
            totalSessions) *
            100,
        )
      : 0;

  /* =======================================================
     ASSESSMENT SUMMARY
  ======================================================= */

  const assessmentAverage =
    filteredReports.length > 0
      ? Math.round(
          filteredReports.reduce(
            (sum, report) =>
              sum +
              report.assessmentAverage,
            0,
          ) /
            filteredReports.length,
        )
      : 0;

  const passedCount =
    filteredReports.filter(
      (report) =>
        report.finalStatus ===
        "Passed",
    ).length;

  const failedCount =
    filteredReports.filter(
      (report) =>
        report.finalStatus ===
        "Failed",
    ).length;

  const pendingCount =
    filteredReports.filter(
      (report) =>
        report.finalStatus ===
        "Pending",
    ).length;

  const assessmentCompleted =
    filteredReports.filter(
      (report) =>
        report.assessmentsCompleted ===
        report.totalAssessments,
    ).length;

  const assessmentCompletionRate =
    filteredReports.length > 0
      ? Math.round(
          (assessmentCompleted /
            filteredReports.length) *
            100,
        )
      : 0;

  /* =======================================================
     EXAM SUMMARY
  ======================================================= */

  const examPassed =
    filteredReports.filter(
      (report) =>
        report.examStatus ===
        "Passed",
    ).length;

  const examFailed =
    filteredReports.filter(
      (report) =>
        report.examStatus ===
        "Failed",
    ).length;

  const examPending =
    filteredReports.filter(
      (report) =>
        report.examStatus ===
        "Pending",
    ).length;

  const examAverage =
    filteredReports.filter(
      (report) =>
        report.examScore !==
        null,
    ).length > 0
      ? Math.round(
          filteredReports
            .filter(
              (report) =>
                report.examScore !==
                null,
            )
            .reduce(
              (sum, report) =>
                sum +
                (report.examScore ??
                  0),
              0,
            ) /
            filteredReports.filter(
              (report) =>
                report.examScore !==
                null,
            ).length,
        )
      : 0;

  /* =======================================================
     RESET
  ======================================================= */

  function resetFilters() {
    setSearch("");

    setStatusFilter(
      "All",
    );

    setDateFrom(
      "2026-08-01",
    );

    setDateTo(
      "2026-08-17",
    );
  }

  /* =======================================================
     EXPORT
  ======================================================= */

  function exportReport() {
    const headers = [
      "Participant ID",
      "Participant Name",
      "Email",
      "Training",
      "Attendance Rate",
      "Present",
      "Late",
      "Absent",
      "Excused",
      "Assessments Completed",
      "Total Assessments",
      "Assessment Average",
      "Exam Score",
      "Exam Status",
      "Final Status",
    ];

    const rows =
      filteredReports.map(
        (report) => [
          report.participantId,
          report.participantName,
          report.email,
          report.training,
          `${report.attendanceRate}%`,
          report.present,
          report.late,
          report.absent,
          report.excused,
          report.assessmentsCompleted,
          report.totalAssessments,
          `${report.assessmentAverage}%`,
          report.examScore ===
          null
            ? "Pending"
            : `${report.examScore}%`,
          report.examStatus,
          report.finalStatus,
        ],
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value,
              ).replaceAll(
                '"',
                '""',
              )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type: "text/csv;charset=utf-8;",
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

    link.download =
      "trainer-report.csv";

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
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">

            <span>
              Trainer
            </span>

            <span>/</span>

            <span className="font-medium text-gray-600">
              Reports
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Reports
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Review participant attendance,
            assessments, examination results,
            and final training outcomes.
          </p>

        </div>

        <button
          type="button"
          onClick={
            exportReport
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#191c1e] px-4 text-[11px] font-semibold text-white transition hover:opacity-90"
        >
          <span className="text-sm">
            ↓
          </span>

          Export Report
        </button>

      </div>

      {/* =================================================
          TRAINING / DATE FILTER
      ================================================= */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

          {/* TRAINING */}

          <div>

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Training Program
            </label>

            <select
              value={
                selectedTraining
              }
              onChange={(
                event,
              ) => {
                setSelectedTraining(
                  event.target
                    .value,
                );

                setSearch(
                  "",
                );

                setStatusFilter(
                  "All",
                );
              }}
              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
            >

              {trainingOptions.map(
                (
                  training,
                ) => (
                  <option
                    key={
                      training.code
                    }
                    value={
                      training.name
                    }
                  >
                    {
                      training.name
                    }
                  </option>
                ),
              )}

            </select>

          </div>

          {/* DATE FROM */}

          <div>

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Date From
            </label>

            <input
              type="date"
              value={
                dateFrom
              }
              onChange={(
                event,
              ) =>
                setDateFrom(
                  event
                    .target
                    .value,
                )
              }
              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
            />

          </div>

          {/* DATE TO */}

          <div>

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Date To
            </label>

            <input
              type="date"
              value={
                dateTo
              }
              onChange={(
                event,
              ) =>
                setDateTo(
                  event
                    .target
                    .value,
                )
              }
              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
            />

          </div>

          {/* RESET */}

          <div className="flex items-end">

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="h-11 w-full rounded-xl border border-[#e7e9ec] px-4 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50 lg:w-auto"
            >
              Reset
            </button>

          </div>

        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">

          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[9px] font-semibold text-gray-500">
            Report Period
          </span>

          <span className="text-[10px] text-gray-400">
            {formatDate(
              dateFrom,
            )}{" "}
            —{" "}
            {formatDate(
              dateTo,
            )}
          </span>

        </div>

      </section>

      {/* =================================================
          MAIN SUMMARY
      ================================================= */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <SummaryCard
          label="Participants"
          value={
            totalParticipants
          }
          description="Current training"
        />

        <SummaryCard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          description="Present + Late"
          type="success"
        />

        <SummaryCard
          label="Assessment Average"
          value={`${assessmentAverage}%`}
          description="Trainer assessments"
        />

        <SummaryCard
          label="Final Passed"
          value={
            passedCount
          }
          description="Qualified participants"
          type="success"
        />

      </div>

      {/* =================================================
          ATTENDANCE SUMMARY
      ================================================= */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="mb-5">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Attendance Summary
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Attendance records for the
                selected training period.
              </p>

            </div>

            <span className="text-[9px] font-semibold text-gray-400">
              Minimum required:{" "}
              {
                ATTENDANCE_PASSING
              }
              %
            </span>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <AttendanceCard
            label="Present"
            value={
              totalPresent
            }
            type="present"
          />

          <AttendanceCard
            label="Late"
            value={
              totalLate
            }
            type="late"
          />

          <AttendanceCard
            label="Absent"
            value={
              totalAbsent
            }
            type="absent"
          />

          <AttendanceCard
            label="Excused"
            value={
              totalExcused
            }
            type="excused"
          />

        </div>

      </section>

      {/* =================================================
          ASSESSMENT + EXAM SUMMARY
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ASSESSMENT */}

        <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

          <div className="mb-5">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-sm font-bold">
                  Assessment Summary
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Trainer-created assessments.
                </p>

              </div>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                Passing:{" "}
                {
                  ASSESSMENT_PASSING
                }
                %
              </span>

            </div>

          </div>

          <div className="grid grid-cols-3 gap-3">

            <SmallSummaryCard
              label="Completed"
              value={`${assessmentCompleted}/${totalParticipants}`}
              description="Participants"
            />

            <SmallSummaryCard
              label="Average"
              value={`${assessmentAverage}%`}
              description="Average score"
              type="success"
            />

            <SmallSummaryCard
              label="Completion"
              value={`${assessmentCompletionRate}%`}
              description="Completion rate"
            />

          </div>

        </section>

        {/* EXAM */}

        <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

          <div className="mb-5">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-sm font-bold">
                  Exam Summary
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Final examination results.
                </p>

              </div>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                Passing:{" "}
                {EXAM_PASSING}%
              </span>

            </div>

          </div>

          <div className="grid grid-cols-4 gap-3">

            <SmallSummaryCard
              label="Passed"
              value={
                examPassed
              }
              description="Participants"
              type="success"
            />

            <SmallSummaryCard
              label="Failed"
              value={
                examFailed
              }
              description="Participants"
              type="danger"
            />

            <SmallSummaryCard
              label="Pending"
              value={
                examPending
              }
              description="Participants"
              type="warning"
            />

            <SmallSummaryCard
              label="Average"
              value={`${examAverage}%`}
              description="Exam score"
            />

          </div>

        </section>

      </div>

      {/* =================================================
          FINAL RESULT RULE
      ================================================= */}

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
            ✓
          </div>

          <div>

            <h2 className="text-sm font-bold text-emerald-900">
              Final Result Criteria
            </h2>

            <p className="mt-1 text-[10px] leading-5 text-emerald-700">
              A participant is marked as{" "}
              <strong>
                Passed
              </strong>{" "}
              when all required training
              conditions are satisfied.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">

              <RequirementBadge
                label={`Attendance ≥ ${ATTENDANCE_PASSING}%`}
              />

              <RequirementBadge
                label="All assessments completed"
              />

              <RequirementBadge
                label={`Assessment average ≥ ${ASSESSMENT_PASSING}%`}
              />

              <RequirementBadge
                label={`Exam score ≥ ${EXAM_PASSING}%`}
              />

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          PARTICIPANT PERFORMANCE
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

        {/* HEADER */}

        <div className="border-b border-[#eef0f2] p-5">

          <div className="flex flex-col gap-4">

            <div>

              <h2 className="text-sm font-bold">
                Participant Performance
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Attendance, assessments, exam,
                and final training result.
              </p>

            </div>

            {/* SEARCH + FILTER */}

            <div className="flex flex-col gap-2 md:flex-row">

              <div className="relative min-w-0 flex-1 md:max-w-sm">

                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ⌕
                </span>

                <input
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Search participant..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-9 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch(
                        "",
                      )
                    }
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-gray-200"
                  >
                    ×
                  </button>
                )}

              </div>

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event
                      .target
                      .value as
                      | "All"
                      | FinalStatus,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >

                <option value="All">
                  All Final Status
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

            {(search ||
              statusFilter !==
                "All") && (
              <div className="flex items-center gap-2">

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                  {
                    filteredReports.length
                  }{" "}
                  result
                  {
                    filteredReports.length !==
                    1
                      ? "s"
                      : ""
                  }
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSearch(
                      "",
                    );

                    setStatusFilter(
                      "All",
                    );
                  }}
                  className="text-[10px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-800"
                >
                  Clear filters
                </button>

              </div>
            )}

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1250px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Participant
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Attendance
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Assessments
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Assessment Avg.
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Exam
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Final Result
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Details
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#eef0f2]">

              {filteredReports.map(
                (report) => (
                  <tr
                    key={
                      report.id
                    }
                    className="transition hover:bg-[#fafbfc]"
                  >

                    {/* PARTICIPANT */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-bold text-gray-600">
                          {getInitials(
                            report.participantName,
                          )}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-xs font-semibold">
                            {
                              report.participantName
                            }
                          </p>

                          <p className="mt-1 truncate text-[9px] text-gray-400">
                            {
                              report.participantId
                            }{" "}
                            ·{" "}
                            {
                              report.email
                            }
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* ATTENDANCE */}

                    <td className="px-5 py-4 text-center">

                      <p
                        className={`text-sm font-bold ${
                          report.attendanceRate >=
                          ATTENDANCE_PASSING
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {
                          report.attendanceRate
                        }
                        %
                      </p>

                      <div className="mt-1 flex items-center justify-center gap-1.5 text-[9px]">

                        <span className="font-semibold text-emerald-600">
                          P{" "}
                          {
                            report.present
                          }
                        </span>

                        <span className="text-gray-300">
                          ·
                        </span>

                        <span className="font-semibold text-amber-600">
                          L{" "}
                          {
                            report.late
                          }
                        </span>

                        <span className="text-gray-300">
                          ·
                        </span>

                        <span className="font-semibold text-red-500">
                          A{" "}
                          {
                            report.absent
                          }
                        </span>

                      </div>

                    </td>

                    {/* ASSESSMENTS */}

                    <td className="px-5 py-4 text-center">

                      <p className="text-xs font-bold">
                        {
                          report.assessmentsCompleted
                        }
                        /
                        {
                          report.totalAssessments
                        }
                      </p>

                      <p className="mt-1 text-[9px] text-gray-400">
                        completed
                      </p>

                    </td>

                    {/* ASSESSMENT AVERAGE */}

                    <td className="px-5 py-4 text-center">

                      <span
                        className={`text-sm font-bold ${
                          report.assessmentAverage >=
                          ASSESSMENT_PASSING
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {
                          report.assessmentAverage
                        }
                        %
                      </span>

                    </td>

                    {/* EXAM */}

                    <td className="px-5 py-4 text-center">

                      {report.examScore ===
                      null ? (
                        <ExamStatusBadge
                          status={
                            "Pending"
                          }
                        />
                      ) : (
                        <div>

                          <p
                            className={`text-sm font-bold ${
                              report.examScore >=
                              EXAM_PASSING
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {
                              report.examScore
                            }
                            %
                          </p>

                          <p className="mt-1 text-[9px] text-gray-400">
                            {
                              report.examStatus
                            }
                          </p>

                        </div>
                      )}

                    </td>

                    {/* FINAL */}

                    <td className="px-5 py-4 text-center">

                      <FinalStatusBadge
                        status={
                          report.finalStatus
                        }
                      />

                    </td>

                    {/* DETAILS */}

                    <td className="px-5 py-4 text-right">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedParticipant(
                            report,
                          )
                        }
                        className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        View
                      </button>

                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>

        {/* EMPTY */}

        {filteredReports.length ===
          0 && (
          <EmptyResults />
        )}

        {/* FOOTER */}

        <div className="flex flex-col gap-2 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] text-gray-400">
            Participants are sorted
            alphabetically by last name.
          </p>

          <p className="text-[10px] font-medium text-gray-500">
            {
              filteredReports.length
            }{" "}
            displayed
          </p>

        </div>

      </section>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
            i
          </div>

          <div>

            <h3 className="text-xs font-bold">
              Report Information
            </h3>

            <p className="mt-1 max-w-3xl text-[10px] leading-5 text-gray-500">
              This report is limited to
              training programs assigned to
              the current trainer. Attendance,
              trainer-created assessments, and
              examination results are combined
              to determine the participant's
              final training result.
            </p>

          </div>

        </div>

      </section>

      {/* =================================================
          PARTICIPANT DETAIL MODAL
      ================================================= */}

      {selectedParticipant && (
        <ParticipantReportModal
          report={
            selectedParticipant
          }
          onClose={() =>
            setSelectedParticipant(
              null,
            )
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  description,
  type,
}: {
  label: string;
  value: string | number;
  description: string;
  type?: "success";
}) {
  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

      <p className="text-[11px] font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          type === "success"
            ? "text-emerald-600"
            : "text-[#191c1e]"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-gray-400">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   ATTENDANCE CARD
========================================================= */

function AttendanceCard({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type:
    | "present"
    | "late"
    | "absent"
    | "excused";
}) {
  const styles = {
    present: {
      wrapper:
        "bg-emerald-50 border-emerald-100",
      text: "text-emerald-700",
    },

    late: {
      wrapper:
        "bg-amber-50 border-amber-100",
      text: "text-amber-700",
    },

    absent: {
      wrapper:
        "bg-red-50 border-red-100",
      text: "text-red-600",
    },

    excused: {
      wrapper:
        "bg-blue-50 border-blue-100",
      text: "text-blue-700",
    },
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${styles[type].wrapper}`}
    >

      <p className="text-[10px] font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${styles[type].text}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-gray-400">
        attendance records
      </p>

    </div>
  );
}

/* =========================================================
   SMALL SUMMARY
========================================================= */

function SmallSummaryCard({
  label,
  value,
  description,
  type,
}: {
  label: string;
  value: string | number;
  description: string;
  type?:
    | "success"
    | "danger"
    | "warning";
}) {
  const textStyles = {
    success:
      "text-emerald-600",

    danger:
      "text-red-500",

    warning:
      "text-amber-600",
  };

  return (
    <div className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

      <p className="text-[9px] font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${
          type
            ? textStyles[type]
            : "text-[#191c1e]"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-gray-400">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   REQUIREMENT BADGE
========================================================= */

function RequirementBadge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-emerald-700">
      ✓ {label}
    </span>
  );
}

/* =========================================================
   EXAM STATUS
========================================================= */

function ExamStatusBadge({
  status,
}: {
  status: ExamStatus;
}) {
  if (status === "Passed") {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
        Passed
      </span>
    );
  }

  if (status === "Failed") {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-bold text-red-600">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
      Pending
    </span>
  );
}

/* =========================================================
   FINAL STATUS
========================================================= */

function FinalStatusBadge({
  status,
}: {
  status: FinalStatus;
}) {
  if (status === "Passed") {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
        Passed
      </span>
    );
  }

  if (status === "Failed") {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-bold text-red-600">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
      Pending
    </span>
  );
}

/* =========================================================
   PARTICIPANT DETAIL MODAL
========================================================= */

function ParticipantReportModal({
  report,
  onClose,
}: {
  report: ParticipantReport;
  onClose: () => void;
}) {
  const attendancePassed =
    report.attendanceRate >=
    ATTENDANCE_PASSING;

  const assessmentCompleted =
    report.assessmentsCompleted ===
    report.totalAssessments;

  const assessmentPassed =
    report.assessmentAverage >=
    ASSESSMENT_PASSING;

  const examPassed =
    report.examScore !== null &&
    report.examScore >=
      EXAM_PASSING;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <FinalStatusBadge
                status={
                  report.finalStatus
                }
              />

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                {report.trainingCode}
              </span>

            </div>

            <h2 className="mt-3 text-lg font-bold">
              {
                report.participantName
              }
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {
                report.participantId
              }{" "}
              ·{" "}
              {
                report.email
              }
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          {/* OVERALL */}

          <div className="rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-5">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Final Training Result
                </p>

                <p className="mt-1 text-xl font-bold">
                  {
                    report.finalStatus
                  }
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  Based on attendance,
                  assessments, and exam.
                </p>

              </div>

              <FinalStatusBadge
                status={
                  report.finalStatus
                }
              />

            </div>

          </div>

          {/* ATTENDANCE */}

          <div className="mt-6">

            <div className="flex items-end justify-between">

              <div>

                <h3 className="text-sm font-bold">
                  Attendance
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Required:{" "}
                  {
                    ATTENDANCE_PASSING
                  }
                  %
                </p>

              </div>

              <p
                className={`text-xl font-bold ${
                  attendancePassed
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {
                  report.attendanceRate
                }
                %
              </p>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <DetailStat
                label="Present"
                value={
                  report.present
                }
                type="success"
              />

              <DetailStat
                label="Late"
                value={
                  report.late
                }
                type="warning"
              />

              <DetailStat
                label="Absent"
                value={
                  report.absent
                }
                type="danger"
              />

              <DetailStat
                label="Excused"
                value={
                  report.excused
                }
                type="info"
              />

            </div>

            <RequirementRow
              label={`Attendance requirement ≥ ${ATTENDANCE_PASSING}%`}
              passed={
                attendancePassed
              }
            />

          </div>

          {/* ASSESSMENTS */}

          <div className="mt-7">

            <div className="flex items-end justify-between">

              <div>

                <h3 className="text-sm font-bold">
                  Assessments
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Trainer-created assessments.
                </p>

              </div>

              <p
                className={`text-xl font-bold ${
                  assessmentPassed
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {
                  report.assessmentAverage
                }
                %
              </p>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">

              <DetailStat
                label="Completed"
                value={`${report.assessmentsCompleted}/${report.totalAssessments}`}
              />

              <DetailStat
                label="Average Score"
                value={`${report.assessmentAverage}%`}
                type={
                  assessmentPassed
                    ? "success"
                    : "danger"
                }
              />

            </div>

            <div className="mt-3 space-y-2">

              <RequirementRow
                label="All required assessments completed"
                passed={
                  assessmentCompleted
                }
              />

              <RequirementRow
                label={`Assessment average ≥ ${ASSESSMENT_PASSING}%`}
                passed={
                  assessmentPassed
                }
              />

            </div>

          </div>

          {/* EXAM */}

          <div className="mt-7">

            <div className="flex items-end justify-between">

              <div>

                <h3 className="text-sm font-bold">
                  Final Examination
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Required passing score:{" "}
                  {
                    EXAM_PASSING
                  }
                  %
                </p>

              </div>

              {report.examScore !==
              null ? (
                <p
                  className={`text-xl font-bold ${
                    examPassed
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {
                    report.examScore
                  }
                  %
                </p>
              ) : (
                <ExamStatusBadge
                  status="Pending"
                />
              )}

            </div>

            <div className="mt-4 rounded-2xl border border-[#e7e9ec] p-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold">
                    Exam Result
                  </p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    {report.examDate
                      ? `Taken on ${report.examDate}`
                      : "Exam has not been completed."}
                  </p>

                </div>

                <ExamStatusBadge
                  status={
                    report.examStatus
                  }
                />

              </div>

              <div className="mt-4">

                <RequirementRow
                  label={`Exam score ≥ ${EXAM_PASSING}%`}
                  passed={
                    examPassed
                  }
                />

              </div>

            </div>

          </div>

          {/* FINAL REQUIREMENTS */}

          <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">

            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              Final Evaluation
            </p>

            <div className="mt-3 space-y-2">

              <RequirementRow
                label="Attendance qualified"
                passed={
                  attendancePassed
                }
              />

              <RequirementRow
                label="Assessments completed"
                passed={
                  assessmentCompleted
                }
              />

              <RequirementRow
                label="Assessment average qualified"
                passed={
                  assessmentPassed
                }
              />

              <RequirementRow
                label="Exam passed"
                passed={
                  examPassed
                }
              />

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL STAT
========================================================= */

function DetailStat({
  label,
  value,
  type,
}: {
  label: string;
  value: string | number;
  type?:
    | "success"
    | "warning"
    | "danger"
    | "info";
}) {
  const styles = {
    success:
      "bg-emerald-50 text-emerald-700",

    warning:
      "bg-amber-50 text-amber-700",

    danger:
      "bg-red-50 text-red-600",

    info:
      "bg-blue-50 text-blue-700",
  };

  return (
    <div
      className={`rounded-xl p-4 ${
        type
          ? styles[type]
          : "bg-[#f8f9fa] text-gray-700"
      }`}
    >

      <p className="text-[9px] font-medium opacity-70">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   REQUIREMENT ROW
========================================================= */

function RequirementRow({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/70 bg-white px-3 py-2.5">

      <span className="text-[10px] font-medium text-gray-600">
        {label}
      </span>

      {passed ? (
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
          ✓ Met
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[9px] font-bold text-red-600">
          ✕ Not Met
        </span>
      )}

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyResults() {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ?
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No report data found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your search or status
        filter.
      </p>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getLastName(
  fullName: string,
) {
  const parts =
    fullName
      .trim()
      .split(/\s+/);

  return (
    parts[
      parts.length - 1
    ] ?? ""
  );
}

function getInitials(
  fullName: string,
) {
  const parts =
    fullName
      .trim()
      .split(/\s+/);

  if (parts.length === 1) {
    return (
      parts[0]?.charAt(0) ??
      "?"
    ).toUpperCase();
  }

  const first =
    parts[0]?.charAt(0) ??
    "";

  const last =
    parts[
      parts.length - 1
    ]?.charAt(0) ?? "";

  return `${first}${last}`.toUpperCase();
}

function formatDate(
  date: string,
) {
  if (!date) {
    return "—";
  }

  const parsed =
    new Date(
      `${date}T00:00:00`,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}