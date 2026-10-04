"use client";

import {
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  AdminTrainerReportRequest,
  TrainerReportRequestStatus,
  TrainerReportType,
} from "@repo/types";

import {
  useAdminTrainerReportRequests,
} from "@repo/hooks";

import {
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  trainerReportRequestApi,
} from "@/lib/api";


// =========================================================
// HELPERS
// =========================================================

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}


function formatDateRange(
  dateFrom?: string | null,
  dateTo?: string | null
) {
  if (!dateFrom && !dateTo) {
    return "All available dates";
  }

  if (
    dateFrom &&
    dateTo
  ) {
    return `${formatDate(
      dateFrom
    )} – ${formatDate(
      dateTo
    )}`;
  }

  if (dateFrom) {
    return `From ${formatDate(
      dateFrom
    )}`;
  }

  return `Until ${formatDate(
    dateTo
  )}`;
}


function reportTypeLabel(
  type: TrainerReportType
) {
  switch (type) {
    case "TrainingSummary":
      return "Training Summary";

    default:
      return type;
  }
}


function statusClasses(
  status: TrainerReportRequestStatus
) {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-700";

    case "Approved":
      return "bg-blue-50 text-blue-700";

    case "Completed":
      return "bg-emerald-50 text-emerald-700";

    case "Rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}


// =========================================================
// PAGE
// =========================================================

export default function AdminReportRequestsPage() {
  const {
    requests,
    loading,
    processingId,
    error,
    loadRequests,
    approveRequest,
    rejectRequest,
  } =
    useAdminTrainerReportRequests(
      trainerReportRequestApi
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "All" | TrainerReportRequestStatus
  >("All");

  const [
    selectedRequest,
    setSelectedRequest,
  ] =
    useState<AdminTrainerReportRequest | null>(
      null
    );

  const [
    reviewMode,
    setReviewMode,
  ] = useState<
    "approve" | "reject" | null
  >(null);

  const [
    remarks,
    setRemarks,
  ] = useState("");

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    return {
      total:
        requests.length,

      pending:
        requests.filter(
          request =>
            request.status === "Pending"
        ).length,

      approved:
        requests.filter(
          request =>
            request.status === "Approved"
        ).length,

      completed:
        requests.filter(
          request =>
            request.status === "Completed"
        ).length,

      rejected:
        requests.filter(
          request =>
            request.status === "Rejected"
        ).length,
    };
  }, [requests]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredRequests =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return requests.filter(
        request => {
          const matchesStatus =
            statusFilter === "All" ||
            request.status ===
              statusFilter;

          const matchesSearch =
            !keyword ||
            request.trainerName
              .toLowerCase()
              .includes(keyword) ||
            request.trainerCode
              .toLowerCase()
              .includes(keyword) ||
            request.batchCode
              .toLowerCase()
              .includes(keyword) ||
            request.trainingProgramName
              .toLowerCase()
              .includes(keyword) ||
            request.reportType
              .toLowerCase()
              .includes(keyword);

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      requests,
      search,
      statusFilter,
    ]);

  // =========================================================
  // OPEN REVIEW
  // =========================================================

  function openReview(
    request: AdminTrainerReportRequest,
    mode: "approve" | "reject"
  ) {
    setSelectedRequest(
      request
    );

    setReviewMode(
      mode
    );

    setRemarks(
      request.adminRemarks ??
        ""
    );
  }

  // =========================================================
  // CLOSE REVIEW
  // =========================================================

  function closeReview() {
    setSelectedRequest(
      null
    );

    setReviewMode(
      null
    );

    setRemarks("");
  }

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  async function handleReview() {
    if (
      !selectedRequest ||
      !reviewMode
    ) {
      return;
    }

    try {
      const payload = {
        adminRemarks:
          remarks.trim()
            ? remarks.trim()
            : null,
      };

      if (
        reviewMode ===
        "approve"
      ) {
        await approveRequest(
          selectedRequest.id,
          payload
        );
      } else {
        await rejectRequest(
          selectedRequest.id,
          payload
        );
      }

      closeReview();
    } catch {
      // Error is already handled by the hook.
    }
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageSection
        title="Trainer Report Requests"
        description="Review and manage report requests submitted by trainers."
        actions={
          <button
            type="button"
            onClick={() =>
              void loadRequests()
            }
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#002b5c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2142] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        }
      />

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <StatGrid>
        <StatCard
          title="Total Requests"
          value={stats.total}
          icon={
            FileText 
          }
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          variant="warning"
          icon={
            Clock3 
          }
        />

        <StatCard
          title="Approved"
          value={stats.approved}
          variant="primary"
          icon={
            CheckCircle2 
          }
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          variant="success"
          icon={
            CheckCircle2 
          }
        />
      </StatGrid>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <PageSection
        title="Requests"
        description={`${filteredRequests.length} request${
          filteredRequests.length === 1
            ? ""
            : "s"
        } found`}
      >

        {/* ===================================================
            FILTERS
        =================================================== */}

        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={event =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search trainer, batch, program..."
              className="w-full rounded-xl bg-[#f7f9fb] py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-[#6FD1D7]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={event =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | TrainerReportRequestStatus
              )
            }
            className="rounded-xl bg-[#f7f9fb] px-4 py-2.5 text-sm font-medium text-gray-700 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-[#6FD1D7]"
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

            <option value="Rejected">
              Rejected
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />

              Loading report requests...
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          /* =================================================
             EMPTY
             ================================================= */

          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f9fb] text-gray-400">
              <FileText className="h-5 w-5" />
            </div>

            <h3 className="text-sm font-semibold text-gray-900">
              No report requests found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Trainer report requests will appear here once submitted.
            </p>
          </div>
        ) : (
          /* =================================================
             TABLE
             ================================================= */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trainer
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Report
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Training
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date Range
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Requested
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map(
                  request => {
                    const isProcessing =
                      processingId ===
                      request.id;

                    return (
                      <tr
                        key={request.id}
                        className="border-b border-gray-50 last:border-0"
                      >

                        {/* TRAINER */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef4f8] text-[#002b5c]">
                              <UserRound className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {
                                  request.trainerName
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                {
                                  request.trainerCode
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* REPORT */}

                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {reportTypeLabel(
                                request.reportType
                              )}
                            </p>

                            {request.reason && (
                              <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                                {
                                  request.reason
                                }
                              </p>
                            )}
                          </div>
                        </td>

                        {/* TRAINING */}

                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-800">
                            {
                              request.batchCode
                            }
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                            {
                              request.trainingProgramName
                            }
                          </p>
                        </td>

                        {/* DATE RANGE */}

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-700">
                            {formatDateRange(
                              request.dateFrom,
                              request.dateTo
                            )}
                          </span>
                        </td>

                        {/* REQUESTED */}

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-700">
                            {formatDate(
                              request.requestedAt
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                              request.status
                            )}`}
                          >
                            {
                              request.status
                            }
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">

                            {request.status ===
                              "Pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openReview(
                                      request,
                                      "approve"
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#002b5c] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0d2142] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  )}

                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openReview(
                                      request,
                                      "reject"
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <XCircle className="h-3.5 w-3.5" />

                                  Reject
                                </button>
                              </>
                            )}

                            {request.status !==
                              "Pending" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedRequest(
                                    request
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-[#eef4f8] hover:text-[#002b5c]"
                              >
                                <FileText className="h-3.5 w-3.5" />

                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageSection>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {selectedRequest &&
        reviewMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

              {/* HEADER */}

              <div className="flex items-start justify-between px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {reviewMode ===
                    "approve"
                      ? "Approve Report Request"
                      : "Reject Report Request"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review the request before submitting your decision.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeReview
                  }
                  className="text-gray-400 transition hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* DETAILS */}

              <div className="mx-6 rounded-xl bg-[#f7f9fb] p-4">
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Trainer
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {
                        selectedRequest.trainerName
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Report
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {reportTypeLabel(
                        selectedRequest.reportType
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Batch
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {
                        selectedRequest.batchCode
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Date Range
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDateRange(
                        selectedRequest.dateFrom,
                        selectedRequest.dateTo
                      )}
                    </p>
                  </div>
                </div>

                {selectedRequest.reason && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      Trainer Reason
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-700">
                      {
                        selectedRequest.reason
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* REMARKS */}

              <div className="px-6 py-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <MessageSquareText className="h-4 w-4" />

                  Admin Remarks
                </label>

                <textarea
                  value={remarks}
                  onChange={event =>
                    setRemarks(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder={
                    reviewMode ===
                    "approve"
                      ? "Add instructions or remarks for the trainer..."
                      : "Explain why the request is being rejected..."
                  }
                  className="w-full resize-none rounded-xl bg-[#f7f9fb] px-4 py-3 text-sm text-gray-900 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-[#6FD1D7]"
                />
              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 px-6 pb-6">
                <button
                  type="button"
                  onClick={
                    closeReview
                  }
                  disabled={
                    processingId ===
                    selectedRequest.id
                  }
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleReview()
                  }
                  disabled={
                    processingId ===
                    selectedRequest.id
                  }
                  className={
                    reviewMode ===
                    "approve"
                      ? "inline-flex items-center gap-2 rounded-xl bg-[#002b5c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2142] disabled:cursor-not-allowed disabled:opacity-50"
                      : "inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  }
                >
                  {processingId ===
                  selectedRequest.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : reviewMode ===
                    "approve" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}

                  {reviewMode ===
                  "approve"
                    ? "Approve Request"
                    : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {selectedRequest &&
        !reviewMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

              <div className="flex items-start justify-between px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Report Request Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Request information and review details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRequest(
                      null
                    )
                  }
                  className="text-gray-400 transition hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 px-6 pb-6">

                <div className="rounded-xl bg-[#f7f9fb] p-4">
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs text-gray-500">
                        Trainer
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {
                          selectedRequest.trainerName
                        }
                      </p>

                      <p className="text-xs text-gray-500">
                        {
                          selectedRequest.trainerCode
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Status
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                          selectedRequest.status
                        )}`}
                      >
                        {
                          selectedRequest.status
                        }
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Report
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {reportTypeLabel(
                          selectedRequest.reportType
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Batch
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {
                          selectedRequest.batchCode
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Training Program
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    {
                      selectedRequest.trainingProgramName
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Requested
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    {formatDate(
                      selectedRequest.requestedAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Date Range
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    {formatDateRange(
                      selectedRequest.dateFrom,
                      selectedRequest.dateTo
                    )}
                  </p>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Trainer Reason
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-800">
                      {
                        selectedRequest.reason
                      }
                    </p>
                  </div>
                )}

                {selectedRequest.adminRemarks && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Admin Remarks
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-800">
                      {
                        selectedRequest.adminRemarks
                      }
                    </p>
                  </div>
                )}

                {selectedRequest.reportFileUrl && (
                  <a
                    href={
                      selectedRequest.reportFileUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#002b5c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2142]"
                  >
                    <FileText className="h-4 w-4" />

                    View Report
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}