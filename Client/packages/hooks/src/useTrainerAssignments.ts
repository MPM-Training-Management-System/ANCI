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
  trainerAssignmentApi: TrainerAssignmentApi
) {

  // =========================================================
  // DATA
  // =========================================================

  const [
    assignments,
    setAssignments,
  ] = useState<TrainerAssignment[]>([]);

  const [
    selectedAssignment,
    setSelectedAssignment,
  ] = useState<TrainerAssignment | null>(null);


  // =========================================================
  // LOADING
  // =========================================================

  const [
    isLoading,
    setIsLoading,
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
  // =========================================================

  const loadAssignments = useCallback(
    async () => {

      try {

        setIsLoading(true);
        setError(null);

        const result =
          await trainerAssignmentApi.getAll();

        setAssignments(
          Array.isArray(result)
            ? result
            : []
        );

      } catch (error) {

        console.error(
          "LOAD TRAINER ASSIGNMENTS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load trainer assignments."
        );

        setAssignments([]);

      } finally {

        setIsLoading(false);

      }

    },
    [
      trainerAssignmentApi,
    ]
  );


  // =========================================================
  // GET MY ASSIGNMENTS
  // =========================================================

  const loadMyAssignments = useCallback(
    async () => {

      try {

        setIsLoading(true);
        setError(null);

        const result =
          await trainerAssignmentApi
            .getMyAssignments();

        return result;

      } catch (error) {

        console.error(
          "LOAD MY TRAINER ASSIGNMENTS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your trainer assignments."
        );

        return [];

      } finally {

        setIsLoading(false);

      }

    },
    [
      trainerAssignmentApi,
    ]
  );


  // =========================================================
  // ASSIGN TRAINER
  // =========================================================

  const assignTrainer = useCallback(
    async (
      request: AssignTrainerRequest
    ) => {

      try {

        setIsCreating(true);
        setError(null);

        const result =
          await trainerAssignmentApi.create(
            request
          );

        await loadAssignments();

        setSelectedAssignment(
          result
        );

        return result;

      } catch (error) {

        console.error(
          "ASSIGN TRAINER ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to assign trainer."
        );

        return null;

      } finally {

        setIsCreating(false);

      }

    },
    [
      trainerAssignmentApi,
      loadAssignments,
    ]
  );


  // =========================================================
  // REMOVE ASSIGNMENT
  // =========================================================

  const removeAssignment = useCallback(
    async (
      id: string
    ) => {

      try {

        setIsDeleting(true);
        setError(null);

        await trainerAssignmentApi.delete(
          id
        );

        setAssignments(
          current =>
            current.filter(
              assignment =>
                assignment.id !== id
            )
        );

        if (
          selectedAssignment?.id === id
        ) {

          setSelectedAssignment(
            null
          );

        }

        return true;

      } catch (error) {

        console.error(
          "REMOVE TRAINER ASSIGNMENT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to remove trainer assignment."
        );

        return false;

      } finally {

        setIsDeleting(false);

      }

    },
    [
      trainerAssignmentApi,
      selectedAssignment?.id,
    ]
  );


  // =========================================================
  // FIND ASSIGNMENT BY BATCH
  // =========================================================

  const getAssignmentByBatch =
    useCallback(
      (
        trainingBatchId: string
      ) => {

        return (
          assignments.find(
            assignment =>
              assignment.trainingBatchId ===
                trainingBatchId &&
              assignment.isActive
          ) ?? null
        );

      },
      [
        assignments,
      ]
    );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadAssignments();

  }, [
    loadAssignments,
  ]);


  // =========================================================
  // RESET
  // =========================================================

  const reset = useCallback(
    () => {

      setAssignments([]);
      setSelectedAssignment(null);

      setIsLoading(false);
      setIsCreating(false);
      setIsDeleting(false);

      setError(null);

    },
    []
  );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    assignments,
    selectedAssignment,

    setSelectedAssignment,

    isLoading,
    isCreating,
    isDeleting,

    error,

    loadAssignments,
    loadMyAssignments,
    assignTrainer,
    removeAssignment,
    getAssignmentByBatch,

    reset,
  };
}