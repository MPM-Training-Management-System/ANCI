import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainingBatch,
} from "@repo/types";

import type {
  TrainingBatchApi,
} from "@repo/api";


export function useTrainingBatches(
  trainingBatchApi: TrainingBatchApi,
) {

  // =========================================================
  // DATA
  // =========================================================

  const [
    batches,
    setBatches,
  ] = useState<TrainingBatch[]>([]);


  const [
    selectedBatch,
    setSelectedBatch,
  ] = useState<TrainingBatch | null>(
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
    isLoadingBatch,
    setIsLoadingBatch,
  ] = useState(false);


  // =========================================================
  // ERROR
  // =========================================================

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  // =========================================================
  // GET ALL TRAINING BATCHES
  // GET /api/training-batches
  // =========================================================

  const loadBatches =
    useCallback(
      async () => {

        try {

          setIsLoading(true);
          setError(null);

          const result =
            await trainingBatchApi.getAll();

          setBatches(
            Array.isArray(result)
              ? result
              : [],
          );

          return result;

        } catch (error) {

          console.error(
            "LOAD TRAINING BATCHES ERROR:",
            error,
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load training batches.",
          );

          setBatches([]);

          return [];

        } finally {

          setIsLoading(false);

        }

      },
      [
        trainingBatchApi,
      ],
    );


  // =========================================================
  // GET TRAINING BATCH BY ID
  // GET /api/training-batches/{id}
  // =========================================================

  const loadBatchById =
    useCallback(
      async (
        id: string,
      ) => {

        try {

          setIsLoadingBatch(true);
          setError(null);

          const result =
            await trainingBatchApi.getById(
              id,
            );

          setSelectedBatch(
            result,
          );

          return result;

        } catch (error) {

          console.error(
            "LOAD TRAINING BATCH BY ID ERROR:",
            error,
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load training batch.",
          );

          setSelectedBatch(
            null,
          );

          return null;

        } finally {

          setIsLoadingBatch(false);

        }

      },
      [
        trainingBatchApi,
      ],
    );


  // =========================================================
  // GET BATCH FROM CURRENT LIST
  // =========================================================

  const getBatchById =
    useCallback(
      (
        id: string,
      ): TrainingBatch | null => {

        return (
          batches.find(
            (batch) =>
              batch.id === id,
          ) ?? null
        );

      },
      [
        batches,
      ],
    );


  // =========================================================
  // AVAILABLE TRAINING BATCHES
  // =========================================================
  //
  // Participants should only see batches
  // that have already been published.
  //
  // Hidden:
  // - draft
  // - ongoing
  // - Completed
  // - Cancelled
  //
  // Published:
  // - visible to participants
  // =========================================================

  const availableBatches =
    batches.filter(
      (batch) =>
        batch.status === "Published",
    );


  // =========================================================
  // REFRESH
  // =========================================================

  const refresh =
    useCallback(
      async () => {

        return await loadBatches();

      },
      [
        loadBatches,
      ],
    );


  // =========================================================
  // CLEAR SELECTED BATCH
  // =========================================================

  const clearSelectedBatch =
    useCallback(
      () => {

        setSelectedBatch(
          null,
        );

      },
      [],
    );


  // =========================================================
  // RESET
  // =========================================================

  const reset =
    useCallback(
      () => {

        setBatches([]);

        setSelectedBatch(
          null,
        );

        setIsLoading(false);

        setIsLoadingBatch(
          false,
        );

        setError(null);

      },
      [],
    );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadBatches();

  }, [
    loadBatches,
  ]);


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // -------------------------------------------------------
    // ALL BATCHES
    // -------------------------------------------------------

    batches,

    // -------------------------------------------------------
    // PARTICIPANT AVAILABLE BATCHES
    // -------------------------------------------------------

    availableBatches,

    // -------------------------------------------------------
    // SELECTED BATCH
    // -------------------------------------------------------

    selectedBatch,

    setSelectedBatch,

    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    isLoading,

    isLoadingBatch,

    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    error,

    // -------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------

    loadBatches,

    loadBatchById,

    getBatchById,

    refresh,

    clearSelectedBatch,

    // -------------------------------------------------------
    // RESET
    // -------------------------------------------------------

    reset,

  };
}