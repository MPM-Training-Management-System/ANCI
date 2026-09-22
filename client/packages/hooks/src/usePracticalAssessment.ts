import {
  useCallback,
  useState,
} from "react";

import type {
  PracticalAssessment,
  PracticalAssessmentResult,
  CreatePracticalAssessmentRequest,
  EvaluatePracticalAssessmentRequest,
} from "@repo/types";

import {
  ApiClient,
  PracticalAssessmentApi,
} from "@repo/api";

export function usePracticalAssessment(
  api: ApiClient,
) {
  const assessmentApi =
    new PracticalAssessmentApi(api);

  // =========================================================
  // STATE
  // =========================================================

  const [assessments, setAssessments] =
    useState<PracticalAssessment[]>([]);

  const [assessment, setAssessment] =
    useState<PracticalAssessment | null>(null);

  const [results, setResults] =
    useState<PracticalAssessmentResult[]>([]);

  const [result, setResult] =
    useState<PracticalAssessmentResult | null>(null);

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


  // =========================================================
  // ADMIN - ASSESSMENT
  // =========================================================

  const loadAssessments = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getAll();

        const normalized =
          Array.isArray(data)
            ? data
            : [];

        setAssessments(normalized);

        return normalized;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load practical assessments.";

        setError(message);

        setAssessments([]);

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
            : "Failed to load practical assessment.";

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
      request: CreatePracticalAssessmentRequest,
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
            : "Failed to create practical assessment.";

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
      request: CreatePracticalAssessmentRequest,
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
            : "Failed to update practical assessment.";

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
            : "Failed to delete practical assessment.";

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
  // TRAINER - ASSESSMENT
  // =========================================================

  const loadTrainerAssessments = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getTrainerAssessments();

        const normalized =
          Array.isArray(data)
            ? data
            : [];

        setAssessments(normalized);

        return normalized;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load your practical assessments.";

        setError(message);

        setAssessments([]);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // TRAINER - EVALUATE
  // =========================================================

  const evaluateAssessment = useCallback(
    async (
      request: EvaluatePracticalAssessmentRequest,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.evaluate(
            request,
          );

        setResult(data);

        setResults(current => {
          const exists = current.some(
            item => item.id === data.id,
          );

          if (exists) {
            return current.map(item =>
              item.id === data.id
                ? data
                : item,
            );
          }

          return [
            data,
            ...current,
          ];
        });

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to evaluate practical assessment.";

        setError(message);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  // =========================================================
  // TRAINER - RESULTS
  // =========================================================

  const loadResults = useCallback(
    async (
      assessmentId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getResults(
            assessmentId,
          );

        const normalized =
          Array.isArray(data)
            ? data
            : [];

        setResults(normalized);

        return normalized;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load practical assessment results.";

        setError(message);

        setResults([]);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api],
  );


  const loadResult = useCallback(
    async (
      enrollmentId: string,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await assessmentApi.getResult(
            enrollmentId,
          );

        setResult(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load practical assessment result.";

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
    setResults([]);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);


  // =========================================================
  // RETURN
  // =========================================================

  return {
    // state
    assessments,
    assessment,
    results,
    result,

    isLoading,
    error,

    // common
    clearError,
    reset,

    // admin
    loadAssessments,
    loadById,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    setPublished,

    // trainer
    loadTrainerAssessments,
    evaluateAssessment,
    loadResults,
    loadResult,
  };
}