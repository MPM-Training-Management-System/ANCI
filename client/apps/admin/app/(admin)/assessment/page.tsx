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
  PracticalAssessment,
} from "@repo/types";

import {
  trainingBatchApi,
  writtenAssessmentApi,
  practicalAssessmentApi,
} from "@/lib/api";

import {
  columns,
  type AdminWrittenAssessment,
} from "./columns";

import WrittenAssessmentModal from "./WrittenAssessmentModal";
import WrittenAssessmentQuestionsModal from "./WrittenAssessmentQuestionsModal";
import PracticalAssessmentModal from "./PracticalAssessmentModal";

import {
  Button,
  DataTable,
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import {
  CircleHelp,
  ClipboardClock,
  FileCheck2,
  FileX2,
  LayoutDashboard,
} from "lucide-react";

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
  // ASSESSMENT TYPE
  // =========================================================

  const [assessmentType, setAssessmentType] =
    useState<"written" | "practical">(
      "written",
    );

  // =========================================================
  // WRITTEN ASSESSMENTS
  // =========================================================

  const [assessments, setAssessments] =
    useState<WrittenAssessment[]>([]);

  const [isLoadingAssessments, setIsLoadingAssessments] =
    useState(false);

  // =========================================================
  // WRITTEN ASSESSMENT MODAL
  // =========================================================

  const [showAssessmentModal, setShowAssessmentModal] =
    useState(false);

  const [selectedAssessment, setSelectedAssessment] =
    useState<WrittenAssessment | null>(null);

  // =========================================================
  // PRACTICAL ASSESSMENTS
  // =========================================================

  const [practicalAssessments, setPracticalAssessments] =
    useState<PracticalAssessment[]>([]);

  const [
    isLoadingPracticalAssessments,
    setIsLoadingPracticalAssessments,
  ] = useState(false);

  const [
    selectedPracticalAssessment,
    setSelectedPracticalAssessment,
  ] = useState<PracticalAssessment | null>(null);

  const [
    showPracticalAssessmentModal,
    setShowPracticalAssessmentModal,
  ] = useState(false);

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
              batch.id ===
              selectedBatchId,
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
  // LOAD WRITTEN ASSESSMENTS
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
  // LOAD PRACTICAL ASSESSMENTS
  // =========================================================

  const loadPracticalAssessments =
    useCallback(
      async () => {
        if (!selectedBatchId) {
          setPracticalAssessments([]);
          return;
        }

        try {
          setIsLoadingPracticalAssessments(
            true,
          );

          setError(null);

          const data =
            await practicalAssessmentApi.getAll();

          const filtered =
            data.filter(
              assessment =>
                assessment.trainingBatchId ===
                selectedBatchId,
            );

          setPracticalAssessments(
            filtered,
          );
        } catch (err) {
          console.error(
            "Failed to load practical assessments:",
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load practical assessments.",
          );
        } finally {
          setIsLoadingPracticalAssessments(
            false,
          );
        }
      },
      [selectedBatchId],
    );

  useEffect(() => {
    void loadPracticalAssessments();
  }, [loadPracticalAssessments]);

  // =========================================================
  // LOAD RETAKE REQUESTS
  // =========================================================

  const loadRetakeRequests =
    useCallback(
      async () => {
        try {
          setIsLoadingRetakeRequests(
            true,
          );

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
          setIsLoadingRetakeRequests(
            false,
          );
        }
      },
      [],
    );

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

    setSelectedPracticalAssessment(null);
    setShowPracticalAssessmentModal(
      false,
    );

    setSelectedQuestionsAssessment(
      null,
    );

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

    if (
      assessmentType ===
      "written"
    ) {
      setSelectedAssessment(null);
      setShowAssessmentModal(true);

      return;
    }

    setSelectedPracticalAssessment(
      null,
    );

    setShowPracticalAssessmentModal(
      true,
    );
  };

  // =========================================================
  // EDIT WRITTEN ASSESSMENT
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
  // DELETE WRITTEN ASSESSMENT
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
        setShowQuestionsModal(
          false,
        );

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
  // PUBLISH / UNPUBLISH WRITTEN
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
          item.id ===
          assessment.id
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
  // PUBLISH / UNPUBLISH PRACTICAL
  // =========================================================

  const handlePracticalPublish =
    async (
      assessment: PracticalAssessment,
    ) => {
      try {
        setPublishingId(
          assessment.id,
        );

        setError(null);
        setAlert(null);

        const updated =
          await practicalAssessmentApi.setPublished(
            assessment.id,
            !assessment.isPublished,
          );

        setPracticalAssessments(
          current =>
            current.map(item =>
              item.id ===
              assessment.id
                ? updated
                : item,
            ),
        );

        if (
          selectedPracticalAssessment?.id ===
          assessment.id
        ) {
          setSelectedPracticalAssessment(
            updated,
          );
        }

        setAlert(
          updated.isPublished
            ? "Practical assessment published successfully."
            : "Practical assessment unpublished successfully.",
        );
      } catch (err) {
        console.error(
          "Failed to update practical assessment publication status:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to update practical assessment publication status.",
        );
      } finally {
        setPublishingId(null);
      }
    };

  // =========================================================
  // EDIT PRACTICAL ASSESSMENT
  // =========================================================

  const handleEditPractical =
    (
      assessment: PracticalAssessment,
    ) => {
      setAlert(null);
      setError(null);

      setSelectedPracticalAssessment(
        assessment,
      );

      setShowPracticalAssessmentModal(
        true,
      );
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
  // CLOSE WRITTEN MODAL
  // =========================================================

  const handleCloseAssessmentModal =
    () => {
      setShowAssessmentModal(
        false,
      );

      setSelectedAssessment(
        null,
      );
    };

  // =========================================================
  // CLOSE PRACTICAL MODAL
  // =========================================================

  const handleClosePracticalAssessmentModal =
    () => {
      setShowPracticalAssessmentModal(
        false,
      );

      setSelectedPracticalAssessment(
        null,
      );
    };

  // =========================================================
  // WRITTEN ASSESSMENT SAVED
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
          item.id ===
          saved.id
            ? saved
            : item,
        );
      }

      return [
        ...current,
        saved,
      ];
    });

    setShowAssessmentModal(
      false,
    );

    setSelectedAssessment(
      null,
    );

    setAlert(
      "Written assessment saved successfully.",
    );
  };

  // =========================================================
  // PRACTICAL ASSESSMENT SAVED
  // =========================================================

  const handlePracticalAssessmentSaved =
    (
      saved: PracticalAssessment,
    ) => {
      setPracticalAssessments(
        current => {
          const exists =
            current.some(
              item =>
                item.id ===
                saved.id,
            );

          if (exists) {
            return current.map(
              item =>
                item.id ===
                saved.id
                  ? saved
                  : item,
            );
          }

          return [
            ...current,
            saved,
          ];
        },
      );

      setShowPracticalAssessmentModal(
        false,
      );

      setSelectedPracticalAssessment(
        null,
      );

      setAlert(
        "Practical assessment saved successfully.",
      );
    };

  // =========================================================
  // CLOSE QUESTIONS MODAL
  // =========================================================

  const handleCloseQuestionsModal =
    () => {
      setShowQuestionsModal(
        false,
      );

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

  const handleReviewRetake =
    async (
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

        setRetakeRequests(
          current =>
            current.map(
              item =>
                item.id ===
                request.id
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
        setReviewingRetakeId(
          null,
        );
      }
    };

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    if (
      assessmentType ===
      "practical"
    ) {
      const total =
        practicalAssessments.length;

      const published =
        practicalAssessments.filter(
          item =>
            item.isPublished,
        ).length;

      const drafts =
        total - published;

      const criteria =
        practicalAssessments.reduce(
          (sum, item) =>
            sum +
            (
              item.criteria
                ?.length ?? 0
            ),
          0,
        );

      return {
        total,
        published,
        drafts,
        questions: criteria,
        pendingRetakes: 0,
      };
    }

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
    assessmentType,
    assessments,
    practicalAssessments,
    retakeRequests,
  ]);

  // =========================================================
  // WRITTEN TABLE DATA
  // =========================================================

  const tableData =
    useMemo<
      AdminWrittenAssessment[]
    >(
      () => assessments,
      [assessments],
    );

  // =========================================================
  // CURRENT BATCH
  // =========================================================

  const selectedBatch =
    useMemo(
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

  const getRequestStatusClass =
    (
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
    <div>
      <PageSection
        title="Assessment Management"
        description="Create, manage, publish, and review assessments for your training participants."
        actions={
          <Button
            onClick={handleCreate}
            disabled={
              !selectedBatchId ||
              isLoadingBatches
            }
          >
            <span className="text-lg leading-none">
              +
            </span>

            Create Assessment
          </Button>
        }
      />

      <div className="mx-auto space-y-5 p-2 sm:p-6 lg:p-8">
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
            ASSESSMENT TYPE
        ===================================================== */}

        <div className="flex w-full max-w-xl rounded-2xl border border-[#e7e9ec] bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setAssessmentType(
                "written",
              );

              setAlert(null);
              setError(null);
            }}
            className={`
              flex-1
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              transition
              ${
                assessmentType ===
                "written"
                  ? "bg-[#002b5c] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }
            `}
          >
            Written Assessment
          </button>

          <button
            type="button"
            onClick={() => {
              setAssessmentType(
                "practical",
              );

              setAlert(null);
              setError(null);
            }}
            className={`
              flex-1
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              transition
              ${
                assessmentType ===
                "practical"
                  ? "bg-[#002b5c] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }
            `}
          >
            Practical Assessment
          </button>
        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <StatGrid>
          <StatCard
            title="Overview"
            icon={LayoutDashboard}
            value={stats.total}
            variant="primary"
          />

          <StatCard
            icon={FileCheck2}
            title="Published"
            value={stats.published}
            variant="primary"
          />

          <StatCard
            icon={FileX2}
            title="Unpublished"
            variant="warning"
            value={stats.drafts}
          />

          <StatCard
            icon={CircleHelp}
            title={
              assessmentType ===
              "practical"
                ? "Total Criteria"
                : "Total Questions"
            }
            variant="success"
            value={stats.questions}
          />

          {assessmentType ===
            "written" && (
            <StatCard
              icon={ClipboardClock}
              title="Pending Retakes"
              value={
                stats.pendingRetakes
              }
              variant="primary"
            />
          )}
        </StatGrid>

        {/* =====================================================
            WRITTEN ASSESSMENTS
        ===================================================== */}

        {assessmentType ===
        "written" ? (
          <DataTable
            toolbar={
              <select
                value={
                  selectedBatchId
                }
                disabled={
                  isLoadingBatches
                }
                onChange={event =>
                  handleBatchChange(
                    event.target
                      .value,
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

                {batches.map(
                  batch => (
                    <option
                      key={
                        batch.id
                      }
                      value={
                        batch.id
                      }
                    >
                      {
                        batch.batchCode
                      }
                    </option>
                  ),
                )}
              </select>
            }
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
        ) : (
          /* =====================================================
             PRACTICAL ASSESSMENTS
          ===================================================== */

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
            {/* HEADER */}

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
                    Practical Evaluation
                  </p>

                  <h2
                    className="
                      mt-1
                      text-xl
                      font-bold
                      tracking-tight
                      text-[#111827]
                    "
                  >
                    Practical Assessments
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Create and manage practical
                    assessments and evaluation criteria
                    for participants.
                  </p>
                </div>

                <select
                  value={
                    selectedBatchId
                  }
                  disabled={
                    isLoadingBatches
                  }
                  onChange={event =>
                    handleBatchChange(
                      event.target
                        .value,
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
                    sm:w-[280px]
                  "
                >
                  <option value="">
                    Select a training batch
                  </option>

                  {batches.map(
                    batch => (
                      <option
                        key={
                          batch.id
                        }
                        value={
                          batch.id
                        }
                      >
                        {
                          batch.batchCode
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* CONTENT */}

            <div className="p-4 sm:p-6">
              {isLoadingPracticalAssessments ? (
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
                    Loading practical
                    assessments
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Please wait a moment.
                  </p>
                </div>
              ) : !selectedBatchId ? (
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
                    !
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-[#111827]">
                    Select a training batch
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-400">
                    Select a training batch above
                    before creating or managing
                    practical assessments.
                  </p>
                </div>
              ) : practicalAssessments.length ===
                0 ? (
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
                    +
                  </div>

                  <h3
                    className="
                      mt-4
                      text-sm
                      font-bold
                      text-[#111827]
                    "
                  >
                    No practical assessments
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
                    This training batch does not
                    have a practical assessment yet.
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleCreate
                    }
                    className="
                      mt-5
                      rounded-xl
                      bg-[#002b5c]
                      px-5
                      py-2.5
                      text-xs
                      font-bold
                      text-white
                      transition
                      hover:bg-[#001f43]
                    "
                  >
                    Create Practical Assessment
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {practicalAssessments.map(
                    assessment => {
                      const isPublishing =
                        publishingId ===
                        assessment.id;

                      return (
                        <div
                          key={
                            assessment.id
                          }
                          className="
                            overflow-hidden
                            rounded-2xl
                            border
                            border-[#e7e9ec]
                            bg-white
                            transition
                            hover:border-[#cfd5dc]
                            hover:shadow-sm
                          "
                        >
                          <div
                            className="
                              flex
                              flex-col
                              gap-5
                              p-5
                              lg:flex-row
                              lg:items-center
                              lg:justify-between
                            "
                          >
                            {/* LEFT */}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className="
                                    text-sm
                                    font-bold
                                    text-[#111827]
                                  "
                                >
                                  {
                                    assessment.title
                                  }
                                </h3>

                                <span
                                  className={`
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-bold
                                    ${
                                      assessment.isPublished
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-gray-100 text-gray-500"
                                    }
                                  `}
                                >
                                  {assessment.isPublished
                                    ? "Published"
                                    : "Draft"}
                                </span>
                              </div>

                              {assessment.description && (
                                <p
                                  className="
                                    mt-1
                                    max-w-2xl
                                    text-xs
                                    leading-5
                                    text-gray-500
                                  "
                                >
                                  {
                                    assessment.description
                                  }
                                </p>
                              )}

                              <div
                                className="
                                  mt-4
                                  grid
                                  grid-cols-2
                                  gap-2
                                  sm:grid-cols-3
                                "
                              >
                                <div
                                  className="
                                    rounded-xl
                                    border
                                    border-[#eef0f2]
                                    bg-[#fafafa]
                                    px-3
                                    py-2.5
                                  "
                                >
                                  <p
                                    className="
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      tracking-wide
                                      text-gray-400
                                    "
                                  >
                                    Passing
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      font-bold
                                      text-gray-800
                                    "
                                  >
                                    {
                                      assessment.passingPercentage
                                    }
                                    %
                                  </p>
                                </div>

                                <div
                                  className="
                                    rounded-xl
                                    border
                                    border-[#eef0f2]
                                    bg-[#fafafa]
                                    px-3
                                    py-2.5
                                  "
                                >
                                  <p
                                    className="
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      tracking-wide
                                      text-gray-400
                                    "
                                  >
                                    Criteria
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      font-bold
                                      text-gray-800
                                    "
                                  >
                                    {
                                      assessment
                                        .criteria
                                        ?.length ??
                                      0
                                    }
                                  </p>
                                </div>

                                <div
                                  className="
                                    rounded-xl
                                    border
                                    border-[#eef0f2]
                                    bg-[#fafafa]
                                    px-3
                                    py-2.5
                                  "
                                >
                                  <p
                                    className="
                                      text-[10px]
                                      font-semibold
                                      uppercase
                                      tracking-wide
                                      text-gray-400
                                    "
                                  >
                                    Batch
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      truncate
                                      text-sm
                                      font-bold
                                      text-gray-800
                                    "
                                  >
                                    {
                                      selectedBatch
                                        ?.batchCode ??
                                      "-"
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* ACTIONS */}

                            <div
                              className="
                                flex
                                shrink-0
                                flex-col
                                gap-2
                                border-t
                                border-[#eef0f2]
                                pt-4
                                sm:flex-row
                                lg:w-[210px]
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
                                  handleEditPractical(
                                    assessment,
                                  )
                                }
                                className="
                                  flex
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  border-[#dfe3e8]
                                  bg-white
                                  px-4
                                  py-2.5
                                  text-xs
                                  font-bold
                                  text-gray-700
                                  transition
                                  hover:bg-gray-50
                                "
                              >
                                Edit Assessment
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handlePracticalPublish(
                                    assessment,
                                  )
                                }
                                disabled={
                                  isPublishing
                                }
                                className="
                                  flex
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-[#002b5c]
                                  px-4
                                  py-2.5
                                  text-xs
                                  font-bold
                                  text-white
                                  transition
                                  hover:bg-[#001f43]
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                {isPublishing
                                  ? "Processing..."
                                  : assessment.isPublished
                                    ? "Unpublish"
                                    : "Publish"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            RETAKE REQUESTS
            WRITTEN ASSESSMENT ONLY
        ===================================================== */}

        {assessmentType ===
          "written" && (
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
                        pendingRequests.length >
                        0
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

                      {pendingRequests.length >
                        0 && (
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
                          {
                            pendingRequests.length
                          }{" "}
                          new
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
                      requesting another assessment
                      attempt.
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
              ) : retakeRequests.length ===
                0 ? (
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

                  {pendingRequests.length >
                    0 && (
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
                              key={
                                request.id
                              }
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
                                            {
                                              request.participantId
                                            }
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
                                          {
                                            request.assessmentTitle
                                          }
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
                                          {
                                            request.reason
                                          }
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
                            .map(
                              request => (
                                <div
                                  key={
                                    request.id
                                  }
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
                              ),
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* =====================================================
          WRITTEN ASSESSMENT MODAL
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
          PRACTICAL ASSESSMENT MODAL
      ===================================================== */}

      {showPracticalAssessmentModal && (
        <PracticalAssessmentModal
          batchId={
            selectedBatchId
          }
          assessment={
            selectedPracticalAssessment
          }
          onClose={
            handleClosePracticalAssessmentModal
          }
          onSaved={
            handlePracticalAssessmentSaved
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