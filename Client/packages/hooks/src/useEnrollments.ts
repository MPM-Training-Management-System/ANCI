import {
  useCallback,
  useState,
} from "react";

import type {
  Enrollment,
  CreateEnrollmentRequest,
  ReviewEnrollmentRequest,
  TrainingProgramRequirement,
  EnrollmentDocument,
  ReviewEnrollmentDocumentRequest,
} from "@repo/types";

import type {
  EnrollmentApi,
} from "@repo/api";


// =========================================================
// ENROLLMENT HOOK
//
// Shared by:
// - Participant Mobile
// - Admin Web
//
// Handles:
// - Current participant enrollments
// - Pending enrollments
// - Creating enrollment
// - Reviewing enrollment
// - Loading training requirements
// - Loading enrollment documents
// - Reviewing enrollment documents
// =========================================================

export function useEnrollments(
  api: EnrollmentApi
) {

  // =======================================================
  // STATE
  // =======================================================

  const [trainerEnrollments, setTrainerEnrollments] =
  useState<Enrollment[]>([]);

  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [pendingEnrollments, setPendingEnrollments] =
    useState<Enrollment[]>([]);

  const [requirements, setRequirements] =
    useState<TrainingProgramRequirement[]>([]);

  const [enrollmentDocuments, setEnrollmentDocuments] =
    useState<EnrollmentDocument[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isLoadingRequirements, setIsLoadingRequirements] =
    useState(false);

  const [isLoadingDocuments, setIsLoadingDocuments] =
    useState(false);

  const [error, setError] =
    useState<Error | null>(null);

  const [requirementsError, setRequirementsError] =
    useState<Error | null>(null);

  const [documentsError, setDocumentsError] =
    useState<Error | null>(null);


  // =========================================================
  // GET MY ENROLLMENTS
  //
  // Participant:
  // GET /api/enrollments/me
  // =========================================================

  const loadMyEnrollments =
    useCallback(async () => {

      try {

        setIsLoading(true);
        setError(null);

        const result =
          await api.getMyEnrollments();

        setEnrollments(result);

        return result;

      } catch (err) {

        const normalizedError =
          err instanceof Error
            ? err
            : new Error(
                "Failed to load enrollments."
              );

        setError(normalizedError);

        throw normalizedError;

      } finally {

        setIsLoading(false);

      }

    }, [api]);


  // =========================================================
  // GET PENDING ENROLLMENTS
  //
  // Admin:
  // GET /api/enrollments/pending
  // =========================================================

  const loadPendingEnrollments =
    useCallback(async () => {

      try {

        setIsLoading(true);
        setError(null);

        const result =
          await api.getPending();

        setPendingEnrollments(result);

        return result;

      } catch (err) {

        const normalizedError =
          err instanceof Error
            ? err
            : new Error(
                "Failed to load pending enrollments."
              );

        setError(normalizedError);

        throw normalizedError;

      } finally {

        setIsLoading(false);

      }

    }, [api]);


  // =========================================================
  // GET ENROLLMENT BY ID
  //
  // Participant:
  // GET /api/enrollments/{id}
  // =========================================================

  const getEnrollment =
    useCallback(
      async (
        id: string
      ) => {

        try {

          setError(null);

          return await api.getById(id);

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to load enrollment."
                );

          setError(normalizedError);

          throw normalizedError;
        }

      },
      [api]
    );

    const loadTrainerEnrollments =
  useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result =
        await api.getparticipant();

      setTrainerEnrollments(result);

      return result;
    } catch (err) {
      const normalizedError =
        err instanceof Error
          ? err
          : new Error(
              "Failed to load trainer enrollments."
            );

      setError(normalizedError);

      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }, [api]);


  // =========================================================
  // GET TRAINING REQUIREMENTS
  //
  // Participant:
  //
  // GET
  // /api/enrollments/requirements/{trainingBatchId}
  //
  // Gets the requirements configured for the
  // Training Program connected to the selected
  // Training Batch.
  // =========================================================

  const loadRequirements =
    useCallback(
      async (
        trainingBatchId: string
      ) => {

        try {

          setIsLoadingRequirements(true);
          setRequirementsError(null);

          const result =
            await api.getRequirements(
              trainingBatchId
            );

          // Sort according to the DisplayOrder
          // configured by Admin.
          const sortedRequirements =
            [...result].sort(
              (a, b) =>
                a.displayOrder -
                b.displayOrder
            );

          setRequirements(
            sortedRequirements
          );

          return sortedRequirements;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to load training requirements."
                );

          setRequirementsError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsLoadingRequirements(false);

        }

      },
      [api]
    );


  // =========================================================
  // CREATE ENROLLMENT
  //
  // Participant:
  // POST /api/enrollments
  // =========================================================

  const createEnrollment =
    useCallback(
      async (
        request: CreateEnrollmentRequest
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          const result =
            await api.create(request);

          // Add newly created enrollment
          // to the current local list.
          setEnrollments(
            current => [
              result,
              ...current,
            ]
          );

          return result;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to create enrollment."
                );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // REVIEW ENROLLMENT
  //
  // Admin:
  // PUT /api/enrollments/{id}/review
  // =========================================================

  const reviewEnrollment =
    useCallback(
      async (
        id: string,
        request: ReviewEnrollmentRequest
      ) => {

        try {

          setIsSubmitting(true);
          setError(null);

          await api.review(
            id,
            request
          );

          // Remove reviewed enrollment
          // from pending list.
          setPendingEnrollments(
            current =>
              current.filter(
                enrollment =>
                  enrollment.id !== id
              )
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to review enrollment."
                );

          setError(normalizedError);

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // GET ENROLLMENT DOCUMENTS
  //
  // Participant:
  // GET /api/enrollments/{enrollmentId}/documents
  //
  // Used when participant wants to view
  // their uploaded documents.
  // =========================================================

  const loadEnrollmentDocuments =
    useCallback(
      async (
        enrollmentId: string
      ) => {

        try {

          setIsLoadingDocuments(true);
          setDocumentsError(null);

          const result =
            await api.getDocuments(
              enrollmentId
            );

          setEnrollmentDocuments(result);

          return result;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to load enrollment documents."
                );

          setDocumentsError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsLoadingDocuments(false);

        }

      },
      [api]
    );


  // =========================================================
  // GET ENROLLMENT DOCUMENTS FOR ADMIN
  //
  // Admin:
  // GET /api/enrollments/{enrollmentId}/documents/admin
  //
  // Used by Admin to view the participant's
  // uploaded enrollment documents.
  // =========================================================

  const loadEnrollmentDocumentsForAdmin =
    useCallback(
      async (
        enrollmentId: string
      ) => {

        try {

          setIsLoadingDocuments(true);
          setDocumentsError(null);

          const result =
            await api.getDocumentsForAdmin(
              enrollmentId
            );

          setEnrollmentDocuments(result);

          return result;

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to load enrollment documents."
                );

          setDocumentsError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsLoadingDocuments(false);

        }

      },
      [api]
    );


  // =========================================================
  // DELETE ENROLLMENT DOCUMENT
  //
  // Participant:
  // DELETE
  // /api/enrollments/{enrollmentId}/documents/{documentId}
  // =========================================================

  const deleteEnrollmentDocument =
    useCallback(
      async (
        enrollmentId: string,
        documentId: string
      ) => {

        try {

          setIsSubmitting(true);
          setDocumentsError(null);

          await api.deleteDocument(
            enrollmentId,
            documentId
          );

          // Remove deleted document
          // from local state.
          setEnrollmentDocuments(
            current =>
              current.filter(
                document =>
                  document.id !== documentId
              )
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to delete enrollment document."
                );

          setDocumentsError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // REVIEW ENROLLMENT DOCUMENT
  //
  // Admin:
  // PUT
  // /api/enrollments/{enrollmentId}/documents/{documentId}/review
  // =========================================================

  const reviewEnrollmentDocument =
    useCallback(
      async (
        enrollmentId: string,
        documentId: string,
        request: ReviewEnrollmentDocumentRequest
      ) => {

        try {

          setIsSubmitting(true);
          setDocumentsError(null);

          await api.reviewDocument(
            enrollmentId,
            documentId,
            request
          );

          // Update the reviewed document
          // in local state.
          setEnrollmentDocuments(
            current =>
              current.map(
                document => {

                  if (
                    document.id !==
                    documentId
                  ) {
                    return document;
                  }

                  return {
                    ...document,
                    status: request.decision,
                    reviewRemarks:
                      request.remarks ?? null,
                  };
                }
              )
          );

        } catch (err) {

          const normalizedError =
            err instanceof Error
              ? err
              : new Error(
                  "Failed to review enrollment document."
                );

          setDocumentsError(
            normalizedError
          );

          throw normalizedError;

        } finally {

          setIsSubmitting(false);

        }

      },
      [api]
    );


  // =========================================================
  // REFRESH PARTICIPANT ENROLLMENTS
  // =========================================================

  const refreshMyEnrollments =
    useCallback(async () => {

      return loadMyEnrollments();

    }, [loadMyEnrollments]);


  // =========================================================
  // REFRESH ADMIN PENDING ENROLLMENTS
  // =========================================================

  const refreshPendingEnrollments =
    useCallback(async () => {

      return loadPendingEnrollments();

    }, [loadPendingEnrollments]);


  // =========================================================
  // RESET
  // =========================================================

  const reset =
    useCallback(() => {

      setEnrollments([]);
      setTrainerEnrollments([]);
      setPendingEnrollments([]);

      setRequirements([]);

      setEnrollmentDocuments([]);

      setError(null);

      setRequirementsError(null);

      setDocumentsError(null);

    }, []);


  // =========================================================
  // RETURN
  // =========================================================

  return {

    // -------------------------------------------------------
    // Participant Enrollments
    // -------------------------------------------------------

    enrollments,

    loadMyEnrollments,

    refreshMyEnrollments,


    // -------------------------------------------------------
    // Training Requirements
    // -------------------------------------------------------

    requirements,

    loadRequirements,

    isLoadingRequirements,

    requirementsError,


    // -------------------------------------------------------
    // Admin Enrollments
    // -------------------------------------------------------

    pendingEnrollments,

    loadPendingEnrollments,

    refreshPendingEnrollments,


    // -------------------------------------------------------
    // Enrollment
    // -------------------------------------------------------

    getEnrollment,

    createEnrollment,

    reviewEnrollment,


    // -------------------------------------------------------
    // Enrollment Documents
    // -------------------------------------------------------

    enrollmentDocuments,

    loadEnrollmentDocuments,

    loadEnrollmentDocumentsForAdmin,

    deleteEnrollmentDocument,

    reviewEnrollmentDocument,

    trainerEnrollments,
loadTrainerEnrollments,
    // -------------------------------------------------------
    // Document State
    // -------------------------------------------------------

    isLoadingDocuments,

    documentsError,


    // -------------------------------------------------------
    // General State
    // -------------------------------------------------------

    isLoading,

    isSubmitting,

    error,


    // -------------------------------------------------------
    // Reset
    // -------------------------------------------------------

    reset,
  };
}