"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  LearningModule,
} from "@repo/types";

interface LearningModuleFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  module?: LearningModule | null;
  learningMaterialId: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    learningMaterialId: string;
    moduleNumber: number;
    title: string;
    description: string;
    displayOrder: number;
  }) => void;
}

export default function LearningModuleFormModal({
  open,
  mode,
  module,
  learningMaterialId,
  loading = false,
  onClose,
  onSubmit,
}: LearningModuleFormModalProps) {
  const isCreate =
    mode === "create";

  const [
    moduleNumber,
    setModuleNumber,
  ] = useState("1");

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    displayOrder,
    setDisplayOrder,
  ] = useState("1");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (module && mode === "edit") {
      setModuleNumber(
        String(
          module.moduleNumber ?? 1,
        ),
      );

      setTitle(
        module.title ?? "",
      );

      setDescription(
        module.description ?? "",
      );

      setDisplayOrder(
        String(
          module.displayOrder ?? 1,
        ),
      );

      return;
    }

    setModuleNumber("1");
    setTitle("");
    setDescription("");
    setDisplayOrder("1");
  }, [
    open,
    mode,
    module,
  ]);

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!learningMaterialId) {
      return;
    }

    if (!title.trim()) {
      return;
    }

    onSubmit({
      learningMaterialId,
      moduleNumber:
        Number(moduleNumber) || 1,
      title: title.trim(),
      description:
        description.trim(),
      displayOrder:
        Number(displayOrder) || 1,
    });
  }

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isCreate
              ? "Create Learning Module"
              : "Edit Learning Module"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isCreate
              ? "Create a module for this learning material."
              : "Update the selected learning module."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* MODULE NUMBER */}

          <div>
            <label
              htmlFor="moduleNumber"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Module Number
            </label>

            <input
              id="moduleNumber"
              type="number"
              min={1}
              value={moduleNumber}
              onChange={(event) =>
                setModuleNumber(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              disabled={loading}
            />
          </div>

          {/* TITLE */}

          <div>
            <label
              htmlFor="moduleTitle"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              id="moduleTitle"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Enter module title"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              disabled={loading}
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label
              htmlFor="moduleDescription"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="moduleDescription"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Enter module description"
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              disabled={loading}
            />
          </div>

          {/* DISPLAY ORDER */}

          <div>
            <label
              htmlFor="displayOrder"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Display Order
            </label>

            <input
              id="displayOrder"
              type="number"
              min={1}
              value={displayOrder}
              onChange={(event) =>
                setDisplayOrder(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              disabled={loading}
            />
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !learningMaterialId ||
                !title.trim()
              }
              className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isCreate
                  ? "Create Module"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}