"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Eye,
  FileText,
  MessageCircle,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import type {
  Enrollment,
  PracticalAssessment,
  PracticalAssessmentResult,
  ParticipationParticipant,
  ParticipationSetting,
  RecordParticipationRequest,
  TrainerAssessmentSubmission,
  WrittenAssessment,
} from "@repo/types";

import {
  apiClient,
  enrollmentApi,
  trainingBatchApi,
} from "@/lib/api";

import {
  useEnrollments,
  useParticipation,
  usePracticalAssessment,
  useTrainingBatches,
  useWrittenAssessment,
} from "@repo/hooks";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name?: string | null) {
  if (!name?.trim()) {
    return "P";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return (
    parts[0]!.charAt(0) +
    parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

function getPercentage(
  value: number | null | undefined,
) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerAssessmentsPage() {
  /* =======================================================
     WRITTEN ASSESSMENT
  ======================================================= */

  const {
    assessments: writtenAssessments,
    trainerSubmissions,

    loadTrainerAssessments:
      loadWrittenTrainerAssessments,

    loadTrainerSubmissions,
    loadTrainerSubmission,

    isLoading: writtenIsLoading,
    error: writtenError,
  } = useWrittenAssessment(apiClient);

  /* =======================================================
     PRACTICAL ASSESSMENT
  ======================================================= */

  const {
    assessments: practicalAssessments,

    results: practicalResults,

    loadTrainerAssessments:
      loadPracticalTrainerAssessments,

    evaluateAssessment,

    loadResults:
      loadPracticalResults,

    isLoading: practicalIsLoading,

    error: practicalError,
  } = usePracticalAssessment(apiClient);

  /* =======================================================
     ENROLLMENTS
  ======================================================= */

  const {
    trainerEnrollments,

    loadTrainerEnrollments,

    isLoading: enrollmentIsLoading,

    error: enrollmentError,
  } = useEnrollments(enrollmentApi);

  /* =======================================================
     ACTIVE PARTICIPATION
  ======================================================= */

  const {
    batches: trainingBatches,
    trainingSessions,
    getSchedule,
    loadBatches,
  } = useTrainingBatches(trainingBatchApi);

  const {
    setting: participationSetting,
    participants: participationParticipants,
    isLoading: participationIsLoading,
    error: participationError,
    loadSetting,
    loadSessionParticipants,
    recordRecitation,
    removeRecitation,
  } = useParticipation(apiClient);

  /* =======================================================
     TAB
  ======================================================= */

  const [assessmentType, setAssessmentType] =
    useState<"written" | "practical" | "participation">(
      "written",
    );

  const [selectedParticipationSessionId, setSelectedParticipationSessionId] =
    useState<string>("");

  const [participationActionError, setParticipationActionError] =
    useState<string | null>(null);

  /* =======================================================
     COMMON UI
  ======================================================= */

  const [search, setSearch] =
    useState("");

  /* =======================================================
     WRITTEN UI
  ======================================================= */

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] =
    useState<TrainerAssessmentSubmission | null>(
      null,
    );

  const [
    isLoadingSubmission,
    setIsLoadingSubmission,
  ] = useState(false);

  const [
    submissionError,
    setSubmissionError,
  ] = useState<string | null>(null);

  /* =======================================================
     PRACTICAL UI
  ======================================================= */

  const [
    selectedPracticalAssessment,
    setSelectedPracticalAssessment,
  ] =
    useState<PracticalAssessment | null>(
      null,
    );

  const [
    selectedEnrollment,
    setSelectedEnrollment,
  ] =
    useState<Enrollment | null>(null);

  const [
    isEvaluationModalOpen,
    setIsEvaluationModalOpen,
  ] = useState(false);

  const [
    selectedPracticalResult,
    setSelectedPracticalResult,
  ] =
    useState<PracticalAssessmentResult | null>(
      null,
    );

  const [
    isResultModalOpen,
    setIsResultModalOpen,
  ] = useState(false);

  const [
    isSubmittingEvaluation,
    setIsSubmittingEvaluation,
  ] = useState(false);

  const [
    practicalActionError,
    setPracticalActionError,
  ] = useState<string | null>(null);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  const loadPage = useCallback(
    async () => {
      try {
        await Promise.all([
          loadWrittenTrainerAssessments(),
          loadPracticalTrainerAssessments(),
          loadTrainerEnrollments(),
          loadBatches(),
        ]);
      } catch (err) {
        console.error(
          "LOAD TRAINER ASSESSMENT PAGE ERROR:",
          err,
        );
      }
    },
    [
      loadWrittenTrainerAssessments,
      loadPracticalTrainerAssessments,
      loadTrainerEnrollments,
      loadBatches,
    ],
  );

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  /* =======================================================
     WRITTEN CURRENT ASSESSMENT
  ======================================================= */

  const currentWrittenAssessment =
    useMemo<WrittenAssessment | null>(() => {
      return writtenAssessments[0] ?? null;
    }, [writtenAssessments]);

  /* =======================================================
     LOAD WRITTEN SUBMISSIONS
  ======================================================= */

  useEffect(() => {
    if (!currentWrittenAssessment) {
      return;
    }

    void loadTrainerSubmissions(
      currentWrittenAssessment.id,
    ).catch((err) => {
      console.error(
        "LOAD WRITTEN SUBMISSIONS ERROR:",
        err,
      );
    });
  }, [
    currentWrittenAssessment,
    loadTrainerSubmissions,
  ]);

  /* =======================================================
     WRITTEN PARTICIPANTS
  ======================================================= */

  const writtenParticipants =
    useMemo(() => {
      const map = new Map<
        string,
        TrainerAssessmentSubmission
      >();

      trainerSubmissions.forEach(
        (submission) => {
          const key =
            submission.participantId;

          const existing = map.get(key);

          if (!existing) {
            map.set(
              key,
              submission,
            );

            return;
          }

          const existingDate =
            existing.submittedAt
              ? new Date(
                  existing.submittedAt,
                ).getTime()
              : 0;

          const currentDate =
            submission.submittedAt
              ? new Date(
                  submission.submittedAt,
                ).getTime()
              : 0;

          if (
            currentDate >=
            existingDate
          ) {
            map.set(
              key,
              submission,
            );
          }
        },
      );

      return Array.from(
        map.values(),
      );
    }, [trainerSubmissions]);

  /* =======================================================
     FILTER WRITTEN
  ======================================================= */

  const filteredWrittenParticipants =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return writtenParticipants;
      }

      return writtenParticipants.filter(
        (participant) =>
          participant.participantName
            ?.toLowerCase()
            .includes(keyword) ||
          participant.participantEmail
            ?.toLowerCase()
            .includes(keyword),
      );
    }, [
      writtenParticipants,
      search,
    ]);

  /* =======================================================
     PRACTICAL CURRENT ASSESSMENT
  ======================================================= */

 const currentPracticalAssessment =
  useMemo<PracticalAssessment | null>(() => {
    return (
      practicalAssessments.find(
        (assessment) => assessment.isPublished === true
      ) ?? null
    );
  }, [practicalAssessments]);

  /* =======================================================
     LOAD PRACTICAL RESULTS
  ======================================================= */

  useEffect(() => {
    if (!currentPracticalAssessment) {
      return;
    }

    void loadPracticalResults(
      currentPracticalAssessment.id,
    ).catch((err) => {
      console.error(
        "LOAD PRACTICAL RESULTS ERROR:",
        err,
      );
    });
  }, [
    currentPracticalAssessment,
    loadPracticalResults,
  ]);

  /* =======================================================
     PRACTICAL PARTICIPANTS

     Only enrollments belonging to the
     practical assessment's training batch.
  ======================================================= */

  const practicalParticipants =
    useMemo(() => {
      if (
        !currentPracticalAssessment
      ) {
        return [];
      }

      return trainerEnrollments.filter(
        (enrollment) =>
          enrollment.trainingBatchId ===
            currentPracticalAssessment.trainingBatchId &&
          enrollment.status ===
            "Approved",
      );
    }, [
      trainerEnrollments,
      currentPracticalAssessment,
    ]);

  /* =======================================================
     FILTER PRACTICAL PARTICIPANTS
  ======================================================= */

  const filteredPracticalParticipants =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return practicalParticipants;
      }

      return practicalParticipants.filter(
        (enrollment) =>
          enrollment.participant.fullName
            ?.toLowerCase()
            .includes(keyword) ||
          enrollment.participant.email
            ?.toLowerCase()
            .includes(keyword) ||
          enrollment.participant.userCode
            ?.toLowerCase()
            .includes(keyword),
      );
    }, [
      practicalParticipants,
      search,
    ]);

  /* =======================================================
     GET PRACTICAL RESULT FOR ENROLLMENT
  ======================================================= */

  const getPracticalResult =
    useCallback(
      (
        enrollmentId: string,
      ) => {
        return practicalResults.find(
          (item) =>
            item.enrollmentId ===
            enrollmentId,
        ) ?? null;
      },
      [practicalResults],
    );

  /* =======================================================
     PRACTICAL STATISTICS
  ======================================================= */

  const practicalEvaluatedCount =
    practicalParticipants.filter(
      (enrollment) =>
        getPracticalResult(
          enrollment.id,
        ) !== null,
    ).length;

  const practicalPassedCount =
    practicalParticipants.filter(
      (enrollment) => {
        const result =
          getPracticalResult(
            enrollment.id,
          );

        return result?.isPassed === true;
      },
    ).length;

  const practicalFailedCount =
    practicalParticipants.filter(
      (enrollment) => {
        const result =
          getPracticalResult(
            enrollment.id,
          );

        return result?.isPassed === false;
      },
    ).length;

  const practicalAverage =
    practicalResults.length === 0
      ? 0
      : practicalResults.reduce(
          (total, result) =>
            total +
            Number(result.percentage),
          0,
        ) /
        practicalResults.length;

  /* =======================================================
     WRITTEN STATISTICS
  ======================================================= */

  const writtenTotal =
    writtenParticipants.length;

  const writtenPassed =
    writtenParticipants.filter(
      (participant) =>
        participant.isPassed,
    ).length;

  const writtenFailed =
    writtenParticipants.filter(
      (participant) =>
        !participant.isPassed,
    ).length;

  const writtenAverage =
    writtenParticipants.length === 0
      ? 0
      : writtenParticipants.reduce(
          (total, participant) =>
            total +
            getPercentage(
              participant.percentage,
            ),
          0,
        ) /
        writtenParticipants.length;

  /* =======================================================
     VIEW WRITTEN PARTICIPANT
  ======================================================= */

  const handleViewWrittenParticipant =
    useCallback(
      async (
        submission: TrainerAssessmentSubmission,
      ) => {
        setSubmissionError(null);
        setIsLoadingSubmission(true);

        try {
          const result =
            await loadTrainerSubmission(
              submission.attemptId,
            );

          setSelectedSubmission(
            result,
          );
        } catch (err) {
          console.error(
            "LOAD WRITTEN SUBMISSION ERROR:",
            err,
          );

          setSubmissionError(
            err instanceof Error
              ? err.message
              : "Unable to load participant submission.",
          );
        } finally {
          setIsLoadingSubmission(false);
        }
      },
      [loadTrainerSubmission],
    );

  /* =======================================================
     OPEN PRACTICAL EVALUATION
  ======================================================= */

  const handleEvaluatePractical =
    useCallback(
      (
        enrollment: Enrollment,
      ) => {
        if (
          !currentPracticalAssessment
        ) {
          return;
        }

        setPracticalActionError(null);

        setSelectedEnrollment(
          enrollment,
        );

        setSelectedPracticalAssessment(
          currentPracticalAssessment,
        );

        setIsEvaluationModalOpen(
          true,
        );
      },
      [currentPracticalAssessment],
    );

  /* =======================================================
     OPEN PRACTICAL RESULT
  ======================================================= */

  const handleViewPracticalResult =
    useCallback(
      (
        result: PracticalAssessmentResult,
      ) => {
        setPracticalActionError(null);

        setSelectedPracticalResult(
          result,
        );

        setIsResultModalOpen(true);
      },
      [],
    );

  /* =======================================================
     SUBMIT PRACTICAL EVALUATION
  ======================================================= */

  const handleSubmitPractical =
    useCallback(
      async (
        enrollmentId: string,
        scores: {
          criterionId: string;
          score: number;
        }[],
        trainerRemarks: string,
      ) => {
        if (
          !selectedPracticalAssessment
        ) {
          return;
        }

        setIsSubmittingEvaluation(true);
        setPracticalActionError(null);

        try {
          const result =
            await evaluateAssessment({
              practicalAssessmentId:
                selectedPracticalAssessment.id,

              enrollmentId,

              trainerRemarks:
                trainerRemarks.trim() ||
                null,

              criterionScores: scores,
            });

          setSelectedPracticalResult(
            result,
          );

          setIsEvaluationModalOpen(
            false,
          );

          setIsResultModalOpen(true);

          await loadPracticalResults(
            selectedPracticalAssessment.id,
          );
        } catch (err) {
          console.error(
            "PRACTICAL EVALUATION ERROR:",
            err,
          );

          setPracticalActionError(
            err instanceof Error
              ? err.message
              : "Failed to submit practical evaluation.",
          );
        } finally {
          setIsSubmittingEvaluation(false);
        }
      },
      [
        selectedPracticalAssessment,
        evaluateAssessment,
        loadPracticalResults,
      ],
    );

  /* =======================================================
     CLOSE MODALS
  ======================================================= */

  const closeWrittenModal =
    useCallback(() => {
      setSelectedSubmission(null);
      setSubmissionError(null);
      setIsLoadingSubmission(false);
    }, []);

  const closePracticalEvaluation =
    useCallback(() => {
      if (isSubmittingEvaluation) {
        return;
      }

      setIsEvaluationModalOpen(false);
      setSelectedEnrollment(null);
      setSelectedPracticalAssessment(
        null,
      );
      setPracticalActionError(null);
    }, [isSubmittingEvaluation]);

  const closePracticalResult =
    useCallback(() => {
      setIsResultModalOpen(false);
      setSelectedPracticalResult(null);
    }, []);

  /* =======================================================
     ACTIVE PARTICIPATION
  ======================================================= */

  /*
   * IMPORTANT:
   * useTrainingBatches() can return all training batches.
   * For the trainer assessment page, Active Participation
   * must only show batches where this trainer has participants.
   *
   * trainerEnrollments is already trainer-scoped, so use its
   * trainingBatchId values as the source for the visible batches.
   */
  const assignedParticipationBatchId = useMemo(() => {
    return (
      trainerEnrollments.find(
        (enrollment) => Boolean(enrollment.trainingBatchId),
      )?.trainingBatchId ?? ""
    );
  }, [trainerEnrollments]);

  const assignedParticipationBatch = useMemo(() => {
    if (!assignedParticipationBatchId) return null;

    return (
      trainingBatches.find(
        (batch) => batch.id === assignedParticipationBatchId,
      ) ?? null
    );
  }, [trainingBatches, assignedParticipationBatchId]);

  useEffect(() => {
    if (!assignedParticipationBatchId) {
      return;
    }

    setParticipationActionError(null);

    void Promise.all([
      loadSetting(assignedParticipationBatchId),
      getSchedule(assignedParticipationBatchId),
    ]).catch((err) => {
      console.error(
        "LOAD PARTICIPATION BATCH ERROR:",
        err,
      );
    });
  }, [
    assignedParticipationBatchId,
    loadSetting,
    getSchedule,
  ]);

  useEffect(() => {
    if (trainingSessions.length === 0) {
      setSelectedParticipationSessionId("");
      return;
    }

    setSelectedParticipationSessionId((current) => {
      if (
        current &&
        trainingSessions.some(
          (session) => session.id === current,
        )
      ) {
        return current;
      }

      return trainingSessions[0]!.id;
    });
  }, [trainingSessions]);

  useEffect(() => {
    if (!selectedParticipationSessionId) {
      return;
    }

    setParticipationActionError(null);

    void loadSessionParticipants(
      selectedParticipationSessionId,
    ).catch((err) => {
      console.error(
        "LOAD PARTICIPATION PARTICIPANTS ERROR:",
        err,
      );
    });
  }, [
    selectedParticipationSessionId,
    loadSessionParticipants,
  ]);

  const selectedParticipationBatch =
    assignedParticipationBatch;

  const selectedParticipationSession =
    useMemo(() => {
      return (
        trainingSessions.find(
          (session) =>
            session.id ===
            selectedParticipationSessionId,
        ) ?? null
      );
    }, [
      trainingSessions,
      selectedParticipationSessionId,
    ]);

  const participationRequiredRecitations =
    Number(
      participationSetting?.requiredRecitations ??
        0,
    );

  const getParticipationEnrollment =
    useCallback(
      (participant: ParticipationParticipant) => {
        return (
          trainerEnrollments.find(
            (enrollment) =>
              enrollment.id ===
              participant.enrollmentId,
          ) ?? null
        );
      },
      [trainerEnrollments],
    );

  const getParticipationName =
    useCallback(
      (participant: ParticipationParticipant) => {
        const item = participant as ParticipationParticipant & {
          participantName?: string | null;
          participantEmail?: string | null;
          participantUserCode?: string | null;
        };

        const enrollment =
          getParticipationEnrollment(participant);

        return (
          item.participantName ??
          enrollment?.participant?.fullName ??
          "Participant"
        );
      },
      [getParticipationEnrollment],
    );

  const getParticipationEmail =
    useCallback(
      (participant: ParticipationParticipant) => {
        const item = participant as ParticipationParticipant & {
          participantName?: string | null;
          participantEmail?: string | null;
          participantUserCode?: string | null;
        };

        const enrollment =
          getParticipationEnrollment(participant);

        return (
          item.participantEmail ??
          enrollment?.participant?.email ??
          "—"
        );
      },
      [getParticipationEnrollment],
    );

  const getParticipationCode =
    useCallback(
      (participant: ParticipationParticipant) => {
        const item = participant as ParticipationParticipant & {
          participantName?: string | null;
          participantEmail?: string | null;
          participantUserCode?: string | null;
        };

        const enrollment =
          getParticipationEnrollment(participant);

        return (
          item.participantUserCode ??
          enrollment?.participant?.userCode ??
          null
        );
      },
      [getParticipationEnrollment],
    );

  const filteredParticipationParticipants =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return participationParticipants;
      }

      return participationParticipants.filter(
        (participant) => {
          const name =
            getParticipationName(
              participant,
            ).toLowerCase();

          const email =
            getParticipationEmail(
              participant,
            ).toLowerCase();

          const code =
            getParticipationCode(
              participant,
            )?.toLowerCase() ?? "";

          return (
            name.includes(keyword) ||
            email.includes(keyword) ||
            code.includes(keyword)
          );
        },
      );
    }, [
      participationParticipants,
      search,
      getParticipationName,
      getParticipationEmail,
      getParticipationCode,
    ]);

  const participationRecordedCount =
    participationParticipants.filter(
      (participant) =>
        participant.hasRecited,
    ).length;

  const participationCompletedCount =
    participationParticipants.filter(
      (participant) => {
        const required =
          Number(
            participant.requiredRecitations ??
              participationRequiredRecitations,
          );

        return (
          required > 0 &&
          Number(
            participant.actualRecitations ?? 0,
          ) >= required
        );
      },
    ).length;

  const handleRecordParticipation =
    useCallback(
      async (
        participant: ParticipationParticipant,
      ) => {
        if (!selectedParticipationSessionId) {
          return;
        }

        setParticipationActionError(null);

        try {
          const request =
            {
              enrollmentId:
                participant.enrollmentId,
              trainingSessionId:
                selectedParticipationSessionId,
            } as RecordParticipationRequest;

          await recordRecitation(request);

          await loadSessionParticipants(
            selectedParticipationSessionId,
          );
        } catch (err) {
          console.error(
            "RECORD PARTICIPATION ERROR:",
            err,
          );

          setParticipationActionError(
            err instanceof Error
              ? err.message
              : "Failed to record recitation.",
          );
        }
      },
      [
        selectedParticipationSessionId,
        recordRecitation,
        loadSessionParticipants,
      ],
    );

  const handleRemoveParticipation =
    useCallback(
      async (
        participant: ParticipationParticipant,
      ) => {
        if (!participant.participationRecordId) {
          return;
        }

        setParticipationActionError(null);

        try {
          await removeRecitation(
            participant.participationRecordId,
          );

          if (selectedParticipationSessionId) {
            await loadSessionParticipants(
              selectedParticipationSessionId,
            );
          }
        } catch (err) {
          console.error(
            "REMOVE PARTICIPATION ERROR:",
            err,
          );

          setParticipationActionError(
            err instanceof Error
              ? err.message
              : "Failed to remove recitation.",
          );
        }
      },
      [
        removeRecitation,
        loadSessionParticipants,
        selectedParticipationSessionId,
      ],
    );

  /* =======================================================
     ACTIVE LOADING
  ======================================================= */

  const activeLoading =
    assessmentType === "written"
      ? writtenIsLoading
      : assessmentType === "practical"
        ? practicalIsLoading ||
          enrollmentIsLoading
        : participationIsLoading;

  const activeError =
    assessmentType === "written"
      ? writtenError
      : assessmentType === "practical"
        ? practicalError ||
          enrollmentError?.message ||
          null
        : participationError;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <BookOpen className="h-4 w-4" />

              Trainer Portal
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Assessments
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
              Manage participant written and
              practical assessments for your
              assigned training.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadPage()
            }
            disabled={activeLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={
                activeLoading
                  ? "h-4 w-4 animate-spin"
                  : "h-4 w-4"
              }
            />

            Refresh
          </button>

        </div>

        {/* =================================================
            TYPE TABS
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">

          <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">

            <button
              type="button"
              onClick={() => {
                setAssessmentType(
                  "written",
                );
                setSearch("");
              }}
              className={
                assessmentType ===
                "written"
                  ? "rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition"
                  : "rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              }
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Written Assessment
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAssessmentType(
                  "practical",
                );
                setSearch("");
              }}
              className={
                assessmentType ===
                "practical"
                  ? "rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition"
                  : "rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              }
            >
              <span className="inline-flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Practical Assessment
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAssessmentType("participation");
                setSearch("");
              }}
              className={
                assessmentType === "participation"
                  ? "rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition"
                  : "rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              }
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Active Participation
              </span>
            </button>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {activeError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load assessment data
              </p>

              <p className="mt-1 text-sm text-red-700">
                {activeError}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            WRITTEN
        ================================================= */}

        {assessmentType ===
          "written" && (
          <WrittenAssessmentSection
            assessment={
              currentWrittenAssessment
            }
            participants={
              filteredWrittenParticipants
            }
            totalParticipants={
              writtenTotal
            }
            passedParticipants={
              writtenPassed
            }
            failedParticipants={
              writtenFailed
            }
            averageScore={
              writtenAverage
            }
            search={search}
            onSearchChange={setSearch}
            isLoading={writtenIsLoading}
            onViewParticipant={
              handleViewWrittenParticipant
            }
          />
        )}

        {/* =================================================
            PRACTICAL
        ================================================= */}

        {assessmentType ===
          "practical" && (
          <PracticalAssessmentSection
            assessment={
              currentPracticalAssessment
            }
            participants={
              filteredPracticalParticipants
            }
            results={
              practicalResults
            }
            evaluatedCount={
              practicalEvaluatedCount
            }
            passedCount={
              practicalPassedCount
            }
            failedCount={
              practicalFailedCount
            }
            averageScore={
              practicalAverage
            }
            search={search}
            onSearchChange={setSearch}
            isLoading={
              practicalIsLoading ||
              enrollmentIsLoading
            }
            onEvaluate={
              handleEvaluatePractical
            }
            onViewResult={
              handleViewPracticalResult
            }
            getResult={
              getPracticalResult
            }
          />
        )}

        {assessmentType === "participation" && (
          <ActiveParticipationSection
            sessions={trainingSessions}
            batch={selectedParticipationBatch}
            session={selectedParticipationSession}
            setting={participationSetting}
            participants={filteredParticipationParticipants}
            totalParticipants={participationParticipants.length}
            recordedCount={participationRecordedCount}
            completedCount={participationCompletedCount}
            search={search}
            onSearchChange={setSearch}
            selectedSessionId={selectedParticipationSessionId}
            onSessionChange={setSelectedParticipationSessionId}
            isLoading={participationIsLoading}
            actionError={participationActionError}
            onRecord={handleRecordParticipation}
            onRemove={handleRemoveParticipation}
            getName={getParticipationName}
            getEmail={getParticipationEmail}
            getCode={getParticipationCode}
          />
        )}

      </div>

      {/* ===================================================
          WRITTEN MODAL
      =================================================== */}

      {(selectedSubmission ||
        isLoadingSubmission) && (
        <SubmissionDetailsModal
          submission={
            selectedSubmission
          }
          isLoading={
            isLoadingSubmission
          }
          error={
            submissionError
          }
          onClose={
            closeWrittenModal
          }
        />
      )}

      {/* ===================================================
          PRACTICAL EVALUATION MODAL
      =================================================== */}

      {isEvaluationModalOpen &&
        selectedPracticalAssessment &&
        selectedEnrollment && (
          <PracticalEvaluationModal
            assessment={
              selectedPracticalAssessment
            }
            enrollment={
              selectedEnrollment
            }
            existingResult={
              getPracticalResult(
                selectedEnrollment.id,
              )
            }
            isSubmitting={
              isSubmittingEvaluation
            }
            error={
              practicalActionError
            }
            onClose={
              closePracticalEvaluation
            }
            onSubmit={
              handleSubmitPractical
            }
          />
        )}

      {/* ===================================================
          PRACTICAL RESULT MODAL
      =================================================== */}

      {isResultModalOpen &&
        selectedPracticalResult && (
          <PracticalResultModal
            result={
              selectedPracticalResult
            }
            onClose={
              closePracticalResult
            }
          />
        )}

    </div>
  );
}

/* =========================================================
   WRITTEN ASSESSMENT SECTION
========================================================= */

function WrittenAssessmentSection({
  assessment,
  participants,
  totalParticipants,
  passedParticipants,
  failedParticipants,
  averageScore,
  search,
  onSearchChange,
  isLoading,
  onViewParticipant,
}: {
  assessment:
    | WrittenAssessment
    | null;

  participants:
    TrainerAssessmentSubmission[];

  totalParticipants: number;

  passedParticipants: number;

  failedParticipants: number;

  averageScore: number;

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  isLoading: boolean;

  onViewParticipant: (
    submission: TrainerAssessmentSubmission,
  ) => void;
}) {
  return (
    <div className="space-y-6">

      {/* TRAINING INFO */}

      {assessment && (
        <AssessmentInfoCard
          title={assessment.title}
          batchCode={
            assessment.batchCode
          }
          published={
            assessment.isPublished
          }
          icon={
            <FileText className="h-6 w-6 text-slate-700" />
          }
          meta={
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <FileText className="h-3.5 w-3.5" />

                {assessment.questionCount ??
                  0}{" "}
                questions
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />

                Created{" "}
                {formatDate(
                  assessment.createdAt,
                )}
              </span>
            </>
          }
        />
      )}

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={
            <Users className="h-5 w-5" />
          }
          label="Participants"
          value={totalParticipants}
        />

        <StatCard
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          label="Passed"
          value={passedParticipants}
        />

        <StatCard
          icon={
            <CircleAlert className="h-5 w-5" />
          }
          label="Failed"
          value={failedParticipants}
        />

        <StatCard
          icon={
            <FileText className="h-5 w-5" />
          }
          label="Average Score"
          value={`${averageScore.toFixed(1)}%`}
        />

      </div>

      {/* PARTICIPANTS */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <SectionHeader
          title="Participant Submissions"
          description="Review participant written assessment submissions."
          search={search}
          onSearchChange={
            onSearchChange
          }
        />

        {isLoading ? (
          <LoadingRows />
        ) : participants.length ===
          0 ? (
          <EmptyState
            icon={
              <Users className="h-7 w-7 text-slate-400" />
            }
            title={
              search
                ? "No participants found"
                : "No submissions yet"
            }
            description={
              search
                ? "Try a different participant name or email."
                : "Participants will appear here after submitting the written assessment."
            }
          />
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <TableHead>
                    Participant
                  </TableHead>

                  <TableHead>
                    Submitted
                  </TableHead>

                  <TableHead>
                    Score
                  </TableHead>

                  <TableHead>
                    Result
                  </TableHead>

                  <TableHead align="right">
                    Action
                  </TableHead>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {participants.map(
                  (participant) => (
                    <tr
                      key={
                        participant.participantId
                      }
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">
                        <ParticipantIdentity
                          name={
                            participant.participantName
                          }
                          email={
                            participant.participantEmail
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {formatDateTime(
                            participant.submittedAt,
                          )}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Attempt #
                          {
                            participant.attemptNumber
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900">
                          {
                            participant.earnedPoints
                          }
                          /
                          {
                            participant.totalPoints
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            participant.percentage
                          }
                          %
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <ResultBadge
                          passed={
                            participant.isPassed
                          }
                        />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onViewParticipant(
                              participant,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />

                          View
                        </button>
                      </td>

                    </tr>
                  ),
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   PRACTICAL ASSESSMENT SECTION
========================================================= */

function PracticalAssessmentSection({
  assessment,
  participants,
  results,
  evaluatedCount,
  passedCount,
  failedCount,
  averageScore,
  search,
  onSearchChange,
  isLoading,
  onEvaluate,
  onViewResult,
  getResult,
}: {
  assessment:
    | PracticalAssessment
    | null;

  participants: Enrollment[];

  results: PracticalAssessmentResult[];

  evaluatedCount: number;

  passedCount: number;

  failedCount: number;

  averageScore: number;

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  isLoading: boolean;

  onEvaluate: (
    enrollment: Enrollment,
  ) => void;

  onViewResult: (
    result: PracticalAssessmentResult,
  ) => void;

  getResult: (
    enrollmentId: string,
  ) =>
    | PracticalAssessmentResult
    | null;
}) {
  return (
    <div className="space-y-6">

      {/* INFO */}

      {assessment && (
        <AssessmentInfoCard
          title={assessment.title}
          batchCode={
            participants[0]?.batchCode
          }
          published={
            assessment.isPublished
          }
          icon={
            <ClipboardCheck className="h-6 w-6 text-slate-700" />
          }
          meta={
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <ClipboardCheck className="h-3.5 w-3.5" />

                {assessment.criteria.length}{" "}
                criteria
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                Passing{" "}
                {assessment.passingPercentage}%
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />

                Created{" "}
                {formatDate(
                  assessment.createdAt,
                )}
              </span>
            </>
          }
        />
      )}

      {/* NO ASSESSMENT */}

      {!assessment && !isLoading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

          <ClipboardCheck className="mx-auto h-9 w-9 text-slate-300" />

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No practical assessment assigned
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            You currently don't have a published
            practical assessment assigned to your
            training.
          </p>

        </div>
      )}

      {assessment && (
        <>
          {/* STATS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={
                <Users className="h-5 w-5" />
              }
              label="Participants"
              value={
                participants.length
              }
            />

            <StatCard
              icon={
                <ClipboardCheck className="h-5 w-5" />
              }
              label="Evaluated"
              value={evaluatedCount}
            />

            <StatCard
              icon={
                <CheckCircle2 className="h-5 w-5" />
              }
              label="Passed"
              value={passedCount}
            />

            <StatCard
              icon={
                <FileText className="h-5 w-5" />
              }
              label="Average Score"
              value={`${averageScore.toFixed(1)}%`}
            />

          </div>

          {/* PARTICIPANTS */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <SectionHeader
              title="Practical Evaluation"
              description="Evaluate participants using the practical assessment criteria."
              search={search}
              onSearchChange={
                onSearchChange
              }
            />

            {isLoading ? (
              <LoadingRows />
            ) : participants.length ===
              0 ? (
              <EmptyState
                icon={
                  <Users className="h-7 w-7 text-slate-400" />
                }
                title={
                  search
                    ? "No participants found"
                    : "No approved participants"
                }
                description={
                  search
                    ? "Try a different participant name, email, or user code."
                    : "Approved participants for this training batch will appear here."
                }
              />
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <TableHead>
                        Participant
                      </TableHead>

                      <TableHead>
                        Batch
                      </TableHead>

                      <TableHead>
                        Evaluation
                      </TableHead>

                      <TableHead>
                        Score
                      </TableHead>

                      <TableHead align="right">
                        Action
                      </TableHead>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {participants.map(
                      (enrollment) => {
                        const result =
                          getResult(
                            enrollment.id,
                          );

                        return (
                          <tr
                            key={
                              enrollment.id
                            }
                            className="transition hover:bg-slate-50"
                          >

                            <td className="px-5 py-4">
                              <ParticipantIdentity
                                name={
                                  enrollment
                                    .participant
                                    .fullName
                                }
                                email={
                                  enrollment
                                    .participant
                                    .email
                                }
                                code={
                                  enrollment
                                    .participant
                                    .userCode
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {
                                  enrollment.batchCode
                                }
                              </span>
                            </td>

                            <td className="px-5 py-4">

                              {result ? (
                                <ResultBadge
                                  passed={
                                    result.isPassed
                                  }
                                />
                              ) : (
                                <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                  Not Evaluated
                                </span>
                              )}

                            </td>

                            <td className="px-5 py-4">

                              {result ? (
                                <>
                                  <p className="text-sm font-bold text-slate-900">
                                    {
                                      result.percentage
                                    }
                                    %
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    Passing{" "}
                                    {
                                      assessment.passingPercentage
                                    }
                                    %
                                  </p>
                                </>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  —
                                </span>
                              )}

                            </td>

                            <td className="px-5 py-4 text-right">

                              {result ? (
                                <div className="inline-flex items-center gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onViewResult(
                                        result,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                  >
                                    <Eye className="h-4 w-4" />

                                    View
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onEvaluate(
                                        enrollment,
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                  >
                                    <ClipboardCheck className="h-4 w-4" />

                                    Edit
                                  </button>

                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onEvaluate(
                                      enrollment,
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                  <ClipboardCheck className="h-4 w-4" />

                                  Evaluate
                                </button>
                              )}

                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

/* =========================================================
   ACTIVE PARTICIPATION SECTION
========================================================= */

function ActiveParticipationSection({
  sessions,
  batch,
  session,
  setting,
  participants,
  totalParticipants,
  recordedCount,
  completedCount,
  search,
  onSearchChange,
  selectedSessionId,
  onSessionChange,
  isLoading,
  actionError,
  onRecord,
  onRemove,
  getName,
  getEmail,
  getCode,
}: {
  sessions: Array<{
    id: string;
    sessionNumber?: number;
    sessionDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  batch: {
    id: string;
    batchCode?: string | null;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
  session: {
    id: string;
    sessionNumber?: number;
    sessionDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  } | null;
  setting: ParticipationSetting | null;
  participants: ParticipationParticipant[];
  totalParticipants: number;
  recordedCount: number;
  completedCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  selectedSessionId: string;
  onSessionChange: (value: string) => void;
  isLoading: boolean;
  actionError: string | null;
  onRecord: (participant: ParticipationParticipant) => void;
  onRemove: (participant: ParticipationParticipant) => void;
  getName: (participant: ParticipationParticipant) => string;
  getEmail: (participant: ParticipationParticipant) => string;
  getCode: (participant: ParticipationParticipant) => string | null | undefined;
}) {
  const required = Number(setting?.requiredRecitations ?? 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <MessageCircle className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Participation
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Recitation Records
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Record one recitation per participant for each training session.
                Recitations are accumulated throughout the training.
              </p>
            </div>
          </div>

          <div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Training Session
              </label>
              <select
                value={selectedSessionId}
                onChange={(event) => onSessionChange(event.target.value)}
                disabled={isLoading || sessions.length === 0}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400 disabled:bg-slate-50"
              >
                <option value="">Select training session</option>
                {sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    Session {item.sessionNumber ?? "—"} • {formatDate(item.sessionDate)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {batch && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Selected Training
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {batch.batchCode || "Training Batch"}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {batch.location && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {batch.location}
                  </span>
                )}
                {batch.startDate && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(batch.startDate)}
                    {batch.endDate ? ` – ${formatDate(batch.endDate)}` : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-5 py-4 text-right">
              <p className="text-xs text-slate-400">Required Recitations</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {required || "—"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                For the entire training
              </p>
            </div>
          </div>

          {session && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Session {session.sessionNumber ?? "—"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(session.sessionDate)}
              </span>
              {(session.startTime || session.endTime) && (
                <span className="text-xs text-slate-500">
                  {session.startTime || "—"} {session.endTime ? `– ${session.endTime}` : ""}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {batch && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Participants"
              value={totalParticipants}
            />
            <StatCard
              icon={<MessageCircle className="h-5 w-5" />}
              label="Recited This Session"
              value={recordedCount}
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Requirement Completed"
              value={completedCount}
            />
            <StatCard
              icon={<ClipboardCheck className="h-5 w-5" />}
              label="Required Recitations"
              value={required || "—"}
            />
          </div>

          {actionError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Participation action failed
                </p>
                <p className="mt-1 text-sm text-red-700">{actionError}</p>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              title="Participant Participation"
              description="Record recitation for the selected session and monitor cumulative progress."
              search={search}
              onSearchChange={onSearchChange}
            />

            {isLoading ? (
              <LoadingRows />
            ) : participants.length === 0 ? (
              <EmptyState
                icon={<Users className="h-7 w-7 text-slate-400" />}
                title={search ? "No participants found" : session ? "No approved participants" : "Select a training session"}
                description={
                  search
                    ? "Try a different participant name, email, or user code."
                    : session
                      ? "Approved participants for this training session will appear here."
                      : "Select a training session to load participants."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <TableHead>Participant</TableHead>
                      <TableHead>Recitation Progress</TableHead>
                      <TableHead>Participation</TableHead>
                      <TableHead>Session Record</TableHead>
                      <TableHead align="right">Action</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {participants.map((participant) => {
                      const participantRequired = Number(
                        participant.requiredRecitations ?? required,
                      );
                      const actual = Number(
                        participant.actualRecitations ?? 0,
                      );
                      const percentage = Math.min(
                        Number(
                          participant.participationPercentage ??
                            (participantRequired > 0
                              ? (actual / participantRequired) * 100
                              : 0),
                        ),
                        100,
                      );

                      return (
                        <tr
                          key={participant.enrollmentId}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <ParticipantIdentity
                              name={getName(participant)}
                              email={getEmail(participant)}
                              code={getCode(participant)}
                            />
                          </td>

                          <td className="px-5 py-4">
                            <div className="min-w-[220px]">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-bold text-slate-900">
                                  {actual} / {participantRequired || "—"}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-slate-900 transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={
                                percentage >= 100
                                  ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                  : "inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                              }
                            >
                              {percentage >= 100
                                ? "Complete"
                                : `${percentage.toFixed(0)}%`}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {participant.hasRecited ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Recorded
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                Not Recorded
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {participant.hasRecited &&
                            participant.participationRecordId ? (
                              <button
                                type="button"
                                onClick={() => void onRemove(participant)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void onRecord(participant)}
                                disabled={isLoading || !selectedSessionId}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Record Recitation
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!batch && !isLoading && (
        <EmptyState
          icon={<Users className="h-7 w-7 text-slate-400" />}
          title="No training batch available"
          description="No training batch is currently available for participation recording."
        />
      )}
    </div>
  );
}

/* =========================================================
   PRACTICAL EVALUATION MODAL
========================================================= */

function PracticalEvaluationModal({
  assessment,
  enrollment,
  existingResult,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  assessment: PracticalAssessment;

  enrollment: Enrollment;

  existingResult:
    | PracticalAssessmentResult
    | null;

  isSubmitting: boolean;

  error: string | null;

  onClose: () => void;

  onSubmit: (
    enrollmentId: string,
    scores: {
      criterionId: string;
      score: number;
    }[],
    trainerRemarks: string,
  ) => Promise<void>;
}) {
  const [scores, setScores] =
    useState<
      Record<string, string>
    >(() => {
      const initial: Record<
        string,
        string
      > = {};

      assessment.criteria.forEach(
        (criterion) => {
          const existing =
            existingResult?.criterionScores.find(
              (item) =>
                item.criterionId ===
                criterion.id,
            );

          initial[criterion.id] =
            existing
              ? String(existing.score)
              : "";
        },
      );

      return initial;
    });

  const [
    trainerRemarks,
    setTrainerRemarks,
  ] = useState(
    existingResult?.trainerRemarks ??
      "",
  );

  const [localError, setLocalError] =
    useState<string | null>(null);

  const weightedScore =
    assessment.criteria.reduce(
      (total, criterion) => {
        const raw =
          scores[criterion.id];

        const score =
          raw === undefined ||
          raw === ""
            ? 0
            : Number(raw);

        if (
          Number.isNaN(score)
        ) {
          return total;
        }

        return (
          total +
          score *
            (criterion.weightPercentage /
              100)
        );
      },
      0,
    );

  const hasMissingScore =
    assessment.criteria.some(
      (criterion) =>
        scores[criterion.id] ===
          undefined ||
        scores[criterion.id] ===
          "",
    );

  const hasInvalidScore =
    assessment.criteria.some(
      (criterion) => {
        const raw =
          scores[criterion.id];

        if (
          raw === undefined ||
          raw === ""
        ) {
          return false;
        }

        const score = Number(raw);

        return (
          Number.isNaN(score) ||
          score < 0 ||
          score > 100
        );
      },
    );

  const handleScoreChange = (
    criterionId: string,
    value: string,
  ) => {
    if (value === "") {
      setScores((current) => ({
        ...current,
        [criterionId]: "",
      }));

      return;
    }

    if (
      !/^\d{0,3}(\.\d{0,2})?$/.test(
        value,
      )
    ) {
      return;
    }

    const numericValue =
      Number(value);

    if (
      numericValue > 100
    ) {
      return;
    }

    setScores((current) => ({
      ...current,
      [criterionId]: value,
    }));

    setLocalError(null);
  };

  const handleSubmit = async () => {
    setLocalError(null);

    if (hasMissingScore) {
      setLocalError(
        "Please provide a score for every criterion.",
      );

      return;
    }

    if (hasInvalidScore) {
      setLocalError(
        "Each criterion score must be between 0 and 100.",
      );

      return;
    }

    const criterionScores =
      assessment.criteria.map(
        (criterion) => ({
          criterionId:
            criterion.id,
          score: Number(
            scores[criterion.id],
          ),
        }),
      );

    await onSubmit(
      enrollment.id,
      criterionScores,
      trainerRemarks,
    );
  };

  return (
    <div className="fixed inset-0 z-[700] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex min-h-full items-center justify-center">

        <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* HEADER */}

          <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-5 sm:p-6">

            <div className="min-w-0 pr-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Practical Evaluation
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {
                  enrollment
                    .participant
                    .fullName
                }
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {assessment.title}
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={
                isSubmitting
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* BODY */}

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

            {/* ASSESSMENT INFO */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Assessment
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {assessment.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Passing score:{" "}
                    {
                      assessment.passingPercentage
                    }
                    %
                  </p>

                </div>

                <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm">

                  <p className="text-xs text-slate-400">
                    Current Practical Score
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {weightedScore.toFixed(
                      2,
                    )}
                    %
                  </p>

                </div>

              </div>

            </div>

            {/* CRITERIA */}

            <div className="mt-6">

              <div className="mb-4">

                <h3 className="text-lg font-bold text-slate-900">
                  Evaluation Criteria
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Rate each criterion from 0 to
                  100.
                </p>

              </div>

              <div className="space-y-4">

                {assessment.criteria
                  .slice()
                  .sort(
                    (a, b) =>
                      a.displayOrder -
                      b.displayOrder,
                  )
                  .map(
                    (criterion) => (
                      <div
                        key={
                          criterion.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h4 className="font-semibold text-slate-900">
                                {
                                  criterion.name
                                }
                              </h4>

                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                {
                                  criterion.weightPercentage
                                }
                                %
                              </span>

                            </div>

                            {criterion.description && (
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {
                                  criterion.description
                                }
                              </p>
                            )}

                          </div>

                          <div className="w-full shrink-0 sm:w-32">

                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Score
                            </label>

                            <div className="relative mt-1">

                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  scores[
                                    criterion
                                      .id
                                  ] ??
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  handleScoreChange(
                                    criterion.id,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="0"
                                disabled={
                                  isSubmitting
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-right text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-slate-400 disabled:bg-slate-50"
                              />

                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                %
                              </span>

                            </div>

                          </div>

                        </div>

                        <div className="mt-4">

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-slate-900 transition-all"
                              style={{
                                width: `${Math.min(
                                  Number(
                                    scores[
                                      criterion
                                        .id
                                    ] ||
                                      0,
                                  ),
                                  100,
                                )}%`,
                              }}
                            />

                          </div>

                          <div className="mt-2 flex justify-between text-xs text-slate-400">

                            <span>
                              0%
                            </span>

                            <span>
                              Weighted:{" "}
                              {(
                                Number(
                                  scores[
                                    criterion
                                      .id
                                  ] ||
                                    0,
                                ) *
                                (criterion.weightPercentage /
                                  100)
                              ).toFixed(2)}
                            </span>

                            <span>
                              100%
                            </span>

                          </div>

                        </div>

                      </div>
                    ),
                  )}

              </div>

            </div>

            {/* REMARKS */}

            <div className="mt-6">

              <label className="block text-sm font-semibold text-slate-900">
                Trainer Remarks
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Optional comments about the participant's
                practical performance.
              </p>

              <textarea
                value={
                  trainerRemarks
                }
                onChange={(event) =>
                  setTrainerRemarks(
                    event.target.value,
                  )
                }
                disabled={
                  isSubmitting
                }
                rows={4}
                placeholder="Enter your remarks..."
                className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
              />

            </div>

            {/* ERROR */}

            {(localError ||
              error) && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <p className="text-sm text-red-700">
                  {localError ||
                    error}
                </p>

              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">

            <div>

              <p className="text-xs text-slate-400">
                Final practical score
              </p>

              <p className="text-lg font-bold text-slate-900">
                {weightedScore.toFixed(
                  2,
                )}
                %
              </p>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={onClose}
                disabled={
                  isSubmitting
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleSubmit()
                }
                disabled={
                  isSubmitting
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />

                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />

                    Submit Evaluation
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PRACTICAL RESULT MODAL
========================================================= */

function PracticalResultModal({
  result,
  onClose,
}: {
  result: PracticalAssessmentResult;

  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[700] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex min-h-full items-center justify-center">

        <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* HEADER */}

          <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-5 sm:p-6">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Practical Assessment Result
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {result.participantName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {result.assessmentTitle}
              </p>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* BODY */}

          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

            {/* RESULT SUMMARY */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Practical Score
                  </p>

                  <div className="mt-2 flex items-center gap-3">

                    <p className="text-4xl font-bold text-slate-900">
                      {
                        result.percentage
                      }
                      %
                    </p>

                    <ResultBadge
                      passed={
                        result.isPassed
                      }
                    />

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Evaluated{" "}
                    {formatDateTime(
                      result.evaluatedAt,
                    )}
                  </p>

                </div>

                <div className="rounded-xl bg-white px-5 py-4 shadow-sm">

                  <p className="text-xs text-slate-400">
                    Total Score
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {
                      result.totalScore
                    }
                  </p>

                </div>

              </div>

            </div>

            {/* CRITERIA */}

            <div className="mt-6">

              <h3 className="text-lg font-bold text-slate-900">
                Criterion Scores
              </h3>

              <div className="mt-4 space-y-3">

                {result.criterionScores.map(
                  (criterion) => (
                    <div
                      key={
                        criterion.criterionId
                      }
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-slate-900">
                            {
                              criterion.criterionName
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Weight{" "}
                            {
                              criterion.weightPercentage
                            }
                            %
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-sm font-bold text-slate-900">
                            {
                              criterion.score
                            }
                            %
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Weighted{" "}
                            {
                              criterion.weightedScore
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  ),
                )}

              </div>

            </div>

            {/* REMARKS */}

            {result.trainerRemarks && (
              <div className="mt-6">

                <h3 className="text-sm font-bold text-slate-900">
                  Trainer Remarks
                </h3>

                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {
                      result.trainerRemarks
                    }
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="flex shrink-0 justify-end border-t border-slate-200 px-5 py-4 sm:px-6">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ASSESSMENT INFO
========================================================= */

function AssessmentInfoCard({
  title,
  batchCode,
  published,
  icon,
  meta,
}: {
  title: string;

  batchCode?: string | null;

  published: boolean;

  icon: ReactNode;

  meta: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            {icon}
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assigned Assessment
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              {batchCode && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {batchCode}
                </span>
              )}

              {meta}

            </div>

          </div>

        </div>

        <span
          className={
            published
              ? "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
              : "inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
          }
        >
          {published
            ? "Published"
            : "Draft"}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  search,
  onSearchChange,
}: {
  title: string;

  description: string;

  search: string;

  onSearchChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="border-b border-slate-200 p-5">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>

        </div>

        <div className="relative w-full lg:w-80">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search participant..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PARTICIPANT IDENTITY
========================================================= */

function ParticipantIdentity({
  name,
  email,
  code,
}: {
  name?: string | null;

  email?: string | null;

  code?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
        {getInitials(name)}
      </div>

      <div className="min-w-0">

        <p className="truncate text-sm font-semibold text-slate-900">
          {name || "Participant"}
        </p>

        <p className="mt-0.5 truncate text-xs text-slate-500">
          {email || "—"}
        </p>

        {code && (
          <p className="mt-0.5 text-xs text-slate-400">
            {code}
          </p>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;

  label: string;

  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>

        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({
  children,
  align = "left",
}: {
  children: ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-${align} text-xs font-semibold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
}

/* =========================================================
   RESULT BADGE
========================================================= */

function ResultBadge({
  passed,
}: {
  passed: boolean;
}) {
  return (
    <span
      className={
        passed
          ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
          : "inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
      }
    >
      {passed
        ? "Passed"
        : "Failed"}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;

  title: string;

  description: string;
}) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingRows() {
  return (
    <div className="space-y-3 p-5">

      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-slate-100"
          />
        ),
      )}

    </div>
  );
}

/* =========================================================
   SUBMISSION DETAILS MODAL
========================================================= */

function SubmissionDetailsModal({
  submission,
  isLoading,
  error,
  onClose,
}: {
  submission:
    | TrainerAssessmentSubmission
    | null;

  isLoading: boolean;

  error: string | null;

  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[600] overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex min-h-full items-center justify-center">

        <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* HEADER */}

          <div className="flex shrink-0 items-start justify-between border-b border-slate-200 p-5 sm:p-6">

            <div className="min-w-0 pr-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Participant Details
              </p>

              {submission && (
                <>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    {
                      submission.participantName
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      submission.participantEmail
                    }
                  </p>
                </>
              )}

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* LOADING */}

          {isLoading && (
            <div className="flex min-h-[300px] items-center justify-center p-8">

              <div className="flex items-center gap-3">

                <Spinner />

                <span className="text-sm font-medium text-slate-700">
                  Loading participant details...
                </span>

              </div>

            </div>
          )}

          {/* ERROR */}

          {!isLoading &&
            error && (
              <div className="p-5 sm:p-6">

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div>

                    <p className="text-sm font-semibold text-red-800">
                      Unable to load submission
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>

                  </div>

                </div>

              </div>
            )}

          {/* BODY */}

          {!isLoading &&
            !error &&
            submission && (
              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

                {/* RESULT */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Assessment Result
                      </p>

                      <div className="mt-2 flex items-center gap-3">

                        <p className="text-3xl font-bold text-slate-900">
                          {
                            submission.percentage
                          }
                          %
                        </p>

                        <ResultBadge
                          passed={
                            submission.isPassed
                          }
                        />

                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        Submitted{" "}
                        {formatDateTime(
                          submission.submittedAt,
                        )}
                      </p>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                      <ScoreItem
                        label="Score"
                        value={`${submission.earnedPoints}/${submission.totalPoints}`}
                      />

                      <ScoreItem
                        label="Correct"
                        value={`${submission.correctAnswers}/${submission.totalQuestions}`}
                      />

                      <ScoreItem
                        label="Attempt"
                        value={`#${submission.attemptNumber}`}
                      />

                    </div>

                  </div>

                </div>

                {/* DETAILS */}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <DetailCard
                    label="Status"
                    value={
                      submission.status ||
                      "Completed"
                    }
                  />

                  <DetailCard
                    label="Evaluated"
                    value={formatDateTime(
                      submission.evaluatedAt,
                    )}
                  />

                  <DetailCard
                    label="Total Questions"
                    value={String(
                      submission.totalQuestions,
                    )}
                  />

                </div>

                {/* ANSWERS */}

                <div className="mt-7">

                  <h3 className="text-lg font-bold text-slate-900">
                    Answer Review
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Review the participant's
                    submitted answers.
                  </p>

                  {!submission.answers ||
                  submission.answers.length ===
                    0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center">

                      <FileText className="mx-auto h-8 w-8 text-slate-300" />

                      <p className="mt-3 text-sm font-medium text-slate-500">
                        No answer details available.
                      </p>

                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">

                      {submission.answers.map(
                        (answer) => (
                          <AnswerCard
                            key={
                              answer.questionId
                            }
                            answer={
                              answer
                            }
                          />
                        ),
                      )}

                    </div>
                  )}

                </div>

              </div>
            )}

          {/* FOOTER */}

          <div className="flex shrink-0 justify-end border-t border-slate-200 px-5 py-4 sm:px-6">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ANSWER CARD
========================================================= */

function AnswerCard({
  answer,
}: {
  answer:
    TrainerAssessmentSubmission["answers"][number];
}) {
  const correct =
    answer.isCorrect;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
            {
              answer.questionNumber
            }
          </div>

          <div className="min-w-0">

            <p className="text-sm font-semibold leading-6 text-slate-900">
              {
                answer.questionText
              }
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {answer.points} point
              {answer.points === 1
                ? ""
                : "s"}
            </p>

          </div>

        </div>

        <ResultBadge
          passed={correct}
        />

      </div>

      <div
        className={
          correct
            ? "mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
            : "mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4"
        }
      >

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Participant Answer
        </p>

        <div className="mt-2 text-sm text-slate-700">

          {answer.selectedChoiceLabel && (
            <span className="mr-2 font-bold text-slate-900">
              {
                answer.selectedChoiceLabel
              }
              .
            </span>
          )}

          <span>
            {
              answer.selectedChoiceText ||
              "No answer"
            }
          </span>

        </div>

      </div>

      {!correct && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Correct Answer
          </p>

          <div className="mt-2 text-sm text-slate-700">

            {answer.correctChoiceLabel && (
              <span className="mr-2 font-bold text-slate-900">
                {
                  answer.correctChoiceLabel
                }
                .
              </span>
            )}

            <span>
              {
                answer.correctChoiceText ||
                "—"
              }
            </span>

          </div>

        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

        <span className="text-xs text-slate-500">
          Earned points
        </span>

        <span className="text-sm font-bold text-slate-900">
          {
            answer.earnedPoints
          }
          /
          {
            answer.points
          }
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

function DetailCard({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   SCORE ITEM
========================================================= */

function ScoreItem({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 shadow-sm">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
  );
}