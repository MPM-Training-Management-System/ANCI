"use client";

import { useEffect, useState } from "react";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceTrainingTable } from "@/components/Services/ServiceTrainingTable";
import { PageSection, StatCard, StatGrid } from "@repo/ui/index";

import {
  Clock3,
  GraduationCap,
  X,
  Eye,
  UserRound,
  Mail,
  FileText,
  ClipboardList,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import type { ServiceRequest } from "@repo/types";

export default function ServiceTrainingPage() {
  const {
    serviceRequests,
    isLoading,
    error,
    getServiceRequests,
    completeServiceRequest,
    isUpdatingRequest,
    
  } = useService(serviceApi);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] =
    useState(false);

  useEffect(() => {
    void getServiceRequests();

    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trainingRequests = serviceRequests.filter(
    (request) => request.resolutionType === "Training",
  );

  const pendingTrainingRequests = trainingRequests.filter(
    (request) => request.status === "Pending",
  ).length;

  const completedTrainingRequests = trainingRequests.filter(
    (request) => request.status === "Completed",
  ).length;

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    if (isUpdatingRequest) return;

    setIsViewModalOpen(false);
    setSelectedRequest(null);
  };

  const canCompleteRequest =
  selectedRequest !== null &&
  !["Completed", "Rejected", "Cancelled"].includes(
    selectedRequest.status ?? "",
  );

  const handleCompleteRequest = async () => {
    if (!selectedRequest || !canCompleteRequest) return;

    const confirmed = window.confirm(
      `Are you sure you want to mark the training request from ${selectedRequest.applicantName || "this applicant"} as completed?`,
    );

    if (!confirmed) return;

    const updatedRequest = await completeServiceRequest(
      selectedRequest.id,
    );

    if (updatedRequest) {
      setSelectedRequest(updatedRequest);
    }
  };

  const getStatusStyle = (status: string | null | undefined) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Scheduled":
        return "bg-blue-100 text-blue-700";
      case "InProgress":
        return "bg-indigo-100 text-indigo-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Cancelled":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <PageSection
        title="Training Requests"
        description="Manage service requests resolved for training."
      />

      <StatGrid>
        <StatCard
          icon={GraduationCap}
          title="Training Requests"
          value={trainingRequests.length}
          variant="primary"
        />

        <StatCard
          title="Pending"
          value={pendingTrainingRequests}
          icon={Clock3}
          variant="warning"
        />

        <StatCard
          title="Completed"
          value={completedTrainingRequests}
          icon={CheckCircle2}
          variant="primary"
        />
      </StatGrid>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <section>
        <div >
          <ServiceTrainingTable
            requests={trainingRequests}
            isLoading={isLoading}
            onView={handleViewRequest}
          />
        </div>
      </section>

      {/* VIEW TRAINING REQUEST MODAL */}
      {isViewModalOpen && selectedRequest && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={handleCloseViewModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-request-title"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#002b5c]">
                  <GraduationCap size={23} />
                </div>

                <div>
                  <h2
                    id="training-request-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Training Request Details
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    View and manage the submitted training request.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseViewModal}
                disabled={isUpdatingRequest}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* REQUEST STATUS */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Resolution Type
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRequest.resolutionType || "Training"}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                    selectedRequest.status,
                  )}`}
                >
                  {selectedRequest.status || "Unknown"}
                </span>
              </div>

              {/* APPLICANT INFORMATION */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <UserRound
                    size={18}
                    className="text-[#002b5c]"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Applicant Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem
                    label="Applicant Name"
                    value={selectedRequest.applicantName}
                  />

                  <DetailItem
                    label="Email Address"
                    value={selectedRequest.applicantEmail}
                    icon={<Mail size={15} />}
                  />
                </div>
              </div>

              {/* REQUEST INFORMATION */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList
                    size={18}
                    className="text-[#002b5c]"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Request Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem
                    label="Resolution Type"
                    value={selectedRequest.resolutionType}
                  />

                  <DetailItem
                    label="Request Status"
                    value={selectedRequest.status}
                  />
                </div>
              </div>

              {/* APPLICANT REMARKS */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FileText
                    size={18}
                    className="text-[#002b5c]"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Applicant Remarks
                  </h3>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                    {selectedRequest.remarks?.trim() ||
                      "No remarks provided."}
                  </p>
                </div>
              </div>

              {/* COMPLETION INFORMATION */}
              {selectedRequest.status === "Completed" && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-green-700"
                  />

                  <div>
                    <p className="font-semibold text-green-800">
                      Request Completed
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      This training service request has been marked as completed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleCloseViewModal}
                disabled={isUpdatingRequest}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye size={16} />
                Close Details
              </button>

              {canCompleteRequest && (
                <button
                  type="button"
                  onClick={() => void handleCompleteRequest()}
                  disabled={isUpdatingRequest}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingRequest ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Complete Request
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-slate-800">
        {value === null || value === undefined || value === ""
          ? "Not provided"
          : String(value)}
      </p>
    </div>
  );
}