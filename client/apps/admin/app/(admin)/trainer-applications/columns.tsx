"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  MoreHorizontal,
  UserRound,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  UserCell,
} from "@repo/ui/index";

export type TrainerApplicationRow = {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  specialization: string;
  yearsOfExperience: number | null;
  submittedAt: string | null;
  createdAt: string;
  profileImageUrl?: string | null;
  status: string;
};

export interface TrainerApplicationTableMeta {
  onReview: (application: TrainerApplicationRow) => void;
}

export const columns: ColumnDef<TrainerApplicationRow>[] = [

  {
  id: "rowNumber",
  header: "No.",
  enableSorting: false,
  enableColumnFilter: false,
  cell: ({ row, table }) => {
    const { pageIndex, pageSize } = table.getState().pagination;

    return (
      <span className="text-sm font-medium text-gray-500">
        {pageIndex * pageSize + row.index + 1}
      </span>
    );
  },
},
  {
     accessorFn: (row) =>
       `${row.fullName} ${row.email} ${row.userCode ?? ""}`,
     id: "participantName",
     header: "Participant",
     cell: ({ row }) => {
       const item = row.original;
   
       return (
         <div className="flex flex-col gap-1">
           <UserCell
             name={item.fullName}
             email={item.email}
             image={item.profileImageUrl ?? undefined}
             id=  {item.userCode ?? "N/A"}
           />
         </div>
       );
     },
   },
  {
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <BriefcaseBusiness className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="max-w-[190px] truncate">
          {row.original.specialization || "Not specified"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "yearsOfExperience",
    header: "Experience",
    cell: ({ row }) => {
      const years = row.original.yearsOfExperience ?? 0;

      return (
        <span className="whitespace-nowrap text-sm font-medium text-slate-700">
          {years} {years === 1 ? "year" : "years"}
        </span>
      );
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-600">
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
        {formatDate(
          row.original.submittedAt ?? row.original.createdAt,
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} />
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row, table }) => {
      const application = row.original;
      const meta = table.options.meta as
        | TrainerApplicationTableMeta
        | undefined;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                aria-label={`Actions for ${application.fullName}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onSelect={() => meta?.onReview(application)}
              >
                Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  let className = "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

  if (normalized === "approved") {
    className = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  } else if (normalized === "rejected") {
    className = "bg-red-50 text-red-700 ring-1 ring-red-100";
  } else if (normalized === "pending") {
    className = "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  } else if (
    normalized === "needscorrection" ||
    normalized === "needs correction"
  ) {
    className = "bg-orange-50 text-orange-700 ring-1 ring-orange-100";
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${className}`}
    >
      {status}
    </span>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
