"use client";

import { useMemo, useState } from "react";

import { useTrainerApplications } from "@repo/hooks";
import { trainerApplicationApi } from "@/lib/api";

import type { TrainerApplication } from "@repo/types";
import type { ReviewDecision } from "@/app/(admin)/trainer-applications/ReviewModal";

export function useTrainerApplicationManagement() {
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

  // Review modal state
  const [remarks, setRemarks] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] =
    useState<ReviewDecision>("Approved");

  // Filter state
  const [statusFilter, setStatusFilter] = useState("All");

  // Open review modal
  const openReview = (application: TrainerApplication) => {
    setSelectedApplication(application);
    setRemarks(application.adminRemarks ?? "");
    setSelectedDecision("Approved");
    setIsModalOpen(true);
  };

  // Close review modal
  const closeModal = () => {
    if (isReviewing) return;

    setIsModalOpen(false);
    setRemarks("");
    setSelectedApplication(null);
  };

  // Submit application review
  const handleReview = async () => {
    if (!selectedApplication || isReviewing) return;

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

  // Filter applications by status
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

  // Application statistics
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

  return {
    // Application data
    applications,
    selectedApplication,

    // Loading and error states
    isLoading,
    isReviewing,
    error,

    // Refresh
    loadApplications,

    // Review modal
    remarks,
    setRemarks,
    isModalOpen,
    selectedDecision,
    setSelectedDecision,
    openReview,
    closeModal,
    handleReview,

    // Filters
    statusFilter,
    setStatusFilter,
    filteredApplications,

    // Statistics
    totalApplications,
    pendingApplications,
    approvedApplications,
    needsReviewApplications,
  };
}