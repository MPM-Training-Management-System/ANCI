"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DataTable,
  PageSection,
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

import { adminUserApi } from "@/lib/api";

import { columns } from "./columns";
import type { UserTableMeta } from "./columns";
import { GraduationCap, UserCheck, UserRound, UsersRound } from "lucide-react";

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
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser,
    clearError,
  } = useAdminUsers(adminUserApi);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<
    "All" | UserRole
  >("All");

  const [statusFilter, setStatusFilter] = useState<
    "All" | UserStatus
  >("All");

  const [modal, setModal] =
    useState<ModalType>(null);

  const [editingUser, setEditingUser] =
    useState<AdminUserDetails | null>(null);

  const [statusUser, setStatusUser] =
    useState<AdminUserDetails | null>(null);

  const [deletingUser, setDeletingUser] =
    useState<AdminUserList | null>(null);

  const [notification, setNotification] =
    useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);

  /*
   * ============================================================
   * LOAD USERS
   * ============================================================
   */

  useEffect(() => {
    void getUsers();

    // Intentionally run once when page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ============================================================
   * AUTO HIDE NOTIFICATION
   * ============================================================
   */

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notification]);

  /*
   * ============================================================
   * FILTERED USERS
   * ============================================================
   */

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        keyword === "" ||
        user.fullName
          .toLowerCase()
          .includes(keyword) ||
        user.email
          .toLowerCase()
          .includes(keyword) ||
        user.userCode
          .toLowerCase()
          .includes(keyword) ||
        (user.mobileNumber ?? "")
          .toLowerCase()
          .includes(keyword);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  const totalUsers = users.length;

  const totalParticipants = users.filter(
    (user) => user.role === "Participant"
  ).length;

  const totalTrainers = users.filter(
    (user) => user.role === "Trainer"
  ).length;

  const totalActive = users.filter(
    (user) =>
      user.status === "Active" ||
      user.status === "Approved"
  ).length;

  /*
   * ============================================================
   * VIEW
   * ============================================================
   */

  const handleView = useCallback(
    (user: AdminUserList) => {
      setModal("view");
      void getUserById(user.id);
    },
    [getUserById]
  );

  /*
   * ============================================================
   * EDIT
   * ============================================================
   */

  const handleEdit = useCallback(
    async (user: AdminUserList) => {
      const details = await getUserById(
        user.id
      );

      if (!details) {
        setNotification({
          type: "error",
          message:
            "Unable to load the user details.",
        });

        return;
      }

      setEditingUser(details);
      setModal("edit");
    },
    [getUserById]
  );

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  const handleStatus = useCallback(
    async (user: AdminUserList) => {
      const details = await getUserById(
        user.id
      );

      if (!details) {
        setNotification({
          type: "error",
          message:
            "Unable to load the user details.",
        });

        return;
      }

      setStatusUser(details);
      setModal("status");
    },
    [getUserById]
  );

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  const handleDelete = useCallback(
    (user: AdminUserList) => {
      setDeletingUser(user);
      setModal("delete");
    },
    []
  );

  /*
   * ============================================================
   * TABLE META
   * ============================================================
   */

  const tableMeta: UserTableMeta = {
    onView: handleView,
    onEdit: handleEdit,
    onStatus: handleStatus,
    onDelete: handleDelete,
  };

  /*
   * ============================================================
   * CLOSE MODAL
   * ============================================================
   */

  const closeModal = useCallback(() => {
    setModal(null);
    setEditingUser(null);
    setStatusUser(null);
    setDeletingUser(null);
  }, []);

  /*
   * ============================================================
   * UPDATE USER
   * ============================================================
   */

  const handleUpdateUser = async (
    request: UpdateAdminUserRequest
  ) => {
    if (!editingUser) {
      return;
    }

    const result = await updateUser(
      editingUser.id,
      request
    );

    if (!result) {
      setNotification({
        type: "error",
        message:
          error ||
          "Unable to update the user.",
      });

      return;
    }

    setNotification({
      type: "success",
      message:
        "User updated successfully.",
    });

    closeModal();
  };

  /*
   * ============================================================
   * UPDATE STATUS
   * ============================================================
   */

  const handleUpdateStatus = async (
    status: UserStatus
  ) => {
    if (!statusUser) {
      return;
    }

    const result =
      await updateUserStatus(
        statusUser.id,
        {
          status,
        }
      );

    if (!result) {
      setNotification({
        type: "error",
        message:
          error ||
          "Unable to update the user status.",
      });

      return;
    }

    setNotification({
      type: "success",
      message:
        "User status updated successfully.",
    });

    closeModal();
  };

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  const handleConfirmDelete = async () => {
    if (!deletingUser) {
      return;
    }

    const success = await deleteUser(
      deletingUser.id
    );

    if (!success) {
      setNotification({
        type: "error",
        message:
          error ||
          "Unable to delete the user.",
      });

      return;
    }

    setNotification({
      type: "success",
      message:
        "User deleted successfully.",
    });

    closeModal();
  };

  /*
   * ============================================================
   * CLEAR FILTERS
   * ============================================================
   */

  const hasFilters =
    search.trim() !== "" ||
    roleFilter !== "All" ||
    statusFilter !== "All";

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6">
      <PageSection
        title="User Management"
        description="Manage participant and trainer accounts."
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>

            <button
              type="button"
              onClick={clearError}
              className="shrink-0 font-semibold text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
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

            {/* STATUS */}

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

              <option value="Approved">
                Approved
              </option>

              <option value="Active">
                Active
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
   VIEW USER MODAL
================================================================= */

function UserDetailsModal({
  user,
  isLoading,
  onClose,
}: {
  user: AdminUserDetails | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER - FIXED */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              User Details
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Account and profile information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* BODY - ONLY THIS SCROLLS */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {isLoading ? (
            <LoadingState />
          ) : !user ? (
            <EmptyState message="User details are unavailable." />
          ) : (
            <div className="space-y-5">
              {/* USER HEADER */}

              <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Avatar
                  name={user.fullName}
                  imageUrl={
                    user.participantProfile
                      ?.profileImageUrl ??
                    user.trainerProfile
                      ?.profileImageUrl ??
                    null
                  }
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {user.fullName}
                    </h3>

                    <RoleBadge
                      role={user.role}
                    />

                    <StatusBadge
                      status={user.status}
                    />
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {user.userCode}
                  </p>
                </div>
              </div>

              {/* ACCOUNT INFORMATION */}

              <ProfileSection title="Account Information">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Info
                    label="Email"
                    value={user.email}
                  />

                  <Info
                    label="Mobile Number"
                    value={
                      user.mobileNumber ||
                      "Not specified"
                    }
                  />

                  <Info
                    label="Role"
                    value={user.role}
                  />

                  <Info
                    label="Status"
                    value={user.status}
                  />

                  <Info
                    label="Email Verification"
                    value={
                      user.isEmailVerified
                        ? "Verified"
                        : "Not verified"
                    }
                  />

                  <Info
                    label="Created"
                    value={formatDate(
                      user.createdAt
                    )}
                  />

                  <Info
                    label="Updated"
                    value={formatDate(
                      user.updatedAt
                    )}
                  />
                </div>
              </ProfileSection>

              {/* PARTICIPANT */}

              {user.participantProfile && (
                <ProfileSection title="Participant Profile">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <Info
                      label="First Name"
                      value={
                        user
                          .participantProfile
                          .firstName ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Middle Name"
                      value={
                        user
                          .participantProfile
                          .middleName ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Last Name"
                      value={
                        user
                          .participantProfile
                          .lastName ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Birth Date"
                      value={
                        user
                          .participantProfile
                          .birthDate
                          ? formatDate(
                              user
                                .participantProfile
                                .birthDate
                            )
                          : "Not specified"
                      }
                    />

                    <Info
                      label="Gender"
                      value={
                        user
                          .participantProfile
                          .gender ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Address"
                      value={
                        user
                          .participantProfile
                          .address ||
                        "Not specified"
                      }
                    />
                  </div>
                </ProfileSection>
              )}

              {/* TRAINER */}

              {user.trainerProfile && (
                <ProfileSection title="Trainer Profile">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <Info
                      label="First Name"
                      value={
                        user
                          .trainerProfile
                          .firstName ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Middle Name"
                      value={
                        user
                          .trainerProfile
                          .middleName ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Last Name"
                      value={
                        user
                          .trainerProfile
                          .lastName ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Specialization"
                      value={
                        user
                          .trainerProfile
                          .specialization ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Years of Experience"
                      value={
                        user
                          .trainerProfile
                          .yearsOfExperience !=
                        null
                          ? String(
                              user
                                .trainerProfile
                                .yearsOfExperience
                            )
                          : "Not specified"
                      }
                    />

                    <Info
                      label="Trainer Active"
                      value={
                        user
                          .trainerProfile
                          .isActive
                          ? "Yes"
                          : "No"
                      }
                    />

                    <Info
                      label="Gender"
                      value={
                        user
                          .trainerProfile
                          .gender ||
                        "Not specified"
                      }
                    />

                    <Info
                      label="Birth Date"
                      value={
                        user
                          .trainerProfile
                          .birthDate
                          ? formatDate(
                              user
                                .trainerProfile
                                .birthDate
                            )
                          : "Not specified"
                      }
                    />

                    <Info
                      label="Activated At"
                      value={
                        user
                          .trainerProfile
                          .activatedAt
                          ? formatDate(
                              user
                                .trainerProfile
                                .activatedAt
                            )
                          : "Not specified"
                      }
                    />
                  </div>

                  {user.trainerProfile.bio && (
                    <div className="mt-5 border-t border-gray-200 pt-5">
                      <Info
                        label="Bio"
                        value={
                          user.trainerProfile
                            .bio
                        }
                      />
                    </div>
                  )}

                  <div className="mt-5 border-t border-gray-200 pt-5">
                    <Info
                      label="Address"
                      value={
                        user.trainerProfile
                          .address ||
                        "Not specified"
                      }
                    />
                  </div>
                </ProfileSection>
              )}
            </div>
          )}
        </div>

        {/* FOOTER - FIXED */}

        <div className="flex shrink-0 justify-end border-t border-gray-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* =================================================================
   EDIT USER MODAL
================================================================= */

function EditUserModal({
  user,
  isLoading,
  isSaving,
  onClose,
  onSave,
}: {
  user: AdminUserDetails | null;
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    request: UpdateAdminUserRequest
  ) => Promise<void>;
}) {
  const [form, setForm] =
    useState<UpdateAdminUserRequest>({});

  useEffect(() => {
    if (!user) {
      return;
    }

    const profile =
      user.participantProfile ??
      user.trainerProfile;

    setForm({
      email: user.email,
      mobileNumber: user.mobileNumber,

      firstName:
        profile?.firstName ?? null,

      middleName:
        profile?.middleName ?? null,

      lastName:
        profile?.lastName ?? null,

      birthDate:
        profile?.birthDate ?? null,

      address:
        profile?.address ?? null,

      gender:
        profile?.gender ?? null,

      specialization:
        user.trainerProfile
          ?.specialization ?? null,

      bio:
        user.trainerProfile?.bio ?? null,

      yearsOfExperience:
        user.trainerProfile
          ?.yearsOfExperience ?? null,

      isActive:
        user.trainerProfile?.isActive ?? null,
    });
  }, [user]);

  const updateField = <
    K extends keyof UpdateAdminUserRequest
  >(
    key: K,
    value: UpdateAdminUserRequest[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Edit User
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Update account and profile information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {isLoading ? (
            <LoadingState />
          ) : !user ? (
            <EmptyState message="User details are unavailable." />
          ) : (
            <div className="space-y-5">
              {/* BASIC INFORMATION */}

              <ProfileSection title="Basic Information">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="First Name"
                    value={
                      form.firstName ?? ""
                    }
                    onChange={(value) =>
                      updateField(
                        "firstName",
                        value
                      )
                    }
                  />

                  <Input
                    label="Middle Name"
                    value={
                      form.middleName ?? ""
                    }
                    onChange={(value) =>
                      updateField(
                        "middleName",
                        value
                      )
                    }
                  />

                  <Input
                    label="Last Name"
                    value={
                      form.lastName ?? ""
                    }
                    onChange={(value) =>
                      updateField(
                        "lastName",
                        value
                      )
                    }
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={
                      form.email ?? ""
                    }
                    onChange={(value) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                  />

                  <Input
                    label="Mobile Number"
                    value={
                      form.mobileNumber ??
                      ""
                    }
                    onChange={(value) =>
                      updateField(
                        "mobileNumber",
                        value
                      )
                    }
                  />

                  <Input
                    label="Birth Date"
                    type="date"
                    value={
                      form.birthDate
                        ? form.birthDate.slice(
                            0,
                            10
                          )
                        : ""
                    }
                    onChange={(value) =>
                      updateField(
                        "birthDate",
                        value || null
                      )
                    }
                  />

                  <Input
                    label="Gender"
                    value={
                      form.gender ?? ""
                    }
                    onChange={(value) =>
                      updateField(
                        "gender",
                        value || null
                      )
                    }
                  />

                  <Input
                    label="Address"
                    value={
                      form.address ?? ""
                    }
                    onChange={(value) =>
                      updateField(
                        "address",
                        value || null
                      )
                    }
                  />
                </div>
              </ProfileSection>

              {/* TRAINER */}

              {user.role === "Trainer" && (
                <ProfileSection title="Trainer Information">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Specialization"
                        value={
                          form.specialization ??
                          ""
                        }
                        onChange={(value) =>
                          updateField(
                            "specialization",
                            value || null
                          )
                        }
                      />

                      <Input
                        label="Years of Experience"
                        type="number"
                        value={
                          form.yearsOfExperience !=
                          null
                            ? String(
                                form.yearsOfExperience
                              )
                            : ""
                        }
                        onChange={(value) =>
                          updateField(
                            "yearsOfExperience",
                            value === ""
                              ? null
                              : Number(
                                  value
                                )
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                        Bio
                      </label>

                      <textarea
                        value={
                          form.bio ?? ""
                        }
                        onChange={(event) =>
                          updateField(
                            "bio",
                            event.target
                              .value ||
                              null
                          )
                        }
                        rows={5}
                        placeholder="Trainer biography..."
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                      />
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3">
                      <input
                        type="checkbox"
                        checked={
                          form.isActive ===
                          true
                        }
                        onChange={(event) =>
                          updateField(
                            "isActive",
                            event.target
                              .checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        Trainer profile is active
                      </span>
                    </label>
                  </div>
                </ProfileSection>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void onSave(form)
            }
            disabled={
              isSaving || isLoading
            }
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* =================================================================
   STATUS MODAL
================================================================= */

function StatusModal({
  user,
  isLoading,
  isSaving,
  onClose,
  onSave,
}: {
  user: AdminUserDetails | null;
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    status: UserStatus
  ) => Promise<void>;
}) {
  const [status, setStatus] =
    useState<UserStatus>("Pending");

  useEffect(() => {
    if (user) {
      setStatus(user.status);
    }
  }, [user]);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Update Status
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Change the user's account status
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <LoadingState />
          ) : !user ? (
            <EmptyState message="User details are unavailable." />
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={user.fullName}
                    imageUrl={
                      user
                        .participantProfile
                        ?.profileImageUrl ??
                      user
                        .trainerProfile
                        ?.profileImageUrl ??
                      null
                    }
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {user.fullName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {user.userCode}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="user-status"
                  className="mb-1.5 block text-xs font-semibold text-gray-600"
                >
                  Account Status
                </label>

                <select
                  id="user-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as UserStatus
                    )
                  }
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Active">
                    Approved
                  </option>

                  <option value="Active">
                    Active
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
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void onSave(status)
            }
            disabled={
              isSaving || isLoading
            }
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving
              ? "Updating..."
              : "Update Status"}
          </button>
        </div>
      </div>
    </ModalOverlay>
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