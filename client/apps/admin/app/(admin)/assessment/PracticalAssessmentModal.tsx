"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import type {
  CreatePracticalAssessmentCriterionRequest,
  CreatePracticalAssessmentRequest,
  PracticalAssessment,
} from "@repo/types";

import { practicalAssessmentApi } from "@/lib/api";

// ============================================================
// TYPES
// ============================================================

type PracticalAssessmentModalProps = {
  batchId: string;
  assessment: PracticalAssessment | null;
  onClose: () => void;
  onSaved: (saved: PracticalAssessment) => void;
};

// ============================================================
// COMPONENT
// ============================================================

export default function PracticalAssessmentModal({
  batchId,
  assessment,
  onClose,
  onSaved,
}: PracticalAssessmentModalProps) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState("75");

  const [criteria, setCriteria] = useState<
    CreatePracticalAssessmentCriterionRequest[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // INITIALIZE FORM
  // ==========================================================

  useEffect(() => {
    if (assessment) {
      setTitle(assessment.title ?? "");
      setDescription(assessment.description ?? "");

      setPassingScore(
        assessment.passingPercentage != null
          ? String(assessment.passingPercentage)
          : "75"
      );

      setCriteria(
        assessment.criteria?.map((criterion) => ({
          name: criterion.name ?? "",
          description: criterion.description ?? "",
          weightPercentage: criterion.weightPercentage ?? 0,
          displayOrder: criterion.displayOrder,
        })) ?? []
      );
    } else {
      setTitle("");
      setDescription("");
      setPassingScore("75");
      setCriteria([]);
    }

    setError("");
  }, [assessment]);

  // ==========================================================
  // ADD CRITERION
  // ==========================================================

  const addCriterion = () => {
    setCriteria((current) => [
      ...current,
      {
        name: "",
        description: "",
        weightPercentage: 0,
        displayOrder: current.length + 1,
      },
    ]);
  };

  // ==========================================================
  // UPDATE CRITERION
  // ==========================================================

  const updateCriterion = (
    index: number,
    field: keyof CreatePracticalAssessmentCriterionRequest,
    value: string | number
  ) => {
    setCriteria((current) =>
      current.map((criterion, criterionIndex) =>
        criterionIndex === index
          ? {
              ...criterion,
              [field]: value,
            }
          : criterion
      )
    );
  };

  // ==========================================================
  // REMOVE CRITERION
  // ==========================================================

  const removeCriterion = (index: number) => {
    setCriteria((current) =>
      current
        .filter((_, criterionIndex) => criterionIndex !== index)
        .map((criterion, criterionIndex) => ({
          ...criterion,
          displayOrder: criterionIndex + 1,
        }))
    );
  };

  // ==========================================================
  // TOTAL WEIGHT
  // ==========================================================

  const totalWeight = criteria.reduce(
    (total, criterion) =>
      total + Number(criterion.weightPercentage || 0),
    0
  );

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSubmit = async () => {
    setError("");

    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    if (!title.trim()) {
      setError("Assessment title is required.");
      return;
    }

    // --------------------------------------------------------
    // PASSING PERCENTAGE
    // --------------------------------------------------------

    if (!passingScore.trim()) {
      setError("Passing percentage is required.");
      return;
    }

    const passingPercentage = Number(passingScore);

    if (
      Number.isNaN(passingPercentage) ||
      passingPercentage < 0 ||
      passingPercentage > 100
    ) {
      setError("Passing percentage must be between 0 and 100.");
      return;
    }

    // --------------------------------------------------------
    // CRITERIA
    // --------------------------------------------------------

    if (criteria.length === 0) {
      setError("At least one assessment criterion is required.");
      return;
    }

    // --------------------------------------------------------
    // VALIDATE CRITERIA
    // --------------------------------------------------------

    const invalidCriterion = criteria.some(
      (criterion) =>
        !criterion.name.trim() ||
        Number(criterion.weightPercentage) <= 0
    );

    if (invalidCriterion) {
      setError(
        "Each criterion must have a name and a weight percentage greater than 0."
      );
      return;
    }

    // --------------------------------------------------------
    // VALIDATE TOTAL WEIGHT
    // --------------------------------------------------------

    const normalizedTotalWeight = Number(totalWeight.toFixed(2));

    if (normalizedTotalWeight !== 100) {
      setError(
        `Criterion weights must total 100%. Current total: ${normalizedTotalWeight}%.`
      );
      return;
    }

    // --------------------------------------------------------
    // PAYLOAD
    // --------------------------------------------------------

    const payload: CreatePracticalAssessmentRequest = {
      trainingBatchId: batchId,
      title: title.trim(),
      description: description.trim() || null,
      passingPercentage,
      criteria: criteria.map((criterion, index) => ({
        name: criterion.name.trim(),
        description: criterion.description?.trim() || null,
        weightPercentage: Number(criterion.weightPercentage),
        displayOrder: index + 1,
      })),
    };

    // --------------------------------------------------------
    // API
    // --------------------------------------------------------

    try {
      setIsSaving(true);

      let saved: PracticalAssessment;

      if (assessment) {
        saved = await practicalAssessmentApi.update(
          assessment.id,
          payload
        );
      } else {
        saved = await practicalAssessmentApi.create(payload);
      }

      onSaved(saved);
      onClose();
    } catch (err) {
      console.error(
        "Failed to save practical assessment:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save practical assessment."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#002b5c]/10">
              <ClipboardCheck
                className="h-5 w-5 text-[#002b5c]"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {assessment
                  ? "Edit Practical Assessment"
                  : "Create Practical Assessment"}
              </h2>

              <p className="text-sm text-gray-500">
                Configure the practical assessment and its
                evaluation criteria.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ================================================== */}
            {/* TITLE */}
            {/* ================================================== */}

            <div>
              <label
                htmlFor="practical-title"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Assessment Title
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="practical-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mediation Simulation"
                disabled={isSaving}
                maxLength={200}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002b5c] focus:ring-2 focus:ring-[#002b5c]/10 disabled:bg-gray-100"
              />
            </div>

            {/* ================================================== */}
            {/* DESCRIPTION */}
            {/* ================================================== */}

            <div>
              <label
                htmlFor="practical-description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Description
              </label>

              <textarea
                id="practical-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Enter a description for this practical assessment."
                disabled={isSaving}
                rows={4}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002b5c] focus:ring-2 focus:ring-[#002b5c]/10 disabled:bg-gray-100"
              />

              <p className="mt-1 text-xs text-gray-500">
                {description.length}/1000 characters
              </p>
            </div>

            {/* ================================================== */}
            {/* PASSING PERCENTAGE */}
            {/* ================================================== */}

            <div className="max-w-xs">
              <label
                htmlFor="practical-passing-score"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Passing Percentage
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  id="practical-passing-score"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={passingScore}
                  onChange={(e) =>
                    setPassingScore(e.target.value)
                  }
                  disabled={isSaving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition focus:border-[#002b5c] focus:ring-2 focus:ring-[#002b5c]/10 disabled:bg-gray-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                  %
                </span>
              </div>
            </div>

            {/* ================================================== */}
            {/* CRITERIA HEADER */}
            {/* ================================================== */}

            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Assessment Criteria
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Add the criteria that trainers will use
                    when evaluating participants.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addCriterion}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002b5c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001f43] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Criterion
                </button>
              </div>

              {/* ================================================== */}
              {/* WEIGHT SUMMARY */}
              {/* ================================================== */}

              <div
                className={`mt-4 flex items-center justify-between rounded-xl border px-4 py-3 ${
                  totalWeight === 100
                    ? "border-green-200 bg-green-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    totalWeight === 100
                      ? "text-green-700"
                      : "text-amber-700"
                  }`}
                >
                  Total Criterion Weight
                </span>

                <span
                  className={`text-sm font-bold ${
                    totalWeight === 100
                      ? "text-green-700"
                      : "text-amber-700"
                  }`}
                >
                  {Number(totalWeight.toFixed(2))}%
                </span>
              </div>

              {/* ================================================== */}
              {/* EMPTY STATE */}
              {/* ================================================== */}

              {criteria.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                  <ClipboardCheck className="mx-auto h-8 w-8 text-gray-400" />

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No assessment criteria yet.
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Click &quot;Add Criterion&quot; to create
                    your first evaluation criterion.
                  </p>
                </div>
              )}

              {/* ================================================== */}
              {/* CRITERIA LIST */}
              {/* ================================================== */}

              {criteria.length > 0 && (
                <div className="mt-4 space-y-4">
                  {criteria.map((criterion, index) => (
                    <div
                      key={`criterion-${index}`}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                    >
                      {/* ---------------------------------------- */}
                      {/* CRITERION HEADER */}
                      {/* ---------------------------------------- */}

                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#002b5c] text-xs font-bold text-white">
                            {index + 1}
                          </div>

                          <span className="text-sm font-bold text-gray-800">
                            Criterion {index + 1}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeCriterion(index)
                          }
                          disabled={isSaving}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Remove criterion"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* ---------------------------------------- */}
                      {/* NAME + WEIGHT */}
                      {/* ---------------------------------------- */}

                      <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                        <div>
                          <label
                            htmlFor={`criterion-name-${index}`}
                            className="mb-2 block text-sm font-semibold text-gray-700"
                          >
                            Criterion Name
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            id={`criterion-name-${index}`}
                            type="text"
                            value={criterion.name}
                            onChange={(e) =>
                              updateCriterion(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Communication Skills"
                            disabled={isSaving}
                            maxLength={200}
                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002b5c] focus:ring-2 focus:ring-[#002b5c]/10 disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`criterion-weight-${index}`}
                            className="mb-2 block text-sm font-semibold text-gray-700"
                          >
                            Weight
                            <span className="ml-1 text-red-500">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <input
                              id={`criterion-weight-${index}`}
                              type="number"
                              min={0}
                              max={100}
                              step={0.01}
                              value={
                                criterion.weightPercentage
                              }
                              onChange={(e) =>
                                updateCriterion(
                                  index,
                                  "weightPercentage",
                                  Number(e.target.value)
                                )
                              }
                              disabled={isSaving}
                              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-[#002b5c] focus:ring-2 focus:ring-[#002b5c]/10 disabled:bg-gray-100"
                            />

                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ---------------------------------------- */}
                      {/* DESCRIPTION */}
                      {/* ---------------------------------------- */}

                      <div className="mt-4">
                        <label
                          htmlFor={`criterion-description-${index}`}
                          className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                          Description
                        </label>

                        <textarea
                          id={`criterion-description-${index}`}
                          value={
                            criterion.description ?? ""
                          }
                          onChange={(e) =>
                            updateCriterion(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Describe what the trainer should look for when evaluating this criterion."
                          disabled={isSaving}
                          rows={3}
                          maxLength={500}
                          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#002b5c] focus:ring-2 focus:ring-[#002b5c]/10 disabled:bg-gray-100"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            (
                              criterion.description ?? ""
                            ).length
                          }
                          /500 characters
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002b5c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#001f43] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {isSaving
              ? "Saving..."
              : assessment
                ? "Save Changes"
                : "Create Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}