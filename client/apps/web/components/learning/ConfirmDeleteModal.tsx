"use client";

interface ConfirmDeleteModalProps {
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  title,
  description,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#eef0f2] bg-white px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
              Confirmation
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-tight">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
            !
          </div>

          <p className="mt-5 text-sm leading-6 text-gray-500">
            {description}
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-2 border-t border-[#eef0f2] bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}