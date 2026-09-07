"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import type {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
  ReviewEnrollmentDocumentRequest,
  ReviewEnrollmentRequest,
  TrainingProgramRequirement,
} from "@repo/types";

import {
  useEnrollments,
} from "@repo/hooks";

import {
  enrollmentApi,
} from "@/lib/api";

import { columns } from "./columns";


// =========================================================
// ENROLLMENT PAGE
// =========================================================

export default function EnrollmentPage() {

  // =======================================================
  // ENROLLMENT HOOK
  // =======================================================

  const {
    pendingEnrollments,
    loadPendingEnrollments,
    reviewEnrollment,
    isLoading,
    isSubmitting,
    error,
  } = useEnrollments(
    enrollmentApi
  );


  // =======================================================
  // REQUIREMENTS
  // =======================================================

  const [
    requirementsByBatch,
    setRequirementsByBatch,
  ] = useState<
    Record<
      string,
      TrainingProgramRequirement[]
    >
  >({});


  const [
    isLoadingRequirements,
    setIsLoadingRequirements,
  ] = useState(false);


  // =======================================================
  // FILTER
  // =======================================================

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "All" | EnrollmentStatus
  >("All");


  const [
    trainingFilter,
    setTrainingFilter,
  ] = useState(
    "All Trainings"
  );


  // =======================================================
  // SELECTED ENROLLMENT
  // =======================================================

  const [
    selected,
    setSelected,
  ] = useState<Enrollment | null>(
    null
  );


  // =======================================================
  // ADMIN DOCUMENTS
  // =======================================================

  const [
    documents,
    setDocuments,
  ] = useState<EnrollmentDocument[]>([]);


  const [
    isLoadingDocuments,
    setIsLoadingDocuments,
  ] = useState(false);


  const [
    isReviewingDocument,
    setIsReviewingDocument,
  ] = useState(false);


  // =======================================================
  // MODAL
  // =======================================================

  const [
    modal,
    setModal,
  ] = useState<
    "view" |
    "approve" |
    "reject" |
    null
  >(null);


  // =======================================================
  // REVIEW REMARKS
  // =======================================================

  const [
    reviewRemarks,
    setReviewRemarks,
  ] = useState("");


  // =======================================================
  // NOTIFICATION
  // =======================================================

  const [
    notification,
    setNotification,
  ] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);


  // =======================================================
  // DOCUMENT CONFIRMATION
  // =======================================================

  const [
    documentConfirmation,
    setDocumentConfirmation,
  ] = useState<{
    document: EnrollmentDocument;
    decision:
      | "Approved"
      | "Rejected"
      | "NeedsCorrection";
  } | null>(null);


  // =======================================================
  // LOAD ENROLLMENTS
  // =======================================================

  useEffect(() => {

    loadPendingEnrollments()
      .catch(() => {
        // handled by hook
      });

  }, [
    loadPendingEnrollments,
  ]);


  // =======================================================
  // LOAD REQUIREMENTS
  // =======================================================

  useEffect(() => {

    if (
      pendingEnrollments.length === 0
    ) {
      setRequirementsByBatch({});
      return;
    }


    let cancelled = false;


    async function loadRequirements() {

      setIsLoadingRequirements(true);


      try {

        const batchIds =
          Array.from(
            new Set(
              pendingEnrollments.map(
                enrollment =>
                  enrollment.trainingBatchId
              )
            )
          );


        const results =
          await Promise.all(
            batchIds.map(
              async batchId => {

                try {

                  const requirements =
                    await enrollmentApi.getRequirements(
                      batchId
                    );

                  return {
                    batchId,
                    requirements,
                  };

                } catch {

                  return {
                    batchId,
                    requirements:
                      [] as TrainingProgramRequirement[],
                  };

                }

              }
            )
          );


        if (cancelled) {
          return;
        }


        const map:
          Record<
            string,
            TrainingProgramRequirement[]
          > = {};


        for (
          const result of results
        ) {

          map[result.batchId] =
            result.requirements;

        }


        setRequirementsByBatch(
          map
        );

      } finally {

        if (!cancelled) {

          setIsLoadingRequirements(
            false
          );

        }

      }

    }


    loadRequirements();


    return () => {
      cancelled = true;
    };

  }, [
    pendingEnrollments,
  ]);


  // =======================================================
  // TRAINING OPTIONS
  // =======================================================

  const trainings = useMemo(
    () => {

      const names =
        pendingEnrollments
          .map(
            enrollment =>
              enrollment.programName
          )
          .filter(
            name =>
              Boolean(name)
          );


      return [
        "All Trainings",
        ...Array.from(
          new Set(names)
        ),
      ];

    },
    [
      pendingEnrollments,
    ]
  );


  // =======================================================
  // FILTERED ENROLLMENTS
  // =======================================================

  const filteredEnrollments =
    useMemo(
      () => {

        return pendingEnrollments.filter(
          enrollment => {

            const matchesStatus =
              statusFilter === "All" ||
              enrollment.status ===
                statusFilter;


            const matchesTraining =
              trainingFilter ===
                "All Trainings" ||
              enrollment.programName ===
                trainingFilter;


            return (
              matchesStatus &&
              matchesTraining
            );

          }
        );

      },
      [
        pendingEnrollments,
        statusFilter,
        trainingFilter,
      ]
    );


  // =======================================================
  // STATISTICS
  // =======================================================

  const total =
    pendingEnrollments.length;


  const pending =
    pendingEnrollments.filter(
      enrollment =>
        enrollment.status ===
        "Pending"
    ).length;


  const approved =
    pendingEnrollments.filter(
      enrollment =>
        enrollment.status ===
        "Approved"
    ).length;


  const rejected =
    pendingEnrollments.filter(
      enrollment =>
        enrollment.status ===
        "Rejected"
    ).length;


  // =======================================================
  // NOTIFICATION HELPER
  // =======================================================

  function showSuccess(
    title: string,
    message: string
  ) {

    setNotification({
      type: "success",
      title,
      message,
    });

    window.setTimeout(
      () => {
        setNotification(null);
      },
      3500
    );

  }


  function showError(
    title: string,
    message: string
  ) {

    setNotification({
      type: "error",
      title,
      message,
    });

    window.setTimeout(
      () => {
        setNotification(null);
      },
      4500
    );

  }


  // =======================================================
  // VIEW ENROLLMENT
  // =======================================================

  async function viewEnrollment(
    enrollment: Enrollment
  ) {

    setSelected(
      enrollment
    );

    setReviewRemarks(
      enrollment.reviewRemarks ??
      ""
    );

    setDocuments([]);

    setModal(
      "view"
    );


    try {

      setIsLoadingDocuments(
        true
      );


      const result =
        await enrollmentApi.getDocumentsForAdmin(
          enrollment.id
        );


      setDocuments(
        result
      );

    } catch (error) {

      console.error(
        "Failed to load enrollment documents:",
        error
      );

      showError(
        "Unable to load documents",
        "The enrollment documents could not be loaded."
      );

    } finally {

      setIsLoadingDocuments(
        false
      );

    }

  }


  // =======================================================
  // OPEN APPROVE ENROLLMENT
  // =======================================================

  function approveEnrollment(
    enrollment: Enrollment
  ) {

    setSelected(
      enrollment
    );

    setReviewRemarks("");

    setModal(
      "approve"
    );

  }


  // =======================================================
  // OPEN REJECT ENROLLMENT
  // =======================================================

  function rejectEnrollment(
    enrollment: Enrollment
  ) {

    setSelected(
      enrollment
    );

    setReviewRemarks("");

    setModal(
      "reject"
    );

  }


  // =======================================================
  // SUBMIT ENROLLMENT REVIEW
  // =======================================================

  async function submitReview(
    decision:
      | "Approved"
      | "Rejected"
  ) {

    if (!selected) {
      return;
    }


    const request:
      ReviewEnrollmentRequest = {
        decision,
        remarks:
          reviewRemarks.trim() ||
          null,
      };


    try {

      await reviewEnrollment(
        selected.id,
        request
      );


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

    } catch (error) {

      console.error(
        "Failed to review enrollment:",
        error
      );

      showError(
        "Review Failed",
        "The enrollment decision could not be saved."
      );

    }

  }


  // =======================================================
  // OPEN DOCUMENT CONFIRMATION
  // =======================================================

  function requestDocumentReview(
    document: EnrollmentDocument,
    decision:
      | "Approved"
      | "Rejected"
      | "NeedsCorrection"
  ) {

    setDocumentConfirmation({
      document,
      decision,
    });

  }


  // =======================================================
  // SUBMIT DOCUMENT REVIEW
  // =======================================================

  async function submitDocumentReview() {

    if (
      !selected ||
      !documentConfirmation
    ) {
      return;
    }


    const {
      document,
      decision,
    } =
      documentConfirmation;


    const request:
      ReviewEnrollmentDocumentRequest = {
        decision,
        remarks:
          document.reviewRemarks ??
          null,
      };


    try {

      setIsReviewingDocument(
        true
      );


      await enrollmentApi.reviewDocument(
        selected.id,
        document.id,
        request
      );


      const updated =
        await enrollmentApi.getDocumentsForAdmin(
          selected.id
        );


      setDocuments(
        updated
      );


      setDocumentConfirmation(
        null
      );


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

    } catch (error) {

      console.error(
        "Failed to review document:",
        error
      );

      showError(
        "Document Review Failed",
        "The document decision could not be saved."
      );

    } finally {

      setIsReviewingDocument(
        false
      );

    }

  }


  // =======================================================
  // TABLE META
  // =======================================================

  const tableMeta = {

    onView:
      viewEnrollment,

    onApprove:
      approveEnrollment,

    onReject:
      rejectEnrollment,

    requirementsByBatch,

  };


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <div className="space-y-6">

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification && (

        <Notification
          type={
            notification.type
          }
          title={
            notification.title
          }
          message={
            notification.message
          }
          onClose={() =>
            setNotification(null)
          }
        />

      )}


      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">

          <span>
            Operations
          </span>

          <span>
            /
          </span>

          <span className="font-medium text-gray-600">
            Enrollment
          </span>

        </div>


        <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
          Enrollment Management
        </h1>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Review enrollment requests submitted
          by participants and manage their
          admission into training programs.
        </p>

      </div>


      {/* =================================================
          INFO
      ================================================= */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

        <p className="text-sm font-semibold text-blue-900">
          Participant enrollment requests
        </p>


        <p className="mt-1 text-xs leading-5 text-blue-700">
          Enrollment requests submitted by
          participants are loaded directly from
          the backend.
        </p>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-800">
            Unable to load enrollment requests
          </p>


          <p className="mt-1 text-xs text-red-600">
            {error.message}
          </p>

        </div>

      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <StatGrid>

        <StatCard
          title="Total Applications"
          value={total}
          description="Enrollment requests"
        />


        <StatCard
          title="Pending Review"
          value={pending}
          description="Waiting for admin decision"
        />


        <StatCard
          title="Approved"
          value={approved}
          description="Approved enrollments"
        />


        <StatCard
          title="Rejected"
          value={rejected}
          description="Rejected enrollments"
        />

      </StatGrid>


      {/* =================================================
          TABLE
      ================================================= */}

      <DataTable
        title="Enrollment Requests"
        description="Applications submitted by participants."
        columns={columns}
        data={filteredEnrollments}
        searchable
        searchPlaceholder="Search participant or training..."
        meta={tableMeta}

        toolbar={

          <div className="flex flex-wrap gap-2">

            <select
              value={trainingFilter}
              onChange={
                event =>
                  setTrainingFilter(
                    event.target.value
                  )
              }
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none"
            >

              {trainings.map(
                training => (

                  <option
                    key={training}
                    value={training}
                  >
                    {training}
                  </option>

                )
              )}

            </select>


            <select
              value={statusFilter}
              onChange={
                event =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | EnrollmentStatus
                  )
              }
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none"
            >

              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="UnderReview">
                Under Review
              </option>

              <option value="NeedsCorrection">
                Needs Correction
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>
        }
      />


      {/* =================================================
          REQUIREMENT LOADING
      ================================================= */}

      {isLoadingRequirements && (

        <p className="text-xs text-gray-400">
          Loading training requirements...
        </p>

      )}


      {/* =================================================
          LOADING
      ================================================= */}

      {isLoading && (

        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">

          <p className="text-sm text-gray-500">
            Loading enrollment requests...
          </p>

        </div>

      )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {!isLoading &&
        filteredEnrollments.length === 0 && (

          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">

            <p className="text-sm font-semibold text-gray-700">
              No enrollment requests found
            </p>


            <p className="mt-1 text-xs text-gray-400">
              There are currently no enrollment
              requests matching your filters.
            </p>

          </div>

        )}


      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {modal === "view" &&
        selected && (

          <EnrollmentModal
            title="Enrollment Details"
            enrollment={selected}
            documents={documents}
            isLoadingDocuments={
              isLoadingDocuments
            }
            isReviewingDocument={
              isReviewingDocument
            }
            onReviewDocument={
              requestDocumentReview
            }
            requirements={
              requirementsByBatch[
                selected.trainingBatchId
              ] ?? []
            }
            onClose={() => {

              setSelected(null);

              setModal(null);

              setDocuments([]);

            }}
          >

            {selected.status ===
              "Pending" && (

              <div className="mt-6 grid gap-2 sm:grid-cols-2">

                <button
                  type="button"
                  disabled={
                    isSubmitting
                  }
                  onClick={() =>
                    setModal(
                      "approve"
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Approve Enrollment
                </button>


                <button
                  type="button"
                  disabled={
                    isSubmitting
                  }
                  onClick={() =>
                    setModal(
                      "reject"
                    )
                  }
                  className="rounded-xl bg-red-600 px-4 py-3 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Reject Enrollment
                </button>

              </div>

            )}

          </EnrollmentModal>

        )}


      {/* =================================================
          ENROLLMENT CONFIRM MODAL
      ================================================= */}

      {(modal === "approve" ||
        modal === "reject") &&
        selected && (

          <ConfirmModal
            enrollment={selected}

            status={
              modal === "approve"
                ? "Approved"
                : "Rejected"
            }

            remarks={
              reviewRemarks
            }

            setRemarks={
              setReviewRemarks
            }

            isSubmitting={
              isSubmitting
            }

            onClose={() =>
              setModal(
                "view"
              )
            }

            onConfirm={() =>
              submitReview(
                modal ===
                  "approve"
                  ? "Approved"
                  : "Rejected"
              )
            }
          />

        )}


      {/* =================================================
          DOCUMENT CONFIRM MODAL
      ================================================= */}

      {documentConfirmation && (

        <DocumentConfirmModal
          document={
            documentConfirmation.document
          }
          decision={
            documentConfirmation.decision
          }
          isSubmitting={
            isReviewingDocument
          }
          onClose={() =>
            setDocumentConfirmation(
              null
            )
          }
          onConfirm={
            submitDocumentReview
          }
        />

      )}

    </div>
  );
}


// =========================================================
// ENROLLMENT MODAL
// =========================================================

function EnrollmentModal({
  enrollment,
  documents,
  isLoadingDocuments,
  isReviewingDocument,
  onReviewDocument,
  requirements,
  title,
  onClose,
  children,
}: {
  enrollment: Enrollment;

  documents: EnrollmentDocument[];

  isLoadingDocuments: boolean;

  isReviewingDocument: boolean;

  onReviewDocument: (
    document: EnrollmentDocument,
    decision:
      | "Approved"
      | "Rejected"
      | "NeedsCorrection"
  ) => void;

  requirements:
    TrainingProgramRequirement[];

  title: string;

  onClose: () => void;

  children?: React.ReactNode;
}) {

  const participant =
    enrollment.participant;


  // =======================================================
  // DOCUMENT COUNTS
  // =======================================================

  const submittedCount =
    documents.length;


  const approvedCount =
    documents.filter(
      document =>
        document.status ===
        "Approved"
    ).length;


  const rejectedCount =
    documents.filter(
      document =>
        document.status ===
        "Rejected"
    ).length;


  const pendingDocumentCount =
    documents.filter(
      document =>
        document.status ===
        "Pending"
    ).length;


  const needsCorrectionCount =
    documents.filter(
      document =>
        document.status ===
        "NeedsCorrection"
    ).length;


  const totalRequirements =
    requirements.length;


  const submittedPercentage =
    totalRequirements > 0
      ? Math.round(
          (submittedCount /
            totalRequirements) *
            100
        )
      : 0;


  const approvedPercentage =
    totalRequirements > 0
      ? Math.round(
          (approvedCount /
            totalRequirements) *
            100
        )
      : 0;


  return (

    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">

      <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Enrollment Request
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {title}
            </h2>

            <p className="mt-1 font-mono text-xs text-gray-500">
              {enrollment.id}
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>


        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

          {/* PARTICIPANT */}

          <div className="rounded-2xl bg-gray-50 p-4">

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Participant
            </p>


            <div className="mt-3 flex items-center gap-4">

              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200">

                {participant.profileImageUrl ? (

                  <img
                    src={
                      participant.profileImageUrl
                    }
                    alt={
                      participant.fullName
                    }
                    className="h-full w-full object-cover"
                  />

                ) : (

                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-500">
                    {participant.fullName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                )}

              </div>


              <div className="min-w-0">

                <p className="text-lg font-bold text-gray-900">
                  {participant.fullName}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {participant.email}
                </p>

                <p className="mt-1 font-mono text-xs text-gray-400">
                  {participant.userCode}
                </p>

              </div>

            </div>


            {participant.mobileNumber && (

              <div className="mt-4">

                <Info
                  label="Mobile Number"
                  value={
                    participant.mobileNumber
                  }
                />

              </div>

            )}

          </div>


          {/* TRAINING */}

          <div className="mt-5">

            <h3 className="text-sm font-bold">
              Training Information
            </h3>


            <div className="mt-3 grid gap-4 sm:grid-cols-2">

              <Info
                label="Training Program"
                value={
                  enrollment.programName
                }
              />

              <Info
                label="Batch"
                value={
                  enrollment.batchCode
                }
              />

              <Info
                label="Training Batch ID"
                value={
                  enrollment.trainingBatchId
                }
              />

              <Info
                label="Status"
                value={
                  enrollment.status
                }
              />

            </div>

          </div>


          {/* ENROLLMENT */}

          <div className="mt-5 rounded-2xl border border-gray-200 p-4">

            <h3 className="text-sm font-bold">
              Enrollment Information
            </h3>


            <div className="mt-3 grid gap-4 sm:grid-cols-2">

              <Info
                label="Submitted"
                value={
                  formatDate(
                    enrollment.enrolledAt
                  )
                }
              />

              <Info
                label="Approved"
                value={
                  enrollment.approvedAt
                    ? formatDate(
                        enrollment.approvedAt
                      )
                    : "Not approved"
                }
              />

            </div>

          </div>


          {/* REQUIREMENTS */}

          <div className="mt-5 rounded-2xl border border-gray-200 p-4">

            <div className="flex items-center justify-between">

              <h3 className="text-sm font-bold">
                Requirements
              </h3>

              <span className="text-xs font-semibold text-gray-500">
                {submittedCount}/
                {totalRequirements}
                {" "}
                submitted
              </span>

            </div>


            <div className="mt-4">

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold text-gray-600">
                  Submitted
                </span>

                <span className="text-xs font-bold text-gray-900">
                  {submittedCount}/
                  {totalRequirements}
                </span>

              </div>


              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-[#191c1e]"
                  style={{
                    width: `${Math.min(
                      submittedPercentage,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>


            <div className="mt-4">

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold text-gray-600">
                  Approved
                </span>

                <span className="text-xs font-bold text-emerald-700">
                  {approvedCount}/
                  {totalRequirements}
                </span>

              </div>


              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(
                      approvedPercentage,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>


            <div className="mt-4 grid grid-cols-4 gap-2">

              <RequirementStat
                label="Submitted"
                value={
                  submittedCount
                }
              />

              <RequirementStat
                label="Approved"
                value={
                  approvedCount
                }
                valueClassName="text-emerald-600"
              />

              <RequirementStat
                label="Rejected"
                value={
                  rejectedCount
                }
                valueClassName="text-red-600"
              />

              <RequirementStat
                label="Correction"
                value={
                  needsCorrectionCount
                }
                valueClassName="text-orange-600"
              />

            </div>


            {pendingDocumentCount > 0 && (

              <p className="mt-3 text-xs text-amber-600">

                {pendingDocumentCount}
                {" "}
                document
                {pendingDocumentCount !== 1
                  ? "s are"
                  : " is"}
                {" "}
                still waiting for review.

              </p>

            )}

          </div>


          {/* DOCUMENTS */}

          <div className="mt-5">

            <div className="flex items-center justify-between">

              <h3 className="text-sm font-bold">
                Submitted Documents
              </h3>

              <span className="text-xs text-gray-400">
                {submittedCount} submitted
              </span>

            </div>


            {isLoadingDocuments ? (

              <div className="mt-3 rounded-xl border border-gray-200 p-5 text-center">

                <p className="text-xs text-gray-400">
                  Loading submitted documents...
                </p>

              </div>

            ) : documents.length === 0 ? (

              <div className="mt-3 rounded-xl border border-gray-200 p-4">

                <p className="text-xs text-gray-400">
                  No documents submitted.
                </p>

              </div>

            ) : (

              <div className="mt-3 space-y-3">

                {documents.map(
                  document => (

                    <DocumentReviewCard
                      key={
                        document.id
                      }
                      document={
                        document
                      }
                      isReviewing={
                        isReviewingDocument
                      }
                      onReview={
                        onReviewDocument
                      }
                    />

                  )
                )}

              </div>

            )}

          </div>


          {/* REMARKS */}

          {enrollment.reviewRemarks && (

            <div className="mt-5 rounded-2xl border border-gray-200 p-4">

              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Administrative Remarks
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {enrollment.reviewRemarks}
              </p>

            </div>

          )}


          {children}

        </div>


        {/* FOOTER */}

        <div className="shrink-0 border-t border-gray-200 px-5 py-4">

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// DOCUMENT REVIEW CARD
// =========================================================

function DocumentReviewCard({
  document,
  isReviewing,
  onReview,
}: {
  document: EnrollmentDocument;

  isReviewing: boolean;

  onReview: (
    document: EnrollmentDocument,
    decision:
      | "Approved"
      | "Rejected"
      | "NeedsCorrection"
  ) => void;
}) {

  const [remarks, setRemarks] =
    useState(
      document.reviewRemarks ?? ""
    );


  return (

    <div className="rounded-xl border border-gray-200 p-4">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-semibold text-gray-800">
            {document.requirementName}
          </p>

          <p className="mt-1 truncate text-xs text-gray-400">
            {document.fileName}
          </p>

        </div>


        <DocumentStatus
          status={
            document.status
          }
        />

      </div>


      <div className="mt-3">

        <a
          href={
            document.fileUrl
          }
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          View Document
        </a>

      </div>


      <div className="mt-4">

        <label
          htmlFor={
            `document-remarks-${document.id}`
          }
          className="text-xs font-semibold text-gray-700"
        >
          Review Remarks
        </label>


        <textarea
          id={
            `document-remarks-${document.id}`
          }
          value={
            remarks
          }
          onChange={
            event =>
              setRemarks(
                event.target.value
              )
          }
          rows={2}
          placeholder="Optional remarks..."
          className="mt-2 w-full resize-none rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-gray-400"
        />

      </div>


      <div className="mt-3 flex flex-wrap gap-2">

        <button
          type="button"
          disabled={
            isReviewing
          }
          onClick={() =>
            onReview(
              document,
              "Approved"
            )
          }
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve
        </button>


        <button
          type="button"
          disabled={
            isReviewing
          }
          onClick={() =>
            onReview(
              document,
              "Rejected"
            )
          }
          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reject
        </button>


        <button
          type="button"
          disabled={
            isReviewing
          }
          onClick={() =>
            onReview(
              document,
              "NeedsCorrection"
            )
          }
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Needs Correction
        </button>

      </div>

    </div>
  );
}


// =========================================================
// DOCUMENT CONFIRM MODAL
// =========================================================

function DocumentConfirmModal({
  document,
  decision,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  document: EnrollmentDocument;

  decision:
    | "Approved"
    | "Rejected"
    | "NeedsCorrection";

  isSubmitting: boolean;

  onClose: () => void;

  onConfirm: () => void;
}) {

  const isApproved =
    decision === "Approved";

  const isRejected =
    decision === "Rejected";


  const title =
    isApproved
      ? "Approve Document?"
      : isRejected
        ? "Reject Document?"
        : "Request Correction?";


  const description =
    isApproved
      ? "This document will be marked as approved."
      : isRejected
        ? "This document will be marked as rejected."
        : "The participant will be asked to correct and resubmit this document.";


  return (

    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Document Review
        </p>


        <h2 className="mt-2 text-xl font-bold">
          {title}
        </h2>


        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>


        <div className="mt-5 rounded-xl bg-gray-50 p-4">

          <p className="text-xs font-bold text-gray-900">
            {document.requirementName}
          </p>


          <p className="mt-1 text-xs text-gray-500">
            {document.fileName}
          </p>

        </div>


        <div className="mt-6 flex gap-3">

          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={
              onClose
            }
            className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={
              onConfirm
            }
            className={
              `flex-1 rounded-xl py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ` +
              (
                isApproved
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : isRejected
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700"
              )
            }
          >

            {isSubmitting
              ? "Saving..."
              : isApproved
                ? "Approve Document"
                : isRejected
                  ? "Reject Document"
                  : "Request Correction"}

          </button>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// ENROLLMENT CONFIRM MODAL
// =========================================================

function ConfirmModal({
  enrollment,
  status,
  remarks,
  setRemarks,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  enrollment: Enrollment;

  status:
    | "Approved"
    | "Rejected";

  remarks: string;

  setRemarks: (
    value: string
  ) => void;

  isSubmitting: boolean;

  onClose: () => void;

  onConfirm: () => void;
}) {

  const isApproved =
    status === "Approved";


  return (

    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Enrollment Decision
        </p>


        <h2 className="mt-2 text-xl font-bold">

          {isApproved
            ? "Approve Enrollment?"
            : "Reject Enrollment?"}

        </h2>


        <p className="mt-2 text-sm leading-6 text-gray-500">

          {isApproved
            ? "The participant will be officially admitted to this training batch."
            : "This enrollment request will be marked as rejected."}

        </p>


        <div className="mt-5 rounded-xl bg-gray-50 p-4">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">

              {enrollment.participant.profileImageUrl ? (

                <img
                  src={
                    enrollment.participant
                      .profileImageUrl
                  }
                  alt={
                    enrollment.participant
                      .fullName
                  }
                  className="h-full w-full object-cover"
                />

              ) : (

                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">

                  {enrollment.participant.fullName
                    .charAt(0)
                    .toUpperCase()}

                </div>

              )}

            </div>


            <div className="min-w-0">

              <p className="truncate text-sm font-bold">
                {
                  enrollment.participant
                    .fullName
                }
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {
                  enrollment.participant
                    .email
                }
              </p>

            </div>

          </div>


          <p className="mt-3 text-xs text-gray-500">
            {enrollment.programName}
          </p>


          <p className="mt-1 text-xs text-gray-500">
            Batch:{" "}
            {enrollment.batchCode}
          </p>


          <p className="mt-1 font-mono text-[10px] text-gray-400">
            {enrollment.id}
          </p>

        </div>


        <div className="mt-5">

          <label
            htmlFor="reviewRemarks"
            className="text-xs font-semibold text-gray-700"
          >
            Remarks
          </label>


          <textarea
            id="reviewRemarks"
            value={
              remarks
            }
            onChange={
              event =>
                setRemarks(
                  event.target.value
                )
            }
            rows={4}
            placeholder={
              isApproved
                ? "Optional remarks..."
                : "Enter the reason for rejection..."
            }
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-400"
          />

        </div>


        <div className="mt-6 flex gap-3">

          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={
              onClose
            }
            className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>


          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={
              onConfirm
            }
            className={
              `flex-1 rounded-xl py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ` +
              (
                isApproved
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              )
            }
          >

            {isSubmitting
              ? "Saving..."
              : isApproved
                ? "Approve Enrollment"
                : "Reject Enrollment"}

          </button>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// NOTIFICATION
// =========================================================

function Notification({
  type,
  title,
  message,
  onClose,
}: {
  type:
    | "success"
    | "error";

  title: string;

  message: string;

  onClose: () => void;
}) {

  const isSuccess =
    type === "success";


  return (

    <div className="fixed right-5 top-5 z-[11000] w-[min(380px,calc(100vw-40px))]">

      <div
        className={
          `rounded-2xl border bg-white p-4 shadow-2xl ` +
          (
            isSuccess
              ? "border-emerald-200"
              : "border-red-200"
          )
        }
      >

        <div className="flex items-start gap-3">

          <div
            className={
              `flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ` +
              (
                isSuccess
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )
            }
          >
            {isSuccess
              ? "✓"
              : "!"}
          </div>


          <div className="min-w-0 flex-1">

            <p className="text-sm font-bold text-gray-900">
              {title}
            </p>


            <p className="mt-1 text-xs leading-5 text-gray-500">
              {message}
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="text-lg leading-none text-gray-400 hover:text-gray-600"
          >
            ×
          </button>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// REQUIREMENT STAT
// =========================================================

function RequirementStat({
  label,
  value,
  valueClassName = "text-gray-900",
}: {
  label: string;

  value: number;

  valueClassName?: string;
}) {

  return (

    <div className="rounded-xl bg-gray-50 p-3 text-center">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>


      <p
        className={
          `mt-1 text-lg font-bold ${valueClassName}`
        }
      >
        {value}
      </p>

    </div>

  );
}


// =========================================================
// DOCUMENT STATUS
// =========================================================

function DocumentStatus({
  status,
}: {
  status: string;
}) {

  const className =
    status === "Approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status === "Rejected"
        ? "bg-red-50 text-red-700 border-red-100"
        : status === "NeedsCorrection"
          ? "bg-orange-50 text-orange-700 border-orange-100"
          : "bg-amber-50 text-amber-700 border-amber-100";


  return (

    <span
      className={
        `shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${className}`
      }
    >
      {status}
    </span>

  );
}


// =========================================================
// INFO
// =========================================================

function Info({
  label,
  value,
}: {
  label: string;

  value: string;
}) {

  return (

    <div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>


      <p className="mt-1 break-words text-sm font-semibold leading-5 text-gray-900">
        {value}
      </p>

    </div>

  );
}


// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
  value: string
) {

  if (!value) {
    return "Not specified";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

}