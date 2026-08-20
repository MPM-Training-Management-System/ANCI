"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
  Button,
} from "@repo/ui/index";

import {
  columns,
  type AttendanceRecord,
  type AttendanceStatus,
  type AttendanceSubmission,
  type SubmissionStatus,
} from "./column";


// ============================================================
// MOCK DATA
// ============================================================

const mockSubmissions:
  AttendanceSubmission[] = [
    {
      id: "AS-001",

      trainingId: "TRN-001",

      trainingName:
        "Computer Systems Servicing NC II",

      sessionId: "SES-001",

      sessionName:
        "Session 1 - Hardware Fundamentals",

      date: "2026-08-16",

      trainerId: "TR-001",

      trainerName:
        "Maria Santos",

      submittedAt:
        "2026-08-16T16:45:00",

      submittedBy:
        "Maria Santos",

      status: "Submitted",

      remarks:
        "Regular attendance submission.",

      records: [
        {
          id: "ATT-001",

          participantId:
            "PT-001",

          participantName:
            "Juan Dela Cruz",

          timeIn: "07:52 AM",

          timeOut: "04:30 PM",

          status: "Present",

          method: "QR",

          remarks:
            "Complete attendance",
        },

        {
          id: "ATT-002",

          participantId:
            "PT-002",

          participantName:
            "Maria Garcia",

          timeIn: "08:17 AM",

          timeOut: "04:30 PM",

          status: "Late",

          method: "QR",

          remarks:
            "Arrived 17 minutes late",
        },

        {
          id: "ATT-003",

          participantId:
            "PT-003",

          participantName:
            "Pedro Reyes",

          timeIn: "--",

          timeOut: "--",

          status: "Absent",

          method: "Manual",

          remarks:
            "No attendance recorded",
        },

        {
          id: "ATT-004",

          participantId:
            "PT-004",

          participantName:
            "Ana Mendoza",

          timeIn: "07:48 AM",

          timeOut: "04:25 PM",

          status: "Present",

          method: "QR",

          remarks:
            "Complete attendance",
        },

        {
          id: "ATT-005",

          participantId:
            "PT-005",

          participantName:
            "Mark Villanueva",

          timeIn: "07:55 AM",

          timeOut: "04:20 PM",

          status: "Present",

          method: "QR",

          remarks:
            "Complete attendance",
        },
      ],
    },

    {
      id: "AS-002",

      trainingId: "TRN-001",

      trainingName:
        "Computer Systems Servicing NC II",

      sessionId: "SES-002",

      sessionName:
        "Session 2 - Operating Systems",

      date: "2026-08-17",

      trainerId: "TR-001",

      trainerName:
        "Maria Santos",

      submittedAt:
        "2026-08-17T16:52:00",

      submittedBy:
        "Maria Santos",

      status: "Verified",

      remarks:
        "Attendance verified by Admin.",

      records: [
        {
          id: "ATT-006",

          participantId:
            "PT-001",

          participantName:
            "Juan Dela Cruz",

          timeIn: "07:50 AM",

          timeOut: "04:30 PM",

          status: "Present",

          method: "QR",

          remarks: "",
        },

        {
          id: "ATT-007",

          participantId:
            "PT-002",

          participantName:
            "Maria Garcia",

          timeIn: "08:12 AM",

          timeOut: "04:30 PM",

          status: "Late",

          method: "QR",

          remarks:
            "Late arrival",
        },

        {
          id: "ATT-008",

          participantId:
            "PT-003",

          participantName:
            "Pedro Reyes",

          timeIn: "--",

          timeOut: "--",

          status: "Absent",

          method: "Manual",

          remarks: "",
        },

        {
          id: "ATT-009",

          participantId:
            "PT-004",

          participantName:
            "Ana Mendoza",

          timeIn: "07:49 AM",

          timeOut: "04:30 PM",

          status: "Present",

          method: "QR",

          remarks: "",
        },

        {
          id: "ATT-010",

          participantId:
            "PT-005",

          participantName:
            "Mark Villanueva",

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

      trainingName:
        "Web Development Fundamentals",

      sessionId: "SES-003",

      sessionName:
        "Session 3 - React Fundamentals",

      date: "2026-08-17",

      trainerId: "TR-002",

      trainerName:
        "John Cruz",

      submittedAt: null,

      submittedBy: null,

      status: "Draft",

      remarks:
        "Trainer has not submitted attendance yet.",

      records: [
        {
          id: "ATT-011",

          participantId:
            "PT-006",

          participantName:
            "Sofia Ramos",

          timeIn: "08:21 AM",

          timeOut: "04:30 PM",

          status: "Late",

          method: "QR",

          remarks:
            "Arrived late",
        },

        {
          id: "ATT-012",

          participantId:
            "PT-007",

          participantName:
            "Daniel Flores",

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

      trainingName:
        "Web Development Fundamentals",

      sessionId: "SES-004",

      sessionName:
        "Session 4 - Next.js Fundamentals",

      date: "2026-08-18",

      trainerId: "TR-002",

      trainerName:
        "John Cruz",

      submittedAt: null,

      submittedBy: null,

      status: "Draft",

      remarks:
        "Attendance is still being prepared.",

      records: [
        {
          id: "ATT-013",

          participantId:
            "PT-006",

          participantName:
            "Sofia Ramos",

          timeIn: "07:50 AM",

          timeOut: "--",

          status: "Present",

          method: "QR",

          remarks: "",
        },

        {
          id: "ATT-014",

          participantId:
            "PT-007",

          participantName:
            "Daniel Flores",

          timeIn: "--",

          timeOut: "--",

          status: "Absent",

          method: "Manual",

          remarks:
            "No attendance recorded",
        },
      ],
    },
  ];


// ============================================================
// PAGE
// ============================================================

export default function AttendanceManagementPage() {

  const [
    submissions,
    setSubmissions,
  ] = useState<
    AttendanceSubmission[]
  >(mockSubmissions);


  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [trainingFilter, setTrainingFilter] =
    useState("All");

  const [trainerFilter, setTrainerFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | SubmissionStatus
    >("All");


  // ==========================================================
  // MODAL STATE
  // ==========================================================

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] =
    useState<AttendanceSubmission | null>(
      null,
    );

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const [
    showReturnModal,
    setShowReturnModal,
  ] = useState(false);

  const [
    returnRemarks,
    setReturnRemarks,
  ] = useState("");


  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const trainings =
    useMemo(
      () => [
        "All",
        ...Array.from(
          new Set(
            submissions.map(
              (item) =>
                item.trainingName,
            ),
          ),
        ),
      ],
      [submissions],
    );


  const trainers =
    useMemo(
      () => [
        "All",
        ...Array.from(
          new Set(
            submissions.map(
              (item) =>
                item.trainerName,
            ),
          ),
        ),
      ],
      [submissions],
    );


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalSubmissions =
    submissions.length;

  const submittedCount =
    submissions.filter(
      (item) =>
        item.status ===
        "Submitted",
    ).length;

  const verifiedCount =
    submissions.filter(
      (item) =>
        item.status ===
        "Verified",
    ).length;

  const draftCount =
    submissions.filter(
      (item) =>
        item.status ===
        "Draft",
    ).length;

  const returnedCount =
    submissions.filter(
      (item) =>
        item.status ===
        "Returned",
    ).length;


  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredSubmissions =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return submissions
        .filter(
          (submission) => {

            const matchesSearch =
              !query ||
              submission.trainingName
                .toLowerCase()
                .includes(query) ||
              submission.trainerName
                .toLowerCase()
                .includes(query) ||
              submission.sessionName
                .toLowerCase()
                .includes(query) ||
              submission.id
                .toLowerCase()
                .includes(query);

            const matchesTraining =
              trainingFilter ===
                "All" ||
              submission.trainingName ===
                trainingFilter;

            const matchesTrainer =
              trainerFilter ===
                "All" ||
              submission.trainerName ===
                trainerFilter;

            const matchesStatus =
              statusFilter ===
                "All" ||
              submission.status ===
                statusFilter;

            const matchesFrom =
              !fromDate ||
              submission.date >=
                fromDate;

            const matchesTo =
              !toDate ||
              submission.date <=
                toDate;

            return (
              matchesSearch &&
              matchesTraining &&
              matchesTrainer &&
              matchesStatus &&
              matchesFrom &&
              matchesTo
            );
          },
        )
        .sort(
          (a, b) =>
            b.date.localeCompare(
              a.date,
            ),
        );

    }, [
      submissions,
      search,
      fromDate,
      toDate,
      trainingFilter,
      trainerFilter,
      statusFilter,
    ]);


  // ==========================================================
  // VIEW
  // ==========================================================

  function handleView(
    submission: AttendanceSubmission,
  ) {
    setSelectedSubmission(
      submission,
    );

    setShowDetails(true);
  }


  // ==========================================================
  // VERIFY
  // ==========================================================

  function handleVerify(
    submission: AttendanceSubmission,
  ) {

    setSubmissions(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            submission.id
              ? {
                  ...item,
                  status:
                    "Verified",
                  remarks:
                    "Attendance verified by Admin.",
                }
              : item,
        ),
    );

    setSelectedSubmission(
      (current) =>
        current &&
        current.id ===
          submission.id
          ? {
              ...current,
              status:
                "Verified",
              remarks:
                "Attendance verified by Admin.",
            }
          : current,
    );

    alert(
      `Attendance ${submission.id} has been verified by Admin.`,
    );
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  function handleReturn(
    submission: AttendanceSubmission,
  ) {

    setSelectedSubmission(
      submission,
    );

    setReturnRemarks("");

    setShowReturnModal(true);
  }


  function confirmReturn() {

    if (
      !selectedSubmission
    ) {
      return;
    }

    if (
      !returnRemarks.trim()
    ) {
      alert(
        "Please enter a reason for returning the attendance.",
      );

      return;
    }

    const updatedRemarks =
      returnRemarks.trim();

    setSubmissions(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            selectedSubmission.id
              ? {
                  ...item,
                  status:
                    "Returned",
                  remarks:
                    updatedRemarks,
                }
              : item,
        ),
    );

    setSelectedSubmission(
      (current) =>
        current &&
        current.id ===
          selectedSubmission.id
          ? {
              ...current,
              status:
                "Returned",
              remarks:
                updatedRemarks,
            }
          : current,
    );

    setShowReturnModal(false);

    alert(
      `Attendance ${selectedSubmission.id} has been returned to ${selectedSubmission.trainerName}.`,
    );
  }


  // ==========================================================
  // EXPORT
  // ==========================================================

  function handleExport() {

    const rows =
      filteredSubmissions
        .map(
          (submission) =>
            [
              submission.id,
              submission.date,
              submission.trainingName,
              submission.sessionName,
              submission.trainerName,
              submission.records.length,
              submission.status,
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
      "Submission ID,Date,Training,Session,Trainer,Participants,Status",
      rows,
    ].join("\n");

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
      "attendance-submissions.csv";

    link.click();

    URL.revokeObjectURL(
      url,
    );
  }


  // ==========================================================
  // RESET
  // ==========================================================

  function resetFilters() {

    setSearch("");

    setFromDate("");

    setToDate("");

    setTrainingFilter(
      "All",
    );

    setTrainerFilter(
      "All",
    );

    setStatusFilter(
      "All",
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

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
            Monitor attendance submissions
            from trainers, review participant
            attendance, and verify submitted
            attendance records.
          </p>

        </div>


        <Button
          variant="primary"
          onClick={
            handleExport
          }
        >
          Export Attendance
        </Button>

      </div>


      {/* ====================================================
          STATS
      ==================================================== */}

      <StatGrid>

        <StatCard
          title="Total Submissions"
          value={
            totalSubmissions
          }
          description="Attendance sheets"
        />

        <StatCard
          title="Submitted"
          value={
            submittedCount
          }
          description="Awaiting verification"
        />

        <StatCard
          title="Verified"
          value={
            verifiedCount
          }
          description="Verified by Admin"
        />

        <StatCard
          title="Draft"
          value={
            draftCount
          }
          description="Not yet submitted"
        />

        <StatCard
          title="Returned"
          value={
            returnedCount
          }
          description="Needs correction"
        />

      </StatGrid>


      {/* ====================================================
          DATA TABLE
      ==================================================== */}

      <DataTable
        title="Attendance Submissions"
        description="Review and manage attendance submissions from trainers."
        columns={
          columns
        }
        data={
          filteredSubmissions
        }
        searchable
        searchPlaceholder="Training, trainer, session..."
        showPagination
        emptyTitle="No attendance submissions found"
        emptyDescription="Try changing your filters or date range."
        meta={{
          onView:
            handleView,

          onVerify:
            handleVerify,

          onReturn:
            handleReturn,
        }}
        toolbar={

          <div className="flex flex-wrap items-center gap-2">

            {/* =================================================
                FROM DATE
            ================================================= */}

            <input
              type="date"
              value={
                fromDate
              }
              onChange={(
                event,
              ) =>
                setFromDate(
                  event.target
                    .value,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
            />


            {/* =================================================
                TO DATE
            ================================================= */}

            <input
              type="date"
              value={
                toDate
              }
              onChange={(
                event,
              ) =>
                setToDate(
                  event.target
                    .value,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
            />


            {/* =================================================
                TRAINING
            ================================================= */}

            <select
              value={
                trainingFilter
              }
              onChange={(
                event,
              ) =>
                setTrainingFilter(
                  event.target
                    .value,
                )
              }
              className="h-10 max-w-[220px] rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
            >

              {trainings.map(
                (
                  training,
                ) => (
                  <option
                    key={
                      training
                    }
                    value={
                      training
                    }
                  >
                    {training ===
                    "All"
                      ? "All Trainings"
                      : training}
                  </option>
                ),
              )}

            </select>


            {/* =================================================
                TRAINER
            ================================================= */}

            <select
              value={
                trainerFilter
              }
              onChange={(
                event,
              ) =>
                setTrainerFilter(
                  event.target
                    .value,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
            >

              {trainers.map(
                (
                  trainer,
                ) => (
                  <option
                    key={
                      trainer
                    }
                    value={
                      trainer
                    }
                  >
                    {trainer ===
                    "All"
                      ? "All Trainers"
                      : trainer}
                  </option>
                ),
              )}

            </select>


            {/* =================================================
                STATUS
            ================================================= */}

            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                setStatusFilter(
                  event.target
                    .value as
                    | "All"
                    | SubmissionStatus,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
            >

              <option value="All">
                All Status
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


            {/* =================================================
                CLEAR
            ================================================= */}

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Clear
            </button>

          </div>
        }
      />


      {/* ====================================================
          DETAILS MODAL
      ==================================================== */}

      {showDetails &&
        selectedSubmission && (

          <AttendanceDetailsModal
            submission={
              selectedSubmission
            }
            onClose={() =>
              setShowDetails(
                false,
              )
            }
            onVerify={() =>
              handleVerify(
                selectedSubmission,
              )
            }
            onReturn={() =>
              handleReturn(
                selectedSubmission,
              )
            }
          />

        )}


      {/* ====================================================
          RETURN MODAL
      ==================================================== */}

      {showReturnModal &&
        selectedSubmission && (

          <ReturnAttendanceModal
            submission={
              selectedSubmission
            }
            remarks={
              returnRemarks
            }
            onRemarksChange={
              setReturnRemarks
            }
            onClose={() =>
              setShowReturnModal(
                false,
              )
            }
            onConfirm={
              confirmReturn
            }
          />

        )}

    </div>
  );
}


// ============================================================
// DETAILS MODAL
// ============================================================

function AttendanceDetailsModal({
  submission,
  onClose,
  onVerify,
  onReturn,
}: {
  submission: AttendanceSubmission;

  onClose: () => void;

  onVerify: () => void;

  onReturn: () => void;
}) {

  const present =
    submission.records.filter(
      (record) =>
        record.status ===
        "Present",
    ).length;

  const late =
    submission.records.filter(
      (record) =>
        record.status ===
        "Late",
    ).length;

  const absent =
    submission.records.filter(
      (record) =>
        record.status ===
        "Absent",
    ).length;

  const excused =
    submission.records.filter(
      (record) =>
        record.status ===
        "Excused",
    ).length;


  return (
    <ModalOverlay
      onClose={
        onClose
      }
    >

      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 py-5">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-xl font-bold">
                Attendance Submission
              </h2>

              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold">
                {
                  submission.status
                }
              </span>

            </div>

            <p className="mt-1 font-mono text-xs text-gray-400">
              {submission.id}
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>


        {/* CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          <div className="space-y-6">

            {/* INFO */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <InfoCard
                title="Training"
                value={
                  submission.trainingName
                }
              />

              <InfoCard
                title="Session"
                value={
                  submission.sessionName
                }
              />

              <InfoCard
                title="Date"
                value={formatDate(
                  submission.date,
                )}
              />

              <InfoCard
                title="Trainer"
                value={
                  submission.trainerName
                }
              />

              <InfoCard
                title="Submitted At"
                value={
                  submission.submittedAt
                    ? formatDateTime(
                        submission.submittedAt,
                      )
                    : "Not submitted"
                }
              />

              <InfoCard
                title="Submitted By"
                value={
                  submission.submittedBy ??
                  "—"
                }
              />

              <InfoCard
                title="Participants"
                value={String(
                  submission.records
                    .length,
                )}
              />

              <InfoCard
                title="Remarks"
                value={
                  submission.remarks ||
                  "No remarks"
                }
              />

            </div>


            {/* ATTENDANCE STATS */}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

              <AttendanceStat
                title="Present"
                value={
                  present
                }
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              />

              <AttendanceStat
                title="Late"
                value={
                  late
                }
                className="border-amber-200 bg-amber-50 text-amber-700"
              />

              <AttendanceStat
                title="Absent"
                value={
                  absent
                }
                className="border-red-200 bg-red-50 text-red-700"
              />

              <AttendanceStat
                title="Excused"
                value={
                  excused
                }
                className="border-blue-200 bg-blue-50 text-blue-700"
              />

            </div>


            {/* RECORDS */}

            <div className="overflow-hidden rounded-2xl border border-gray-200">

              <div className="border-b border-gray-200 px-5 py-4">

                <h3 className="text-sm font-bold">
                  Participant Attendance
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Complete attendance
                  breakdown for this
                  submission.
                </p>

              </div>


              <div className="overflow-x-auto">

                <table className="min-w-[900px] w-full">

                  <thead className="bg-gray-50">

                    <tr className="border-b border-gray-200">

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Participant
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Time In
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Time Out
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Method
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Remarks
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {sortParticipants(
                      submission.records,
                    ).map(
                      (
                        record,
                      ) => (

                        <tr
                          key={
                            record.id
                          }
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold">
                                {getInitials(
                                  record.participantName,
                                )}
                              </div>

                              <div>

                                <p className="text-xs font-semibold">
                                  {
                                    record.participantName
                                  }
                                </p>

                                <p className="mt-0.5 text-[10px] text-gray-400">
                                  {
                                    record.participantId
                                  }
                                </p>

                              </div>

                            </div>

                          </td>


                          <td className="px-5 py-4 text-xs font-medium">
                            {
                              record.timeIn
                            }
                          </td>


                          <td className="px-5 py-4 text-xs font-medium">
                            {
                              record.timeOut
                            }
                          </td>


                          <td className="px-5 py-4">

                            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                              {
                                record.method
                              }
                            </span>

                          </td>


                          <td className="px-5 py-4">

                            <AttendanceBadge
                              status={
                                record.status
                              }
                            />

                          </td>


                          <td className="px-5 py-4 text-xs text-gray-500">
                            {
                              record.remarks ||
                              "—"
                            }
                          </td>

                        </tr>

                      ),
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>


        {/* FOOTER */}

        <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>


          {submission.status ===
            "Submitted" && (

            <div className="flex gap-2">

              <button
                type="button"
                onClick={
                  onReturn
                }
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                Return to Trainer
              </button>

              <button
                type="button"
                onClick={
                  onVerify
                }
                className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Verify Attendance
              </button>

            </div>

          )}


          {submission.status ===
            "Verified" && (

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-semibold text-emerald-700">
              ✓ Attendance Verified
            </div>

          )}


          {submission.status ===
            "Draft" && (

            <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold text-gray-500">
              Waiting for trainer submission
            </div>

          )}

        </div>

      </div>

    </ModalOverlay>
  );
}


// ============================================================
// RETURN MODAL
// ============================================================

function ReturnAttendanceModal({
  submission,
  remarks,
  onRemarksChange,
  onClose,
  onConfirm,
}: {
  submission: AttendanceSubmission;

  remarks: string;

  onRemarksChange: (
    value: string,
  ) => void;

  onClose: () => void;

  onConfirm: () => void;
}) {

  return (
    <ModalOverlay
      onClose={
        onClose
      }
    >

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-xl font-bold">
              Return Attendance
            </h2>

            <p className="mt-1 text-sm leading-5 text-gray-500">
              Return this attendance
              submission to the trainer
              for correction.
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>


        <div className="mt-5 rounded-xl bg-gray-50 p-4">

          <p className="text-sm font-semibold">
            {
              submission.trainingName
            }
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {
              submission.sessionName
            }
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Trainer:{" "}
            {
              submission.trainerName
            }
          </p>

        </div>


        <div className="mt-5">

          <label className="mb-2 block text-xs font-bold text-gray-600">
            Reason for Return
          </label>

          <textarea
            value={
              remarks
            }
            onChange={(
              event,
            ) =>
              onRemarksChange(
                event.target
                  .value,
              )
            }
            rows={4}
            placeholder="Example: Please correct the attendance status of Pedro Reyes."
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-gray-300"
          />

        </div>


        <div className="mt-6 flex gap-2">

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-xs font-semibold text-white hover:bg-red-700"
          >
            Return to Trainer
          </button>

        </div>

      </div>

    </ModalOverlay>
  );
}


// ============================================================
// ATTENDANCE BADGE
// ============================================================

function AttendanceBadge({
  status,
}: {
  status: AttendanceStatus;
}) {

  const styles: Record<
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

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}


// ============================================================
// ATTENDANCE STAT
// ============================================================

function AttendanceStat({
  title,
  value,
  className,
}: {
  title: string;
  value: number;
  className: string;
}) {

  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
    >

      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

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

      <p className="mt-1.5 text-xs font-semibold leading-5 text-gray-800">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// MODAL OVERLAY
// ============================================================

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(
        event,
      ) => {

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


function formatDate(
  date: string,
) {

  return new Date(
    `${date}T00:00:00`,
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}


function formatDateTime(
  date: string,
) {

  return new Date(
    date,
  ).toLocaleString(
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


function sortParticipants(
  records: AttendanceRecord[],
) {

  return [
    ...records,
  ].sort(
    (a, b) =>
      getLastName(
        a.participantName,
      ).localeCompare(
        getLastName(
          b.participantName,
        ),
      ),
  );
}


function getLastName(
  name: string,
) {

  const parts =
    name
      .trim()
      .split(/\s+/);

  return (
    parts[
      parts.length - 1
    ] ?? ""
  ).toLowerCase();
}