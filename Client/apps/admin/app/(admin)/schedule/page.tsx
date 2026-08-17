"use client";

import { useMemo, useState } from "react";

type EnrollmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Waitlisted";

type Enrollment = {
  id: string;
  participantId: string;
  participantName: string;
  email: string;
  phone: string;
  training: string;
  batch: string;
  schedule: string;
  trainer: string;
  appliedDate: string;
  status: EnrollmentStatus;
  requirements: number;
  totalRequirements: number;
  remarks: string;
};

const initialEnrollments: Enrollment[] = [
  {
    id: "ENR-2026-001",
    participantId: "PT-001",
    participantName: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "0917 123 4567",
    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    schedule: "Aug 20 – Oct 20, 2026",
    trainer: "Maria Santos",
    appliedDate: "August 10, 2026",
    status: "Pending",
    requirements: 4,
    totalRequirements: 4,
    remarks: "Complete requirements. For admin review.",
  },
  {
    id: "ENR-2026-002",
    participantId: "PT-002",
    participantName: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "0918 234 5678",
    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-01",
    schedule: "Aug 20 – Oct 20, 2026",
    trainer: "Maria Santos",
    appliedDate: "August 11, 2026",
    status: "Approved",
    requirements: 4,
    totalRequirements: 4,
    remarks: "Requirements verified and enrollment approved.",
  },
  {
    id: "ENR-2026-003",
    participantId: "PT-003",
    participantName: "Pedro Reyes",
    email: "pedro.reyes@email.com",
    phone: "0919 345 6789",
    training: "Web Development Fundamentals",
    batch: "WEB-DEV-2026-01",
    schedule: "Aug 25 – Oct 30, 2026",
    trainer: "John Cruz",
    appliedDate: "August 12, 2026",
    status: "Rejected",
    requirements: 2,
    totalRequirements: 4,
    remarks: "Required documents are incomplete.",
  },
  {
    id: "ENR-2026-004",
    participantId: "PT-004",
    participantName: "Ana Mendoza",
    email: "ana.mendoza@email.com",
    phone: "0920 456 7890",
    training: "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    schedule: "Sep 01 – Nov 15, 2026",
    trainer: "Robert Flores",
    appliedDate: "August 13, 2026",
    status: "Waitlisted",
    requirements: 4,
    totalRequirements: 4,
    remarks: "Training batch has reached its current capacity.",
  },
  {
    id: "ENR-2026-005",
    participantId: "PT-005",
    participantName: "Mark Villanueva",
    email: "mark.villanueva@email.com",
    phone: "0921 567 8901",
    training: "Web Development Fundamentals",
    batch: "WEB-DEV-2026-01",
    schedule: "Aug 25 – Oct 30, 2026",
    trainer: "John Cruz",
    appliedDate: "August 13, 2026",
    status: "Approved",
    requirements: 4,
    totalRequirements: 4,
    remarks: "Enrollment successfully approved.",
  },
  {
    id: "ENR-2026-006",
    participantId: "PT-006",
    participantName: "Sofia Ramos",
    email: "sofia.ramos@email.com",
    phone: "0922 678 9012",
    training: "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    schedule: "Sep 01 – Nov 15, 2026",
    trainer: "Robert Flores",
    appliedDate: "August 14, 2026",
    status: "Pending",
    requirements: 3,
    totalRequirements: 4,
    remarks: "One requirement still needs verification.",
  },
  {
    id: "ENR-2026-007",
    participantId: "PT-007",
    participantName: "Daniel Flores",
    email: "daniel.flores@email.com",
    phone: "0923 789 0123",
    training: "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-02",
    schedule: "Sep 05 – Nov 05, 2026",
    trainer: "Maria Santos",
    appliedDate: "August 14, 2026",
    status: "Pending",
    requirements: 4,
    totalRequirements: 4,
    remarks: "Application received. Waiting for review.",
  },
  {
    id: "ENR-2026-008",
    participantId: "PT-008",
    participantName: "Rachel Cruz",
    email: "rachel.cruz@email.com",
    phone: "0924 890 1234",
    training: "Web Development Fundamentals",
    batch: "WEB-DEV-2026-02",
    schedule: "Sep 10 – Nov 20, 2026",
    trainer: "John Cruz",
    appliedDate: "August 15, 2026",
    status: "Approved",
    requirements: 4,
    totalRequirements: 4,
    remarks: "Participant is cleared for enrollment.",
  },
];

const statusStyles: Record<EnrollmentStatus, string> = {
  Pending:
    "border-amber-200 bg-amber-50 text-amber-700",
  Approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected:
    "border-red-200 bg-red-50 text-red-700",
  Waitlisted:
    "border-blue-200 bg-blue-50 text-blue-700",
};

export default function EnrollmentPage() {
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>(initialEnrollments);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | EnrollmentStatus>("All");

  const [trainingFilter, setTrainingFilter] =
    useState("All Trainings");

  const [selected, setSelected] =
    useState<Enrollment | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState<EnrollmentStatus | null>(null);

  const trainings = [
    "All Trainings",
    ...Array.from(
      new Set(enrollments.map((item) => item.training)),
    ),
  ];

  const filteredEnrollments = useMemo(() => {
    const query = search.toLowerCase().trim();

    return enrollments.filter((item) => {
      const matchesSearch =
        item.participantName.toLowerCase().includes(query) ||
        item.participantId.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.training.toLowerCase().includes(query) ||
        item.batch.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesTraining =
        trainingFilter === "All Trainings" ||
        item.training === trainingFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTraining
      );
    });
  }, [
    enrollments,
    search,
    statusFilter,
    trainingFilter,
  ]);

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

  function openDetails(enrollment: Enrollment) {
    setSelected(enrollment);
    setShowDetails(true);
  }

  function openAction(
    enrollment: Enrollment,
    status: EnrollmentStatus,
  ) {
    setSelected(enrollment);
    setShowConfirm(status);
  }

  function updateEnrollmentStatus(
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
                    : "Participant placed on the training waitlist.",
            }
          : item,
      ),
    );

    setSelected(null);
    setShowConfirm(null);
    setShowDetails(false);
  }

  function closeAllModals() {
    setSelected(null);
    setShowDetails(false);
    setShowConfirm(null);
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
          Review enrollment requests submitted by
          participants and manage their admission into
          training programs.
        </p>
      </div>

      {/* =====================================================
          INFO BANNER
      ===================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          i
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Participant enrollment requests
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Participants enroll from the available training
            programs. Their enrollment requests automatically
            appear here for administrative review.
          </p>
        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          label="Total Applications"
          value={total}
          description="All enrollment requests"
          icon="▣"
        />

        <SummaryCard
          label="Pending Review"
          value={pending}
          description="Waiting for admin decision"
          icon="◷"
          type="warning"
        />

        <SummaryCard
          label="Approved"
          value={approved}
          description="Participants admitted"
          icon="✓"
          type="success"
        />

        <SummaryCard
          label="Waitlisted"
          value={waitlisted}
          description="Waiting for available slots"
          icon="⋯"
          type="info"
        />

      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

        {/* Toolbar */}

        <div className="border-b border-[#eef0f2] p-5">

          <div className="flex flex-col gap-4">

            <div>
              <h2 className="text-sm font-bold text-[#17191c]">
                Enrollment Requests
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Applications submitted by participants.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

              {/* Search */}

              <div className="relative">

                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search participant or training..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-4 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

              </div>

              {/* Training */}

              <select
                value={trainingFilter}
                onChange={(event) =>
                  setTrainingFilter(event.target.value)
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >
                {trainings.map((training) => (
                  <option
                    key={training}
                    value={training}
                  >
                    {training}
                  </option>
                ))}
              </select>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | EnrollmentStatus,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
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

            {/* Active filters */}

            {(search ||
              statusFilter !== "All" ||
              trainingFilter !== "All Trainings") && (
              <div className="flex items-center gap-2">

                <span className="text-[11px] text-gray-400">
                  Filters active
                </span>

                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setTrainingFilter("All Trainings");
                  }}
                  className="text-[11px] font-semibold text-gray-700 underline underline-offset-2"
                >
                  Clear all
                </button>

              </div>
            )}

          </div>

        </div>

        {/* Table */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>
              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Participant
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Training Program
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Batch
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Applied
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0f1f2]">

              {filteredEnrollments.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[#fafbfc]"
                  >

                    {/* Participant */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <Avatar
                          name={
                            item.participantName
                          }
                        />

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold">
                            {
                              item.participantName
                            }
                          </p>

                          <p className="mt-0.5 truncate text-[11px] text-gray-400">
                            {item.participantId}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Training */}

                    <td className="px-5 py-4">

                      <p className="max-w-[230px] text-xs font-semibold leading-5">
                        {item.training}
                      </p>

                    </td>

                    {/* Batch */}

                    <td className="px-5 py-4">

                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-gray-600">
                        {item.batch}
                      </span>

                    </td>

                    {/* Date */}

                    <td className="px-5 py-4">

                      <p className="text-xs text-gray-600">
                        {item.appliedDate}
                      </p>

                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">

                      <StatusBadge
                        status={item.status}
                      />

                    </td>

                    {/* Action */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openDetails(item)
                          }
                          className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                          View
                        </button>

                        {item.status ===
                          "Pending" && (
                          <button
                            onClick={() =>
                              openAction(
                                item,
                                "Approved",
                              )
                            }
                            className="rounded-lg bg-[#191c1e] px-3 py-2 text-[11px] font-semibold text-white transition hover:opacity-90"
                          >
                            Review
                          </button>
                        )}

                        {item.status ===
                          "Waitlisted" && (
                          <button
                            onClick={() =>
                              openAction(
                                item,
                                "Approved",
                              )
                            }
                            className="rounded-lg bg-[#191c1e] px-3 py-2 text-[11px] font-semibold text-white transition hover:opacity-90"
                          >
                            Manage
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

          {filteredEnrollments.length ===
            0 && (
            <EmptyState />
          )}

        </div>

        {/* Footer */}

        <div className="flex flex-col gap-3 border-t border-[#eef0f2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[11px] text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              {filteredEnrollments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-600">
              {total}
            </span>{" "}
            enrollment requests
          </p>

          <div className="flex items-center gap-1">

            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e9ec] text-xs text-gray-400">
              ‹
            </button>

            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#191c1e] text-xs font-bold text-white">
              1
            </button>

            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e7e9ec] text-xs text-gray-400">
              ›
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {showDetails && selected && (
        <Modal onClose={closeAllModals}>

          <div className="flex items-start justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                Enrollment Request
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                {selected.id}
              </h2>
            </div>

            <button
              onClick={closeAllModals}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              ×
            </button>

          </div>

          {/* Participant */}

          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#f7f8fa] p-4">

            <Avatar
              name={selected.participantName}
              large
            />

            <div className="min-w-0">

              <h3 className="truncate text-lg font-bold">
                {selected.participantName}
              </h3>

              <p className="mt-1 truncate text-xs text-gray-500">
                {selected.email}
              </p>

              <p className="mt-0.5 text-xs text-gray-500">
                {selected.phone}
              </p>

              <div className="mt-2">
                <StatusBadge
                  status={selected.status}
                />
              </div>

            </div>

          </div>

          {/* Training */}

          <div className="mt-5 rounded-2xl border border-[#e7e9ec] p-5">

            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
              Training Information
            </p>

            <h3 className="mt-2 text-base font-bold">
              {selected.training}
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <Info
                label="Batch"
                value={selected.batch}
              />

              <Info
                label="Schedule"
                value={selected.schedule}
              />

              <Info
                label="Trainer"
                value={selected.trainer}
              />

              <Info
                label="Applied"
                value={selected.appliedDate}
              />

            </div>

          </div>

          {/* Requirements */}

          <div className="mt-4 rounded-2xl border border-[#e7e9ec] p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-bold">
                  Registration Requirements
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {selected.requirements} of{" "}
                  {selected.totalRequirements}{" "}
                  requirements verified
                </p>

              </div>

              <span className="text-sm font-bold">
                {Math.round(
                  (selected.requirements /
                    selected.totalRequirements) *
                    100,
                )}
                %
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-[#191c1e]"
                style={{
                  width: `${
                    (selected.requirements /
                      selected.totalRequirements) *
                    100
                  }%`,
                }}
              />

            </div>

          </div>

          {/* Remarks */}

          <div className="mt-4 rounded-2xl border border-[#e7e9ec] p-5">

            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
              Administrative Remarks
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {selected.remarks}
            </p>

          </div>

          {/* Actions */}

          {selected.status === "Pending" && (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">

              <button
                onClick={() =>
                  setShowConfirm("Approved")
                }
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                Approve Enrollment
              </button>

              <button
                onClick={() =>
                  setShowConfirm("Waitlisted")
                }
                className="flex-1 rounded-xl border border-blue-200 bg-blue-50 py-3 text-xs font-semibold text-blue-700"
              >
                Waitlist
              </button>

              <button
                onClick={() =>
                  setShowConfirm("Rejected")
                }
                className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-semibold text-red-700"
              >
                Reject
              </button>

            </div>
          )}

          <button
            onClick={closeAllModals}
            className="mt-3 w-full rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600"
          >
            Close
          </button>

        </Modal>
      )}

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      {showConfirm && selected && (
        <ConfirmModal
          status={showConfirm}
          participant={selected.participantName}
          training={selected.training}
          onCancel={() =>
            setShowConfirm(null)
          }
          onConfirm={() =>
            updateEnrollmentStatus(
              showConfirm,
            )
          }
        />
      )}

    </div>
  );
}

/* ==========================================================
   SUMMARY CARD
========================================================== */

function SummaryCard({
  label,
  value,
  description,
  icon,
  type,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  type?: "success" | "warning" | "info";
}) {
  const iconStyles = {
    success:
      "bg-emerald-50 text-emerald-700",
    warning:
      "bg-amber-50 text-amber-700",
    info:
      "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
            type
              ? iconStyles[type]
              : "bg-[#f4f5f6] text-gray-600"
          }`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-4 text-[11px] text-gray-400">
        {description}
      </p>

    </div>
  );
}

/* ==========================================================
   AVATAR
========================================================== */

function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#191c1e] font-bold text-white ${
        large
          ? "h-14 w-14 text-sm"
          : "h-9 w-9 text-[10px]"
      }`}
    >
      {initials}
    </div>
  );
}

/* ==========================================================
   STATUS BADGE
========================================================== */

function StatusBadge({
  status,
}: {
  status: EnrollmentStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

/* ==========================================================
   INFO
========================================================== */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-5">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   EMPTY STATE
========================================================== */

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ⌕
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No enrollment requests found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your search or filters.
      </p>

    </div>
  );
}

/* ==========================================================
   MODAL
========================================================== */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="my-8 w-full max-w-2xl rounded-2xl border border-white/50 bg-white p-6 shadow-2xl">

        {children}

      </div>

    </div>
  );
}

/* ==========================================================
   CONFIRMATION MODAL
========================================================== */

function ConfirmModal({
  status,
  participant,
  training,
  onCancel,
  onConfirm,
}: {
  status: EnrollmentStatus;
  participant: string;
  training: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const config = {
    Approved: {
      title: "Approve Enrollment?",
      description:
        "This participant will be officially admitted to the selected training program.",
      button: "Approve Enrollment",
      buttonClass:
        "bg-emerald-600 hover:bg-emerald-700",
      icon: "✓",
      iconClass:
        "bg-emerald-50 text-emerald-700",
    },

    Rejected: {
      title: "Reject Enrollment?",
      description:
        "This enrollment request will be marked as rejected. The participant may need to submit a new application.",
      button: "Reject Enrollment",
      buttonClass:
        "bg-red-600 hover:bg-red-700",
      icon: "!",
      iconClass:
        "bg-red-50 text-red-700",
    },

    Waitlisted: {
      title: "Waitlist Participant?",
      description:
        "The participant will remain in the enrollment queue until a training slot becomes available.",
      button: "Add to Waitlist",
      buttonClass:
        "bg-blue-600 hover:bg-blue-700",
      icon: "⋯",
      iconClass:
        "bg-blue-50 text-blue-700",
    },

    Pending: {
      title: "Set Pending?",
      description:
        "The enrollment will remain pending for administrative review.",
      button: "Set Pending",
      buttonClass:
        "bg-gray-800 hover:bg-gray-900",
      icon: "◷",
      iconClass:
        "bg-gray-100 text-gray-700",
    },
  }[status];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${config.iconClass}`}
        >
          {config.icon}
        </div>

        <h2 className="mt-5 text-xl font-bold tracking-tight">
          {config.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {config.description}
        </p>

        <div className="mt-4 rounded-xl bg-[#f7f8fa] p-4">

          <p className="text-xs font-bold">
            {participant}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {training}
          </p>

        </div>

        <div className="mt-6 flex gap-3">

          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-3 text-xs font-semibold text-white transition ${config.buttonClass}`}
          >
            {config.button}
          </button>

        </div>

      </div>

    </div>
  );
}