"use client";

import dynamic from "next/dynamic";

import {
  useMemo,
  useState,
} from "react";

import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  Search,
  Download,
  Loader2,
  ClipboardList,
  CalendarDays,
  UserRound,
} from "lucide-react";

import {
  useAdminReports,
  useAdminTrainerReportRequests,
} from "@repo/hooks";

import type {
  AdminTrainerReportRequest,
  TrainerReportRequestStatus,
  ReportFilter,
  ReportType,
  AttendanceReport,
  AssessmentResultsReport,
  TrainingCompletionReport,
  CertificateReport,
} from "@repo/types";

import {
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  reportApi,
  adminTrainerReportRequestApi,
} from "@/lib/api";

/*
 * ============================================================
 * PDF EXPORTER
 * ============================================================
 *
 * IMPORTANT:
 *
 * This component is dynamically loaded with SSR disabled.
 *
 * It is the ONLY component that loads jsPDF.
 *
 * DO NOT import jsPDF in this file.
 */

const ReportPdfExporter = dynamic(
  () =>
    import(
      "@/components/reports/ReportPdfExporter"
    ),
  {
    ssr: false,
  }
);

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type ReviewMode =
  | "approve"
  | "reject"
  | null;

type ReportData =
  | AttendanceReport
  | AssessmentResultsReport
  | TrainingCompletionReport
  | CertificateReport;

interface PdfExportRequest {
  request: AdminTrainerReportRequest;
  reportType: ReportType;
  report: ReportData;
  filter: ReportFilter;
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function AdminReportRequestsPage() {
  /*
   * ============================================================
   * TRAINER REPORT REQUEST HOOK
   * ============================================================
   */

  const {
    requests,
    loading,
    processingId,
    error,
    loadRequests,
    approveAndGenerate,
    rejectRequest,
  } =
    useAdminTrainerReportRequests(
      adminTrainerReportRequestApi
    );

  /*
   * ============================================================
   * ADMIN REPORT HOOK
   * ============================================================
   */

  const {
    loadAttendance,
    loadAssessmentResults,
    loadTrainingCompletion,
    loadCertificates,
  } =
    useAdminReports(
      reportApi
    );

  /*
   * ============================================================
   * FILTER STATES
   * ============================================================
   */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    TrainerReportRequestStatus | "All"
  >("All");

  /*
   * ============================================================
   * MODAL STATES
   * ============================================================
   */

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
  ] =
    useState<ReviewMode>(null);

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    showReviewModal,
    setShowReviewModal,
  ] = useState(false);

  const [
    showViewModal,
    setShowViewModal,
  ] = useState(false);

  /*
   * ============================================================
   * PDF GENERATION STATE
   * ============================================================
   */

  const [
    generatingReport,
    setGeneratingReport,
  ] = useState(false);

  const [
    pdfExportRequest,
    setPdfExportRequest,
  ] =
    useState<PdfExportRequest | null>(
      null
    );

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  const totalRequests =
    requests.length;

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status ===
        "Pending"
    ).length;

  const approvedRequests =
    requests.filter(
      (request) =>
        request.status ===
        "Approved"
    ).length;

  const completedRequests =
    requests.filter(
      (request) =>
        request.status ===
        "Completed"
    ).length;

  const rejectedRequests =
    requests.filter(
      (request) =>
        request.status ===
        "Rejected"
    ).length;

  /*
   * ============================================================
   * FILTERED REQUESTS
   * ============================================================
   */

  const filteredRequests =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return requests.filter(
        (request) => {
          const matchesStatus =
            statusFilter ===
              "All" ||
            request.status ===
              statusFilter;

          if (
            !matchesStatus
          ) {
            return false;
          }

          if (
            !normalizedSearch
          ) {
            return true;
          }

          return (
            request.trainerName
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            request.trainerCode
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            request.batchCode
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            request.trainingProgramName
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            request.reportType
              ?.toLowerCase()
              .includes(
                normalizedSearch
              )
          );
        }
      );
    }, [
      requests,
      search,
      statusFilter,
    ]);

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  function formatDate(
    value?: string | null
  ) {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
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
      }
    );
  }

  /*
   * ============================================================
   * FORMAT DATE TIME
   * ============================================================
   */

  function formatDateTime(
    value?: string | null
  ) {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  /*
   * ============================================================
   * REPORT TYPE LABEL
   * ============================================================
   */

  function getReportTypeLabel(
    reportType: string
  ) {
    switch (reportType) {
      case "Attendance":
        return "Attendance Report";

      case "Assessment":
        return "Assessment Results";

      case "TrainingSummary":
        return "Training Summary";

      case "Certificate":
        return "Certificate Report";

      default:
        return reportType;
    }
  }

  /*
   * ============================================================
   * STATUS CLASS
   * ============================================================
   */

  function getStatusClasses(
    status: TrainerReportRequestStatus
  ) {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Approved":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }

  /*
   * ============================================================
   * OPEN REVIEW
   * ============================================================
   */

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

    setShowReviewModal(
      true
    );
  }

  /*
   * ============================================================
   * CLOSE REVIEW
   * ============================================================
   */

  function closeReview() {
    if (
      generatingReport
    ) {
      return;
    }

    setShowReviewModal(
      false
    );

    setSelectedRequest(
      null
    );

    setReviewMode(
      null
    );

    setRemarks("");
  }

  /*
   * ============================================================
   * OPEN VIEW
   * ============================================================
   */

  function openView(
    request: AdminTrainerReportRequest
  ) {
    setSelectedRequest(
      request
    );

    setShowViewModal(
      true
    );
  }

  /*
   * ============================================================
   * CLOSE VIEW
   * ============================================================
   */

  function closeView() {
    setShowViewModal(
      false
    );

    setSelectedRequest(
      null
    );
  }

  /*
   * ============================================================
   * LOAD REPORT DATA
   * ============================================================
   *
   * IMPORTANT:
   *
   * This function DOES NOT load jsPDF.
   *
   * It only retrieves the report data.
   */

  async function loadReportForRequest(
    request: AdminTrainerReportRequest
  ): Promise<{
    reportType: ReportType;
    report: ReportData;
    filter: ReportFilter;
  }> {
    const filter: ReportFilter = {
      trainingBatchId:
        request.trainingBatchId,

      dateFrom:
        request.dateFrom ??
        undefined,

      dateTo:
        request.dateTo ??
        undefined,
    };

    switch (
      request.reportType
    ) {
      case "Attendance": {
        const report =
          await loadAttendance(
            filter
          );

        return {
          reportType:
            "attendance",
          report:
            report as AttendanceReport,
          filter,
        };
      }

      case "Assessment": {
        const report =
          await loadAssessmentResults(
            filter
          );

        return {
          reportType:
            "assessment-results",
          report:
            report as AssessmentResultsReport,
          filter,
        };
      }

      case "TrainingSummary": {
        const report =
          await loadTrainingCompletion(
            filter
          );

        return {
          reportType:
            "training-completion",
          report:
            report as TrainingCompletionReport,
          filter,
        };
      }

      case "Certificate": {
        const report =
          await loadCertificates(
            filter
          );

        return {
          reportType:
            "certificates",
          report:
            report as CertificateReport,
          filter,
        };
      }

      default:
        throw new Error(
          `Unsupported report type: ${request.reportType}`
        );
    }
  }

  /*
   * ============================================================
   * HANDLE REVIEW
   * ============================================================
   */

  async function handleReview() {
    if (
      !selectedRequest ||
      !reviewMode
    ) {
      return;
    }

    try {
      /*
       * ========================================================
       * REJECT
       * ========================================================
       */

      if (
        reviewMode ===
        "reject"
      ) {
        await rejectRequest(
          selectedRequest.id,
          {
            adminRemarks:
              remarks.trim()
                ? remarks.trim()
                : null,
          }
        );

        closeReview();

        await loadRequests();

        return;
      }

      /*
       * ========================================================
       * APPROVE
       * ========================================================
       */

      setGeneratingReport(
        true
      );

      /*
       * Retrieve the requested report data.
       *
       * No jsPDF here.
       */

      const {
        reportType,
        report,
        filter,
      } =
        await loadReportForRequest(
          selectedRequest
        );

      /*
       * Pass the report data to the browser-only
       * ReportPdfExporter component.
       */

      setPdfExportRequest({
        request:
          selectedRequest,
        reportType,
        report,
        filter,
      });
    } catch (err) {
      console.error(
        "Failed to process trainer report request:",
        err
      );

      setGeneratingReport(
        false
      );
    }
  }

  /*
   * ============================================================
   * HANDLE GENERATED PDF
   * ============================================================
   *
   * The ReportPdfExporter returns the PDF as Blob.
   *
   * Then we send that Blob to:
   *
   * approveAndGenerate()
   *
   * which uploads the generated PDF to the backend.
   */

  async function handlePdfGenerated(
    blob: Blob
  ) {
    if (
      !pdfExportRequest
    ) {
      setGeneratingReport(
        false
      );

      return;
    }

    try {
      await approveAndGenerate(
        pdfExportRequest.request.id,
        blob,
        remarks.trim()
          ? remarks.trim()
          : null
      );

      setPdfExportRequest(
        null
      );

      setGeneratingReport(
        false
      );

      closeReview();

      await loadRequests();
    } catch (error) {
      console.error(
        "Failed to upload generated report:",
        error
      );

      setGeneratingReport(
        false
      );
    }
  }

  /*
   * ============================================================
   * HANDLE PDF ERROR
   * ============================================================
   */

  function handlePdfExportError(
    error: unknown
  ) {
    console.error(
      "PDF generation failed:",
      error
    );

    setPdfExportRequest(
      null
    );

    setGeneratingReport(
      false
    );
  }

  /*
   * ============================================================
   * OPEN GENERATED REPORT
   * ============================================================
   */

  function handleDownload(
    request: AdminTrainerReportRequest
  ) {
    if (
      !request.reportFileUrl
    ) {
      return;
    }

    window.open(
      request.reportFileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="space-y-6">
      {/* ======================================================
          HIDDEN PDF EXPORTER
      ====================================================== */}

      {pdfExportRequest && (
        <ReportPdfExporter
          reportType={
            pdfExportRequest.reportType
          }
          report={
            pdfExportRequest.report
          }
          filter={
            pdfExportRequest.filter
          }
          onComplete={
            handlePdfGenerated
          }
          onError={
            handlePdfExportError
          }
        />
      )}

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageSection
        title="Trainer Report Requests"
        description="Review, approve, reject, and manage report requests submitted by trainers."
      />

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Unable to process request
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadRequests()
            }
            className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <StatGrid>
        <StatCard
          title="Total Requests"
          value={
            totalRequests
          }
          icon={
            ClipboardList
          }
        />

        <StatCard
          title="Pending"
          value={
            pendingRequests
          }
          variant="warning"
          icon={
            Clock3
          }
        />

        <StatCard
          title="Approved"
          value={
            approvedRequests
          }
          variant="primary"
          icon={
            CheckCircle2
          }
        />

        <StatCard
          title="Completed"
          value={
            completedRequests
          }
          variant="success"
          icon={
            CheckCircle2
          }
        />

        <StatCard
          title="Rejected"
          value={
            rejectedRequests
          }
          variant="default"
          icon={
            XCircle
          }
        />
      </StatGrid>

      {/* ======================================================
          REPORT REQUESTS
      ====================================================== */}

      <PageSection
        title="Report Requests"
        description="View all trainer report requests and take the appropriate action."
      >
        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search trainer, batch, program, or report type..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#3B7597] focus:ring-2 focus:ring-[#3B7597]/20"
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target
                  .value as
                  | TrainerReportRequestStatus
                  | "All"
              )
            }
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#3B7597] focus:ring-2 focus:ring-[#3B7597]/20"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Trainer
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Training
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Report
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date Range
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Requested
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {loading &&
                  filteredRequests.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          7
                        }
                        className="px-5 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                          <Loader2 className="h-6 w-6 animate-spin" />

                          <span className="text-sm">
                            Loading report requests...
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                {!loading &&
                  filteredRequests.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          7
                        }
                        className="px-5 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-gray-300" />

                          <p className="text-sm font-medium text-gray-600">
                            No report requests found.
                          </p>

                          <p className="text-xs text-gray-400">
                            Try changing your search or status filter.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                {filteredRequests.map(
                  (
                    request
                  ) => {
                    const isProcessing =
                      processingId ===
                      request.id;

                    return (
                      <tr
                        key={
                          request.id
                        }
                        className="transition hover:bg-gray-50"
                      >
                        {/* TRAINER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002b5c]/10 text-[#002b5c]">
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

                        {/* TRAINING */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {
                              request.trainingProgramName
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Batch:{" "}
                            {
                              request.batchCode
                            }
                          </p>
                        </td>

                        {/* REPORT */}

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#002b5c]/5 px-2.5 py-1 text-xs font-medium text-[#002b5c]">
                            <FileText className="h-3.5 w-3.5" />

                            {getReportTypeLabel(
                              request.reportType
                            )}
                          </span>
                        </td>

                        {/* DATE RANGE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays className="h-4 w-4 text-gray-400" />

                            <span>
                              {formatDate(
                                request.dateFrom
                              )}{" "}
                              –{" "}
                              {formatDate(
                                request.dateTo
                              )}
                            </span>
                          </div>
                        </td>

                        {/* REQUESTED */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(
                              request.requestedAt
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              request.status
                            )}`}
                          >
                            {
                              request.status
                            }
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {request.status ===
                            "Pending" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    isProcessing ||
                                    generatingReport
                                  }
                                  onClick={() =>
                                    openReview(
                                      request,
                                      "approve"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />

                                  Approve
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isProcessing ||
                                    generatingReport
                                  }
                                  onClick={() =>
                                    openReview(
                                      request,
                                      "reject"
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <XCircle className="h-3.5 w-3.5" />

                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openView(
                                    request
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                              >
                                <Eye className="h-3.5 w-3.5" />

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
        </div>

        {/* ====================================================
            RESULT COUNT
        ==================================================== */}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing{" "}
            <span className="font-medium text-gray-700">
              {
                filteredRequests.length
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">
              {requests.length}
            </span>{" "}
            requests
          </span>

          <button
            type="button"
            onClick={() =>
              void loadRequests()
            }
            disabled={
              loading ||
              generatingReport
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </PageSection>

      {/* ======================================================
          REVIEW MODAL
      ====================================================== */}

      {showReviewModal &&
        selectedRequest &&
        reviewMode && (
          <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {reviewMode ===
                    "approve"
                      ? "Approve Report Request"
                      : "Reject Report Request"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {
                      selectedRequest.trainerName
                    }{" "}
                    •{" "}
                    {
                      selectedRequest.reportType
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeReview
                  }
                  disabled={
                    generatingReport
                  }
                  className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
  <div className="space-y-5">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Trainer
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {
                          selectedRequest.trainerName
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Trainer Code
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {
                          selectedRequest.trainerCode
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Batch
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {
                          selectedRequest.batchCode
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Report
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {getReportTypeLabel(
                          selectedRequest.reportType
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Trainer's Reason
                    </label>

                    <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                      {
                        selectedRequest.reason
                      }
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="adminRemarks"
                    className="text-sm font-medium text-gray-700"
                  >
                    Admin Remarks
                  </label>

                  <textarea
                    id="adminRemarks"
                    value={
                      remarks
                    }
                    onChange={(
                      event
                    ) =>
                      setRemarks(
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    disabled={
                      generatingReport
                    }
                    placeholder={
                      reviewMode ===
                      "approve"
                        ? "Add optional remarks about this approval..."
                        : "Enter the reason for rejecting this request..."
                    }
                    className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#3B7597] focus:ring-2 focus:ring-[#3B7597]/20 disabled:bg-gray-50"
                  />
                </div>

                {reviewMode ===
                  "approve" && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex gap-3">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                      <div>
                        <p className="text-sm font-semibold text-blue-800">
                          Report will be generated automatically
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-700">
                          The system will retrieve the requested report data, generate the PDF, and upload it with this approval.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={
                    closeReview
                  }
                  disabled={
                    generatingReport
                  }
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleReview()
                  }
                  disabled={
                    generatingReport ||
                    processingId ===
                      selectedRequest.id
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    reviewMode ===
                    "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {generatingReport ||
                  processingId ===
                    selectedRequest.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      {reviewMode ===
                      "approve"
                        ? "Generating Report..."
                        : "Rejecting..."}
                    </>
                  ) : (
                    <>
                      {reviewMode ===
                      "approve" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}

                      {reviewMode ===
                      "approve"
                        ? "Approve & Generate"
                        : "Reject Request"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

      {/* ======================================================
          VIEW MODAL
      ====================================================== */}

      {showViewModal &&
        selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Report Request Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {
                      selectedRequest.trainerName
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeView
                  }
                  className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Trainer
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {
                        selectedRequest.trainerName
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Trainer Code
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {
                        selectedRequest.trainerCode
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Training Batch
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {
                        selectedRequest.batchCode
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Report Type
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {getReportTypeLabel(
                        selectedRequest.reportType
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Requested
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDateTime(
                        selectedRequest.requestedAt
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Reviewed
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDateTime(
                        selectedRequest.reviewedAt
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                      selectedRequest.status
                    )}`}
                  >
                    {
                      selectedRequest.status
                    }
                  </span>
                </div>

                {selectedRequest.reason && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Trainer Reason
                    </p>

                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                      {
                        selectedRequest.reason
                      }
                    </p>
                  </div>
                )}

                {selectedRequest.adminRemarks && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      Admin Remarks
                    </p>

                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                      {
                        selectedRequest.adminRemarks
                      }
                    </p>
                  </div>
                )}

                {selectedRequest.reportFileUrl ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-emerald-600">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Generated Report
                          </p>

                          <p className="text-xs text-emerald-700">
                            PDF report is available.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            selectedRequest
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                      >
                        <Download className="h-3.5 w-3.5" />

                        Open PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    No generated report file is available.
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={
                    closeView
                  }
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}