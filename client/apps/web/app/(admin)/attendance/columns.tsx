import type { ColumnDef } from "@tanstack/react-table";

import type {
  AttendanceRecordDto,
  Enrollment,
} from "@repo/types";

export interface AttendanceTableMeta {
  sessionStatus: string;

  getRecord: (
    enrollmentId: string,
  ) => AttendanceRecordDto | null;

  onView: (
    enrollment: Enrollment,
  ) => void;
}

export const columns: ColumnDef<Enrollment>[] = [
  {
    id: "participant",

    header: "Participant",

    cell: ({ row }) => {
      const enrollment =
        row.original;

      const participant =
        enrollment.participant;
console.log("Participant:", participant);
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
  {participant.profileImageUrl ? (
    <img
      src={participant.profileImageUrl}
      alt={participant.fullName}
      className="h-full w-full object-cover"
    />
  ) : (
    getInitials(participant.fullName)
  )}
</div>



          <div>
            <p className="text-xs font-semibold">
              {participant.fullName}
            </p>

            <p className="mt-1 font-mono text-[10px] text-gray-400">
              {participant.userCode}
            </p>
          </div>
        </div>
      );
    },
  },

  {
    id: "status",

    header: "Status",

    cell: ({ row, table }) => {
      const enrollment =
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
          enrollment.id,
        );

      return (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-700">
          {record?.status ?? "No Record"}
        </span>
      );
    },
  },

  {
    id: "timeIn",

    header: "Time In",

    cell: ({ row, table }) => {
      const enrollment =
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
          enrollment.id,
        );

      return (
        <span className="inline-flex h-9 min-w-[88px] items-center rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] font-semibold text-gray-600">
          {record?.timeIn ?? "—"}
        </span>
      );
    },
  },

  {
    id: "timeOut",

    header: "Time Out",

    cell: ({ row, table }) => {
      const enrollment =
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
          enrollment.id,
        );

      return (
        <span className="inline-flex h-9 min-w-[88px] items-center rounded-lg border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-[10px] font-semibold text-gray-600">
          {record?.timeOut ?? "—"}
        </span>
      );
    },
  },

  {
    id: "method",

    header: "Method",

    cell: ({ row, table }) => {
      const enrollment =
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
          enrollment.id,
        );

      return (
        <span className="text-[10px] text-gray-400">
          {record?.method ?? "—"}
        </span>
      );
    },
  },

  {
    id: "action",

    header: "Action",

    cell: ({ row, table }) => {
      const enrollment =
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
                enrollment,
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

function getInitials(
  name: string,
): string {
  return name
    .trim()
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0),
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}