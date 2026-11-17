
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
  ReviewEnrollmentDocumentRequest,
  ReviewEnrollmentRequest,
  TrainingProgramRequirement,
} from "@repo/types";

import { useEnrollments } from "@repo/hooks";
import { enrollmentApi } from "@/lib/api";

type EnrollmentModalType = "view" | "approve" | "reject" | null;

type NotificationState = {
  type: "success" | "error";
  title: string;
  message: string;
} | null;

type DocumentConfirmationState = {
  document: EnrollmentDocument;
  decision: "Approved" | "Rejected" | "NeedsCorrection";
} | null;

export function useEnrollmentManagement() {
  const {
    pendingEnrollments,
    loadPendingEnrollments,
    reviewEnrollment,
    isLoading,
    isSubmitting,
    error,
    reset,
  } = useEnrollments(enrollmentApi);

  const [requirementsByBatch, setRequirementsByBatch] = useState<
    Record<string, TrainingProgramRequirement[]>
  >({});

  const [isLoadingRequirements, setIsLoadingRequirements] =
    useState(false);

  const [statusFilter, setStatusFilter] = useState<
    "All" | EnrollmentStatus
  >("All");

  const [trainingFilter, setTrainingFilter] =
    useState("All Trainings");

  const [selected, setSelected] = useState<Enrollment | null>(null);

  const [documents, setDocuments] = useState<EnrollmentDocument[]>([]);

  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const [isReviewingDocument, setIsReviewingDocument] = useState(false);

  const [modal, setModal] = useState<EnrollmentModalType>(null);

  const [reviewRemarks, setReviewRemarks] = useState("");

  const [notification, setNotification] =
    useState<NotificationState>(null);

  const [documentConfirmation, setDocumentConfirmation] =
    useState<DocumentConfirmationState>(null);

  // Refresh enrollment data.
  const handleRefresh = useCallback(async () => {
    reset();
    await loadPendingEnrollments();
  }, [reset, loadPendingEnrollments]);

  // Load enrollment requests when the page opens.
  useEffect(() => {
    loadPendingEnrollments().catch(() => {
      // Loading errors are handled by useEnrollments.
    });
  }, [loadPendingEnrollments]);

  // Load requirements for the batches in the current enrollment list.
  useEffect(() => {
    if (pendingEnrollments.length === 0) {
      setRequirementsByBatch({});
      setIsLoadingRequirements(false);
      return;
    }

    let cancelled = false;

    async function loadRequirements() {
      setIsLoadingRequirements(true);

      try {
        const batchIds = Array.from(
          new Set(
            pendingEnrollments.map(
              (enrollment) => enrollment.trainingBatchId
            )
          )
        );

        const results = await Promise.all(
          batchIds.map(async (batchId) => {
            try {
              const requirements =
                await enrollmentApi.getRequirements(batchId);

              return { batchId, requirements };
            } catch {
              return {
                batchId,
                requirements: [] as TrainingProgramRequirement[],
              };
            }
          })
        );

        if (cancelled) return;

        const map: Record<string, TrainingProgramRequirement[]> = {};

        for (const result of results) {
          map[result.batchId] = result.requirements;
        }

        setRequirementsByBatch(map);
      } finally {
        if (!cancelled) {
          setIsLoadingRequirements(false);
        }
      }
    }

    void loadRequirements();

    return () => {
      cancelled = true;
    };
  }, [pendingEnrollments]);

  // Training filter options.
  const trainings = useMemo(() => {
    const names = pendingEnrollments
      .map((enrollment) => enrollment.programName)
      .filter(Boolean);

    return ["All Trainings", ...Array.from(new Set(names))];
  }, [pendingEnrollments]);

  // Apply the selected filters.
  const filteredEnrollments = useMemo(() => {
    return pendingEnrollments.filter((enrollment) => {
      const matchesStatus =
        statusFilter === "All" ||
        enrollment.status === statusFilter;

      const matchesTraining =
        trainingFilter === "All Trainings" ||
        enrollment.programName === trainingFilter;

      return matchesStatus && matchesTraining;
    });
  }, [pendingEnrollments, statusFilter, trainingFilter]);

  // Enrollment statistics.
  const total = pendingEnrollments.length;

  const pending = pendingEnrollments.filter(
    (enrollment) => enrollment.status === "Pending"
  ).length;

  const approved = pendingEnrollments.filter(
    (enrollment) => enrollment.status === "Approved"
  ).length;

  const rejected = pendingEnrollments.filter(
    (enrollment) => enrollment.status === "Rejected"
  ).length;

  // Notifications.
  const showSuccess = useCallback(
    (title: string, message: string) => {
      setNotification({ type: "success", title, message });

      window.setTimeout(() => {
        setNotification(null);
      }, 3500);
    },
    []
  );

  const showError = useCallback(
    (title: string, message: string) => {
      setNotification({ type: "error", title, message });

      window.setTimeout(() => {
        setNotification(null);
      }, 4500);
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Open enrollment details and load its submitted documents.
  const viewEnrollment = useCallback(
    async (enrollment: Enrollment) => {
      setSelected(enrollment);
      setReviewRemarks(enrollment.reviewRemarks ?? "");
      setDocuments([]);
      setModal("view");

      try {
        setIsLoadingDocuments(true);

        const result = await enrollmentApi.getDocumentsForAdmin(
          enrollment.id
        );

        setDocuments(result);
      } catch (err) {
        console.error(
          "Failed to load enrollment documents:",
          err
        );

        showError(
          "Unable to load documents",
          "The enrollment documents could not be loaded."
        );
      } finally {
        setIsLoadingDocuments(false);
      }
    },
    [showError]
  );

  // Open the approve confirmation modal.
  const approveEnrollment = useCallback(
    (enrollment: Enrollment) => {
      setSelected(enrollment);
      setReviewRemarks("");
      setModal("approve");
    },
    []
  );

  // Open the reject confirmation modal.
  const rejectEnrollment = useCallback(
    (enrollment: Enrollment) => {
      setSelected(enrollment);
      setReviewRemarks("");
      setModal("reject");
    },
    []
  );

  // Submit an enrollment decision.
  const submitReview = useCallback(
    async (decision: "Approved" | "Rejected") => {
      if (!selected) return;

      const request: ReviewEnrollmentRequest = {
        decision,
        remarks: reviewRemarks.trim() || null,
      };

      try {
        await reviewEnrollment(selected.id, request);

        setSelected(null);
        setModal(null);
        setReviewRemarks("");
        setDocuments([]);

        await loadPendingEnrollments();

        showSuccess(
          decision === "Approved"
            ? "Enrollment Approved"
            : "Enrollment Rejected",
          decision === "Approved"
            ? "The participant has been successfully approved for this training."
            : "The enrollment request has been rejected successfully."
        );
      } catch (err) {
        console.error("Failed to review enrollment:", err);

        showError(
          "Review Failed",
          "The enrollment decision could not be saved."
        );
      }
    },
    [
      selected,
      reviewRemarks,
      reviewEnrollment,
      loadPendingEnrollments,
      showSuccess,
      showError,
    ]
  );

  // Open document decision confirmation.
  const requestDocumentReview = useCallback(
    (
      document: EnrollmentDocument,
      decision: "Approved" | "Rejected" | "NeedsCorrection"
    ) => {
      setDocumentConfirmation({ document, decision });
    },
    []
  );

  // Submit a document decision.
  const submitDocumentReview = useCallback(async () => {
    if (!selected || !documentConfirmation) return;

    const { document, decision } = documentConfirmation;

    const request: ReviewEnrollmentDocumentRequest = {
      decision,
      remarks: document.reviewRemarks ?? null,
    };

    try {
      setIsReviewingDocument(true);

      await enrollmentApi.reviewDocument(
        selected.id,
        document.id,
        request
      );

      const updated = await enrollmentApi.getDocumentsForAdmin(
        selected.id
      );

      setDocuments(updated);
      setDocumentConfirmation(null);

      showSuccess(
        decision === "Approved"
          ? "Document Approved"
          : decision === "Rejected"
            ? "Document Rejected"
            : "Correction Requested",
        decision === "Approved"
          ? `${document.requirementName} has been approved successfully.`
          : decision === "Rejected"
            ? `${document.requirementName} has been rejected successfully.`
            : `Correction has been requested for ${document.requirementName}.`
      );
    } catch (err) {
      console.error("Failed to review document:", err);

      showError(
        "Document Review Failed",
        "The document decision could not be saved."
      );
    } finally {
      setIsReviewingDocument(false);
    }
  }, [
    selected,
    documentConfirmation,
    showSuccess,
    showError,
  ]);

  // Close the details modal and clear its selected data.
  const closeEnrollmentModal = useCallback(() => {
    setSelected(null);
    setModal(null);
    setDocuments([]);
  }, []);

  return {
    pendingEnrollments,
    requirementsByBatch,
    documents,
    selected,
    notification,
    documentConfirmation,
    isLoading,
    isSubmitting,
    isLoadingRequirements,
    isLoadingDocuments,
    isReviewingDocument,
    error,
    total,
    pending,
    approved,
    rejected,
    statusFilter,
    setStatusFilter,
    trainingFilter,
    setTrainingFilter,
    trainings,
    filteredEnrollments,
    modal,
    setModal,
    reviewRemarks,
    setReviewRemarks,
    handleRefresh,
    viewEnrollment,
    approveEnrollment,
    rejectEnrollment,
    submitReview,
    requestDocumentReview,
    submitDocumentReview,
    closeNotification,
    closeEnrollmentModal,
    setSelected,
    setDocuments,
    setDocumentConfirmation,
  };
}
