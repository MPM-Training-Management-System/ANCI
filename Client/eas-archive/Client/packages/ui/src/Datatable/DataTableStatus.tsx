"use client";

import { cn } from "@repo/lib"

interface DataTableStatusProps {
  status: string;
}

const variants: Record<string, string> = {
  Active:
    "bg-green-100 text-green-700",

  Pending:
    "bg-yellow-100 text-yellow-700",

  Inactive:
    "bg-red-100 text-red-700",

  Completed:
    "bg-emerald-100 text-emerald-700",

  Ongoing:
    "bg-blue-100 text-blue-700",

  Assigned:
    "bg-indigo-100 text-indigo-700",
};

export function DataTableStatus({
  status,
}: DataTableStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold",
        variants[status] ??
          "bg-gray-100 text-gray-700"
      )}
    >
      {status}
    </span>
  );
}