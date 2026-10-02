"use client";

import {
  useState,
} from "react";

import dynamic from "next/dynamic";

import type {
  AdminReportOverview,
  AssessmentResultsReport,
  AttendanceReport,
  CertificateReport,
  EnrollmentReport,
  ReportFilter,
  ReportType,
  ServiceRequestReport,
  TrainerReport,
  TrainingCompletionReport,
} from "@repo/types";

type ReportData =
  | AdminReportOverview
  | TrainingCompletionReport
  | EnrollmentReport
  | AttendanceReport
  | AssessmentResultsReport
  | CertificateReport
  | TrainerReport
  | ServiceRequestReport;

interface ReportExportButtonProps {
  reportType: ReportType;
  report: ReportData | null;
  filter?: ReportFilter;
  disabled?: boolean;
  label?: string;
  className?: string;
}

interface ReportPdfExporterProps {
  reportType: ReportType;
  report: ReportData;
  filter?: ReportFilter;
  onComplete: () => void;
  onError: (error: unknown) => void;
}

/*
 * IMPORTANT:
 *
 * ReportPdf.ts imports jsPDF.
 *
 * It must never be included in the SSR bundle.
 */
const ReportPdfExporter =
  dynamic<ReportPdfExporterProps>(
    () =>
      import(
        "./ReportPdfExporter"
      ),
    {
      ssr: false,
    }
  );

function getDefaultLabel(
  reportType: ReportType
): string {
  switch (reportType) {
    case "overview":
      return "Export Overview";

    case "training-completion":
      return "Export Training Report";

    case "enrollments":
      return "Export Enrollments";

    case "attendance":
      return "Export Attendance";

    case "assessment-results":
      return "Export Assessment Results";

    case "certificates":
      return "Export Certificates";

    case "trainers":
      return "Export Trainers";

    case "service-requests":
      return "Export Service Requests";

    default:
      return "Export PDF";
  }
}

export default function ReportExportButton({
  reportType,
  report,
  filter,
  disabled = false,
  label,
  className = "",
}: ReportExportButtonProps) {
  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  const [
    shouldExport,
    setShouldExport,
  ] = useState(false);

  const handleExport = () => {
    if (!report) {
      return;
    }

    if (
      disabled ||
      isExporting
    ) {
      return;
    }

    setIsExporting(true);
    setShouldExport(true);
  };

  const handleComplete = () => {
    setShouldExport(false);
    setIsExporting(false);
  };

  const handleError = (
    error: unknown
  ) => {
    console.error(
      "Failed to export report PDF:",
      error
    );

    setShouldExport(false);
    setIsExporting(false);

    window.alert(
      "Unable to export the report PDF. Please try again."
    );
  };

  const isDisabled =
    disabled ||
    !report ||
    isExporting;

  return (
    <>
      <button
        type="button"
        onClick={handleExport}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center gap-2",
          "rounded-xl px-4 py-2.5",
          "text-sm font-semibold",
          "transition",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-[#6FD1D7]/40",

          isDisabled
            ? "cursor-not-allowed bg-[#eef2f5] text-[#9aa6b2]"
            : "bg-[#002b5c] text-white hover:bg-[#0d2142]",

          className,
        ].join(" ")}
      >
        {isExporting ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />

            <span>
              Generating PDF...
            </span>
          </>
        ) : (
          <>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 3V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M4 21H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <span>
              {label ??
                getDefaultLabel(
                  reportType
                )}
            </span>
          </>
        )}
      </button>

      {shouldExport &&
        report && (
          <ReportPdfExporter
            reportType={reportType}
            report={report}
            filter={filter}
            onComplete={handleComplete}
            onError={handleError}
          />
        )}
    </>
  );
}