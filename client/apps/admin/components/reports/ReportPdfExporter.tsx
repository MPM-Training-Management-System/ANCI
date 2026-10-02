"use client";

import {
  useEffect,
  useRef,
} from "react";

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

import {
  exportReportPdf,
} from "./ReportPdf";

type ReportData =
  | AdminReportOverview
  | TrainingCompletionReport
  | EnrollmentReport
  | AttendanceReport
  | AssessmentResultsReport
  | CertificateReport
  | TrainerReport
  | ServiceRequestReport;

interface ReportPdfExporterProps {
  reportType: ReportType;
  report: ReportData;
  filter?: ReportFilter;
  onComplete: () => void;
  onError: (error: unknown) => void;
}

export default function ReportPdfExporter({
  reportType,
  report,
  filter,
  onComplete,
  onError,
}: ReportPdfExporterProps) {
  const hasExported =
    useRef(false);

  useEffect(() => {
    if (hasExported.current) {
      return;
    }

    hasExported.current = true;

    try {
      exportReportPdf({
        reportType,
        report,
        filter,
      });

      onComplete();
    } catch (error) {
      console.error(
        "PDF export failed:",
        error
      );

      onError(error);
    }
  }, [
    reportType,
    report,
    filter,
    onComplete,
    onError,
  ]);

  return null;
}