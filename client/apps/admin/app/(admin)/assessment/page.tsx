"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  TrainingBatch,
  AssessmentRetakeRequest,
  WrittenAssessment,
} from "@repo/types";

import {
  trainingBatchApi,
  writtenAssessmentApi,
} from "@/lib/api";

import {
  columns,
  type AdminWrittenAssessment,
} from "./columns";

import WrittenAssessmentModal from "./WrittenAssessmentModal";
import WrittenAssessmentQuestionsModal from "./WrittenAssessmentQuestionsModal";
import { DataTable } from "@repo/ui/index";

export default function AssessmentPage() {
  // =========================================================
  // TRAINING BATCH
  // =========================================================

  const [batches, setBatches] =
    useState<TrainingBatch[]>([]);

  const [selectedBatchId, setSelectedBatchId] =
    useState("");

  const [isLoadingBatches, setIsLoadingBatches] =
    useState(true);

  // =========================================================
  // ASSESSMENTS
  // =========================================================

  const [assessments, setAssessments] =
    useState<WrittenAssessment[]>([]);

  const [isLoadingAssessments, setIsLoadingAssessments] =
    useState(false);

  // =========================================================
  // ASSESSMENT MODAL
  // =========================================================

  const [showAssessmentModal, setShowAssessmentModal] =
    useState(false);

  const [selectedAssessment, setSelectedAssessment] =
    useState<WrittenAssessment | null>(null);

  // =========================================================
  // QUESTIONS MODAL
  // =========================================================

  const [showQuestionsModal, setShowQuestionsModal] =
    useState(false);

  const [
    selectedQuestionsAssessment,
    setSelectedQuestionsAssessment,
  ] = useState<WrittenAssessment | null>(null);

  // =========================================================
  // UI STATE
  // =========================================================

  const [error, setError] =
    useState<string | null>(null);

  const [alert, setAlert] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [publishingId, setPublishingId] =
    useState<string | null>(null);

  // =========================================================
  // RETAKE REQUESTS
  // =========================================================

  const [
    retakeRequests,
    setRetakeRequests,
  ] = useState<AssessmentRetakeRequest[]>([]);

  const [
    isLoadingRetakeRequests,
    setIsLoadingRetakeRequests,
  ] = useState(false);

  const [
    reviewingRetakeId,
    setReviewingRetakeId,
  ] = useState<string | null>(null);

  // =========================================================
  // LOAD TRAINING BATCHES
  // =========================================================

  const loadBatches = useCallback(
    async () => {
      try {
        setIsLoadingBatches(true);
        setError(null);

        const data =
          await trainingBatchApi.getAll();

        setBatches(data);

        if (data.length === 0) {
          setSelectedBatchId("");
          return;
        }

        const selectedStillExists =
          data.some(
            batch =>
              batch.id === selectedBatchId,
          );

        if (!selectedStillExists) {
          setSelectedBatchId(
            data[0].id,
          );
        }
      } catch (err) {
        console.error(
          "Failed to load training batches:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load training batches.",
        );
      } finally {
        setIsLoadingBatches(false);
      }
    },
    [selectedBatchId],
  );

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  // =========================================================
  // LOAD ASSESSMENTS
  // =========================================================

  const loadAssessments = useCallback(
    async () => {
      if (!selectedBatchId) {
        setAssessments([]);
        return;
      }

      try {
        setIsLoadingAssessments(true);
        setError(null);

        const data =
          await writtenAssessmentApi.getByBatchId(
            selectedBatchId,
          );

        setAssessments(data);
      } catch (err) {
        console.error(
          "Failed to load written assessments:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load written assessments.",
        );
      } finally {
        setIsLoadingAssessments(false);
      }
    },
    [selectedBatchId],
  );

  useEffect(() => {
    void loadAssessments();
  }, [loadAssessments]);

  // =========================================================
  // LOAD RETAKE REQUESTS
  // =========================================================

  const loadRetakeRequests =
    useCallback(async () => {
      try {
        setIsLoadingRetakeRequests(true);
        setError(null);

        const data =
          await writtenAssessmentApi
            .getRetakeRequests();

        setRetakeRequests(data);
      } catch (err) {
        console.error(
          "Failed to load retake requests:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load retake requests.",
        );
      } finally {
        setIsLoadingRetakeRequests(false);
      }
    }, []);

  useEffect(() => {
    void loadRetakeRequests();
  }, [loadRetakeRequests]);

  // =========================================================
  // BATCH CHANGE
  // =========================================================

  const handleBatchChange = (
    batchId: string,
  ) => {
    setSelectedBatchId(batchId);

    setAlert(null);
    setError(null);

    setSelectedAssessment(null);
    setShowAssessmentModal(false);

    setSelectedQuestionsAssessment(null);
    setShowQuestionsModal(false);
  };

  // =========================================================
  // CREATE ASSESSMENT
  // =========================================================

  const handleCreate = () => {
    setAlert(null);
    setError(null);

    if (!selectedBatchId) {
      setAlert(
        "Please select a training batch first.",
      );

      return;
    }

    setSelectedAssessment(null);
    setShowAssessmentModal(true);
  };

  // =========================================================
  // EDIT ASSESSMENT
  // =========================================================

  const handleEdit = (
    assessment: AdminWrittenAssessment,
  ) => {
    setAlert(null);
    setError(null);

    setSelectedAssessment(
      assessment,
    );

    setShowAssessmentModal(true);
  };

  // =========================================================
  // DELETE ASSESSMENT
  // =========================================================

  const handleDelete = async (
    assessment: AdminWrittenAssessment,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${assessment.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        assessment.id,
      );

      setError(null);
      setAlert(null);

      await writtenAssessmentApi.delete(
        assessment.id,
      );

      setAssessments(current =>
        current.filter(
          item =>
            item.id !==
            assessment.id,
        ),
      );

      if (
        selectedQuestionsAssessment?.id ===
        assessment.id
      ) {
        setShowQuestionsModal(false);

        setSelectedQuestionsAssessment(
          null,
        );
      }

      setAlert(
        "Written assessment deleted successfully.",
      );
    } catch (err) {
      console.error(
        "Failed to delete assessment:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete assessment.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // PUBLISH / UNPUBLISH
  // =========================================================

  const handlePublish = async (
    assessment: AdminWrittenAssessment,
  ) => {
    try {
      setPublishingId(
        assessment.id,
      );

      setError(null);
      setAlert(null);

      const updated =
        await writtenAssessmentApi.setPublished(
          assessment.id,
          !assessment.isPublished,
        );

      setAssessments(current =>
        current.map(item =>
          item.id === assessment.id
            ? updated
            : item,
        ),
      );

      if (
        selectedQuestionsAssessment?.id ===
        assessment.id
      ) {
        setSelectedQuestionsAssessment(
          updated,
        );
      }

      setAlert(
        updated.isPublished
          ? "Assessment published successfully."
          : "Assessment unpublished successfully.",
      );
    } catch (err) {
      console.error(
        "Failed to update publication status:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update publication status.",
      );
    } finally {
      setPublishingId(null);
    }
  };

  // =========================================================
  // OPEN QUESTIONS
  // =========================================================

  const handleQuestions = (
    assessment: AdminWrittenAssessment,
  ) => {
    setAlert(null);
    setError(null);

    setSelectedQuestionsAssessment(
      assessment,
    );

    setShowQuestionsModal(true);
  };

  // =========================================================
  // CLOSE ASSESSMENT MODAL
  // =========================================================

  const handleCloseAssessmentModal =
    () => {
      setShowAssessmentModal(false);
      setSelectedAssessment(null);
    };

  // =========================================================
  // ASSESSMENT SAVED
  // =========================================================

  const handleAssessmentSaved = (
    saved: WrittenAssessment,
  ) => {
    setAssessments(current => {
      const exists =
        current.some(
          item =>
            item.id ===
            saved.id,
        );

      if (exists) {
        return current.map(item =>
          item.id === saved.id
            ? saved
            : item,
        );
      }

      return [
        ...current,
        saved,
      ];
    });

    setShowAssessmentModal(false);
    setSelectedAssessment(null);

    setAlert(
      "Written assessment saved successfully.",
    );
  };

  // =========================================================
  // CLOSE QUESTIONS MODAL
  // =========================================================

  const handleCloseQuestionsModal =
    () => {
      setShowQuestionsModal(false);

      setSelectedQuestionsAssessment(
        null,
      );
    };

  // =========================================================
  // QUESTIONS CHANGED
  // =========================================================

  const handleQuestionsChanged =
    async () => {
      await loadAssessments();
    };

  // =========================================================
  // REVIEW RETAKE REQUEST
  // =========================================================

  const handleReviewRetake = async (
    request: AssessmentRetakeRequest,
    approve: boolean,
  ) => {
    const action =
      approve
        ? "approve"
        : "reject";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} this retake request?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setReviewingRetakeId(
        request.id,
      );

      setError(null);
      setAlert(null);

      await writtenAssessmentApi
        .reviewRetakeRequest(
          request.id,
          {
            approve,
            adminRemarks:
              approve
                ? "Retake request approved."
                : "Retake request rejected.",
          },
        );

      setRetakeRequests(current =>
        current.map(item =>
          item.id === request.id
            ? {
                ...item,
                status:
                  approve
                    ? "Approved"
                    : "Rejected",
                adminRemarks:
                  approve
                    ? "Retake request approved."
                    : "Retake request rejected.",
                reviewedAt:
                  new Date().toISOString(),
              }
            : item,
        ),
      );

      setAlert(
        approve
          ? "Retake request approved successfully."
          : "Retake request rejected successfully.",
      );
    } catch (err) {
      console.error(
        "Failed to review retake request:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to review retake request.",
      );
    } finally {
      setReviewingRetakeId(null);
    }
  };

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const total =
      assessments.length;

    const pendingRetakes =
      retakeRequests.filter(
        request =>
          request.status ===
          "Pending",
      ).length;

    const published =
      assessments.filter(
        item =>
          item.isPublished,
      ).length;

    const drafts =
      total - published;

    const questions =
      assessments.reduce(
        (sum, item) =>
          sum +
          item.questionCount,
        0,
      );

    return {
      total,
      published,
      drafts,
      questions,
      pendingRetakes,
    };
  }, [
    assessments,
    retakeRequests,
  ]);

  // =========================================================
  // TABLE DATA
  // =========================================================

  const tableData =
    useMemo<AdminWrittenAssessment[]>(
      () => assessments,
      [assessments],
    );

  // =========================================================
  // CURRENT BATCH
  // =========================================================

  const selectedBatch = useMemo(
    () =>
      batches.find(
        batch =>
          batch.id ===
          selectedBatchId,
      ),
    [
      batches,
      selectedBatchId,
    ],
  );

  // =========================================================
  // PENDING REQUESTS
  // =========================================================

  const pendingRequests =
    useMemo(
      () =>
        retakeRequests.filter(
          request =>
            request.status ===
            "Pending",
        ),
      [retakeRequests],
    );

  // =========================================================
  // REQUEST STATUS
  // =========================================================

  const getRequestStatusClass = (
    status: AssessmentRetakeRequest["status"],
  ) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "Consumed":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div >
      <div className="mx-auto space-y-5 p-2 sm:p-6 lg:p-8">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-[#e7e9ec]
            bg-white
            p-6
            shadow-[0_2px_12px_rgba(0,0,0,0.03)]
            sm:p-8
          "
        >
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="
                    inline-flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#111827]
                    text-sm
                    text-white
                  "
                >
                  ✓
                </span>

                <span
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-gray-400
                  "
                >
                  Assessment Management
                </span>
              </div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                  sm:text-3xl
                "
              >
                Written Assessments
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-gray-500
                "
              >
                Create, manage, publish, and
                review assessments for your
                training participants.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={
                !selectedBatchId ||
                isLoadingBatches
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#111827]
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-black
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <span className="text-lg leading-none">
                +
              </span>

              Create Assessment
            </button>
          </div>

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-56
              w-56
              rounded-full
              bg-gray-100
              opacity-60
            "
          />
        </section>

        {/* =====================================================
            ALERT
        ===================================================== */}

        {alert && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-emerald-200
              bg-emerald-50
              px-5
              py-4
              text-sm
              text-emerald-700
            "
          >
            <span className="font-bold">
              ✓
            </span>

            <span>{alert}</span>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
              text-sm
              text-red-700
            "
          >
            <span className="font-bold">
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            BATCH SELECTOR
        ===================================================== */}

        <section
          className="
            rounded-3xl
            border
            border-[#e7e9ec]
            bg-white
            p-5
            shadow-[0_2px_12px_rgba(0,0,0,0.025)]
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  text-lg
                "
              >
                #
              </div>

              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-gray-400
                  "
                >
                  Current Workspace
                </p>

                <h2
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-[#111827]
                  "
                >
                  Training Batch
                </h2>
              </div>
            </div>

            <div className="w-full lg:max-w-sm">
              <select
                value={selectedBatchId}
                disabled={
                  isLoadingBatches
                }
                onChange={event =>
                  handleBatchChange(
                    event.target.value,
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#dfe3e8]
                  bg-[#fafafa]
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-[#111827]
                  outline-none
                  transition
                  focus:border-[#111827]
                  focus:bg-white
                "
              >
                <option value="">
                  Select a training batch
                </option>

                {batches.map(batch => (
                  <option
                    key={batch.id}
                    value={batch.id}
                  >
                    {batch.batchCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedBatch && (
            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-2
                border-t
                border-[#f0f1f3]
                pt-4
              "
            >
              <span className="text-xs text-gray-400">
                Selected batch
              </span>

              <span
                className="
                  rounded-full
                  bg-gray-100
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-gray-700
                "
              >
                {selectedBatch.batchCode}
              </span>

              <span className="text-xs text-gray-400">
                {assessments.length} assessment
                {assessments.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>
          )}
        </section>

        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-gray-400
                "
              >
                Overview
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-[#111827]
                "
              >
                Assessment Summary
              </h2>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              xl:grid-cols-5
            "
          >
            {/* TOTAL */}

            <div
              className="
                rounded-2xl
                border
                border-[#e7e9ec]
                bg-white
                p-5
                shadow-[0_2px_12px_rgba(0,0,0,0.025)]
              "
            >
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-gray-100
                    text-sm
                    font-bold
                    text-gray-700
                  "
                >
                  AS
                </div>

                <span className="text-xs text-gray-400">
                  Total
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                "
              >
                {stats.total}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Assessments
              </p>
            </div>

            {/* PUBLISHED */}

            <div
              className="
                rounded-2xl
                border
                border-[#e7e9ec]
                bg-white
                p-5
                shadow-[0_2px_12px_rgba(0,0,0,0.025)]
              "
            >
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-sm
                    font-bold
                    text-emerald-600
                  "
                >
                  ✓
                </div>

                <span className="text-xs text-emerald-600">
                  Live
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                "
              >
                {stats.published}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Published
              </p>
            </div>

            {/* DRAFTS */}

            <div
              className="
                rounded-2xl
                border
                border-[#e7e9ec]
                bg-white
                p-5
                shadow-[0_2px_12px_rgba(0,0,0,0.025)]
              "
            >
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-gray-100
                    text-sm
                    font-bold
                    text-gray-600
                  "
                >
                  D
                </div>

                <span className="text-xs text-gray-400">
                  Draft
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                "
              >
                {stats.drafts}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Unpublished
              </p>
            </div>

            {/* QUESTIONS */}

            <div
              className="
                rounded-2xl
                border
                border-[#e7e9ec]
                bg-white
                p-5
                shadow-[0_2px_12px_rgba(0,0,0,0.025)]
              "
            >
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-sm
                    font-bold
                    text-blue-600
                  "
                >
                  ?
                </div>

                <span className="text-xs text-gray-400">
                  Content
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                "
              >
                {stats.questions}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Total questions
              </p>
            </div>

            {/* RETAKES */}

            <div
              className={`
                rounded-2xl
                border
                p-5
                shadow-[0_2px_12px_rgba(0,0,0,0.025)]
                ${
                  stats.pendingRetakes > 0
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-[#e7e9ec] bg-white"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    text-sm
                    font-bold
                    ${
                      stats.pendingRetakes > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  !
                </div>

                <span
                  className={`
                    text-xs
                    ${
                      stats.pendingRetakes > 0
                        ? "text-amber-700"
                        : "text-gray-400"
                    }
                  `}
                >
                  Action
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                "
              >
                {stats.pendingRetakes}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Pending retakes
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            ASSESSMENTS
        ===================================================== */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-[#e7e9ec]
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.025)]
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-[#eceef1]
              p-5
              sm:p-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-[#111827]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-gray-400
                  "
                >
                  Assessment Library
                </span>
              </div>

              <h2
                className="
                  mt-2
                  text-xl
                  font-bold
                  tracking-tight
                  text-[#111827]
                "
              >
                Your Assessments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage questions, publication,
                and assessment settings.
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  rounded-full
                  bg-gray-100
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-gray-600
                "
              >
                {assessments.length} total
              </span>

              {isLoadingAssessments && (
                <span className="text-xs text-gray-400">
                  Loading...
                </span>
              )}
            </div>
          </div>

          {assessments.length === 0 &&
          !isLoadingAssessments ? (
            <div className="p-8 sm:p-12">
              <div
                className="
                  mx-auto
                  flex
                  max-w-md
                  flex-col
                  items-center
                  text-center
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gray-100
                    text-xl
                    font-bold
                    text-gray-400
                  "
                >
                  AS
                </div>

                <h3
                  className="
                    mt-5
                    text-base
                    font-bold
                    text-[#111827]
                  "
                >
                  No assessments yet
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-gray-500
                  "
                >
                  Create your first written
                  assessment for this training
                  batch.
                </p>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!selectedBatchId}
                  className="
                    mt-5
                    rounded-xl
                    bg-[#111827]
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-black
                    disabled:opacity-40
                  "
                >
                  Create Assessment
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="overflow-hidden rounded-2xl border border-[#eceef1]">
                <DataTable
                  columns={columns}
                  data={tableData}
                  searchable
                  showPagination
                  meta={{
                    onQuestions:
                      handleQuestions,

                    onEdit:
                      handleEdit,

                    onDelete:
                      handleDelete,

                    onPublish:
                      handlePublish,

                    deletingId,

                    publishingId,
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* =====================================================
            RETAKE REQUESTS
        ===================================================== */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-[#e7e9ec]
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.025)]
          "
        >
          {/* REQUEST HEADER */}

          <div
            className="
              border-b
              border-[#eceef1]
              p-5
              sm:p-6
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    text-lg
                    font-bold
                    ${
                      pendingRequests.length > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  !
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-gray-400
                      "
                    >
                      Notifications
                    </p>

                    {pendingRequests.length > 0 && (
                      <span
                        className="
                          rounded-full
                          bg-amber-100
                          px-2
                          py-0.5
                          text-[10px]
                          font-bold
                          text-amber-700
                        "
                      >
                        {pendingRequests.length} new
                      </span>
                    )}
                  </div>

                  <h2
                    className="
                      mt-1
                      text-xl
                      font-bold
                      tracking-tight
                      text-[#111827]
                    "
                  >
                    Retake Requests
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review participants who are
                    requesting another assessment attempt.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  void loadRetakeRequests();
                }}
                disabled={
                  isLoadingRetakeRequests
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#dfe3e8]
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isLoadingRetakeRequests
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          </div>

          {/* REQUEST CONTENT */}

          <div className="p-4 sm:p-6">
            {isLoadingRetakeRequests ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-[#dfe3e8]
                  px-5
                  py-14
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-gray-100
                    text-sm
                    font-bold
                    text-gray-400
                  "
                >
                  ...
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-600">
                  Loading requests
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Please wait a moment.
                </p>
              </div>
            ) : retakeRequests.length === 0 ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-[#dfe3e8]
                  px-5
                  py-14
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gray-100
                    text-lg
                    font-bold
                    text-gray-400
                  "
                >
                  ✓
                </div>

                <h3
                  className="
                    mt-4
                    text-sm
                    font-bold
                    text-[#111827]
                  "
                >
                  All caught up
                </h3>

                <p
                  className="
                    mx-auto
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-gray-400
                  "
                >
                  There are currently no retake
                  requests waiting for review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

                {/* =================================================
                    PENDING REQUESTS
                ================================================= */}

                {pendingRequests.length > 0 && (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-amber-600
                        "
                      >
                        Needs your attention
                      </span>

                      <div className="h-px flex-1 bg-amber-100" />
                    </div>

                    {pendingRequests.map(
                      request => {
                        const isReviewing =
                          reviewingRetakeId ===
                          request.id;

                        return (
                          <div
                            key={request.id}
                            className="
                              overflow-hidden
                              rounded-2xl
                              border
                              border-amber-200
                              bg-amber-50/40
                              transition
                              hover:border-amber-300
                              hover:bg-amber-50
                            "
                          >
                            <div className="p-4 sm:p-5">
                              <div
                                className="
                                  flex
                                  flex-col
                                  gap-5
                                  lg:flex-row
                                  lg:items-center
                                  lg:justify-between
                                "
                              >
                                {/* LEFT */}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start gap-3">
                                    <div
                                      className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-white
                                        text-sm
                                        font-bold
                                        text-gray-600
                                        shadow-sm
                                      "
                                    >
                                      ID
                                    </div>

                                    <div className="min-w-0">
                                      <div
                                        className="
                                          flex
                                          flex-wrap
                                          items-center
                                          gap-2
                                        "
                                      >
                                        <h3
                                          className="
                                            truncate
                                            text-sm
                                            font-bold
                                            text-[#111827]
                                          "
                                        >
                                          Participant
                                        </h3>

                                        <span
                                          className="
                                            rounded-md
                                            bg-white
                                            px-2
                                            py-1
                                            text-[10px]
                                            font-semibold
                                            text-gray-500
                                            shadow-sm
                                          "
                                        >
                                          {request.participantId}
                                        </span>

                                        <span
                                          className="
                                            rounded-full
                                            border
                                            border-amber-200
                                            bg-amber-100
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            font-bold
                                            text-amber-700
                                          "
                                        >
                                          Pending Review
                                        </span>
                                      </div>

                                      <p
                                        className="
                                          mt-1.5
                                          text-sm
                                          font-semibold
                                          text-gray-700
                                        "
                                      >
                                        {request.assessmentTitle}
                                      </p>

                                      <p
                                        className="
                                          mt-1
                                          text-xs
                                          text-gray-400
                                        "
                                      >
                                        Requested{" "}
                                        {new Date(
                                          request.requestedAt,
                                        ).toLocaleDateString(
                                          undefined,
                                          {
                                            month:
                                              "short",
                                            day:
                                              "numeric",
                                            year:
                                              "numeric",
                                          },
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {/* DETAILS */}

                                  <div
                                    className="
                                      mt-4
                                      grid
                                      grid-cols-2
                                      gap-2
                                      sm:grid-cols-4
                                    "
                                  >
                                    <div
                                      className="
                                        rounded-xl
                                        border
                                        border-white
                                        bg-white/80
                                        px-3
                                        py-2.5
                                      "
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                        Attempt
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-gray-800">
                                        #
                                        {
                                          request.attemptNumber
                                        }
                                      </p>
                                    </div>

                                    <div
                                      className="
                                        rounded-xl
                                        border
                                        border-white
                                        bg-white/80
                                        px-3
                                        py-2.5
                                      "
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                        Score
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-red-600">
                                        {
                                          request.percentage
                                        }
                                        %
                                      </p>
                                    </div>

                                    <div
                                      className="
                                        rounded-xl
                                        border
                                        border-white
                                        bg-white/80
                                        px-3
                                        py-2.5
                                      "
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                        Result
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-red-600">
                                        Failed
                                      </p>
                                    </div>

                                    <div
                                      className="
                                        rounded-xl
                                        border
                                        border-white
                                        bg-white/80
                                        px-3
                                        py-2.5
                                      "
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                        Status
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-amber-700">
                                        Review
                                      </p>
                                    </div>
                                  </div>

                                  {/* REASON */}

                                  {request.reason && (
                                    <div
                                      className="
                                        mt-3
                                        rounded-xl
                                        border
                                        border-amber-100
                                        bg-white/70
                                        px-4
                                        py-3
                                      "
                                    >
                                      <p
                                        className="
                                          text-[10px]
                                          font-bold
                                          uppercase
                                          tracking-wide
                                          text-gray-400
                                        "
                                      >
                                        Participant's reason
                                      </p>

                                      <p
                                        className="
                                          mt-1
                                          text-xs
                                          leading-5
                                          text-gray-600
                                        "
                                      >
                                        {request.reason}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* ACTIONS */}

                                <div
                                  className="
                                    flex
                                    shrink-0
                                    flex-col
                                    gap-2
                                    border-t
                                    border-amber-100
                                    pt-4
                                    sm:flex-row
                                    lg:w-[190px]
                                    lg:flex-col
                                    lg:border-l
                                    lg:border-t-0
                                    lg:pl-5
                                    lg:pt-0
                                  "
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleReviewRetake(
                                        request,
                                        true,
                                      )
                                    }
                                    disabled={
                                      isReviewing
                                    }
                                    className="
                                      flex
                                      flex-1
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-xl
                                      bg-[#111827]
                                      px-4
                                      py-2.5
                                      text-xs
                                      font-bold
                                      text-white
                                      transition
                                      hover:bg-black
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                  >
                                    <span>
                                      ✓
                                    </span>

                                    {isReviewing
                                      ? "Processing..."
                                      : "Approve"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleReviewRetake(
                                        request,
                                        false,
                                      )
                                    }
                                    disabled={
                                      isReviewing
                                    }
                                    className="
                                      flex
                                      flex-1
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-xl
                                      border
                                      border-red-200
                                      bg-white
                                      px-4
                                      py-2.5
                                      text-xs
                                      font-bold
                                      text-red-600
                                      transition
                                      hover:bg-red-50
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                  >
                                    <span>
                                      ×
                                    </span>

                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </>
                )}

                {/* =================================================
                    HISTORY
                ================================================= */}

                {retakeRequests.some(
                  request =>
                    request.status !==
                    "Pending",
                ) && (
                  <div className="pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-gray-400
                        "
                      >
                        Request History
                      </span>

                      <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[#eceef1]">
                      <div className="divide-y divide-[#eceef1]">
                        {retakeRequests
                          .filter(
                            request =>
                              request.status !==
                              "Pending",
                          )
                          .map(request => (
                            <div
                              key={request.id}
                              className="
                                flex
                                flex-col
                                gap-3
                                px-4
                                py-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:px-5
                              "
                            >
                              <div className="min-w-0">
                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-semibold
                                    text-[#111827]
                                  "
                                >
                                  {
                                    request.assessmentTitle
                                  }
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  Participant{" "}
                                  {
                                    request.participantId
                                  }{" "}
                                  · Attempt #
                                  {
                                    request.attemptNumber
                                  }{" "}
                                  ·{" "}
                                  {
                                    request.percentage
                                  }
                                  %
                                </p>
                              </div>

                              <span
                                className={`
                                  inline-flex
                                  w-fit
                                  rounded-full
                                  border
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-bold
                                  ${getRequestStatusClass(
                                    request.status,
                                  )}
                                `}
                              >
                                {
                                  request.status
                                }
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          CREATE / EDIT ASSESSMENT MODAL
      ===================================================== */}

      {showAssessmentModal && (
        <WrittenAssessmentModal
          batchId={
            selectedBatchId
          }
          assessment={
            selectedAssessment
          }
          onClose={
            handleCloseAssessmentModal
          }
          onSaved={
            handleAssessmentSaved
          }
        />
      )}

      {/* =====================================================
          QUESTION MANAGEMENT MODAL
      ===================================================== */}

      {showQuestionsModal &&
      selectedQuestionsAssessment !==
        null ? (
        <WrittenAssessmentQuestionsModal
          assessment={
            selectedQuestionsAssessment
          }
          onClose={
            handleCloseQuestionsModal
          }
          onChanged={
            handleQuestionsChanged
          }
        />
      ) : null}
    </div>
  );
}