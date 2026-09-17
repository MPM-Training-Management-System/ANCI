import {
  useCallback,
  useState,
} from "react";

import type {
  AdminAssessmentQuestion,
  AdminAssessmentChoice,
  AssessmentAttempt,
  AssessmentQuestion,
  AssessmentResult,
  AssessmentRetakeRequest,
  CreateAssessmentChoiceRequest,
  CreateAssessmentQuestionRequest,
  CreateAssessmentRetakeRequest,
  CreateWrittenAssessmentRequest,
  ParticipantAssessment,
  ReviewAssessmentRetakeRequest,
  SubmitAssessmentRequest,
  UpdateAssessmentChoiceRequest,
  UpdateAssessmentQuestionRequest,
  UpdateWrittenAssessmentRequest,
  WrittenAssessment,
  TrainerAssessmentSubmission,
} from "@repo/types";

import {
  ApiClient,
  WrittenAssessmentApi,
} from "@repo/api";

export function useWrittenAssessment(
  api: ApiClient,
) {
  const assessmentApi =
    new WrittenAssessmentApi(api);


  // =========================================================
  // STATE
  // =========================================================

  const [assessments, setAssessments] =
    useState<WrittenAssessment[]>([]);

  const [assessment, setAssessment] =
    useState<WrittenAssessment | null>(null);

  // ADMIN QUESTIONS
  const [questions, setQuestions] =
    useState<AdminAssessmentQuestion[]>([]);

  // PARTICIPANT
  const [
    participantAssessment,
    setParticipantAssessment,
  ] = useState<ParticipantAssessment | null>(null);

  const [attempt, setAttempt] =
    useState<AssessmentAttempt | null>(null);

  const [results, setResults] =
    useState<AssessmentResult[]>([]);

    // PARTICIPANT - RETAKE REQUESTS
const [retakeRequests, setRetakeRequests] =
  useState<AssessmentRetakeRequest[]>([]);

    const [trainerSubmissions, setTrainerSubmissions] =
  useState<TrainerAssessmentSubmission[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // =========================================================
  // COMMON
  // =========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

const loadTrainerAssessments = useCallback(
  async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data =
        await assessmentApi.getTrainerAssessments();

      const normalized =
        Array.isArray(data)
          ? data
          : [];

      setAssessments(normalized);

      return normalized;
    } catch (error) {
      console.error(
        "LOAD TRAINER ASSESSMENTS ERROR:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load your assessments.";

      setError(message);
      setAssessments([]);

      throw error;
    } finally {
      setIsLoading(false);
    }
  },
  [],
);
  // =========================================================
  // ADMIN - ASSESSMENT
  // =========================================================

  const loadByBatchId = useCallback(
    async (
      trainingBatchId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getByBatchId(
            trainingBatchId,
          );

        setAssessments(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load written assessments.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );

  // =========================================================
// TRAINER - ASSESSMENT SUBMISSIONS
// =========================================================

const loadTrainerSubmissions = useCallback(
  async (
    assessmentId: string,
  ): Promise<TrainerAssessmentSubmission[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await assessmentApi.getTrainerSubmissions(
          assessmentId,
        );

      setTrainerSubmissions(data);

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load assessment submissions.";

      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [api],
);

const loadTrainerSubmission = useCallback(
  async (
    attemptId: string,
  ): Promise<TrainerAssessmentSubmission> => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await assessmentApi.getTrainerSubmission(
          attemptId,
        );

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load assessment submission.";

      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [api],
);

const loadByBatchIdParticipantAssessment =
  useCallback(
    async (
      trainingBatchId: string,
    ): Promise<ParticipantAssessment[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getParticipantAssessmentsByBatch(
            trainingBatchId,
          );

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load participant assessments.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const loadById = useCallback(
    async (
      id: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getById(id);

        setAssessment(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load written assessment.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const createAssessment = useCallback(
    async (
      request: CreateWrittenAssessmentRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.create(request);

        setAssessment(data);

        setAssessments(current => [
          ...current,
          data,
        ]);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create written assessment.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const updateAssessment = useCallback(
    async (
      id: string,
      request: UpdateWrittenAssessmentRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.update(
            id,
            request,
          );

        setAssessment(data);

        setAssessments(current =>
          current.map(item =>
            item.id === id
              ? data
              : item,
          ),
        );

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update written assessment.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const deleteAssessment = useCallback(
    async (
      id: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        await assessmentApi.delete(id);

        setAssessments(current =>
          current.filter(
            item => item.id !== id,
          ),
        );

        if (assessment?.id === id) {
          setAssessment(null);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete written assessment.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api, assessment?.id],
  );


  const setPublished = useCallback(
    async (
      id: string,
      isPublished: boolean,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.setPublished(
            id,
            isPublished,
          );

        setAssessment(data);

        setAssessments(current =>
          current.map(item =>
            item.id === id
              ? data
              : item,
          ),
        );

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update publication status.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // ADMIN - QUESTIONS
  // =========================================================

  const loadQuestions = useCallback(
    async (
      assessmentId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getQuestions(
            assessmentId,
          );

        setQuestions(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load assessment questions.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const createQuestion = useCallback(
    async (
      request: CreateAssessmentQuestionRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.createQuestion(
            request,
          );

        setQuestions(current =>
          [
            ...current,
            data,
          ].sort(
            (a, b) =>
              a.questionNumber -
              b.questionNumber,
          ),
        );

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create assessment question.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const updateQuestion = useCallback(
    async (
      questionId: string,
      request: UpdateAssessmentQuestionRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.updateQuestion(
            questionId,
            request,
          );

        setQuestions(current =>
          current
            .map(item =>
              item.id === questionId
                ? data
                : item,
            )
            .sort(
              (a, b) =>
                a.questionNumber -
                b.questionNumber,
            ),
        );

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update assessment question.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const deleteQuestion = useCallback(
    async (
      questionId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        await assessmentApi.deleteQuestion(
          questionId,
        );

        setQuestions(current =>
          current.filter(
            item => item.id !== questionId,
          ),
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete assessment question.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // ADMIN - AI QUESTION GENERATION
  // =========================================================

  const generateFromDocument = useCallback(
    async (
      assessmentId: string,
      file: File,
      questionCount: number,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const generatedQuestions =
          await assessmentApi.generateFromDocument(
            assessmentId,
            file,
            questionCount,
          );

        setQuestions(current =>
          [
            ...current,
            ...generatedQuestions,
          ].sort(
            (a, b) =>
              a.questionNumber -
              b.questionNumber,
          ),
        );

        return generatedQuestions;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to generate questions from document.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // ADMIN - CHOICES
  // =========================================================

  const createChoice = useCallback(
    async (
      request: CreateAssessmentChoiceRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.createChoice(
            request,
          );

        setQuestions(current =>
          current.map(question => {
            if (
              question.id !==
              request.assessmentQuestionId
            ) {
              return question;
            }

            return {
              ...question,

              choices: [
                ...question.choices,
                data,
              ].sort(
                (a, b) =>
                  a.displayOrder -
                  b.displayOrder,
              ),
            };
          }),
        );

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create assessment choice.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const updateChoice = useCallback(
    async (
      choiceId: string,
      request: UpdateAssessmentChoiceRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.updateChoice(
            choiceId,
            request,
          );

        setQuestions(current =>
          current.map(question => ({
            ...question,

            choices: question.choices
              .map(choice =>
                choice.id === choiceId
                  ? data
                  : choice,
              )
              .sort(
                (a, b) =>
                  a.displayOrder -
                  b.displayOrder,
              ),
          })),
        );

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update assessment choice.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const deleteChoice = useCallback(
    async (
      choiceId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        await assessmentApi.deleteChoice(
          choiceId,
        );

        setQuestions(current =>
          current.map(question => ({
            ...question,

            choices:
              question.choices.filter(
                choice =>
                  choice.id !== choiceId,
              ),
          })),
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete assessment choice.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // PARTICIPANT
  // =========================================================

  const loadParticipantAssessment =
    useCallback(
      async (
        assessmentId: string,
      ) => {
        setIsLoading(true);
        setError(null);

        try {
          const data =
            await assessmentApi
              .getParticipantAssessment(
                assessmentId,
              );

          setParticipantAssessment(data);

          return data;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load assessment.";

          setError(message);

          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [api],
    );


  const startAttempt = useCallback(
    async (
      writtenAssessmentId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.startAttempt(
            writtenAssessmentId,
          );

        setAttempt(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to start assessment.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const loadAttempt = useCallback(
    async (
      attemptId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getAttempt(
            attemptId,
          );

        setAttempt(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load assessment attempt.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const submitAttempt = useCallback(
    async (
      request: SubmitAssessmentRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.submitAttempt(
            request,
          );

        setResults(current => [
          data,
          ...current,
        ]);

        setAttempt(null);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to submit assessment.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const loadMyResults = useCallback(
    async (
      assessmentId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getMyResults(
            assessmentId,
          );

        setResults(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load assessment results.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );
// =========================================================
// PARTICIPANT - RETAKE REQUEST
// =========================================================

const requestRetake = useCallback(
  async (
    request: CreateAssessmentRetakeRequest,
  ): Promise<AssessmentRetakeRequest> => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await assessmentApi.requestRetake(
          request,
        );

      setRetakeRequests(current => [
        data,
        ...current,
      ]);

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit retake request.";

      setError(message);

      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [api],
);


const loadMyRetakeRequests = useCallback(
  async (): Promise<AssessmentRetakeRequest[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await assessmentApi
          .getMyRetakeRequests();

      setRetakeRequests(data);

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load retake requests.";

      setError(message);

      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [api],
);

// =========================================================
// ADMIN - RETAKE REQUESTS
// =========================================================

const loadRetakeRequests = useCallback(
  async (): Promise<AssessmentRetakeRequest[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await assessmentApi
          .getRetakeRequests();

      setRetakeRequests(data);

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load retake requests.";

      setError(message);

      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [api],
);


const reviewRetakeRequest = useCallback(
  async (
    requestId: string,
    request: ReviewAssessmentRetakeRequest,
  ): Promise<AssessmentRetakeRequest> => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await assessmentApi
          .reviewRetakeRequest(
            requestId,
            request,
          );

      setRetakeRequests(current =>
        current.map(item =>
          item.id === requestId
            ? data
            : item,
        ),
      );

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to review retake request.";

      setError(message);

      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [api],
);

  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(() => {
    setAssessments([]);
    setAssessment(null);
    setQuestions([]);
    setParticipantAssessment(null);
    setAttempt(null);
    setResults([]);
    setError(null);
    setIsLoading(false);
    setRetakeRequests([]);
  }, []);


  // =========================================================
  // RETURN
  // =========================================================

  return {
    // state
    assessments,
    assessment,
    questions,

    participantAssessment,
    attempt,
    results,

    isLoading,
    error,

    // common
    clearError,
    reset,

    // admin assessment
    loadByBatchId,
    loadById,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    setPublished,

    // admin questions
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,

    // AI generation
    generateFromDocument,

    trainerSubmissions,
loadTrainerSubmissions,
loadTrainerSubmission,
  loadTrainerAssessments,

    // admin choices
    createChoice,
    updateChoice,
    deleteChoice,

   // participant
loadParticipantAssessment,
startAttempt,
loadAttempt,
submitAttempt,
loadMyResults,
loadByBatchIdParticipantAssessment,

// participant - retake
retakeRequests,
requestRetake,
loadMyRetakeRequests,

// admin - retake
loadRetakeRequests,
reviewRetakeRequest,
  };
}