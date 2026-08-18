"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  UserCell,
  Badge,
  RowActions,
} from "@repo/ui/index";

import type { Participant } from "@repo/types";

import {
  Eye,
  Pencil,
  KeyRound,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import { formatDate } from "@repo/utils";

interface ParticipantColumnsProps {
  onEdit: (
    participant: Participant
  ) => void;

  onDelete: (
    participant: Participant
  ) => void;

  onToggleStatus: (
    participant: Participant
  ) => void;
}

export const columns = ({
  onEdit,
  onDelete,
  onToggleStatus,
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

      return (
        <UserCell
          name={user.fullname}
          email={user.email}
          image={user.profileImage}
        />
      );
    },
  },


  {
    accessorKey: "role",
    header: "Role",

    cell: ({ row }) => (
      <Badge
        variant={
          row.original.role.toLowerCase() as
            | "admin"
            | "trainer"
            | "participant"
        }
      >
        {row.original.role}
      </Badge>
    ),
  },

  // =====================================================
  // REGISTRATION DATE
  // =====================================================

  {
    accessorKey: "createdAt",
    header: "Registration Date",

    cell: ({ row }) => (
      <span>
        {formatDate(
          row.original.createdAt
        )}
      </span>
    ),
  },

  // =====================================================
  // STATUS
  // =====================================================

  {
    accessorKey: "isActive",
    header: "Status",

    cell: ({ row }) => (
      <Badge
        variant={
          row.original.isActive
            ? "active"
            : "inactive"
        }
      >
        {row.original.isActive
          ? "Active"
          : "Inactive"}
      </Badge>
    ),
  },

  // =====================================================
  // ACTIONS
  // =====================================================

  {
    id: "actions",
    header: "Action",

    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="relative z-[9999]">
          <RowActions
            actions={[
        

              {
                label: "View",
                icon: (
                  <Eye size={16} />
                ),
                onClick: () =>
                  console.log(user),
              },


              {
                label: "Edit",
                icon: (
                  <Pencil size={16} />
                ),
                onClick: () =>
                  onEdit(user),
              },

     

              {
                label:
                  "Reset Password",

                icon: (
                  <KeyRound
                    size={16}
                  />
                ),

                onClick: () =>
                  console.log(
                    "reset"
                  ),
              },

          
              {
                label: user.isActive
                  ? "Deactivate"
                  : "Activate",

                icon:
                  user.isActive ? (
                    <UserX
                      size={16}
                    />
                  ) : (
                    <UserCheck
                      size={16}
                    />
                  ),

                onClick: () =>
                  onToggleStatus(
                    user
                  ),
              },

              

              {
                label: "Delete",

                icon: (
                  <Trash2
                    size={16}
                  />
                ),

                danger: true,

                onClick: () =>
                  onDelete(user),
              },
            ]}
          />
        </div>
      );
    },
  },
];