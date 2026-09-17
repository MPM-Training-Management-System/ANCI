"use client";

import { useEffect, useState } from "react";
import type {
  ServiceRequest,
  ServiceRequestResolutionType,
  ServiceRequestStatus,
} from "@repo/types";

interface ServiceRequestReviewModalProps {
  open: boolean;
  request: ServiceRequest | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    status: ServiceRequestStatus,
    resolutionType: ServiceRequestResolutionType | null,
    adminRemarks: string,
  ) => Promise<void>;
}

function getStatusStyle(
  status: ServiceRequestStatus,
) {
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

function getResolutionLabel(
  resolution: ServiceRequestResolutionType,
) {
  switch (resolution) {
    case "Training":
      return "Training";

    case "Consultation":
      return "Consultation";

    case "Other":
      return "Other";

    default:
      return resolution;
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

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<
    "Approved" | "Rejected" | null
  >(null);

  const [
    resolutionType,
    setResolutionType,
  ] = useState<
    ServiceRequestResolutionType | null
  >(null);

  useEffect(() => {
    if (!open || !request) {
      return;
    }

    setRemarks("");
    setSelectedStatus(null);

    setResolutionType(
      request.resolutionType ?? null,
    );
  }, [open, request]);

  if (!open || !request) {
    return null;
  }

  const handleSubmit = async () => {
    if (!selectedStatus) {
      return;
    }

    // Approved requests require a resolution.
    if (
      selectedStatus === "Approved" &&
      !resolutionType
    ) {
      return;
    }

    await onSubmit(
      selectedStatus,
      selectedStatus === "Rejected"
        ? null
        : resolutionType,
      remarks.trim(),
    );
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const isApproved =
    selectedStatus === "Approved";

  const isRejected =
    selectedStatus === "Rejected";

  const canConfirm =
    selectedStatus !== null &&
    (
      isRejected ||
      (
        isApproved &&
        resolutionType !== null
      )
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

      {/* Modal */}
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">

        {/* ======================================================
            HEADER
        ======================================================= */}
        <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#17191c]">
              Review Service Request
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Review the request and determine how it should be handled.
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

        {/* ======================================================
            SCROLLABLE CONTENT
        ======================================================= */}
        <div className="min-h-0 flex-1 overflow-y-auto">

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

            {/* Current Status */}
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

            {/* Applicant Remarks */}
            {request.remarks && (
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Applicant Message
                </p>

                <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm text-gray-600">
                    {request.remarks}
                  </p>
                </div>
              </div>
            )}

            {/* ==================================================
                RESOLUTION
            =================================================== */}
            {!isRejected && (
              <div>
                <p className="text-xs font-semibold text-gray-600">
                  Resolution
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Select how this service request will be handled.
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">

                  {/* Training */}
                  <button
                    type="button"
                    onClick={() =>
                      setResolutionType(
                        "Training",
                      )
                    }
                    disabled={isSubmitting}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      resolutionType ===
                      "Training"
                        ? "border-[#17191c] bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-800">
                      Training
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-gray-400">
                      Refer the applicant to training.
                    </p>
                  </button>

                  {/* Consultation */}
                  <button
                    type="button"
                    onClick={() =>
                      setResolutionType(
                        "Consultation",
                      )
                    }
                    disabled={isSubmitting}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      resolutionType ===
                      "Consultation"
                        ? "border-[#17191c] bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-800">
                      Consultation
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-gray-400">
                      Schedule a consultation meeting.
                    </p>
                  </button>

                  {/* Other */}
                  <button
                    type="button"
                    onClick={() =>
                      setResolutionType(
                        "Other",
                      )
                    }
                    disabled={isSubmitting}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      resolutionType ===
                      "Other"
                        ? "border-[#17191c] bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-800">
                      Other
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-gray-400">
                      Handle the request through another process.
                    </p>
                  </button>

                </div>

                {!resolutionType && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    Please select a resolution before approving this request.
                  </p>
                )}
              </div>
            )}

            {/* ==================================================
                ADMIN REMARKS
            =================================================== */}
            <div>
              <label
                htmlFor="service-request-admin-remarks"
                className="text-xs font-semibold text-gray-600"
              >
                Admin Remarks
              </label>

              <textarea
                id="service-request-admin-remarks"
                value={remarks}
                onChange={(event) =>
                  setRemarks(
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Add remarks for this request..."
                disabled={isSubmitting}
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Existing Resolution */}
            {request.resolutionType &&
              !selectedStatus && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-medium text-gray-400">
                    Previous Resolution
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-700">
                    {getResolutionLabel(
                      request.resolutionType,
                    )}
                  </p>
                </div>
              )}

            {/* ==================================================
                CONFIRMATION
            =================================================== */}
            {selectedStatus && (
              <div
                className={
                  isApproved
                    ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                    : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                }
              >
                {isApproved ? (
                  <>
                    This request will be marked as{" "}
                    <strong>Approved</strong>

                    {resolutionType && (
                      <>
                        {" "}
                        and handled as{" "}
                        <strong>
                          {getResolutionLabel(
                            resolutionType,
                          )}
                        </strong>
                        .
                      </>
                    )}
                  </>
                ) : (
                  <>
                    This request will be marked as{" "}
                    <strong>Rejected</strong>.
                  </>
                )}
              </div>
            )}

            {/* Resolution Validation */}
            {isApproved &&
              !resolutionType && (
                <p className="text-xs font-medium text-red-500">
                  Please select a resolution before approving this request.
                </p>
              )}

          </div>
        </div>

        {/* ======================================================
            FOOTER
        ======================================================= */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">

          {/* Cancel */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() =>
              setSelectedStatus(
                "Rejected",
              )
            }
            disabled={
              isSubmitting ||
              request.status ===
                "Rejected"
            }
            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject
          </button>

          {/* Approve */}
          <button
            type="button"
            onClick={() =>
              setSelectedStatus(
                "Approved",
              )
            }
            disabled={
              isSubmitting ||
              request.status ===
                "Approved"
            }
            className="rounded-xl bg-[#17191c] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Approve
          </button>

          {/* Confirm */}
          {selectedStatus && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !canConfirm
              }
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