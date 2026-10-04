"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Plus,
  XCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  TrainerReportRequest,
  TrainerReportRequestStatus,
  TrainerReportType,
} from "@repo/types";

import {
  useTrainerDashboard,
  useTrainerReportRequests,
} from "@repo/hooks";

import {
  trainerDashboardApi,
  trainerReportRequestApi,
} from "@/lib/api";

import {
  PageSkeleton,
  StatCard,
  StatGrid,
  Button
} from "@repo/ui/index";





/* =========================================================
   REPORT TYPES
========================================================= */

const REPORT_TYPES: TrainerReportType[] = [
  "Attendance",
  "Assessment",
  "TrainingSummary",
  "Certificate",
];

/* =========================================================
   HELPERS
========================================================= */

function formatReportType(
  reportType: TrainerReportType
) {
  switch (reportType) {
    case "Attendance":
      return "Attendance Report";

    case "Assessment":
      return "Assessment Report";

    case "TrainingSummary":
      return "Training Summary";

    case "Certificate":
      return "Certificate Report";

    default:
      return reportType;
  }
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function formatDateTime(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

function formatDateRange(
  dateFrom?: string | null,
  dateTo?: string | null
) {
  if (!dateFrom && !dateTo) {
    return "All dates";
  }

  if (dateFrom && !dateTo) {
    return `${formatDate(dateFrom)} – Present`;
  }

  if (!dateFrom && dateTo) {
    return `Until ${formatDate(dateTo)}`;
  }

  return `${formatDate(dateFrom)} – ${formatDate(
    dateTo
  )}`;
}

/* =========================================================
   STATUS
========================================================= */

function getStatusClass(
  status: TrainerReportRequestStatus
) {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-700";

    case "Approved":
      return "bg-blue-50 text-blue-700";

    case "Rejected":
      return "bg-red-50 text-red-700";

    case "Completed":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-50 text-slate-600";
  }
}

function StatusBadge({
  status,
}: {
  status: TrainerReportRequestStatus;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClass(
        status
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-800">
        No report requests yet
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Submit a report request above and your
        request history will appear here.
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerReportsPage() {
  // =======================================================
  // DASHBOARD / ASSIGNED TRAINING
  // =======================================================

  const {
    dashboard,
    loading: dashboardLoading,
  } = useTrainerDashboard(
    trainerDashboardApi
  );

  // =======================================================
  // REPORT REQUESTS
  // =======================================================

  const {
    requests,
    loading,
    submitting,
    error,
    createRequest,
  } = useTrainerReportRequests(
    trainerReportRequestApi
  );

  // =======================================================
  // FORM
  // =======================================================

  const [
    reportType,
    setReportType,
  ] = useState<
    TrainerReportType | ""
  >("");

  const [
    dateFrom,
    setDateFrom,
  ] = useState("");

  const [
    dateTo,
    setDateTo,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState<string | null>(
    null
  );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null
  );

  // =======================================================
  // ASSIGNED TRAINING
  // =======================================================

  const assignedTraining =
    dashboard?.training;

  const trainingBatchId =
    assignedTraining?.trainingBatchId ??
    assignedTraining?.trainingBatchId ??
    "";

  // =======================================================
  // SUMMARY
  // =======================================================

  const totalRequests =
    requests.length;

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status === "Pending"
    ).length;

  const completedRequests =
    requests.filter(
      (request) =>
        request.status === "Completed"
    ).length;

  const availableReports =
    requests.filter(
      (request) =>
        Boolean(
          request.reportFileUrl
        )
    ).length;

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError(null);
    setSuccessMessage(null);

    if (!assignedTraining) {
      setFormError(
        "You currently have no assigned training."
      );

      return;
    }

    if (!trainingBatchId) {
      setFormError(
        "The assigned training batch could not be determined."
      );

      return;
    }

    if (!reportType) {
      setFormError(
        "Please select a report type."
      );

      return;
    }

    if (
      dateFrom &&
      dateTo &&
      new Date(dateFrom) >
        new Date(dateTo)
    ) {
      setFormError(
        "Date From cannot be later than Date To."
      );

      return;
    }

    try {
      await createRequest({
        reportType,

        // Automatically use the trainer's
        // assigned training batch.
        trainingBatchId,

        dateFrom:
          dateFrom || null,

        dateTo:
          dateTo || null,

        reason:
          reason.trim().length > 0
            ? reason.trim()
            : null,
      });

      setReportType("");
      setDateFrom("");
      setDateTo("");
      setReason("");

      setSuccessMessage(
        "Your report request has been submitted successfully."
      );
    } catch {
      // Error is already handled by the hook.
    }
  };

  // =======================================================
  // RESET
  // =======================================================

  const handleReset = () => {
    setReportType("");
    setDateFrom("");
    setDateTo("");
    setReason("");

    setFormError(null);
    setSuccessMessage(null);
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (
    dashboardLoading &&
    !dashboard
  ) {
    return (
      <PageSkeleton
        statCards={4}
        showHeader
        showCharts={false}
      />
    );
  }

  // =======================================================
  // MAIN
  // =======================================================

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileText className="h-4 w-4" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reports
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Request reports for your assigned
            training and track your requests.
          </p>
        </div>

        {/* =================================================
            NO ASSIGNMENT
        ================================================= */}

        {!assignedTraining ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No Training Assigned
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You currently do not have an active
              training assignment. Reports can only
              be requested for your assigned training.
            </p>
          </div>
        ) : (
          <>
            {/* =============================================
                SUMMARY
            ============================================== */}

            <StatGrid>
              <StatCard
                title="Total Requests"
                value={totalRequests}
                description="Your submitted report requests"
                icon={FileText}
              />

              <StatCard
                title="Pending"
                value={pendingRequests}
                description="Requests waiting for review"
                icon={Clock3}
                variant="warning"
              />

              <StatCard
                title="Completed"
                value={completedRequests}
                description="Completed report requests"
                icon={CheckCircle2}
                variant="success"
              />

              <StatCard
                title="Available Reports"
                value={availableReports}
                description="Reports ready to view"
                icon={Download}
                variant="primary"
              />
            </StatGrid>

            {/* =============================================
                ASSIGNED TRAINING
            ============================================== */}

            <div className="mt-5">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f4f7] text-[#3B7597]">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Assigned Training
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Reports will automatically use this
                        training assignment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#f8fbfc] via-white to-[#eef7f8] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3B7597]">
                        Training Program
                      </p>

                      <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                        {
                          assignedTraining.trainingName
                        }
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Batch:{" "}
                        <span className="font-medium text-slate-700">
                          {
                            assignedTraining.batchName
                          }
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Training Period
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(
                          assignedTraining.startDate
                        )}{" "}
                        –{" "}
                        {formatDate(
                          assignedTraining.endDate
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* =============================================
                REQUEST FORM
            ============================================== */}

            <div className="mt-5">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Plus className="h-4 w-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Request a Report
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Submit a request for your assigned
                        training.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-5"
                >
                  {/* ERROR */}

                  {(formError ||
                    error) && (
                    <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {formError ||
                        error}
                    </div>
                  )}

                  {/* SUCCESS */}

                  {successMessage && (
                    <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {
                        successMessage
                      }
                    </div>
                  )}

                  {/* FORM GRID */}

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* REPORT TYPE */}

                    <div>
                      <label
                        htmlFor="reportType"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Report Type
                      </label>

                      <select
                        id="reportType"
                        value={reportType}
                        onChange={(
                          event
                        ) =>
                          setReportType(
                            event.target
                              .value as TrainerReportType
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#6FD1D7]"
                      >
                        <option value="">
                          Select report type
                        </option>

                        {REPORT_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {formatReportType(
                                type
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* ASSIGNED BATCH - READ ONLY */}

                    <div>
                      <label
                        htmlFor="trainingBatch"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Training Batch
                      </label>

                      <input
                        id="trainingBatch"
                        type="text"
                        value={
                          assignedTraining.batchName
                        }
                        readOnly
                        className="mt-2 h-11 w-full rounded-xl bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none ring-1 ring-slate-200"
                      />

                      <p className="mt-1.5 text-xs text-slate-400">
                        Automatically selected from
                        your trainer assignment.
                      </p>
                    </div>

                    {/* DATE FROM */}

                    <div>
                      <label
                        htmlFor="dateFrom"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Date From
                      </label>

                      <div className="relative mt-2">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="dateFrom"
                          type="date"
                          value={dateFrom}
                          onChange={(
                            event
                          ) =>
                            setDateFrom(
                              event.target
                                .value
                            )
                          }
                          className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#6FD1D7]"
                        />
                      </div>
                    </div>

                    {/* DATE TO */}

                    <div>
                      <label
                        htmlFor="dateTo"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Date To
                      </label>

                      <div className="relative mt-2">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          id="dateTo"
                          type="date"
                          value={dateTo}
                          onChange={(
                            event
                          ) =>
                            setDateTo(
                              event.target
                                .value
                            )
                          }
                          className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#6FD1D7]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* REASON */}

                  <div className="mt-5">
                    <label
                      htmlFor="reason"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Reason{" "}
                      <span className="font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(
                        event
                      ) =>
                        setReason(
                          event.target.value
                        )
                      }
                      maxLength={1000}
                      rows={4}
                      placeholder="Tell the administrator why you need this report..."
                      className="mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#6FD1D7]"
                    />

                    <div className="mt-1 flex justify-end">
                      <span className="text-xs text-slate-400">
                        {reason.length}/1000
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={
                        handleReset
                      }
                      disabled={
                        submitting
                      }
                      className="h-11 rounded-xl"
                    >
                      Reset
                    </Button>

                    <Button
                      type="submit"
                      disabled={
                        submitting ||
                        !trainingBatchId
                      }
                      className="h-11 rounded-xl bg-[#002b5c] px-5 text-white hover:bg-[#0d2142]"
                    >
                      <Plus className="mr-2 h-4 w-4" />

                      {submitting
                        ? "Submitting..."
                        : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </section>
            </div>

            {/* =============================================
                REQUEST HISTORY
            ============================================== */}

            <div className="mt-5">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        My Report Requests
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Track the status of your submitted
                        report requests.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {loading ? (
                    <div className="flex min-h-[220px] items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#3B7597]" />

                        Loading report requests...
                      </div>
                    </div>
                  ) : requests.length ===
                    0 ? (
                    <EmptyState />
                  ) : (
                    <div className="space-y-3">
                      {requests.map(
                        (
                          request: TrainerReportRequest
                        ) => (
                          <div
                            key={
                              request.id
                            }
                            className="rounded-2xl bg-slate-50 p-5 transition hover:bg-slate-100/70"
                          >
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                              {/* REQUEST INFO */}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-semibold text-slate-900">
                                    {formatReportType(
                                      request.reportType
                                    )}
                                  </h3>

                                  <StatusBadge
                                    status={
                                      request.status
                                    }
                                  />
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  {/* BATCH */}

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      Training Batch
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                      {
                                        request.batchCode
                                      }
                                    </p>
                                  </div>

                                  {/* PROGRAM */}

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      Training Program
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                      {
                                        request.trainingProgramName
                                      }
                                    </p>
                                  </div>

                                  {/* DATE */}

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      Date Range
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                      {formatDateRange(
                                        request.dateFrom,
                                        request.dateTo
                                      )}
                                    </p>
                                  </div>

                                  {/* REQUESTED */}

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      Requested
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                      {formatDateTime(
                                        request.requestedAt
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* REASON */}

                                {request.reason && (
                                  <div className="mt-4 rounded-xl bg-white px-4 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                      Reason
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                      {
                                        request.reason
                                      }
                                    </p>
                                  </div>
                                )}

                                {/* ADMIN REMARKS */}

                                {request.adminRemarks && (
                                  <div className="mt-3 rounded-xl bg-white px-4 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                      Admin Remarks
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                      {
                                        request.adminRemarks
                                      }
                                    </p>

                                    {request.reviewedAt && (
                                      <p className="mt-1.5 text-xs text-slate-400">
                                        Reviewed{" "}
                                        {formatDateTime(
                                          request.reviewedAt
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* REPORT ACTION */}

                              <div className="shrink-0">
                                {request.reportFileUrl ? (
                                  <a
                                    href={
                                      request.reportFileUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#002b5c] px-4 text-sm font-semibold text-white transition hover:bg-[#0d2142]"
                                  >
                                    <Download className="mr-2 h-4 w-4" />

                                    View Report
                                  </a>
                                ) : request.status ===
                                  "Rejected" ? (
                                  <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                                    <XCircle className="h-4 w-4" />

                                    Rejected
                                  </div>
                                ) : request.status ===
                                  "Completed" ? (
                                  <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600">
                                    <CheckCircle2 className="h-4 w-4" />

                                    Completed
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">
                                    <Clock3 className="h-4 w-4" />

                                    Awaiting Report
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}