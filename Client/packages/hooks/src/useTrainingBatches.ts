"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainingBatch,
  CreateTrainingBatchRequest,
  UpdateTrainingBatchRequest,
  UpdateTrainingBatchStatusRequest,
} from "@repo/types";

import type {
  TrainingBatchApi,
} from "@repo/api";


export function useTrainingBatches(
  trainingBatchApi: TrainingBatchApi
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
    null
  );


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
    isUpdating,
    setIsUpdating,
  ] = useState(false);


  const [
    isUpdatingStatus,
    setIsUpdatingStatus,
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
  // GET ALL
  // =========================================================

  const loadBatches = useCallback(
    async () => {

      try {

        setIsLoading(true);
        setError(null);

        const result =
          await trainingBatchApi.getAll();

        setBatches(
          Array.isArray(result)
            ? result
            : []
        );

      } catch (error) {

        console.error(
          "LOAD TRAINING BATCHES ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load training batches."
        );

        setBatches([]);

      } finally {

        setIsLoading(false);

      }

    },
    [
      trainingBatchApi,
    ]
  );


  // =========================================================
  // GET BY ID
  // =========================================================

  const getBatch = useCallback(
    async (
      id: string
    ) => {

      try {

        setError(null);

        const result =
          await trainingBatchApi.getById(
            id
          );

        setSelectedBatch(
          result
        );

        return result;

      } catch (error) {

        console.error(
          "GET TRAINING BATCH ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load training batch."
        );

        return null;

      }

    },
    [
      trainingBatchApi,
    ]
  );


  // =========================================================
  // CREATE
  // =========================================================

  const createBatch = useCallback(
    async (
      request: CreateTrainingBatchRequest
    ) => {

      try {

        setIsCreating(true);
        setError(null);

        const result =
          await trainingBatchApi.create(
            request
          );

        await loadBatches();

        return result;

      } catch (error) {

        console.error(
          "CREATE TRAINING BATCH ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to create training batch."
        );

        return null;

      } finally {

        setIsCreating(false);

      }

    },
    [
      trainingBatchApi,
      loadBatches,
    ]
  );


  // =========================================================
  // UPDATE
  // =========================================================

  const updateBatch = useCallback(
    async (
      id: string,
      request: UpdateTrainingBatchRequest
    ) => {

      try {

        setIsUpdating(true);
        setError(null);

        await trainingBatchApi.update(
          id,
          request
        );

        await loadBatches();

        if (
          selectedBatch?.id === id
        ) {

          await getBatch(id);

        }

        return true;

      } catch (error) {

        console.error(
          "UPDATE TRAINING BATCH ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update training batch."
        );

        return false;

      } finally {

        setIsUpdating(false);

      }

    },
    [
      trainingBatchApi,
      loadBatches,
      getBatch,
      selectedBatch?.id,
    ]
  );


  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateBatchStatus =
    useCallback(
      async (
        id: string,
        status: UpdateTrainingBatchStatusRequest
      ) => {

        try {

          setIsUpdatingStatus(true);
          setError(null);

          await trainingBatchApi.updateStatus(
            id,
            status
          );

          await loadBatches();

          if (
            selectedBatch?.id === id
          ) {

            await getBatch(id);

          }

          return true;

        } catch (error) {

          console.error(
            "UPDATE TRAINING BATCH STATUS ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to update training batch status."
          );

          return false;

        } finally {

          setIsUpdatingStatus(false);

        }

      },
      [
        trainingBatchApi,
        loadBatches,
        getBatch,
        selectedBatch?.id,
      ]
    );


  // =========================================================
  // DELETE
  // DELETE /api/training-batches/{id}
  // =========================================================
const refresh = async () => {
  await loadBatches();
};
  const deleteBatch = useCallback(
    async (
      id: string
    ) => {

      try {

        setIsDeleting(true);
        setError(null);

        await trainingBatchApi.delete(
          id
        );

        // Remove immediately from UI
        setBatches(
          current =>
            current.filter(
              batch =>
                batch.id !== id
            )
        );

        // Clear selected batch if deleted
        if (
          selectedBatch?.id === id
        ) {

          setSelectedBatch(null);

        }

        return true;

      } catch (error) {

        console.error(
          "DELETE TRAINING BATCH ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete training batch."
        );

        return false;

      } finally {

        setIsDeleting(false);

      }

    },
    [
      trainingBatchApi,
      selectedBatch?.id,
    ]
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
  // RESET
  // =========================================================

  const reset = useCallback(
    () => {

      setBatches([]);
      setSelectedBatch(null);

      setIsLoading(false);
      setIsCreating(false);
      setIsUpdating(false);
      setIsUpdatingStatus(false);
      setIsDeleting(false);

      setError(null);

    },
    []
  );


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // -------------------------------------------------------
    // DATA
    // -------------------------------------------------------

    batches,

    selectedBatch,


    // -------------------------------------------------------
    // SETTER
    // -------------------------------------------------------

    setSelectedBatch,


    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    isLoading,

    isCreating,

    isUpdating,

    isUpdatingStatus,

    isDeleting,


    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    error,


    // -------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------

    loadBatches,

    getBatch,

    createBatch,

    updateBatch,

    updateBatchStatus,

    deleteBatch,

refresh,
    // -------------------------------------------------------
    // RESET
    // -------------------------------------------------------

    reset,

  };
}