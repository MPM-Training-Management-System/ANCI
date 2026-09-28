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
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string",
      );
    }
  } catch {
    // If the value is not valid JSON,
    // treat it as newline-separated text.
  }

  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

// ============================================================
// CLOUDINARY IMAGE DETECTION
// ============================================================

function isCloudinaryImageUrl(
  url: string,
): boolean {
  try {
    const parsed = new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    const pathname =
      parsed.pathname.toLowerCase();

    return (
      hostname === "res.cloudinary.com" &&
      pathname.includes("/image/upload/")
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
    const parsed = new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    // --------------------------------------------------------
    // youtube.com/watch?v=VIDEO_ID
    // --------------------------------------------------------

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {
      const videoId =
        parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // ------------------------------------------------------
      // youtube.com/embed/VIDEO_ID
      // ------------------------------------------------------

      if (
        parsed.pathname.startsWith(
          "/embed/",
        )
      ) {
        return url;
      }
    }

    // --------------------------------------------------------
    // youtu.be/VIDEO_ID
    // --------------------------------------------------------

    if (
      hostname === "youtu.be" ||
      hostname.endsWith(".youtu.be")
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
    getYouTubeEmbedUrl(mediaUrl);

  // ==========================================================
  // YOUTUBE
  // ==========================================================

  if (youtubeUrl) {
    return (
      <div className="overflow-hidden rounded-xl border bg-black">
        <div className="flex items-center gap-2 border-b bg-background px-4 py-3">
          <PlayCircle className="h-4 w-4" />

          <span className="text-sm font-medium">
            Video
          </span>
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
      <div className="overflow-hidden rounded-xl border bg-muted/20">
        <div className="flex items-center gap-2 border-b bg-background px-4 py-3">
          <ImageIcon className="h-4 w-4" />

          <span className="text-sm font-medium">
            Source Image
          </span>
        </div>

        <div className="flex justify-center p-4">
          <img
            src={mediaUrl}
            alt={`Image for ${sectionTitle}`}
            className="max-h-[500px] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      </div>
    );
  }

  // ==========================================================
  // FALLBACK MEDIA LINK
  // ==========================================================

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium underline"
      >
        Open media
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
      .sort((a, b) => {
        const aOrder =
          a.displayOrder ??
          a.sectionNumber;

        const bOrder =
          b.displayOrder ??
          b.sectionNumber;

        return aOrder - bOrder;
      });

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />

              <span>
                Module {module.moduleNumber}
              </span>
            </div>

            <h2 className="mt-1 truncate text-xl font-semibold">
              {module.title}
            </h2>

            {module.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {module.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close module preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-8">
            {/* ================================================== */}
            {/* WELCOME */}
            {/* ================================================== */}

            <section className="rounded-xl border bg-muted/30 p-6">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />

                <h3 className="text-lg font-semibold">
                  Welcome
                </h3>
              </div>

              {module.welcomeContent ? (
                <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {module.welcomeContent}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No welcome content has been
                  generated yet.
                </p>
              )}
            </section>

            {/* ================================================== */}
            {/* LEARNING OBJECTIVES */}
            {/* ================================================== */}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5" />

                <h3 className="text-lg font-semibold">
                  Learning Objectives
                </h3>
              </div>

              {objectives.length > 0 ? (
                <div className="space-y-3">
                  {objectives.map(
                    (
                      objective,
                      index,
                    ) => (
                      <div
                        key={`${module.id}-objective-${index}`}
                        className="flex gap-3 rounded-lg border p-4"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                        <p className="text-sm leading-6">
                          {objective}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No learning objectives have been
                  generated yet.
                </p>
              )}
            </section>

            {/* ================================================== */}
            {/* LEARNING SECTIONS */}
            {/* ================================================== */}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />

                <h3 className="text-lg font-semibold">
                  Learning Sections
                </h3>
              </div>

              {moduleSections.length > 0 ? (
                <div className="space-y-5">
                  {moduleSections.map(
                    (section) => (
                      <article
                        key={section.id}
                        className="rounded-xl border p-6"
                      >
                        {/* SECTION HEADER */}

                        <div className="mb-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Section{" "}
                            {
                              section.sectionNumber
                            }
                          </p>

                          <h4 className="mt-1 text-base font-semibold">
                            {section.title}
                          </h4>
                        </div>

                        {/* SECTION CONTENT */}

                        {section.content ? (
                          <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                            {section.content}
                          </div>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">
                            No section content
                            available.
                          </p>
                        )}

                        {/* ================================================== */}
                        {/* SECTION MEDIA */}
                        {/* ================================================== */}

                        {section.mediaUrl && (
                          <div className="mt-6">
                            {renderMedia(
                              section.mediaUrl,
                              section.title,
                            )}
                          </div>
                        )}
                      </article>
                    ),
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6">
                  <p className="text-sm italic text-muted-foreground">
                    No learning sections have been
                    generated yet.
                  </p>
                </div>
              )}
            </section>

            {/* ================================================== */}
            {/* SUMMARY */}
            {/* ================================================== */}

            <section className="rounded-xl border bg-muted/30 p-6">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />

                <h3 className="text-lg font-semibold">
                  Summary
                </h3>
              </div>

              {module.summary ? (
                <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {module.summary}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No summary has been generated yet.
                </p>
              )}
            </section>

            {/* ================================================== */}
            {/* KEY TAKEAWAYS */}
            {/* ================================================== */}

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />

                <h3 className="text-lg font-semibold">
                  Key Takeaways
                </h3>
              </div>

              {keyTakeaways.length > 0 ? (
                <div className="space-y-3">
                  {keyTakeaways.map(
                    (
                      takeaway,
                      index,
                    ) => (
                      <div
                        key={`${module.id}-takeaway-${index}`}
                        className="flex gap-3 rounded-lg border p-4"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-6">
                          {takeaway}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No key takeaways have been generated
                  yet.
                </p>
              )}
            </section>
          </div>
        </div>

        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

        <div className="flex items-center justify-end border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}