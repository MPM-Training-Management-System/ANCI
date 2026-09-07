"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  columns,
  type ExamResultsTableMeta,
} from "./columns";

import type {
  AssessmentType,
  ExamResult,
  ExamResultStatus,
  TrainingOption,
} from "./types";

import RetakeModal from "./components/RetakeModal";
import ResultReviewModal from "./components/ResultReviewModal";

/* =========================================================
   TRAINING OPTIONS
========================================================= */

const trainingOptions: TrainingOption[] = [
  {
    name: "Computer Systems Servicing NC II",
    code: "CSS-NCII",
  },
  {
    name: "Electrical Installation and Maintenance NC II",
    code: "EIM-NCII",
  },
  {
    name: "Web Development Fundamentals",
    code: "WEB-DEV",
  },
];

/* =========================================================
   MOCK RESULTS
========================================================= */

const initialResults: ExamResult[] = [
  {
    id: "RES-001",
    participantId: "P-001",
    participantName: "Juan Dela Cruz",
    participantEmail: "juan.delacruz@email.com",

    assessmentId: "ASM-001",
    assessmentTitle: "Computer Hardware Fundamentals",
    assessmentType: "Written Exam",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 42,
    maxScore: 50,
    percentage: 84,
    passingScore: 75,

    result: "Passed",

    submittedAt: "August 16, 2026 · 9:42 AM",

    retakeStatus: "Not Allowed",

    questions: [
      {
        id: "Q-001",
        questionNumber: 1,
        question: "What is the main function of RAM?",
        selectedAnswer: "Temporary data storage",
        correctAnswer: "Temporary data storage",
        pointsEarned: 5,
        maxPoints: 5,
        status: "Correct",
      },
      {
        id: "Q-002",
        questionNumber: 2,
        question:
          "Which component is responsible for processing instructions?",
        selectedAnswer: "CPU",
        correctAnswer: "CPU",
        pointsEarned: 5,
        maxPoints: 5,
        status: "Correct",
      },
      {
        id: "Q-003",
        questionNumber: 3,
        question:
          "Which device is primarily used for permanent data storage?",
        selectedAnswer: "RAM",
        correctAnswer: "SSD",
        pointsEarned: 0,
        maxPoints: 5,
        status: "Incorrect",
      },
    ],

    practicalCriteria: [],

    trainerRemarks: "Good overall performance.",
  },

  {
    id: "RES-002",
    participantId: "P-002",
    participantName: "Maria Santos",
    participantEmail: "maria.santos@email.com",

    assessmentId: "ASM-001",
    assessmentTitle: "Computer Hardware Fundamentals",
    assessmentType: "Written Exam",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 35,
    maxScore: 50,
    percentage: 70,
    passingScore: 75,

    result: "Failed",

    submittedAt: "August 16, 2026 · 10:15 AM",

    retakeStatus: "Allowed",

    questions: [
      {
        id: "Q-004",
        questionNumber: 1,
        question: "What is the main function of RAM?",
        selectedAnswer: "Permanent storage",
        correctAnswer: "Temporary data storage",
        pointsEarned: 0,
        maxPoints: 5,
        status: "Incorrect",
      },
      {
        id: "Q-005",
        questionNumber: 2,
        question: "Which component processes instructions?",
        selectedAnswer: "CPU",
        correctAnswer: "CPU",
        pointsEarned: 5,
        maxPoints: 5,
        status: "Correct",
      },
    ],

    practicalCriteria: [],

    trainerRemarks:
      "Needs additional review of hardware fundamentals.",
  },

  {
    id: "RES-003",
    participantId: "P-003",
    participantName: "Pedro Garcia",
    participantEmail: "pedro.garcia@email.com",

    assessmentId: "ASM-001",
    assessmentTitle: "Computer Hardware Fundamentals",
    assessmentType: "Written Exam",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 2,

    score: 44,
    maxScore: 50,
    percentage: 88,
    passingScore: 75,

    result: "Passed",

    submittedAt: "August 16, 2026 · 11:03 AM",

    retakeStatus: "Used",

    questions: [
      {
        id: "Q-006",
        questionNumber: 1,
        question: "What is the main function of RAM?",
        selectedAnswer: "Temporary data storage",
        correctAnswer: "Temporary data storage",
        pointsEarned: 5,
        maxPoints: 5,
        status: "Correct",
      },
    ],

    practicalCriteria: [],

    trainerRemarks:
      "Improved significantly on the second attempt.",
  },

  {
    id: "RES-004",
    participantId: "P-004",
    participantName: "Angela Bautista",
    participantEmail: "angela.bautista@email.com",

    assessmentId: "ASM-002",
    assessmentTitle: "PC Assembly Practical Assessment",
    assessmentType: "Practical Assessment",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 88,
    maxScore: 100,
    percentage: 88,
    passingScore: 75,

    result: "Passed",

    submittedAt: "August 16, 2026 · 1:35 PM",

    retakeStatus: "Not Allowed",

    questions: [],

    practicalCriteria: [
      {
        id: "C-001",
        name: "Hardware Installation",
        score: 18,
        maxScore: 20,
        remarks: "Components installed correctly.",
      },
      {
        id: "C-002",
        name: "Cable Management",
        score: 17,
        maxScore: 20,
        remarks: "Minor cable organization issues.",
      },
      {
        id: "C-003",
        name: "OS Installation",
        score: 19,
        maxScore: 20,
        remarks:
          "Successfully installed the operating system.",
      },
      {
        id: "C-004",
        name: "Troubleshooting",
        score: 16,
        maxScore: 20,
        remarks:
          "Required minor trainer guidance.",
      },
      {
        id: "C-005",
        name: "Safety Procedures",
        score: 18,
        maxScore: 20,
        remarks:
          "Followed safety procedures properly.",
      },
    ],

    trainerRemarks:
      "Passed the practical assessment with good performance.",
  },

  {
    id: "RES-005",
    participantId: "P-005",
    participantName: "Robert Fernandez",
    participantEmail: "robert.fernandez@email.com",

    assessmentId: "ASM-002",
    assessmentTitle: "PC Assembly Practical Assessment",
    assessmentType: "Practical Assessment",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 68,
    maxScore: 100,
    percentage: 68,
    passingScore: 75,

    result: "Failed",

    submittedAt: "August 16, 2026 · 2:10 PM",

    retakeStatus: "Not Allowed",

    questions: [],

    practicalCriteria: [
      {
        id: "C-006",
        name: "Hardware Installation",
        score: 15,
        maxScore: 20,
        remarks: "Several installation errors.",
      },
      {
        id: "C-007",
        name: "Cable Management",
        score: 12,
        maxScore: 20,
        remarks: "Needs improvement.",
      },
      {
        id: "C-008",
        name: "OS Installation",
        score: 15,
        maxScore: 20,
        remarks: "Completed with assistance.",
      },
      {
        id: "C-009",
        name: "Troubleshooting",
        score: 10,
        maxScore: 20,
        remarks:
          "Needs more troubleshooting practice.",
      },
      {
        id: "C-010",
        name: "Safety Procedures",
        score: 16,
        maxScore: 20,
        remarks:
          "Generally followed safety rules.",
      },
    ],

    trainerRemarks:
      "Participant needs additional practical training.",
  },
];

/* =========================================================
   HELPER
========================================================= */

function getLastName(
  participantName: string,
): string {
  if (!participantName) {
    return "";
  }

  const parts = participantName
    .trim()
    .split(/\s+/);

  return (
    parts[parts.length - 1] ?? ""
  ).toLowerCase();
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerExamResultsPage() {
  const [
    selectedTraining,
    setSelectedTraining,
  ] = useState(
    "Computer Systems Servicing NC II",
  );

  const [
    results,
    setResults,
  ] = useState<ExamResult[]>(
    initialResults,
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    assessmentFilter,
    setAssessmentFilter,
  ] = useState("All");

  const [
    resultFilter,
    setResultFilter,
  ] = useState<
    "All" | ExamResultStatus
  >("All");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<
    "All" | AssessmentType
  >("All");

  const [
    selectedResult,
    setSelectedResult,
  ] = useState<ExamResult | null>(
    null,
  );

  const [
    showReviewModal,
    setShowReviewModal,
  ] = useState(false);

  const [
    showRetakeModal,
    setShowRetakeModal,
  ] = useState(false);

  /* =======================================================
     TRAINING RESULTS
  ======================================================= */

  const trainingResults =
    useMemo(() => {
      return results.filter(
        (result) =>
          result.training ===
          selectedTraining,
      );
    }, [
      results,
      selectedTraining,
    ]);

  /* =======================================================
     ASSESSMENT OPTIONS
  ======================================================= */

  const assessmentOptions =
    useMemo(() => {
      const map =
        new Map<string, string>();

      trainingResults.forEach(
        (result) => {
          map.set(
            result.assessmentId,
            result.assessmentTitle,
          );
        },
      );

      return Array.from(
        map.entries(),
      ).sort((a, b) =>
        a[1].localeCompare(
          b[1],
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );
    }, [trainingResults]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredResults =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return trainingResults
        .filter((result) => {
          if (
            assessmentFilter ===
            "All"
          ) {
            return true;
          }

          return (
            result.assessmentId ===
            assessmentFilter
          );
        })
        .filter((result) => {
          if (
            resultFilter ===
            "All"
          ) {
            return true;
          }

          return (
            result.result ===
            resultFilter
          );
        })
        .filter((result) => {
          if (
            typeFilter ===
            "All"
          ) {
            return true;
          }

          return (
            result.assessmentType ===
            typeFilter
          );
        })
        .filter((result) => {
          if (!query) {
            return true;
          }

          return (
            result.participantName
              .toLowerCase()
              .includes(query) ||
            result.participantEmail
              .toLowerCase()
              .includes(query) ||
            result.assessmentTitle
              .toLowerCase()
              .includes(query)
          );
        })
        .sort((a, b) =>
          getLastName(
            a.participantName,
          ).localeCompare(
            getLastName(
              b.participantName,
            ),
            undefined,
            {
              sensitivity: "base",
            },
          ),
        );
    }, [
      trainingResults,
      search,
      assessmentFilter,
      resultFilter,
      typeFilter,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const totalResults =
    trainingResults.length;

  const passedCount =
    trainingResults.filter(
      (result) =>
        result.result ===
        "Passed",
    ).length;

  const failedCount =
    trainingResults.filter(
      (result) =>
        result.result ===
        "Failed",
    ).length;

  const retakeCount =
    trainingResults.filter(
      (result) =>
        result.retakeStatus ===
        "Allowed",
    ).length;

  /* =======================================================
     VIEW RESULT
  ======================================================= */

  function openReview(
    result: ExamResult,
  ) {
    setSelectedResult(
      result,
    );

    setShowReviewModal(
      true,
    );
  }

  /* =======================================================
     ALLOW RETAKE
  ======================================================= */

  function openRetake(
    result: ExamResult,
  ) {
    setSelectedResult(
      result,
    );

    setShowRetakeModal(
      true,
    );
  }

  function allowRetake() {
    if (!selectedResult) {
      return;
    }

    setResults((current) =>
      current.map((result) => {
        if (
          result.id !==
          selectedResult.id
        ) {
          return result;
        }

        return {
          ...result,
          result:
            result.result ===
            "Failed"
              ? "For Retake"
              : result.result,
          retakeStatus:
            "Allowed",
        };
      }),
    );

    setShowRetakeModal(
      false,
    );

    setSelectedResult(
      null,
    );
  }

  /* =======================================================
     REVOKE RETAKE
  ======================================================= */

  function revokeRetake(
    result: ExamResult,
  ) {
    setResults((current) =>
      current.map((item) => {
        if (
          item.id !==
          result.id
        ) {
          return item;
        }

        return {
          ...item,
          result:
            item.result ===
            "For Retake"
              ? "Failed"
              : item.result,
          retakeStatus:
            "Not Allowed",
        };
      }),
    );
  }

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setAssessmentFilter(
      "All",
    );
    setResultFilter("All");
    setTypeFilter("All");
  }

  /* =======================================================
     TABLE META
  ======================================================= */

  const tableMeta: ExamResultsTableMeta =
    {
      onViewResult:
        openReview,
      onAllowRetake:
        openRetake,
      onRevokeRetake:
        revokeRetake,
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      <PageSection
      title="Exam Result"
      description="Review participant assessment results, scores, attempts, and retake eligibility.">

      </PageSection>
  

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">
        <div className="max-w-xl">
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
            Training Program
          </label>

          <select
            value={
              selectedTraining
            }
            onChange={(event) => {
              setSelectedTraining(
                event.target.value,
              );

              setSearch("");
              setAssessmentFilter(
                "All",
              );
              setResultFilter(
                "All",
              );
              setTypeFilter(
                "All",
              );
            }}
            className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
          >
            {trainingOptions.map(
              (training) => (
                <option
                  key={
                    training.code
                  }
                  value={
                    training.name
                  }
                >
                  {training.name}
                </option>
              ),
            )}
          </select>
        </div>
      </section>



      <StatGrid>
        <StatCard
          title="Total Results"
          value={totalResults}
          description="Submitted assessment results"
        />

        <StatCard
          title="Passed"
          value={passedCount}
          description="Participants who passed"
          variant="success"
        />

        <StatCard
          title="Failed"
          value={failedCount}
          description="Participants who failed"
          variant="warning"
        />

        <StatCard
          title="Retake Allowed"
          value={retakeCount}
          description="Participants eligible for retake"
          variant="warning"
        />
      </StatGrid>



      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">
        {/* TOOLBAR */}

        <div className="border-b border-[#eef0f2] p-5">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold">
                Participant Results
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Results are sorted
                alphabetically by
                participant last name.
              </p>
            </div>

            <div className="flex flex-col gap-2 xl:flex-row">
              {/* SEARCH */}

              <div className="relative min-w-0 flex-1 xl:max-w-sm">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search participant or assessment..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-9 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-gray-200"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* ASSESSMENT */}

              <select
                value={
                  assessmentFilter
                }
                onChange={(event) =>
                  setAssessmentFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >
                <option value="All">
                  All Assessments
                </option>

                {assessmentOptions.map(
                  ([id, title]) => (
                    <option
                      key={id}
                      value={id}
                    >
                      {title}
                    </option>
                  ),
                )}
              </select>

              {/* TYPE */}

              <select
                value={
                  typeFilter
                }
                onChange={(event) =>
                  setTypeFilter(
                    event.target
                      .value as
                      | "All"
                      | AssessmentType,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >
                <option value="All">
                  All Types
                </option>

                <option value="Written Exam">
                  Written Exam
                </option>

                <option value="Practical Assessment">
                  Practical Assessment
                </option>
              </select>

              {/* RESULT */}

              <select
                value={
                  resultFilter
                }
                onChange={(event) =>
                  setResultFilter(
                    event.target
                      .value as
                      | "All"
                      | ExamResultStatus,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >
                <option value="All">
                  All Results
                </option>

                <option value="Passed">
                  Passed
                </option>

                <option value="Failed">
                  Failed
                </option>

                <option value="For Retake">
                  For Retake
                </option>
              </select>
            </div>

            {(search ||
              assessmentFilter !==
                "All" ||
              resultFilter !==
                "All" ||
              typeFilter !==
                "All") && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                  {
                    filteredResults.length
                  }{" "}
                  result
                  {filteredResults.length !==
                  1
                    ? "s"
                    : ""}
                </span>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-[10px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={
              filteredResults
            }
meta={tableMeta}
          />
        </div>

        {/* EMPTY */}

        {filteredResults.length ===
          0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-700">
              No results found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try changing your
              search or filters.
            </p>
          </div>
        )}

        {/* FOOTER */}

        <div className="flex flex-col gap-2 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-gray-400">
            Results are sorted by
            participant last name.
          </p>

          <p className="text-[10px] font-medium text-gray-500">
            {
              filteredResults.length
            }{" "}
            displayed
          </p>
        </div>
      </section>

      {/* REVIEW MODAL */}

      {showReviewModal &&
        selectedResult && (
          <ResultReviewModal
            result={
              selectedResult
            }
            onClose={() => {
              setShowReviewModal(
                false,
              );

              setSelectedResult(
                null,
              );
            }}
          />
        )}

      {/* RETAKE MODAL */}

      {showRetakeModal &&
        selectedResult && (
          <RetakeModal
            result={
              selectedResult
            }
            onClose={() => {
              setShowRetakeModal(
                false,
              );

              setSelectedResult(
                null,
              );
            }}
           
          />
        )}
    </div>
  );
}