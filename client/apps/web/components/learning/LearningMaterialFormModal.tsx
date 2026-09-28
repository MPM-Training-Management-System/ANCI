"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type {
  LearningMaterial,
  TrainingBatch,
} from "@repo/types";

interface LearningMaterialsFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  material?: LearningMaterial | null;
  batches: TrainingBatch[];
  loading?: boolean;

  onClose: () => void;

  onSubmit: (data: {
    trainingBatchId: string;
    title: string;
    description: string;
    materialType: string;
    file: File | null;
  }) => void;
}

export default function LearningMaterialsFormModal({
  open,
  mode,
  material,
  batches,
  loading = false,
  onClose,
  onSubmit,
}: LearningMaterialsFormModalProps) {
  const [trainingBatchId, setTrainingBatchId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialType, setMaterialType] = useState("Document");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTrainingBatchId(material?.trainingBatchId ?? "");
    setTitle(material?.title ?? "");
    setDescription(material?.description ?? "");
    setMaterialType(material?.materialType ?? "Document");

    // Do not automatically load the old file.
    // Existing file will remain unless the user selects a replacement.
    setFile(null);
  }, [open, material]);

  if (!open) {
    return null;
  }

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    onSubmit({
      trainingBatchId,
      title: title.trim(),
      description: description.trim(),
      materialType,
      file,
    });
  };

  const isCreate = mode === "create";

  const isSubmitDisabled =
    loading ||
    !trainingBatchId ||
    !title.trim() ||
    (isCreate && !file);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Learning Materials
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {isCreate
                ? "Create Learning Material"
                : "Edit Learning Material"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {isCreate
                ? "Add a learning material and upload its source file."
                : "Update the learning material information or replace its file."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {/* Training Batch */}
            <div>
              <label className="text-xs font-semibold text-gray-700">
                Training Batch
              </label>

              <select
                value={trainingBatchId}
                onChange={(event) =>
                  setTrainingBatchId(event.target.value)
                }
                disabled={loading}
                required
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
              >
                <option value="">
                  Select training batch
                </option>

                {batches.map((batch) => (
                  <option
                    key={batch.id}
                    value={batch.id}
                  >
                    {batch.programName} - {batch.batchCode}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                disabled={loading}
                required
                placeholder="Enter learning material title"
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />
            </div>

            {/* Material Type */}
            <div>
              <label className="text-xs font-semibold text-gray-700">
                Material Type
              </label>

              <select
                value={materialType}
                onChange={(event) =>
                  setMaterialType(event.target.value)
                }
                disabled={loading}
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
              >
                <option value="PDF">PDF</option>
                <option value="Presentation">
                  Presentation
                </option>
                <option value="Document">
                  Document
                </option>
                <option value="Video">Video</option>
                <option value="Activity">
                  Activity
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                disabled={loading}
                rows={5}
                placeholder="Enter a description for this learning material"
                className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="text-xs font-semibold text-gray-700">
                Learning Material File
                {isCreate && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
              </label>

              <label
                className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-7 text-center transition ${
                  loading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:border-gray-400 hover:bg-white"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                  ↑
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-700">
                  {file
                    ? file.name
                    : "Click to upload a file"}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {file
                    ? `${(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(2)} MB`
                    : "Upload the source file for this learning material"}
                </p>

                <p className="mt-2 text-[10px] text-gray-400">
                  PDF, DOC, DOCX, PPT, PPTX and other supported files
                </p>

                <input
                  type="file"
                  className="hidden"
                  disabled={loading}
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-700">
                      {file.name}
                    </p>

                    <p className="text-[10px] text-gray-400">
                      {(
                        file.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={loading}
                    className="ml-3 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}

              {mode === "edit" &&
                material?.fileUrl &&
                !file && (
                  <p className="mt-2 text-[10px] text-gray-400">
                    An existing file is already attached.
                    Leave this empty to keep the current
                    file.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : isCreate
                ? "Create Material"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}