"use client";

import * as React from "react";

import type { ColumnDef } from "@tanstack/react-table";

import type { Enrollment } from "@repo/types";

import {
  Eye,
  CheckCircle2,
  Clock3,
  XCircle,
  MinusCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export type TrainerParticipant = Enrollment & {
  participant?: {
    id?: string;
    userId?: string;
    userCode?: string;
    fullName?: string;
    email?: string;
    mobileNumber?: string | null;
    profileImageUrl?: string | null;
  } | null;
};

export type AttendanceProgress = {
  enrollmentId: string;
  totalSessions?: number;
  attendedSessions?: number;
  presentSessions?: number;
  lateSessions?: number;
  absentSessions?: number;
  attendanceRate?: number;
};

export type TrainerStudentTableMeta = {
  onView: (participant: TrainerParticipant) => void;

  attendanceByEnrollmentId: Map<
    string,
    AttendanceProgress
  >;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(
  status?: string | null,
): string {
  return (
    status
      ?.trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "") ?? ""
  );
}

function getParticipantName(
  participant: TrainerParticipant,
): string {
  return (
    participant.participant?.fullName?.trim() ||
    "Unknown Participant"
  );
}

function getParticipantCode(
  participant: TrainerParticipant,
): string {
  return (
    participant.participant?.userCode?.trim() ||
    "—"
  );
}

function getParticipantEmail(
  participant: TrainerParticipant,
): string {
  return (
    participant.participant?.email?.trim() ||
    "—"
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
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
   STATUS BADGE
========================================================= */

export function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "approved" ||
    normalized === "active" ||
    normalized === "completed"
  ) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-emerald-50
          px-2.5
          py-1
          text-xs
          font-semibold
          text-emerald-700
        "
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {status || "Active"}
      </span>
    );
  }

  if (
    normalized === "pending" ||
    normalized === "forreview"
  ) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-amber-50
          px-2.5
          py-1
          text-xs
          font-semibold
          text-amber-700
        "
      >
        <Clock3 className="h-3.5 w-3.5" />
        {status || "Pending"}
      </span>
    );
  }

  if (
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-red-50
          px-2.5
          py-1
          text-xs
          font-semibold
          text-red-700
        "
      >
        <XCircle className="h-3.5 w-3.5" />
        {status || "Rejected"}
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-gray-100
        px-2.5
        py-1
        text-xs
        font-semibold
        text-gray-600
      "
    >
      <MinusCircle className="h-3.5 w-3.5" />
      {status || "Unknown"}
    </span>
  );
}

/* =========================================================
   ATTENDANCE DISPLAY
========================================================= */

function AttendanceCell({
  attendance,
}: {
  attendance?: AttendanceProgress;
}) {
  if (!attendance) {
    return (
      <div className="text-sm text-gray-400">
        No attendance
      </div>
    );
  }

  const attended =
    attendance.attendedSessions ??
    attendance.presentSessions ??
    0;

  const total =
    attendance.totalSessions ??
    0;

  const late =
    attendance.lateSessions ??
    0;

  const absent =
    attendance.absentSessions ??
    0;

  let rate = attendance.attendanceRate;

  if (
    rate === undefined &&
    total > 0
  ) {
    rate = (attended / total) * 100;
  }

  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-800">
          {attended}/{total}
        </span>

        <span className="text-xs font-medium text-gray-500">
          {rate !== undefined
            ? `${Math.round(rate)}%`
            : "—"}
        </span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#191c1e] transition-all"
          style={{
            width: `${Math.min(
              Math.max(rate ?? 0, 0),
              100,
            )}%`,
          }}
        />
      </div>

      <div className="mt-1.5 flex gap-3 text-[11px] text-gray-400">
        {late > 0 && (
          <span>
            {late} late
          </span>
        )}

        {absent > 0 && (
          <span>
            {absent} absent
          </span>
        )}

        {late === 0 &&
          absent === 0 && (
            <span>
              Good attendance
            </span>
          )}
      </div>
    </div>
  );
}

/* =========================================================
   COLUMNS
========================================================= */

export const columns: ColumnDef<TrainerParticipant>[] =
  [
    /* -----------------------------------------------------
       PARTICIPANT
    ----------------------------------------------------- */
    {
      accessorKey: "participant.fullName",
      id: "participant",
      header: "Participant",

      cell: ({ row }) => {
        const participant =
          row.original;

        const name =
          getParticipantName(
            participant,
          );

        const code =
          getParticipantCode(
            participant,
          );

        const email =
          getParticipantEmail(
            participant,
          );

        const profileImage =
          participant.participant
            ?.profileImageUrl ??
          null;

        return (
          <div className="flex min-w-[230px] items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="
                  h-11
                  w-11
                  shrink-0
                  rounded-xl
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  h-11
                  w-11
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
              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-gray-900
                "
              >
                {name}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-gray-500
                "
              >
                {code}
              </p>

              {email !== "—" && (
                <p
                  className="
                    max-w-[220px]
                    truncate
                    text-xs
                    text-gray-400
                  "
                >
                  {email}
                </p>
              )}
            </div>
          </div>
        );
      },
    },

    /* -----------------------------------------------------
       TRAINING
    ----------------------------------------------------- */
    {
      accessorKey: "programName",
      id: "training",
      header: "Training",

      cell: ({ row }) => {
        const participant =
          row.original;

        return (
          <div className="min-w-[180px]">
            <p className="text-sm font-semibold text-gray-800">
              {participant.programName ||
                "—"}
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
              {participant.batchCode ||
                "No batch"}
            </p>
          </div>
        );
      },
    },

    /* -----------------------------------------------------
       STATUS
    ----------------------------------------------------- */
    {
      accessorKey: "status",
      id: "status",
      header: "Status",

      cell: ({ row }) => {
        return (
          <StatusBadge
            status={
              row.original.status
            }
          />
        );
      },
    },

    /* -----------------------------------------------------
       ATTENDANCE
    ----------------------------------------------------- */
    {
      id: "attendance",
      header: "Attendance",

      cell: ({
        row,
        table,
      }) => {
        const meta =
          table.options.meta as
            | TrainerStudentTableMeta
            | undefined;

        const attendance =
          meta?.attendanceByEnrollmentId.get(
            row.original.id,
          );

        return (
          <AttendanceCell
            attendance={attendance}
          />
        );
      },
    },

    /* -----------------------------------------------------
       ENROLLED
    ----------------------------------------------------- */
    {
      accessorKey: "enrolledAt",
      id: "enrolledAt",
      header: "Enrolled",

      cell: ({ row }) => {
        return (
          <span className="whitespace-nowrap text-sm text-gray-600">
            {formatDate(
              row.original.enrolledAt,
            )}
          </span>
        );
      },
    },

    /* -----------------------------------------------------
       ACTION
    ----------------------------------------------------- */
    {
      id: "action",
      header: "Action",

      enableSorting: false,

      cell: ({
        row,
        table,
      }) => {
        const meta =
          table.options.meta as
            | TrainerStudentTableMeta
            | undefined;

        return (
          <button
            type="button"
            onClick={() =>
              meta?.onView(
                row.original,
              )
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-gray-200
              bg-white
              px-3
              py-2
              text-xs
              font-semibold
              text-gray-700
              transition
              hover:border-gray-300
              hover:bg-gray-50
              hover:text-gray-900
            "
          >
            <Eye className="h-4 w-4" />

            View
          </button>
        );
      },
    },
  ];