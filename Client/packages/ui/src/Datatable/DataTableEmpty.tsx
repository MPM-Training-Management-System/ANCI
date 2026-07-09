"use client";

import { EmptyState } from "../empty-state";

interface DataTableEmptyProps {
  columns: number;
  title?: string;
  description?: string;
}

export function DataTableEmpty({
  columns,
  title,
  description,
}: DataTableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="px-6 py-16"
      >
        <EmptyState
          title={title}
          description={description}
        />
      </td>
    </tr>
  );
}