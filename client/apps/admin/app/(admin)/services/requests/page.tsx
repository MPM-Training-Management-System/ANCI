"use client";

import { useEffect, useState } from "react";

import type {
  ServiceRequest,
  ServiceRequestResolutionType,
  ServiceRequestStatus,
} from "@repo/types";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceRequestTable } from "@/components/Services/ServiceRequestTable";
import { ServiceRequestReviewModal } from "@/components/Services/ServiceRequestReviewModal";

export default function ServiceRequestsPage() {
  const {
    serviceRequests,
    isLoading,
    isUpdatingRequest,
    error,

    getServiceRequests,
    reviewServiceRequest,
  } = useService(serviceApi);

  const [isReviewOpen, setIsReviewOpen] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  useEffect(() => {
    void getServiceRequests();

    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReview = (
    request: ServiceRequest,
  ) => {
    setSelectedRequest(request);
    setIsReviewOpen(true);
  };

  const handleCloseReview = () => {
    if (isUpdatingRequest) {
      return;
    }

    setIsReviewOpen(false);
    setSelectedRequest(null);
  };

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

    const result =
      await reviewServiceRequest(
        selectedRequest.id,
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

    setIsReviewOpen(false);
    setSelectedRequest(null);

    await getServiceRequests();
  };

  const totalRequests =
    serviceRequests.length;

  const pendingRequests =
    serviceRequests.filter(
      (request) =>
        request.status === "Pending",
    ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#17191c]">
          Service Requests
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review and manage service requests.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">
            Total Requests
          </p>

          <p className="mt-1 text-2xl font-bold text-[#17191c]">
            {totalRequests}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-[#17191c]">
            {pendingRequests}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <ServiceRequestTable
            requests={serviceRequests}
            isLoading={isLoading}
            onReview={handleReview}
          />
        </div>
      </section>

      <ServiceRequestReviewModal
        open={isReviewOpen}
        request={selectedRequest}
        isSubmitting={isUpdatingRequest}
        onClose={handleCloseReview}
        onSubmit={handleRequestReview}
      />
    </div>
  );
}