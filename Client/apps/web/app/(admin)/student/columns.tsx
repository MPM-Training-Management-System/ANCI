"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { Participant } from "@repo/types";
interface ParticipantColumnsProps {
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: ParticipantColumnsProps): ColumnDef<Participant>[] => [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "Progress",
    header: "Progess",
  },
  {
    accessorKey: "Status",
    header: "Status",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(row.original)}>Edit</button>

          <button onClick={() => onDelete(row.original)}>delete</button>
        </div>
      );
    },
  },
];