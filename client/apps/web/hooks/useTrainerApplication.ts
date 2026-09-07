"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AuthApi } from "@repo/api";

import type {
  TrainerApplication,
  TrainerApplicationDocument,
  UpdateTrainerApplicationRequest,
} from "@repo/types";


export function useTrainerApplication(
  authApi: AuthApi
) {
  // =========================================================
  // STATE
  // =========================================================

  const [
    application,
    setApplication,
  ] = useState<TrainerApplication | null>(null);

  const [
    documents,
    setDocuments,
  ] = useState<TrainerApplicationDocument[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isUpdating,
    setIsUpdating,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // =========================================================
  // LOAD MY APPLICATION
  // =========================================================

  const loadApplication = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response =
          await authApi.getMyTrainerApplication();

        setApplication(response);

        // -----------------------------------------------
        // LOAD DOCUMENTS
        // -----------------------------------------------

        if (response?.id) {
          try {
            const documentResponse =
              await authApi.getMyTrainerDocuments(
                response.id
              );

            setDocuments(
              documentResponse ?? []
            );
          } catch (documentError) {
            console.error(
              "LOAD TRAINER DOCUMENTS ERROR:",
              documentError
            );

            // Application can still be displayed
            // even if documents fail to load.
            setDocuments([]);
          }
        } else {
          setDocuments([]);
        }

        return response;
      } catch (error) {
        console.error(
          "LOAD TRAINER APPLICATION ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load trainer application."
        );

        setApplication(null);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [authApi]
  );


  // =========================================================
  // UPDATE APPLICATION
  // =========================================================

  const updateApplication = useCallback(
    async (
      request: UpdateTrainerApplicationRequest
    ) => {
      try {
        setIsUpdating(true);
        setError(null);

        const response =
          await authApi.updateMyTrainerApplication(
            request
          );

        setApplication(response);

        return response;
      } catch (error) {
        console.error(
          "UPDATE TRAINER APPLICATION ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update trainer application."
        );

        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [authApi]
  );


  // =========================================================
  // UPDATE PROFILE IMAGE
  // =========================================================

  const updateProfileImage = useCallback(
    async (
      file: File
    ) => {
      try {
        setIsUploading(true);
        setError(null);

        const response =
          await authApi.updateTrainerProfileImage(
            file
          );

        setApplication(response);

        return response;
      } catch (error) {
        console.error(
          "UPDATE TRAINER PROFILE IMAGE ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update profile image."
        );

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [authApi]
  );


  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  const uploadDocument = useCallback(
    async (
      formData: FormData
    ) => {
      if (!application?.id) {
        setError(
          "Trainer application was not found."
        );

        return null;
      }

      try {
        setIsUploading(true);
        setError(null);

        const response =
          await authApi.uploadTrainerDocument(
            application.id,
            formData
          );

        // Add newly uploaded document
        setDocuments(
          previous => [
            ...previous,
            response,
          ]
        );

        return response;
      } catch (error) {
        console.error(
          "UPLOAD TRAINER DOCUMENT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to upload document."
        );

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [
      authApi,
      application?.id,
    ]
  );


  // =========================================================
  // DELETE DOCUMENT
  // =========================================================

  const deleteDocument = useCallback(
    async (
      documentId: string
    ) => {
      if (!application?.id) {
        setError(
          "Trainer application was not found."
        );

        return false;
      }

      try {
        setError(null);

        await authApi.deleteTrainerDocument(
          application.id,
          documentId
        );

        setDocuments(
          previous =>
            previous.filter(
              document =>
                document.id !== documentId
            )
        );

        return true;
      } catch (error) {
        console.error(
          "DELETE TRAINER DOCUMENT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete document."
        );

        return false;
      }
    },
    [
      authApi,
      application?.id,
    ]
  );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadApplication();
  }, [
    loadApplication,
  ]);


  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const status =
    application?.status ?? null;

  const isPending =
    status === "Pending";

  const isUnderReview =
    status === "UnderReview";

  const needsCorrection =
    status === "NeedsCorrection";

  const isApproved =
    status === "Approved";

  const isRejected =
    status === "Rejected";


  // =========================================================
  // TRAINER ACCESS
  // =========================================================

  /**
   * Trainer is allowed to access the
   * complete trainer dashboard only
   * after approval.
   */
  const hasFullAccess =
    isApproved;


  /**
   * Application page should remain
   * accessible while not approved.
   */
  const applicationOnly =
    !isApproved;


  // =========================================================
  // CLEAR ERROR
  // =========================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // =========================================================
  // RETURN
  // =========================================================

  return {
    // Application
    application,

    // Documents
    documents,

    // Loading states
    isLoading,
    isUpdating,
    isUploading,

    // Error
    error,
    clearError,

    // Actions
    loadApplication,
    updateApplication,
    updateProfileImage,
    uploadDocument,
    deleteDocument,

    // Status
    status,

    isPending,
    isUnderReview,
    needsCorrection,
    isApproved,
    isRejected,

    // Access control
    hasFullAccess,
    applicationOnly,
  };
}