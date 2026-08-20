"use client";

import {
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
  Enrollment,
  EnrollmentStatus,
} from "./type";

const initialEnrollments: Enrollment[] = [
  {
    id: "ENR-2026-001",
    participantId: "PT-001",
    participantName: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "0917 123 4567",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    schedule:
      "Aug 20 – Oct 20, 2026",
    trainer: "Maria Santos",
    appliedDate: "August 10, 2026",
    status: "Pending",
    requirements: 4,
    totalRequirements: 4,
    remarks:
      "Complete requirements. For admin review.",
  },

  {
    id: "ENR-2026-002",
    participantId: "PT-002",
    participantName: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "0918 234 5678",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    schedule:
      "Aug 20 – Oct 20, 2026",
    trainer: "Maria Santos",
    appliedDate: "August 11, 2026",
    status: "Approved",
    requirements: 4,
    totalRequirements: 4,
    remarks:
      "Requirements verified and enrollment approved.",
  },

  {
    id: "ENR-2026-003",
    participantId: "PT-003",
    participantName: "Pedro Reyes",
    email: "pedro.reyes@email.com",
    phone: "0919 345 6789",
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-01",
    schedule:
      "Aug 25 – Oct 30, 2026",
    trainer: "John Cruz",
    appliedDate: "August 12, 2026",
    status: "Rejected",
    requirements: 2,
    totalRequirements: 4,
    remarks:
      "Required documents are incomplete.",
  },

  {
    id: "ENR-2026-004",
    participantId: "PT-004",
    participantName: "Ana Mendoza",
    email: "ana.mendoza@email.com",
    phone: "0920 456 7890",
    training:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    schedule:
      "Sep 01 – Nov 15, 2026",
    trainer: "Robert Flores",
    appliedDate: "August 13, 2026",
    status: "Waitlisted",
    requirements: 4,
    totalRequirements: 4,
    remarks:
      "Training batch has reached its current capacity.",
  },

  {
    id: "ENR-2026-005",
    participantId: "PT-005",
    participantName: "Mark Villanueva",
    email: "mark.villanueva@email.com",
    phone: "0921 567 8901",
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-01",
    schedule:
      "Aug 25 – Oct 30, 2026",
    trainer: "John Cruz",
    appliedDate: "August 13, 2026",
    status: "Approved",
    requirements: 4,
    totalRequirements: 4,
    remarks:
      "Enrollment successfully approved.",
  },

  {
    id: "ENR-2026-006",
    participantId: "PT-006",
    participantName: "Sofia Ramos",
    email: "sofia.ramos@email.com",
    phone: "0922 678 9012",
    training:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    schedule:
      "Sep 01 – Nov 15, 2026",
    trainer: "Robert Flores",
    appliedDate: "August 14, 2026",
    status: "Pending",
    requirements: 3,
    totalRequirements: 4,
    remarks:
      "One requirement still needs verification.",
  },

  {
    id: "ENR-2026-007",
    participantId: "PT-007",
    participantName: "Daniel Flores",
    email: "daniel.flores@email.com",
    phone: "0923 789 0123",
    training:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-02",
    schedule:
      "Sep 05 – Nov 05, 2026",
    trainer: "Maria Santos",
    appliedDate: "August 14, 2026",
    status: "Pending",
    requirements: 4,
    totalRequirements: 4,
    remarks:
      "Application received. Waiting for review.",
  },

  {
    id: "ENR-2026-008",
    participantId: "PT-008",
    participantName: "Rachel Cruz",
    email: "rachel.cruz@email.com",
    phone: "0924 890 1234",
    training:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    schedule:
      "Sep 10 – Nov 20, 2026",
    trainer: "John Cruz",
    appliedDate: "August 15, 2026",
    status: "Approved",
    requirements: 4,
    totalRequirements: 4,
    remarks:
      "Participant is cleared for enrollment.",
  },
];

export default function EnrollmentPage() {
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>(
      initialEnrollments,
    );

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | EnrollmentStatus
    >("All");

  const [trainingFilter, setTrainingFilter] =
    useState("All Trainings");

  const [selected, setSelected] =
    useState<Enrollment | null>(null);

  const [modal, setModal] = useState<
    "view" |
      "approve" |
      "reject" |
      "waitlist" |
      null
  >(null);

  const trainings = useMemo(
    () => [
      "All Trainings",
      ...Array.from(
        new Set(
          enrollments.map(
            (item) => item.training,
          ),
        ),
      ),
    ],
    [enrollments],
  );

  const total = enrollments.length;

  const pending = enrollments.filter(
    (item) => item.status === "Pending",
  ).length;

  const approved = enrollments.filter(
    (item) => item.status === "Approved",
  ).length;

  const waitlisted = enrollments.filter(
    (item) => item.status === "Waitlisted",
  ).length;

  function viewEnrollment(
    enrollment: Enrollment,
  ) {
    setSelected(enrollment);
    setModal("view");
  }

  function approveEnrollment(
    enrollment: Enrollment,
  ) {
    setSelected(enrollment);
    setModal("approve");
  }

  function rejectEnrollment(
    enrollment: Enrollment,
  ) {
    setSelected(enrollment);
    setModal("reject");
  }

  function waitlistEnrollment(
    enrollment: Enrollment,
  ) {
    setSelected(enrollment);
    setModal("waitlist");
  }

  function updateStatus(
    status: EnrollmentStatus,
  ) {
    if (!selected) return;

    setEnrollments((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              status,
              remarks:
                status === "Approved"
                  ? "Enrollment approved by administrator."
                  : status === "Rejected"
                    ? "Enrollment rejected by administrator."
                    : status ===
                        "Waitlisted"
                      ? "Participant placed on the training waitlist."
                      : item.remarks,
            }
          : item,
      ),
    );

    setSelected(null);
    setModal(null);
  }

  const tableMeta = {
    onView: viewEnrollment,
    onApprove: approveEnrollment,
    onReject: rejectEnrollment,
    onWaitlist: waitlistEnrollment,
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <span>Operations</span>
          <span>/</span>
          <span className="font-medium text-gray-600">
            Enrollment
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
          Enrollment Management
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Review enrollment requests submitted
          by participants and manage their
          admission into training programs.
        </p>
      </div>

      {/* INFO */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-sm font-semibold text-blue-900">
          Participant enrollment requests
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Participants enroll from available
          training programs. Their enrollment
          requests appear here for administrative
          review.
        </p>
      </div>

      {/* STAT GRID */}

      <StatGrid>

        <StatCard
          title="Total Applications"
          value={total}
          description="All enrollment requests"
        />

        <StatCard
          title="Pending Review"
          value={pending}
          description="Waiting for admin decision"
        />

        <StatCard
          title="Approved"
          value={approved}
          description="Participants admitted"
        />

        <StatCard
          title="Waitlisted"
          value={waitlisted}
          description="Waiting for available slots"
        />

      </StatGrid>

      {/* TABLE */}

      <DataTable
        title="Enrollment Requests"
        description="Applications submitted by participants."
        columns={columns}
        data={enrollments}
        searchable
        searchPlaceholder="Search participant or training..."
        meta={tableMeta}
        toolbar={
          <div className="flex flex-wrap gap-2">

            <select
              value={trainingFilter}
              onChange={(event) =>
                setTrainingFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none"
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

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | EnrollmentStatus,
                )
              }
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none"
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Waitlisted">
                Waitlisted
              </option>
            </select>

          </div>
        }
      />

      {/* VIEW MODAL */}

      {modal === "view" &&
        selected && (
          <EnrollmentModal
            title="Enrollment Details"
            enrollment={selected}
            onClose={() => {
              setSelected(null);
              setModal(null);
            }}
          >
            {selected.status ===
              "Pending" && (
              <div className="mt-6 grid gap-2 sm:grid-cols-3">

                <button
                  type="button"
                  onClick={() =>
                    setModal("approve")
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModal("waitlist")
                  }
                  className="rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Waitlist
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModal("reject")
                  }
                  className="rounded-xl bg-red-600 px-4 py-3 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Reject
                </button>

              </div>
            )}
          </EnrollmentModal>
        )}

      {/* CONFIRM MODAL */}

      {(modal === "approve" ||
        modal === "reject" ||
        modal === "waitlist") &&
        selected && (
          <ConfirmModal
            enrollment={selected}
            status={
              modal === "approve"
                ? "Approved"
                : modal === "reject"
                  ? "Rejected"
                  : "Waitlisted"
            }
            onClose={() => {
              setModal("view");
            }}
            onConfirm={() =>
              updateStatus(
                modal === "approve"
                  ? "Approved"
                  : modal === "reject"
                    ? "Rejected"
                    : "Waitlisted",
              )
            }
          />
        )}

    </div>
  );
}

/* =========================================================
   ENROLLMENT MODAL
========================================================= */

function EnrollmentModal({
  enrollment,
  title,
  onClose,
  children,
}: {
  enrollment: Enrollment;
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const percentage =
    enrollment.totalRequirements > 0
      ? Math.round(
          (enrollment.requirements /
            enrollment.totalRequirements) *
            100,
        )
      : 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">

      <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]">

        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Enrollment Request
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {title}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {enrollment.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

          {/* PARTICIPANT */}

          <div className="rounded-2xl bg-gray-50 p-4">

            <p className="text-lg font-bold">
              {enrollment.participantName}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {enrollment.email}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {enrollment.phone}
            </p>

          </div>

          {/* TRAINING */}

          <div className="mt-5">

            <h3 className="text-sm font-bold">
              Training Information
            </h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">

              <Info
                label="Training"
                value={enrollment.training}
              />

              <Info
                label="Batch"
                value={enrollment.batch}
              />

              <Info
                label="Schedule"
                value={enrollment.schedule}
              />

              <Info
                label="Trainer"
                value={enrollment.trainer}
              />

              <Info
                label="Applied"
                value={enrollment.appliedDate}
              />

              <Info
                label="Status"
                value={enrollment.status}
              />

            </div>

          </div>

          {/* REQUIREMENTS */}

          <div className="mt-5 rounded-2xl border border-gray-200 p-4">

            <div className="flex justify-between">

              <div>
                <p className="text-sm font-bold">
                  Requirements
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {enrollment.requirements} of{" "}
                  {enrollment.totalRequirements}{" "}
                  verified
                </p>
              </div>

              <span className="text-sm font-bold">
                {percentage}%
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#191c1e]"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>

          </div>

          {/* REMARKS */}

          <div className="mt-5 rounded-2xl border border-gray-200 p-4">

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Administrative Remarks
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {enrollment.remarks}
            </p>

          </div>

          {children}

        </div>

        <div className="shrink-0 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   CONFIRM MODAL
========================================================= */

function ConfirmModal({
  enrollment,
  status,
  onClose,
  onConfirm,
}: {
  enrollment: Enrollment;
  status: EnrollmentStatus;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const config = {
    Approved: {
      title: "Approve Enrollment?",
      description:
        "The participant will be officially admitted to this training program.",
      action: "Approve Enrollment",
      className:
        "bg-emerald-600 hover:bg-emerald-700",
    },

    Rejected: {
      title: "Reject Enrollment?",
      description:
        "This enrollment request will be marked as rejected.",
      action: "Reject Enrollment",
      className:
        "bg-red-600 hover:bg-red-700",
    },

    Waitlisted: {
      title: "Waitlist Participant?",
      description:
        "The participant will be placed on the training waitlist.",
      action: "Add to Waitlist",
      className:
        "bg-blue-600 hover:bg-blue-700",
    },

    Pending: {
      title: "Keep Pending?",
      description:
        "The enrollment will remain pending.",
      action: "Keep Pending",
      className:
        "bg-gray-800 hover:bg-gray-900",
    },
  }[status];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Enrollment Decision
        </p>

        <h2 className="mt-2 text-xl font-bold">
          {config.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {config.description}
        </p>

        <div className="mt-5 rounded-xl bg-gray-50 p-4">

          <p className="text-sm font-bold">
            {enrollment.participantName}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {enrollment.training}
          </p>

          <p className="mt-1 font-mono text-[10px] text-gray-400">
            {enrollment.batch}
          </p>

        </div>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-xs font-semibold text-white ${config.className}`}
          >
            {config.action}
          </button>

        </div>

      </div>

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