
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainerAssignment,
  AssignTrainerRequest,
} from "@repo/types";

import type {
  TrainerAssignmentApi,
} from "@repo/api";

export function useTrainerAssignments(
  trainerAssignmentApi: TrainerAssignmentApi,
  options?: {
    loadAll?: boolean;
  },
) {
  // =========================================================
  // OPTIONS
  // =========================================================

  /**
   * Admin:
   *   useTrainerAssignments(api)
   *
   * Trainer:
   *   useTrainerAssignments(api, {
   *     loadAll: false,
   *   })
   *
   * Default is true so existing Admin behavior
   * remains unchanged.
   */
  const loadAll = options?.loadAll ?? true;

  // =========================================================
  // DATA
  // =========================================================

  const [
    assignments,
    setAssignments,
  ] = useState<TrainerAssignment[]>([]);

  const [
    myAssignments,
    setMyAssignments,
  ] = useState<TrainerAssignment[]>([]);

  const [
    selectedAssignment,
    setSelectedAssignment,
  ] = useState<TrainerAssignment | null>(
    null,
  );

  // =========================================================
  // LOADING
  // =========================================================

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isLoadingMyAssignments,
    setIsLoadingMyAssignments,
  ] = useState(false);

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  // =========================================================
  // ERROR
  // =========================================================

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  // =========================================================
  // GET ALL ASSIGNMENTS
  // ADMIN ONLY
  // =========================================================

  const loadAssignments = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await trainerAssignmentApi.getAll();

        const normalized =
          Array.isArray(result)
            ? result
            : [];

        setAssignments(normalized);

        return normalized;
      } catch (error) {
        console.error(
          "LOAD TRAINER ASSIGNMENTS ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load trainer assignments.",
        );

        setAssignments([]);

        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [trainerAssignmentApi],
  );

  // =========================================================
  // GET MY ASSIGNMENTS
  // TRAINER ONLY
  // =========================================================

  const loadMyAssignments = useCallback(
    async () => {
      try {
        setIsLoadingMyAssignments(true);
        setError(null);

        const result =
          await trainerAssignmentApi.getMyAssignments();

        const normalized =
          Array.isArray(result)
            ? result.filter(
                (assignment) =>
                  assignment.isActive,
              )
            : [];

        setMyAssignments(normalized);

        return normalized;
      } catch (error) {
        console.error(
          "LOAD MY TRAINER ASSIGNMENTS ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your training assignments.",
        );

        setMyAssignments([]);

        return [];
      } finally {
        setIsLoadingMyAssignments(false);
      }
    },
    [trainerAssignmentApi],
  );

  // =========================================================
  // ASSIGN TRAINER
  // ADMIN ONLY
  // =========================================================

  const assignTrainer = useCallback(
    async (
      request: AssignTrainerRequest,
    ) => {
      try {
        setIsCreating(true);
        setError(null);

        const result =
          await trainerAssignmentApi.create(
            request,
          );

        await loadAssignments();

        setSelectedAssignment(result);

        return result;
      } catch (error) {
        console.error(
          "ASSIGN TRAINER ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to assign trainer.",
        );

        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [
      trainerAssignmentApi,
      loadAssignments,
    ],
  );

  // =========================================================
  // REMOVE ASSIGNMENT
  // ADMIN ONLY
  // =========================================================

  const removeAssignment = useCallback(
    async (
      id: string,
    ) => {
      try {
        setIsDeleting(true);
        setError(null);

        await trainerAssignmentApi.delete(
          id,
        );

        setAssignments(
          (current) =>
            current.filter(
              (assignment) =>
                assignment.id !== id,
            ),
        );

        setMyAssignments(
          (current) =>
            current.filter(
              (assignment) =>
                assignment.id !== id,
            ),
        );

        if (
          selectedAssignment?.id === id
        ) {
          setSelectedAssignment(null);
        }

        return true;
      } catch (error) {
        console.error(
          "REMOVE TRAINER ASSIGNMENT ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to remove trainer assignment.",
        );

        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [
      trainerAssignmentApi,
      selectedAssignment?.id,
    ],
  );

  // =========================================================
  // FIND ASSIGNMENT BY BATCH
  // ADMIN
  // =========================================================

  const getAssignmentByBatch =
    useCallback(
      (
        trainingBatchId: string,
      ) => {
        return (
          assignments.find(
            (assignment) =>
              assignment.trainingBatchId ===
                trainingBatchId &&
              assignment.isActive,
          ) ?? null
        );
      },
      [assignments],
    );

  // =========================================================
  // FIND MY ASSIGNMENT BY BATCH
  // TRAINER
  // =========================================================

  const getMyAssignmentByBatch =
    useCallback(
      (
        trainingBatchId: string,
      ) => {
        return (
          myAssignments.find(
            (assignment) =>
              assignment.trainingBatchId ===
                trainingBatchId &&
              assignment.isActive,
          ) ?? null
        );
      },
      [myAssignments],
    );

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  //
  // ADMIN:
  //   loadAll = true
  //   → GET /api/trainer-assignments
  //
  // TRAINER:
  //   loadAll = false
  //   → DO NOT call GET /api/trainer-assignments
  //
  // Trainer page will explicitly call:
  //   loadMyAssignments()
  //
  // =========================================================

  useEffect(() => {
    if (!loadAll) {
      return;
    }

    loadAssignments();
  }, [
    loadAll,
    loadAssignments,
  ]);

  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(
    () => {
      setAssignments([]);
      setMyAssignments([]);
      setSelectedAssignment(null);

      setIsLoading(false);
      setIsLoadingMyAssignments(false);
      setIsCreating(false);
      setIsDeleting(false);

      setError(null);
    },
    [],
  );

  // =========================================================
  // RETURN
  // =========================================================

  return {
    // =======================================================
    // DATA
    // =======================================================

    assignments,
    myAssignments,
    selectedAssignment,

    setSelectedAssignment,

    // =======================================================
    // LOADING
    // =======================================================

    isLoading,
    isLoadingMyAssignments,
    isCreating,
    isDeleting,

    // =======================================================
    // ERROR
    // =======================================================

    error,

    // =======================================================
    // ADMIN
    // =======================================================

    loadAssignments,
    assignTrainer,
    removeAssignment,
    getAssignmentByBatch,

    // =======================================================
    // TRAINER
    // =======================================================

    loadMyAssignments,
    getMyAssignmentByBatch,

    // =======================================================
    // RESET
    // =======================================================

    reset,
  };
}
