"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  AttendanceRecord,
  AttendanceStatus,
  Participant,
} from "./type";

export interface AttendanceTableMeta {
  sessionStatus: string;

  getRecord: (
    participantId: string,
  ) => AttendanceRecord;

  setStatus: (
    participantId: string,
    status: AttendanceStatus,
  ) => void;

  setRemarks: (
    participantId: string,
    remarks: string,
  ) => void;

  onView: (
    participant: Participant,
  ) => void;
}

/* =========================================================
   STATUS CONFIG
========================================================= */

const statusConfig: Record<
  AttendanceStatus,
  {
    active: string;
    inactive: string;
    dot: string;
  }
> = {
  Present: {
    active:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50",

    dot: "bg-emerald-500",
  },

  Late: {
    active:
      "border-amber-200 bg-amber-50 text-amber-700",

    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-amber-200 hover:bg-amber-50",

    dot: "bg-amber-500",
  },

  Absent: {
    active:
      "border-red-200 bg-red-50 text-red-700",

    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50",

    dot: "bg-red-500",
  },

  Excused: {
    active:
      "border-blue-200 bg-blue-50 text-blue-700",

    inactive:
      "border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-blue-50",

    dot: "bg-blue-500",
  },
};

/* =========================================================
   COLUMNS
========================================================= */

export const columns: ColumnDef<Participant>[] = [
  /* =======================================================
     PARTICIPANT
  ======================================================= */

  {
    accessorKey: "name",

    header: "Participant",

    cell: ({ row }) => {
      const participant =
        row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
            {getInitials(
              participant.name,
            )}
          </div>

          <div>
            <p className="text-xs font-semibold">
              {participant.name}
            </p>

            <p className="mt-1 font-mono text-[10px] text-gray-400">
              {participant.participantId}
            </p>
          </div>
        </div>
      );
    },
  },

  /* =======================================================
     STATUS
  ======================================================= */

  {
    id: "status",

    header: "Status",

    cell: ({ row, table }) => {
      const participant =
        row.original;

      const meta =
        table.options.meta as
          | AttendanceTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      const record =
        meta.getRecord(
          participant.id,
        );

      return (
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              "Present",
              "Late",
              "Absent",
              "Excused",
            ] as AttendanceStatus[]
          ).map((status) => {
            const config =
              statusConfig[status];

            const active =
              record.status === status;

            const disabled =
              meta.sessionStatus ===
              "Submitted";

            return (
              <button
                key={status}
                type="button"
                disabled={disabled}
                onClick={() =>
                  meta.setStatus(
                    participant.id,
                    status,
                  )
                }
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold transition ${
                  active
                    ? config.active
                    : config.inactive
                } ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active
                      ? config.dot
                      : "bg-gray-300"
                  }`}
                />

                {status}
              </button>
            );
          })}
        </div>
      );
    },
  },

  /* =======================================================
     TIME IN
  ======================================================= */

  {
    id: "timeIn",

    header: "Time In",

    cell: ({ row, table }) => {
      const participant =
        row.original;

      const meta =
        table.options.meta as
          | AttendanceTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      const record =
        meta.getRecord(
          participant.id,
        );

      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 min-w-[88px] items-center rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] font-semibold text-gray-600">
            {record.timeIn === "-"
              ? "—"
              : record.timeIn}
          </span>

          {record.timeInMethod && (
            <span className="text-[9px] text-gray-400">
              {record.timeInMethod}
            </span>
          )}
        </div>
      );
    },
  },

  /* =======================================================
     TIME OUT
  ======================================================= */

  {
    id: "timeOut",

    header: "Time Out",

    cell: ({ row, table }) => {
      const participant =
        row.original;

      const meta =
        table.options.meta as
          | AttendanceTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      const record =
        meta.getRecord(
          participant.id,
        );

      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 min-w-[88px] items-center rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] font-semibold text-gray-600">
            {record.timeOut === "-"
              ? "—"
              : record.timeOut}
          </span>

          {record.timeOutMethod && (
            <span className="text-[9px] text-gray-400">
              {record.timeOutMethod}
            </span>
          )}
        </div>
      );
    },
  },

  /* =======================================================
     REMARKS
  ======================================================= */

  {
    id: "remarks",

    header: "Remarks",

    cell: ({ row, table }) => {
      const participant =
        row.original;

      const meta =
        table.options.meta as
          | AttendanceTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      const record =
        meta.getRecord(
          participant.id,
        );

      const disabled =
        meta.sessionStatus ===
        "Submitted";

      return (
        <input
          disabled={disabled}
          value={record.remarks}
          onChange={(event) =>
            meta.setRemarks(
              participant.id,
              event.target.value,
            )
          }
          placeholder="Optional..."
          className="h-9 w-44 rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] outline-none focus:bg-white disabled:opacity-50"
        />
      );
    },
  },

  /* =======================================================
     ACTION
  ======================================================= */

  {
    id: "actions",

    header: "Action",

    cell: ({ row, table }) => {
      const participant =
        row.original;

      const meta =
        table.options.meta as
          | AttendanceTableMeta
          | undefined;

      return (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              meta?.onView(
                participant,
              )
            }
            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            View
          </button>
        </div>
      );
    },
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name: string,
) {
  return name
    .split(" ")
    .map(
      (part) =>
        part.charAt(0),
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}