"use client";

import { useEffect, useState } from "react";

import type { LearningSection } from "@repo/types";

interface LearningSectionFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  learningModuleId: string;
  section?: LearningSection | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    learningModuleId: string;
    sectionNumber: number;
    title: string;
    contentType: string;
    content: string;
    mediaUrl: string;
    displayOrder: number;
  }) => void;
}

export default function LearningSectionFormModal({
  open,
  mode,
  learningModuleId,
  section,
  loading = false,
  onClose,
  onSubmit,
}: LearningSectionFormModalProps) {
  const [sectionNumber, setSectionNumber] =
    useState("1");

  const [title, setTitle] = useState("");
  const [contentType, setContentType] =
    useState("Text");

  const [content, setContent] =
    useState("");

  const [mediaUrl, setMediaUrl] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState("1");

  useEffect(() => {
    if (!open) {
      return;
    }

    setSectionNumber(
      String(section?.sectionNumber ?? 1),
    );

    setTitle(section?.title ?? "");

    setContentType(
      section?.contentType ?? "Text",
    );

    setContent(
      section?.content ?? "",
    );

    setMediaUrl(
      section?.mediaUrl ?? "",
    );

    setDisplayOrder(
      String(section?.displayOrder ?? 1),
    );
  }, [open, section]);

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onSubmit({
      learningModuleId,
      sectionNumber:
        Number(sectionNumber) || 1,
      title: title.trim(),
      contentType,
      content: content.trim(),
      mediaUrl: mediaUrl.trim(),
      displayOrder:
        Number(displayOrder) || 1,
    });
  }

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-5"
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
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] bg-white px-6 py-5">
          <div className="min-w-0 pr-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
              Learning Section
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-tight">
              {mode === "create"
                ? "Create Learning Section"
                : "Edit Learning Section"}
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-gray-500">
              Add or update the actual learning
              content of this module.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {/* NUMBER + ORDER */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Section Number
                </label>

                <input
                  type="number"
                  min={1}
                  value={sectionNumber}
                  onChange={(event) =>
                    setSectionNumber(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-sm text-gray-700 outline-none focus:border-gray-300 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Display Order
                </label>

                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(event) =>
                    setDisplayOrder(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-sm text-gray-700 outline-none focus:border-gray-300 focus:bg-white"
                />
              </div>
            </div>

            {/* TITLE */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Section Title
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                required
                disabled={loading}
                placeholder="Example: What is Mediation?"
                className="mt-2 h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
              />
            </div>

            {/* CONTENT TYPE */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Content Type
              </label>

              <select
                value={contentType}
                onChange={(event) =>
                  setContentType(
                    event.target.value,
                  )
                }
                disabled={loading}
                className="mt-2 h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-sm text-gray-700 outline-none focus:border-gray-300 focus:bg-white"
              >
                <option value="Text">Text</option>
                <option value="Video">Video</option>
                <option value="Image">Image</option>
              </select>
            </div>

            {/* CONTENT */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Content
              </label>

              <textarea
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value,
                  )
                }
                disabled={loading}
                rows={8}
                placeholder="Enter the learning section content..."
                className="mt-2 w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
              />
            </div>

            {/* MEDIA URL */}
            {contentType !== "Text" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Media URL
                </label>

                <input
                  value={mediaUrl}
                  onChange={(event) =>
                    setMediaUrl(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  placeholder="https://..."
                  className="mt-2 h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef0f2] bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              !title.trim()
            }
            className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : mode === "create"
                ? "Create Section"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}