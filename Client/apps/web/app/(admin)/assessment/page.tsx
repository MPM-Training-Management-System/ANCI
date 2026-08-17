"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

/* ==========================================================
   TYPES
========================================================== */

type AssessmentType =
  | "Written Exam"
  | "Practical Assessment";

type AssessmentStatus =
  | "Draft"
  | "Published";

type TrainingOption = {
  name: string;
  code: string;
};

type Question = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  points: number;
};

type Criterion = {
  id: string;
  name: string;
  description: string;
  maxScore: number;
};

type Assessment = {
  id: string;

  title: string;
  description: string;

  training: string;
  trainingCode: string;

  type: AssessmentType;
  status: AssessmentStatus;

  passingScore: number;
  duration: number;
  attemptsAllowed: number;

  instructions: string;

  questions: Question[];
  criteria: Criterion[];

  createdAt: string;
  updatedAt: string;
};

/* ==========================================================
   MOCK DATA
========================================================== */

const trainingOptions: TrainingOption[] = [
  {
    name: "Computer Systems Servicing NC II",
    code: "CSS-NCII",
  },
  {
    name: "Web Development Fundamentals",
    code: "WEB-DEV",
  },
  {
    name: "Electrical Installation and Maintenance NC II",
    code: "EIM-NCII",
  },
];

const initialAssessments: Assessment[] = [
  {
    id: "ASM-001",

    title: "Computer Hardware Fundamentals",

    description:
      "Written examination covering computer hardware components and their functions.",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    type: "Written Exam",
    status: "Published",

    passingScore: 75,
    duration: 30,
    attemptsAllowed: 1,

    instructions:
      "Read each question carefully and select the best answer.",

    questions: [
      {
        id: "Q-001",
        question:
          "What is the main function of RAM?",

        choices: [
          "Permanent storage",
          "Temporary data storage",
          "Power supply",
          "Network connection",
        ],

        correctAnswer:
          "Temporary data storage",

        points: 5,
      },

      {
        id: "Q-002",
        question:
          "Which component is responsible for processing instructions?",

        choices: [
          "CPU",
          "RAM",
          "SSD",
          "Power Supply",
        ],

        correctAnswer: "CPU",

        points: 5,
      },

      {
        id: "Q-003",
        question:
          "Which device is primarily used for permanent data storage?",

        choices: [
          "RAM",
          "CPU",
          "SSD",
          "Monitor",
        ],

        correctAnswer: "SSD",

        points: 5,
      },
    ],

    criteria: [],

    createdAt: "August 5, 2026",
    updatedAt: "August 10, 2026",
  },

  {
    id: "ASM-002",

    title: "PC Assembly Practical Assessment",

    description:
      "Practical assessment for proper computer assembly and installation.",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    type: "Practical Assessment",
    status: "Published",

    passingScore: 75,
    duration: 60,
    attemptsAllowed: 1,

    instructions:
      "Complete the practical task while following proper safety procedures.",

    questions: [],

    criteria: [
      {
        id: "C-001",

        name: "Hardware Installation",

        description:
          "Correctly installs the required computer components.",

        maxScore: 20,
      },

      {
        id: "C-002",

        name: "Cable Management",

        description:
          "Properly connects and organizes internal cables.",

        maxScore: 20,
      },

      {
        id: "C-003",

        name: "OS Installation",

        description:
          "Successfully installs and configures the operating system.",

        maxScore: 20,
      },

      {
        id: "C-004",

        name: "Troubleshooting",

        description:
          "Identifies and resolves common hardware problems.",

        maxScore: 20,
      },

      {
        id: "C-005",

        name: "Safety Procedures",

        description:
          "Follows proper laboratory safety procedures.",

        maxScore: 20,
      },
    ],

    createdAt: "August 7, 2026",
    updatedAt: "August 11, 2026",
  },

  {
    id: "ASM-003",

    title: "Network Configuration Exam",

    description:
      "Written examination covering basic networking concepts and configuration.",

    training: "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",

    type: "Written Exam",
    status: "Draft",

    passingScore: 75,
    duration: 45,
    attemptsAllowed: 2,

    instructions:
      "Read every question carefully before selecting your answer.",

    questions: [
      {
        id: "Q-004",

        question:
          "What device is commonly used to connect multiple devices within a local network?",

        choices: [
          "Switch",
          "Monitor",
          "Printer",
          "Scanner",
        ],

        correctAnswer: "Switch",

        points: 5,
      },
    ],

    criteria: [],

    createdAt: "August 12, 2026",
    updatedAt: "August 12, 2026",
  },
];

/* ==========================================================
   EMPTY VALUES
========================================================== */

const emptyAssessment = {
  title: "",

  description: "",

  type: "Written Exam" as AssessmentType,

  status: "Draft" as AssessmentStatus,

  passingScore: 75,

  duration: 30,

  attemptsAllowed: 1,

  instructions: "",
};

const emptyQuestion = {
  question: "",

  choices: [
    "",
    "",
    "",
    "",
  ],

  correctAnswer: "",

  points: 5,
};

const emptyCriterion = {
  name: "",

  description: "",

  maxScore: 10,
};

/* ==========================================================
   MAIN PAGE
========================================================== */

export default function TrainerAssessmentsPage() {
  const [
    selectedTraining,
    setSelectedTraining,
  ] = useState(
    "Computer Systems Servicing NC II",
  );

  const [
    assessments,
    setAssessments,
  ] = useState<Assessment[]>(
    initialAssessments,
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "All" | AssessmentStatus
  >("All");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<
    "All" | AssessmentType
  >("All");

  const [
    showAssessmentModal,
    setShowAssessmentModal,
  ] = useState(false);

  const [
    showBuilderModal,
    setShowBuilderModal,
  ] = useState(false);

  const [
    showPreviewModal,
    setShowPreviewModal,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    selectedAssessment,
    setSelectedAssessment,
  ] = useState<Assessment | null>(
    null,
  );

  const [
    editingAssessment,
    setEditingAssessment,
  ] = useState<Assessment | null>(
    null,
  );

  const [
    assessmentForm,
    setAssessmentForm,
  ] = useState(emptyAssessment);

  /* ========================================================
     TRAINING ASSESSMENTS
  ======================================================== */

  const trainingAssessments =
    useMemo(() => {
      return assessments.filter(
        (assessment) =>
          assessment.training ===
          selectedTraining,
      );
    }, [
      assessments,
      selectedTraining,
    ]);

  /* ========================================================
     FILTERED ASSESSMENTS
  ======================================================== */

  const filteredAssessments =
    useMemo(() => {
      const query =
        search.toLowerCase().trim();

      return trainingAssessments
        .filter((assessment) => {
          if (
            statusFilter === "All"
          ) {
            return true;
          }

          return (
            assessment.status ===
            statusFilter
          );
        })

        .filter((assessment) => {
          if (
            typeFilter === "All"
          ) {
            return true;
          }

          return (
            assessment.type ===
            typeFilter
          );
        })

        .filter((assessment) => {
          if (!query) {
            return true;
          }

          return (
            assessment.title
              .toLowerCase()
              .includes(query) ||
            assessment.description
              .toLowerCase()
              .includes(query)
          );
        })

        .sort((a, b) =>
          a.title.localeCompare(
            b.title,
            undefined,
            {
              sensitivity: "base",
            },
          ),
        );
    }, [
      trainingAssessments,
      search,
      statusFilter,
      typeFilter,
    ]);

  /* ========================================================
     SUMMARY
  ======================================================== */

  const publishedCount =
    trainingAssessments.filter(
      (assessment) =>
        assessment.status ===
        "Published",
    ).length;

  const draftCount =
    trainingAssessments.filter(
      (assessment) =>
        assessment.status ===
        "Draft",
    ).length;

  const writtenCount =
    trainingAssessments.filter(
      (assessment) =>
        assessment.type ===
        "Written Exam",
    ).length;

  const practicalCount =
    trainingAssessments.filter(
      (assessment) =>
        assessment.type ===
        "Practical Assessment",
    ).length;

  /* ========================================================
     CREATE
  ======================================================== */

  function openCreateAssessment() {
    setEditingAssessment(null);

    setAssessmentForm({
      ...emptyAssessment,
    });

    setShowAssessmentModal(true);
  }

  /* ========================================================
     SETTINGS
  ======================================================== */

  function openSettings(
    assessment: Assessment,
  ) {
    setEditingAssessment(
      assessment,
    );

    setAssessmentForm({
      title: assessment.title,

      description:
        assessment.description,

      type: assessment.type,

      status: assessment.status,

      passingScore:
        assessment.passingScore,

      duration:
        assessment.duration,

      attemptsAllowed:
        assessment.attemptsAllowed,

      instructions:
        assessment.instructions,
    });

    setShowAssessmentModal(true);
  }

  /* ========================================================
     SAVE SETTINGS
  ======================================================== */

  function saveAssessment() {
    const title =
      assessmentForm.title.trim();

    if (!title) {
      alert(
        "Please enter an assessment title.",
      );

      return;
    }

    if (
      assessmentForm.passingScore <
        1 ||
      assessmentForm.passingScore >
        100
    ) {
      alert(
        "Passing score must be between 1 and 100.",
      );

      return;
    }

    if (
      assessmentForm.duration <
      1
    ) {
      alert(
        "Duration must be at least 1 minute.",
      );

      return;
    }

    if (
      assessmentForm.attemptsAllowed <
      1
    ) {
      alert(
        "Attempts must be at least 1.",
      );

      return;
    }

    if (editingAssessment) {
      setAssessments(
        (current) =>
          current.map(
            (assessment) => {
              if (
                assessment.id !==
                editingAssessment.id
              ) {
                return assessment;
              }

              return {
                ...assessment,

                title,

                description:
                  assessmentForm.description.trim(),

                type:
                  assessmentForm.type,

                status:
                  assessmentForm.status,

                passingScore:
                  assessmentForm.passingScore,

                duration:
                  assessmentForm.duration,

                attemptsAllowed:
                  assessmentForm.attemptsAllowed,

                instructions:
                  assessmentForm.instructions.trim(),

                updatedAt:
                  getTodayDate(),
              };
            },
          ),
      );
    } else {
      const newAssessment: Assessment =
        {
          id: `ASM-${String(
            assessments.length + 1,
          ).padStart(3, "0")}`,

          title,

          description:
            assessmentForm.description.trim(),

          training:
            selectedTraining,

          trainingCode:
            getTrainingCode(
              selectedTraining,
            ),

          type:
            assessmentForm.type,

          status:
            assessmentForm.status,

          passingScore:
            assessmentForm.passingScore,

          duration:
            assessmentForm.duration,

          attemptsAllowed:
            assessmentForm.attemptsAllowed,

          instructions:
            assessmentForm.instructions.trim(),

          questions: [],

          criteria: [],

          createdAt:
            getTodayDate(),

          updatedAt:
            getTodayDate(),
        };

      setAssessments(
        (current) => [
          ...current,
          newAssessment,
        ],
      );
    }

    setShowAssessmentModal(false);

    setEditingAssessment(null);
  }

  /* ========================================================
     CONTENT
  ======================================================== */

  function openContent(
    assessment: Assessment,
  ) {
    setSelectedAssessment(
      assessment,
    );

    setShowBuilderModal(true);
  }

  /* ========================================================
     PREVIEW
  ======================================================== */

  function openPreview(
    assessment: Assessment,
  ) {
    setSelectedAssessment(
      assessment,
    );

    setShowPreviewModal(true);
  }

  /* ========================================================
     PUBLISH
  ======================================================== */

  function togglePublish(
    assessment: Assessment,
  ) {
    setAssessments(
      (current) =>
        current.map(
          (item) => {
            if (
              item.id !==
              assessment.id
            ) {
              return item;
            }

            return {
              ...item,

              status:
                item.status ===
                "Published"
                  ? "Draft"
                  : "Published",

              updatedAt:
                getTodayDate(),
            };
          },
        ),
    );
  }

  /* ========================================================
     DELETE
  ======================================================== */

  function openDelete(
    assessment: Assessment,
  ) {
    setSelectedAssessment(
      assessment,
    );

    setShowDeleteModal(true);
  }

  function deleteAssessment() {
    if (!selectedAssessment) {
      return;
    }

    setAssessments(
      (current) =>
        current.filter(
          (assessment) =>
            assessment.id !==
            selectedAssessment.id,
        ),
    );

    setSelectedAssessment(null);

    setShowDeleteModal(false);
  }

  /* ========================================================
     SAVE CONTENT
  ======================================================== */

  function saveBuilder(
    updatedAssessment: Assessment,
  ) {
    setAssessments(
      (current) =>
        current.map(
          (assessment) =>
            assessment.id ===
            updatedAssessment.id
              ? {
                  ...updatedAssessment,

                  updatedAt:
                    getTodayDate(),
                }
              : assessment,
        ),
    );

    setSelectedAssessment(
      updatedAssessment,
    );
  }

  /* ========================================================
     CLEAR FILTERS
  ======================================================== */

  function clearFilters() {
    setSearch("");

    setStatusFilter("All");

    setTypeFilter("All");
  }

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">

            <span>Trainer</span>

            <span>/</span>

            <span className="font-medium text-gray-600">
              Assessments
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Assessments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Create and manage written exams
            and practical assessments for
            your assigned training programs.
          </p>

        </div>

        <button
          type="button"
          onClick={
            openCreateAssessment
          }
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#191c1e] px-5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <span className="mr-2 text-base">
            +
          </span>

          Create Assessment
        </button>

      </div>

      {/* ==================================================
          INFO
      ================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          i
        </div>

        <div>

          <p className="text-sm font-semibold text-blue-900">
            Trainer-created assessments
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Create written exams that can be
            automatically scored and practical
            assessments that can be manually
            graded by the trainer.
          </p>

        </div>

      </div>

      {/* ==================================================
          TRAINING SELECTOR
      ================================================== */}

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

              setStatusFilter(
                "All",
              );

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

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <SummaryCard
          label="Total"
          value={
            trainingAssessments.length
          }
        />

        <SummaryCard
          label="Published"
          value={publishedCount}
          type="success"
        />

        <SummaryCard
          label="Draft"
          value={draftCount}
          type="warning"
        />

        <SummaryCard
          label="Written / Practical"
          value={`${writtenCount} / ${practicalCount}`}
          type="info"
        />

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

        {/* TABLE TOOLBAR */}

        <div className="border-b border-[#eef0f2] p-5">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Assessment List
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Assessments created for{" "}
                {selectedTraining}.
              </p>

            </div>

            <div className="flex w-full flex-col gap-2 md:flex-row xl:w-auto">

              {/* SEARCH */}

              <div className="relative w-full md:w-64">

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
                  placeholder="Search assessment..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-9 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-xs text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                  >
                    ×
                  </button>
                )}

              </div>

              {/* TYPE */}

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value as
                      | "All"
                      | AssessmentType,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
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

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | AssessmentStatus,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Draft">
                  Draft
                </option>
              </select>

            </div>

          </div>

          {(search ||
            statusFilter !==
              "All" ||
            typeFilter !==
              "All") && (
            <div className="mt-4 flex items-center gap-2">

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                {
                  filteredAssessments.length
                }{" "}
                result
                {filteredAssessments.length !==
                1
                  ? "s"
                  : ""}
              </span>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="text-[10px] font-semibold text-gray-500 underline underline-offset-2 transition hover:text-gray-800"
              >
                Clear filters
              </button>

            </div>
          )}

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1180px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Assessment
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Type
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Content
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Passing
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Duration
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#eef0f2]">

              {filteredAssessments.map(
                (assessment) => {
                  const contentCount =
                    assessment.type ===
                    "Written Exam"
                      ? assessment
                          .questions
                          .length
                      : assessment
                          .criteria
                          .length;

                  const contentLabel =
                    assessment.type ===
                    "Written Exam"
                      ? "questions"
                      : "criteria";

                  return (
                    <tr
                      key={
                        assessment.id
                      }
                      className="transition hover:bg-[#fafbfc]"
                    >

                      {/* ASSESSMENT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                              assessment.type ===
                              "Written Exam"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {assessment.type ===
                            "Written Exam"
                              ? "Q"
                              : "P"}
                          </div>

                          <div className="max-w-[330px]">

                            <p className="truncate text-xs font-semibold">
                              {
                                assessment.title
                              }
                            </p>

                            <p className="mt-1 truncate text-[10px] text-gray-400">
                              {
                                assessment.id
                              }{" "}
                              ·{" "}
                              {
                                assessment.trainingCode
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* TYPE */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1.5 text-[9px] font-bold ${
                            assessment.type ===
                            "Written Exam"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {
                            assessment.type
                          }
                        </span>

                      </td>

                      {/* CONTENT */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-bold">
                          {
                            contentCount
                          }
                        </p>

                        <p className="mt-1 text-[9px] text-gray-400">
                          {
                            contentLabel
                          }
                        </p>

                      </td>

                      {/* PASSING */}

                      <td className="px-5 py-4">

                        <span className="text-sm font-bold">
                          {
                            assessment.passingScore
                          }
                          %
                        </span>

                      </td>

                      {/* DURATION */}

                      <td className="px-5 py-4">

                        <span className="text-xs text-gray-600">
                          {
                            assessment.duration
                          }{" "}
                          min
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                            assessment.status ===
                            "Published"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {
                            assessment.status
                          }
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-1.5">

                          {/* CONTENT */}

                          <button
                            type="button"
                            onClick={() =>
                              openContent(
                                assessment,
                              )
                            }
                            className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
                          >
                            Content
                          </button>

                          {/* PREVIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              openPreview(
                                assessment,
                              )
                            }
                            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                          >
                            Preview
                          </button>

                          {/* SETTINGS */}

                          <button
                            type="button"
                            onClick={() =>
                              openSettings(
                                assessment,
                              )
                            }
                            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                          >
                            Settings
                          </button>

                          {/* PUBLISH */}

                          <button
                            type="button"
                            onClick={() =>
                              togglePublish(
                                assessment,
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${
                              assessment.status ===
                              "Published"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {assessment.status ===
                            "Published"
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              openDelete(
                                assessment,
                              )
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

        </div>

        {filteredAssessments.length ===
          0 && (
          <EmptyState />
        )}

        {/* FOOTER */}

        <div className="flex flex-col gap-2 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] text-gray-400">
            Assessments are sorted
            alphabetically by title.
          </p>

          <p className="text-[10px] font-medium text-gray-500">
            {
              filteredAssessments.length
            }{" "}
            displayed
          </p>

        </div>

      </section>

      {/* ==================================================
          SETTINGS MODAL
      ================================================== */}

      {showAssessmentModal &&
        (
          <AssessmentSettingsModal
            editing={
              editingAssessment
            }
            form={assessmentForm}
            setForm={
              setAssessmentForm
            }
            onClose={() => {
              setShowAssessmentModal(
                false,
              );

              setEditingAssessment(
                null,
              );
            }}
            onSave={
              saveAssessment
            }
          />
        )}

      {/* ==================================================
          CONTENT BUILDER
      ================================================== */}

      {showBuilderModal &&
        selectedAssessment && (
          <AssessmentContentModal
            assessment={
              selectedAssessment
            }
            onClose={() => {
              setShowBuilderModal(
                false,
              );

              setSelectedAssessment(
                null,
              );
            }}
            onSave={
              saveBuilder
            }
          />
        )}

      {/* ==================================================
          PREVIEW
      ================================================== */}

      {showPreviewModal &&
        selectedAssessment && (
          <PreviewModal
            assessment={
              selectedAssessment
            }
            onClose={() => {
              setShowPreviewModal(
                false,
              );

              setSelectedAssessment(
                null,
              );
            }}
          />
        )}

      {/* ==================================================
          DELETE
      ================================================== */}

      {showDeleteModal &&
        selectedAssessment && (
          <DeleteModal
            assessment={
              selectedAssessment
            }
            onClose={() => {
              setShowDeleteModal(
                false,
              );

              setSelectedAssessment(
                null,
              );
            }}
            onConfirm={
              deleteAssessment
            }
          />
        )}

    </div>
  );
}

/* ==========================================================
   SETTINGS MODAL
========================================================== */

function AssessmentSettingsModal({
  editing,
  form,
  setForm,
  onClose,
  onSave,
}: {
  editing: Assessment | null;

  form: typeof emptyAssessment;

  setForm: Dispatch<
    SetStateAction<
      typeof emptyAssessment
    >
  >;

  onClose: () => void;

  onSave: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Assessment Settings
            </p>

            <h2 className="mt-1 text-lg font-bold">
              {editing
                ? "Assessment Settings"
                : "Create Assessment"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Configure the basic information
              and rules for the assessment.
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

          <div className="space-y-5">

            {/* TITLE */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Assessment Title
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      title:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="e.g. Computer Hardware Fundamentals"
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Description
              </label>

              <textarea
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      description:
                        event.target
                          .value,
                    }),
                  )
                }
                rows={3}
                placeholder="Describe the assessment..."
                className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* TYPE + STATUS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Assessment Type
                </label>

                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,

                        type:
                          event.target
                            .value as AssessmentType,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                >

                  <option value="Written Exam">
                    Written Exam
                  </option>

                  <option value="Practical Assessment">
                    Practical Assessment
                  </option>

                </select>

              </div>

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,

                        status:
                          event.target
                            .value as AssessmentStatus,
                      }),
                    )
                  }
                  className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                >

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>

                </select>

              </div>

            </div>

            {/* SETTINGS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              {/* PASSING */}

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Passing Score
                </label>

                <div className="relative">

                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={
                      form.passingScore
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,

                          passingScore:
                            Number(
                              event.target
                                .value,
                            ),
                        }),
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 pr-8 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    %
                  </span>

                </div>

              </div>

              {/* DURATION */}

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Duration
                </label>

                <div className="relative">

                  <input
                    type="number"
                    min={1}
                    value={
                      form.duration
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,

                          duration:
                            Number(
                              event.target
                                .value,
                            ),
                        }),
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 pr-12 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                    min
                  </span>

                </div>

              </div>

              {/* ATTEMPTS */}

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Attempts
                </label>

                <input
                  type="number"
                  min={1}
                  value={
                    form.attemptsAllowed
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,

                        attemptsAllowed:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                  className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

              </div>

            </div>

            {/* INSTRUCTIONS */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Instructions
              </label>

              <textarea
                value={
                  form.instructions
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      instructions:
                        event.target
                          .value,
                    }),
                  )
                }
                rows={4}
                placeholder="Instructions for participants..."
                className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* INFO */}

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">

              <p className="text-xs font-semibold text-gray-700">
                What happens next?
              </p>

              <p className="mt-1 text-[10px] leading-5 text-gray-500">
                After saving the settings,
                use <b>Content</b> to add
                questions for written exams
                or criteria for practical
                assessments.
              </p>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
          >
            {editing
              ? "Save Settings"
              : "Create Assessment"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   CONTENT MODAL
========================================================== */

function AssessmentContentModal({
  assessment,
  onClose,
  onSave,
}: {
  assessment: Assessment;

  onClose: () => void;

  onSave: (
    assessment: Assessment,
  ) => void;
}) {
  const [current, setCurrent] =
    useState<Assessment>(
      assessment,
    );

  const [
    showQuestionForm,
    setShowQuestionForm,
  ] = useState(false);

  const [
    showCriterionForm,
    setShowCriterionForm,
  ] = useState(false);

  const [
    editingQuestion,
    setEditingQuestion,
  ] = useState<Question | null>(
    null,
  );

  const [
    editingCriterion,
    setEditingCriterion,
  ] = useState<Criterion | null>(
    null,
  );

  const [
    questionForm,
    setQuestionForm,
  ] = useState(emptyQuestion);

  const [
    criterionForm,
    setCriterionForm,
  ] = useState(emptyCriterion);

  /* ========================================================
     QUESTION
  ======================================================== */

  function openAddQuestion() {
    setEditingQuestion(null);

    setQuestionForm({
      ...emptyQuestion,

      choices: [
        "",
        "",
        "",
        "",
      ],
    });

    setShowQuestionForm(true);
  }

  function editQuestion(
    question: Question,
  ) {
    setEditingQuestion(
      question,
    );

    const choices = [
      ...question.choices,
    ];

    while (choices.length < 4) {
      choices.push("");
    }

    setQuestionForm({
      question:
        question.question,

      choices: choices.slice(
        0,
        4,
      ),

      correctAnswer:
        question.correctAnswer,

      points: question.points,
    });

    setShowQuestionForm(true);
  }

  function saveQuestion() {
    if (
      !questionForm.question.trim()
    ) {
      alert(
        "Please enter the question.",
      );

      return;
    }

    const choices =
      questionForm.choices
        .map((choice) =>
          choice.trim(),
        )
        .filter(Boolean);

    if (choices.length < 2) {
      alert(
        "Please provide at least 2 answer choices.",
      );

      return;
    }

    if (
      !questionForm.correctAnswer ||
      !choices.includes(
        questionForm.correctAnswer,
      )
    ) {
      alert(
        "Please select a valid correct answer.",
      );

      return;
    }

    if (questionForm.points < 1) {
      alert(
        "Points must be at least 1.",
      );

      return;
    }

    const newQuestion: Question =
      {
        id:
          editingQuestion?.id ??
          `Q-${Date.now()}`,

        question:
          questionForm.question.trim(),

        choices,

        correctAnswer:
          questionForm.correctAnswer,

        points:
          questionForm.points,
      };

    setCurrent((previous) => ({
      ...previous,

      questions:
        editingQuestion
          ? previous.questions.map(
              (question) =>
                question.id ===
                editingQuestion.id
                  ? newQuestion
                  : question,
            )
          : [
              ...previous.questions,
              newQuestion,
            ],
    }));

    closeQuestionForm();
  }

  function deleteQuestion(
    questionId: string,
  ) {
    const confirmed =
      window.confirm(
        "Delete this question?",
      );

    if (!confirmed) {
      return;
    }

    setCurrent((previous) => ({
      ...previous,

      questions:
        previous.questions.filter(
          (question) =>
            question.id !==
            questionId,
        ),
    }));
  }

  function closeQuestionForm() {
    setShowQuestionForm(false);

    setEditingQuestion(null);

    setQuestionForm({
      ...emptyQuestion,

      choices: [
        "",
        "",
        "",
        "",
      ],
    });
  }

  /* ========================================================
     CRITERIA
  ======================================================== */

  function openAddCriterion() {
    setEditingCriterion(null);

    setCriterionForm({
      ...emptyCriterion,
    });

    setShowCriterionForm(true);
  }

  function editCriterion(
    criterion: Criterion,
  ) {
    setEditingCriterion(
      criterion,
    );

    setCriterionForm({
      name: criterion.name,

      description:
        criterion.description,

      maxScore:
        criterion.maxScore,
    });

    setShowCriterionForm(true);
  }

  function saveCriterion() {
    if (
      !criterionForm.name.trim()
    ) {
      alert(
        "Please enter a criterion name.",
      );

      return;
    }

    if (
      criterionForm.maxScore < 1
    ) {
      alert(
        "Maximum score must be at least 1.",
      );

      return;
    }

    const newCriterion: Criterion =
      {
        id:
          editingCriterion?.id ??
          `C-${Date.now()}`,

        name:
          criterionForm.name.trim(),

        description:
          criterionForm.description.trim(),

        maxScore:
          criterionForm.maxScore,
      };

    setCurrent((previous) => ({
      ...previous,

      criteria:
        editingCriterion
          ? previous.criteria.map(
              (criterion) =>
                criterion.id ===
                editingCriterion.id
                  ? newCriterion
                  : criterion,
            )
          : [
              ...previous.criteria,
              newCriterion,
            ],
    }));

    closeCriterionForm();
  }

  function deleteCriterion(
    criterionId: string,
  ) {
    const confirmed =
      window.confirm(
        "Delete this criterion?",
      );

    if (!confirmed) {
      return;
    }

    setCurrent((previous) => ({
      ...previous,

      criteria:
        previous.criteria.filter(
          (criterion) =>
            criterion.id !==
            criterionId,
        ),
    }));
  }

  function closeCriterionForm() {
    setShowCriterionForm(false);

    setEditingCriterion(null);

    setCriterionForm({
      ...emptyCriterion,
    });
  }

  /* ========================================================
     TOTALS
  ======================================================== */

  const totalQuestionPoints =
    current.questions.reduce(
      (total, question) =>
        total + question.points,
      0,
    );

  const totalCriteriaPoints =
    current.criteria.reduce(
      (total, criterion) =>
        total + criterion.maxScore,
      0,
    );

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  current.type ===
                  "Written Exam"
                    ? "bg-violet-50 text-violet-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {current.type}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  current.status ===
                  "Published"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {current.status}
              </span>

            </div>

            <h2 className="mt-2 text-lg font-bold">
              {current.title}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {current.training}
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

          {/* =================================================
              WRITTEN EXAM
          ================================================= */}

          {current.type ===
            "Written Exam" && (
            <div className="space-y-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="text-sm font-bold">
                    Exam Questions
                  </h3>

                  <p className="mt-1 text-[10px] text-gray-400">
                    {
                      current.questions
                        .length
                    }{" "}
                    questions ·{" "}
                    {
                      totalQuestionPoints
                    }{" "}
                    points
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    openAddQuestion
                  }
                  className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[10px] font-semibold text-white transition hover:opacity-90"
                >
                  + Add Question
                </button>

              </div>

              {current.questions
                .length === 0 ? (
                <EmptyBuilder
                  text="No questions yet. Add questions to build this written exam."
                />
              ) : (
                <div className="space-y-3">

                  {current.questions.map(
                    (
                      question,
                      index,
                    ) => (
                      <div
                        key={
                          question.id
                        }
                        className="rounded-2xl border border-[#e7e9ec] p-5"
                      >

                        <div className="flex gap-4">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#191c1e] text-[10px] font-bold text-white">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <p className="text-xs font-semibold leading-5">
                                {
                                  question.question
                                }
                              </p>

                              <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-500">
                                {
                                  question.points
                                }{" "}
                                pts
                              </span>

                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">

                              {question.choices.map(
                                (
                                  choice,
                                ) => (
                                  <div
                                    key={
                                      choice
                                    }
                                    className={`rounded-xl border px-3 py-2.5 text-[10px] ${
                                      choice ===
                                      question.correctAnswer
                                        ? "border-emerald-200 bg-emerald-50 font-semibold text-emerald-700"
                                        : "border-[#eef0f2] bg-[#fafbfc] text-gray-600"
                                    }`}
                                  >
                                    {choice ===
                                    question.correctAnswer
                                      ? "✓ "
                                      : "○ "}

                                    {
                                      choice
                                    }
                                  </div>
                                ),
                              )}

                            </div>

                            <div className="mt-4 flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  editQuestion(
                                    question,
                                  )
                                }
                                className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteQuestion(
                                    question.id,
                                  )
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
                              >
                                Delete
                              </button>

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

          {/* =================================================
              PRACTICAL ASSESSMENT
          ================================================= */}

          {current.type ===
            "Practical Assessment" && (
            <div className="space-y-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h3 className="text-sm font-bold">
                    Assessment Criteria
                  </h3>

                  <p className="mt-1 text-[10px] text-gray-400">
                    {
                      current.criteria
                        .length
                    }{" "}
                    criteria ·{" "}
                    {
                      totalCriteriaPoints
                    }{" "}
                    total points
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    openAddCriterion
                  }
                  className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[10px] font-semibold text-white transition hover:opacity-90"
                >
                  + Add Criterion
                </button>

              </div>

              {current.criteria
                .length === 0 ? (
                <EmptyBuilder
                  text="No criteria yet. Add the criteria that the trainer will use when grading the practical assessment."
                />
              ) : (
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

                        <div className="flex gap-4">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div>

                                <p className="text-xs font-semibold">
                                  {
                                    criterion.name
                                  }
                                </p>

                                <p className="mt-1 text-[10px] leading-5 text-gray-400">
                                  {
                                    criterion.description ||
                                    "No description."
                                  }
                                </p>

                              </div>

                              <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[9px] font-bold text-gray-600">
                                {
                                  criterion.maxScore
                                }{" "}
                                pts
                              </span>

                            </div>

                            <div className="mt-4 flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  editCriterion(
                                    criterion,
                                  )
                                }
                                className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteCriterion(
                                    criterion.id,
                                  )
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
                              >
                                Delete
                              </button>

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

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col gap-3 border-t border-[#eef0f2] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="text-[10px] text-gray-400">

            {current.type ===
            "Written Exam"
              ? `${current.questions.length} questions · ${totalQuestionPoints} points`
              : `${current.criteria.length} criteria · ${totalCriteriaPoints} points`}

          </div>

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
              onClick={() => {
                onSave(current);

                onClose();
              }}
              className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
            >
              Save Content
            </button>

          </div>

        </div>

      </div>

      {/* ==================================================
          QUESTION FORM
      ================================================== */}

      {showQuestionForm && (
        <QuestionForm
          form={questionForm}
          setForm={
            setQuestionForm
          }
          editing={
            editingQuestion
          }
          onClose={
            closeQuestionForm
          }
          onSave={
            saveQuestion
          }
        />
      )}

      {/* ==================================================
          CRITERION FORM
      ================================================== */}

      {showCriterionForm && (
        <CriterionForm
          form={criterionForm}
          setForm={
            setCriterionForm
          }
          editing={
            editingCriterion
          }
          onClose={
            closeCriterionForm
          }
          onSave={
            saveCriterion
          }
        />
      )}

    </div>
  );
}

/* ==========================================================
   QUESTION FORM
========================================================== */

function QuestionForm({
  form,
  setForm,
  editing,
  onClose,
  onSave,
}: {
  form: typeof emptyQuestion;

  setForm: Dispatch<
    SetStateAction<
      typeof emptyQuestion
    >
  >;

  editing: Question | null;

  onClose: () => void;

  onSave: () => void;
}) {
  function updateChoice(
    index: number,
    value: string,
  ) {
    setForm((current) => {
      const previousChoice =
        current.choices[index];

      const choices = [
        ...current.choices,
      ];

      choices[index] = value;

      let correctAnswer =
        current.correctAnswer;

      if (
        previousChoice ===
        current.correctAnswer
      ) {
        correctAnswer = value;
      }

      return {
        ...current,

        choices,

        correctAnswer,
      };
    });
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-violet-500">
              Written Exam
            </p>

            <h2 className="mt-1 text-lg font-bold">
              {editing
                ? "Edit Question"
                : "Add Question"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Create a multiple-choice
              question.
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

          <div className="space-y-5">

            {/* QUESTION */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Question
              </label>

              <textarea
                value={
                  form.question
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      question:
                        event.target
                          .value,
                    }),
                  )
                }
                rows={4}
                placeholder="Enter your question..."
                className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* CHOICES */}

            <div>

              <div className="flex items-center justify-between">

                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Answer Choices
                </label>

                <span className="text-[9px] text-gray-400">
                  Select the correct answer
                </span>

              </div>

              <div className="mt-3 space-y-3">

                {form.choices.map(
                  (
                    choice,
                    index,
                  ) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 rounded-xl border p-2 transition ${
                        form.correctAnswer ===
                        choice &&
                        choice.trim()
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-transparent"
                      }`}
                    >

                      <input
                        type="radio"
                        name="correct-answer"
                        checked={
                          form.correctAnswer ===
                            choice &&
                          choice.trim() !==
                            ""
                        }
                        onChange={() =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              correctAnswer:
                                choice,
                            }),
                          )
                        }
                        className="h-4 w-4 accent-[#191c1e]"
                      />

                      <input
                        value={
                          choice
                        }
                        onChange={(
                          event,
                        ) =>
                          updateChoice(
                            index,
                            event
                              .target
                              .value,
                          )
                        }
                        placeholder={`Choice ${
                          index + 1
                        }`}
                        className="h-11 flex-1 rounded-xl border border-[#e7e9ec] bg-white px-3 text-xs outline-none transition focus:border-gray-300"
                      />

                    </div>
                  ),
                )}

              </div>

            </div>

            {/* POINTS */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Points
              </label>

              <input
                type="number"
                min={1}
                value={
                  form.points
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      points:
                        Number(
                          event.target
                            .value,
                        ),
                    }),
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
          >
            {editing
              ? "Save Question"
              : "Add Question"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   CRITERION FORM
========================================================== */

function CriterionForm({
  form,
  setForm,
  editing,
  onClose,
  onSave,
}: {
  form: typeof emptyCriterion;

  setForm: Dispatch<
    SetStateAction<
      typeof emptyCriterion
    >
  >;

  editing: Criterion | null;

  onClose: () => void;

  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              Practical Assessment
            </p>

            <h2 className="mt-1 text-lg font-bold">
              {editing
                ? "Edit Criterion"
                : "Add Criterion"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Define how the participant
              will be evaluated.
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

          <div className="space-y-5">

            {/* NAME */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Criterion Name
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      name:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="e.g. Hardware Installation"
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Description
              </label>

              <textarea
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      description:
                        event.target
                          .value,
                    }),
                  )
                }
                rows={4}
                placeholder="Describe what the participant is expected to demonstrate..."
                className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* MAX SCORE */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Maximum Score
              </label>

              <input
                type="number"
                min={1}
                value={
                  form.maxScore
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      maxScore:
                        Number(
                          event.target
                            .value,
                        ),
                    }),
                  )
                }
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
          >
            {editing
              ? "Save Criterion"
              : "Add Criterion"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   PREVIEW
========================================================== */

function PreviewModal({
  assessment,
  onClose,
}: {
  assessment: Assessment;

  onClose: () => void;
}) {
  const isWritten =
    assessment.type ===
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

      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ${
                isWritten
                  ? "bg-violet-50 text-violet-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {assessment.type}
            </span>

            <h2 className="mt-3 text-xl font-bold">
              {assessment.title}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Passing Score:{" "}
              {
                assessment.passingScore
              }
              %
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

          {/* INFO */}

          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <PreviewInfo
              label="Duration"
              value={`${assessment.duration} min`}
            />

            <PreviewInfo
              label="Attempts"
              value={String(
                assessment.attemptsAllowed,
              )}
            />

            <PreviewInfo
              label="Status"
              value={
                assessment.status
              }
            />

          </div>

          {/* INSTRUCTIONS */}

          {assessment.instructions && (
            <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-blue-500">
                Instructions
              </p>

              <p className="mt-2 text-xs leading-6 text-blue-800">
                {
                  assessment.instructions
                }
              </p>

            </div>
          )}

          {/* DESCRIPTION */}

          {assessment.description && (
            <div className="mb-5 rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                About this assessment
              </p>

              <p className="mt-2 text-xs leading-6 text-gray-600">
                {
                  assessment.description
                }
              </p>

            </div>
          )}

          {/* WRITTEN */}

          {isWritten ? (
            <div className="space-y-4">

              {assessment.questions
                .length === 0 ? (
                <EmptyBuilder
                  text="No questions have been added yet."
                />
              ) : (
                assessment.questions.map(
                  (
                    question,
                    index,
                  ) => (
                    <div
                      key={
                        question.id
                      }
                      className="rounded-2xl border border-[#e7e9ec] p-5"
                    >

                      <div className="flex gap-4">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#191c1e] text-[10px] font-bold text-white">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <p className="text-sm font-semibold leading-6">
                              {
                                question.question
                              }
                            </p>

                            <span className="shrink-0 text-[9px] font-bold text-gray-400">
                              {
                                question.points
                              }{" "}
                              pts
                            </span>

                          </div>

                          <div className="mt-4 space-y-2">

                            {question.choices.map(
                              (
                                choice,
                              ) => (
                                <div
                                  key={
                                    choice
                                  }
                                  className="rounded-xl border border-[#eef0f2] bg-[#fafbfc] px-4 py-3 text-xs text-gray-600"
                                >
                                  ○{" "}
                                  {
                                    choice
                                  }
                                </div>
                              ),
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  ),
                )
              )}

            </div>
          ) : (
            /* PRACTICAL */
            <div className="space-y-3">

              {assessment.criteria
                .length === 0 ? (
                <EmptyBuilder
                  text="No assessment criteria have been added yet."
                />
              ) : (
                assessment.criteria.map(
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

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <p className="text-xs font-semibold">
                                {
                                  criterion.name
                                }
                              </p>

                              <p className="mt-1 text-[10px] leading-5 text-gray-400">
                                {
                                  criterion.description ||
                                  "No description."
                                }
                              </p>

                            </div>

                            <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[9px] font-bold text-gray-600">
                              {
                                criterion.maxScore
                              }{" "}
                              pts
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>
                  ),
                )
              )}

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
            Close Preview
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   PREVIEW INFO
========================================================== */

function PreviewInfo({
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

      <p className="mt-1 text-xs font-bold text-gray-700">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   DELETE MODAL
========================================================== */

function DeleteModal({
  assessment,
  onClose,
  onConfirm,
}: {
  assessment: Assessment;

  onClose: () => void;

  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
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

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
          !
        </div>

        <h2 className="mt-5 text-xl font-bold">
          Delete Assessment?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-700">
            {assessment.title}
          </span>
          ?
        </p>

        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-3">

          <p className="text-[10px] leading-5 text-red-700">
            This will also remove its
            questions or practical
            assessment criteria from this
            mock data.
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
            className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   SUMMARY CARD
========================================================== */

function SummaryCard({
  label,
  value,
  type,
}: {
  label: string;

  value: string | number;

  type?:
    | "success"
    | "warning"
    | "info";
}) {
  const styles = {
    success:
      "text-emerald-700",

    warning:
      "text-amber-700",

    info:
      "text-blue-700",
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

/* ==========================================================
   EMPTY STATE
========================================================== */

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ?
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No assessments found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your search or
        filters.
      </p>

    </div>
  );
}

/* ==========================================================
   EMPTY BUILDER
========================================================== */

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

/* ==========================================================
   HELPERS
========================================================== */

function getTrainingCode(
  training: string,
) {
  return (
    trainingOptions.find(
      (item) =>
        item.name === training,
    )?.code ?? ""
  );
}

function getTodayDate() {
  return new Date().toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}