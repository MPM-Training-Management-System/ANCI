"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AttendanceRecordDto } from "@repo/types";

type AttendanceTableRecord = AttendanceRecordDto & {
  profileImageUrl?: string | null;
};

export const columns: ColumnDef<AttendanceTableRecord>[] = [
  // =========================================================
  // PARTICIPANT
  // =========================================================
  {
    id: "participant",
    accessorKey: "participantName",
    header: "Participant",
    cell: ({ row }) => {
      const record = row.original;

      return (
        <div className="flex items-center gap-3">
          {/* PROFILE */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
            {record.profileImageUrl ? (
              <img
                src={record.profileImageUrl}
                alt={record.participantName}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : (
              getInitials(record.participantName)
            )}
          </div>

          {/* NAME */}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-gray-900">
              {record.participantName}
            </p>

            <p className="mt-1 font-mono text-[10px] text-gray-400">
              {record.id.slice(0, 8)}
            </p>
          </div>
        </div>
      );
    },
  },

  // =========================================================
  // STATUS
  // =========================================================
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "Unknown";

      const normalized = status
        .toLowerCase()
        .replace(/[\s_-]/g, "");

      let statusClass =
        "border-gray-200 bg-gray-50 text-gray-600";

      if (normalized === "present") {
        statusClass =
          "border-emerald-200 bg-emerald-50 text-emerald-700";
      }

      if (normalized === "late") {
        statusClass =
          "border-amber-200 bg-amber-50 text-amber-700";
      }

      if (normalized === "absent") {
        statusClass =
          "border-red-200 bg-red-50 text-red-700";
      }

      if (normalized === "timeinonly") {
        statusClass =
          "border-blue-200 bg-blue-50 text-blue-700";
      }

      if (normalized === "timeoutonly") {
        statusClass =
          "border-purple-200 bg-purple-50 text-purple-700";
      }

      return (
        <span
          className={[
            "inline-flex rounded-full border",
            "px-2.5 py-1.5",
            "text-[9px] font-bold",
            statusClass,
          ].join(" ")}
        >
          {status}
        </span>
      );
    },
  },

  // =========================================================
  // TIME IN
  // =========================================================
  {
    id: "timeIn",
    accessorKey: "timeIn",
    header: "Time In",
    cell: ({ row }) => {
      return <TimeValue value={row.original.timeIn} />;
    },
  },

  // =========================================================
  // TIME OUT
  // =========================================================
  {
    id: "timeOut",
    accessorKey: "timeOut",
    header: "Time Out",
    cell: ({ row }) => {
      return <TimeValue value={row.original.timeOut} />;
    },
  },

  // =========================================================
  // METHOD
  // =========================================================
  {
    id: "method",
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => {
      const method = row.original.method || "Unknown";

      return (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[9px] font-bold text-gray-600">
          {method}
        </span>
      );
    },
  },
];

// =============================================================
// TIME VALUE
// =============================================================

function TimeValue({
  value,
}: {
  value: string | null;
}) {
  if (!value) {
    return (
      <span className="text-xs text-gray-300">
        —
      </span>
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return (
      <span className="text-xs text-gray-500">
        {value}
      </span>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-700">
        {date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      <p className="mt-0.5 text-[9px] text-gray-400">
        {date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

// =============================================================
// INITIALS
// =============================================================

function getInitials(
  name: string,
): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0).toUpperCase(),
    )
    .join("");
}