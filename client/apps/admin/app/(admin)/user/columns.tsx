"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  AdminUserList,
  UserRole,
  UserStatus,
} from "@repo/types";

import {
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

export interface UserTableMeta {
  onView: (user: AdminUserList) => void;
  onEdit: (user: AdminUserList) => void;
  onStatus: (user: AdminUserList) => void;
  onDelete: (user: AdminUserList) => void;
}

export const columns: ColumnDef<AdminUserList>[] = [
  /*
   * ============================================================
   * USER
   * ============================================================
   */

  {
    accessorKey: "fullName",
    header: "User",

    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
                {getInitials(user.fullName)}
              </div>
            )}
          </div>

          {/* NAME */}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.fullName || "Unnamed User"}
            </p>

            <p className="truncate text-xs text-gray-400">
              {user.userCode || "No user code"}
            </p>
          </div>
        </div>
      );
    },
  },

  /*
   * ============================================================
   * EMAIL
   * ============================================================
   */

  {
    accessorKey: "email",
    header: "Email",

    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="min-w-0">
          <p className="max-w-[240px] truncate text-sm text-gray-700">
            {user.email || "No email"}
          </p>

          <p className="mt-0.5 text-[10px] font-medium">
            {user.isEmailVerified ? (
              <span className="text-emerald-600">
                Verified
              </span>
            ) : (
              <span className="text-gray-400">
                Not verified
              </span>
            )}
          </p>
        </div>
      );
    },
  },

  /*
   * ============================================================
   * MOBILE
   * ============================================================
   */

  {
    accessorKey: "mobileNumber",
    header: "Mobile",

    cell: ({ row }) => {
      const mobile = row.original.mobileNumber;

      return (
        <span className="text-sm text-gray-600">
          {mobile || "Not specified"}
        </span>
      );
    },
  },

  /*
   * ============================================================
   * ROLE
   * ============================================================
   */

  {
    accessorKey: "role",
    header: "Role",

    cell: ({ row }) => {
      return (
        <RoleBadge
          role={row.original.role}
        />
      );
    },
  },

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  {
    accessorKey: "status",
    header: "Status",

    cell: ({ row }) => {
      return (
        <StatusBadge
          status={row.original.status}
        />
      );
    },
  },

  /*
   * ============================================================
   * CREATED
   * ============================================================
   */

  {
    accessorKey: "createdAt",
    header: "Created",

    cell: ({ row }) => {
      return (
        <span className="whitespace-nowrap text-xs text-gray-500">
          {formatDate(row.original.createdAt)}
        </span>
      );
    },
  },

  /*
   * ============================================================
   * ACTIONS
   * ============================================================
   */

  {
    id: "actions",

    header: "Actions",

    enableSorting: false,
    enableColumnFilter: false,

    cell: ({ row, table }) => {
      const user = row.original;

      const meta =
        table.options.meta as
          | UserTableMeta
          | undefined;

      if (!meta) {
        return null;
      }

      return (
        <div
          className="flex items-center justify-end"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
              
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                aria-label={`Actions for ${user.fullName}`}
              >
                <span className="text-lg leading-none">⋯</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-40"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <DropdownMenuItem
                onSelect={() => {
                  meta.onView(user);
                }}
              >
                View
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => {
                  meta.onEdit(user);
                }}
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => {
                  meta.onStatus(user);
                }}
              >
                Change Status
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={() => {
                  meta.onDelete(user);
                }}
                className="text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

/*
|--------------------------------------------------------------------------
| ROLE BADGE
|--------------------------------------------------------------------------
*/

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  const variant = getRoleVariant(role);

  return (
    <Badge variant={variant}>
      {role}
    </Badge>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({
  status,
}: {
  status: UserStatus;
}) {
  const variant = getStatusVariant(status);

  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  );
}

/*
|--------------------------------------------------------------------------
| ROLE VARIANT
|--------------------------------------------------------------------------
*/
function getRoleVariant(role: UserRole) {
  switch (role) {
    case "Participant":
      return "participant";

    case "Trainer":
      return "trainer";

    case "Admin":
      return "admin";

    default:
      return "neutral";
  }
}

/*
|--------------------------------------------------------------------------
| STATUS VARIANT
|--------------------------------------------------------------------------
*/
function getStatusVariant(
  status: UserStatus
) {
  switch (status) {
    case "Active":
    case "Approved":
      return "success";

    case "Pending":
      return "warning";

    case "Rejected":
    case "Suspended":
      return "error";

    case "Inactive":
      return "neutral";

    default:
      return "neutral";
  }
}
/*
|--------------------------------------------------------------------------
| INITIALS
|--------------------------------------------------------------------------
*/

function getInitials(
  fullName: string
) {
  if (!fullName) {
    return "?";
  }

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    parts[0]
      .charAt(0)
      .toUpperCase() +
    parts[parts.length - 1]
      .charAt(0)
      .toUpperCase()
  );
}

/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

function formatDate(
  value: string
) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}