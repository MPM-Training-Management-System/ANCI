"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  columns,
  type PracticalGrade,
  type TrainingOption,
  type GradingStatus,
  type GradeResult,
} from "./columns";

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
   MOCK DATA
========================================================= */

const initialGrades: PracticalGrade[] = [
  {
    id: "GRD-001",
    participantId: "P-001",
    participantName: "Juan Dela Cruz",
    participantEmail: "juan.delacruz@email.com",

    assessmentId: "ASM-002",
    assessmentTitle: "PC Assembly Practical Assessment",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    passingScore: 75,

    status: "Pending",
    result: "Pending",

    criteria: [
      {
        id: "C-001",
        name: "Hardware Installation",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-002",
        name: "Cable Management",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-003",
        name: "OS Installation",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-004",
        name: "Troubleshooting",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-005",
        name: "Safety Procedures",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
    ],

    totalScore: 0,
    totalMaxScore: 100,
    percentage: 0,

    trainerRemarks: "",

    gradedAt: null,

    submittedAt: "August 16, 2026 · 9:30 AM",
  },

  {
    id: "GRD-002",
    participantId: "P-002",
    participantName: "Maria Santos",
    participantEmail: "maria.santos@email.com",

    assessmentId: "ASM-002",
    assessmentTitle: "PC Assembly Practical Assessment",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    passingScore: 75,

    status: "Graded",
    result: "Passed",

    criteria: [
      {
        id: "C-006",
        name: "Hardware Installation",
        maxScore: 20,
        score: 18,
        remarks:
          "Installed all major components correctly.",
      },
      {
        id: "C-007",
        name: "Cable Management",
        maxScore: 20,
        score: 16,
        remarks:
          "Minor cable organization issues.",
      },
      {
        id: "C-008",
        name: "OS Installation",
        maxScore: 20,
        score: 19,
        remarks:
          "Completed the installation properly.",
      },
      {
        id: "C-009",
        name: "Troubleshooting",
        maxScore: 20,
        score: 17,
        remarks:
          "Identified and resolved the issue.",
      },
      {
        id: "C-010",
        name: "Safety Procedures",
        maxScore: 20,
        score: 18,
        remarks:
          "Followed laboratory safety procedures.",
      },
    ],

    totalScore: 88,
    totalMaxScore: 100,
    percentage: 88,

    trainerRemarks:
      "Good practical performance.",

    gradedAt: "August 16, 2026 · 11:15 AM",

    submittedAt:
      "August 16, 2026 · 10:20 AM",
  },

  {
    id: "GRD-003",
    participantId: "P-003",
    participantName: "Pedro Garcia",
    participantEmail: "pedro.garcia@email.com",

    assessmentId: "ASM-002",
    assessmentTitle: "PC Assembly Practical Assessment",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 1,

    passingScore: 75,

    status: "Graded",
    result: "Failed",

    criteria: [
      {
        id: "C-011",
        name: "Hardware Installation",
        maxScore: 20,
        score: 14,
        remarks:
          "Required trainer assistance.",
      },
      {
        id: "C-012",
        name: "Cable Management",
        maxScore: 20,
        score: 11,
        remarks:
          "Cable arrangement needs improvement.",
      },
      {
        id: "C-013",
        name: "OS Installation",
        maxScore: 20,
        score: 16,
        remarks:
          "Completed with some guidance.",
      },
      {
        id: "C-014",
        name: "Troubleshooting",
        maxScore: 20,
        score: 12,
        remarks:
          "Needs more troubleshooting practice.",
      },
      {
        id: "C-015",
        name: "Safety Procedures",
        maxScore: 20,
        score: 15,
        remarks:
          "Generally followed safety procedures.",
      },
    ],

    totalScore: 68,
    totalMaxScore: 100,
    percentage: 68,

    trainerRemarks:
      "Additional practical training is recommended.",

    gradedAt: "August 16, 2026 · 1:10 PM",

    submittedAt:
      "August 16, 2026 · 12:30 PM",
  },

  {
    id: "GRD-004",
    participantId: "P-004",
    participantName: "Angela Bautista",
    participantEmail:
      "angela.bautista@email.com",

    assessmentId: "ASM-002",
    assessmentTitle: "PC Assembly Practical Assessment",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    attemptNumber: 2,

    passingScore: 75,

    status: "Pending",
    result: "Pending",

    criteria: [
      {
        id: "C-016",
        name: "Hardware Installation",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-017",
        name: "Cable Management",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-018",
        name: "OS Installation",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-019",
        name: "Troubleshooting",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
      {
        id: "C-020",
        name: "Safety Procedures",
        maxScore: 20,
        score: 0,
        remarks: "",
      },
    ],

    totalScore: 0,
    totalMaxScore: 100,
    percentage: 0,

    trainerRemarks: "",

    gradedAt: null,

    submittedAt:
      "August 17, 2026 · 9:05 AM",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function TrainerGradingPage() {
  const [
    selectedTraining,
    setSelectedTraining,
  ] = useState(
    "Computer Systems Servicing NC II",
  );

  const [grades, setGrades] =
    useState<PracticalGrade[]>(
      initialGrades,
    );

  const [search, setSearch] = useState("");

  const [
    assessmentFilter,
    setAssessmentFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<"All" | GradingStatus>("All");

  const [
    resultFilter,
    setResultFilter,
  ] = useState<"All" | GradeResult>("All");

  const [
    selectedGrade,
    setSelectedGrade,
  ] = useState<PracticalGrade | null>(
    null,
  );

  const [
    showGradingModal,
    setShowGradingModal,
  ] = useState(false);

  const [
    showReviewModal,
    setShowReviewModal,
  ] = useState(false);

  /* =======================================================
     TRAINING GRADES
  ======================================================= */

  const trainingGrades = useMemo(() => {
    return grades.filter(
      (grade) =>
        grade.training === selectedTraining,
    );
  }, [grades, selectedTraining]);

  /* =======================================================
     ASSESSMENTS
  ======================================================= */

  const assessmentOptions = useMemo(() => {
    const map = new Map<string, string>();

    trainingGrades.forEach((grade) => {
      map.set(
        grade.assessmentId,
        grade.assessmentTitle,
      );
    });

    return Array.from(map.entries()).sort(
      (a, b) =>
        a[1].localeCompare(
          b[1],
          undefined,
          {
            sensitivity: "base",
          },
        ),
    );
  }, [trainingGrades]);

  /* =======================================================
     FILTERED DATA
  ======================================================= */

  const filteredGrades = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return trainingGrades
      .filter((grade) => {
        if (
          assessmentFilter === "All"
        ) {
          return true;
        }

        return (
          grade.assessmentId ===
          assessmentFilter
        );
      })

      .filter((grade) => {
        if (statusFilter === "All") {
          return true;
        }

        return (
          grade.status === statusFilter
        );
      })

      .filter((grade) => {
        if (resultFilter === "All") {
          return true;
        }

        return (
          grade.result === resultFilter
        );
      })

      .filter((grade) => {
        if (!query) {
          return true;
        }

        return (
          grade.participantName
            .toLowerCase()
            .includes(query) ||
          grade.participantEmail
            .toLowerCase()
            .includes(query) ||
          grade.assessmentTitle
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
    trainingGrades,
    search,
    assessmentFilter,
    statusFilter,
    resultFilter,
  ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const pendingCount =
    trainingGrades.filter(
      (grade) =>
        grade.status === "Pending",
    ).length;

  const gradedCount =
    trainingGrades.filter(
      (grade) =>
        grade.status === "Graded",
    ).length;

  const passedCount =
    trainingGrades.filter(
      (grade) =>
        grade.result === "Passed",
    ).length;

  const failedCount =
    trainingGrades.filter(
      (grade) =>
        grade.result === "Failed",
    ).length;

  /* =======================================================
     MODALS
  ======================================================= */

  function openGrading(
    grade: PracticalGrade,
  ) {
    setSelectedGrade(
      cloneGrade(grade),
    );

    setShowGradingModal(true);
  }

  function openReview(
    grade: PracticalGrade,
  ) {
    setSelectedGrade(
      cloneGrade(grade),
    );

    setShowReviewModal(true);
  }

  /* =======================================================
     SAVE GRADE
  ======================================================= */

  function saveGrade(
    updatedGrade: PracticalGrade,
  ) {
    const totalScore =
      updatedGrade.criteria.reduce(
        (total, criterion) =>
          total + criterion.score,
        0,
      );

    const totalMaxScore =
      updatedGrade.criteria.reduce(
        (total, criterion) =>
          total + criterion.maxScore,
        0,
      );

    const percentage =
      totalMaxScore > 0
        ? Number(
            (
              (totalScore /
                totalMaxScore) *
              100
            ).toFixed(2),
          )
        : 0;

    const result: GradeResult =
      percentage >=
      updatedGrade.passingScore
        ? "Passed"
        : "Failed";

    const finalGrade: PracticalGrade =
      {
        ...updatedGrade,

        status: "Graded",

        result,

        totalScore,

        totalMaxScore,

        percentage,

        gradedAt:
          getCurrentDateTime(),
      };

    setGrades((current) =>
      current.map((grade) =>
        grade.id === finalGrade.id
          ? finalGrade
          : grade,
      ),
    );

    setSelectedGrade(null);
    setShowGradingModal(false);
  }

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setAssessmentFilter("All");
    setStatusFilter("All");
    setResultFilter("All");
  }

  const hasFilters =
    search ||
    assessmentFilter !== "All" ||
    statusFilter !== "All" ||
    resultFilter !== "All";

  /* =======================================================
     TABLE META
  ======================================================= */

  const tableMeta = {
    onGrade: openGrading,
    onReview: openReview,
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <span>Trainer</span>
          <span>/</span>
          <span>Assessments</span>
          <span>/</span>

          <span className="font-medium text-gray-600">
            Grading
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
          Grading
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Grade submitted practical
          assessments by evaluating
          each criterion and recording
          the participant's final
          performance.
        </p>
      </div>

      {/* ===================================================
          INFORMATION
      =================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
          ✓
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-900">
            Practical assessment
            grading
          </p>

          <p className="mt-1 text-xs leading-5 text-emerald-700">
            Enter a score for each
            criterion. The system
            automatically calculates
            the total score,
            percentage, and Passed
            or Failed result.
          </p>
        </div>
      </div>

      {/* ===================================================
          TRAINING
      =================================================== */}

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
              setStatusFilter("All");
              setResultFilter("All");
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

      {/* ===================================================
          STATS
      =================================================== */}

      <StatGrid >
        <StatCard
          title="Pending"
          value={pendingCount}
          variant="warning"
        />

        <StatCard
          title="Graded"
          value={gradedCount}
        />

        <StatCard
          title="Passed"
          value={passedCount}
          variant="success"
        />

        <StatCard
          title="Failed"
          value={failedCount}
          variant="warning"
        />
      </StatGrid>

      {/* ===================================================
          TABLE
      =================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">
        {/* TOOLBAR */}

        <div className="border-b border-[#eef0f2] p-5">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold">
                Practical Assessment
                Submissions
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Participants are sorted
                alphabetically by last
                name.
              </p>
            </div>

            {/* FILTERS */}

            <div className="flex flex-col gap-2 xl:flex-row">
              {/* SEARCH */}

              <div className="relative min-w-0 flex-1 xl:max-w-sm">
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search participant or assessment..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
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
                value={assessmentFilter}
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

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | GradingStatus,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Graded">
                  Graded
                </option>
              </select>

              {/* RESULT */}

              <select
                value={resultFilter}
                onChange={(event) =>
                  setResultFilter(
                    event.target.value as
                      | "All"
                      | GradeResult,
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

                <option value="Pending">
                  Pending
                </option>
              </select>
            </div>

            {/* FILTER STATUS */}

            {hasFilters && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                  {filteredGrades.length}{" "}
                  result
                  {filteredGrades.length !==
                  1
                    ? "s"
                    : ""}
                </span>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            DATA TABLE
        ================================================= */}

        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredGrades}
           meta={tableMeta}
          />
        </div>

        {/* EMPTY */}

        {filteredGrades.length ===
          0 && <EmptyResults />}

        {/* FOOTER */}

        <div className="flex flex-col gap-2 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-gray-400">
            Results are sorted
            alphabetically by
            participant last name.
          </p>

          <p className="text-[10px] font-medium text-gray-500">
            {filteredGrades.length}{" "}
            displayed
          </p>
        </div>
      </section>

      {/* ===================================================
          GRADING MODAL
      =================================================== */}

      {showGradingModal &&
        selectedGrade && (
          <GradingModal
            grade={selectedGrade}
            onClose={() => {
              setShowGradingModal(
                false,
              );
              setSelectedGrade(null);
            }}
            onSave={saveGrade}
          />
        )}

      {/* ===================================================
          REVIEW MODAL
      =================================================== */}

      {showReviewModal &&
        selectedGrade && (
          <ReviewGradeModal
            grade={selectedGrade}
            onClose={() => {
              setShowReviewModal(
                false,
              );
              setSelectedGrade(null);
            }}
          />
        )}
    </div>
  );
}

/* =========================================================
   GRADING MODAL
========================================================= */

function GradingModal({
  grade,
  onClose,
  onSave,
}: {
  grade: PracticalGrade;
  onClose: () => void;
  onSave: (
    grade: PracticalGrade,
  ) => void;
}) {
  const [current, setCurrent] =
    useState<PracticalGrade>(
      cloneGrade(grade),
    );

  const totalScore =
    current.criteria.reduce(
      (total, criterion) =>
        total + criterion.score,
      0,
    );

  const totalMaxScore =
    current.criteria.reduce(
      (total, criterion) =>
        total + criterion.maxScore,
      0,
    );

  const percentage =
    totalMaxScore > 0
      ? Number(
          (
            (totalScore /
              totalMaxScore) *
            100
          ).toFixed(2),
        )
      : 0;

  const result: GradeResult =
    percentage >=
    current.passingScore
      ? "Passed"
      : "Failed";

  function updateScore(
    criterionId: string,
    value: number,
  ) {
    setCurrent((previous) => ({
      ...previous,

      criteria:
        previous.criteria.map(
          (criterion) => {
            if (
              criterion.id !==
              criterionId
            ) {
              return criterion;
            }

            const safeValue =
              Math.max(
                0,
                Math.min(
                  Number.isFinite(
                    value,
                  )
                    ? value
                    : 0,
                  criterion.maxScore,
                ),
              );

            return {
              ...criterion,
              score: safeValue,
            };
          },
        ),
    }));
  }

  function updateRemarks(
    criterionId: string,
    remarks: string,
  ) {
    setCurrent((previous) => ({
      ...previous,

      criteria:
        previous.criteria.map(
          (criterion) =>
            criterion.id ===
            criterionId
              ? {
                  ...criterion,
                  remarks,
                }
              : criterion,
        ),
    }));
  }

  function handleSave() {
    onSave({
      ...current,

      totalScore,

      totalMaxScore,

      percentage,

      status: "Graded",

      result,

      gradedAt:
        getCurrentDateTime(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
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
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              Practical Assessment
            </p>

            <h2 className="mt-1 text-lg font-bold">
              Grade Assessment
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {current.participantName}{" "}
              ·{" "}
              {current.assessmentTitle}
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
          {/* PARTICIPANT */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <InfoCard
              label="Participant"
              value={
                current.participantName
              }
            />

            <InfoCard
              label="Attempt"
              value={`#${current.attemptNumber}`}
            />

            <InfoCard
              label="Passing"
              value={`${current.passingScore}%`}
            />

            <InfoCard
              label="Submitted"
              value={
                current.submittedAt
              }
            />
          </div>

          {/* CRITERIA */}

          <div className="mt-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Assessment Criteria
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  Enter the score
                  achieved for each
                  criterion.
                </p>
              </div>

              <span className="text-[10px] text-gray-400">
                Maximum:{" "}
                {totalMaxScore}{" "}
                points
              </span>
            </div>

            <div className="space-y-3">
              {current.criteria.map(
                (
                  criterion,
                  index,
                ) => (
                  <div
                    key={
                      criterion.id
                    }
                    className="rounded-2xl border border-[#e7e9ec] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[10px] font-bold text-emerald-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-semibold">
                            {
                              criterion.name
                            }
                          </p>

                          <span className="text-[9px] font-semibold text-gray-400">
                            Maximum Score:{" "}
                            {
                              criterion.maxScore
                            }
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          {/* SCORE */}

                          <div className="w-full sm:max-w-[180px]">
                            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                              Score
                            </label>

                            <input
                              type="number"
                              min={0}
                              max={
                                criterion.maxScore
                              }
                              value={
                                criterion.score
                              }
                              onChange={(
                                event,
                              ) =>
                                updateScore(
                                  criterion.id,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                )
                              }
                              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-semibold outline-none transition focus:border-gray-300 focus:bg-white"
                            />
                          </div>

                          {/* REMARKS */}

                          <div className="flex-1">
                            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                              Remarks
                            </label>

                            <input
                              value={
                                criterion.remarks
                              }
                              onChange={(
                                event,
                              ) =>
                                updateRemarks(
                                  criterion.id,
                                  event
                                    .target
                                    .value,
                                )
                              }
                              placeholder="Add remarks..."
                              className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
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
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* OVERALL REMARKS */}

          <div className="mt-6">
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Overall Trainer Remarks
            </label>

            <textarea
              value={
                current.trainerRemarks
              }
              onChange={(event) =>
                setCurrent(
                  (previous) => ({
                    ...previous,
                    trainerRemarks:
                      event.target
                        .value,
                  }),
                )
              }
              rows={4}
              placeholder="Add overall remarks for this participant..."
              className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
            />
          </div>

          {/* RESULT */}

          <div className="mt-6 rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Calculated Result
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Based on the scores
                  entered above.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <div className="text-right">
                  <p className="text-[9px] text-gray-400">
                    Total
                  </p>

                  <p className="text-xl font-bold">
                    {totalScore}/
                    {totalMaxScore}
                  </p>
                </div>

                <div className="h-10 w-px bg-gray-200" />

                <div className="text-right">
                  <p className="text-[9px] text-gray-400">
                    Percentage
                  </p>

                  <p className="text-xl font-bold">
                    {percentage}%
                  </p>
                </div>

                <ResultBadge
                  result={result}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col gap-3 border-t border-[#eef0f2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-gray-400">
            Saving the grade will
            finalize this assessment
            attempt.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
            >
              Save Grade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW MODAL
========================================================= */

function ReviewGradeModal({
  grade,
  onClose,
}: {
  grade: PracticalGrade;
  onClose: () => void;
}) {
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
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                status={grade.status}
                result={grade.result}
              />

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                Practical
              </span>
            </div>

            <h2 className="mt-3 text-lg font-bold">
              {grade.participantName}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {grade.assessmentTitle}
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
          {/* SUMMARY */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <InfoCard
              label="Total Score"
              value={`${grade.totalScore}/${grade.totalMaxScore}`}
            />

            <InfoCard
              label="Percentage"
              value={`${grade.percentage}%`}
            />

            <InfoCard
              label="Passing"
              value={`${grade.passingScore}%`}
            />

            <InfoCard
              label="Attempt"
              value={`#${grade.attemptNumber}`}
            />
          </div>

          {/* CRITERIA */}

          <div className="mt-6">
            <h3 className="text-sm font-bold">
              Criteria Results
            </h3>

            <div className="mt-4 space-y-3">
              {grade.criteria.map(
                (
                  criterion,
                  index,
                ) => (
                  <div
                    key={
                      criterion.id
                    }
                    className="rounded-2xl border border-[#e7e9ec] p-5"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold">
                              {
                                criterion.name
                              }
                            </p>

                            <p className="mt-1 text-[10px] leading-5 text-gray-400">
                              {criterion.remarks ||
                                "No remarks."}
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
                              {Math.round(
                                (criterion.score /
                                  criterion.maxScore) *
                                  100,
                              )}
                              %
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
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
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* REMARKS */}

          {grade.trainerRemarks && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-blue-500">
                Trainer Remarks
              </p>

              <p className="mt-2 text-xs leading-6 text-blue-800">
                {grade.trainerRemarks}
              </p>
            </div>
          )}

          {/* DATE */}

          {grade.gradedAt && (
            <p className="mt-5 text-[10px] text-gray-400">
              Graded on{" "}
              {grade.gradedAt}
            </p>
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
   INFO CARD
========================================================= */

function InfoCard({
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

      <p className="mt-1 truncate text-xs font-bold text-gray-700">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
  result,
}: {
  status: GradingStatus;
  result: GradeResult;
}) {
  if (status === "Pending") {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
        Pending Grade
      </span>
    );
  }

  return <ResultBadge result={result} />;
}

function ResultBadge({
  result,
}: {
  result: GradeResult;
}) {
  if (result === "Passed") {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
        Passed
      </span>
    );
  }

  if (result === "Failed") {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-bold text-red-700">
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
      Pending
    </span>
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
        No submissions found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your search or
        filters.
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function cloneGrade(
  grade: PracticalGrade,
): PracticalGrade {
  return {
    ...grade,

    criteria: grade.criteria.map(
      (criterion) => ({
        ...criterion,
      }),
    ),
  };
}

function getLastName(
  fullName: string,
) {
  const parts = fullName
    .trim()
    .split(/\s+/);

  return (
    parts[parts.length - 1] ?? ""
  );
}

function getCurrentDateTime() {
  return new Date().toLocaleString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}