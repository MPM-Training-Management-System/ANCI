"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type {
  AdminUserList,
  UserRole,
  UserStatus,
} from "@repo/types";

export interface UserTableMeta {
  onView: (user: AdminUserList) => void;
  onEdit: (user: AdminUserList) => void;
  onStatus: (user: AdminUserList) => void;
  onDelete: (user: AdminUserList) => void;
}

export const columns: ColumnDef<AdminUserList>[] = [
  {
    accessorKey: "fullName",
    header: "User",

    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-500">
                {getInitials(user.fullName)}
              </div>
            )}
          </div>

          {/* Name */}
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

          <p
            className={`text-[10px] font-semibold ${
              user.isEmailVerified
                ? "text-emerald-600"
                : "text-gray-400"
            }`}
          >
            {user.isEmailVerified
              ? "Verified"
              : "Not verified"}
          </p>
        </div>
      );
    },
  },

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

      /*
       * If meta is missing, don't crash the table.
       */

      if (!meta) {
        return null;
      }

      return (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {/* VIEW */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              meta.onView(user);
            }}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View
          </button>

          {/* EDIT */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              meta.onEdit(user);
            }}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Edit
          </button>

          {/* STATUS */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              meta.onStatus(user);
            }}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Status
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              meta.onDelete(user);
            }}
            className="rounded-lg border border-red-200 bg-white px-2.5 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
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
  let className =
    "border-gray-200 bg-gray-50 text-gray-600";

  if (role === "Participant") {
    className =
      "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (role === "Trainer") {
    className =
      "border-purple-100 bg-purple-50 text-purple-700";
  }

  if (role === "Admin") {
    className =
      "border-gray-200 bg-gray-100 text-gray-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${className}`}
    >
      {role}
    </span>
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
  let className =
    "border-gray-200 bg-gray-50 text-gray-600";

  if (
    status === "Active" ||
    status === "Approved"
  ) {
    className =
      "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    className =
      "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (status === "Rejected") {
    className =
      "border-red-100 bg-red-50 text-red-700";
  }

  if (status === "Suspended") {
    className =
      "border-orange-100 bg-orange-50 text-orange-700";
  }

  if (status === "Inactive") {
    className =
      "border-gray-200 bg-gray-50 text-gray-500";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${className}`}
    >
      {status}
    </span>
  );
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