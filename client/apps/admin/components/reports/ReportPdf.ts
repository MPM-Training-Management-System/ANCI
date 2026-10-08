import type { jsPDF } from "jspdf";

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

/* =========================================================
   TYPES
========================================================= */

/*
 * =========================================================
 * GRADE CALCULATION REPORT
 * =========================================================
 *
 * We intentionally define only the fields needed by the PDF.
 *
 * This means your actual TrainingGrade can contain more fields
 * without causing a problem.
 */

export interface GradeCalculationReportItem {
  participantName: string;

  batchCode: string;

  overallGrade: number;

  isPassed: boolean;
}

export interface GradeCalculationReport {
  grades: GradeCalculationReportItem[];
}

/* =========================================================
   REPORT DATA
========================================================= */

export type ReportData =
  | AdminReportOverview
  | TrainingCompletionReport
  | EnrollmentReport
  | AttendanceReport
  | AssessmentResultsReport
  | GradeCalculationReport
  | CertificateReport
  | TrainerReport
  | ServiceRequestReport;

/* =========================================================
   EXPORT OPTIONS
========================================================= */

export interface ExportReportPdfOptions {
  reportType: ReportType;

  report: ReportData;

  filter?: ReportFilter;
}

/*
 * IMPORTANT
 *
 * DO NOT import jspdf at runtime here.
 *
 * This is only a TypeScript type import.
 *
 * The actual jsPDF constructor is passed from
 * ReportPdfExporter.tsx.
 */

export type JsPdfConstructor = new (
  options?: {
    orientation?:
      | "portrait"
      | "landscape";

    unit?: string;

    format?:
      | string
      | number[];
  }
) => jsPDF;

export type AutoTableFunction = (
  doc: jsPDF,
  options: Record<string, unknown>
) => void;

type PdfOrientation =
  | "portrait"
  | "landscape";

interface TableOptions {
  head: string[][];

  body: (
    | string
    | number
  )[][];

  orientation?: PdfOrientation;

  columnStyles?: Record<
    number,
    {
      cellWidth?:
        | number
        | "auto";

      halign?:
        | "left"
        | "center"
        | "right";
    }
  >;
}

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_MARGIN = 14;

const COMPANY_NAME =
  "ACE NextGen Consultancy Inc.";

const COMPANY_SUBTITLE =
  "Integrated Service and Training Management System";

/* =========================================================
   BASIC HELPERS
========================================================= */

function safeText(
  value?: unknown
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "—";
  }

  const text =
    String(value).trim();

  if (!text) {
    return "—";
  }

  return text;
}

function formatNumber(
  value?: number | null
): string {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return "0";
  }

  return value.toLocaleString(
    "en-PH"
  );
}

function formatPercentage(
  value?: number | null
): string {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return "0.00%";
  }

  return `${value.toFixed(2)}%`;
}

function formatDate(
  value?: string | null
): string {
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
    return value;
  }

  return date.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );
}

function formatDateTime(
  value?: string | null
): string {
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
    return value;
  }

  return date.toLocaleString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function titleCase(
  value?: string | null
): string {
  if (!value) {
    return "—";
  }

  return value
    .replace(
      /[-_]/g,
      " "
    )
    .replace(
      /\w\S*/g,
      (word) =>
        word.charAt(0).toUpperCase() +
        word
          .slice(1)
          .toLowerCase()
    );
}

/* =========================================================
   REPORT TITLE
========================================================= */

export function getReportTitle(
  reportType: ReportType
): string {
  switch (reportType) {
    case "overview":
      return "Administrative Report Overview";

    case "training-completion":
      return "Training Completion Report";

    case "enrollments":
      return "Enrollment Report";

    case "attendance":
      return "Attendance Report";

    case "assessment-results":
      return "Assessment Results Report";

    case "grade-calculation":
      return "Grade Calculation Report";

    case "certificates":
      return "Certificate Report";

    case "trainers":
      return "Trainer Report";

    case "service-requests":
      return "Service Request Report";

    default:
      return "Report";
  }
}

/* =========================================================
   FILE NAME
========================================================= */

export function getReportPdfFilename(
  reportType: ReportType
): string {
  const date =
    new Date()
      .toISOString()
      .slice(0, 10);

  const title =
    getReportTitle(
      reportType
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  return `anci-${title}-${date}.pdf`;
}

/* =========================================================
   CREATE DOCUMENT
========================================================= */

function createDocument(
  JsPDF: JsPdfConstructor,
  orientation: PdfOrientation =
    "landscape"
): jsPDF {
  return new JsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });
}

/* =========================================================
   HEADER
========================================================= */

function addHeader(
  doc: jsPDF,
  reportType: ReportType
): void {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(17);

  doc.text(
    COMPANY_NAME,
    PAGE_MARGIN,
    17
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.text(
    COMPANY_SUBTITLE,
    PAGE_MARGIN,
    23
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(12);

  doc.text(
    getReportTitle(
      reportType
    ),
    PAGE_MARGIN,
    34
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.text(
    `Generated: ${formatDateTime(
      new Date().toISOString()
    )}`,
    pageWidth -
      PAGE_MARGIN,
    34,
    {
      align: "right",
    }
  );

  doc.setDrawColor(
    215,
    220,
    225
  );

  doc.line(
    PAGE_MARGIN,
    39,
    pageWidth -
      PAGE_MARGIN,
    39
  );
}

/* =========================================================
   FILTERS
========================================================= */

function addFilters(
  doc: jsPDF,
  filter?: ReportFilter,
  startY = 44
): number {
  if (!filter) {
    return startY;
  }

  const filters: string[] =
    [];

  if (
    filter.trainingProgramId
  ) {
    filters.push(
      `Training Program: ${safeText(
        filter.trainingProgramId
      )}`
    );
  }

  if (
    filter.trainingBatchId
  ) {
    filters.push(
      `Training Batch: ${safeText(
        filter.trainingBatchId
      )}`
    );
  }

  if (
    filter.trainerProfileId
  ) {
    filters.push(
      `Trainer: ${safeText(
        filter.trainerProfileId
      )}`
    );
  }

  if (filter.dateFrom) {
    filters.push(
      `From: ${formatDate(
        filter.dateFrom
      )}`
    );
  }

  if (filter.dateTo) {
    filters.push(
      `To: ${formatDate(
        filter.dateTo
      )}`
    );
  }

  if (filter.status) {
    filters.push(
      `Status: ${titleCase(
        filter.status
      )}`
    );
  }

  if (filter.search) {
    filters.push(
      `Search: ${safeText(
        filter.search
      )}`
    );
  }

  if (
    filters.length === 0
  ) {
    return startY;
  }

  const pageWidth =
    doc.internal.pageSize.getWidth();

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.text(
    "Applied Filters",
    PAGE_MARGIN,
    startY
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  const lines =
    doc.splitTextToSize(
      filters.join(
        "   •   "
      ),
      pageWidth -
        PAGE_MARGIN * 2
    );

  doc.text(
    lines,
    PAGE_MARGIN,
    startY + 5
  );

  return (
    startY +
    5 +
    lines.length * 4
  );
}

/* =========================================================
   SUMMARY CARDS
========================================================= */

function addSummaryCards(
  doc: jsPDF,
  cards: Array<{
    label: string;

    value:
      | string
      | number;
  }>,
  startY: number
): number {
  if (
    cards.length === 0
  ) {
    return startY;
  }

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const availableWidth =
    pageWidth -
    PAGE_MARGIN * 2;

  const gap = 4;

  const cardWidth =
    (availableWidth -
      gap *
        (cards.length - 1)) /
    cards.length;

  const cardHeight = 18;

  cards.forEach(
    (card, index) => {
      const x =
        PAGE_MARGIN +
        index *
          (cardWidth + gap);

      doc.setFillColor(
        247,
        249,
        251
      );

      doc.roundedRect(
        x,
        startY,
        cardWidth,
        cardHeight,
        2,
        2,
        "F"
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.text(
        safeText(
          card.label
        ),
        x + 4,
        startY + 6
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        safeText(
          card.value
        ),
        x + 4,
        startY + 13
      );
    }
  );

  return (
    startY +
    cardHeight +
    8
  );
}

/* =========================================================
   TABLE
========================================================= */

function addTable(
  autoTable: AutoTableFunction,
  doc: jsPDF,
  options: TableOptions,
  startY: number
): number {
  autoTable(
    doc,
    {
      startY,

      head:
        options.head,

      body:
        options.body,

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2.5,
        overflow:
          "linebreak",
        valign: "middle",
        textColor: [
          35,
          45,
          55,
        ],
        lineColor: [
          220,
          225,
          230,
        ],
        lineWidth: 0.1,
      },

      headStyles: {
        fontStyle: "bold",
        fontSize: 7,
        textColor: [
          255,
          255,
          255,
        ],
        fillColor: [
          0,
          43,
          92,
        ],
      },

      alternateRowStyles: {
        fillColor: [
          250,
          251,
          252,
        ],
      },

      margin: {
        left:
          PAGE_MARGIN,
        right:
          PAGE_MARGIN,
        bottom: 18,
      },

      columnStyles:
        options.columnStyles,
    }
  );

  const table =
    (
      doc as jsPDF & {
        lastAutoTable?: {
          finalY: number;
        };
      }
    )
      .lastAutoTable;

  return (
    table?.finalY ??
    startY + 20
  );
}

/* =========================================================
   FOOTER
========================================================= */

function addFooter(
  doc: jsPDF
): void {
  const pageCount =
    doc.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    doc.setPage(
      page
    );

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const pageWidth =
      doc.internal.pageSize.getWidth();

    doc.setDrawColor(
      220,
      225,
      230
    );

    doc.line(
      PAGE_MARGIN,
      pageHeight - 13,
      pageWidth -
        PAGE_MARGIN,
      pageHeight - 13
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.text(
      COMPANY_NAME,
      PAGE_MARGIN,
      pageHeight - 8
    );

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth -
        PAGE_MARGIN,
      pageHeight - 8,
      {
        align: "right",
      }
    );
  }
}

/* =========================================================
   OVERVIEW
========================================================= */

function generateOverviewPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: AdminReportOverview,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "overview"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Training Programs",
          value:
            report.totalTrainingPrograms,
        },
        {
          label:
            "Training Batches",
          value:
            report.totalTrainingBatches,
        },
        {
          label:
            "Participants",
          value:
            report.totalParticipants,
        },
        {
          label:
            "Enrollments",
          value:
            report.totalEnrollments,
        },
        {
          label:
            "Trainers",
          value:
            report.totalTrainers,
        },
        {
          label:
            "Certificates",
          value:
            report.totalCertificates,
        },
      ],
      y
    );

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Active Programs",
          value:
            report.activeTrainingPrograms,
        },
        {
          label:
            "Active Enrollments",
          value:
            report.activeEnrollments,
        },
        {
          label:
            "Attendance Rate",
          value:
            formatPercentage(
              report.attendanceRate
            ),
        },
        {
          label:
            "Assessment Attempts",
          value:
            report.totalAssessmentAttempts,
        },
        {
          label:
            "Active Services",
          value:
            report.activeServices,
        },
        {
          label:
            "Service Requests",
          value:
            report.totalServiceRequests,
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Category",
          "Metric",
          "Value",
        ],
      ],

      body: [
        [
          "Attendance",
          "Total Records",
          formatNumber(
            report.totalAttendanceRecords
          ),
        ],
        [
          "Attendance",
          "Present",
          formatNumber(
            report.presentAttendance
          ),
        ],
        [
          "Attendance",
          "Absent",
          formatNumber(
            report.absentAttendance
          ),
        ],
        [
          "Attendance",
          "Late",
          formatNumber(
            report.lateAttendance
          ),
        ],
        [
          "Assessment",
          "Written Assessments",
          formatNumber(
            report.totalWrittenAssessments
          ),
        ],
        [
          "Assessment",
          "Published Assessments",
          formatNumber(
            report.publishedWrittenAssessments
          ),
        ],
        [
          "Certificates",
          "Completion",
          formatNumber(
            report.completionCertificates
          ),
        ],
        [
          "Certificates",
          "Participation",
          formatNumber(
            report.participationCertificates
          ),
        ],
        [
          "Certificates",
          "Revoked",
          formatNumber(
            report.revokedCertificates
          ),
        ],
        [
          "Services",
          "Total Services",
          formatNumber(
            report.totalServices
          ),
        ],
      ],
    },
    y
  );

  return doc;
}

/* =========================================================
   TRAINING COMPLETION
========================================================= */

function generateTrainingCompletionPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: TrainingCompletionReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "training-completion"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Total Participants",
          value:
            report.totalParticipants,
        },
        {
          label:
            "Completed",
          value:
            report.completedParticipants,
        },
        {
          label:
            "Incomplete",
          value:
            report.incompleteParticipants,
        },
        {
          label:
            "Completion Rate",
          value:
            formatPercentage(
              report.completionRate
            ),
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Participant",
          "Code",
          "Training",
          "Batch",
          "Trainer",
          "Attendance",
          "Assessment",
          "Assessment Status",
          "Completion",
          "Certificate",
        ],
      ],

      body:
        report.results.items.map(
          (item) => [
            safeText(
              item.participantName
            ),
            safeText(
              item.participantCode
            ),
            safeText(
              item.trainingProgramName
            ),
            safeText(
              item.batchCode
            ),
            safeText(
              item.trainerName
            ),
            formatPercentage(
              item.attendanceRate
            ),
            item.assessmentScore !==
                null &&
            item.assessmentScore !==
                undefined
              ? formatPercentage(
                  item.assessmentScore
                )
              : "—",
            safeText(
              item.assessmentStatus
            ),
            safeText(
              item.completionStatus
            ),
            item.hasCertificate
              ? safeText(
                  item.certificateNumber
                )
              : "No",
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 29,
        },
        1: {
          cellWidth: 20,
        },
        2: {
          cellWidth: 31,
        },
        3: {
          cellWidth: 18,
        },
        4: {
          cellWidth: 25,
        },
        5: {
          cellWidth: 18,
        },
        6: {
          cellWidth: 20,
        },
        7: {
          cellWidth: 23,
        },
        8: {
          cellWidth: 20,
        },
        9: {
          cellWidth: 28,
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   ENROLLMENTS
========================================================= */

function generateEnrollmentPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: EnrollmentReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "enrollments"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label: "Total",
          value:
            report.totalEnrollments,
        },
        {
          label: "Approved",
          value:
            report.approvedEnrollments,
        },
        {
          label: "Pending",
          value:
            report.pendingEnrollments,
        },
        {
          label: "Rejected",
          value:
            report.rejectedEnrollments,
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Participant",
          "Code",
          "Email",
          "Training",
          "Batch",
          "Trainer",
          "Status",
          "Enrolled",
          "Approved",
        ],
      ],

      body:
        report.results.items.map(
          (item) => [
            safeText(
              item.participantName
            ),
            safeText(
              item.participantCode
            ),
            safeText(
              item.participantEmail
            ),
            safeText(
              item.trainingProgramName
            ),
            safeText(
              item.batchCode
            ),
            safeText(
              item.trainerName
            ),
            safeText(
              item.enrollmentStatus
            ),
            formatDate(
              item.enrolledAt
            ),
            formatDate(
              item.approvedAt
            ),
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 27,
        },
        1: {
          cellWidth: 19,
        },
        2: {
          cellWidth: 39,
        },
        3: {
          cellWidth: 31,
        },
        4: {
          cellWidth: 19,
        },
        5: {
          cellWidth: 25,
        },
        6: {
          cellWidth: 21,
        },
        7: {
          cellWidth: 22,
        },
        8: {
          cellWidth: 22,
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   ATTENDANCE
========================================================= */

function generateAttendancePdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: AttendanceReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "attendance"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Total Records",
          value:
            report.totalRecords,
        },
        {
          label:
            "Present",
          value:
            report.presentRecords,
        },
        {
          label:
            "Absent",
          value:
            report.absentRecords,
        },
        {
          label:
            "Late",
          value:
            report.lateRecords,
        },
        {
          label:
            "Attendance Rate",
          value:
            formatPercentage(
              report.attendanceRate
            ),
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Participant",
          "Code",
          "Training",
          "Batch",
          "Trainer",
          "Date",
          "Time In",
          "Time Out",
          "Status",
          "Method",
        ],
      ],

      body:
        report.results.items.map(
          (item) => [
            safeText(
              item.participantName
            ),
            safeText(
              item.participantCode
            ),
            safeText(
              item.trainingProgramName
            ),
            safeText(
              item.batchCode
            ),
            safeText(
              item.trainerName
            ),
            formatDate(
              item.attendanceDate
            ),
            formatDateTime(
              item.timeIn
            ),
            formatDateTime(
              item.timeOut
            ),
            safeText(
              item.attendanceStatus
            ),
            safeText(
              item.attendanceMethod
            ),
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 29,
        },
        1: {
          cellWidth: 19,
        },
        2: {
          cellWidth: 31,
        },
        3: {
          cellWidth: 18,
        },
        4: {
          cellWidth: 25,
        },
        5: {
          cellWidth: 20,
        },
        6: {
          cellWidth: 27,
        },
        7: {
          cellWidth: 27,
        },
        8: {
          cellWidth: 21,
        },
        9: {
          cellWidth: 20,
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   ASSESSMENT RESULTS
========================================================= */

function generateAssessmentResultsPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: AssessmentResultsReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "assessment-results"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Total Attempts",
          value:
            report.totalAttempts,
        },
        {
          label:
            "Passed",
          value:
            report.passedAttempts,
        },
        {
          label:
            "Failed",
          value:
            report.failedAttempts,
        },
        {
          label:
            "Pending",
          value:
            report.pendingAttempts,
        },
        {
          label:
            "Average Score",
          value:
            formatPercentage(
              report.averageScore
            ),
        },
        {
          label:
            "Pass Rate",
          value:
            formatPercentage(
              report.passRate
            ),
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Participant",
          "Code",
          "Assessment",
          "Training",
          "Batch",
          "Attempt",
          "Questions",
          "Correct",
          "Score",
          "Status",
          "Started",
          "Submitted",
        ],
      ],

      body:
        report.results.items.map(
          (item) => [
            safeText(
              item.participantName
            ),
            safeText(
              item.participantCode
            ),
            safeText(
              item.assessmentTitle
            ),
            safeText(
              item.trainingProgramName
            ),
            safeText(
              item.batchCode
            ),
            formatNumber(
              item.attemptNumber
            ),
            formatNumber(
              item.totalQuestions
            ),
            formatNumber(
              item.correctAnswers
            ),
            formatPercentage(
              item.percentage
            ),
            safeText(
              item.assessmentStatus
            ),
            formatDateTime(
              item.startedAt
            ),
            formatDateTime(
              item.submittedAt
            ),
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 27,
        },
        1: {
          cellWidth: 18,
        },
        2: {
          cellWidth: 31,
        },
        3: {
          cellWidth: 28,
        },
        4: {
          cellWidth: 18,
        },
        5: {
          cellWidth: 13,
        },
        6: {
          cellWidth: 17,
        },
        7: {
          cellWidth: 15,
        },
        8: {
          cellWidth: 18,
        },
        9: {
          cellWidth: 20,
        },
        10: {
          cellWidth: 24,
        },
        11: {
          cellWidth: 24,
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   GRADE CALCULATION
========================================================= */

function generateGradeCalculationPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: GradeCalculationReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  /*
   * ========================================================
   * HEADER
   * ========================================================
   */

  addHeader(
    doc,
    "grade-calculation"
  );

  /*
   * ========================================================
   * FILTERS
   * ========================================================
   */

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  /*
   * ========================================================
   * CALCULATE SUMMARY
   * ========================================================
   */

  const grades =
    report.grades ?? [];

  const totalParticipants =
    grades.length;

  const passedCount =
    grades.filter(
      (grade) =>
        grade.isPassed
    ).length;

  const failedCount =
    totalParticipants -
    passedCount;

  const averageGrade =
    totalParticipants > 0
      ? grades.reduce(
          (
            total,
            grade
          ) =>
            total +
            Number(
              grade.overallGrade ??
                0
            ),
          0
        ) /
        totalParticipants
      : 0;

  /*
   * ========================================================
   * SUMMARY CARDS
   * ========================================================
   */

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Total Participants",
          value:
            totalParticipants,
        },
        {
          label:
            "Passed",
          value:
            passedCount,
        },
        {
          label:
            "Failed",
          value:
            failedCount,
        },
        {
          label:
            "Average Grade",
          value:
            averageGrade.toFixed(
              2
            ),
        },
      ],
      y
    );

  /*
   * ========================================================
   * GRADE TABLE
   * ========================================================
   */

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "#",
          "Participant",
          "Batch",
          "Overall Grade",
          "Result",
        ],
      ],

      body:
        grades.map(
          (
            grade,
            index
          ) => [
            index + 1,

            safeText(
              grade.participantName
            ),

            safeText(
              grade.batchCode
            ),

            Number(
              grade.overallGrade ??
                0
            ).toFixed(2),

            grade.isPassed
              ? "Passed"
              : "Failed",
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 12,
          halign:
            "center",
        },

        1: {
          cellWidth: 70,
        },

        2: {
          cellWidth: 40,
        },

        3: {
          cellWidth: 45,
          halign:
            "center",
        },

        4: {
          cellWidth: 35,
          halign:
            "center",
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   CERTIFICATES
========================================================= */

function generateCertificatePdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: CertificateReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "certificates"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Total Certificates",
          value:
            report.totalCertificates,
        },
        {
          label:
            "Completion",
          value:
            report.completionCertificates,
        },
        {
          label:
            "Participation",
          value:
            report.participationCertificates,
        },
        {
          label:
            "Active",
          value:
            report.activeCertificates,
        },
        {
          label:
            "Revoked",
          value:
            report.revokedCertificates,
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Participant",
          "Code",
          "Certificate No.",
          "Type",
          "Training",
          "Batch",
          "Trainer",
          "Issued",
          "Verification",
          "Status",
        ],
      ],

      body:
        report.results.items.map(
          (item) => [
            safeText(
              item.participantName
            ),
            safeText(
              item.participantCode
            ),
            safeText(
              item.certificateNumber
            ),
            safeText(
              item.certificateType
            ),
            safeText(
              item.trainingProgramName
            ),
            safeText(
              item.batchCode
            ),
            safeText(
              item.trainerName
            ),
            formatDate(
              item.issuedAt
            ),
            safeText(
              item.verificationCode
            ),
            item.isRevoked
              ? "Revoked"
              : "Active",
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 27,
        },
        1: {
          cellWidth: 18,
        },
        2: {
          cellWidth: 30,
        },
        3: {
          cellWidth: 21,
        },
        4: {
          cellWidth: 30,
        },
        5: {
          cellWidth: 18,
        },
        6: {
          cellWidth: 24,
        },
        7: {
          cellWidth: 20,
        },
        8: {
          cellWidth: 29,
        },
        9: {
          cellWidth: 18,
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   TRAINERS
========================================================= */

function generateTrainerPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: TrainerReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "trainers"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Total Trainers",
          value:
            report.totalTrainers,
        },
        {
          label:
            "Active Trainers",
          value:
            report.activeTrainers,
        },
        {
          label:
            "Assignments",
          value:
            report.totalAssignments,
        },
        {
          label:
            "Participants",
          value:
            report.totalParticipants,
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Trainer",
          "Code",
          "Email",
          "Batches",
          "Participants",
          "Attendance",
          "Present",
          "Absent",
          "Late",
          "Attendance Rate",
          "Assessments",
          "Pass Rate",
          "Certificates",
          "Status",
        ],
      ],

      body:
        report.results.items.map(
          (item) => [
            safeText(
              item.trainerName
            ),
            safeText(
              item.trainerCode
            ),
            safeText(
              item.trainerEmail
            ),
            formatNumber(
              item.assignedBatches
            ),
            formatNumber(
              item.totalParticipants
            ),
            formatNumber(
              item.totalAttendanceRecords
            ),
            formatNumber(
              item.presentAttendance
            ),
            formatNumber(
              item.absentAttendance
            ),
            formatNumber(
              item.lateAttendance
            ),
            formatPercentage(
              item.attendanceRate
            ),
            formatNumber(
              item.totalAssessmentAttempts
            ),
            formatPercentage(
              item.assessmentPassRate
            ),
            formatNumber(
              item.totalCertificates
            ),
            item.isActive
              ? "Active"
              : "Inactive",
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 26,
        },
        1: {
          cellWidth: 18,
        },
        2: {
          cellWidth: 35,
        },
        3: {
          cellWidth: 15,
        },
        4: {
          cellWidth: 20,
        },
        5: {
          cellWidth: 18,
        },
        6: {
          cellWidth: 15,
        },
        7: {
          cellWidth: 15,
        },
        8: {
          cellWidth: 15,
        },
        9: {
          cellWidth: 20,
        },
        10: {
          cellWidth: 18,
        },
        11: {
          cellWidth: 18,
        },
        12: {
          cellWidth: 18,
        },
        13: {
          cellWidth: 18,
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   SERVICE REQUESTS
========================================================= */

function generateServiceRequestPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  report: ServiceRequestReport,
  filter?: ReportFilter
): jsPDF {
  const doc =
    createDocument(
      JsPDF,
      "landscape"
    );

  addHeader(
    doc,
    "service-requests"
  );

  let y =
    addFilters(
      doc,
      filter,
      44
    );

  y += 3;

  y =
    addSummaryCards(
      doc,
      [
        {
          label:
            "Total Requests",
          value:
            report.totalRequests,
        },
        {
          label:
            "Pending",
          value:
            report.pendingRequests,
        },
        {
          label:
            "Approved",
          value:
            report.approvedRequests,
        },
        {
          label:
            "Rejected",
          value:
            report.rejectedRequests,
        },
        {
          label:
            "Reviewed",
          value:
            report.reviewedRequests,
        },
      ],
      y
    );

  addTable(
    autoTable,
    doc,
    {
      head: [
        [
          "Applicant",
          "Email",
          "Service",
          "Code",
          "Category",
          "Training Required",
          "Status",
          "Requested",
          "Reviewed",
          "Reviewer",
          "Resolution",
        ],
      ],

      body:
        report.results.items.map(
          (item) => [
            safeText(
              item.applicantName
            ),
            safeText(
              item.applicantEmail
            ),
            safeText(
              item.serviceName
            ),
            safeText(
              item.serviceCode
            ),
            safeText(
              item.serviceCategory
            ),
            item.requiresTraining
              ? "Yes"
              : "No",
            safeText(
              item.requestStatus
            ),
            formatDateTime(
              item.requestedAt
            ),
            formatDateTime(
              item.reviewedAt
            ),
            safeText(
              item.reviewerName
            ),
            safeText(
              item.resolutionType
            ),
          ]
        ),

      orientation:
        "landscape",

      columnStyles: {
        0: {
          cellWidth: 25,
        },
        1: {
          cellWidth: 37,
        },
        2: {
          cellWidth: 29,
        },
        3: {
          cellWidth: 17,
        },
        4: {
          cellWidth: 24,
        },
        5: {
          cellWidth: 21,
        },
        6: {
          cellWidth: 20,
        },
        7: {
          cellWidth: 25,
        },
        8: {
          cellWidth: 25,
        },
        9: {
          cellWidth: 25,
        },
        10: {
          cellWidth: 23,
        },
      },
    },
    y
  );

  return doc;
}

/* =========================================================
   BUILD REPORT
========================================================= */

export function buildReportPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  {
    reportType,
    report,
    filter,
  }: ExportReportPdfOptions
): jsPDF {
  switch (reportType) {
    case "overview":
      return generateOverviewPdf(
        JsPDF,
        autoTable,
        report as AdminReportOverview,
        filter
      );

    case "training-completion":
      return generateTrainingCompletionPdf(
        JsPDF,
        autoTable,
        report as TrainingCompletionReport,
        filter
      );

    case "enrollments":
      return generateEnrollmentPdf(
        JsPDF,
        autoTable,
        report as EnrollmentReport,
        filter
      );

    case "attendance":
      return generateAttendancePdf(
        JsPDF,
        autoTable,
        report as AttendanceReport,
        filter
      );

    case "assessment-results":
      return generateAssessmentResultsPdf(
        JsPDF,
        autoTable,
        report as AssessmentResultsReport,
        filter
      );

    /*
     * ======================================================
     * GRADE CALCULATION
     * ======================================================
     */

    case "grade-calculation":
      return generateGradeCalculationPdf(
        JsPDF,
        autoTable,
        report as GradeCalculationReport,
        filter
      );

    case "certificates":
      return generateCertificatePdf(
        JsPDF,
        autoTable,
        report as CertificateReport,
        filter
      );

    case "trainers":
      return generateTrainerPdf(
        JsPDF,
        autoTable,
        report as TrainerReport,
        filter
      );

    case "service-requests":
      return generateServiceRequestPdf(
        JsPDF,
        autoTable,
        report as ServiceRequestReport,
        filter
      );

    default:
      throw new Error(
        `Unsupported report type: ${String(
          reportType
        )}`
      );
  }
}

/* =========================================================
   GENERATE BLOB
========================================================= */

export function generateReportPdfBlob(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  options: ExportReportPdfOptions
): Blob {
  const doc =
    buildReportPdf(
      JsPDF,
      autoTable,
      options
    );

  addFooter(doc);

  return doc.output(
    "blob"
  );
}

/* =========================================================
   GENERATE ARRAY BUFFER
========================================================= */

export function generateReportPdfArrayBuffer(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  options: ExportReportPdfOptions
): ArrayBuffer {
  const doc =
    buildReportPdf(
      JsPDF,
      autoTable,
      options
    );

  addFooter(doc);

  return doc.output(
    "arraybuffer"
  );
}

/* =========================================================
   EXPORT / DOWNLOAD
========================================================= */

export function exportReportPdf(
  JsPDF: JsPdfConstructor,
  autoTable: AutoTableFunction,
  options: ExportReportPdfOptions
): void {
  const doc =
    buildReportPdf(
      JsPDF,
      autoTable,
      options
    );

  addFooter(doc);

  doc.save(
    getReportPdfFilename(
      options.reportType
    )
  );
}