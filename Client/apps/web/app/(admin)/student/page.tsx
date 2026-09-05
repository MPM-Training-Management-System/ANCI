"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Users,
  CheckCircle2,
  Clock3,
  XCircle,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

import {
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  DataTable,
} from "@repo/ui/index";

import {
  useEnrollments,
  useAttendanceProgress,
} from "@repo/hooks";

import {
  enrollmentApi,
  attendanceApi,
} from "@/lib/api";

import type {
  Enrollment,
} from "@repo/types";

import {
  columns,
  StatusBadge,
  type TrainerParticipant,
  type TrainerStudentTableMeta,
} from "./columns";

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(
  status: unknown,
): string {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function getParticipantName(
  enrollment: TrainerParticipant,
): string {
  return (
    enrollment.participant?.fullName?.trim() ||
    "Participant"
  );
}

function getParticipantCode(
  enrollment: TrainerParticipant,
): string {
  return (
    enrollment.participant?.userCode?.trim() ||
    enrollment.participant?.id ||
    "—"
  );
}

function getParticipantEmail(
  enrollment: TrainerParticipant,
): string {
  return (
    enrollment.participant?.email?.trim() ||
    "—"
  );
}

function getInitials(
  name: string,
): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerStudentProgressPage() {
  /* =======================================================
     APIS
  ======================================================= */

  const {
    trainerEnrollments,
    loadTrainerEnrollments,
    isLoading,
    error,
  } = useEnrollments(
    enrollmentApi,
  );

  const {
    attendanceProgress,
    loadAttendanceProgress,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useAttendanceProgress(
    attendanceApi,
  );

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    trainingFilter,
    setTrainingFilter,
  ] = useState(
    "All Trainings",
  );

  const [
    selected,
    setSelected,
  ] = useState<TrainerParticipant | null>(
    null,
  );

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadTrainerEnrollments().catch(() => {
      // Hook handles the error.
    });

    loadAttendanceProgress().catch(() => {
      // Hook handles the error.
    });
  }, [
    loadTrainerEnrollments,
    loadAttendanceProgress,
  ]);

  /* =======================================================
     NORMALIZE PARTICIPANTS
  ======================================================= */

  const participants =
    useMemo(
      () =>
        (
          trainerEnrollments ?? []
        ) as TrainerParticipant[],
      [
        trainerEnrollments,
      ],
    );

  /* =======================================================
     ATTENDANCE MAP
  ======================================================= */

  const attendanceByEnrollmentId =
    useMemo(() => {
      return new Map(
        attendanceProgress.map(
          (progress) => [
            progress.enrollmentId,
            progress,
          ],
        ),
      );
    }, [
      attendanceProgress,
    ]);

  /* =======================================================
     TRAINING OPTIONS
  ======================================================= */

  const trainingOptions =
    useMemo(() => {
      const names =
        participants
          .map(
            (item) =>
              item.programName,
          )
          .filter(Boolean);

      return [
        "All Trainings",
        ...Array.from(
          new Set(names),
        ),
      ];
    }, [
      participants,
    ]);

  /* =======================================================
     FILTER PARTICIPANTS
  ======================================================= */

  const filteredParticipants =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return participants.filter(
        (participant) => {
          const name =
            getParticipantName(
              participant,
            ).toLowerCase();

          const code =
            getParticipantCode(
              participant,
            ).toLowerCase();

          const email =
            getParticipantEmail(
              participant,
            ).toLowerCase();

          const program =
            (
              participant.programName ??
              ""
            ).toLowerCase();

          const batch =
            (
              participant.batchCode ??
              ""
            ).toLowerCase();

          const matchesSearch =
            !query ||
            name.includes(query) ||
            code.includes(query) ||
            email.includes(query) ||
            program.includes(query) ||
            batch.includes(query);

          const status =
            normalizeStatus(
              participant.status,
            );

          const selectedStatus =
            normalizeStatus(
              statusFilter,
            );

          const matchesStatus =
            statusFilter === "All" ||
            status === selectedStatus;

          const matchesTraining =
            trainingFilter ===
              "All Trainings" ||
            participant.programName ===
              trainingFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesTraining
          );
        },
      );
    }, [
      participants,
      search,
      statusFilter,
      trainingFilter,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalParticipants =
    participants.length;

  const approvedCount =
    participants.filter(
      (item) =>
        normalizeStatus(
          item.status,
        ) === "approved",
    ).length;

  const completedCount =
    participants.filter(
      (item) =>
        normalizeStatus(
          item.status,
        ) === "completed",
    ).length;

  const pendingCount =
    participants.filter(
      (item) => {
        const status =
          normalizeStatus(
            item.status,
          );

        return (
          status === "pending" ||
          status === "underreview" ||
          status ===
            "needscorrection"
        );
      },
    ).length;

  /* =======================================================
     REFRESH
  ======================================================= */

  async function handleRefresh() {
    await Promise.allSettled([
      loadTrainerEnrollments(),
      loadAttendanceProgress(),
    ]);
  }

  /* =======================================================
     TABLE META
  ======================================================= */

  const tableMeta:
    TrainerStudentTableMeta = {
    onView: setSelected,
    attendanceByEnrollmentId:
      attendanceByEnrollmentId,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>Trainer</span>

            <span>/</span>

            <span className="font-medium text-gray-600">
              Student Progress
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Student Progress
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Monitor students enrolled in
            the training batches assigned
            to you.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={
            isLoading ||
            attendanceLoading
          }
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-[#e7e9ec]
            bg-white
            px-4
            text-xs
            font-semibold
            text-gray-700
            transition
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={14}
            className={
              isLoading ||
              attendanceLoading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ===================================================
          API INFO
      =================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <Users size={16} />
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Assigned students only
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            This list is loaded from the
            trainer enrollment API. Only
            students enrolled in training
            batches assigned to the
            logged-in trainer are displayed.
          </p>
        </div>
      </div>

      {/* ===================================================
          ENROLLMENT ERROR
      =================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Failed to load students
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {error.message}
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                className="
                  mt-3
                  rounded-lg
                  bg-red-600
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  hover:bg-red-700
                "
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          ATTENDANCE ERROR
      =================================================== */}

      {attendanceError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Clock3
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                Attendance data unavailable
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                {attendanceError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          STATISTICS
      =================================================== */}

      <StatGrid>
        <StatCard
          title="Total Students"
          value={
            isLoading
              ? "..."
              : totalParticipants
          }
          description="Assigned training batches"
          variant="primary"
        />

        <StatCard
          title="Approved"
          value={
            isLoading
              ? "..."
              : approvedCount
          }
          description="Currently enrolled"
          variant="success"
        />

        <StatCard
          title="Completed"
          value={
            isLoading
              ? "..."
              : completedCount
          }
          description="Completed enrollment"
          variant="success"
        />

        <StatCard
          title="Pending"
          value={
            isLoading
              ? "..."
              : pendingCount
          }
          description="Awaiting approval"
          variant="warning"
        />
      </StatGrid>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#17191c]">
              Students
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Search students and filter by
              training or enrollment status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={15}
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search student..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-[#e7e9ec]
                  bg-[#f8f9fa]
                  pl-10
                  pr-4
                  text-xs
                  outline-none
                  transition
                  focus:border-gray-300
                  focus:bg-white
                "
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
              className="
                h-11
                rounded-xl
                border
                border-[#e7e9ec]
                bg-[#f8f9fa]
                px-3
                text-xs
                font-medium
                outline-none
                transition
                focus:border-gray-300
                focus:bg-white
              "
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
              className="
                h-11
                rounded-xl
                border
                border-[#e7e9ec]
                bg-[#f8f9fa]
                px-3
                text-xs
                font-medium
                outline-none
                transition
                focus:border-gray-300
                focus:bg-white
              "
            >
              <option value="All">
                All Status
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="UnderReview">
                Under Review
              </option>

              <option value="NeedsCorrection">
                Needs Correction
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* ===================================================
          DATA TABLE
      =================================================== */}

      <DataTable<TrainerParticipant>
        title="Assigned Students"
        description={
          `Showing ${filteredParticipants.length} ` +
          `of ${participants.length} students`
        }
        columns={columns}
        data={filteredParticipants}
        loading={
          isLoading ||
          attendanceLoading
        }
        searchable={false}
        showPagination={true}
        emptyTitle="No students found"
        emptyDescription={
          "No students match your current " +
          "search or filters."
        }
        meta={tableMeta}
      />

      {/* ===================================================
          STUDENT DETAIL MODAL
      =================================================== */}

      {selected && (
        <StudentDetailModal
          enrollment={selected}
          attendance={
            attendanceByEnrollmentId.get(
              selected.id,
            )
          }
          onClose={() =>
            setSelected(null)
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   STUDENT DETAIL MODAL
========================================================= */

function StudentDetailModal({
  enrollment,
  attendance,
  onClose,
}: {
  enrollment: TrainerParticipant;

  attendance?: {
    enrollmentId: string;
    trainingBatchId: string;
    participantName: string;
    totalSessions: number;
    attendedSessions: number;
    lateSessions: number;
    absentSessions: number;
    attendancePercentage: number;
  };

  onClose: () => void;
}) {
  const name =
    getParticipantName(
      enrollment,
    );

  const code =
    getParticipantCode(
      enrollment,
    );

  const email =
    getParticipantEmail(
      enrollment,
    );

  const mobile =
    enrollment.participant
      ?.mobileNumber ??
    "—";

  const profileImage =
    enrollment.participant
      ?.profileImageUrl ??
    null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[500]
        flex
        items-center
        justify-center
        bg-black/40
        p-3
        backdrop-blur-[2px]
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-[#eef0f2] px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="
                  h-12
                  w-12
                  shrink-0
                  rounded-xl
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#191c1e]
                  text-xs
                  font-bold
                  text-white
                "
              >
                {getInitials(name)}
              </div>
            )}

            <div className="min-w-0">
              <p className="font-mono text-[10px] text-gray-400">
                {code}
              </p>

              <h2 className="mt-1 truncate text-lg font-bold text-[#17191c]">
                {name}
              </h2>

              <p className="mt-1 truncate text-xs text-gray-500">
                {email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              ml-4
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-lg
              text-gray-500
              transition
              hover:bg-gray-200
            "
          >
            ×
          </button>
        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="space-y-4">
            {/* STATUS */}

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                status={
                  enrollment.status
                }
              />
            </div>

            {/* TRAINING */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <GraduationCap
                    size={18}
                    className="text-gray-600"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Training
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#17191c]">
                    {
                      enrollment.programName
                    }
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Batch:{" "}
                    {
                      enrollment.batchCode
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* STUDENT INFORMATION */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">
              <h3 className="text-sm font-bold text-[#17191c]">
                Student Information
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoBox
                  label="Student ID"
                  value={code}
                />

                <InfoBox
                  label="Full Name"
                  value={name}
                />

                <InfoBox
                  label="Email"
                  value={email}
                />

                <InfoBox
                  label="Mobile Number"
                  value={mobile}
                />

                <InfoBox
                  label="Enrollment Date"
                  value={formatDate(
                    enrollment.enrolledAt,
                  )}
                />

                <InfoBox
                  label="Enrollment Status"
                  value={
                    enrollment.status ??
                    "—"
                  }
                />
              </div>
            </section>

            {/* ENROLLMENT */}

            <section className="rounded-2xl bg-[#f7f8fa] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Enrollment ID
              </p>

              <p className="mt-2 break-all font-mono text-xs font-semibold text-gray-700">
                {enrollment.id}
              </p>

              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Training Batch ID
              </p>

              <p className="mt-2 break-all font-mono text-xs font-semibold text-gray-700">
                {
                  enrollment.trainingBatchId
                }
              </p>
            </section>

            {/* ATTENDANCE PROGRESS */}

            <section className="rounded-2xl border border-[#e7e9ec] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Attendance Progress
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#17191c]">
                    {attendance
                      ? `${attendance.attendancePercentage}%`
                      : "—"}
                  </p>
                </div>

                {attendance && (
                  <span
                    className={`
                      rounded-full
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      ${
                        attendance.attendancePercentage >=
                        90
                          ? "bg-emerald-50 text-emerald-700"
                          : attendance.attendancePercentage >=
                              80
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }
                    `}
                  >
                    {attendance.attendancePercentage >=
                    90
                      ? "Good"
                      : attendance.attendancePercentage >=
                          80
                        ? "Needs Attention"
                        : "Low Attendance"}
                  </span>
                )}
              </div>

              {attendance ? (
                <>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`
                        h-full
                        rounded-full
                        ${
                          attendance.attendancePercentage >=
                          90
                            ? "bg-emerald-500"
                            : attendance.attendancePercentage >=
                                80
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }
                      `}
                      style={{
                        width: `${Math.min(
                          Math.max(
                            attendance.attendancePercentage,
                            0,
                          ),
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <InfoBox
                      label="Attended"
                      value={`${attendance.attendedSessions} / ${attendance.totalSessions}`}
                    />

                    <InfoBox
                      label="Late"
                      value={String(
                        attendance.lateSessions,
                      )}
                    />

                    <InfoBox
                      label="Absent"
                      value={String(
                        attendance.absentSessions,
                      )}
                    />

                    <InfoBox
                      label="Attendance"
                      value={`${attendance.attendancePercentage}%`}
                    />
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold text-gray-600">
                    No attendance records yet
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-gray-400">
                    Attendance progress will
                    appear here once attendance
                    sessions are recorded.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t border-[#eef0f2] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              bg-[#191c1e]
              px-5
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:opacity-90
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
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

      <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-gray-700">
        {value}
      </p>
    </div>
  );
}