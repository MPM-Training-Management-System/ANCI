"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Button,
  DataTable,
  PageSection,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { RotateCcw } from "lucide-react";

import {useEnrollmentManagement} from "@/hooks/useEnrollmentManagement"
 

export default function EnrollmentPage() {

 const {
    filteredEnrollments,
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
    setDocumentConfirmation,
  } = useEnrollmentManagement();

  const tableMeta = {
    onView: viewEnrollment,
    onApprove: approveEnrollment,
    onReject: rejectEnrollment,
    requirementsByBatch,
  };

 

  return (

    <div className="space-y-6">



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
          onClose={closeNotification}
        />

      )}

      <PageSection
      title="Enrollment Management"
      description=" Review enrollment requests submitted
          by participants and manage their
          admission into training programs."
          actions={
            <Button
            onClick={handleRefresh}
            >
              <RotateCcw
                      className={`h-4 w-4 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
            </Button>
          }
      ></PageSection>

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

      <StatGrid>

        <StatCard
        variant="primary"
          title="Total Applications"
          value={total}
          description="Enrollment requests"
        />


        <StatCard
        variant="warning"
          title="Pending Review"
          value={pending}
          description="Waiting for admin decision"
        />


        <StatCard
        variant="success"
          title="Approved"
          value={approved}
          description="Approved enrollments"
        />


        <StatCard
        variant="danger"
          title="Rejected"
          value={rejected}
          description="Rejected enrollments"
        />

      </StatGrid>



     <DataTable
  columns={columns}
  data={filteredEnrollments}
  searchable
  searchPlaceholder="Search participant or training..."
  meta={tableMeta}
  toolbar={
    <div className="flex flex-wrap gap-2">
      {/* TRAINING FILTER */}
      <Select
        value={trainingFilter}
        onValueChange={setTrainingFilter}
      >
        <SelectTrigger className="w-55">
          <SelectValue placeholder="All Trainings" />
        </SelectTrigger>

        <SelectContent>
          {trainings.map((training) => (
            <SelectItem
              key={training}
              value={training}
            >
              {training}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* STATUS FILTER */}
      <Select
        value={statusFilter}
        onValueChange={(value) =>
          setStatusFilter(
            value as "All" | EnrollmentStatus
          )
        }
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="All">
            All Status
          </SelectItem>

          <SelectItem value="Pending">
            Pending
          </SelectItem>

          <SelectItem value="UnderReview">
            Under Review
          </SelectItem>

          <SelectItem value="NeedsCorrection">
            Needs Correction
          </SelectItem>

          <SelectItem value="Approved">
            Approved
          </SelectItem>

          <SelectItem value="Rejected">
            Rejected
          </SelectItem>

          <SelectItem value="Cancelled">
            Cancelled
          </SelectItem>
        </SelectContent>
      </Select>
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
           onClose={closeEnrollmentModal}
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