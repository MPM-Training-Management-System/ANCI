"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableStatus, TableActions   } from "@repo/ui/Datatable/";
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "REQUEST ID",
  },

  {
    accessorKey: "name",
    header: "CLIENT NAME",
  },

  {
    accessorKey: "email",
    header: "Email",
  },

  {
    accessorKey: "role",
    header: "Role",
  },

  {
    accessorKey: "status",
    header: "Status",
   cell: ({ row }) => {
  const user = row.original as User;

  return <DataTableStatus status={user.status} />;
},
},
{
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <TableActions
        onView={() => console.log("View", row.original.id)}
        onEdit={() => console.log("Edit", row.original.id)}
      />
    ),
  },
];