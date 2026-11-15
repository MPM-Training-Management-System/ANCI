"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  DataTable,
  PageSection,
  PageSkeleton,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import type {
  AdminUserDetails,
  AdminUserList,
  UpdateAdminUserRequest,
  UserRole,
  UserStatus,
} from "@repo/types";

import { useAdminUsers } from "@repo/hooks";
import { UserDetailsModal } from "./components/UserDetailsModal";
import { EditUserModal } from "./components/EditUserModal";
import { StatusModal } from "./components/StatusModal";
import { adminUserApi } from "@/lib/api";

import { useUserManagement } from "@/hooks/UserHooks";

import { columns } from "./columns";
import type { UserTableMeta } from "./columns";
import { GraduationCap, RotateCcw, UserCheck, UserRound, UsersRound } from "lucide-react";

type ModalType =
  | "view"
  | "edit"
  | "status"
  | "delete"
  | null;

export default function UserManagementPage() {
  const {
  users,
  selectedUser,
  isLoading,
  isLoadingUser,
  isUpdating,
  isUpdatingStatus,
  isDeleting,
  error,

  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  filteredUsers,
  hasFilters,
  clearFilters,

  totalUsers,
  totalParticipants,
  totalTrainers,
  totalActive,

  modal,
  editingUser,
  statusUser,
  deletingUser,

  notification,
  setNotification,

  clearError,
  handleRefresh,
  handleView,
  handleEdit,
  handleStatus,
  handleDelete,
  closeModal,
  handleUpdateUser,
  handleUpdateStatus,
  handleConfirmDelete,
} = useUserManagement();


  const tableMeta: UserTableMeta = {
    onView: handleView,
    onEdit: handleEdit,
    onStatus: handleStatus,
    onDelete: handleDelete,
  };


    if (isLoading && users.length === 0) {
  return (
    <PageSkeleton
      statCards={4} 
      showHeader
      showTable
      tableRows={8}
      tableColumns={7}
    />
  );
}

  return (
    <div className="space-y-6">
      <PageSection
        title="User Management"
        description="Manage participant and trainer accounts."
         actions={
                  <Button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RotateCcw
                      className={`h-4 w-4 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>

            <Button
            variant="danger"
              type="button"
              onClick={clearError}
              className="shrink-0 font-semibold text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* ======================================================
          STAT CARDS
          ====================================================== */}

      <StatGrid>
        <StatCard
          variant="primary"
          icon={UsersRound}
          title="Total Users"
          value={totalUsers}
          description="All registered accounts"
        />

        <StatCard
          icon={UserRound}
          variant="success"
          title="Participants"
          value={totalParticipants}
          description="Participant accounts"
        />

        <StatCard
          icon={GraduationCap}
          variant="warning"
          title="Trainers"
          value={totalTrainers}
          description="Trainer accounts"
        />

        <StatCard
          icon={UserCheck}
          variant="success"
          title="Active Users"
          value={totalActive}
          description="Currently active"
        />
      </StatGrid>

      {/* ======================================================
          USER TABLE
          Same DataTable structure as Training Management
          ====================================================== */}

      <DataTable
        columns={columns}
        data={filteredUsers}
        searchable
        searchPlaceholder="Search users..."
        showPagination
        emptyTitle={
          isLoading
            ? "Loading users..."
            : "No users found"
        }
        emptyDescription={
          isLoading
            ? "Please wait while users are loaded."
            : "No registered users match your current filters."
        }
        meta={tableMeta}
        toolbar={
          <div className="flex flex-wrap gap-2">
          
            {/* ROLE */}

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value as
                    | "All"
                    | UserRole
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
            >
              <option value="All">
                All Roles
              </option>

              <option value="Participant">
                Participant
              </option>

              <option value="Trainer">
                Trainer
              </option>

              <option value="Admin">
                Admin
              </option>
            </select>

      

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | UserStatus
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Active">
                Approved
              </option>

              

              <option value="Inactive">
                Inactive
              </option>

              <option value="Suspended">
                Suspended
              </option>

              <option value="Rejected">
                Rejected
              </option>
            </select>

            {/* CLEAR */}

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-4 text-xs font-medium text-gray-600 transition hover:bg-white"
              >
                Clear
              </button>
            )}
          </div>
        }
      />

      {/* ======================================================
          VIEW MODAL
          ====================================================== */}

      {modal === "view" && (
        <UserDetailsModal
          user={selectedUser}
          isLoading={isLoadingUser}
          onClose={closeModal}
        />
      )}

      {/* ======================================================
          EDIT MODAL
          ====================================================== */}

      {modal === "edit" && (
        <EditUserModal
          user={editingUser}
          isLoading={isLoadingUser}
          isSaving={isUpdating}
          onClose={closeModal}
          onSave={handleUpdateUser}
        />
      )}

      {/* ======================================================
          STATUS MODAL
          ====================================================== */}

      {modal === "status" && (
        <StatusModal
          user={statusUser}
          isLoading={isLoadingUser}
          isSaving={isUpdatingStatus}
          onClose={closeModal}
          onSave={handleUpdateStatus}
        />
      )}

      {/* ======================================================
          DELETE MODAL
          ====================================================== */}

      {modal === "delete" && (
        <DeleteModal
          user={deletingUser}
          isDeleting={isDeleting}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* ======================================================
          NOTIFICATION
          ====================================================== */}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() =>
            setNotification(null)
          }
        />
      )}
    </div>
  );
}



/* =================================================================
   DELETE MODAL
================================================================= */

function DeleteModal({
  user,
  isDeleting,
  onClose,
  onConfirm,
}: {
  user: AdminUserList | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!user) {
    return null;
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Delete User
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              This action cannot be undone
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* BODY */}

        <div className="space-y-5 p-6">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm leading-6 text-red-700">
              Are you sure you want to delete{" "}
              <strong>{user.fullName}</strong>?
              This will permanently remove the
              user's account and associated
              profile data.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3">
            <Info
              label="User Code"
              value={user.userCode}
            />

            <Info
              label="Email"
              value={user.email}
            />

            <Info
              label="Role"
              value={user.role}
            />
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void onConfirm()
            }
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting
              ? "Deleting..."
              : "Delete User"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* =================================================================
   MODAL OVERLAY
================================================================= */

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

/* =================================================================
   PROFILE SECTION
================================================================= */

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>
      </div>

      <div className="p-4">
        {children}
      </div>
    </section>
  );
}

/* =================================================================
   INFO
================================================================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm leading-5 text-gray-700">
        {value}
      </p>
    </div>
  );
}

/* =================================================================
   INPUT
================================================================= */

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
      />
    </div>
  );
}

/* =================================================================
   AVATAR
================================================================= */

function Avatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

/* =================================================================
   ROLE BADGE
================================================================= */

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
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}
    >
      {role}
    </span>
  );
}

/* =================================================================
   STATUS BADGE
================================================================= */

function StatusBadge({
  status,
}: {
  status: UserStatus;
}) {
  let className =
    "border-gray-200 bg-gray-50 text-gray-600";

  if (
    status === "Active" 
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
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}
    >
      {status}
    </span>
  );
}

/* =================================================================
   LOADING
================================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />

        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    </div>
  );
}

/* =================================================================
   EMPTY
================================================================= */

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
}

/* =================================================================
   NOTIFICATION
================================================================= */

function Notification({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[200]">
      <div
        className={`flex min-w-[300px] max-w-[420px] items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-xl ${
          type === "success"
            ? "border-emerald-100"
            : "border-red-100"
        }`}
      >
        <div className="flex-1">
          <p
            className={`text-sm font-semibold ${
              type === "success"
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* =================================================================
   HELPERS
================================================================= */

function getInitials(name: string) {
  if (!name) {
    return "?";
  }

  const parts = name
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

function formatDate(value: string) {
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