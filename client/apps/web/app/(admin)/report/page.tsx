
"use client";

import { useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Plus,
  XCircle,
} from "lucide-react";

import type {
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
  Button,
  PageSection,
  DataTable,
} from "@repo/ui/index";

import { columns } from "./columns";

// ============================================================
// REPORT TYPES
// ============================================================

const REPORT_TYPES: TrainerReportType[] = [
  "Attendance",
  "Assessment",
  "TrainingSummary",
  "Enrollment",
  "Certificate",
];

// ============================================================
// HELPERS
// ============================================================

function formatReportType(
  reportType: TrainerReportType,
): string {
  switch (reportType) {
    case "Attendance":
      return "Attendance Report";

    case "Assessment":
      return "Assessment Results Report";

    case "TrainingSummary":
      return "Training Summary";

    case "Enrollment":
      return "Enrollment Report";

    case "Certificate":
      return "Certificate Report";

    default:
      return reportType;
  }
}

// ============================================================
// EMPTY STATE
// ============================================================

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
        Submit a report request and your request history
        will appear here.
      </p>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function TrainerReportsPage() {
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  const {
    dashboard,
    loading: dashboardLoading,
  } = useTrainerDashboard(trainerDashboardApi);

  // ==========================================================
  // REPORT REQUESTS
  // ==========================================================

  const {
    requests,
    loading,
    submitting,
    error,
    createRequest,
  } = useTrainerReportRequests(trainerReportRequestApi);

  // ==========================================================
  // MODAL STATE
  // ==========================================================

  const [isRequestModalOpen, setIsRequestModalOpen] =
    useState(false);

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [reportType, setReportType] =
    useState<TrainerReportType | "">("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");

  const [formError, setFormError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  // ==========================================================
  // ASSIGNED TRAINING
  // ==========================================================

  const assignedTraining = dashboard?.training;

  const trainingBatchId =
    assignedTraining?.trainingBatchId ?? "";

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending",
  ).length;

  const completedRequests = requests.filter(
    (request) => request.status === "Completed",
  ).length;

  const availableReports = requests.filter(
    (request) => Boolean(request.reportFileUrl),
  ).length;

  // ==========================================================
  // MODAL HANDLERS
  // ==========================================================

  const handleOpenRequestModal = () => {
    setFormError(null);
    setSuccessMessage(null);
    setIsRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    if (submitting) return;

    setIsRequestModalOpen(false);
    setFormError(null);
  };

  const handleReset = () => {
    setReportType("");
    setDateFrom("");
    setDateTo("");
    setReason("");
    setFormError(null);
  };

  // ==========================================================
  // SUBMIT REQUEST
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError(null);
    setSuccessMessage(null);

    if (!assignedTraining || !trainingBatchId) {
      setFormError(
        "You currently have no assigned training.",
      );
      return;
    }

    if (!reportType) {
      setFormError("Please select a report type.");
      return;
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      setFormError(
        "Date From cannot be later than Date To.",
      );
      return;
    }

    try {
      await createRequest({
        reportType,
        trainingBatchId,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        reason: reason.trim() || null,
      });

      handleReset();
      setIsRequestModalOpen(false);

      setSuccessMessage(
        "Your report request has been submitted successfully.",
      );
    } catch {
      setFormError(
        "Unable to submit your request. Please try again.",
      );
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (dashboardLoading && !dashboard) {
    return (
      <PageSkeleton
        statCards={4}
        showHeader
        showCharts={false}
      />
    );
  }

  // ==========================================================
  // PAGE UI
  // ==========================================================

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageSection
        title="Reports"
        description="Request reports for your assigned training and track your requests."
        className="mb-5"
        actions={
          <Button
            type="button"
            onClick={handleOpenRequestModal}
            disabled={!trainingBatchId}
            className="h-11 gap-2 rounded-xl bg-[#002b5c] px-5 text-white hover:bg-[#0d2142]"
          >
            <Plus className="h-4 w-4" />
            Request a Report
          </Button>
        }
      />

      {/* ======================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Request Submitted
            </p>

            <p className="mt-1">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss success message"
            className="rounded-lg p-1 hover:bg-emerald-100"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================
          NO ASSIGNED TRAINING
      ====================================================== */}

      {!assignedTraining ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FileText className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No Training Assigned
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            You currently do not have an active training
            assignment. Reports can only be requested
            for your assigned training.
          </p>
        </section>
      ) : (
        <>
          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

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


          
              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#3B7597]" />
                    Loading report requests...
                  </div>
                </div>
              ) : requests.length === 0 ? (
                <EmptyState />
              ) : (
                <DataTable
                  columns={columns}
                  data={requests}
                />
              )}
       
   
        </>
      )}

      {/* ======================================================
          REQUEST REPORT MODAL
      ====================================================== */}

      {isRequestModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseRequestModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-report-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
          >
            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f8fb] text-[#002b5c]">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2
                    id="request-report-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Request a Report
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Submit a report request for your assigned training.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseRequestModal}
                disabled={submitting}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL FORM */}

            <form onSubmit={handleSubmit} className="p-5">

              {(formError || error) && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError || error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">

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
                    required
                    value={reportType}
                    onChange={(event) =>
                      setReportType(
                        event.target.value as TrainerReportType | "",
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#6FD1D7]"
                  >
                    <option value="">
                      Select report type
                    </option>

                    {REPORT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {formatReportType(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ASSIGNED TRAINING */}

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
                    value={assignedTraining?.batchName ?? ""}
                    readOnly
                    className="mt-2 h-11 w-full rounded-xl bg-slate-50 px-3 text-sm font-medium text-slate-600 outline-none ring-1 ring-slate-200"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Automatically selected from your assignment.
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
                      max={dateTo || undefined}
                      onChange={(event) =>
                        setDateFrom(event.target.value)
                      }
                      className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#6FD1D7]"
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
                      min={dateFrom || undefined}
                      onChange={(event) =>
                        setDateTo(event.target.value)
                      }
                      className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#6FD1D7]"
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
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  maxLength={1000}
                  rows={4}
                  placeholder="Tell the administrator why you need this report..."
                  className="mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-[#6FD1D7]"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {reason.length}/1000
                  </span>
                </div>
              </div>

              {/* FORM ACTIONS */}

              <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={submitting}
                  className="h-11 rounded-xl"
                >
                  Reset
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseRequestModal}
                  disabled={submitting}
                  className="h-11 rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || !trainingBatchId}
                  className="h-11 gap-2 rounded-xl bg-primary px-5 text-white hover:bg-secomdary"
                >
                  <Plus className="h-4 w-4" />

                  {submitting
                    ? "Submitting..."
                    : "Submit Request"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
