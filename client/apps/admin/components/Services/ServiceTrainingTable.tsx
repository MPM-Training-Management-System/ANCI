"use client";

import { useMemo, useState } from "react";

import {
  BookOpen,
  ChevronRight,
  Search,
  UserRound,
} from "lucide-react";

import type {
  ServiceRequest,
  ServiceRequestStatus,
} from "@repo/types";

interface ServiceTrainingTableProps {
  requests: ServiceRequest[];
  isLoading: boolean;

  onView: (
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

// ============================================================
// STATUS LABEL
// ============================================================

function getStatusLabel(
  status: ServiceRequestStatus,
) {
  switch (status) {
    case "Pending":
      return "Pending";

    case "Approved":
      return "Approved";

    case "Rejected":
      return "Rejected";

    case "Scheduled":
      return "Scheduled";

    case "InProgress":
      return "In Progress";

    case "Completed":
      return "Completed";

    case "Cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(
  value: string,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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
// COMPONENT
// ============================================================

export function ServiceTrainingTable({
  requests,
  isLoading,
  onView,
}: ServiceTrainingTableProps) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | ServiceRequestStatus
    >("All");

  // ============================================================
  // FILTER TRAINING REQUESTS
  // ============================================================

  const trainingRequests =
    useMemo(() => {
      return requests.filter(
        (request) =>
          request.resolutionType ===
          "Training",
      );
    }, [requests]);

  // ============================================================
  // FILTERED DATA
  // ============================================================

  const filteredRequests =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return trainingRequests.filter(
        (request) => {
          const matchesStatus =
            statusFilter === "All" ||
            request.status ===
              statusFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const searchValue = [
            request.serviceName,
            request.applicantName,
            request.applicantEmail,
            request.remarks,
            request.adminRemarks,
            request.status,
            request.resolutionType,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchValue.includes(
            normalizedSearch,
          );
        },
      );
    }, [
      trainingRequests,
      search,
      statusFilter,
    ]);

  // ============================================================
  // COUNTS
  // ============================================================

  const pendingCount =
    trainingRequests.filter(
      (request) =>
        request.status ===
        "Pending",
    ).length;

  const approvedCount =
    trainingRequests.filter(
      (request) =>
        request.status ===
        "Approved",
    ).length;

  const activeCount =
    trainingRequests.filter(
      (request) =>
        request.status ===
          "Scheduled" ||
        request.status ===
          "InProgress",
    ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="border-b border-[#e7e9ec] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#17191c]">
                  Training Requests
                </h2>

                <p className="text-xs text-gray-400">
                  Requests approved for the
                  training pathway.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              SUMMARY
          =================================================== */}

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
                Pending
              </p>

              <p className="mt-0.5 text-sm font-bold text-amber-700">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                Approved
              </p>

              <p className="mt-0.5 text-sm font-bold text-emerald-700">
                {approvedCount}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                Active
              </p>

              <p className="mt-0.5 text-sm font-bold text-blue-700">
                {activeCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          TOOLBAR
      ======================================================= */}

      <div className="border-b border-[#e7e9ec] bg-[#fafafa] px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* SEARCH */}

          <div className="relative w-full md:max-w-md">
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search applicant, email, or service..."
              className="
                h-10
                w-full
                rounded-xl
                border
                border-[#e7e9ec]
                bg-white
                pl-9
                pr-3
                text-xs
                text-gray-700
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-gray-300
                focus:ring-2
                focus:ring-gray-100
              "
            />
          </div>

          {/* STATUS FILTER */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  | "All"
                  | ServiceRequestStatus,
              )
            }
            className="
              h-10
              w-full
              rounded-xl
              border
              border-[#e7e9ec]
              bg-white
              px-3
              text-xs
              font-medium
              text-gray-600
              outline-none
              focus:border-gray-300
              md:w-44
            "
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

            <option value="Cancelled">
              Cancelled
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-[#e7e9ec] bg-[#fafafa]">
              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Service
              </th>

              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Applicant
              </th>

              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Requested
              </th>

              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Resolution
              </th>

              <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Status
              </th>

              <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {/* ==================================================
                LOADING
            =================================================== */}

            {isLoading &&
              Array.from({
                length: 4,
              }).map((_, index) => (
                <tr
                  key={`loading-${index}`}
                  className="border-b border-[#f0f1f3]"
                >
                  <td className="px-5 py-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />

                      <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  </td>

                  <td className="px-5 py-4">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                  </td>

                  <td className="px-5 py-4">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                  </td>

                  <td className="px-5 py-4">
                    <div className="ml-auto h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
                  </td>
                </tr>
              ))}

            {/* ==================================================
                DATA
            =================================================== */}

            {!isLoading &&
              filteredRequests.map(
                (request) => (
                  <tr
                    key={request.id}
                    className="
                      border-b
                      border-[#f0f1f3]
                      transition
                      hover:bg-[#fafafa]
                    "
                  >
                    {/* SERVICE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-xs font-bold text-[#17191c]">
                            {request.serviceName ||
                              "Unknown Service"}
                          </p>

                          <p className="mt-0.5 text-[10px] text-gray-400">
                            Training pathway
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* APPLICANT */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <UserRound className="h-4 w-4 text-gray-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-xs font-semibold text-gray-700">
                            {request.applicantName ||
                              "Unknown Applicant"}
                          </p>

                          <p className="mt-0.5 max-w-[220px] truncate text-[10px] text-gray-400">
                            {request.applicantEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* REQUESTED */}

                    <td className="px-5 py-4">
                      <p className="text-xs font-medium text-gray-600">
                        {formatDate(
                          request.requestedAt,
                        )}
                      </p>
                    </td>

                    {/* RESOLUTION */}

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        Training
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`
                          inline-flex
                          items-center
                          rounded-full
                          border
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          ${getStatusStyle(
                            request.status,
                          )}
                        `}
                      >
                        {getStatusLabel(
                          request.status,
                        )}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onView(request)
                        }
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-[#e7e9ec]
                          bg-white
                          px-3
                          py-2
                          text-[10px]
                          font-semibold
                          text-gray-600
                          transition
                          hover:bg-gray-50
                          hover:text-[#17191c]
                        "
                      >
                        View

                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ),
              )}

            {/* ==================================================
                EMPTY STATE
            =================================================== */}

            {!isLoading &&
              filteredRequests.length ===
                0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-gray-700">
                        {trainingRequests.length ===
                        0
                          ? "No training requests"
                          : "No matching requests"}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        {trainingRequests.length ===
                        0
                          ? "Requests resolved as Training will appear here."
                          : "Try changing your search or status filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      {!isLoading &&
        trainingRequests.length >
          0 && (
          <div className="flex items-center justify-between border-t border-[#e7e9ec] bg-[#fafafa] px-5 py-3">
            <p className="text-[10px] text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filteredRequests.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-600">
                {trainingRequests.length}
              </span>{" "}
              training requests
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="text-[10px] font-semibold text-gray-500 transition hover:text-gray-800"
              >
                Clear search
              </button>
            )}
          </div>
        )}
    </div>
  );
}