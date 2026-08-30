"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainerApplication,
} from "@repo/types";

import type {
  TrainerApplicationApi,
} from "@repo/api";


export function useTrainerApplications(
  trainerApplicationApi: TrainerApplicationApi
) {
  // =========================================================
  // STATE
  // =========================================================

  const [
    applications,
    setApplications,
  ] = useState<
    TrainerApplication[]
  >([]);

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState<
    TrainerApplication | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isReviewing,
    setIsReviewing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // =========================================================
  // LOAD ALL APPLICATIONS
  // =========================================================

  const loadApplications =
    useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result =
          await trainerApplicationApi.getAll();

        setApplications(
          Array.isArray(result)
            ? result
            : []
        );

      } catch (error) {
        console.error(
          "LOAD TRAINER APPLICATIONS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load trainer applications."
        );

        setApplications([]);

      } finally {
        setIsLoading(false);
      }
    }, [
      trainerApplicationApi,
    ]);


  // =========================================================
  // LOAD APPLICATION BY ID
  // =========================================================

  const getApplication =
    useCallback(
      async (id: string) => {
        try {
          setError(null);

          const result =
            await trainerApplicationApi.getById(
              id
            );

          setSelectedApplication(
            result
          );

          return result;

        } catch (error) {
          console.error(
            "GET TRAINER APPLICATION ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load trainer application."
          );

          return null;
        }
      },
      [
        trainerApplicationApi,
      ]
    );


  // =========================================================
  // REVIEW APPLICATION
  // =========================================================

  const reviewApplication = useCallback(
  async (
    id: string,
    decision:
      | "Approved"
      | "Rejected"
      | "NeedsCorrection",
    remarks?: string
  ) => {
        try {
          setIsReviewing(true);
          setError(null);

          await trainerApplicationApi.review(
            id,
            {
              decision,
              remarks,
            }
          );

          // Refresh list
          await loadApplications();

          // Refresh selected application
          if (
            selectedApplication?.id === id
          ) {
            await getApplication(id);
          }

          return true;

        } catch (error) {
          console.error(
            "REVIEW TRAINER APPLICATION ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to review trainer application."
          );

          return false;

        } finally {
          setIsReviewing(false);
        }
      },
      [
        trainerApplicationApi,
        loadApplications,
        getApplication,
        selectedApplication?.id,
      ]
    );


  // =========================================================
  // REVIEW DOCUMENT
  // =========================================================

 const reviewDocument = useCallback(
  async (
    applicationId: string,
    documentId: string,
    decision:
      | "Approved"
      | "Rejected"
      | "NeedsCorrection",
    remarks?: string
  ) => {
    try {
      setIsReviewing(true);
      setError(null);

      await trainerApplicationApi.reviewDocument(
        applicationId,
        documentId,
        {
          decision,
          remarks,
        }
      );

      await loadApplications();

      if (
        selectedApplication?.id === applicationId
      ) {
        await getApplication(applicationId);
      }

      return true;
    } catch (error) {
      console.error(
        "REVIEW DOCUMENT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to review document."
      );

      return false;
    } finally {
      setIsReviewing(false);
    }
  },
  [
    trainerApplicationApi,
    loadApplications,
    getApplication,
    selectedApplication?.id,
  ]
);


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadApplications();
  }, [
    loadApplications,
  ]);


  // =========================================================
  // RESET
  // =========================================================

  const reset = () => {
    setApplications([]);
    setSelectedApplication(null);
    setIsLoading(false);
    setIsReviewing(false);
    setError(null);
  };


  // =========================================================
  // RETURN
  // =========================================================

  return {
    applications,

    selectedApplication,

    setSelectedApplication,

    isLoading,

    isReviewing,

    error,

    loadApplications,

    getApplication,

    reviewApplication,

    reviewDocument,

    reset,
  };
}