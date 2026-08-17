"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

/* =========================================================
   TYPES
========================================================= */

type AssessmentType =
  | "Written Exam"
  | "Practical Assessment";

type ExamResultStatus =
  | "Passed"
  | "Failed"
  | "For Retake";

type RetakeStatus =
  | "Not Allowed"
  | "Allowed"
  | "Used";

type AnswerStatus =
  | "Correct"
  | "Incorrect";

type TrainingOption = {
  name: string;
  code: string;
};

type QuestionResult = {
  id: string;
  questionNumber: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  pointsEarned: number;
  maxPoints: number;
  status: AnswerStatus;
};

type PracticalCriterionResult = {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  remarks: string;
};

type ExamResult = {
  id: string;

  participantId: string;

  participantName: string;

  participantEmail: string;

  assessmentId: string;

  assessmentTitle: string;

  assessmentType: AssessmentType;

  training: string;

  trainingCode: string;

  attemptNumber: number;

  score: number;

  maxScore: number;

  percentage: number;

  passingScore: number;

  result: ExamResultStatus;

  submittedAt: string;

  retakeStatus: RetakeStatus;

  questions: QuestionResult[];

  practicalCriteria: PracticalCriterionResult[];

  trainerRemarks: string;
};

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

    participantEmail:
      "juan.delacruz@email.com",

    assessmentId: "ASM-001",

    assessmentTitle:
      "Computer Hardware Fundamentals",

    assessmentType: "Written Exam",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 42,

    maxScore: 50,

    percentage: 84,

    passingScore: 75,

    result: "Passed",

    submittedAt:
      "August 16, 2026 · 9:42 AM",

    retakeStatus: "Not Allowed",

    questions: [
      {
        id: "Q-001",
        questionNumber: 1,

        question:
          "What is the main function of RAM?",

        selectedAnswer:
          "Temporary data storage",

        correctAnswer:
          "Temporary data storage",

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

    trainerRemarks:
      "Good overall performance.",
  },

  {
    id: "RES-002",

    participantId: "P-002",

    participantName: "Maria Santos",

    participantEmail:
      "maria.santos@email.com",

    assessmentId: "ASM-001",

    assessmentTitle:
      "Computer Hardware Fundamentals",

    assessmentType: "Written Exam",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 35,

    maxScore: 50,

    percentage: 70,

    passingScore: 75,

    result: "Failed",

    submittedAt:
      "August 16, 2026 · 10:15 AM",

    retakeStatus: "Allowed",

    questions: [
      {
        id: "Q-004",
        questionNumber: 1,

        question:
          "What is the main function of RAM?",

        selectedAnswer:
          "Permanent storage",

        correctAnswer:
          "Temporary data storage",

        pointsEarned: 0,

        maxPoints: 5,

        status: "Incorrect",
      },

      {
        id: "Q-005",
        questionNumber: 2,

        question:
          "Which component processes instructions?",

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

    participantEmail:
      "pedro.garcia@email.com",

    assessmentId: "ASM-001",

    assessmentTitle:
      "Computer Hardware Fundamentals",

    assessmentType: "Written Exam",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    attemptNumber: 2,

    score: 44,

    maxScore: 50,

    percentage: 88,

    passingScore: 75,

    result: "Passed",

    submittedAt:
      "August 16, 2026 · 11:03 AM",

    retakeStatus: "Used",

    questions: [
      {
        id: "Q-006",
        questionNumber: 1,

        question:
          "What is the main function of RAM?",

        selectedAnswer:
          "Temporary data storage",

        correctAnswer:
          "Temporary data storage",

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

    participantName:
      "Angela Bautista",

    participantEmail:
      "angela.bautista@email.com",

    assessmentId: "ASM-002",

    assessmentTitle:
      "PC Assembly Practical Assessment",

    assessmentType:
      "Practical Assessment",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 88,

    maxScore: 100,

    percentage: 88,

    passingScore: 75,

    result: "Passed",

    submittedAt:
      "August 16, 2026 · 1:35 PM",

    retakeStatus: "Not Allowed",

    questions: [],

    practicalCriteria: [
      {
        id: "C-001",

        name:
          "Hardware Installation",

        score: 18,

        maxScore: 20,

        remarks:
          "Components installed correctly.",
      },

      {
        id: "C-002",

        name:
          "Cable Management",

        score: 17,

        maxScore: 20,

        remarks:
          "Minor cable organization issues.",
      },

      {
        id: "C-003",

        name:
          "OS Installation",

        score: 19,

        maxScore: 20,

        remarks:
          "Successfully installed the operating system.",
      },

      {
        id: "C-004",

        name:
          "Troubleshooting",

        score: 16,

        maxScore: 20,

        remarks:
          "Required minor trainer guidance.",
      },

      {
        id: "C-005",

        name:
          "Safety Procedures",

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

    participantName:
      "Robert Fernandez",

    participantEmail:
      "robert.fernandez@email.com",

    assessmentId: "ASM-002",

    assessmentTitle:
      "PC Assembly Practical Assessment",

    assessmentType:
      "Practical Assessment",

    training:
      "Computer Systems Servicing NC II",

    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    score: 68,

    maxScore: 100,

    percentage: 68,

    passingScore: 75,

    result: "Failed",

    submittedAt:
      "August 16, 2026 · 2:10 PM",

    retakeStatus: "Not Allowed",

    questions: [],

    practicalCriteria: [
      {
        id: "C-006",

        name:
          "Hardware Installation",

        score: 15,

        maxScore: 20,

        remarks:
          "Several installation errors.",
      },

      {
        id: "C-007",

        name:
          "Cable Management",

        score: 12,

        maxScore: 20,

        remarks:
          "Needs improvement.",
      },

      {
        id: "C-008",

        name:
          "OS Installation",

        score: 15,

        maxScore: 20,

        remarks:
          "Completed with assistance.",
      },

      {
        id: "C-009",

        name:
          "Troubleshooting",

        score: 10,

        maxScore: 20,

        remarks:
          "Needs more troubleshooting practice.",
      },

      {
        id: "C-010",

        name:
          "Safety Procedures",

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
   MAIN PAGE
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
      const unique =
        Array.from(
          new Map(
            trainingResults.map(
              (result) => [
                result.assessmentId,
                result.assessmentTitle,
              ],
            ),
          ).entries(),
        );

      return unique.sort(
        (a, b) =>
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
     FILTER RESULTS
  ======================================================= */

  const filteredResults =
    useMemo(() => {
      const query =
        search.toLowerCase().trim();

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
            resultFilter === "All"
          ) {
            return true;
          }

          return (
            result.result ===
            resultFilter
          );
        })

        .filter((result) => {
          if (typeFilter === "All") {
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
     SUMMARY
  ======================================================= */

  const totalResults =
    trainingResults.length;

  const passedCount =
    trainingResults.filter(
      (result) =>
        result.result === "Passed",
    ).length;

  const failedCount =
    trainingResults.filter(
      (result) =>
        result.result === "Failed",
    ).length;

  const retakeCount =
    trainingResults.filter(
      (result) =>
        result.retakeStatus ===
        "Allowed",
    ).length;

  /* =======================================================
     REVIEW
  ======================================================= */

  function openReview(
    result: ExamResult,
  ) {
    setSelectedResult(result);

    setShowReviewModal(true);
  }

  /* =======================================================
     RETAKE
  ======================================================= */

  function openRetake(
    result: ExamResult,
  ) {
    setSelectedResult(result);

    setShowRetakeModal(true);
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

          retakeStatus: "Allowed",
        };
      }),
    );

    setShowRetakeModal(false);

    setSelectedResult(null);
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
          item.id !== result.id
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

    setAssessmentFilter("All");

    setResultFilter("All");

    setTypeFilter("All");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">

            <span>Trainer</span>

            <span>/</span>

            <span>Assessments</span>

            <span>/</span>

            <span className="font-medium text-gray-600">
              Exam Results
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Exam Results
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Review participant assessment
            results, scores, attempts, and
            retake eligibility.
          </p>

        </div>

      </div>

      {/* =================================================
          TRAINING
      ================================================= */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="max-w-xl">

          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
            Training Program
          </label>

          <select
            value={selectedTraining}
            onChange={(event) => {
              setSelectedTraining(
                event.target.value,
              );

              setSearch("");

              setAssessmentFilter(
                "All",
              );

              setResultFilter("All");

              setTypeFilter("All");
            }}
            className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
          >
            {trainingOptions.map(
              (training) => (
                <option
                  key={training.code}
                  value={training.name}
                >
                  {training.name}
                </option>
              ),
            )}
          </select>

        </div>

      </section>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <SummaryCard
          label="Total Results"
          value={totalResults}
        />

        <SummaryCard
          label="Passed"
          value={passedCount}
          type="success"
        />

        <SummaryCard
          label="Failed"
          value={failedCount}
          type="danger"
        />

        <SummaryCard
          label="Retake Allowed"
          value={retakeCount}
          type="warning"
        />

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

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

            {/* FILTERS */}

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
                    event.target
                      .value,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >
                <option value="All">
                  All Assessments
                </option>

                {assessmentOptions.map(
                  ([
                    id,
                    title,
                  ]) => (
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
                value={typeFilter}
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
                value={resultFilter}
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

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1250px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Participant
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Assessment
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Type
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Attempt
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Score
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Passing
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Result
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Submitted
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#eef0f2]">

              {filteredResults.map(
                (result) => (
                  <tr
                    key={result.id}
                    className="transition hover:bg-[#fafbfc]"
                  >

                    {/* PARTICIPANT */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-bold text-gray-600">
                          {getInitials(
                            result.participantName,
                          )}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-xs font-semibold">
                            {
                              result.participantName
                            }
                          </p>

                          <p className="mt-1 truncate text-[9px] text-gray-400">
                            {
                              result.participantId
                            }
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* ASSESSMENT */}

                    <td className="px-5 py-4">

                      <div className="max-w-[240px]">

                        <p className="truncate text-xs font-semibold">
                          {
                            result.assessmentTitle
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-gray-400">
                          {
                            result.trainingCode
                          }
                        </p>

                      </div>

                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${
                          result.assessmentType ===
                          "Written Exam"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {
                          result.assessmentType
                        }
                      </span>

                    </td>

                    {/* ATTEMPT */}

                    <td className="px-5 py-4 text-center">

                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-gray-100 px-2 text-[10px] font-bold text-gray-600">
                        {
                          result.attemptNumber
                        }
                      </span>

                    </td>

                    {/* SCORE */}

                    <td className="px-5 py-4 text-center">

                      <p className="text-sm font-bold">
                        {result.score}/
                        {
                          result.maxScore
                        }
                      </p>

                      <p className="mt-1 text-[9px] text-gray-400">
                        {
                          result.percentage
                        }
                        %
                      </p>

                    </td>

                    {/* PASSING */}

                    <td className="px-5 py-4 text-center">

                      <span className="text-xs font-semibold text-gray-600">
                        {
                          result.passingScore
                        }
                        %
                      </span>

                    </td>

                    {/* RESULT */}

                    <td className="px-5 py-4 text-center">

                      <ResultBadge
                        result={
                          result.result
                        }
                      />

                    </td>

                    {/* SUBMITTED */}

                    <td className="px-5 py-4">

                      <span className="whitespace-nowrap text-[10px] text-gray-500">
                        {
                          result.submittedAt
                        }
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-1.5">

                        <button
                          type="button"
                          onClick={() =>
                            openReview(
                              result,
                            )
                          }
                          className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
                        >
                          View Result
                        </button>

                        {result.retakeStatus ===
                          "Allowed" ? (
                          <button
                            type="button"
                            onClick={() =>
                              revokeRetake(
                                result,
                              )
                            }
                            className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-100"
                          >
                            Revoke Retake
                          </button>
                        ) : result.result ===
                          "Failed" ? (
                          <button
                            type="button"
                            onClick={() =>
                              openRetake(
                                result,
                              )
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Allow Retake
                          </button>
                        ) : null}

                      </div>

                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>

        {/* EMPTY */}

        {filteredResults.length ===
          0 && (
          <EmptyResults />
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

      {/* =================================================
          REVIEW MODAL
      ================================================= */}

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

      {/* =================================================
          RETAKE MODAL
      ================================================= */}

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
            onConfirm={
              allowRetake
            }
          />
        )}

    </div>
  );
}

/* =========================================================
   RESULT REVIEW MODAL
========================================================= */

function ResultReviewModal({
  result,
  onClose,
}: {
  result: ExamResult;

  onClose: () => void;
}) {
  const isWritten =
    result.assessmentType ===
    "Written Exam";

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <ResultBadge
                result={result.result}
              />

              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  isWritten
                    ? "bg-violet-50 text-violet-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {
                  result.assessmentType
                }
              </span>

            </div>

            <h2 className="mt-3 text-lg font-bold">
              {
                result.participantName
              }
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {
                result.assessmentTitle
              }
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          {/* SCORE SUMMARY */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            <ReviewStat
              label="Score"
              value={`${result.score}/${result.maxScore}`}
            />

            <ReviewStat
              label="Percentage"
              value={`${result.percentage}%`}
            />

            <ReviewStat
              label="Passing"
              value={`${result.passingScore}%`}
            />

            <ReviewStat
              label="Attempt"
              value={`#${result.attemptNumber}`}
            />

          </div>

          {/* SUBMITTED */}

          <div className="mt-4 rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Submitted
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {
                    result.submittedAt
                  }
                </p>

              </div>

              <div>

                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Retake
                </p>

                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {
                    result.retakeStatus
                  }
                </p>

              </div>

            </div>

          </div>

          {/* WRITTEN REVIEW */}

          {isWritten && (
            <div className="mt-6">

              <div className="mb-3">

                <h3 className="text-sm font-bold">
                  Answer Review
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Review the participant's
                  answers and correct
                  answers.
                </p>

              </div>

              {result.questions
                .length === 0 ? (
                <EmptyBuilder
                  text="No question-level result data is available."
                />
              ) : (
                <div className="space-y-3">

                  {result.questions.map(
                    (question) => (
                      <div
                        key={
                          question.id
                        }
                        className={`rounded-2xl border p-5 ${
                          question.status ===
                          "Correct"
                            ? "border-emerald-100 bg-emerald-50/40"
                            : "border-red-100 bg-red-50/40"
                        }`}
                      >

                        <div className="flex gap-4">

                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                              question.status ===
                              "Correct"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {
                              question.questionNumber
                            }
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <p className="text-xs font-semibold leading-5">
                                {
                                  question.question
                                }
                              </p>

                              <span className="shrink-0 text-[9px] font-bold text-gray-400">
                                {
                                  question.pointsEarned
                                }
                                /
                                {
                                  question.maxPoints
                                }{" "}
                                pts
                              </span>

                            </div>

                            <div className="mt-4 grid gap-2">

                              <AnswerBox
                                label="Participant Answer"
                                value={
                                  question.selectedAnswer
                                }
                                correct={
                                  question.status ===
                                  "Correct"
                                }
                              />

                              {question.status ===
                                "Incorrect" && (
                                <AnswerBox
                                  label="Correct Answer"
                                  value={
                                    question.correctAnswer
                                  }
                                  correct
                                />
                              )}

                            </div>

                          </div>

                        </div>

                      </div>
                    ),
                  )}

                </div>
              )}

            </div>
          )}

          {/* PRACTICAL REVIEW */}

          {!isWritten && (
            <div className="mt-6">

              <div className="mb-3">

                <h3 className="text-sm font-bold">
                  Practical Assessment
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Criteria scores entered
                  by the trainer.
                </p>

              </div>

              {result.practicalCriteria
                .length === 0 ? (
                <EmptyBuilder
                  text="No practical criteria result data is available."
                />
              ) : (
                <div className="space-y-3">

                  {result.practicalCriteria.map(
                    (criterion) => (
                      <div
                        key={
                          criterion.id
                        }
                        className="rounded-2xl border border-[#e7e9ec] bg-white p-5"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="text-xs font-semibold">
                              {
                                criterion.name
                              }
                            </p>

                            <p className="mt-1 text-[10px] leading-5 text-gray-400">
                              {
                                criterion.remarks ||
                                "No remarks."
                              }
                            </p>

                          </div>

                          <div className="shrink-0 text-right">

                            <p className="text-sm font-bold">
                              {
                                criterion.score
                              }
                              /
                              {
                                criterion.maxScore
                              }
                            </p>

                            <p className="mt-1 text-[9px] text-gray-400">
                              points
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(
                                100,
                                (criterion.score /
                                  criterion.maxScore) *
                                  100,
                              )}%`,
                            }}
                          />

                        </div>

                      </div>
                    ),
                  )}

                </div>
              )}

            </div>
          )}

          {/* TRAINER REMARKS */}

          {result.trainerRemarks && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-blue-500">
                Trainer Remarks
              </p>

              <p className="mt-2 text-xs leading-6 text-blue-800">
                {
                  result.trainerRemarks
                }
              </p>

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   RETAKE MODAL
========================================================= */

function RetakeModal({
  result,
  onClose,
  onConfirm,
}: {
  result: ExamResult;

  onClose: () => void;

  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700">
          ↻
        </div>

        <h2 className="mt-5 text-xl font-bold">
          Allow Retake?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">

          Allow{" "}
          <span className="font-semibold text-gray-700">
            {result.participantName}
          </span>{" "}
          to retake:

        </p>

        <div className="mt-4 rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

          <p className="text-xs font-semibold">
            {
              result.assessmentTitle
            }
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">

            <div>

              <p className="text-[9px] text-gray-400">
                Current Score
              </p>

              <p className="mt-1 text-sm font-bold text-red-600">
                {
                  result.percentage
                }
                %
              </p>

            </div>

            <div>

              <p className="text-[9px] text-gray-400">
                Passing
              </p>

              <p className="mt-1 text-sm font-bold">
                {
                  result.passingScore
                }
                %
              </p>

            </div>

          </div>

        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">

          <p className="text-[10px] leading-5 text-blue-700">
            The participant will be
            allowed to take another attempt.
            The current result will remain
            in the assessment history.
          </p>

        </div>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            Allow Retake
          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   RESULT BADGE
========================================================= */

function ResultBadge({
  result,
}: {
  result: ExamResultStatus;
}) {
  const styles = {
    Passed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    Failed:
      "border-red-200 bg-red-50 text-red-700",

    "For Retake":
      "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${styles[result]}`}
    >
      {result}
    </span>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  type,
}: {
  label: string;

  value: string | number;

  type?:
    | "success"
    | "danger"
    | "warning";
}) {
  const styles = {
    success:
      "text-emerald-700",

    danger:
      "text-red-600",

    warning:
      "text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-4">

      <p className="text-[11px] font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          type
            ? styles[type]
            : "text-[#191c1e]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   REVIEW STAT
========================================================= */

function ReviewStat({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-4">

      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-gray-700">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   ANSWER BOX
========================================================= */

function AnswerBox({
  label,
  value,
  correct,
}: {
  label: string;

  value: string;

  correct: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        correct
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >

      <p
        className={`text-[9px] font-bold uppercase tracking-[0.08em] ${
          correct
            ? "text-emerald-600"
            : "text-red-600"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 text-xs font-semibold ${
          correct
            ? "text-emerald-800"
            : "text-red-800"
        }`}
      >
        {value || "No answer"}
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyResults() {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ?
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No results found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your search or
        filters.
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY BUILDER
========================================================= */

function EmptyBuilder({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dfe2e5] px-6 py-14 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        +
      </div>

      <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-gray-500">
        {text}
      </p>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getLastName(
  fullName: string,
) {
  const parts = fullName
    .trim()
    .split(/\s+/);

  return (
    parts[parts.length - 1] ??
    ""
  );
}

function getInitials(
  fullName: string,
) {
  const parts = fullName
    .trim()
    .split(/\s+/);

  if (parts.length === 1) {
    return (
      parts[0]?.charAt(0) ??
      "?"
    ).toUpperCase();
  }

  const first =
    parts[0]?.charAt(0) ??
    "";

  const last =
    parts[parts.length - 1]?.charAt(
      0,
    ) ?? "";

  return `${first}${last}`.toUpperCase();
}