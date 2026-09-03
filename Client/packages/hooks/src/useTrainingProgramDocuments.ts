"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  TrainingProgramDocument,
} from "@repo/types";

import type {
  TrainingProgramDocumentApi,
} from "@repo/api";

export function useTrainingProgramDocuments(
  trainingProgramId: string | null,
  api: TrainingProgramDocumentApi
) {
  const [
    documents,
    setDocuments,
  ] = useState<TrainingProgramDocument[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const loadDocuments =
    useCallback(async () => {
      if (!trainingProgramId) {
        setDocuments([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result =
          await api.getAll(
            trainingProgramId
          );

        setDocuments(
          Array.isArray(result)
            ? result
            : []
        );

      } catch (error) {
        console.error(
          "LOAD TRAINING PROGRAM DOCUMENTS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load documents."
        );

        setDocuments([]);

      } finally {
        setIsLoading(false);
      }
    }, [
      api,
      trainingProgramId,
    ]);


  const uploadDocument =
    useCallback(
      async (
        file: File,
        documentType: string
      ) => {
        if (!trainingProgramId) {
          setError(
            "Training program is required."
          );

          return null;
        }

        try {
          setIsUploading(true);
          setError(null);

          const result =
            await api.upload(
              trainingProgramId,
              file,
              documentType
            );

          await loadDocuments();

          return result;

        } catch (error) {
          console.error(
            "UPLOAD TRAINING PROGRAM DOCUMENT ERROR:",
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
        api,
        trainingProgramId,
        loadDocuments,
      ]
    );


  const deleteDocument =
    useCallback(
      async (
        documentId: string
      ) => {
        if (!trainingProgramId) {
          return false;
        }

        try {
          setIsDeleting(true);
          setError(null);

          await api.delete(
            trainingProgramId,
            documentId
          );

          await loadDocuments();

          return true;

        } catch (error) {
          console.error(
            "DELETE TRAINING PROGRAM DOCUMENT ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to delete document."
          );

          return false;

        } finally {
          setIsDeleting(false);
        }
      },
      [
        api,
        trainingProgramId,
        loadDocuments,
      ]
    );


  useEffect(() => {
    loadDocuments();
  }, [
    loadDocuments,
  ]);


  const reset = () => {
    setDocuments([]);
    setIsLoading(false);
    setIsUploading(false);
    setIsDeleting(false);
    setError(null);
  };


  return {
    documents,

    isLoading,
    isUploading,
    isDeleting,

    error,

    loadDocuments,
    uploadDocument,
    deleteDocument,

    reset,
  };
}