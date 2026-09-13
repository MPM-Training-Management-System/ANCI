"use client";

import { useEffect, useState } from "react";
import type {
  ServiceRequest,
  ServiceRequestStatus,
} from "@repo/types";

interface ServiceRequestReviewModalProps {
  open: boolean;
  request: ServiceRequest | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    status: ServiceRequestStatus,
    remarks: string,
  ) => Promise<void>;
}

function getStatusStyle(status: ServiceRequestStatus) {
  switch (status) {
    case "Pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "Scheduled":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "InProgress":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Cancelled":
      return "border-gray-200 bg-gray-50 text-gray-600";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
}

export function ServiceRequestReviewModal({
  open,
  request,
  isSubmitting,
  onClose,
  onSubmit,
}: ServiceRequestReviewModalProps) {
  const [remarks, setRemarks] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<"Approved" | "Rejected" | null>(null);

  useEffect(() => {
    if (!open || !request) {
      return;
    }

    setRemarks(request.remarks ?? "");
    setSelectedStatus(null);
  }, [open, request]);

  if (!open || !request) {
    return null;
  }

  const handleSubmit = async () => {
    if (!selectedStatus) {
      return;
    }

    await onSubmit(
      selectedStatus,
      remarks.trim(),
    );
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#17191c]">
              Review Service Request
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Review the request and approve or reject it.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg px-2 py-1 text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 px-6 py-6">

          {/* Service */}
          <div>
            <p className="text-xs font-medium text-gray-400">
              Service
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {request.serviceName ||
                "Unknown Service"}
            </p>
          </div>

          {/* Applicant */}
          <div>
            <p className="text-xs font-medium text-gray-400">
              Applicant
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800">
              {request.applicantName ||
                "Unknown Applicant"}
            </p>

            {request.applicantEmail && (
              <p className="mt-1 text-xs text-gray-400">
                {request.applicantEmail}
              </p>
            )}
          </div>

          {/* Requested */}
          <div>
            <p className="text-xs font-medium text-gray-400">
              Requested
            </p>

            <p className="mt-1 text-sm font-medium text-gray-700">
              {new Date(
                request.requestedAt,
              ).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Current status */}
          <div>
            <p className="text-xs font-medium text-gray-400">
              Current Status
            </p>

            <span
              className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                request.status,
              )}`}
            >
              {request.status}
            </span>
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor="service-request-remarks"
              className="text-xs font-semibold text-gray-600"
            >
              Remarks
            </label>

            <textarea
              id="service-request-remarks"
              value={remarks}
              onChange={event =>
                setRemarks(event.target.value)
              }
              rows={4}
              placeholder="Add remarks for this request..."
              disabled={isSubmitting}
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Confirmation */}
          {selectedStatus && (
            <div
              className={
                selectedStatus === "Approved"
                  ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              }
            >
              This request will be marked as{" "}
              <strong>{selectedStatus}</strong>.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatus("Rejected")
            }
            disabled={
              isSubmitting ||
              request.status === "Rejected"
            }
            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatus("Approved")
            }
            disabled={
              isSubmitting ||
              request.status === "Approved"
            }
            className="rounded-xl bg-[#17191c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Approve
          </button>

          {selectedStatus && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : "Confirm"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}