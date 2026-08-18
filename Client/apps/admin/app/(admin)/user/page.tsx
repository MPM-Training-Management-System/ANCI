"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  participantApi,
  trainerApi,
  userApplicationApi,
} from "@/lib/api";

import type {
  Participant,
  UserApplicationResponse,
  UserApplicationDetails,

  // Existing modal types
  ParticipantApplicationDetails,
  TrainerApplicationDetails,
} from "@repo/types";

import {
  PageSection,
  StatGrid,
  StatCard,
  StatCardSkeleton,
  DataTable,
  FilterDropdown,
} from "@repo/ui/index";

import PendingApprovals from "./PendingApprovals";

import ApplicationDetailsModal from "./ApplicationDetailsModal";

import TrainerDetailsModal from "./TrainerDetailsModal";

import { useParticipants } from "@/hooks/useParticipants";

import { columns } from "./columns";

export default function DashboardPage() {
  // =====================================================
  // USERS / DATATABLE
  // =====================================================

  const {
    participants,
    count,
    refresh,
  } = useParticipants();

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  // =====================================================
  // PENDING APPLICATIONS
  //
  // IMPORTANT:
  //
  // ONE SOURCE ONLY
  //
  // UserApplication
  //
  // This already contains:
  //
  // Participant
  // Trainer
  //
  // No more separate participant/trainer
  // pending requests.
  // =====================================================

  const [
    pendingApplications,
    setPendingApplications,
  ] = useState<
    UserApplicationResponse[]
  >([]);

  // =====================================================
  // SELECTED APPLICATION
  // =====================================================

  const [
    selectedApplication,
    setSelectedApplication,
  ] =
    useState<UserApplicationResponse | null>(
      null
    );

  // =====================================================
  // APPLICATION DETAILS
  // =====================================================

  const [
    applicationDetails,
    setApplicationDetails,
  ] =
    useState<UserApplicationDetails | null>(
      null
    );

  // =====================================================
  // ADD USER
  // =====================================================

  const [
    openAddModal,
    setOpenAddModal,
  ] = useState(false);

  // =====================================================
  // FILTERS
  // =====================================================

  const [
    filters,
    setFilters,
  ] = useState<{
    role: string;
    status: string;
    createdAt?: Date;
  }>({
    role: "",
    status: "",
    createdAt: undefined,
  });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState<{
    role: string;
    status: string;
    createdAt?: Date;
  }>({
    role: "",
    status: "",
    createdAt: undefined,
  });

  // =====================================================
  // FILTER DATA TABLE
  //
  // NOTE:
  //
  // This is separate from pending applications.
  //
  // DataTable = Users
  //
  // PendingApprovals = UserApplications
  // =====================================================

  const filteredParticipants =
    participants.filter(
      (participant) => {
    
        const matchRole =
          !appliedFilters.role ||
          participant.role
            .toLowerCase() ===
            appliedFilters.role.toLowerCase();

     
        const matchStatus =
          !appliedFilters.status ||
          (
            appliedFilters.status ===
            "active"
              ? participant.isActive
              : !participant.isActive
          );


        const matchDate =
          !appliedFilters.createdAt ||
          new Date(
            participant.createdAt
          ).toDateString() ===
            appliedFilters.createdAt.toDateString();

        return (
          matchRole &&
          matchStatus &&
          matchDate
        );
      }
    );

  // =====================================================
  // LOAD PENDING APPLICATIONS
  //
  // ONE API CALL ONLY
  //
  // GET:
  // /api/admin/applications/pending
  //
  // Returns:
  //
  // Participant
  // Trainer
  //
  // =====================================================

  const loadPendingApplications =
    useCallback(
      async () => {
        try {
          console.log(
            "================================"
          );

          console.log(
            "LOADING USER APPLICATIONS"
          );

          console.log(
            "================================"
          );

          const applications =
            await userApplicationApi.getPending();

          console.log(
            "USER APPLICATIONS:",
            applications
          );

          // =============================================
          // SAFETY FILTER
          //
          // Only Pending applications.
          //
          // Admin will never appear here because
          // UserApplication is created for registration
          // applications only.
          // =============================================

          const pending =
            applications.filter(
              (application) =>
                application.status ===
                "Pending"
            );

          // =============================================
          // SORT NEWEST FIRST
          // =============================================

          pending.sort(
            (a, b) => {
              const dateA =
                new Date(
                  a.submittedAt
                ).getTime();

              const dateB =
                new Date(
                  b.submittedAt
                ).getTime();

              return (
                dateB - dateA
              );
            }
          );

          console.log(
            "FINAL PENDING:",
            pending
          );

          // =============================================
          // DEBUG
          // =============================================

          pending.forEach(
            (
              application,
              index
            ) => {
              console.log(
                `PENDING ${index + 1}:`,
                {
                  id:
                    application.id,

                  userId:
                    application.userId,

                  userIdNumber:
                    application.userIdNumber,

                  name:
                    application.fullName,

                  role:
                    application.role,

                  email:
                    application.email,

                  status:
                    application.status,
                }
              );
            }
          );

          // =============================================
          // SET STATE
          // =============================================

          setPendingApplications(
            pending
          );
        } catch (error) {
          console.error(
            "Failed to load pending applications:",
            error
          );

          setPendingApplications([]);
        }
      },
      []
    );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        await loadPendingApplications();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [
    loadPendingApplications,
  ]);

  // =====================================================
  // REFRESH
  // =====================================================

  async function handleRefresh() {
    try {
      setRefreshing(true);

      await Promise.all([
        loadPendingApplications(),
        refresh(),
      ]);
    } catch (error) {
      console.error(
        "Refresh failed:",
        error
      );
    } finally {
      setRefreshing(false);
    }
  }

  // =====================================================
  // SELECT APPLICATION
  //
  // IMPORTANT:
  //
  // Participant and Trainer use the SAME endpoint.
  //
  // GET:
  //
  // /api/admin/applications/{id}
  //
  // =====================================================

  async function handleSelectApplication(
    application: UserApplicationResponse
  ) {
    try {
      console.log(
        "================================"
      );

      console.log(
        "APPLICATION CLICKED"
      );

      console.log(
        "ID:",
        application.id
      );

      console.log(
        "ROLE:",
        application.role
      );

      console.log(
        "USER ID:",
        application.userId
      );

      console.log(
        "================================"
      );

      setSelectedApplication(
        application
      );

      setApplicationDetails(
        null
      );

      setLoadingDetails(
        true
      );

      // =================================================
      // ONE DETAILS API
      // =================================================

      const details =
        await userApplicationApi.getById(
          application.id
        );

      console.log(
        "APPLICATION DETAILS:",
        details
      );

      setApplicationDetails(
        details
      );
    } catch (error) {
      console.error(
        "Failed to load application details:",
        error
      );

      setSelectedApplication(
        null
      );

      setApplicationDetails(
        null
      );

      window.alert(
        "Failed to load application details."
      );
    } finally {
      setLoadingDetails(
        false
      );
    }
  }

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  function closeApplicationModal() {
    setSelectedApplication(
      null
    );

    setApplicationDetails(
      null
    );
  }

  // =====================================================
  // APPROVE APPLICATION
  //
  // BOTH:
  //
  // Participant
  // Trainer
  //
  // SAME API
  //
  // PATCH:
  // /api/admin/applications/{id}/approve
  // =====================================================

  async function handleApproveApplication() {
    if (
      !applicationDetails
    ) {
      return;
    }

    const fullName =
      applicationDetails.fullName ||
      [
        applicationDetails.firstName,
        applicationDetails.middleName,
        applicationDetails.lastName,
      ]
        .filter(Boolean)
        .join(" ");

    const role =
      applicationDetails.role ||
      "User";

    const confirmed =
      window.confirm(
        `Approve ${fullName}'s ${role.toLowerCase()} application?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingDetails(
        true
      );

      console.log(
        "APPROVING APPLICATION:",
        applicationDetails.id
      );

      // =================================================
      // ONE APPROVAL API
      // =================================================

      const response =
        await userApplicationApi.approve(
          applicationDetails.id
        );

      console.log(
        "APPROVE RESPONSE:",
        response
      );

      // =================================================
      // CLOSE
      // =================================================

      closeApplicationModal();

      // =================================================
      // REFRESH BOTH
      // =================================================

      await Promise.all([
        loadPendingApplications(),
        refresh(),
      ]);

      window.alert(
        `${role} application approved successfully.`
      );
    } catch (error) {
      console.error(
        "Failed to approve application:",
        error
      );

      window.alert(
        "Failed to approve application."
      );
    } finally {
      setLoadingDetails(
        false
      );
    }
  }

  // =====================================================
  // REJECT APPLICATION
  //
  // BOTH:
  //
  // Participant
  // Trainer
  //
  // SAME API
  //
  // PATCH:
  // /api/admin/applications/{id}/reject
  // =====================================================

  async function handleRejectApplication() {
    if (
      !applicationDetails
    ) {
      return;
    }

    const fullName =
      applicationDetails.fullName ||
      [
        applicationDetails.firstName,
        applicationDetails.middleName,
        applicationDetails.lastName,
      ]
        .filter(Boolean)
        .join(" ");

    const role =
      applicationDetails.role ||
      "User";

    const reason =
      window.prompt(
        `Reason for rejecting ${fullName}'s application:`
      );

    // User pressed Cancel
    if (
      reason === null
    ) {
      return;
    }

    const trimmedReason =
      reason.trim();

    if (
      !trimmedReason
    ) {
      window.alert(
        "Please provide a rejection reason."
      );

      return;
    }

    try {
      setLoadingDetails(
        true
      );

      console.log(
        "REJECTING APPLICATION:",
        applicationDetails.id
      );

      // =================================================
      // ONE REJECTION API
      // =================================================

      const response =
        await userApplicationApi.reject(
          applicationDetails.id,
          trimmedReason
        );

      console.log(
        "REJECT RESPONSE:",
        response
      );

      // =================================================
      // CLOSE
      // =================================================

      closeApplicationModal();

      // =================================================
      // REFRESH
      // =================================================

      await Promise.all([
        loadPendingApplications(),
        refresh(),
      ]);

      window.alert(
        `${role} application rejected successfully.`
      );
    } catch (error) {
      console.error(
        "Failed to reject application:",
        error
      );

      window.alert(
        "Failed to reject application."
      );
    } finally {
      setLoadingDetails(
        false
      );
    }
  }

  // =====================================================
  // EDIT USER
  // =====================================================

  async function handleEdit(
    participant: Participant
  ) {
    try {
      await participantApi.update(
        participant.id,
        {
          username:
            participant.username,

          fullName:
            participant.fullname,

          email:
            participant.email,
        }
      );

      await refresh();
    } catch (error) {
      console.error(
        "Failed to update participant:",
        error
      );
    }
  }

  async function handleToggleStatus(
  participant: Participant
) {
  const nextStatus =
    !participant.isActive;

  const action =
    nextStatus
      ? "Activate"
      : "Deactivate";

  const confirmed =
    window.confirm(
      `${action} ${participant.fullname}?`
    );

  if (!confirmed) {
    return;
  }

  try {
    const role =
      participant.role.toLowerCase();

    console.log(
      "================================"
    );

    console.log(
      "CHANGING USER STATUS"
    );

    console.log(
      "Name:",
      participant.fullname
    );

    console.log(
      "Role:",
      participant.role
    );

    console.log(
      "Participant ID:",
      participant.id
    );

    console.log(
      "User ID:",
      participant.userId
    );

    console.log(
      "Current Status:",
      participant.isActive
    );

    console.log(
      "New Status:",
      nextStatus
    );

    console.log(
      "================================"
    );

    // ============================================
    // PARTICIPANT
    // ============================================

    if (
      role === "participant"
    ) {
      await participantApi.changeStatus(
        participant.id,
        nextStatus
      );
    }

    // ============================================
    // TRAINER
    // ============================================

    else if (
      role === "trainer"
    ) {
      await trainerApi.changeStatus(
        participant.userId,
        nextStatus
      );
    }

    // ============================================
    // ADMIN
    // ============================================

    else if (
      role === "admin"
    ) {
      window.alert(
        "Admin account status cannot be changed here."
      );

      return;
    }

    // ============================================
    // REFRESH DATA
    // ============================================

    await refresh();

    window.alert(
      `${participant.fullname} has been ${
        nextStatus
          ? "activated"
          : "deactivated"
      } successfully.`
    );
  } catch (error) {
    console.error(
      "Failed to change user status:",
      error
    );

    window.alert(
      `Failed to ${
        nextStatus
          ? "activate"
          : "deactivate"
      } ${participant.fullname}.`
    );
  }
}

  // =====================================================
  // DELETE USER
  // =====================================================

  async function handleDelete(
    participant: Participant
  ) {
    const confirmed =
      window.confirm(
        `Delete ${participant.fullname}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await participantApi.delete(
        participant.id
      );

      await refresh();
    } catch (error) {
      console.error(
        "Failed to delete participant:",
        error
      );
    }
  }

  // =====================================================
  // CONVERT DETAILS FOR EXISTING PARTICIPANT MODAL
  //
  // This is only an adapter while your existing
  // ApplicationDetailsModal still expects the old type.
  //
  // Backend remains UserApplicationDetails.
  // =====================================================

  function toParticipantModalDetails(
    application: UserApplicationDetails
  ): ParticipantApplicationDetails {
    return {
      id:
        application.id,

      userId:
        application.userId,

      status:
        application.status,

      policyStatus:
        application.policyStatus,

      policyRemarks:
        application.policyRemarks,

      reviewedBy:
        application.reviewedBy,

      reviewedAt:
        application.reviewedAt,

      rejectionReason:
        application.rejectionReason,

      submittedAt:
        application.submittedAt,

      userIdNumber:
        application.userIdNumber,

      username:
        application.username,

      email:
        application.email,

      role:
        application.role,

      isActive:
        application.isActive,

      isEmailVerified:
        application.isEmailVerified,

      firstName:
        application.firstName,

      middleName:
        application.middleName,

      lastName:
        application.lastName,

      dateOfBirth:
        application.dateOfBirth || "",

      gender:
        application.gender,

      civilStatus:
        application.civilStatus,

      mobileNumber:
        application.mobileNumber,

      homeAddress:
        application.homeAddress,

      emergencyContactName:
        application.emergencyContactName,

      emergencyRelationship:
        application.emergencyRelationship,

      emergencyContactNumber:
        application.emergencyContactNumber,

      profileImage:
        application.profileImage,

      validId:
        application.validId,
    };
  }

  // =====================================================
  // CONVERT DETAILS FOR EXISTING TRAINER MODAL
  //
  // Existing TrainerDetailsModal requires some fields
  // that are optional in the shared UserApplicationDetails.
  //
  // We normalize them here.
  // =====================================================

  function toTrainerModalDetails(
    application: UserApplicationDetails
  ): TrainerApplicationDetails {
    return {
      id:
        application.id,

      userId:
        application.userId,

      userIdNumber:
        application.userIdNumber,

      username:
        application.username,

      email:
        application.email,

      firstName:
        application.firstName,

      middleName:
        application.middleName ?? null,

      lastName:
        application.lastName,

      fullName:
        application.fullName,

      dateOfBirth:
        application.dateOfBirth || "",

      gender:
        application.gender,

      civilStatus:
        application.civilStatus,

      mobileNumber:
        application.mobileNumber,

      homeAddress:
        application.homeAddress,

      expertise:
        application.expertise || "",

      yearsOfExperience:
        application.yearsOfExperience ?? 0,

      organization:
        application.organization || "",

      biography:
        application.biography || "",

      profileImage:
        application.profileImage ?? null,

      validId:
        application.validId ?? null,

      role:
        application.role,

      isProfileCompleted:
        application.isProfileCompleted ??
        false,

      isActive:
        application.isActive,

      isEmailVerified:
        application.isEmailVerified,

      status:
        application.status,

      policyStatus:
        application.policyStatus,

      policyRemarks:
        application.policyRemarks ??
        null,

      submittedAt:
        application.submittedAt,

      createdAt:
        application.createdAt ||
        application.submittedAt,

      reviewedBy:
        application.reviewedBy ??
        null,

      reviewedAt:
        application.reviewedAt ??
        null,

      rejectionReason:
        application.rejectionReason ??
        null,

      emergencyContactName:
        application.emergencyContactName ??
        null,

      emergencyRelationship:
        application.emergencyRelationship ??
        null,

      emergencyContactNumber:
        application.emergencyContactNumber ??
        null,
    };
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <PageSection
        title="User"
        description="Manage administrator, trainer, and participant accounts, including registration, roles, and account status."
      >
        <StatGrid>
          <StatCardSkeleton />

          <StatCardSkeleton />

          <StatCardSkeleton />

          <StatCardSkeleton />
        </StatGrid>
      </PageSection>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <PageSection
      title="User"
      description="Manage administrator, trainer, and participant accounts, including registration, roles, and account status."
    >
      {/* =================================================
          STATISTICS
      ================================================= */}

      <StatGrid>
        <StatCard
          title="Total Users"
          description="Registered users"
          value={count}
          variant="primary"
        />

        <StatCard
          title="Active Trainer"
          description="Currently active"
          value={
            participants.filter(
              (user) =>
                user.role ===
                  "Trainer" &&
                user.isActive
            ).length
          }
          variant="success"
        />

        <StatCard
          title="Pending"
          description="Awaiting approval"
          value={
            pendingApplications.length
          }
          variant="warning"
        />

        <StatCard
          title="Inactive"
          description="Disabled accounts"
          value={
            participants.filter(
              (user) =>
                !user.isActive
            ).length
          }
          variant="primary"
        />
      </StatGrid>

      {/* =================================================
          DATA TABLE + PENDING
      ================================================= */}

      <div
  className="
    relative
    z-10
    grid
    grid-cols-1
    gap-6
    xl:grid-cols-[minmax(0,1fr)_360px]
  "
>
        {/* ===============================================
            DATA TABLE
        =============================================== */}

        <div className="relative z-10 min-w-0">
  <DataTable
    columns={columns({
      onEdit: handleEdit,
      onDelete: handleDelete,
      onToggleStatus: handleToggleStatus,
    })}
    data={filteredParticipants}
            addButton={{
              label:
                "Add User",

              icon: (
                <Plus size={18} />
              ),

              onClick: () =>
                setOpenAddModal(
                  true
                ),
            }}
            toolbar={
              <FilterDropdown
                fields={[
                  {
                    key:
                      "role",

                    label:
                      "Role",

                    type:
                      "select",

                    value:
                      filters.role,

                    options: [
                      {
                        label:
                          "All Roles",

                        value:
                          "",
                      },

                      {
                        label:
                          "Admin",

                        value:
                          "Admin",
                      },

                      {
                        label:
                          "Trainer",

                        value:
                          "Trainer",
                      },

                      {
                        label:
                          "Participant",

                        value:
                          "Participant",
                      },
                    ],
                  },

                  {
                    key:
                      "status",

                    label:
                      "Status",

                    type:
                      "select",

                    value:
                      filters.status,

                    options: [
                      {
                        label:
                          "All Status",

                        value:
                          "",
                      },

                      {
                        label:
                          "Active",

                        value:
                          "active",
                      },

                      {
                        label:
                          "Inactive",

                        value:
                          "inactive",
                      },
                    ],
                  },

                  {
                    key:
                      "createdAt",

                    label:
                      "Registration Date",

                    type:
                      "date",

                    value:
                      filters.createdAt,
                  },
                ]}
                onChange={(
                  key,
                  value
                ) => {
                  setFilters(
                    (
                      previous
                    ) => ({
                      ...previous,

                      [key]:
                        value,
                    })
                  );
                }}
                onApply={() => {
                  setAppliedFilters(
                    filters
                  );
                }}
                onReset={() => {
                  const reset = {
                    role:
                      "",

                    status:
                      "",

                    createdAt:
                      undefined,
                  };

                  setFilters(
                    reset
                  );

                  setAppliedFilters(
                    reset
                  );
                }}
              />
            }
          />
        </div>

        {/* ===============================================
            PENDING APPROVALS
        =============================================== */}

        <div className="min-w-0">
          <PendingApprovals
            applications={
              pendingApplications
            }
            onSelect={
              handleSelectApplication
            }
          />
        </div>
      </div>

      {/* =================================================
          REFRESH
      ================================================= */}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={
            handleRefresh
          }
          disabled={
            refreshing
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-gray-200
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-gray-700
            transition
            hover:bg-gray-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* =================================================
          PARTICIPANT DETAILS
      ================================================= */}

      {selectedApplication &&
        applicationDetails &&
        selectedApplication.role
          .toLowerCase() ===
          "participant" && (
          <ApplicationDetailsModal
            application={
              toParticipantModalDetails(
                applicationDetails
              )
            }
            onClose={
              closeApplicationModal
            }
            onApprove={
              handleApproveApplication
            }
            onReject={
              handleRejectApplication
            }
          />
        )}

      {/* =================================================
          TRAINER DETAILS
      ================================================= */}

      {selectedApplication &&
        applicationDetails &&
        selectedApplication.role
          .toLowerCase() ===
          "trainer" && (
          <TrainerDetailsModal
            application={
              toTrainerModalDetails(
                applicationDetails
              )
            }
            onClose={
              closeApplicationModal
            }
            onApprove={
              handleApproveApplication
            }
            onReject={
              handleRejectApplication
            }
          />
        )}

      {/* =================================================
          LOADING DETAILS
      ================================================= */}

      {loadingDetails && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-black/40
            backdrop-blur-sm
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              bg-white
              px-6
              py-4
              shadow-xl
            "
          >
            <RefreshCw
              size={18}
              className="
                animate-spin
                text-blue-600
              "
            />

            <span
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              Loading application details...
            </span>
          </div>
        </div>
      )}

      {/* =================================================
          ADD USER MODAL
      ================================================= */}

      {/*
        Keep your existing AddUserModal here.

        Example:

        <AddUserModal
          open={openAddModal}
          onClose={() =>
            setOpenAddModal(false)
          }
        />
      */}
    </PageSection>
  );
}