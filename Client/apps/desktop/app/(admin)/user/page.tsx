"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { useParticipants } from "@/hooks/useParticipants";

import {
  participantApi,
  participantApplicationApi,
} from "@/lib/api";

import ApplicationDetailsModal from "./ApplicationDetailsModal";
import PendingApprovals from "./PendingApprovals";

import {
  PageSection,
  StatGrid,
  StatCard,
  StatCardSkeleton,
  DataTable,
  FilterDropdown,
} from "@repo/ui/index";

import type {
  Participant,
  ParticipantApplication,
  ParticipantApplicationDetails,
} from "@repo/types";

import { columns } from "./columns";

export default function DashboardPage() {
  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [loadingApplication, setLoadingApplication] =
    useState(false);

  // =====================================================
  // SELECTED APPLICATION
  // =====================================================

  const [selectedApplication, setSelectedApplication] =
    useState<ParticipantApplication | null>(null);

  // =====================================================
  // FULL APPLICATION DETAILS
  // =====================================================

  const [applicationDetails, setApplicationDetails] =
    useState<ParticipantApplicationDetails | null>(null);

  // =====================================================
  // PENDING APPLICATIONS
  // =====================================================

  const [pendingApplications, setPendingApplications] =
    useState<ParticipantApplication[]>([]);

  // =====================================================
  // FILTERS
  // =====================================================

  const [filters, setFilters] = useState({
    role: "",
    status: "",
    createdAt: undefined as Date | undefined,
  });

  const [appliedFilters, setAppliedFilters] =
    useState({
      role: "",
      status: "",
      createdAt: undefined as Date | undefined,
    });

  // =====================================================
  // ADD USER MODAL
  // =====================================================

  const [openAddModal, setOpenAddModal] =
    useState(false);

  // =====================================================
  // PARTICIPANTS
  // =====================================================

  const {
    participants,
    count,
    refresh,
  } = useParticipants();

  // =====================================================
  // FILTER PARTICIPANTS
  // =====================================================

  const filteredParticipants =
    participants.filter((participant) => {
      const matchRole =
        !appliedFilters.role ||
        participant.role.toLowerCase() ===
          appliedFilters.role.toLowerCase();

      const matchStatus =
        !appliedFilters.status ||
        (appliedFilters.status === "active"
          ? participant.isActive
          : !participant.isActive);

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
    });

  // =====================================================
  // EDIT PARTICIPANT
  // =====================================================

  const handleEdit = async (
    participant: Participant
  ) => {
    try {
      await participantApi.update(
        participant.id,
        {
          fullName: participant.fullname,
          email: participant.email,
          username: "",
        }
      );

      refresh();
    } catch (error) {
      console.error(
        "Failed to update participant:",
        error
      );
    }
  };

  // =====================================================
  // DELETE PARTICIPANT
  // =====================================================

  const handleDelete = async (
    participant: Participant
  ) => {
    if (!confirm("Delete participant?")) {
      return;
    }

    try {
      await participantApi.delete(
        participant.id
      );

      refresh();
    } catch (error) {
      console.error(
        "Failed to delete participant:",
        error
      );
    }
  };

  // =====================================================
  // LOAD PENDING APPLICATIONS
  // =====================================================

  useEffect(() => {
    const loadPendingApplications =
      async () => {
        try {
          const applications =
            await participantApplicationApi.getPending();

          console.log(
            "PENDING APPLICATIONS:",
            applications
          );

          setPendingApplications(
            applications
          );
        } catch (error) {
          console.error(
            "Failed to load pending applications:",
            error
          );
        }
      };

    loadPendingApplications();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // =====================================================
  // SELECT PENDING APPLICATION
  // GET FULL DETAILS
  // =====================================================

  const handleSelectApplication = async (
    application: ParticipantApplication
  ) => {
    try {
      // Keep track of selected application
      setSelectedApplication(application);

      // Clear previous details
      setApplicationDetails(null);

      // Show loading
      setLoadingApplication(true);

      console.log(
        "LOADING APPLICATION DETAILS:",
        application.id
      );

      // Get complete application details
      const details =
        await participantApplicationApi.getById(
          application.id
        );

      console.log(
        "APPLICATION DETAILS:",
        details
      );

      // Store complete details
      setApplicationDetails(details);
    } catch (error) {
      console.error(
        "Failed to load application details:",
        error
      );

      // Close if request fails
      setSelectedApplication(null);
      setApplicationDetails(null);

      alert(
        "Failed to load participant application details."
      );
    } finally {
      setLoadingApplication(false);
    }
  };

  // =====================================================
  // CLOSE APPLICATION MODAL
  // =====================================================

  const handleCloseApplication = () => {
    setSelectedApplication(null);
    setApplicationDetails(null);
  };

  // =====================================================
  // APPROVE
  // TEMPORARY
  // =====================================================

  const handleApprove = async () => {
  if (!applicationDetails) {
    return;
  }

  try {
    const confirmed = confirm(
      `Approve ${applicationDetails.firstName} ${applicationDetails.lastName}'s application?`
    );

    if (!confirmed) {
      return;
    }

    // Call backend
    await participantApplicationApi.approve(
      applicationDetails.id
    );

    // Remove from pending list immediately
    setPendingApplications((prev) =>
      prev.filter(
        (application) =>
          application.id !== applicationDetails.id
      )
    );

    // Close modal
    setSelectedApplication(null);
    setApplicationDetails(null);

    // Refresh users table
    refresh();

    console.log(
      "Participant application approved:",
      applicationDetails.id
    );
  } catch (error) {
    console.error(
      "Failed to approve participant application:",
      error
    );

    alert(
      "Failed to approve participant application."
    );
  }
};

  // =====================================================
  // REJECT
  // TEMPORARY
  // =====================================================

  const handleReject = () => {
    if (!applicationDetails) {
      return;
    }

    console.log(
      "REJECT APPLICATION:",
      applicationDetails.id
    );

    // API will be connected next
  };

  // =====================================================
  // RENDER
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
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              description="Registered users"
              value={count}
              variant="primary"
            />

            <StatCard
              title="Active Trainer"
              description="Currently active"
              value={75}
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
              value={4}
              variant="primary"
            />
          </>
        )}
      </StatGrid>

      {/* =================================================
          MAIN CONTENT
          LEFT  = EXISTING DATATABLE
          RIGHT = PENDING APPROVALS
      ================================================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* =================================================
            LEFT SIDE
            EXISTING DATATABLE
        ================================================= */}

        <div className="min-w-0">
          <DataTable
            columns={columns({
              onEdit: handleEdit,
              onDelete: handleDelete,
            })}
            data={filteredParticipants}
            addButton={{
              label: "Add User",
              icon: <Plus size={18} />,
              onClick: () =>
                setOpenAddModal(true),
            }}
            toolbar={
              <FilterDropdown
                fields={[
                  {
                    key: "role",
                    label: "Role",
                    type: "select",
                    value: filters.role,
                    options: [
                      {
                        label: "All Roles",
                        value: "",
                      },
                      {
                        label: "Admin",
                        value: "Admin",
                      },
                      {
                        label: "Trainer",
                        value: "Trainer",
                      },
                      {
                        label: "Participant",
                        value: "Participant",
                      },
                    ],
                  },

                  {
                    key: "status",
                    label: "Status",
                    type: "select",
                    value: filters.status,
                    options: [
                      {
                        label: "All Status",
                        value: "",
                      },
                      {
                        label: "Active",
                        value: "active",
                      },
                      {
                        label: "Inactive",
                        value: "inactive",
                      },
                    ],
                  },

                  {
                    key: "createdAt",
                    label: "Registration Date",
                    type: "date",
                    value:
                      filters.createdAt,
                  },
                ]}
                onChange={(key, value) =>
                  setFilters((prev) => ({
                    ...prev,
                    [key]: value,
                  }))
                }
                onApply={() => {
                  setAppliedFilters(
                    filters
                  );

                  console.log(
                    "APPLIED FILTERS:",
                    filters
                  );
                }}
                onReset={() => {
                  const reset = {
                    role: "",
                    status: "",
                    createdAt:
                      undefined,
                  };

                  setFilters(reset);
                  setAppliedFilters(reset);
                }}
              />
            }
          />
        </div>

        {/* =================================================
            RIGHT SIDE
            PENDING APPROVALS
        ================================================= */}

        <div className="min-w-0">
          <PendingApprovals
            applications={pendingApplications}
            onSelect={
              handleSelectApplication
            }
          />
        </div>
      </div>

      {/* =================================================
          APPLICATION DETAILS LOADING
      ================================================= */}

      {loadingApplication && (
        <div
          className="
            fixed
            inset-0
            z-[9998]
            flex
            items-center
            justify-center
            bg-black/40
            backdrop-blur-sm
          "
        >
          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              px-6
              py-5
              shadow-xl
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-gray-200
                  border-t-blue-600
                "
              />

              <span className="text-sm font-medium text-gray-700">
                Loading application details...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          APPLICATION DETAILS MODAL
      ================================================= */}

      {applicationDetails && (
        <ApplicationDetailsModal
          application={
            applicationDetails
          }
          onClose={
            handleCloseApplication
          }
          onApprove={
            handleApprove
          }
          onReject={
            handleReject
          }
        />
      )}

      {/* =================================================
          ADD USER MODAL
      ================================================= */}

      {/*
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