"use client";

import type {
  LearningModule,
  LearningSection,
} from "@repo/types";

import {
  BookOpen,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  ListChecks,
  PlayCircle,
  X,
} from "lucide-react";

interface TrainerModulePreviewModalProps {
  open: boolean;
  module: LearningModule | null;
  sections: LearningSection[];
  onClose: () => void;
}

// ============================================================
// HELPERS
// ============================================================

function parseStringList(
  value: string[] | string | null | undefined,
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed: unknown =
      JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (
          item,
        ): item is string =>
          typeof item === "string",
      );
    }
  } catch {
    // Treat invalid JSON as newline-separated text.
  }

  return value
    .split("\n")
    .map(
      (item) => item.trim(),
    )
    .filter(Boolean);
}

// ============================================================
// CLOUDINARY IMAGE DETECTION
// ============================================================

function isCloudinaryImageUrl(
  url: string,
): boolean {
  try {
    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    const pathname =
      parsed.pathname.toLowerCase();

    return (
      hostname ===
        "res.cloudinary.com" &&
      pathname.includes(
        "/image/upload/",
      )
    );
  } catch {
    return false;
  }
}

// ============================================================
// YOUTUBE URL
// ============================================================

function getYouTubeEmbedUrl(
  url: string,
): string | null {
  try {
    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    // ========================================================
    // youtube.com/watch?v=VIDEO_ID
    // ========================================================

    if (
      hostname ===
        "youtube.com" ||
      hostname ===
        "www.youtube.com" ||
      hostname.endsWith(
        ".youtube.com",
      )
    ) {
      const videoId =
        parsed.searchParams.get(
          "v",
        );

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (
        parsed.pathname.startsWith(
          "/embed/",
        )
      ) {
        return url;
      }
    }

    // ========================================================
    // youtu.be/VIDEO_ID
    // ========================================================

    if (
      hostname ===
        "youtu.be" ||
      hostname.endsWith(
        ".youtu.be",
      )
    ) {
      const videoId =
        parsed.pathname
          .split("/")
          .filter(Boolean)[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================
// MEDIA RENDERER
// ============================================================

function renderMedia(
  mediaUrl: string,
  sectionTitle: string,
) {
  const youtubeUrl =
    getYouTubeEmbedUrl(
      mediaUrl,
    );

  // ==========================================================
  // YOUTUBE
  // ==========================================================

  if (youtubeUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-black">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
            <PlayCircle className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Video
            </p>

            <p className="text-xs text-gray-500">
              Learning resource
            </p>
          </div>
        </div>

        <div className="aspect-video w-full">
          <iframe
            src={youtubeUrl}
            title={`${sectionTitle} video`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // ==========================================================
  // CLOUDINARY IMAGE
  // ==========================================================

  if (
    isCloudinaryImageUrl(
      mediaUrl,
    )
  ) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
            <ImageIcon className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Source Image
            </p>

            <p className="text-xs text-gray-500">
              Visual learning resource
            </p>
          </div>
        </div>

        <div className="flex justify-center bg-gray-50 p-5">
          <img
            src={mediaUrl}
            alt={`Image for ${sectionTitle}`}
            className="max-h-[500px] w-auto max-w-full rounded-lg object-contain shadow-sm"
          />
        </div>
      </div>
    );
  }

  // ==========================================================
  // FALLBACK MEDIA LINK
  // ==========================================================

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#002b5c] hover:underline"
      >
        <FileText className="h-4 w-4" />

        Open media resource
      </a>
    </div>
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function TrainerModulePreviewModal({
  open,
  module,
  sections,
  onClose,
}: TrainerModulePreviewModalProps) {
  if (!open || !module) {
    return null;
  }

  // ==========================================================
  // OBJECTIVES
  // ==========================================================

  const objectives =
    parseStringList(
      module.learningObjectives,
    );

  // ==========================================================
  // KEY TAKEAWAYS
  // ==========================================================

  const keyTakeaways =
    parseStringList(
      module.keyTakeaways,
    );

  // ==========================================================
  // MODULE SECTIONS
  // ==========================================================

  const moduleSections =
    sections
      .filter(
        (section) =>
          section.learningModuleId ===
          module.id,
      )
      .sort(
        (a, b) => {
          const aOrder =
            a.displayOrder ??
            a.sectionNumber;

          const bOrder =
            b.displayOrder ??
            b.sectionNumber;

          return (
            aOrder -
            bOrder
          );
        },
      );

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">

      {/* ======================================================
          MODAL
      ====================================================== */}

      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 bg-white px-6 py-5">

          <div className="min-w-0 flex-1">

            {/* MODULE LABEL */}

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef4f9] text-[#002b5c]">
                <BookOpen className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                  Learning Module
                </p>

                <p className="text-xs font-medium text-[#002b5c]">
                  Module{" "}
                  {
                    module.moduleNumber
                  }
                </p>
              </div>

            </div>

            {/* TITLE */}

            <h2 className="truncate pr-4 text-xl font-semibold text-gray-900">
              {module.title}
            </h2>

            {/* DESCRIPTION */}

            {module.description && (
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-gray-500">
                {
                  module.description
                }
              </p>
            )}

          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close module preview"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="flex-1 overflow-y-auto bg-[#f8fafc]">

          <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-6">

            {/* ==================================================
                MODULE OVERVIEW
            ================================================== */}

            <div className="grid gap-3 sm:grid-cols-3">

              {/* MODULE */}

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
                    <BookOpen className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Module
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      #
                      {
                        module.moduleNumber
                      }
                    </p>
                  </div>

                </div>
              </div>

              {/* SECTIONS */}

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Sections
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      {
                        moduleSections.length
                      }
                    </p>
                  </div>

                </div>
              </div>

              {/* OBJECTIVES */}

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
                    <ListChecks className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                      Objectives
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      {
                        objectives.length
                      }
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* ==================================================
                WELCOME
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">

              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
                  <BookOpen className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Welcome
                  </h3>

                  <p className="text-xs text-gray-500">
                    Introduction to this module
                  </p>
                </div>

              </div>

              <div className="px-5 py-5">

                {module.welcomeContent ? (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                    {
                      module.welcomeContent
                    }
                  </div>
                ) : (
                  <EmptyContent text="No welcome content has been generated yet." />
                )}

              </div>

            </section>

            {/* ==================================================
                LEARNING OBJECTIVES
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">

              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
                  <ListChecks className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Learning Objectives
                  </h3>

                  <p className="text-xs text-gray-500">
                    What participants should learn
                  </p>
                </div>

              </div>

              <div className="p-5">

                {objectives.length >
                0 ? (
                  <div className="grid gap-3">

                    {objectives.map(
                      (
                        objective,
                        index,
                      ) => (
                        <div
                          key={`${module.id}-objective-${index}`}
                          className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >

                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#002b5c] text-white">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>

                          <p className="text-sm leading-6 text-gray-700">
                            {
                              objective
                            }
                          </p>

                        </div>
                      ),
                    )}

                  </div>
                ) : (
                  <EmptyContent text="No learning objectives have been generated yet." />
                )}

              </div>

            </section>

            {/* ==================================================
                LEARNING SECTIONS
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">

              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
                  <FileText className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Learning Sections
                  </h3>

                  <p className="text-xs text-gray-500">
                    Main content of the module
                  </p>
                </div>

              </div>

              <div className="p-5">

                {moduleSections.length >
                0 ? (
                  <div className="space-y-4">

                    {moduleSections.map(
                      (
                        section,
                        index,
                      ) => (
                        <article
                          key={
                            section.id
                          }
                          className="overflow-hidden rounded-xl border border-gray-200"
                        >

                          {/* SECTION HEADER */}

                          <div className="flex items-start gap-3 bg-gray-50 px-5 py-4">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#002b5c] text-xs font-bold text-white">
                              {index +
                                1}
                            </div>

                            <div className="min-w-0">

                              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                                Section{" "}
                                {
                                  section.sectionNumber
                                }
                              </p>

                              <h4 className="mt-0.5 text-sm font-semibold text-gray-900">
                                {
                                  section.title
                                }
                              </h4>

                            </div>

                          </div>

                          {/* SECTION CONTENT */}

                          <div className="px-5 py-5">

                            {section.content ? (
                              <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                                {
                                  section.content
                                }
                              </div>
                            ) : (
                              <EmptyContent text="No section content available." />
                            )}

                            {/* MEDIA */}

                            {section.mediaUrl && (
                              <div className="mt-5">
                                {renderMedia(
                                  section.mediaUrl,
                                  section.title,
                                )}
                              </div>
                            )}

                          </div>

                        </article>
                      ),
                    )}

                  </div>
                ) : (
                  <EmptyContent text="No learning sections have been generated yet." />
                )}

              </div>

            </section>

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">

              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f9] text-[#002b5c]">
                  <FileText className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Summary
                  </h3>

                  <p className="text-xs text-gray-500">
                    Overview of the module
                  </p>
                </div>

              </div>

              <div className="px-5 py-5">

                {module.summary ? (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                    {
                      module.summary
                    }
                  </div>
                ) : (
                  <EmptyContent text="No summary has been generated yet." />
                )}

              </div>

            </section>

            {/* ==================================================
                KEY TAKEAWAYS
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">

              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff8e8] text-[#a16207]">
                  <Lightbulb className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Key Takeaways
                  </h3>

                  <p className="text-xs text-gray-500">
                    Important points to remember
                  </p>
                </div>

              </div>

              <div className="p-5">

                {keyTakeaways.length >
                0 ? (
                  <div className="grid gap-3">

                    {keyTakeaways.map(
                      (
                        takeaway,
                        index,
                      ) => (
                        <div
                          key={`${module.id}-takeaway-${index}`}
                          className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
                        >

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#002b5c] text-xs font-semibold text-white">
                            {index +
                              1}
                          </div>

                          <p className="text-sm leading-6 text-gray-700">
                            {
                              takeaway
                            }
                          </p>

                        </div>
                      ),
                    )}

                  </div>
                ) : (
                  <EmptyContent text="No key takeaways have been generated yet." />
                )}

              </div>

            </section>

          </div>

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 py-4">

          <div className="hidden text-xs text-gray-400 sm:block">
            Module preview
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#002b5c] px-5 text-sm font-semibold text-white transition hover:bg-[#0d2142]"
          >
            Close Preview
          </button>

        </div>

      </div>
    </div>
  );
}

// ============================================================
// EMPTY CONTENT
// ============================================================

function EmptyContent({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5">
      <p className="text-sm italic text-gray-400">
        {text}
      </p>
    </div>
  );
}