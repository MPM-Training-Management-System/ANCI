import { useState } from "react";

import {
  AdminUserApi,
} from "@repo/api";

import type {
  AdminUserDetails,
  AdminUserList,
  UpdateAdminUserRequest,
  UpdateAdminUserStatusRequest,
} from "@repo/types";

// ============================================================
// ADMIN USER MANAGEMENT HOOK
// ============================================================

export function useAdminUsers(
  adminUserApi: AdminUserApi,
) {
  const [users, setUsers] =
    useState<AdminUserList[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<AdminUserDetails | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isLoadingUser, setIsLoadingUser] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // GET ALL USERS
  // ==========================================================

  const getUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response =
        await adminUserApi.getAll();

      setUsers(response);

      return response;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load users right now.",
      );

      return null;

    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================
  // GET USER BY ID
  // ==========================================================

  const getUserById = async (
    id: string,
  ) => {
    try {
      setIsLoadingUser(true);
      setError(null);

      const response =
        await adminUserApi.getById(id);

      setSelectedUser(response);

      return response;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load user details right now.",
      );

      return null;

    } finally {
      setIsLoadingUser(false);
    }
  };

  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const updateUser = async (
    id: string,
    request: UpdateAdminUserRequest,
  ) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response =
        await adminUserApi.update(
          id,
          request,
        );

      setSelectedUser(response);

      // Update the user in the current list
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === response.id
            ? {
                ...user,
                fullName: response.fullName,
                email: response.email,
                mobileNumber:
                  response.mobileNumber,
                role: response.role,
                status: response.status,
                isEmailVerified:
                  response.isEmailVerified,
                updatedAt: response.updatedAt,
                profileImageUrl:
                  response.participantProfile
                    ?.profileImageUrl ??
                  response.trainerProfile
                    ?.profileImageUrl ??
                  null,
              }
            : user,
        ),
      );

      return response;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update user right now.",
      );

      return null;

    } finally {
      setIsUpdating(false);
    }
  };

  // ==========================================================
  // UPDATE USER STATUS
  // ==========================================================

  const updateUserStatus = async (
    id: string,
    request: UpdateAdminUserStatusRequest,
  ) => {
    try {
      setIsUpdatingStatus(true);
      setError(null);

      const response =
        await adminUserApi.updateStatus(
          id,
          request,
        );

      setSelectedUser(response);

      // Update status in current list
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === response.id
            ? {
                ...user,
                status: response.status,
                updatedAt: response.updatedAt,
              }
            : user,
        ),
      );

      return response;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update user status right now.",
      );

      return null;

    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ==========================================================
  // DELETE USER
  // ==========================================================

  const deleteUser = async (
    id: string,
  ) => {
    try {
      setIsDeleting(true);
      setError(null);

      await adminUserApi.delete(id);

      // Remove deleted user from list
      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user.id !== id,
        ),
      );

      // Clear selected user if deleted
      setSelectedUser((currentUser) =>
        currentUser?.id === id
          ? null
          : currentUser,
      );

      return true;

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete user right now.",
      );

      return false;

    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const reset = () => {
    setUsers([]);
    setSelectedUser(null);

    setIsLoading(false);
    setIsLoadingUser(false);
    setIsUpdating(false);
    setIsUpdatingStatus(false);
    setIsDeleting(false);

    setError(null);
  };

  // ==========================================================
  // CLEAR ERROR
  // ==========================================================

  const clearError = () => {
    setError(null);
  };

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
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

    reset,
    clearError,
  };
}