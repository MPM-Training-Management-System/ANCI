"use client";

import type { Service } from "@repo/types";

interface DeleteServiceDialogProps {
  service: Service | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteServiceDialog({
  service,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteServiceDialogProps) {
  if (!service) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          if (!isDeleting) {
            onCancel();
          }
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                Delete Service
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Delete this service?
              </h2>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200 disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="px-6 py-6">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="font-mono text-xs text-gray-400">
              {service.serviceCode}
            </p>

            <p className="mt-1 text-sm font-bold text-gray-800">
              {service.name}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {service.category}
            </p>
          </div>

          <p className="mt-4 text-sm leading-6 text-gray-500">
            This action will permanently delete
            the service and its requirements.
            Make sure this service is no longer
            needed before continuing.
          </p>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Service"}
          </button>
        </div>
      </div>
    </div>
  );
}