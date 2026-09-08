"use client";

import {
  useCallback,
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
  TrainingBatch,
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
          item.id ===
          assessment.id
            ? updated
            : item,
        ),
      );

      /*
       * If the question modal is currently
       * open for this assessment, update
       * the selected assessment too.
       */
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
      /*
       * Refresh the assessment list so
       * questionCount stays updated.
       */
      await loadAssessments();
    };

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const total =
      assessments.length;

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
    };
  }, [assessments]);

  // =========================================================
  // TABLE DATA
  // =========================================================

  const tableData =
    useMemo<AdminWrittenAssessment[]>(
      () => assessments,
      [assessments],
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

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
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.1em]
              text-gray-400
            "
          >
            Assessment Management
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              text-[#17191c]
            "
          >
            Written Assessments
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
            "
          >
            Create and manage written
            assessments for training batches.
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
            rounded-xl
            bg-black
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-gray-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          + Create Assessment
        </button>
      </div>

      {/* =====================================================
          ALERT
      ===================================================== */}

      {alert && (
        <div
          className="
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            text-green-700
          "
        >
          {alert}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* =====================================================
          TRAINING BATCH
      ===================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-[#e7e9ec]
          bg-white
          p-5
        "
      >
        <label
          className="
            mb-2
            block
            text-xs
            font-semibold
            text-gray-600
          "
        >
          Training Batch
        </label>

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
            max-w-md
            rounded-xl
            border
            border-[#dfe2e6]
            bg-white
            px-3
            py-2.5
            text-sm
            text-[#17191c]
            outline-none
            focus:border-black
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

      {/* =====================================================
          STATS
      ===================================================== */}

      <StatGrid>
        <StatCard
          title="Total Assessments"
          value={stats.total}
        />

        <StatCard
          title="Published"
          value={stats.published}
        />

        <StatCard
          title="Drafts"
          value={stats.drafts}
        />

        <StatCard
          title="Total Questions"
          value={stats.questions}
        />
      </StatGrid>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-[#e7e9ec]
          bg-white
          p-5
        "
      >
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

        {isLoadingAssessments && (
          <div
            className="
              mt-3
              text-xs
              text-gray-400
            "
          >
            Loading assessments...
          </div>
        )}
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
  selectedQuestionsAssessment !== null ? (
    <WrittenAssessmentQuestionsModal
      assessment={selectedQuestionsAssessment}
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