"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  CreateWrittenAssessmentRequest,
  UpdateWrittenAssessmentRequest,
  WrittenAssessment,
} from "@repo/types";

import { writtenAssessmentApi } from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

interface WrittenAssessmentModalProps {
  batchId: string;
  assessment: WrittenAssessment | null;
  onClose: () => void;
  onSaved: (assessment: WrittenAssessment) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export default function WrittenAssessmentModal({
  batchId,
  assessment,
  onClose,
  onSaved,
}: WrittenAssessmentModalProps) {
  const isEditMode = assessment !== null;

  // ==========================================================
  // FORM
  // ==========================================================

  const [title, setTitle] = useState(
    assessment?.title ?? "",
  );

  const [description, setDescription] = useState(
    assessment?.description ?? "",
  );

  const [passingPercentage, setPassingPercentage] =
    useState(
      String(
        assessment?.passingPercentage ?? 75,
      ),
    );

  // ==========================================================
  // STATE
  // ==========================================================

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // ESCAPE
  // ==========================================================

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isSaving, onClose]);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    const trimmedTitle =
      title.trim();

    const trimmedDescription =
      description.trim();

    const parsedPassingPercentage =
      Number(passingPercentage);

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!trimmedTitle) {
      setError(
        "Assessment title is required.",
      );
      return;
    }

    if (trimmedTitle.length > 255) {
      setError(
        "Assessment title must not exceed 255 characters.",
      );
      return;
    }

    if (
      trimmedDescription.length > 2000
    ) {
      setError(
        "Description must not exceed 2000 characters.",
      );
      return;
    }

    if (
      !Number.isInteger(
        parsedPassingPercentage,
      ) ||
      parsedPassingPercentage < 1 ||
      parsedPassingPercentage > 100
    ) {
      setError(
        "Passing percentage must be between 1 and 100.",
      );
      return;
    }

    try {
      setIsSaving(true);

      // ======================================================
      // EDIT
      // ======================================================

      if (isEditMode && assessment) {
        const request: UpdateWrittenAssessmentRequest =
          {
            title: trimmedTitle,
            description:
              trimmedDescription || null,
            passingPercentage:
              parsedPassingPercentage,
          };

        const updated =
          await writtenAssessmentApi.update(
            assessment.id,
            request,
          );

        onSaved(updated);
        onClose();

        return;
      }

      // ======================================================
      // CREATE
      // ======================================================

      const request: CreateWrittenAssessmentRequest =
        {
          trainingBatchId: batchId,
          title: trimmedTitle,
          description:
            trimmedDescription || null,
          passingPercentage:
            parsedPassingPercentage,
        };

      const created =
        await writtenAssessmentApi.create(
          request,
        );

      onSaved(created);
      onClose();
    } catch (err) {
      console.error(
        "Failed to save written assessment:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save written assessment.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/50
        p-4
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          if (!isSaving) {
            onClose();
          }
        }
      }}
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-[#e7e9ec]
            px-6
            py-5
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-gray-400
              "
            >
              Written Assessment
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-[#17191c]
              "
            >
              {isEditMode
                ? "Edit Assessment"
                : "Create Assessment"}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              {isEditMode
                ? "Update the assessment details."
                : "Create a written assessment for this training batch."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="
              ml-4
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-[#dfe2e6]
              text-gray-500
              transition
              hover:bg-gray-50
              hover:text-black
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ×
          </button>
        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-6 py-6"
        >
          {/* ERROR */}

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

          {/* ==================================================
              TITLE
          ================================================== */}

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-semibold
                text-gray-600
              "
            >
              Assessment Title
            </label>

            <input
              type="text"
              value={title}
              maxLength={255}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="e.g. Written Assessment - Module 1"
              disabled={isSaving}
              className="
                w-full
                rounded-xl
                border
                border-[#dfe2e6]
                px-3
                py-2.5
                text-sm
                outline-none
                transition
                focus:border-black
                disabled:bg-gray-50
              "
            />

            <p
              className="
                mt-1
                text-[10px]
                text-gray-400
              "
            >
              {title.length}/255
            </p>
          </div>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-semibold
                text-gray-600
              "
            >
              Description
            </label>

            <textarea
              rows={4}
              value={description}
              maxLength={2000}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Enter assessment instructions or description..."
              disabled={isSaving}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-[#dfe2e6]
                px-3
                py-2.5
                text-sm
                outline-none
                transition
                focus:border-black
                disabled:bg-gray-50
              "
            />

            <p
              className="
                mt-1
                text-[10px]
                text-gray-400
              "
            >
              {description.length}/2000
            </p>
          </div>

          {/* ==================================================
              PASSING PERCENTAGE
          ================================================== */}

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-semibold
                text-gray-600
              "
            >
              Passing Percentage
            </label>

            <div className="relative">
              <input
                type="number"
                min={1}
                max={100}
                value={
                  passingPercentage
                }
                onChange={(event) =>
                  setPassingPercentage(
                    event.target.value,
                  )
                }
                disabled={isSaving}
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#dfe2e6]
                  px-3
                  py-2.5
                  pr-10
                  text-sm
                  outline-none
                  transition
                  focus:border-black
                  disabled:bg-gray-50
                "
              />

              <span
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-gray-400
                "
              >
                %
              </span>
            </div>

            <p
              className="
                mt-1
                text-[10px]
                text-gray-400
              "
            >
              Enter a value from 1 to 100.
            </p>
          </div>

          {/* ==================================================
              BATCH
          ================================================== */}

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-semibold
                text-gray-600
              "
            >
              Training Batch
            </label>

            <div
              className="
                rounded-xl
                border
                border-[#e7e9ec]
                bg-gray-50
                px-3
                py-2.5
                text-sm
                text-gray-600
              "
            >
              {assessment?.batchCode ??
                "Selected training batch"}
            </div>
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className="
              flex
              justify-end
              gap-2
              border-t
              border-[#eef0f2]
              pt-5
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="
                rounded-xl
                border
                border-[#dfe2e6]
                px-4
                py-2.5
                text-xs
                font-semibold
                text-gray-700
                transition
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="
                rounded-xl
                bg-black
                px-5
                py-2.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}