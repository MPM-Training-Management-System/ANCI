"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PageSection,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import type {
  ReportFilter,
  ReportType,
  TrainingCompletionReportItem,
  EnrollmentReportItem,
  AttendanceReportItem,
  AssessmentResultsReportItem,
  CertificateReportItem,
  TrainerReportItem,
  ServiceRequestReportItem,
} from "@repo/types";

import {
  useReports,
  useTrainingGrade,
} from "@repo/hooks";

import {
  api,
  reportApi,
} from "@/lib/api";

import ReportExportButton from "@/components/reports/ReportExportButton";

// =========================================================
// REPORT TABS
// =========================================================

const reportTabs: {
  id: ReportType;
  label: string;
  description: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
    description:
      "Overall system performance and activity summary.",
  },
  {
    id: "training-completion",
    label: "Training Completion",
    description:
      "Monitor participant training completion and certification.",
  },
  {
    id: "enrollments",
    label: "Enrollments",
    description:
      "Review enrollment activity and participant admissions.",
  },
  {
    id: "attendance",
    label: "Attendance",
    description:
      "Monitor participant attendance and attendance rates.",
  },
  {
    id: "assessment-results",
    label: "Assessment Results",
    description:
      "Review written assessment performance and results.",
  },
  {
    id: "grade-calculation",
    label: "Grade Calculation",
    description:
      "Review computed training grades, passing results, and participant performance.",
  },
  {
    id: "certificates",
    label: "Certificates",
    description:
      "Monitor issued, active, and revoked certificates.",
  },
  {
    id: "trainers",
    label: "Trainer Reports",
    description:
      "Review trainer assignments and training performance.",
  },
  {
    id: "service-requests",
    label: "Service Requests",
    description:
      "Monitor requests submitted for ACE NextGen services.",
  },
];

// =========================================================
// PAGE
// =========================================================

export default function ReportsPage() {
  // =======================================================
  // NORMAL REPORT HOOK
  // =======================================================

  const {
    overview,
    trainingCompletion,
    enrollments,
    attendance,
    assessmentResults,
    certificates,
    trainers,
    serviceRequests,

    loading,
    error,

    getOverview,
    getTrainingCompletion,
    getEnrollments,
    getAttendance,
    getAssessmentResults,
    getCertificates,
    getTrainers,
    getServiceRequests,
  } = useReports(reportApi);

  // =======================================================
  // GRADE CALCULATION HOOK
  // =======================================================

  const {
    grades,
    isLoading: gradeLoading,
    error: gradeError,
    loadAllGrades,
  } = useTrainingGrade(api);

  // =======================================================
  // STATE
  // =======================================================

  const [activeReport, setActiveReport] =
    useState<ReportType>("overview");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [page, setPage] =
    useState(1);

  // Grade-specific batch filter
  const [gradeBatchFilter, setGradeBatchFilter] =
    useState("all");

  const pageSize = 10;

  // =======================================================
  // INITIAL OVERVIEW
  // =======================================================

  useEffect(() => {
    getOverview().catch(() => {
      // handled by hook
    });
  }, [getOverview]);

  // =======================================================
  // LOAD ACTIVE REPORT
  // =======================================================

  useEffect(() => {
    setPage(1);
    setSearch("");
    setStatus("All");
    setDateFrom("");
    setDateTo("");
    setGradeBatchFilter("all");

    // -------------------------------------------------------
    // OVERVIEW
    // -------------------------------------------------------

    if (activeReport === "overview") {
      getOverview().catch(() => {});
      return;
    }

    // -------------------------------------------------------
    // GRADE CALCULATION
    // -------------------------------------------------------

    if (activeReport === "grade-calculation") {
      loadAllGrades().catch(() => {});
      return;
    }

    // -------------------------------------------------------
    // NORMAL REPORT FILTER
    // -------------------------------------------------------

    const filter: ReportFilter = {
      page: 1,
      pageSize,
    };

    if (activeReport === "training-completion") {
      getTrainingCompletion(filter).catch(() => {});
      return;
    }

    if (activeReport === "enrollments") {
      getEnrollments(filter).catch(() => {});
      return;
    }

    if (activeReport === "attendance") {
      getAttendance(filter).catch(() => {});
      return;
    }

    if (activeReport === "assessment-results") {
      getAssessmentResults(filter).catch(() => {});
      return;
    }

    if (activeReport === "certificates") {
      getCertificates(filter).catch(() => {});
      return;
    }

    if (activeReport === "trainers") {
      getTrainers(filter).catch(() => {});
      return;
    }

    if (activeReport === "service-requests") {
      getServiceRequests(filter).catch(() => {});
    }
  }, [
    activeReport,
    getOverview,
    getTrainingCompletion,
    getEnrollments,
    getAttendance,
    getAssessmentResults,
    getCertificates,
    getTrainers,
    getServiceRequests,
    loadAllGrades,
  ]);

  // =======================================================
  // ACTIVE TAB
  // =======================================================

  const activeTab = reportTabs.find(
    tab => tab.id === activeReport
  );

  // =======================================================
  // IS GRADE REPORT
  // =======================================================

  const isGradeReport =
    activeReport === "grade-calculation";

  // =======================================================
  // GRADE BATCHES
  // =======================================================

  const gradeBatches = useMemo(() => {
    return Array.from(
      new Set(
        (grades ?? [])
          .map(
            (grade: any) =>
              grade.batchCode
          )
          .filter(Boolean)
      )
    ).sort();
  }, [grades]);

  // =======================================================
  // FILTERED GRADES
  // =======================================================

  const filteredGrades = useMemo(() => {
    const keyword =
      search
        .trim()
        .toLowerCase();

    return (grades ?? []).filter(
      (grade: any) => {
        const participantName =
          String(
            grade.participantName ??
              ""
          ).toLowerCase();

        const batchCode =
          String(
            grade.batchCode ??
              ""
          ).toLowerCase();

        const matchesSearch =
          !keyword ||
          participantName.includes(
            keyword
          ) ||
          batchCode.includes(
            keyword
          );

        const matchesBatch =
          gradeBatchFilter ===
            "all" ||
          grade.batchCode ===
            gradeBatchFilter;

        return (
          matchesSearch &&
          matchesBatch
        );
      }
    );
  }, [
    grades,
    search,
    gradeBatchFilter,
  ]);

  // =======================================================
  // GRADE STATISTICS
  // =======================================================

  const gradeTotalParticipants =
    filteredGrades.length;

  const gradePassedCount =
    filteredGrades.filter(
      (grade: any) =>
        Boolean(grade.isPassed)
    ).length;

  const gradeFailedCount =
    gradeTotalParticipants -
    gradePassedCount;

  const gradeAverage =
    gradeTotalParticipants > 0
      ? filteredGrades.reduce(
          (
            sum: number,
            grade: any
          ) =>
            sum +
            Number(
              grade.overallGrade ??
                0
            ),
          0
        ) /
        gradeTotalParticipants
      : 0;

  // =======================================================
  // GRADE REPORT DATA FOR PDF
  // =======================================================

  const gradeReportData = useMemo(() => {
    if (!isGradeReport) {
      return null;
    }

    return {
      reportType:
        "grade-calculation",

      totalParticipants:
        gradeTotalParticipants,

      passedCount:
        gradePassedCount,

      failedCount:
        gradeFailedCount,

      averageGrade:
        gradeAverage,

      results: {
        items: filteredGrades,
        page: 1,
        pageSize:
          filteredGrades.length || 1,
        totalCount:
          filteredGrades.length,
        totalPages: 1,
      },
    };
  }, [
    isGradeReport,
    gradeTotalParticipants,
    gradePassedCount,
    gradeFailedCount,
    gradeAverage,
    filteredGrades,
  ]);

  // =======================================================
  // FILTER OPTIONS
  // =======================================================

  const statusOptions = useMemo(() => {
    switch (activeReport) {
      case "training-completion":
        return [
          "All",
          "Completed",
          "Incomplete",
        ];

      case "enrollments":
        return [
          "All",
          "Approved",
          "Pending",
          "Rejected",
        ];

      case "attendance":
        return [
          "All",
          "Present",
          "Absent",
          "Late",
        ];

      case "assessment-results":
        return [
          "All",
          "Passed",
          "Failed",
          "Pending",
        ];

      case "certificates":
        return [
          "All",
          "Completion",
          "Participation",
          "Revoked",
        ];

      case "trainers":
        return [
          "All",
          "Active",
          "Inactive",
        ];

      case "service-requests":
        return [
          "All",
          "Pending",
          "Approved",
          "Rejected",
        ];

      default:
        return ["All"];
    }
  }, [activeReport]);

  // =======================================================
  // CURRENT FILTER
  // =======================================================

  const currentFilter = useMemo<ReportFilter>(() => {
    const filter: ReportFilter = {
      page,
      pageSize,
    };

    if (search.trim()) {
      filter.search =
        search.trim();
    }

    if (
      !isGradeReport &&
      status !== "All"
    ) {
      filter.status =
        status;
    }

    if (
      !isGradeReport &&
      dateFrom
    ) {
      filter.dateFrom =
        dateFrom;
    }

    if (
      !isGradeReport &&
      dateTo
    ) {
      filter.dateTo =
        dateTo;
    }

    return filter;
  }, [
    page,
    pageSize,
    search,
    status,
    dateFrom,
    dateTo,
    isGradeReport,
  ]);

  // =======================================================
  // CURRENT REPORT DATA FOR PDF
  // =======================================================

  const currentReportData = useMemo(() => {
    switch (activeReport) {
      case "overview":
        return overview;

      case "training-completion":
        return trainingCompletion;

      case "enrollments":
        return enrollments;

      case "attendance":
        return attendance;

      case "assessment-results":
        return assessmentResults;

      case "grade-calculation":
        return gradeReportData;

      case "certificates":
        return certificates;

      case "trainers":
        return trainers;

      case "service-requests":
        return serviceRequests;

      default:
        return null;
    }
  }, [
    activeReport,
    overview,
    trainingCompletion,
    enrollments,
    attendance,
    assessmentResults,
    gradeReportData,
    certificates,
    trainers,
    serviceRequests,
  ]);

  // =======================================================
  // CURRENT REPORT TITLE
  // =======================================================

  const currentReportTitle =
    activeTab?.label ??
    "Report";

  // =======================================================
  // APPLY FILTER
  // =======================================================

  function applyFilters() {
    // Grade Calculation uses client-side filtering.
    if (activeReport === "grade-calculation") {
      setPage(1);
      return;
    }

    const filter: ReportFilter = {
      ...currentFilter,
      page: 1,
      pageSize,
    };

    setPage(1);

    if (
      activeReport ===
      "training-completion"
    ) {
      getTrainingCompletion(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "enrollments"
    ) {
      getEnrollments(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "attendance"
    ) {
      getAttendance(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "assessment-results"
    ) {
      getAssessmentResults(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "certificates"
    ) {
      getCertificates(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "trainers"
    ) {
      getTrainers(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "service-requests"
    ) {
      getServiceRequests(
        filter
      ).catch(() => {});
    }
  }

  // =======================================================
  // CLEAR FILTERS
  // =======================================================

  function clearFilters() {
    setSearch("");
    setStatus("All");
    setDateFrom("");
    setDateTo("");
    setGradeBatchFilter("all");
    setPage(1);

    // Grade Calculation is client-side.
    if (activeReport === "grade-calculation") {
      return;
    }

    const filter: ReportFilter = {
      page: 1,
      pageSize,
    };

    if (
      activeReport ===
      "training-completion"
    ) {
      getTrainingCompletion(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "enrollments"
    ) {
      getEnrollments(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "attendance"
    ) {
      getAttendance(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "assessment-results"
    ) {
      getAssessmentResults(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "certificates"
    ) {
      getCertificates(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "trainers"
    ) {
      getTrainers(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "service-requests"
    ) {
      getServiceRequests(
        filter
      ).catch(() => {});
    }
  }

  // =======================================================
  // PAGINATION
  // =======================================================

  function goToPage(
    nextPage: number
  ) {
    // Grade Calculation has no server pagination.
    if (
      activeReport ===
      "grade-calculation"
    ) {
      return;
    }

    const filter: ReportFilter = {
      ...currentFilter,
      page: nextPage,
      pageSize,
    };

    setPage(nextPage);

    if (
      activeReport ===
      "training-completion"
    ) {
      getTrainingCompletion(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "enrollments"
    ) {
      getEnrollments(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "attendance"
    ) {
      getAttendance(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "assessment-results"
    ) {
      getAssessmentResults(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "certificates"
    ) {
      getCertificates(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "trainers"
    ) {
      getTrainers(
        filter
      ).catch(() => {});
      return;
    }

    if (
      activeReport ===
      "service-requests"
    ) {
      getServiceRequests(
        filter
      ).catch(() => {});
    }
  }

  // =======================================================
  // CURRENT PAGINATION
  // =======================================================

  const currentPagination =
    activeReport ===
    "training-completion"
      ? trainingCompletion?.results
      : activeReport ===
          "enrollments"
        ? enrollments?.results
        : activeReport ===
            "attendance"
          ? attendance?.results
          : activeReport ===
              "assessment-results"
            ? assessmentResults?.results
            : activeReport ===
                "certificates"
              ? certificates?.results
              : activeReport ===
                  "trainers"
                ? trainers?.results
                : activeReport ===
                    "service-requests"
                  ? serviceRequests?.results
                  : null;

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <PageSection
        title="Reports & Analytics"
        description="View training, enrollment, attendance, assessment, grade, certificate, trainer, and service request reports across the ACE NextGen platform."
      />

      {/* =================================================
          ERROR
      ================================================= */}

      {error &&
        !isGradeReport && (
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              Unable to load report
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        )}

      {isGradeReport &&
        gradeError && (
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              Unable to load grade calculation
            </p>

            <p className="mt-1 text-xs text-red-600">
              {gradeError}
            </p>
          </div>
        )}

      {/* =================================================
          REPORT NAVIGATION
      ================================================= */}

      <div className="rounded-2xl bg-white p-2 shadow-sm">
        <div className="flex gap-1 overflow-x-auto">

          {reportTabs.map(tab => {
            const active =
              activeReport ===
              tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveReport(
                    tab.id
                  )
                }
                className={
                  active
                    ? "whitespace-nowrap rounded-xl bg-[#002b5c] px-4 py-2.5 text-xs font-semibold text-white transition"
                    : "whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-500 transition hover:bg-[#eef4f8] hover:text-[#002b5c]"
                }
              >
                {tab.label}
              </button>
            );
          })}

        </div>
      </div>

      {/* =================================================
          ACTIVE REPORT DESCRIPTION + EXPORT
      ================================================= */}

      {activeTab && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {activeTab.label}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {activeTab.description}
            </p>
          </div>

          {/* =============================================
              EXPORT PDF
          ============================================= */}

          <ReportExportButton
            reportType={
              activeReport
            }
            label={
              currentReportTitle
            }
            report={
              currentReportData as any
            }
            filter={
              currentFilter
            }
          />

        </div>
      )}

      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeReport ===
        "overview" && (
        <OverviewReport
          overview={
            overview
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          FILTERS
      ================================================= */}

      {activeReport !==
        "overview" && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4">

            {/* ===========================================
                MAIN FILTER ROW
            =========================================== */}

            <div
              className={
                isGradeReport
                  ? "grid gap-3 lg:grid-cols-[1fr_auto_auto]"
                  : "grid gap-3 lg:grid-cols-[1fr_auto_auto]"
              }
            >

              {/* =========================================
                  SEARCH
              ========================================= */}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Search
                </label>

                <input
                  value={
                    search
                  }
                  onChange={event =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  onKeyDown={event => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      applyFilters();
                    }
                  }}
                  placeholder={
                    isGradeReport
                      ? "Search participant or batch..."
                      : activeReport ===
                          "trainers"
                        ? "Search trainer..."
                        : activeReport ===
                            "service-requests"
                          ? "Search applicant or service..."
                          : "Search participant, training, or batch..."
                  }
                  className="mt-2 h-10 w-full rounded-xl bg-gray-50 px-3 text-xs text-gray-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#6FD1D7]/40"
                />
              </div>

              {/* =========================================
                  GRADE BATCH FILTER
              ========================================= */}

              {isGradeReport ? (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Batch
                  </label>

                  <Select
                    value={
                      gradeBatchFilter
                    }
                    onValueChange={
                      setGradeBatchFilter
                    }
                  >
                    <SelectTrigger className="mt-2 h-10 w-full min-w-48">
                      <SelectValue placeholder="All Batches" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="all">
                        All Batches
                      </SelectItem>

                      {gradeBatches.map(
                        batch => (
                          <SelectItem
                            key={
                              batch
                            }
                            value={
                              batch
                            }
                          >
                            {batch}
                          </SelectItem>
                        )
                      )}

                    </SelectContent>
                  </Select>
                </div>
              ) : (
                /* =======================================
                   NORMAL STATUS FILTER
                ======================================= */

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Status
                  </label>

                  <Select
                    value={
                      status
                    }
                    onValueChange={
                      setStatus
                    }
                  >
                    <SelectTrigger className="mt-2 h-10 w-full min-w-40">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {statusOptions.map(
                        option => (
                          <SelectItem
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {
                              option
                            }
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* =========================================
                  ACTION BUTTONS
              ========================================= */}

              <div className="flex items-end gap-2">

                <button
                  type="button"
                  onClick={
                    applyFilters
                  }
                  className="h-10 rounded-xl bg-[#002b5c] px-5 text-xs font-semibold text-white transition hover:bg-[#0d2142]"
                >
                  Apply
                </button>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="h-10 rounded-xl bg-gray-100 px-5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
                >
                  Clear
                </button>

              </div>

            </div>

            {/* ===========================================
                DATE FILTERS
            =========================================== */}

            {!isGradeReport && (
              <div className="grid gap-3 sm:grid-cols-2 lg:max-w-md">

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Date From
                  </label>

                  <input
                    type="date"
                    value={
                      dateFrom
                    }
                    onChange={event =>
                      setDateFrom(
                        event.target
                          .value
                      )
                    }
                    className="mt-2 h-10 w-full rounded-xl bg-gray-50 px-3 text-xs text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#6FD1D7]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Date To
                  </label>

                  <input
                    type="date"
                    value={
                      dateTo
                    }
                    onChange={event =>
                      setDateTo(
                        event.target
                          .value
                      )
                    }
                    className="mt-2 h-10 w-full rounded-xl bg-gray-50 px-3 text-xs text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#6FD1D7]/40"
                  />
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* =================================================
          TRAINING COMPLETION
      ================================================= */}

      {activeReport ===
        "training-completion" && (
        <TrainingCompletionReport
          data={
            trainingCompletion
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          ENROLLMENTS
      ================================================= */}

      {activeReport ===
        "enrollments" && (
        <EnrollmentReport
          data={
            enrollments
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          ATTENDANCE
      ================================================= */}

      {activeReport ===
        "attendance" && (
        <AttendanceReport
          data={
            attendance
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          ASSESSMENT RESULTS
      ================================================= */}

      {activeReport ===
        "assessment-results" && (
        <AssessmentResultsReport
          data={
            assessmentResults
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          GRADE CALCULATION
      ================================================= */}

      {activeReport ===
        "grade-calculation" && (
        <GradeCalculationReport
          grades={
            filteredGrades
          }
          loading={
            gradeLoading
          }
          totalParticipants={
            gradeTotalParticipants
          }
          passedCount={
            gradePassedCount
          }
          failedCount={
            gradeFailedCount
          }
          averageGrade={
            gradeAverage
          }
        />
      )}

      {/* =================================================
          CERTIFICATES
      ================================================= */}

      {activeReport ===
        "certificates" && (
        <CertificateReport
          data={
            certificates
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          TRAINERS
      ================================================= */}

      {activeReport ===
        "trainers" && (
        <TrainerReport
          data={
            trainers
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          SERVICE REQUESTS
      ================================================= */}

      {activeReport ===
        "service-requests" && (
        <ServiceRequestReport
          data={
            serviceRequests
          }
          loading={
            loading
          }
        />
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {activeReport !==
        "overview" &&
        !isGradeReport &&
        currentPagination &&
        currentPagination.totalPages >
          1 && (
          <Pagination
            page={
              currentPagination.page
            }
            totalPages={
              currentPagination.totalPages
            }
            totalCount={
              currentPagination.totalCount
            }
            pageSize={
              currentPagination.pageSize
            }
            onPageChange={
              goToPage
            }
          />
        )}

    </div>
  );
}

// =========================================================
// OVERVIEW REPORT
// =========================================================

function OverviewReport({
  overview,
  loading,
}: {
  overview: any;
  loading: boolean;
}) {
  if (loading && !overview) {
    return (
      <LoadingState text="Loading report overview..." />
    );
  }

  if (!overview) {
    return (
      <EmptyState
        title="No overview data"
        description="Report overview data is currently unavailable."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Training Programs"
          value={
            overview.totalTrainingPrograms
          }
          description={`${overview.activeTrainingPrograms} active programs`}
        />

        <StatCard
          variant="primary"
          title="Training Batches"
          value={
            overview.totalTrainingBatches
          }
          description="Total training batches"
        />

        <StatCard
          variant="success"
          title="Participants"
          value={
            overview.totalParticipants
          }
          description={`${overview.totalEnrollments} total enrollments`}
        />

        <StatCard
          variant="warning"
          title="Attendance Rate"
          value={`${overview.attendanceRate.toFixed(1)}%`}
          description={`${overview.presentAttendance} present records`}
        />

      </StatGrid>

      <div className="grid gap-6 xl:grid-cols-2">

        <ReportCard
          title="Attendance Summary"
          description="Overall attendance distribution."
        >
          <DistributionBars
            items={[
              {
                label: "Present",
                value:
                  overview.presentAttendance,
                total:
                  overview.totalAttendanceRecords,
                variant:
                  "success",
              },
              {
                label: "Late",
                value:
                  overview.lateAttendance,
                total:
                  overview.totalAttendanceRecords,
                variant:
                  "warning",
              },
              {
                label: "Absent",
                value:
                  overview.absentAttendance,
                total:
                  overview.totalAttendanceRecords,
                variant:
                  "danger",
              },
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Certificates"
          description="Certificate issuance summary."
        >
          <DistributionBars
            items={[
              {
                label: "Completion",
                value:
                  overview.completionCertificates,
                total:
                  overview.totalCertificates,
                variant:
                  "success",
              },
              {
                label: "Participation",
                value:
                  overview.participationCertificates,
                total:
                  overview.totalCertificates,
                variant:
                  "primary",
              },
              {
                label: "Revoked",
                value:
                  overview.revokedCertificates,
                total:
                  overview.totalCertificates,
                variant:
                  "danger",
              },
            ]}
          />
        </ReportCard>

      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        <ReportCard
          title="Assessment Activity"
          description="Written assessment activity across training batches."
        >
          <div className="grid grid-cols-2 gap-3">

            <MiniMetric
              label="Assessments"
              value={
                overview.totalWrittenAssessments
              }
            />

            <MiniMetric
              label="Published"
              value={
                overview.publishedWrittenAssessments
              }
            />

            <MiniMetric
              label="Attempts"
              value={
                overview.totalAssessmentAttempts
              }
            />

            <MiniMetric
              label="Trainers"
              value={
                overview.totalTrainers
              }
            />

          </div>
        </ReportCard>

        <ReportCard
          title="Services"
          description="Service and service request activity."
        >
          <div className="grid grid-cols-2 gap-3">

            <MiniMetric
              label="Total Services"
              value={
                overview.totalServices
              }
            />

            <MiniMetric
              label="Active Services"
              value={
                overview.activeServices
              }
            />

            <MiniMetric
              label="Service Requests"
              value={
                overview.totalServiceRequests
              }
            />

            <MiniMetric
              label="Active Enrollments"
              value={
                overview.activeEnrollments
              }
            />

          </div>
        </ReportCard>

      </div>

    </div>
  );
}

// =========================================================
// TRAINING COMPLETION
// =========================================================

function TrainingCompletionReport({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <LoadingState text="Loading training completion report..." />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No training completion data"
        description="There is currently no training completion data available."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Participants"
          value={
            data.totalParticipants
          }
          description="Participants included in report"
        />

        <StatCard
          variant="success"
          title="Completed"
          value={
            data.completedParticipants
          }
          description="Completed training"
        />

        <StatCard
          variant="warning"
          title="Incomplete"
          value={
            data.incompleteParticipants
          }
          description="Training still incomplete"
        />

        <StatCard
          variant="primary"
          title="Completion Rate"
          value={`${data.completionRate.toFixed(1)}%`}
          description="Overall completion rate"
        />

      </StatGrid>

      <ReportTable
        headers={[
          "Participant",
          "Training",
          "Batch",
          "Trainer",
          "Attendance",
          "Assessment",
          "Completion",
          "Certificate",
        ]}
        rows={
          data.results.items.map(
            (
              item: TrainingCompletionReportItem
            ) => [
              <div key="participant">
                <p className="font-semibold text-gray-900">
                  {
                    item.participantName
                  }
                </p>
                <p className="mt-1 font-mono text-[10px] text-gray-400">
                  {
                    item.participantCode ??
                    "—"
                  }
                </p>
              </div>,

              <span key="training">
                {
                  item.trainingProgramName
                }
              </span>,

              <span
                key="batch"
                className="font-mono text-xs"
              >
                {item.batchCode}
              </span>,

              <span key="trainer">
                {
                  item.trainerName ??
                  "Unassigned"
                }
              </span>,

              <StatusBadge
                key="attendance"
                label={`${item.attendanceRate.toFixed(1)}%`}
                variant={
                  item.attendanceRate >=
                  80
                    ? "success"
                    : "warning"
                }
              />,

              <StatusBadge
                key="assessment"
                label={
                  item.assessmentStatus
                }
                variant={
                  item.assessmentStatus ===
                  "Passed"
                    ? "success"
                    : item.assessmentStatus ===
                        "Failed"
                      ? "danger"
                      : "neutral"
                }
              />,

              <StatusBadge
                key="completion"
                label={
                  item.completionStatus
                }
                variant={
                  item.completionStatus ===
                  "Completed"
                    ? "success"
                    : "warning"
                }
              />,

              <span key="certificate">
                {item.hasCertificate
                  ? item.certificateNumber ??
                    "Issued"
                  : "Not issued"}
              </span>,
            ]
          )
        }
      />

    </div>
  );
}

// =========================================================
// ENROLLMENT REPORT
// =========================================================

function EnrollmentReport({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <LoadingState text="Loading enrollment report..." />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No enrollment data"
        description="There is currently no enrollment data available."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Enrollments"
          value={
            data.totalEnrollments
          }
          description="Enrollment records"
        />

        <StatCard
          variant="success"
          title="Approved"
          value={
            data.approvedEnrollments
          }
          description="Approved enrollments"
        />

        <StatCard
          variant="warning"
          title="Pending"
          value={
            data.pendingEnrollments
          }
          description="Waiting for review"
        />

        <StatCard
          variant="danger"
          title="Rejected"
          value={
            data.rejectedEnrollments
          }
          description="Rejected enrollments"
        />

      </StatGrid>

      <ReportTable
        headers={[
          "Participant",
          "Training",
          "Batch",
          "Trainer",
          "Status",
          "Enrolled",
          "Approved",
        ]}
        rows={
          data.results.items.map(
            (
              item: EnrollmentReportItem
            ) => [
              <div key="participant">
                <p className="font-semibold text-gray-900">
                  {
                    item.participantName
                  }
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {
                    item.participantEmail
                  }
                </p>
              </div>,

              item.trainingProgramName,

              <span
                key="batch"
                className="font-mono text-xs"
              >
                {item.batchCode}
              </span>,

              item.trainerName ??
                "Unassigned",

              <StatusBadge
                key="status"
                label={
                  item.enrollmentStatus
                }
                variant={
                  item.enrollmentStatus ===
                  "Approved"
                    ? "success"
                    : item.enrollmentStatus ===
                        "Rejected"
                      ? "danger"
                      : "warning"
                }
              />,

              formatDate(
                item.enrolledAt
              ),

              item.approvedAt
                ? formatDate(
                    item.approvedAt
                  )
                : "—",
            ]
          )
        }
      />

    </div>
  );
}

// =========================================================
// ATTENDANCE REPORT
// =========================================================

function AttendanceReport({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <LoadingState text="Loading attendance report..." />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No attendance data"
        description="There is currently no attendance data available."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Records"
          value={
            data.totalRecords
          }
          description="Attendance records"
        />

        <StatCard
          variant="success"
          title="Present"
          value={
            data.presentRecords
          }
          description="Present records"
        />

        <StatCard
          variant="warning"
          title="Late"
          value={
            data.lateRecords
          }
          description="Late records"
        />

        <StatCard
          variant="danger"
          title="Absent"
          value={
            data.absentRecords
          }
          description={`${data.attendanceRate.toFixed(1)}% attendance rate`}
        />

      </StatGrid>

      <ReportCard
        title="Attendance Distribution"
        description="Attendance status distribution across all records."
      >
        <DistributionBars
          items={[
            {
              label: "Present",
              value:
                data.presentRecords,
              total:
                data.totalRecords,
              variant:
                "success",
            },
            {
              label: "Late",
              value:
                data.lateRecords,
              total:
                data.totalRecords,
              variant:
                "warning",
            },
            {
              label: "Absent",
              value:
                data.absentRecords,
              total:
                data.totalRecords,
              variant:
                "danger",
            },
          ]}
        />
      </ReportCard>

      <ReportTable
        headers={[
          "Participant",
          "Training",
          "Batch",
          "Trainer",
          "Date",
          "Time In",
          "Time Out",
          "Status",
          "Method",
        ]}
        rows={
          data.results.items.map(
            (
              item: AttendanceReportItem
            ) => [
              <div key="participant">
                <p className="font-semibold text-gray-900">
                  {
                    item.participantName
                  }
                </p>
                <p className="mt-1 font-mono text-[10px] text-gray-400">
                  {
                    item.participantCode
                  }
                </p>
              </div>,

              item.trainingProgramName,

              <span
                key="batch"
                className="font-mono text-xs"
              >
                {item.batchCode}
              </span>,

              item.trainerName ??
                "Unassigned",

              formatDateOnly(
                item.attendanceDate
              ),

              formatTime(
                item.timeIn
              ),

              formatTime(
                item.timeOut
              ),

              <StatusBadge
                key="status"
                label={
                  item.attendanceStatus
                }
                variant={
                  item.attendanceStatus ===
                  "Present"
                    ? "success"
                    : item.attendanceStatus ===
                        "Late"
                      ? "warning"
                      : "danger"
                }
              />,

              item.attendanceMethod ||
                "—",
            ]
          )
        }
      />

    </div>
  );
}

// =========================================================
// ASSESSMENT REPORT
// =========================================================

function AssessmentResultsReport({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <LoadingState text="Loading assessment results..." />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No assessment results"
        description="There is currently no assessment result data available."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Attempts"
          value={
            data.totalAttempts
          }
          description="Assessment attempts"
        />

        <StatCard
          variant="success"
          title="Passed"
          value={
            data.passedAttempts
          }
          description="Passed attempts"
        />

        <StatCard
          variant="danger"
          title="Failed"
          value={
            data.failedAttempts
          }
          description="Failed attempts"
        />

        <StatCard
          variant="primary"
          title="Average Score"
          value={`${data.averageScore.toFixed(1)}%`}
          description={`${data.passRate.toFixed(1)}% pass rate`}
        />

      </StatGrid>

      <ReportTable
        headers={[
          "Participant",
          "Assessment",
          "Training",
          "Batch",
          "Attempt",
          "Score",
          "Result",
          "Started",
          "Submitted",
        ]}
        rows={
          data.results.items.map(
            (
              item: AssessmentResultsReportItem
            ) => [
              <div key="participant">
                <p className="font-semibold text-gray-900">
                  {
                    item.participantName
                  }
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {
                    item.participantCode
                  }
                </p>
              </div>,

              item.assessmentTitle,

              item.trainingProgramName,

              <span
                key="batch"
                className="font-mono text-xs"
              >
                {item.batchCode}
              </span>,

              `Attempt ${item.attemptNumber}`,

              <span
                key="score"
                className="font-semibold"
              >
                {item.percentage.toFixed(
                  1
                )}
                %
              </span>,

              <StatusBadge
                key="result"
                label={
                  item.assessmentStatus
                }
                variant={
                  item.isPassed
                    ? "success"
                    : item.assessmentStatus ===
                        "Failed"
                      ? "danger"
                      : "warning"
                }
              />,

              formatDate(
                item.startedAt
              ),

              item.submittedAt
                ? formatDate(
                    item.submittedAt
                  )
                : "Not submitted",
            ]
          )
        }
      />

    </div>
  );
}

// =========================================================
// GRADE CALCULATION REPORT
// =========================================================

function GradeCalculationReport({
  grades,
  loading,
  totalParticipants,
  passedCount,
  failedCount,
  averageGrade,
}: {
  grades: any[];
  loading: boolean;
  totalParticipants: number;
  passedCount: number;
  failedCount: number;
  averageGrade: number;
}) {
  if (loading) {
    return (
      <LoadingState text="Loading grade calculation report..." />
    );
  }

  return (
    <div className="space-y-6">

      {/* ================================================
          GRADE SUMMARY
      ================================================= */}

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Participants"
          value={
            totalParticipants
          }
          description="Participants with calculated grades"
        />

        <StatCard
          variant="success"
          title="Passed"
          value={
            passedCount
          }
          description="Participants who passed"
        />

        <StatCard
          variant="danger"
          title="Failed"
          value={
            failedCount
          }
          description="Participants who failed"
        />

        <StatCard
          variant="primary"
          title="Average Grade"
          value={
            averageGrade.toFixed(
              2
            )
          }
          description="Average overall grade"
        />

      </StatGrid>

      {/* ================================================
          GRADE TABLE
      ================================================= */}

      {grades.length === 0 ? (
        <EmptyState
          title="No grade records found"
          description="There are no grade calculation records matching the current filters."
        />
      ) : (
        <ReportTable
          headers={[
            "Participant",
            "Batch",
            "Overall Grade",
            "Result",
          ]}
          rows={
            grades.map(
              (
                grade: any
              ) => [
                <div
                  key="participant"
                >
                  <p className="font-semibold text-gray-900">
                    {
                      grade.participantName ??
                      "Unknown Participant"
                    }
                  </p>

                  {grade.participantCode && (
                    <p className="mt-1 font-mono text-[10px] text-gray-400">
                      {
                        grade.participantCode
                      }
                    </p>
                  )}
                </div>,

                <span
                  key="batch"
                  className="font-mono text-xs"
                >
                  {
                    grade.batchCode ??
                    "—"
                  }
                </span>,

                <span
                  key="grade"
                  className="font-semibold text-[#002b5c]"
                >
                  {Number(
                    grade.overallGrade ??
                      0
                  ).toFixed(2)}
                </span>,

                <StatusBadge
                  key="result"
                  label={
                    grade.isPassed
                      ? "Passed"
                      : "Failed"
                  }
                  variant={
                    grade.isPassed
                      ? "success"
                      : "danger"
                  }
                />,
              ]
            )
          }
        />
      )}

    </div>
  );
}

// =========================================================
// CERTIFICATE REPORT
// =========================================================

function CertificateReport({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <LoadingState text="Loading certificate report..." />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No certificate data"
        description="There is currently no certificate data available."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Certificates"
          value={
            data.totalCertificates
          }
          description="All generated certificates"
        />

        <StatCard
          variant="success"
          title="Completion"
          value={
            data.completionCertificates
          }
          description="Completion certificates"
        />

        <StatCard
          variant="primary"
          title="Participation"
          value={
            data.participationCertificates
          }
          description="Participation certificates"
        />

        <StatCard
          variant="danger"
          title="Revoked"
          value={
            data.revokedCertificates
          }
          description={`${data.activeCertificates} active certificates`}
        />

      </StatGrid>

      <ReportTable
        headers={[
          "Participant",
          "Certificate",
          "Training",
          "Batch",
          "Type",
          "Issued",
          "Status",
          "Verification",
        ]}
        rows={
          data.results.items.map(
            (
              item: CertificateReportItem
            ) => [
              <div key="participant">
                <p className="font-semibold text-gray-900">
                  {
                    item.participantName
                  }
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {
                    item.participantCode
                  }
                </p>
              </div>,

              <span
                key="certificate"
                className="font-mono text-xs"
              >
                {
                  item.certificateNumber
                }
              </span>,

              item.trainingProgramName,

              <span
                key="batch"
                className="font-mono text-xs"
              >
                {item.batchCode}
              </span>,

              <StatusBadge
                key="type"
                label={
                  item.certificateType
                }
                variant="primary"
              />,

              formatDate(
                item.issuedAt
              ),

              <StatusBadge
                key="status"
                label={
                  item.isRevoked
                    ? "Revoked"
                    : "Active"
                }
                variant={
                  item.isRevoked
                    ? "danger"
                    : "success"
                }
              />,

              <span
                key="verification"
                className="font-mono text-[10px]"
              >
                {
                  item.verificationCode
                }
              </span>,
            ]
          )
        }
      />

    </div>
  );
}

// =========================================================
// TRAINER REPORT
// =========================================================

function TrainerReport({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <LoadingState text="Loading trainer report..." />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No trainer data"
        description="There is currently no trainer report data available."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Trainers"
          value={
            data.totalTrainers
          }
          description="Registered trainers"
        />

        <StatCard
          variant="success"
          title="Active Trainers"
          value={
            data.activeTrainers
          }
          description="Currently active"
        />

        <StatCard
          variant="primary"
          title="Assignments"
          value={
            data.totalAssignments
          }
          description="Trainer batch assignments"
        />

        <StatCard
          variant="warning"
          title="Participants"
          value={
            data.totalParticipants
          }
          description="Participants under trainers"
        />

      </StatGrid>

      <ReportTable
        headers={[
          "Trainer",
          "Assignments",
          "Participants",
          "Attendance",
          "Attendance Rate",
          "Assessments",
          "Pass Rate",
          "Certificates",
          "Status",
        ]}
        rows={
          data.results.items.map(
            (
              item: TrainerReportItem
            ) => [
              <div key="trainer">
                <p className="font-semibold text-gray-900">
                  {
                    item.trainerName
                  }
                </p>
                <p className="mt-1 font-mono text-[10px] text-gray-400">
                  {
                    item.trainerCode
                  }
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {
                    item.trainerEmail
                  }
                </p>
              </div>,

              item.assignedBatches,

              item.totalParticipants,

              <span key="attendance">
                {item.presentAttendance}
                {" / "}
                {item.totalAttendanceRecords}
              </span>,

              <StatusBadge
                key="attendanceRate"
                label={`${item.attendanceRate.toFixed(1)}%`}
                variant={
                  item.attendanceRate >=
                  80
                    ? "success"
                    : "warning"
                }
              />,

              item.totalAssessmentAttempts,

              <StatusBadge
                key="passRate"
                label={`${item.assessmentPassRate.toFixed(1)}%`}
                variant={
                  item.assessmentPassRate >=
                  75
                    ? "success"
                    : "warning"
                }
              />,

              item.totalCertificates,

              <StatusBadge
                key="status"
                label={
                  item.isActive
                    ? "Active"
                    : "Inactive"
                }
                variant={
                  item.isActive
                    ? "success"
                    : "neutral"
                }
              />,
            ]
          )
        }
      />

    </div>
  );
}

// =========================================================
// SERVICE REQUEST REPORT
// =========================================================

function ServiceRequestReport({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <LoadingState text="Loading service request report..." />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No service request data"
        description="There is currently no service request data available."
      />
    );
  }

  return (
    <div className="space-y-6">

      <StatGrid>

        <StatCard
          variant="primary"
          title="Total Requests"
          value={
            data.totalRequests
          }
          description="All service requests"
        />

        <StatCard
          variant="warning"
          title="Pending"
          value={
            data.pendingRequests
          }
          description="Waiting for review"
        />

        <StatCard
          variant="success"
          title="Approved"
          value={
            data.approvedRequests
          }
          description="Approved requests"
        />

        <StatCard
          variant="danger"
          title="Rejected"
          value={
            data.rejectedRequests
          }
          description={`${data.reviewedRequests} reviewed requests`}
        />

      </StatGrid>

      <ReportTable
        headers={[
          "Applicant",
          "Service",
          "Category",
          "Training",
          "Status",
          "Requested",
          "Reviewed",
          "Reviewer",
        ]}
        rows={
          data.results.items.map(
            (
              item: ServiceRequestReportItem
            ) => [
              <div key="applicant">
                <p className="font-semibold text-gray-900">
                  {
                    item.applicantName
                  }
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  {
                    item.applicantEmail
                  }
                </p>
              </div>,

              <div key="service">
                <p className="font-semibold text-gray-800">
                  {
                    item.serviceName
                  }
                </p>
                <p className="mt-1 font-mono text-[10px] text-gray-400">
                  {
                    item.serviceCode
                  }
                </p>
              </div>,

              item.serviceCategory,

              <StatusBadge
                key="training"
                label={
                  item.requiresTraining
                    ? "Required"
                    : "Not Required"
                }
                variant={
                  item.requiresTraining
                    ? "primary"
                    : "neutral"
                }
              />,

              <StatusBadge
                key="status"
                label={
                  item.requestStatus
                }
                variant={
                  item.requestStatus ===
                  "Approved"
                    ? "success"
                    : item.requestStatus ===
                        "Rejected"
                      ? "danger"
                      : "warning"
                }
              />,

              formatDate(
                item.requestedAt
              ),

              item.reviewedAt
                ? formatDate(
                    item.reviewedAt
                  )
                : "Not reviewed",

              item.reviewerName ??
                "—",
            ]
          )
        }
      />

    </div>
  );
}

// =========================================================
// REPORT CARD
// =========================================================

function ReportCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div>
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-xs text-gray-400">
          {description}
        </p>
      </div>

      <div className="mt-5">
        {children}
      </div>

    </div>
  );
}

// =========================================================
// DISTRIBUTION BARS
// =========================================================

function DistributionBars({
  items,
}: {
  items: {
    label: string;
    value: number;
    total: number;
    variant:
      | "primary"
      | "success"
      | "warning"
      | "danger";
  }[];
}) {
  return (
    <div className="space-y-5">

      {items.map(item => {
        const percentage =
          item.total > 0
            ? Math.round(
                (item.value /
                  item.total) *
                  100
              )
            : 0;

        return (
          <div key={item.label}>

            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-gray-600">
                {item.label}
              </span>

              <span className="text-xs font-bold text-gray-900">
                {item.value}

                <span className="ml-1 font-normal text-gray-400">
                  ({percentage}%)
                </span>
              </span>

            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className={
                  `h-full rounded-full transition-all ` +
                  getBarClass(
                    item.variant
                  )
                }
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

          </div>
        );
      })}

    </div>
  );
}

// =========================================================
// MINI METRIC
// =========================================================

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}

// =========================================================
// REPORT TABLE
// =========================================================

function ReportTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No records found"
        description="There are no records matching the current filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[900px] text-left">

          <thead>
            <tr className="bg-gray-50">

              {headers.map(
                header => (
                  <th
                    key={header}
                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    {header}
                  </th>
                )
              )}

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {rows.map(
              (row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition hover:bg-gray-50/70"
                >

                  {row.map(
                    (
                      cell,
                      cellIndex
                    ) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-4 text-xs text-gray-600"
                      >
                        {cell}
                      </td>
                    )
                  )}

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "neutral";
}) {
  return (
    <span
      className={
        `inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ` +
        getBadgeClass(
          variant
        )
      }
    >
      {label}
    </span>
  );
}

// =========================================================
// PAGINATION
// =========================================================

function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (
    page: number
  ) => void;
}) {
  const start =
    totalCount === 0
      ? 0
      : (page - 1) *
          pageSize +
        1;

  const end =
    Math.min(
      page * pageSize,
      totalCount
    );

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

      <p className="text-xs text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-700">
          {start}
        </span>

        {" – "}

        <span className="font-semibold text-gray-700">
          {end}
        </span>

        {" of "}

        <span className="font-semibold text-gray-700">
          {totalCount}
        </span>

        {" records"}
      </p>

      <div className="flex items-center gap-2">

        <button
          type="button"
          disabled={
            page <= 1
          }
          onClick={() =>
            onPageChange(
              page - 1
            )
          }
          className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <div className="rounded-xl bg-[#eef4f8] px-4 py-2 text-xs font-bold text-[#002b5c]">
          {page} /{" "}
          {totalPages}
        </div>

        <button
          type="button"
          disabled={
            page >=
            totalPages
          }
          onClick={() =>
            onPageChange(
              page + 1
            )
          }
          className="rounded-xl bg-[#002b5c] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0d2142] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  );
}

// =========================================================
// LOADING
// =========================================================

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#002b5c]" />

      <p className="mt-4 text-sm text-gray-500">
        {text}
      </p>

    </div>
  );
}

// =========================================================
// EMPTY
// =========================================================

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4f8] text-lg font-bold text-[#002b5c]">
        —
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>

    </div>
  );
}

// =========================================================
// BAR CLASS
// =========================================================

function getBarClass(
  variant:
    | "primary"
    | "success"
    | "warning"
    | "danger"
) {
  switch (variant) {
    case "success":
      return "bg-emerald-500";

    case "warning":
      return "bg-amber-500";

    case "danger":
      return "bg-red-500";

    case "primary":
    default:
      return "bg-[#002b5c]";
  }
}

// =========================================================
// BADGE CLASS
// =========================================================

function getBadgeClass(
  variant:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "neutral"
) {
  switch (variant) {
    case "success":
      return "bg-emerald-50 text-emerald-700";

    case "warning":
      return "bg-amber-50 text-amber-700";

    case "danger":
      return "bg-red-50 text-red-700";

    case "primary":
      return "bg-[#eef4f8] text-[#002b5c]";

    case "neutral":
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// =========================================================
// DATE
// =========================================================

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
    return value;
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

// =========================================================
// DATE ONLY
// =========================================================

function formatDateOnly(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
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

// =========================================================
// TIME
// =========================================================

function formatTime(
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
    return value;
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}