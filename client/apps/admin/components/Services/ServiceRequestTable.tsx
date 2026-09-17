"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  ServiceRequest,
  ServiceRequestResolutionType,
  ServiceRequestStatus,
} from "@repo/types";

interface ServiceRequestTableProps {
  requests: ServiceRequest[];
  isLoading: boolean;
  onReview: (
    request: ServiceRequest,
  ) => void;
}

// ============================================================
// STATUS STYLE
// ============================================================

function getStatusStyle(
  status: ServiceRequestStatus,
) {
  switch (status) {
    case "Pending":
      return {
        label: "Pending",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "Approved":
      return {
        label: "Approved",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "Rejected":
      return {
        label: "Rejected",
        className:
          "border-red-200 bg-red-50 text-red-700",
      };

    case "Scheduled":
      return {
        label: "Scheduled",
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "InProgress":
      return {
        label: "In Progress",
        className:
          "border-indigo-200 bg-indigo-50 text-indigo-700",
      };

    case "Completed":
      return {
        label: "Completed",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "Cancelled":
      return {
        label: "Cancelled",
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
      };

    default:
      return {
        label: status,
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
      };
  }
}

// ============================================================
// RESOLUTION LABEL
// ============================================================

function getResolutionLabel(
  resolution:
    | ServiceRequestResolutionType
    | null
    | undefined,
) {
  if (!resolution) {
    return "—";
  }

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

// ============================================================
// ACTION LABEL
// ============================================================

function getActionLabel(
  request: ServiceRequest,
) {
  /*
   * ----------------------------------------------------------
   * PENDING
   * ----------------------------------------------------------
   *
   * Admin still needs to review the request.
   */
  if (
    request.status ===
    "Pending"
  ) {
    return "Review";
  }

  /*
   * ----------------------------------------------------------
   * CONSULTATION
   * ----------------------------------------------------------
   *
   * Once the request has already been resolved as a
   * consultation, the admin should manage the consultation
   * workflow.
   *
   * This includes:
   *
   * Approved
   * Scheduled
   * In Progress
   * Completed
   * Cancelled
   */
  if (
    request.resolutionType ===
    "Consultation"
  ) {
    return "Manage";
  }

  /*
   * ----------------------------------------------------------
   * TRAINING
   * ----------------------------------------------------------
   *
   * Training requests can still be managed from the request
   * table. The page will route the request to the training
   * workflow.
   */
  if (
    request.resolutionType ===
    "Training"
  ) {
    return "Manage";
  }

  /*
   * ----------------------------------------------------------
   * OTHER / GENERAL REQUEST
   * ----------------------------------------------------------
   */

  if (
    request.status ===
    "Rejected"
  ) {
    return "View";
  }

  if (
    request.status ===
    "Completed"
  ) {
    return "View";
  }

  return "Manage";
}

// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

// ============================================================
// TIME FORMAT
// ============================================================

function formatTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

// ============================================================
// COMPONENT
// ============================================================

export function ServiceRequestTable({
  requests,
  isLoading,
  onReview,
}: ServiceRequestTableProps) {
  // ============================================================
  // SEARCH
  // ============================================================

  const [search, setSearch] =
    useState("");

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const [statusFilter, setStatusFilter] =
    useState<
      ServiceRequestStatus | "All"
    >("All");

  // ============================================================
  // FILTERED REQUESTS
  // ============================================================

  const filteredRequests =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return requests.filter(
        (request) => {
          const matchesSearch =
            !query ||
            [
              request.serviceName,
              request.applicantName,
              request.applicantEmail,
              request.remarks,
              request.resolutionType,
              request.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter ===
              "All" ||
            request.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      requests,
      search,
      statusFilter,
    ]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#17191c]">
            Service Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage client service requests.
          </p>
        </div>

        <div className="text-xs text-gray-400">
          <span className="font-semibold text-gray-700">
            {requests.length}
          </span>{" "}
          {requests.length ===
          1
            ? "request"
            : "requests"}
        </div>

      </div>

      {/* ======================================================
          TOOLBAR
      ======================================================= */}

      <div className="mt-5 flex flex-col gap-3 border-y border-gray-100 py-4 sm:flex-row sm:items-center sm:justify-between">

        {/* SEARCH */}

        <div className="relative w-full sm:max-w-sm">

          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path
              d="m20 20-3.5-3.5"
            />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search requests..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
          />

        </div>

        {/* STATUS FILTER */}

        <select
          value={
            statusFilter
          }
          onChange={(
            event,
          ) =>
            setStatusFilter(
              event.target
                .value as
                | ServiceRequestStatus
                | "All",
            )
          }
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300"
        >
          <option value="All">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Scheduled">
            Scheduled
          </option>

          <option value="InProgress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Rejected">
            Rejected
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <div className="mt-1 overflow-x-auto rounded-xl border border-gray-100">

        <table className="w-full min-w-[900px] border-collapse">

          {/* ==================================================
              TABLE HEADER
          =================================================== */}

          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Service
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Applicant
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Requested
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Status
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Resolution
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Action
              </th>

            </tr>
          </thead>

          {/* ==================================================
              TABLE BODY
          =================================================== */}

          <tbody className="divide-y divide-gray-100 bg-white">

            {/* ==================================================
                LOADING
            =================================================== */}

            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center"
                >
                  <p className="text-sm text-gray-400">
                    Loading service requests...
                  </p>
                </td>
              </tr>
            ) : filteredRequests.length ===
              0 ? (

              /* ==================================================
                  EMPTY
              =================================================== */

              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center"
                >

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm text-gray-400">
                      —
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-gray-600">
                    No service requests
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {search ||
                    statusFilter !==
                      "All"
                      ? "Try changing your search or filter."
                      : "Submitted service requests will appear here."}
                  </p>

                </td>
              </tr>

            ) : (

              /* ==================================================
                  REQUESTS
              =================================================== */

              filteredRequests.map(
                (request) => {
                  const status =
                    getStatusStyle(
                      request.status,
                    );

                  const actionLabel =
                    getActionLabel(
                      request,
                    );

                  return (
                    <tr
                      key={
                        request.id
                      }
                      className="group transition hover:bg-gray-50/70"
                    >

                      {/* ==================================================
                          SERVICE
                      =================================================== */}

                      <td className="px-4 py-4">

                        <div className="max-w-[220px]">

                          <p className="truncate text-xs font-semibold text-gray-800">
                            {request.serviceName ||
                              "Unknown Service"}
                          </p>

                          {request.remarks && (
                            <p className="mt-1 truncate text-[11px] text-gray-400">
                              {
                                request.remarks
                              }
                            </p>
                          )}

                        </div>

                      </td>

                      {/* ==================================================
                          APPLICANT
                      =================================================== */}

                      <td className="px-4 py-4">

                        <div className="max-w-[200px]">

                          <p className="truncate text-xs font-semibold text-gray-700">
                            {request.applicantName ||
                              "Unknown Applicant"}
                          </p>

                          {request.applicantEmail && (
                            <p className="mt-1 truncate text-[11px] text-gray-400">
                              {
                                request.applicantEmail
                              }
                            </p>
                          )}

                        </div>

                      </td>

                      {/* ==================================================
                          REQUESTED
                      =================================================== */}

                      <td className="px-4 py-4">

                        <p className="whitespace-nowrap text-xs font-medium text-gray-600">
                          {formatDate(
                            request.requestedAt,
                          )}
                        </p>

                        <p className="mt-1 whitespace-nowrap text-[11px] text-gray-400">
                          {formatTime(
                            request.requestedAt,
                          )}
                        </p>

                      </td>

                      {/* ==================================================
                          STATUS
                      =================================================== */}

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                        >
                          {
                            status.label
                          }
                        </span>

                      </td>

                      {/* ==================================================
                          RESOLUTION
                      =================================================== */}

                      <td className="px-4 py-4">

                        {request.resolutionType ? (
                          <span className="text-xs font-medium text-gray-600">
                            {getResolutionLabel(
                              request.resolutionType,
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">
                            —
                          </span>
                        )}

                      </td>

                      {/* ==================================================
                          ACTION
                      =================================================== */}

                      <td className="px-4 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            onReview(
                              request,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-[#17191c]"
                        >

                          {actionLabel}

                          <span className="text-gray-400">
                            →
                          </span>

                        </button>

                      </td>

                    </tr>
                  );
                },
              )
            )}

          </tbody>

        </table>

      </div>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      {!isLoading &&
        filteredRequests.length >
          0 && (
          <div className="flex items-center justify-between pt-3 text-[11px] text-gray-400">

            <span>
              Showing{" "}
              <strong className="font-semibold text-gray-600">
                {
                  filteredRequests.length
                }
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-gray-600">
                {
                  requests.length
                }
              </strong>{" "}
              requests
            </span>

          </div>
        )}

    </section>
  );
}