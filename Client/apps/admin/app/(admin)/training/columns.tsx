"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useTraining } from "@/hooks/useTraining";
import type { Training } from "@repo/types";
import { Badge,RowActions } from "@repo/ui/index";

interface ParticipantColumnsProps {
  onEdit: (participant: Training) => void;
  onDelete: (participant: Training) => void;
}


export const columns: ColumnDef<Training>[] = [
   
  {
    accessorKey: "title",
    header: "Program Title",
  },
  {
    accessorKey: "Enrolled",
    header: "Enrolled",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
        <Badge variant={row.original.status ? "active" : "inactive"}>
          {row.original.status ? "Active" : "Inactive"}
        </Badge>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ }) => {
      return (
        <div className="flex items-center gap-2">
          <button >Edit</button>

          <button >delete</button>
        </div>
      );
    },
  },
];