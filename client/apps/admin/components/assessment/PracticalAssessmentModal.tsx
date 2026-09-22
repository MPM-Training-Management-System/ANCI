"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  PracticalAssessment,
  CreatePracticalAssessmentRequest,
} from "@repo/types";

import {
  practicalAssessmentApi,
} from "@/lib/api";

interface PracticalAssessmentModalProps {
  batchId: string;

  assessment:
    | PracticalAssessment
    | null;

  onClose: () => void;

  onSaved: (
    assessment: PracticalAssessment,
  ) => void;
}

interface CriterionForm {
  id: string;
  name: string;
  description: string;
  weightPercentage: string;
}

export default function PracticalAssessmentModal({
  batchId,
  assessment,
  onClose,
  onSaved,
}: PracticalAssessmentModalProps) {

  const isEdit =
    assessment !== null;

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [passingPercentage, setPassingPercentage] =
    useState("75");

  const [criteria, setCriteria] =
    useState<CriterionForm[]>([
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        weightPercentage: "25",
      },
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        weightPercentage: "25",
      },
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        weightPercentage: "25",
      },
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        weightPercentage: "25",
      },
    ]);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // =========================================================
  // INITIALIZE EDIT
  // =========================================================

  useEffect(() => {

    if (!assessment) {
      return;
    }

    setTitle(
      assessment.title,
    );

    setDescription(
      assessment.description ?? "",
    );

    setPassingPercentage(
      String(
        assessment.passingPercentage,
      ),
    );

    setCriteria(
      assessment.criteria.map(
        criterion => ({
          id: criterion.id,
          name: criterion.name,
          description:
            criterion.description ?? "",
          weightPercentage:
            String(
              criterion.weightPercentage,
            ),
        }),
      ),
    );

  }, [assessment]);


  // =========================================================
  // WEIGHT TOTAL
  // =========================================================

  const totalWeight =
    useMemo(
      () =>
        criteria.reduce(
          (total, criterion) =>
            total +
            (Number(
              criterion.weightPercentage,
            ) || 0),
          0,
        ),
      [criteria],
    );


  const weightIsValid =
    Math.abs(
      totalWeight - 100,
    ) < 0.01;


  // =========================================================
  // CRITERIA
  // =========================================================

  const addCriterion = () => {

    setCriteria(current => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        description: "",
        weightPercentage: "0",
      },
    ]);
  };


  const removeCriterion = (
    id: string,
  ) => {

    setCriteria(current =>
      current.filter(
        criterion =>
          criterion.id !== id,
      ),
    );
  };


  const updateCriterion = (
    id: string,
    field: keyof CriterionForm,
    value: string,
  ) => {

    setCriteria(current =>
      current.map(
        criterion =>
          criterion.id === id
            ? {
                ...criterion,
                [field]: value,
              }
            : criterion,
      ),
    );
  };


  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {

    event.preventDefault();

    setError(null);


    if (!batchId) {
      setError(
        "Please select a training batch.",
      );
      return;
    }


    if (!title.trim()) {
      setError(
        "Assessment title is required.",
      );
      return;
    }


    if (criteria.length === 0) {
      setError(
        "At least one criterion is required.",
      );
      return;
    }


    const invalidCriterion =
      criteria.find(
        criterion =>
          !criterion.name.trim(),
      );

    if (invalidCriterion) {
      setError(
        "Every criterion must have a name.",
      );
      return;
    }


    if (!weightIsValid) {
      setError(
        `Criterion weights must total 100%. Current total: ${totalWeight}%.`,
      );
      return;
    }


    const passing =
      Number(
        passingPercentage,
      );

    if (
      Number.isNaN(passing) ||
      passing < 0 ||
      passing > 100
    ) {
      setError(
        "Passing percentage must be between 0 and 100.",
      );
      return;
    }


    const request:
      CreatePracticalAssessmentRequest =
      {
        trainingBatchId:
          batchId,

        title:
          title.trim(),

        description:
          description.trim() || null,

        passingPercentage:
          passing,

        criteria:
          criteria.map(
            (
              criterion,
              index,
            ) => ({
              name:
                criterion.name.trim(),

              description:
                criterion.description.trim() ||
                null,

              weightPercentage:
                Number(
                  criterion.weightPercentage,
                ),

              displayOrder:
                index + 1,
            }),
          ),
      };


    try {

      setIsSaving(true);

      const saved =
        isEdit
          ? await practicalAssessmentApi.update(
              assessment.id,
              request,
            )
          : await practicalAssessmentApi.create(
              request,
            );

      onSaved(saved);

    } catch (err) {

      console.error(
        "Failed to save practical assessment:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save practical assessment.",
      );

    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div
      className="
        fixed
        inset-0
        z-99
        flex
        items-center
        justify-center
        bg-black/40
        p-4
      "
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            px-6
            py-5
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
              Practical Assessment
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-[#111827]
              "
            >
              {isEdit
                ? "Edit Assessment"
                : "Create Assessment"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-gray-100
              text-gray-500
              hover:bg-gray-200
            "
          >
            ×
          </button>
        </div>


        {/* BODY */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >

          <div className="flex-1 overflow-y-auto p-6">

            {error && (
              <div
                className="
                  mb-5
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


            {/* BASIC INFORMATION */}

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">
                  Assessment Title
                </label>

                <input
                  value={title}
                  onChange={event =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Practical Skills Assessment"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#111827]
                  "
                />
              </div>


              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={event =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Describe what participants will demonstrate."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#111827]
                  "
                />
              </div>


              <div className="max-w-xs">
                <label className="mb-2 block text-xs font-bold text-gray-700">
                  Passing Percentage
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={
                      passingPercentage
                    }
                    onChange={event =>
                      setPassingPercentage(
                        event.target.value,
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      px-4
                      py-3
                      pr-10
                      text-sm
                      outline-none
                      focus:border-[#111827]
                    "
                  />

                  <span
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      text-gray-400
                    "
                  >
                    %
                  </span>
                </div>
              </div>

            </div>


            {/* CRITERIA */}

            <div className="mt-8">

              <div
                className="
                  mb-4
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-end
                  sm:justify-between
                "
              >
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    Assessment Criteria
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Criterion weights must total
                    100%.
                  </p>
                </div>

                <div
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-bold
                    ${
                      weightIsValid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }
                  `}
                >
                  {totalWeight}% / 100%
                </div>
              </div>


              <div className="space-y-3">

                {criteria.map(
                  (
                    criterion,
                    index,
                  ) => (
                    <div
                      key={criterion.id}
                      className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-gray-50/50
                        p-4
                      "
                    >

                      <div className="mb-3 flex items-center justify-between">

                        <span
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-gray-400
                          "
                        >
                          Criterion {index + 1}
                        </span>

                        {criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeCriterion(
                                criterion.id,
                              )
                            }
                            className="
                              text-xs
                              font-semibold
                              text-red-500
                              hover:text-red-700
                            "
                          >
                            Remove
                          </button>
                        )}

                      </div>


                      <div className="grid gap-3 sm:grid-cols-[1fr_130px]">

                        <input
                          value={
                            criterion.name
                          }
                          onChange={event =>
                            updateCriterion(
                              criterion.id,
                              "name",
                              event.target.value,
                            )
                          }
                          placeholder="Criterion name"
                          className="
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            outline-none
                            focus:border-[#111827]
                          "
                        />


                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                              criterion.weightPercentage
                            }
                            onChange={event =>
                              updateCriterion(
                                criterion.id,
                                "weightPercentage",
                                event.target.value,
                              )
                            }
                            className="
                              w-full
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                              px-4
                              py-3
                              pr-9
                              text-sm
                              outline-none
                              focus:border-[#111827]
                            "
                          />

                          <span
                            className="
                              absolute
                              right-4
                              top-1/2
                              -translate-y-1/2
                              text-xs
                              text-gray-400
                            "
                          >
                            %
                          </span>
                        </div>

                      </div>


                      <textarea
                        value={
                          criterion.description
                        }
                        onChange={event =>
                          updateCriterion(
                            criterion.id,
                            "description",
                            event.target.value,
                          )
                        }
                        rows={2}
                        placeholder="Optional criterion description"
                        className="
                          mt-3
                          w-full
                          resize-none
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          px-4
                          py-3
                          text-xs
                          outline-none
                          focus:border-[#111827]
                        "
                      />

                    </div>
                  ),
                )}

              </div>


              <button
                type="button"
                onClick={addCriterion}
                className="
                  mt-3
                  rounded-xl
                  border
                  border-dashed
                  border-gray-300
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-gray-600
                  transition
                  hover:border-gray-400
                  hover:bg-gray-50
                "
              >
                + Add Criterion
              </button>

            </div>

          </div>


          {/* FOOTER */}

          <div
            className="
              flex
              items-center
              justify-end
              gap-3
              border-t
              border-gray-100
              px-6
              py-4
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="
                rounded-xl
                border
                border-gray-200
                px-5
                py-2.5
                text-sm
                font-semibold
                text-gray-600
                hover:bg-gray-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving ||
                !weightIsValid
              }
              className="
                rounded-xl
                bg-[#111827]
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-black
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Assessment"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}