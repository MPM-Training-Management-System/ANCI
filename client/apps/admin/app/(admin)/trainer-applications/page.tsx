"use client";

import { useMemo, useState } from "react";

import {
  Check,
  Clock3,
  FileText,
  RotateCcw,
  UsersRound,
  X,
} from "lucide-react";

import {
  Button,
  DataTable,
  PageSection,
  PageSkeleton,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import { useTrainerApplications } from "@repo/hooks";

import { trainerApplicationApi } from "@/lib/api";

import { columns } from "./columns";
import type { TrainerApplicationRow } from "./columns";

import type { TrainerApplication } from "@repo/types";

import ReviewModal from "./ReviewModal";
import type { ReviewDecision } from "./ReviewModal";

// =============================================================
// TRAINER APPLICATIONS PAGE
// =============================================================

export default function TrainerApplicationsPage() {
  const {
    applications,
    selectedApplication,
    setSelectedApplication,
    isLoading,
    isReviewing,
    error,
    loadApplications,
    reviewApplication,
  } = useTrainerApplications(trainerApplicationApi);

  // ===========================================================
  // MODAL STATE
  // ===========================================================

  const [remarks, setRemarks] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDecision, setSelectedDecision] =
    useState<ReviewDecision>("Approved");

  // ===========================================================
  // FILTER STATE
  // ===========================================================

  const [statusFilter, setStatusFilter] = useState("All");

  // ===========================================================
  // OPEN REVIEW MODAL
  // ===========================================================

  const openReview = (
    application: (typeof applications)[number],
  ) => {
    setSelectedApplication(application);

    setRemarks(application.adminRemarks ?? "");

    setSelectedDecision("Approved");

    setIsModalOpen(true);
  };

  // ===========================================================
  // CLOSE REVIEW MODAL
  // ===========================================================

  const closeModal = () => {
    if (isReviewing) {
      return;
    }

    setIsModalOpen(false);

    setRemarks("");

    setSelectedApplication(null);
  };

  // ===========================================================
  // SUBMIT REVIEW
  // ===========================================================

  const handleReview = async () => {
    if (!selectedApplication || isReviewing) {
      return;
    }

    const success = await reviewApplication(
      selectedApplication.id,
      selectedDecision,
      remarks.trim() || undefined,
    );

    if (success) {
      setIsModalOpen(false);

      setRemarks("");

      setSelectedApplication(null);
    }
  };

  // ===========================================================
  // FILTER APPLICATIONS
  // ===========================================================

  const filteredApplications = useMemo(() => {
    if (statusFilter === "All") {
      return applications;
    }

    return applications.filter(
      (application) =>
        application.status.toLowerCase() ===
        statusFilter.toLowerCase(),
    );
  }, [applications, statusFilter]);

  // ===========================================================
  // STATISTICS
  // ===========================================================

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status.toLowerCase() === "pending",
  ).length;

  const approvedApplications = applications.filter(
    (application) =>
      application.status.toLowerCase() === "approved",
  ).length;

  const needsReviewApplications = applications.filter(
    (application) => {
      const status = application.status
        .toLowerCase()
        .replace(/[\s_-]/g, "");

      return (
        status === "rejected" ||
        status === "needscorrection"
      );
    },
  ).length;

  // ===========================================================
  // LOADING STATE
  // ===========================================================

  if (isLoading && applications.length === 0) {
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

  // ===========================================================
  // PAGE UI
  // ===========================================================

  return (
    <div className="min-h-full lg:p-2">
      {/* PAGE HEADER */}

      <PageSection
        title="Trainer Applications"
        description="Review trainer applications, verify submitted information, and manage application status."
        actions={
          <Button
            type="button"
            onClick={loadApplications}
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

      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <StatGrid>
          <StatCard
            title="Total Applications"
            value={totalApplications}
            description="All submitted applications"
            icon={UsersRound}
            variant="primary"
          />

          <StatCard
            title="Pending"
            value={pendingApplications}
            description="Awaiting review"
            icon={Clock3}
            variant="warning"
          />

          <StatCard
            title="Approved"
            value={approvedApplications}
            description="Approved applications"
            icon={Check}
            variant="success"
          />

          <StatCard
            title="Needs Review"
            value={needsReviewApplications}
            description="Rejected or needs correction"
            icon={FileText}
            variant="danger"
          />
        </StatGrid>

        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <X className="h-4 w-4 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load applications
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            APPLICATION TABLE
        ===================================================== */}

        <DataTable
          columns={columns}
          data={filteredApplications as TrainerApplicationRow[]}
          searchable
          searchPlaceholder="Search trainer applications..."
          showPagination
          emptyTitle={
            isLoading
              ? "Loading trainer applications..."
              : "No trainer applications"
          }
          emptyDescription={
            isLoading
              ? "Please wait while applications are loaded."
              : statusFilter !== "All"
                ? "No applications match the selected status."
                : "There are currently no trainer applications."
          }
          meta={{
            onReview: (application: TrainerApplication) => {
              openReview(
                application as (typeof applications)[number],
              );
            },
          }}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="
                  h-10 rounded-xl border border-slate-200
                  bg-white px-3 text-sm font-medium
                  text-slate-700 outline-none transition
                  focus:border-slate-400 focus:ring-4
                  focus:ring-slate-100
                "
                aria-label="Filter trainer applications by status"
              >
                <option value="All">All Status</option>

                <option value="Pending">Pending</option>

                <option value="UnderReview">
                  Under Review
                </option>

                <option value="Approved">Approved</option>

                <option value="NeedsCorrection">
                  Needs Correction
                </option>

                <option value="Rejected">Rejected</option>
              </select>
            </div>
          }
        />
      </div>

      {/* =======================================================
          SEPARATE REVIEW MODAL
      ======================================================= */}

      {isModalOpen && selectedApplication && (
        <ReviewModal
          application={selectedApplication}
          remarks={remarks}
          setRemarks={setRemarks}
          selectedDecision={selectedDecision}
          setSelectedDecision={setSelectedDecision}
          isReviewing={isReviewing}
          onClose={closeModal}
          onSubmit={handleReview}
        />
      )}
    </div>
  );
}