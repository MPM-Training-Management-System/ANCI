"use client";

import {
  useEffect,
  useRef,
} from "react";

import type {
  ReportFilter,
  ReportType,
} from "@repo/types";

import type {
  AutoTableFunction,
  JsPdfConstructor,
  ReportData,
} from "./ReportPdf";

interface ReportPdfExporterProps {
  reportType: ReportType;

  report: ReportData;

  filter?: ReportFilter;

  onComplete: (
    blob: Blob
  ) => void | Promise<void>;

  onError: (
    error: unknown
  ) => void;
}

export default function ReportPdfExporter({
  reportType,
  report,
  filter,
  onComplete,
  onError,
}: ReportPdfExporterProps) {
  const hasExported = useRef(false);

  useEffect(() => {
    /*
     * ==========================================================
     * PREVENT DUPLICATE EXPORT
     * ==========================================================
     */

    if (hasExported.current) {
      return;
    }

    hasExported.current = true;

    async function generate() {
      try {
        console.log(
          "PDF EXPORT: Starting PDF generation..."
        );

        /*
         * ======================================================
         * LOAD JSPDF ONLY IN BROWSER
         * ======================================================
         */

        console.log(
          "PDF EXPORT: Loading jspdf..."
        );

        const jspdfModule =
          await import("jspdf");

        console.log(
          "PDF EXPORT: jspdf loaded."
        );

        /*
         * ======================================================
         * LOAD AUTOTABLE ONLY IN BROWSER
         * ======================================================
         */

        console.log(
          "PDF EXPORT: Loading jspdf-autotable..."
        );

        const autoTableModule =
          await import(
            "jspdf-autotable"
          );

        console.log(
          "PDF EXPORT: jspdf-autotable loaded."
        );

        /*
         * ======================================================
         * JSPDF CONSTRUCTOR
         * ======================================================
         */

        const JsPDF =
          jspdfModule.jsPDF as unknown as JsPdfConstructor;

        if (!JsPDF) {
          throw new Error(
            "jsPDF constructor was not found."
          );
        }

        /*
         * ======================================================
         * AUTOTABLE
         * ======================================================
         */

        const autoTable =
          autoTableModule.default as unknown as AutoTableFunction;

        if (!autoTable) {
          throw new Error(
            "jspdf-autotable function was not found."
          );
        }

        /*
         * ======================================================
         * LOAD REPORT PDF
         * ======================================================
         *
         * IMPORTANT:
         *
         * ReportPdf.ts does NOT import jspdf at runtime.
         *
         * jsPDF and autoTable are injected here.
         */

        console.log(
          "PDF EXPORT: Loading ReportPdf..."
        );

        const {
          generateReportPdfBlob,
        } = await import(
          "./ReportPdf"
        );

        console.log(
          "PDF EXPORT: ReportPdf loaded."
        );

        /*
         * ======================================================
         * GENERATE PDF
         * ======================================================
         */

        console.log(
          "PDF EXPORT: Generating PDF...",
          {
            reportType,
          }
        );

        const blob =
          generateReportPdfBlob(
            JsPDF,
            autoTable,
            {
              reportType,
              report,
              filter,
            }
          );

        /*
         * ======================================================
         * VALIDATE PDF
         * ======================================================
         */

        if (!(blob instanceof Blob)) {
          throw new Error(
            "PDF generator did not return a valid Blob."
          );
        }

        if (blob.size <= 0) {
          throw new Error(
            "Generated PDF is empty."
          );
        }

        console.log(
          "PDF EXPORT: PDF generated successfully.",
          {
            size: blob.size,
            type: blob.type,
          }
        );

        /*
         * ======================================================
         * DOWNLOAD
         * ======================================================
         */

        const reportName =
          getReportFileName(
            reportType
          );

        console.log(
          "PDF EXPORT: Downloading:",
          reportName
        );

        const downloadUrl =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          downloadUrl;

        anchor.download =
          reportName;

        anchor.style.display =
          "none";

        document.body.appendChild(
          anchor
        );

        anchor.click();

        document.body.removeChild(
          anchor
        );

        /*
         * Release Blob URL
         */

        setTimeout(() => {
          URL.revokeObjectURL(
            downloadUrl
          );
        }, 1000);

        console.log(
          "PDF EXPORT: Download triggered."
        );

        /*
         * ======================================================
         * RETURN BLOB
         * ======================================================
         *
         * Important:
         *
         * We still return the Blob.
         *
         * This allows the same exporter to be used by:
         *
         * - Admin Reports
         * - Trainer Report Requests
         * - Upload/approval workflow
         */

        await onComplete(
          blob
        );
      } catch (error) {
        console.error(
          "PDF EXPORT: Failed to generate PDF.",
          error
        );

        onError(error);
      }
    }

    void generate();

    /*
     * ==========================================================
     * IMPORTANT
     * ==========================================================
     *
     * No cleanup cancellation here.
     *
     * hasExported prevents duplicate generation.
     */
  }, [
    reportType,
    report,
    filter,
    onComplete,
    onError,
  ]);

  /*
   * ============================================================
   * NO UI
   * ============================================================
   */

  return null;
}

/*
 * ==============================================================
 * REPORT FILE NAME
 * ==============================================================
 */

function getReportFileName(
  reportType: ReportType
): string {
  const reportNames: Partial<
    Record<ReportType, string>
  > = {
    overview:
      "overview-report",

    "training-completion":
      "training-completion-report",

    enrollments:
      "enrollment-report",

    attendance:
      "attendance-report",

    "assessment-results":
      "assessment-results-report",

    "grade-calculation":
      "grade-calculation-report",

    certificates:
      "certificate-report",

    trainers:
      "trainer-report",

    "service-requests":
      "service-request-report",
  };

  const name =
    reportNames[
      reportType
    ] ??
    "anci-report";

  const date =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  return `ANCI-${name}-${date}.pdf`;
}