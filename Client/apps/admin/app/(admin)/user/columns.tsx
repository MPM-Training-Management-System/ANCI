"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UserCell, Badge, Button , RowActions} from "@repo/ui/index";
import type { Participant } from "@repo/types";
interface ParticipantColumnsProps {
  onEdit: (participant: Participant) => void;
  onDelete: (participant: Participant) => void;
}
import {
  Eye,
  Pencil,
  KeyRound,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { formatDate } from "@repo/utils";
export const columns = ({
  onEdit,
  onDelete,
}: ParticipantColumnsProps): ColumnDef<Participant>[] => [
  
  
    {
    accessorKey: "userId",
    header: "id",
  },
  {
  accessorKey: "fullname",
  header: "User",
cell: ({ row }) => {
    const user = row.original;
   console.log(row.original);
  return (
    <UserCell
      name={user.fullname}
      email={user.email}
    image={user.profileImage}
    
    />
  );
}},
 {
  accessorKey: "role",
  header: "Role",
  cell: ({ row }) => (
    <Badge
      variant={row.original.role.toLowerCase() as
        | "admin"
        | "trainer"
        | "participant"}
    >
      {row.original.role}
    </Badge>
  ),
},
  {
  accessorKey: "createdAt",
  header: "Registration Date",
  cell: ({ row }) => (
    <span>{formatDate(row.original.createdAt)}</span>
  ),
},
  {
  accessorKey: "isactive",
  header: "Status",
  cell: ({ row }) => (
    <Badge variant={row.original.isActive ? "active" : "inactive"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  ),
},
  {
  id: "actions",
  header: "Action",
  cell: ({ row }) => {
    const user = row.original;

    return (
      <RowActions
        actions={[
          {
            label: "View",
            icon: <Eye size={16} />,
            onClick: () => console.log(user),
          },
          {
            label: "Edit",
            icon: <Pencil size={16} />,
            onClick: () => onEdit(user),
          },
          {
            label: "Reset Password",
            icon: <KeyRound size={16} />,
            onClick: () => console.log("reset"),
          },
          {
            label: user.isActive
              ? "Deactivate"
              : "Activate",
            icon: user.isActive ? (
              <UserX size={16} />
            ) : (
              <UserCheck size={16} />
            ),
            onClick: () => console.log("toggle"),
          },
          {
            label: "Delete",
            icon: <Trash2 size={16} />,
            danger: true,
            onClick: () => onDelete(user),
          },
        ]}
      />
    );
  },
},
];