"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Enrollment,
  PracticalAssessment,
  PracticalAssessmentResult,
  ParticipationParticipant,
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

export function useTrainerAssessmentsPage() {
  
    
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
    useState<
      "written" | "practical" | "participation"
    >("written");

  const [
    selectedParticipationSessionId,
    setSelectedParticipationSessionId,
  ] = useState<string>("");

  const [
    participationActionError,
    setParticipationActionError,
  ] = useState<string | null>(null);

  /* =======================================================
     COMMON UI
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     WRITTEN UI
  ======================================================= */

  const [
    selectedSubmission,
    setSelectedSubmission,
  ] = useState<TrainerAssessmentSubmission | null>(
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
  ] = useState<PracticalAssessment | null>(
    null,
  );

  const [
    selectedEnrollment,
    setSelectedEnrollment,
  ] = useState<Enrollment | null>(null);

  const [
    isEvaluationModalOpen,
    setIsEvaluationModalOpen,
  ] = useState(false);

  const [
    selectedPracticalResult,
    setSelectedPracticalResult,
  ] = useState<PracticalAssessmentResult | null>(
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

  const loadPage = useCallback(async () => {
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
  }, [
    loadWrittenTrainerAssessments,
    loadPracticalTrainerAssessments,
    loadTrainerEnrollments,
    loadBatches,
  ]);

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

  const writtenParticipants = useMemo(() => {
    const map = new Map<
      string,
      TrainerAssessmentSubmission
    >();

    trainerSubmissions.forEach((submission) => {
      const key = submission.participantId;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, submission);
        return;
      }

      const existingDate = existing.submittedAt
        ? new Date(
            existing.submittedAt,
          ).getTime()
        : 0;

      const currentDate = submission.submittedAt
        ? new Date(
            submission.submittedAt,
          ).getTime()
        : 0;

      if (currentDate >= existingDate) {
        map.set(key, submission);
      }
    });

    return Array.from(map.values());
  }, [trainerSubmissions]);

  /* =======================================================
     FILTER WRITTEN
  ======================================================= */

  const filteredWrittenParticipants =
    useMemo(() => {
      const keyword = search
        .trim()
        .toLowerCase();

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
          (assessment) =>
            assessment.isPublished === true,
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
  ======================================================= */

  const practicalParticipants = useMemo(() => {
    if (!currentPracticalAssessment) {
      return [];
    }

    return trainerEnrollments.filter(
      (enrollment) =>
        enrollment.trainingBatchId ===
          currentPracticalAssessment.trainingBatchId &&
        enrollment.status === "Approved",
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
      const keyword = search
        .trim()
        .toLowerCase();

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
     GET PRACTICAL RESULT
  ======================================================= */

  const getPracticalResult =
    useCallback(
      (enrollmentId: string) => {
        return (
          practicalResults.find(
            (item) =>
              item.enrollmentId ===
              enrollmentId,
          ) ?? null
        );
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
        ) / practicalResults.length;

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
            Number(
              participant.percentage ??
                0,
            ),
          0,
        ) / writtenParticipants.length;

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

          setSelectedSubmission(result);
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
      (enrollment: Enrollment) => {
        if (!currentPracticalAssessment) {
          return;
        }

        setPracticalActionError(null);

        setSelectedEnrollment(enrollment);

        setSelectedPracticalAssessment(
          currentPracticalAssessment,
        );

        setIsEvaluationModalOpen(true);
      },
      [currentPracticalAssessment],
    );

  /* =======================================================
     OPEN PRACTICAL RESULT
  ======================================================= */

  const handleViewPracticalResult =
    useCallback(
      (result: PracticalAssessmentResult) => {
        setPracticalActionError(null);

        setSelectedPracticalResult(result);

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
        if (!selectedPracticalAssessment) {
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

          setSelectedPracticalResult(result);

          setIsEvaluationModalOpen(false);

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
      setSelectedPracticalAssessment(null);
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

  const assignedParticipationBatchId =
    useMemo(() => {
      return (
        trainerEnrollments.find(
          (enrollment) =>
            Boolean(
              enrollment.trainingBatchId,
            ),
        )?.trainingBatchId ?? ""
      );
    }, [trainerEnrollments]);

  const assignedParticipationBatch =
    useMemo(() => {
      if (!assignedParticipationBatchId) {
        return null;
      }

      return (
        trainingBatches.find(
          (batch) =>
            batch.id ===
            assignedParticipationBatchId,
        ) ?? null
      );
    }, [
      trainingBatches,
      assignedParticipationBatchId,
    ]);

  useEffect(() => {
    if (!assignedParticipationBatchId) {
      return;
    }

    setParticipationActionError(null);

    void Promise.all([
      loadSetting(
        assignedParticipationBatchId,
      ),
      getSchedule(
        assignedParticipationBatchId,
      ),
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

    setSelectedParticipationSessionId(
      (current) => {
        if (
          current &&
          trainingSessions.some(
            (session) =>
              session.id === current,
          )
        ) {
          return current;
        }

        return trainingSessions[0]!.id;
      },
    );
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
      (
        participant: ParticipationParticipant,
      ) => {
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
      (
        participant: ParticipationParticipant,
      ) => {
        const item =
          participant as ParticipationParticipant & {
            participantName?: string | null;
            participantEmail?: string | null;
            participantUserCode?: string | null;
          };

        const enrollment =
          getParticipationEnrollment(
            participant,
          );

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
      (
        participant: ParticipationParticipant,
      ) => {
        const item =
          participant as ParticipationParticipant & {
            participantName?: string | null;
            participantEmail?: string | null;
            participantUserCode?: string | null;
          };

        const enrollment =
          getParticipationEnrollment(
            participant,
          );

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
      (
        participant: ParticipationParticipant,
      ) => {
        const item =
          participant as ParticipationParticipant & {
            participantName?: string | null;
            participantEmail?: string | null;
            participantUserCode?: string | null;
          };

        const enrollment =
          getParticipationEnrollment(
            participant,
          );

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
      const keyword = search
        .trim()
        .toLowerCase();

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
        const required = Number(
          participant.requiredRecitations ??
            participationRequiredRecitations,
        );

        return (
          required > 0 &&
          Number(
            participant.actualRecitations ??
              0,
          ) >= required
        );
      },
    ).length;

  const handleRecordParticipation =
    useCallback(
      async (
        participant: ParticipationParticipant,
      ) => {
        if (
          !selectedParticipationSessionId
        ) {
          return;
        }

        setParticipationActionError(null);

        try {
          const request = {
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
        if (
          !participant.participationRecordId
        ) {
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
     RETURN PAGE STATE
  ======================================================= */

  return {
    /* Tabs */
    assessmentType,
    setAssessmentType,

    /* Common */
    search,
    setSearch,

    /* Refresh */
    loadPage,
    activeLoading,
    activeError,

    /* Written */
    currentWrittenAssessment,
    filteredWrittenParticipants,
    writtenTotal,
    writtenPassed,
    writtenFailed,
    writtenAverage,
    writtenIsLoading,

    /* Written modal */
    selectedSubmission,
    isLoadingSubmission,
    submissionError,
    handleViewWrittenParticipant,
    closeWrittenModal,

    /* Practical */
    currentPracticalAssessment,
    filteredPracticalParticipants,
    practicalResults,
    practicalEvaluatedCount,
    practicalPassedCount,
    practicalFailedCount,
    practicalAverage,
    practicalIsLoading,
    enrollmentIsLoading,
    getPracticalResult,

    /* Practical evaluation modal */
    selectedPracticalAssessment,
    selectedEnrollment,
    isEvaluationModalOpen,
    isSubmittingEvaluation,
    practicalActionError,
    handleEvaluatePractical,
    handleSubmitPractical,
    closePracticalEvaluation,

    /* Practical result modal */
    selectedPracticalResult,
    isResultModalOpen,
    handleViewPracticalResult,
    closePracticalResult,

    /* Participation */
    trainingSessions,
    selectedParticipationBatch,
    selectedParticipationSession,
    participationSetting,
    participationParticipants,
    filteredParticipationParticipants,
    participationRecordedCount,
    participationCompletedCount,
    selectedParticipationSessionId,
    setSelectedParticipationSessionId,
    participationIsLoading,
    participationActionError,
    handleRecordParticipation,
    handleRemoveParticipation,
    getParticipationName,
    getParticipationEmail,
    getParticipationCode,
  };
}