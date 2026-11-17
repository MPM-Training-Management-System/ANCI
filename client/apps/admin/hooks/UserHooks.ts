
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  AdminUserDetails,
  AdminUserList,
  UpdateAdminUserRequest,
  UserRole,
  UserStatus,
} from "@repo/types";

import { useAdminUsers } from "@repo/hooks";
import { adminUserApi } from "@/lib/api";

type ModalType = "view" | "edit" | "status" | "delete" | null;

export function useUserManagement() {
  const {
    users,
    selectedUser,
    isLoading,
    isLoadingUser,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
    error,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser,
    clearError,
    reset,
  } = useAdminUsers(adminUserApi);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");

  const [modal, setModal] = useState<ModalType>(null);
  const [editingUser, setEditingUser] = useState<AdminUserDetails | null>(null);
  const [statusUser, setStatusUser] = useState<AdminUserDetails | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserList | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load users when the page mounts.
  useEffect(() => {
    void getUsers();

    // Intentionally run once when the page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically hide notifications.
  useEffect(() => {
    if (!notification) return;

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [notification]);

  const handleRefresh = useCallback(async () => {
    reset();
    await getUsers();
  }, [reset, getUsers]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        keyword === "" ||
        user.fullName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.userCode.toLowerCase().includes(keyword) ||
        (user.mobileNumber ?? "").toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalUsers = users.length;

  const totalParticipants = users.filter(
    (user) => user.role === "Participant"
  ).length;

  const totalTrainers = users.filter(
    (user) => user.role === "Trainer"
  ).length;

  const totalActive = users.filter(
    (user) => user.status === "Active"
  ).length;

  const hasFilters =
    search.trim() !== "" ||
    roleFilter !== "All" ||
    statusFilter !== "All";

  const clearFilters = useCallback(() => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  }, []);

  const handleView = useCallback(
    (user: AdminUserList) => {
      setModal("view");
      void getUserById(user.id);
    },
    [getUserById]
  );

  const handleEdit = useCallback(
    async (user: AdminUserList) => {
      const details = await getUserById(user.id);

      if (!details) {
        setNotification({
          type: "error",
          message: "Unable to load the user details.",
        });
        return;
      }

      setEditingUser(details);
      setModal("edit");
    },
    [getUserById]
  );

  const handleStatus = useCallback(
    async (user: AdminUserList) => {
      const details = await getUserById(user.id);

      if (!details) {
        setNotification({
          type: "error",
          message: "Unable to load the user details.",
        });
        return;
      }

      setStatusUser(details);
      setModal("status");
    },
    [getUserById]
  );

  const handleDelete = useCallback((user: AdminUserList) => {
    setDeletingUser(user);
    setModal("delete");
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setEditingUser(null);
    setStatusUser(null);
    setDeletingUser(null);
  }, []);

  const handleUpdateUser = useCallback(
    async (request: UpdateAdminUserRequest) => {
      if (!editingUser) return;

      const result = await updateUser(editingUser.id, request);

      if (!result) {
        setNotification({
          type: "error",
          message: error || "Unable to update the user.",
        });
        return;
      }

      setNotification({
        type: "success",
        message: "User updated successfully.",
      });

      closeModal();
    },
    [editingUser, updateUser, error, closeModal]
  );

  const handleUpdateStatus = useCallback(
    async (status: UserStatus) => {
      if (!statusUser) return;

      const result = await updateUserStatus(statusUser.id, { status });

      if (!result) {
        setNotification({
          type: "error",
          message: error || "Unable to update the user status.",
        });
        return;
      }

      setNotification({
        type: "success",
        message: "User status updated successfully.",
      });

      closeModal();
    },
    [statusUser, updateUserStatus, error, closeModal]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingUser) return;

    const success = await deleteUser(deletingUser.id);

    if (!success) {
      setNotification({
        type: "error",
        message: error || "Unable to delete the user.",
      });
      return;
    }

    setNotification({
      type: "success",
      message: "User deleted successfully.",
    });

    closeModal();
  }, [deletingUser, deleteUser, error, closeModal]);

  return {
    // API data and loading states
    users,
    selectedUser,
    isLoading,
    isLoadingUser,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
    error,

    // Filters
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    filteredUsers,
    hasFilters,
    clearFilters,

    // Statistics
    totalUsers,
    totalParticipants,
    totalTrainers,
    totalActive,

    // Modal state
    modal,
    setModal,
    editingUser,
    statusUser,
    deletingUser,

    // Notifications
    notification,
    setNotification,

    // API actions
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
  };
}
