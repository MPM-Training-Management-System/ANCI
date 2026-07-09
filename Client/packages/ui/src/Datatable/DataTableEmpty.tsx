"use client";

import { Database } from "lucide-react";

interface DataTableEmptyProps {
  columns: number;
  title?: string;
  description?: string;
}

export function DataTableEmpty({
  columns,
  title = "No records found",
  description = "There are currently no available records.",
}: DataTableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="px-6 py-16"
      >
        <div className="flex flex-col items-center justify-center">

          <div className="mb-4 rounded-full bg-gray-100 p-4">

            <Database
              size={40}
              className="text-gray-400"
            />

          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>

        </div>
      </td>
    </tr>
  );
}