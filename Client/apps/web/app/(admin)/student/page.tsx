"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  columns,
  type ParticipantTableMeta,
} from "./columns";

import type {
  Participant,
} from "./types";

/* =========================================================
   MOCK DATA
========================================================= */

const mockParticipants: Participant[] = [
  {
    id: "P-001",
    participantId: "PT-2026-001",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@example.com",
    mobile: "0917 123 4567",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    enrollmentDate:
      "August 10, 2026",
    status: "Active",
    attendance: 96,
    assessment: "Passed",
    completion: "Eligible",
    completedModules: 8,
    totalModules: 8,
    address: "Montalban, Rizal",
    emergencyContact:
      "Pedro Dela Cruz",
    emergencyNumber:
      "0918 222 3344",
  },

  {
    id: "P-002",
    participantId: "PT-2026-002",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    mobile: "0918 222 1111",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    enrollmentDate:
      "August 10, 2026",
    status: "Active",
    attendance: 91,
    assessment: "Passed",
    completion: "Eligible",
    completedModules: 8,
    totalModules: 8,
    address: "San Mateo, Rizal",
    emergencyContact:
      "Ana Garcia",
    emergencyNumber:
      "0919 555 6677",
  },

  {
    id: "P-003",
    participantId: "PT-2026-003",
    name: "Pedro Santos",
    email: "pedro.santos@example.com",
    mobile: "0920 333 4444",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    enrollmentDate:
      "August 11, 2026",
    status: "Active",
    attendance: 87,
    assessment: "Pending",
    completion: "In Progress",
    completedModules: 6,
    totalModules: 8,
    address: "Rodriguez, Rizal",
    emergencyContact:
      "Rosa Santos",
    emergencyNumber:
      "0921 888 9999",
  },

  {
    id: "P-004",
    participantId: "PT-2026-004",
    name: "Ana Reyes",
    email: "ana.reyes@example.com",
    mobile: "0922 555 6666",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    enrollmentDate:
      "August 11, 2026",
    status: "Active",
    attendance: 94,
    assessment: "Passed",
    completion: "Eligible",
    completedModules: 8,
    totalModules: 8,
    address: "Quezon City",
    emergencyContact:
      "Jose Reyes",
    emergencyNumber:
      "0923 111 2233",
  },

  {
    id: "P-005",
    participantId: "PT-2026-005",
    name: "Mark Villanueva",
    email:
      "mark.villanueva@example.com",
    mobile: "0924 777 8888",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    enrollmentDate:
      "August 12, 2026",
    status: "Active",
    attendance: 79,
    assessment: "Pending",
    completion: "In Progress",
    completedModules: 5,
    totalModules: 8,
    address: "Antipolo, Rizal",
    emergencyContact:
      "Liza Villanueva",
    emergencyNumber:
      "0925 444 5566",
  },

  {
    id: "P-006",
    participantId: "PT-2026-006",
    name: "Kevin Ramos",
    email:
      "kevin.ramos@example.com",
    mobile: "0926 123 7890",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    enrollmentDate:
      "August 12, 2026",
    status: "Active",
    attendance: 88,
    assessment: "Not Started",
    completion: "In Progress",
    completedModules: 2,
    totalModules: 6,
    address: "Marikina City",
    emergencyContact:
      "Robert Ramos",
    emergencyNumber:
      "0927 888 1111",
  },

  {
    id: "P-007",
    participantId: "PT-2026-007",
    name: "Sarah Mendoza",
    email:
      "sarah.mendoza@example.com",
    mobile: "0928 333 4444",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    enrollmentDate:
      "August 12, 2026",
    status: "Active",
    attendance: 93,
    assessment: "Passed",
    completion: "In Progress",
    completedModules: 5,
    totalModules: 6,
    address: "Pasig City",
    emergencyContact:
      "Michael Mendoza",
    emergencyNumber:
      "0929 555 6666",
  },

  {
    id: "P-008",
    participantId: "PT-2026-008",
    name: "Daniel Torres",
    email:
      "daniel.torres@example.com",
    mobile: "0930 777 2222",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    enrollmentDate:
      "August 13, 2026",
    status: "Active",
    attendance: 84,
    assessment: "Pending",
    completion: "In Progress",
    completedModules: 4,
    totalModules: 6,
    address: "Cainta, Rizal",
    emergencyContact:
      "Elena Torres",
    emergencyNumber:
      "0931 111 2222",
  },

  {
    id: "P-009",
    participantId: "PT-2026-009",
    name: "Michael Aquino",
    email:
      "michael.aquino@example.com",
    mobile: "0932 444 5555",
    training:
      "Electrical Installation and Maintenance NC II",
    trainingCode: "EIM-NCII",
    enrollmentDate:
      "May 20, 2026",
    status: "Completed",
    attendance: 97,
    assessment: "Passed",
    completion: "Completed",
    completedModules: 10,
    totalModules: 10,
    address: "Mandaluyong City",
    emergencyContact:
      "Carlos Aquino",
    emergencyNumber:
      "0933 888 9999",
  },

  {
    id: "P-010",
    participantId: "PT-2026-010",
    name: "James Bautista",
    email:
      "james.bautista@example.com",
    mobile: "0934 123 4567",
    training:
      "Electrical Installation and Maintenance NC II",
    trainingCode: "EIM-NCII",
    enrollmentDate:
      "May 20, 2026",
    status: "Completed",
    attendance: 95,
    assessment: "Passed",
    completion: "Completed",
    completedModules: 10,
    totalModules: 10,
    address: "Pasay City",
    emergencyContact:
      "Ramon Bautista",
    emergencyNumber:
      "0935 666 7777",
  },

  {
    id: "P-011",
    participantId: "PT-2026-011",
    name: "Carlo Fernandez",
    email:
      "carlo.fernandez@example.com",
    mobile: "0936 222 3333",
    training:
      "Electrical Installation and Maintenance NC II",
    trainingCode: "EIM-NCII",
    enrollmentDate:
      "May 21, 2026",
    status: "Dropped",
    attendance: 58,
    assessment: "Failed",
    completion: "Dropped",
    completedModules: 4,
    totalModules: 10,
    address: "Valenzuela City",
    emergencyContact:
      "Mario Fernandez",
    emergencyNumber:
      "0937 444 5555",
  },
];

/* =========================================================
   FILTER OPTIONS
========================================================= */

const trainingOptions = [
  "All Trainings",
  "Computer Systems Servicing NC II",
  "Web Development Fundamentals",
  "Electrical Installation and Maintenance NC II",
];

const statusOptions = [
  "All Status",
  "Active",
  "Completed",
  "Dropped",
];

const assessmentOptions = [
  "All Assessments",
  "Passed",
  "Pending",
  "Failed",
  "Not Started",
];

/* =========================================================
   PAGE
========================================================= */

export default function TrainerParticipantsPage() {
  const [participants] = useState(
    mockParticipants,
  );

  const [search, setSearch] =
    useState("");

  const [trainingFilter, setTrainingFilter] =
    useState("All Trainings");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [
    assessmentFilter,
    setAssessmentFilter,
  ] = useState("All Assessments");

  const [selected, setSelected] =
    useState<Participant | null>(
      null,
    );

  const [showModal, setShowModal] =
    useState(false);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredParticipants =
    useMemo(() => {
      const query =
        search.toLowerCase().trim();

      return participants.filter(
        (participant) => {
          const matchesSearch =
            participant.name
              .toLowerCase()
              .includes(query) ||
            participant.participantId
              .toLowerCase()
              .includes(query) ||
            participant.email
              .toLowerCase()
              .includes(query) ||
            participant.training
              .toLowerCase()
              .includes(query);

          const matchesTraining =
            trainingFilter ===
              "All Trainings" ||
            participant.training ===
              trainingFilter;

          const matchesStatus =
            statusFilter ===
              "All Status" ||
            participant.status ===
              statusFilter;

          const matchesAssessment =
            assessmentFilter ===
              "All Assessments" ||
            participant.assessment ===
              assessmentFilter;

          return (
            matchesSearch &&
            matchesTraining &&
            matchesStatus &&
            matchesAssessment
          );
        },
      );
    }, [
      participants,
      search,
      trainingFilter,
      statusFilter,
      assessmentFilter,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const activeCount =
    participants.filter(
      (participant) =>
        participant.status === "Active",
    ).length;

  const completedCount =
    participants.filter(
      (participant) =>
        participant.status ===
        "Completed",
    ).length;

  const droppedCount =
    participants.filter(
      (participant) =>
        participant.status === "Dropped",
    ).length;

  const averageAttendance =
    participants.length > 0
      ? Math.round(
          participants.reduce(
            (sum, participant) =>
              sum +
              participant.attendance,
            0,
          ) / participants.length,
        )
      : 0;

  /* =======================================================
     VIEW
  ======================================================= */

  function openParticipant(
    participant: Participant,
  ) {
    setSelected(participant);
    setShowModal(true);
  }

  function closeModal() {
    setSelected(null);
    setShowModal(false);
  }

  /* =======================================================
     TABLE META
  ======================================================= */

  const tableMeta: ParticipantTableMeta =
    {
      onView: openParticipant,
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div>

        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <span>Trainer</span>
          <span>/</span>
          <span className="font-medium text-gray-600">
            Participants
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
          Participants
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          View and monitor participants
          enrolled in your assigned
          training programs.
        </p>

      </div>

      {/* ===================================================
          INFO
      =================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          i
        </div>

        <div>

          <p className="text-sm font-semibold text-blue-900">
            Assigned participants only
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            You can view participants
            enrolled in the training
            programs assigned to you.
            Attendance and assessment
            records are managed from
            their respective modules.
          </p>

        </div>

      </div>

      {/* ===================================================
          STATS
      =================================================== */}

      <StatGrid >

        <StatCard
          title="Total Participants"
          value={participants.length}
          description="Across assigned trainings"
          variant="primary"
        />

        <StatCard
          title="Active"
          value={activeCount}
          description="Currently training"
          variant="success"
        />

        <StatCard
          title="Completed"
          value={completedCount}
          description="Completed training"
          variant="success"
        />

        <StatCard
          title="Needs Attention"
          value={droppedCount}
          description="Dropped participants"
          variant="warning"
        />

        <StatCard
          title="Avg. Attendance"
          value={`${averageAttendance}%`}
          description="Overall attendance rate"
        />

      </StatGrid>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="flex flex-col gap-4">

          <div>

            <h2 className="text-sm font-bold">
              Participant List
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Search and filter
              participants by training,
              status, or assessment.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

            {/* SEARCH */}

            <div className="relative">

              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search participant..."
                className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-4 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* TRAINING */}

            <select
              value={trainingFilter}
              onChange={(event) =>
                setTrainingFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
            >
              {trainingOptions.map(
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

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
            >
              {statusOptions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ),
              )}
            </select>

            {/* ASSESSMENT */}

            <select
              value={assessmentFilter}
              onChange={(event) =>
                setAssessmentFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
            >
              {assessmentOptions.map(
                (assessment) => (
                  <option
                    key={assessment}
                    value={assessment}
                  >
                    {assessment}
                  </option>
                ),
              )}
            </select>

          </div>

        </div>

      </section>

      {/* ===================================================
          DATA TABLE
      =================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

        <div className="overflow-x-auto">

          <DataTable
            columns={columns}
            data={filteredParticipants}
            meta={tableMeta}
          />

        </div>

        {/* EMPTY */}

        {filteredParticipants.length ===
          0 && <EmptyState />}

        {/* FOOTER */}

        <div className="border-t border-[#eef0f2] px-5 py-4">

          <p className="text-[11px] text-gray-400">

            Showing{" "}

            <span className="font-semibold text-gray-600">
              {filteredParticipants.length}
            </span>

            {" "}of{" "}

            <span className="font-semibold text-gray-600">
              {participants.length}
            </span>

            {" "}participants

          </p>

        </div>

      </section>

      {/* ===================================================
          MODAL
      =================================================== */}

      {showModal && selected && (
        <ParticipantModal
          participant={selected}
          onClose={closeModal}
        />
      )}

    </div>
  );
}

/* =========================================================
   PARTICIPANT MODAL
========================================================= */

function ParticipantModal({
  participant,
  onClose,
}: {
  participant: Participant;
  onClose: () => void;
}) {
  const modulePercent =
    participant.totalModules > 0
      ? Math.round(
          (participant.completedModules /
            participant.totalModules) *
            100,
        )
      : 0;

  const isEligible =
    participant.attendance >= 90 &&
    participant.assessment ===
      "Passed";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] bg-white px-6 py-5">

          <div className="flex min-w-0 items-center gap-3 pr-6">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-xs font-bold text-white">
              {getInitials(
                participant.name,
              )}
            </div>

            <div className="min-w-0">

              <p className="font-mono text-[10px] text-gray-400">
                {participant.participantId}
              </p>

              <h2 className="mt-1 truncate text-lg font-bold tracking-tight">
                {participant.name}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {participant.training}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          <div className="space-y-5">

            {/* STATUS */}

            <div className="flex flex-wrap gap-2">

              <StatusBadge
                status={participant.status}
              />

              <AssessmentBadge
                status={
                  participant.assessment
                }
              />

              <CompletionBadge
                status={
                  participant.completion
                }
              />

            </div>

            {/* QUICK STATS */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

              <StatBox
                label="Attendance"
                value={`${participant.attendance}%`}
              />

              <StatBox
                label="Modules"
                value={`${participant.completedModules}/${participant.totalModules}`}
              />

              <StatBox
                label="Assessment"
                value={
                  participant.assessment
                }
              />

            </div>

            {/* PARTICIPANT INFO */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">

              <h3 className="text-sm font-bold">
                Participant Information
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <Info
                  label="Participant ID"
                  value={
                    participant.participantId
                  }
                />

                <Info
                  label="Full Name"
                  value={
                    participant.name
                  }
                />

                <Info
                  label="Email"
                  value={
                    participant.email
                  }
                />

                <Info
                  label="Mobile Number"
                  value={
                    participant.mobile
                  }
                />

                <Info
                  label="Address"
                  value={
                    participant.address
                  }
                />

                <Info
                  label="Enrollment Date"
                  value={
                    participant.enrollmentDate
                  }
                />

              </div>

            </section>

            {/* TRAINING */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">

              <h3 className="text-sm font-bold">
                Training Information
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <Info
                  label="Training"
                  value={
                    participant.training
                  }
                />

                <Info
                  label="Training Code"
                  value={
                    participant.trainingCode
                  }
                />

                <Info
                  label="Training Status"
                  value={
                    participant.status
                  }
                />

                <Info
                  label="Completion Status"
                  value={
                    participant.completion
                  }
                />

              </div>

            </section>

            {/* MODULE PROGRESS */}

            <section className="rounded-2xl bg-[#f7f8fa] p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Learning Progress
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {
                      participant.completedModules
                    }{" "}
                    of{" "}
                    {
                      participant.totalModules
                    }{" "}
                    modules completed
                  </p>

                </div>

                <span className="text-sm font-bold">
                  {modulePercent}%
                </span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-[#191c1e]"
                  style={{
                    width: `${modulePercent}%`,
                  }}
                />

              </div>

            </section>

            {/* ATTENDANCE */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Attendance
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {participant.attendance}%
                  </p>

                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    participant.attendance >=
                    90
                      ? "bg-emerald-50 text-emerald-700"
                      : participant.attendance >=
                          80
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {participant.attendance >=
                  90
                    ? "Good"
                    : participant.attendance >=
                        80
                      ? "Needs Attention"
                      : "Low Attendance"}
                </span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className={`h-full rounded-full ${
                    participant.attendance >=
                    90
                      ? "bg-emerald-500"
                      : participant.attendance >=
                          80
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${participant.attendance}%`,
                  }}
                />

              </div>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Mock action: opening attendance records.",
                  )
                }
                className="mt-4 rounded-xl border border-[#e7e9ec] px-4 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                View Attendance Records
              </button>

            </section>

            {/* ASSESSMENT */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Assessment
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    Exam / Assessment Result
                  </p>

                </div>

                <AssessmentBadge
                  status={
                    participant.assessment
                  }
                />

              </div>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Mock action: opening assessment results.",
                  )
                }
                className="mt-4 rounded-xl border border-[#e7e9ec] px-4 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                View Assessment Result
              </button>

            </section>

            {/* COMPLETION */}

            <section
              className={`rounded-2xl border p-5 ${
                isEligible
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-[#e7e9ec] bg-white"
              }`}
            >

              <div className="flex items-start gap-3">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    isEligible
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isEligible
                    ? "✓"
                    : "◷"}
                </div>

                <div>

                  <p className="text-xs font-bold">
                    {isEligible
                      ? "Participant is eligible for certificate"
                      : "Completion is still in progress"}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-gray-500">
                    {isEligible
                      ? "Attendance and assessment requirements have been met. Final certificate generation and release will be handled by the administrator."
                      : "Participant must complete the required training activities and assessment before becoming eligible for completion."}
                  </p>

                </div>

              </div>

            </section>

            {/* EMERGENCY CONTACT */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">

              <h3 className="text-sm font-bold">
                Emergency Contact
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <Info
                  label="Contact Person"
                  value={
                    participant.emergencyContact
                  }
                />

                <Info
                  label="Contact Number"
                  value={
                    participant.emergencyNumber
                  }
                />

              </div>

            </section>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef0f2] bg-white px-6 py-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              alert(
                "Mock action: opening attendance management.",
              )
            }
            className="rounded-xl border border-[#e7e9ec] px-4 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Attendance
          </button>

          <button
            type="button"
            onClick={() =>
              alert(
                "Mock action: opening assessment management.",
              )
            }
            className="rounded-xl border border-[#e7e9ec] px-4 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Assessment
          </button>

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
   STAT BOX
========================================================= */

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-4">

      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </p>

      <p className="mt-2 truncate text-xl font-bold tracking-tight">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-4">

      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xs font-semibold leading-5">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ⌕
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No participants found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your search or
        filters.
      </p>

    </div>
  );
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   LOCAL BADGES FOR MODAL
========================================================= */

function StatusBadge({
  status,
}: {
  status:
    | "Active"
    | "Completed"
    | "Dropped";
}) {
  const styles = {
    Active:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Completed:
      "border-blue-200 bg-blue-50 text-blue-700",

    Dropped:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function AssessmentBadge({
  status,
}: {
  status:
    | "Passed"
    | "Pending"
    | "Failed"
    | "Not Started";
}) {
  const styles = {
    Passed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Pending:
      "border-amber-200 bg-amber-50 text-amber-700",

    Failed:
      "border-red-200 bg-red-50 text-red-700",

    "Not Started":
      "border-gray-200 bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function CompletionBadge({
  status,
}: {
  status:
    | "In Progress"
    | "Completed"
    | "Eligible"
    | "Dropped";
}) {
  const styles = {
    "In Progress":
      "border-amber-200 bg-amber-50 text-amber-700",

    Completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Eligible:
      "border-blue-200 bg-blue-50 text-blue-700",

    Dropped:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}