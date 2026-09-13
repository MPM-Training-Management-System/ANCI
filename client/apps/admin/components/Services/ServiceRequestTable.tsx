"use client";

import type { ServiceRequest } from "@repo/types";

interface ServiceRequestTableProps {
  requests: ServiceRequest[];
  isLoading: boolean;
  onReview: (request: ServiceRequest) => void;
}

function getStatusStyle(status: ServiceRequest["status"]) {
  switch (status) {
    case "Pending":
      return {
        dot: "bg-amber-500",
        text: "text-amber-700",
        label: "Pending",
      };

    case "Approved":
      return {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        label: "Approved",
      };

    case "Rejected":
      return {
        dot: "bg-red-500",
        text: "text-red-700",
        label: "Rejected",
      };

    case "Scheduled":
      return {
        dot: "bg-blue-500",
        text: "text-blue-700",
        label: "Scheduled",
      };

    case "InProgress":
      return {
        dot: "bg-indigo-500",
        text: "text-indigo-700",
        label: "In Progress",
      };

    case "Completed":
      return {
        dot: "bg-emerald-500",
        text: "text-emerald-700",
        label: "Completed",
      };

    case "Cancelled":
      return {
        dot: "bg-gray-400",
        text: "text-gray-500",
        label: "Cancelled",
      };

    default:
      return {
        dot: "bg-gray-400",
        text: "text-gray-500",
        label: status,
      };
  }
}

export function ServiceRequestTable({
  requests,
  isLoading,
  onReview,
}: ServiceRequestTableProps) {
  const pendingCount = requests.filter(
    request => request.status === "Pending",
  ).length;

  if (isLoading) {
    return (
      <section className="pt-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#17191c]">
            Service Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review client requests and manage their status.
          </p>
        </div>

        <div className="mt-5 border-t border-gray-100 py-10 text-center">
          <p className="text-sm text-gray-400">
            Loading requests...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#17191c]">
            Service Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review client requests and manage their status.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="h-2 w-2 rounded-full bg-amber-500" />

            {pendingCount} pending{" "}
            {pendingCount === 1 ? "request" : "requests"}
          </div>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="mt-5 border-y border-gray-100 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <span className="text-sm text-gray-400">
              ✓
            </span>
          </div>

          <p className="mt-3 text-sm font-semibold text-gray-600">
            No service requests
          </p>

          <p className="mt-1 text-xs text-gray-400">
            New client requests will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-gray-100 border-y border-gray-100">
          {requests.map(request => {
            const status = getStatusStyle(request.status);

            const isPending =
              request.status === "Pending";

            return (
              <button
                key={request.id}
                type="button"
                onClick={() => onReview(request)}
                className="group w-full px-2 py-5 text-left transition hover:bg-gray-50 sm:px-3"
              >
                <div className="flex items-center gap-4">
                  {/* Status */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${status.dot}`}
                    />
                  </div>

                  {/* Request information */}
                  <div className="min-w-0 flex-1">
                    {/* Service */}
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {request.serviceName ||
                          "Unknown Service"}
                      </p>

                      <span
                        className={`text-[11px] font-semibold ${status.text}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Applicant */}
                    <div className="mt-1">
                      <p className="text-xs font-medium text-gray-600">
                        {request.applicantName ||
                          "Unknown Applicant"}
                      </p>

                      {request.applicantEmail && (
                        <p className="text-xs text-gray-400">
                          {request.applicantEmail}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                      <span>
                        Requested{" "}
                        {new Date(
                          request.requestedAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <span>•</span>

                      <span className="font-mono">
                        #{request.id.slice(0, 8)}
                      </span>
                    </div>

                    {/* Remarks */}
                    {request.remarks && (
                      <p className="mt-2 max-w-2xl truncate text-xs text-gray-400">
                        {request.remarks}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    <span
                      className={`text-xs font-semibold transition ${
                        isPending
                          ? "text-[#17191c]"
                          : "text-gray-400"
                      } group-hover:text-[#17191c]`}
                    >
                      {isPending ? "Review" : "View"}
                    </span>

                    <span className="ml-1 text-gray-300 transition group-hover:text-gray-500">
                      →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}