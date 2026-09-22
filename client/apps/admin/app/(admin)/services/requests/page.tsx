"use client";

import { useEffect, useState } from "react";

import type {
  ServiceRequest,
  ServiceRequestResolutionType,
  ServiceRequestStatus,
  ServiceConsultation,
} from "@repo/types";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceRequestTable } from "@/components/Services/ServiceRequestTable";
import { ServiceRequestReviewModal } from "@/components/Services/ServiceRequestReviewModal";
import { ServiceConsultationModal } from "@/components/Services/ServiceConsultationModal";

import {
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

export default function ServiceRequestsPage() {
  const {
    serviceRequests,
    isLoading,
    isUpdatingRequest,
    error,

    getServiceRequests,
    reviewServiceRequest,
    createConsultation,
  } = useService(serviceApi);

  // =========================
  // REQUEST REVIEW MODAL
  // =========================

  const [isReviewOpen, setIsReviewOpen] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  // =========================
  // CONSULTATION MODAL
  // =========================

  const [
    isConsultationOpen,
    setIsConsultationOpen,
  ] = useState(false);

  const [
    selectedConsultation,
    setSelectedConsultation,
  ] = useState<ServiceConsultation | null>(null);

  // =========================
  // LOAD REQUESTS
  // =========================

  useEffect(() => {
    void getServiceRequests();

    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // OPEN REQUEST REVIEW
  // =========================

  const handleReview = (
    request: ServiceRequest,
  ) => {
    setSelectedRequest(request);
    setIsReviewOpen(true);
  };

  // =========================
  // CLOSE REQUEST REVIEW
  // =========================

  const handleCloseReview = () => {
    if (isUpdatingRequest) {
      return;
    }

    setIsReviewOpen(false);
    setSelectedRequest(null);
  };

  // =========================
  // CLOSE CONSULTATION
  // =========================

  const handleCloseConsultation = () => {
    setIsConsultationOpen(false);
    setSelectedConsultation(null);
  };

  // =========================
  // REVIEW REQUEST
  // =========================

  const handleRequestReview = async (
    status: ServiceRequestStatus,
    resolutionType:
      | ServiceRequestResolutionType
      | null,
    adminRemarks: string,
  ) => {
    if (!selectedRequest) {
      return;
    }

    const requestBeingReviewed =
      selectedRequest;

    const result =
      await reviewServiceRequest(
        requestBeingReviewed.id,
        {
          status,
          resolutionType,
          adminRemarks:
            adminRemarks.trim() || null,
        },
      );

    if (!result) {
      return;
    }

    // Close review modal first.
    setIsReviewOpen(false);
    setSelectedRequest(null);

    await getServiceRequests();

    // =====================================
    // APPROVED + CONSULTATION
    // =====================================

    if (
      status === "Approved" &&
      resolutionType === "Consultation"
    ) {
      const consultation: ServiceConsultation = {
        id: "",
        serviceRequestId:
          requestBeingReviewed.id,

        serviceName:
          requestBeingReviewed.serviceName ??
          null,

        applicantName:
          requestBeingReviewed.applicantName,

        applicantEmail:
          requestBeingReviewed.applicantEmail,

        // Empty because admin will schedule it
        // inside the consultation modal.
        scheduledAt: "",

        endedAt: null,

        meetingLink: "",

        notes: adminRemarks.trim() || null,

        status: "Scheduled",

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      setSelectedConsultation(
        consultation,
      );

      setIsConsultationOpen(true);
    }
  };

  // =========================
  // SAVE CONSULTATION
  // =========================

  const handleConsultationSubmit = async (
    scheduledAt: string,
    meetingLink: string,
    notes: string,
    status: any,
  ) => {
    if (!selectedConsultation) {
      return;
    }

    const result =
      await createConsultation({
        serviceRequestId:
          selectedConsultation.serviceRequestId,

        scheduledAt,

        meetingLink,

        notes:
          notes.trim() || null,
      });

    if (!result) {
      return;
    }

    setIsConsultationOpen(false);
    setSelectedConsultation(null);

    await getServiceRequests();
  };

  // =========================
  // STATS
  // =========================

  const totalRequests =
    serviceRequests.length;

  const pendingRequests =
    serviceRequests.filter(
      (request) =>
        request.status === "Pending",
    ).length;

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">
      <PageSection
        title="Service Requests"
        description="Review and manage service requests."
      />

      <StatGrid>
        <StatCard
          title="Total Request"
          value={totalRequests}
          variant="primary"
        />

        <StatCard
          title="Pending"
          value={pendingRequests}
          variant="warning"
        />
      </StatGrid>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <ServiceRequestTable
            requests={serviceRequests}
            isLoading={isLoading}
            onReview={handleReview}
          />
        </div>
      </section>

      {/* =========================
          REQUEST REVIEW MODAL
      ========================== */}

      <ServiceRequestReviewModal
        open={isReviewOpen}
        request={selectedRequest}
        isSubmitting={isUpdatingRequest}
        onClose={handleCloseReview}
        onSubmit={handleRequestReview}
      />

      {/* =========================
          CONSULTATION MODAL
      ========================== */}

      <ServiceConsultationModal
        open={isConsultationOpen}
        consultation={selectedConsultation}
        isSubmitting={false}
        onClose={handleCloseConsultation}
        onSubmit={handleConsultationSubmit}
      />
    </div>
  );
}