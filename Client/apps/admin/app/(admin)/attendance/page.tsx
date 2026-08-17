"use client";

import { useMemo, useState } from "react";

type SubmissionStatus =
  | "Draft"
  | "Submitted"
  | "Verified"
  | "Returned";

type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Excused";

type AttendanceMethod = "QR" | "Manual";

type AttendanceRecord = {
  id: string;
  participantId: string;
  participantName: string;
  timeIn: string;
  timeOut: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  remarks: string;
};

type AttendanceSubmission = {
  id: string;
  trainingId: string;
  trainingName: string;
  sessionId: string;
  sessionName: string;
  date: string;

  trainerId: string;
  trainerName: string;

  submittedAt: string | null;
  submittedBy: string | null;

  status: SubmissionStatus;
  remarks: string;

  records: AttendanceRecord[];
};

/* =========================================================
   MOCK DATA
========================================================= */

const mockSubmissions: AttendanceSubmission[] = [
  {
    id: "AS-001",
    trainingId: "TRN-001",
    trainingName: "Computer Systems Servicing NC II",
    sessionId: "SES-001",
    sessionName: "Session 1 - Hardware Fundamentals",
    date: "2026-08-16",

    trainerId: "TR-001",
    trainerName: "Maria Santos",

    submittedAt: "2026-08-16T16:45:00",
    submittedBy: "Maria Santos",

    status: "Submitted",
    remarks: "Regular attendance submission.",

    records: [
      {
        id: "ATT-001",
        participantId: "PT-001",
        participantName: "Juan Dela Cruz",
        timeIn: "07:52 AM",
        timeOut: "04:30 PM",
        status: "Present",
        method: "QR",
        remarks: "Complete attendance",
      },
      {
        id: "ATT-002",
        participantId: "PT-002",
        participantName: "Maria Garcia",
        timeIn: "08:17 AM",
        timeOut: "04:30 PM",
        status: "Late",
        method: "QR",
        remarks: "Arrived 17 minutes late",
      },
      {
        id: "ATT-003",
        participantId: "PT-003",
        participantName: "Pedro Reyes",
        timeIn: "--",
        timeOut: "--",
        status: "Absent",
        method: "Manual",
        remarks: "No attendance recorded",
      },
      {
        id: "ATT-004",
        participantId: "PT-004",
        participantName: "Ana Mendoza",
        timeIn: "07:48 AM",
        timeOut: "04:25 PM",
        status: "Present",
        method: "QR",
        remarks: "Complete attendance",
      },
      {
        id: "ATT-005",
        participantId: "PT-005",
        participantName: "Mark Villanueva",
        timeIn: "07:55 AM",
        timeOut: "04:20 PM",
        status: "Present",
        method: "QR",
        remarks: "Complete attendance",
      },
    ],
  },

  {
    id: "AS-002",
    trainingId: "TRN-001",
    trainingName: "Computer Systems Servicing NC II",
    sessionId: "SES-002",
    sessionName: "Session 2 - Operating Systems",
    date: "2026-08-17",

    trainerId: "TR-001",
    trainerName: "Maria Santos",

    submittedAt: "2026-08-17T16:52:00",
    submittedBy: "Maria Santos",

    status: "Verified",
    remarks: "Attendance verified by Admin.",

    records: [
      {
        id: "ATT-006",
        participantId: "PT-001",
        participantName: "Juan Dela Cruz",
        timeIn: "07:50 AM",
        timeOut: "04:30 PM",
        status: "Present",
        method: "QR",
        remarks: "",
      },
      {
        id: "ATT-007",
        participantId: "PT-002",
        participantName: "Maria Garcia",
        timeIn: "08:12 AM",
        timeOut: "04:30 PM",
        status: "Late",
        method: "QR",
        remarks: "Late arrival",
      },
      {
        id: "ATT-008",
        participantId: "PT-003",
        participantName: "Pedro Reyes",
        timeIn: "--",
        timeOut: "--",
        status: "Absent",
        method: "Manual",
        remarks: "",
      },
      {
        id: "ATT-009",
        participantId: "PT-004",
        participantName: "Ana Mendoza",
        timeIn: "07:49 AM",
        timeOut: "04:30 PM",
        status: "Present",
        method: "QR",
        remarks: "",
      },
      {
        id: "ATT-010",
        participantId: "PT-005",
        participantName: "Mark Villanueva",
        timeIn: "07:53 AM",
        timeOut: "04:30 PM",
        status: "Present",
        method: "QR",
        remarks: "",
      },
    ],
  },

  {
    id: "AS-003",
    trainingId: "TRN-002",
    trainingName: "Web Development Fundamentals",
    sessionId: "SES-003",
    sessionName: "Session 3 - React Fundamentals",
    date: "2026-08-17",

    trainerId: "TR-002",
    trainerName: "John Cruz",

    submittedAt: null,
    submittedBy: null,

    status: "Draft",
    remarks: "Trainer has not submitted attendance yet.",

    records: [
      {
        id: "ATT-011",
        participantId: "PT-006",
        participantName: "Sofia Ramos",
        timeIn: "08:21 AM",
        timeOut: "04:30 PM",
        status: "Late",
        method: "QR",
        remarks: "Arrived late",
      },
      {
        id: "ATT-012",
        participantId: "PT-007",
        participantName: "Daniel Flores",
        timeIn: "07:55 AM",
        timeOut: "04:30 PM",
        status: "Present",
        method: "QR",
        remarks: "",
      },
    ],
  },

  {
    id: "AS-004",
    trainingId: "TRN-002",
    trainingName: "Web Development Fundamentals",
    sessionId: "SES-004",
    sessionName: "Session 4 - Next.js Fundamentals",
    date: "2026-08-18",

    trainerId: "TR-002",
    trainerName: "John Cruz",

    submittedAt: null,
    submittedBy: null,

    status: "Draft",
    remarks: "Attendance is still being prepared.",

    records: [
      {
        id: "ATT-013",
        participantId: "PT-006",
        participantName: "Sofia Ramos",
        timeIn: "07:50 AM",
        timeOut: "--",
        status: "Present",
        method: "QR",
        remarks: "",
      },
      {
        id: "ATT-014",
        participantId: "PT-007",
        participantName: "Daniel Flores",
        timeIn: "--",
        timeOut: "--",
        status: "Absent",
        method: "Manual",
        remarks: "No attendance recorded",
      },
    ],
  },
];

/* =========================================================
   STATUS STYLES
========================================================= */

const submissionStatusStyles: Record<
  SubmissionStatus,
  string
> = {
  Draft:
    "border-gray-200 bg-gray-50 text-gray-600",

  Submitted:
    "border-blue-200 bg-blue-50 text-blue-700",

  Verified:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  Returned:
    "border-red-200 bg-red-50 text-red-700",
};

const attendanceStatusStyles: Record<
  AttendanceStatus,
  string
> = {
  Present:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  Late:
    "border-amber-200 bg-amber-50 text-amber-700",

  Absent:
    "border-red-200 bg-red-50 text-red-700",

  Excused:
    "border-blue-200 bg-blue-50 text-blue-700",
};

/* =========================================================
   PAGE
========================================================= */

export default function AttendanceManagementPage() {
  const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [trainingFilter, setTrainingFilter] =
    useState("All");

  const [trainerFilter, setTrainerFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState<"All" | SubmissionStatus>("All");

  const [selectedSubmission, setSelectedSubmission] =
    useState<AttendanceSubmission | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [showReturnModal, setShowReturnModal] =
    useState(false);

  const [returnRemarks, setReturnRemarks] =
    useState("");

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const trainings = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          mockSubmissions.map(
            (item) => item.trainingName
          )
        )
      ),
    ];
  }, []);

  const trainers = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          mockSubmissions.map(
            (item) => item.trainerName
          )
        )
      ),
    ];
  }, []);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalSubmissions =
    mockSubmissions.length;

  const submittedCount =
    mockSubmissions.filter(
      (item) => item.status === "Submitted"
    ).length;

  const verifiedCount =
    mockSubmissions.filter(
      (item) => item.status === "Verified"
    ).length;

  const draftCount =
    mockSubmissions.filter(
      (item) => item.status === "Draft"
    ).length;

  const returnedCount =
    mockSubmissions.filter(
      (item) => item.status === "Returned"
    ).length;

  /* =========================================================
     FILTER SUBMISSIONS
  ========================================================= */

  const filteredSubmissions = useMemo(() => {
    return mockSubmissions
      .filter((submission) => {
        const searchValue =
          search.toLowerCase();

        const matchesSearch =
          submission.trainingName
            .toLowerCase()
            .includes(searchValue) ||
          submission.trainerName
            .toLowerCase()
            .includes(searchValue) ||
          submission.sessionName
            .toLowerCase()
            .includes(searchValue) ||
          submission.id
            .toLowerCase()
            .includes(searchValue);

        const matchesTraining =
          trainingFilter === "All" ||
          submission.trainingName ===
            trainingFilter;

        const matchesTrainer =
          trainerFilter === "All" ||
          submission.trainerName ===
            trainerFilter;

        const matchesStatus =
          statusFilter === "All" ||
          submission.status === statusFilter;

        const matchesFromDate =
          !fromDate ||
          submission.date >= fromDate;

        const matchesToDate =
          !toDate ||
          submission.date <= toDate;

        return (
          matchesSearch &&
          matchesTraining &&
          matchesTrainer &&
          matchesStatus &&
          matchesFromDate &&
          matchesToDate
        );
      })
      .sort((a, b) =>
        b.date.localeCompare(a.date)
      );
  }, [
    search,
    fromDate,
    toDate,
    trainingFilter,
    trainerFilter,
    statusFilter,
  ]);

  /* =========================================================
     OPEN DETAILS
  ========================================================= */

  function openDetails(
    submission: AttendanceSubmission
  ) {
    setSelectedSubmission(submission);
    setShowDetails(true);
  }

  /* =========================================================
     VERIFY
  ========================================================= */

  function verifySubmission() {
    if (!selectedSubmission) return;

    alert(
      `Attendance ${selectedSubmission.id} has been verified by Admin.`
    );

    setShowDetails(false);
  }

  /* =========================================================
     RETURN
  ========================================================= */

  function openReturnModal() {
    setReturnRemarks("");
    setShowReturnModal(true);
  }

  function returnSubmission() {
    if (!returnRemarks.trim()) {
      alert("Please enter a reason.");
      return;
    }

    alert(
      `Attendance ${selectedSubmission?.id} returned to trainer.\n\nReason: ${returnRemarks}`
    );

    setShowReturnModal(false);
    setShowDetails(false);
  }

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  function resetFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setTrainingFilter("All");
    setTrainerFilter("All");
    setStatusFilter("All");
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div >

      <div className="mx-auto  space-y-3 p-3">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <p className="text-sm font-medium text-gray-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Attendance Management
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Monitor attendance submissions from trainers,
              review participant attendance, and verify
              submitted attendance records.
            </p>

          </div>

          <button
            onClick={() =>
              alert(
                "Mock export: Attendance report generated."
              )
            }
            className="rounded-xl bg-[#191c1e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#303336]"
          >
            Export Attendance
          </button>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <SummaryCard
            title="Total Submissions"
            value={totalSubmissions}
            description="Attendance sheets"
            icon="▣"
          />

          <SummaryCard
            title="Submitted"
            value={submittedCount}
            description="Awaiting verification"
            icon="↗"
          />

          <SummaryCard
            title="Verified"
            value={verifiedCount}
            description="Verified by Admin"
            icon="✓"
          />

          <SummaryCard
            title="Draft"
            value={draftCount}
            description="Not yet submitted"
            icon="◷"
          />

          <SummaryCard
            title="Returned"
            value={returnedCount}
            description="Needs correction"
            icon="!"
          />

        </div>

        {/* =================================================
            FILTER CARD
        ================================================= */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-semibold">
              Attendance Submissions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Filter attendance submissions by date,
              training, trainer, or submission status.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            {/* Search */}

            <div className="xl:col-span-2">

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Training, trainer, session..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
              />

            </div>

            {/* From */}

            <div>

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                From
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(event) =>
                  setFromDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
              />

            </div>

            {/* To */}

            <div>

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                To
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(event) =>
                  setToDate(event.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
              />

            </div>

            {/* Training */}

            <div>

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Training
              </label>

              <select
                value={trainingFilter}
                onChange={(event) =>
                  setTrainingFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
              >
                {trainings.map((training) => (
                  <option
                    key={training}
                    value={training}
                  >
                    {training === "All"
                      ? "All Trainings"
                      : training}
                  </option>
                ))}
              </select>

            </div>

            {/* Trainer */}

            <div>

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Trainer
              </label>

              <select
                value={trainerFilter}
                onChange={(event) =>
                  setTrainerFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
              >
                {trainers.map((trainer) => (
                  <option
                    key={trainer}
                    value={trainer}
                  >
                    {trainer === "All"
                      ? "All Trainers"
                      : trainer}
                  </option>
                ))}
              </select>

            </div>

          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | SubmissionStatus
                  )
                }
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none"
              >

                <option value="All">
                  All Submission Status
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Submitted">
                  Submitted
                </option>

                <option value="Verified">
                  Verified
                </option>

                <option value="Returned">
                  Returned
                </option>

              </select>

              <button
                onClick={resetFilters}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Clear Filters
              </button>

            </div>

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {filteredSubmissions.length}
              </span>{" "}
              submission
              {filteredSubmissions.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

        </div>

        {/* =================================================
            SUBMISSION TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="bg-gray-50">

                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Training
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Trainer
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Participants
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Attendance
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Submitted At
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredSubmissions.map(
                  (submission) => {

                    const present =
                      submission.records.filter(
                        (item) =>
                          item.status ===
                          "Present"
                      ).length;

                    const late =
                      submission.records.filter(
                        (item) =>
                          item.status ===
                          "Late"
                      ).length;

                    const absent =
                      submission.records.filter(
                        (item) =>
                          item.status ===
                          "Absent"
                      ).length;

                    const excused =
                      submission.records.filter(
                        (item) =>
                          item.status ===
                          "Excused"
                      ).length;

                    return (
                      <tr
                        key={submission.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* Date */}

                        <td className="px-6 py-5">

                          <p className="font-semibold">
                            {formatDate(
                              submission.date
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {submission.id}
                          </p>

                        </td>

                        {/* Training */}

                        <td className="px-6 py-5">

                          <p className="max-w-[260px] text-sm font-semibold">
                            {submission.trainingName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {submission.sessionName}
                          </p>

                        </td>

                        {/* Trainer */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-700">
                              {getInitials(
                                submission.trainerName
                              )}
                            </div>

                            <div>

                              <p className="text-sm font-semibold">
                                {submission.trainerName}
                              </p>

                              <p className="text-xs text-gray-400">
                                {submission.trainerId}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Participants */}

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold">
                            {submission.records.length}
                          </p>

                          <p className="text-xs text-gray-500">
                            enrolled participants
                          </p>

                        </td>

                        {/* Attendance Summary */}

                        <td className="px-6 py-5">

                          <div className="flex flex-wrap gap-1.5">

                            <AttendanceMini
                              label="P"
                              value={present}
                              type="Present"
                            />

                            <AttendanceMini
                              label="L"
                              value={late}
                              type="Late"
                            />

                            <AttendanceMini
                              label="A"
                              value={absent}
                              type="Absent"
                            />

                            {excused > 0 && (
                              <AttendanceMini
                                label="E"
                                value={excused}
                                type="Excused"
                              />
                            )}

                          </div>

                        </td>

                        {/* Submitted */}

                        <td className="px-6 py-5">

                          {submission.submittedAt ? (
                            <>
                              <p className="text-sm font-medium">
                                {formatDateTime(
                                  submission.submittedAt
                                )}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                by{" "}
                                {
                                  submission.submittedBy
                                }
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Not submitted
                            </span>
                          )}

                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${submissionStatusStyles[submission.status]}`}
                          >
                            {submission.status}
                          </span>

                        </td>

                        {/* Action */}

                        <td className="px-6 py-5">

                          <div className="flex justify-end">

                            <button
                              onClick={() =>
                                openDetails(
                                  submission
                                )
                              }
                              className="rounded-lg bg-[#191c1e] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#303336]"
                            >
                              View
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

            {filteredSubmissions.length === 0 && (
              <EmptyState />
            )}

          </div>

          <div className="border-t border-gray-200 px-6 py-4">

            <p className="text-sm text-gray-500">
              Attendance submissions are submitted
              by trainers and reviewed by Admin.
            </p>

          </div>

        </div>

      </div>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedSubmission &&
        showDetails && (
          <ModalOverlay
            onClose={() =>
              setShowDetails(false)
            }
          >

            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}

              <div className="shrink-0 border-b border-gray-200 px-6 py-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-3">

                      <h2 className="text-xl font-bold">
                        Attendance Submission
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${submissionStatusStyles[selectedSubmission.status]}`}
                      >
                        {
                          selectedSubmission.status
                        }
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {
                        selectedSubmission.id
                      }
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setShowDetails(false)
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200"
                  >
                    ×
                  </button>

                </div>

              </div>

              {/* Content */}

              <div className="overflow-y-auto p-6">

                {/* Submission Information */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                  <InfoItem
                    label="Training"
                    value={
                      selectedSubmission.trainingName
                    }
                  />

                  <InfoItem
                    label="Session"
                    value={
                      selectedSubmission.sessionName
                    }
                  />

                  <InfoItem
                    label="Attendance Date"
                    value={formatDate(
                      selectedSubmission.date
                    )}
                  />

                  <InfoItem
                    label="Trainer"
                    value={
                      selectedSubmission.trainerName
                    }
                  />

                  <InfoItem
                    label="Submitted At"
                    value={
                      selectedSubmission.submittedAt
                        ? formatDateTime(
                            selectedSubmission.submittedAt
                          )
                        : "Not submitted"
                    }
                  />

                  <InfoItem
                    label="Submitted By"
                    value={
                      selectedSubmission.submittedBy ??
                      "—"
                    }
                  />

                  <InfoItem
                    label="Participants"
                    value={`${selectedSubmission.records.length}`}
                  />

                  <InfoItem
                    label="Remarks"
                    value={
                      selectedSubmission.remarks ||
                      "No remarks"
                    }
                  />

                </div>

                {/* Summary */}

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                  <AttendanceSummary
                    title="Present"
                    value={
                      selectedSubmission.records.filter(
                        (item) =>
                          item.status ===
                          "Present"
                      ).length
                    }
                    type="Present"
                  />

                  <AttendanceSummary
                    title="Late"
                    value={
                      selectedSubmission.records.filter(
                        (item) =>
                          item.status ===
                          "Late"
                      ).length
                    }
                    type="Late"
                  />

                  <AttendanceSummary
                    title="Absent"
                    value={
                      selectedSubmission.records.filter(
                        (item) =>
                          item.status ===
                          "Absent"
                      ).length
                    }
                    type="Absent"
                  />

                  <AttendanceSummary
                    title="Excused"
                    value={
                      selectedSubmission.records.filter(
                        (item) =>
                          item.status ===
                          "Excused"
                      ).length
                    }
                    type="Excused"
                  />

                </div>

                {/* Students */}

                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">

                  <div className="border-b border-gray-200 px-5 py-4">

                    <h3 className="font-semibold">
                      Participant Attendance
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Complete attendance breakdown
                      for this submission.
                    </p>

                  </div>

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[850px] text-left">

                      <thead className="bg-gray-50">

                        <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">

                          <th className="px-5 py-3 font-semibold">
                            #
                          </th>

                          <th className="px-5 py-3 font-semibold">
                            Participant
                          </th>

                          <th className="px-5 py-3 font-semibold">
                            Time In
                          </th>

                          <th className="px-5 py-3 font-semibold">
                            Time Out
                          </th>

                          <th className="px-5 py-3 font-semibold">
                            Method
                          </th>

                          <th className="px-5 py-3 font-semibold">
                            Status
                          </th>

                          <th className="px-5 py-3 font-semibold">
                            Remarks
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-100">

                        {sortParticipants(
                          selectedSubmission.records
                        ).map(
                          (
                            record,
                            index
                          ) => (

                            <tr
                              key={record.id}
                              className="hover:bg-gray-50"
                            >

                              <td className="px-5 py-4 text-sm text-gray-400">
                                {index + 1}
                              </td>

                              <td className="px-5 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold">
                                    {getInitials(
                                      record.participantName
                                    )}
                                  </div>

                                  <div>

                                    <p className="text-sm font-semibold">
                                      {
                                        record.participantName
                                      }
                                    </p>

                                    <p className="text-xs text-gray-400">
                                      {
                                        record.participantId
                                      }
                                    </p>

                                  </div>

                                </div>

                              </td>

                              <td className="px-5 py-4 text-sm font-medium">
                                {
                                  record.timeIn
                                }
                              </td>

                              <td className="px-5 py-4 text-sm font-medium">
                                {
                                  record.timeOut
                                }
                              </td>

                              <td className="px-5 py-4">

                                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                                  {
                                    record.method
                                  }
                                </span>

                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${attendanceStatusStyles[record.status]}`}
                                >
                                  {
                                    record.status
                                  }
                                </span>

                              </td>

                              <td className="px-5 py-4 text-sm text-gray-500">
                                {
                                  record.remarks ||
                                  "—"
                                }
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

              {/* Footer */}

              <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <button
                    onClick={() =>
                      setShowDetails(false)
                    }
                    className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Close
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">

                    {selectedSubmission.status ===
                      "Submitted" && (
                      <>
                        <button
                          onClick={
                            openReturnModal
                          }
                          className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Return to Trainer
                        </button>

                        <button
                          onClick={
                            verifySubmission
                          }
                          className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Verify Attendance
                        </button>
                      </>
                    )}

                    {selectedSubmission.status ===
                      "Verified" && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                        ✓ Attendance Verified
                      </div>
                    )}

                    {selectedSubmission.status ===
                      "Draft" && (
                      <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-500">
                        Waiting for trainer submission
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </ModalOverlay>
        )}

      {/* =================================================
          RETURN MODAL
      ================================================= */}

      {showReturnModal &&
        selectedSubmission && (
          <ModalOverlay
            onClose={() =>
              setShowReturnModal(false)
            }
          >

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Return Attendance
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Return this submission to the
                    trainer for correction.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowReturnModal(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 hover:bg-gray-200"
                >
                  ×
                </button>

              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">

                <p className="text-sm font-semibold">
                  {
                    selectedSubmission.trainingName
                  }
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {
                    selectedSubmission.sessionName
                  }
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Trainer:{" "}
                  {
                    selectedSubmission.trainerName
                  }
                </p>

              </div>

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold">
                  Reason for Return
                </label>

                <textarea
                  value={returnRemarks}
                  onChange={(event) =>
                    setReturnRemarks(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Example: Please correct the attendance status of Pedro Reyes."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                />

              </div>

              <div className="mt-6 flex gap-3">

                <button
                  onClick={() =>
                    setShowReturnModal(false)
                  }
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={returnSubmission}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Return to Trainer
                </button>

              </div>

            </div>

          </ModalOverlay>
        )}

    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold">
          {icon}
        </div>

      </div>

    </div>
  );
}

function AttendanceMini({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type: AttendanceStatus;
}) {
  return (
    <span
      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${attendanceStatusStyles[type]}`}
      title={type}
    >
      {label}: {value}
    </span>
  );
}

function AttendanceSummary({
  title,
  value,
  type,
}: {
  title: string;
  value: number;
  type: AttendanceStatus;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${attendanceStatusStyles[type]}`}
    >
      <p className="text-xs font-semibold opacity-80">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-5">
        {value}
      </p>

    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-20 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
        ⌕
      </div>

      <h3 className="mt-4 font-semibold">
        No attendance submissions found
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Try changing your filters or date range.
      </p>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function sortParticipants(
  records: AttendanceRecord[]
) {
  return [...records].sort((a, b) =>
    getLastName(a.participantName).localeCompare(
      getLastName(b.participantName)
    )
  );
}

function getLastName(name: string) {
  const parts = name.trim().split(/\s+/);

  return parts.length
    ? parts[parts.length - 1].toLowerCase()
    : "";
}