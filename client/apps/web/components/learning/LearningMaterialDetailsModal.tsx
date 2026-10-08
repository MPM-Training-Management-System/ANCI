"use client";

import { useEffect, useState } from "react";

import type {
  LearningMaterial,
  LearningModule,
  LearningSection,
  TrainingBatch,
} from "@repo/types";

interface LearningMaterialDetailsModalProps {
  open: boolean;

  material: LearningMaterial | null;

  modules: LearningModule[];

  sections: LearningSection[];

  batchMap: Map<string, TrainingBatch>;

  /*
   * ============================================================
   * MANAGE MODULE
   * ============================================================
   *
   * Kapag may module ID dito, automatic na bubuksan
   * ang Manage Module modal para sa specific module.
   */
  initialManagedModuleId?: string | null;

  onManageModuleClose?: () => void;

  /*
   * ============================================================
   * EXTRACTION
   * ============================================================
   */
  moduleFileExtraction: {
    learningModuleFileId: string;
    learningModuleId: string;
    fileName: string | null;
    contentType: string | null;
    text: string;
    characterCount: number;
    pageCount: number;
  } | null;

  /*
   * ============================================================
   * STATES
   * ============================================================
   */
  isUploading: boolean;

  isGenerating: boolean;

  isExtracting: boolean;

  generatingModuleId: string | null;

  /*
   * ============================================================
   * ACTIONS
   * ============================================================
   */
  onUploadModuleFile: (
    moduleId: string,
    file: File,
  ) => void;

  onExtractModuleFile: (
    moduleId: string,
    moduleFileId: string,
  ) => void;

  onExtractAllModuleFiles: (
    moduleId: string,
  ) => void;

  onGenerateModules: () => void;

  onGenerateModule: (
    moduleId: string,
  ) => void;

  onLoadSections: (
    module: LearningModule,
  ) => void;

  onCreateSection: (
    module: LearningModule,
  ) => void;

  onEditModule: (
    module: LearningModule,
  ) => void;

  onEditSection: (
    section: LearningSection,
  ) => void;

  onDeleteModule: (
    module: LearningModule,
  ) => void;

  onDeleteSection: (
    section: LearningSection,
  ) => void;

  onClearModuleFileExtraction: () => void;

  onViewModule: (
    module: LearningModule,
  ) => void;

  onClose: () => void;
}

export default function LearningMaterialDetailsModal({
  open,
  material,
  modules,
  sections,
  batchMap,

  initialManagedModuleId,
  onManageModuleClose,

  moduleFileExtraction,

  isUploading,
  isGenerating,
  isExtracting,

  generatingModuleId,

  onUploadModuleFile,
  onExtractModuleFile,
  onExtractAllModuleFiles,
  onGenerateModules,
  onGenerateModule,
  onLoadSections,
  onCreateSection,
  onEditModule,
  onEditSection,
  onDeleteModule,
  onDeleteSection,
  onClearModuleFileExtraction,
  onViewModule,

  onClose,
}: LearningMaterialDetailsModalProps) {
  /*
   * ============================================================
   * MANAGED MODULE
   * ============================================================
   */
  const [managedModuleId, setManagedModuleId] =
    useState<string | null>(null);

  /*
   * ============================================================
   * EXTRACTED FILE IDS
   * ============================================================
   */
  const [
    extractedModuleFileIds,
    setExtractedModuleFileIds,
  ] = useState<Set<string>>(new Set());

  /*
   * ============================================================
   * CURRENTLY EXTRACTING FILE
   * ============================================================
   */
  const [
    extractingFileId,
    setExtractingFileId,
  ] = useState<string | null>(null);

  /*
   * ============================================================
   * SET MANAGED MODULE FROM PARENT
   * ============================================================
   *
   * Ito ang ginagamit ng Trainer Learning table.
   *
   * Table:
   *
   * Manage
   *   ↓
   * initialManagedModuleId
   *   ↓
   * Manage Module modal
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialManagedModuleId) {
      return;
    }

    const moduleExists = modules.some(
      (module) =>
        module.id === initialManagedModuleId,
    );

    if (!moduleExists) {
      return;
    }

    setManagedModuleId(
      initialManagedModuleId,
    );
  }, [
    open,
    initialManagedModuleId,
    modules,
  ]);

  /*
   * ============================================================
   * GET MANAGED MODULE
   * ============================================================
   */
  const managedModule =
    modules.find(
      (module) =>
        module.id === managedModuleId,
    ) ?? null;

  /*
   * ============================================================
   * GET SECTIONS OF MANAGED MODULE
   * ============================================================
   */
  const managedModuleSections =
    managedModule
      ? sections.filter(
          (section) =>
            section.learningModuleId ===
            managedModule.id,
        )
      : [];

  /*
   * ============================================================
   * GENERATING STATE
   * ============================================================
   */
  const isManagedModuleGenerating =
    managedModule
      ? generatingModuleId ===
        managedModule.id
      : false;

  /*
   * ============================================================
   * SYNC EXTRACTION
   * ============================================================
   */
  useEffect(() => {
    if (
      !moduleFileExtraction ||
      !moduleFileExtraction.learningModuleFileId
    ) {
      return;
    }

    if (
      !moduleFileExtraction.text?.trim()
    ) {
      return;
    }

    setExtractedModuleFileIds(
      (previous) => {
        const next = new Set(previous);

        next.add(
          moduleFileExtraction.learningModuleFileId,
        );

        return next;
      },
    );

    setExtractingFileId(null);
  }, [moduleFileExtraction]);

  /*
   * ============================================================
   * RESET EXTRACTION WHEN MODULE CHANGES
   * ============================================================
   */
  useEffect(() => {
    setExtractedModuleFileIds(
      new Set(),
    );

    setExtractingFileId(null);

    if (!managedModuleId) {
      onClearModuleFileExtraction();
    }
  }, [
    managedModuleId,
    onClearModuleFileExtraction,
  ]);

  /*
   * ============================================================
   * EXTRACT FILE
   * ============================================================
   */
  const handleExtractModuleFile = (
    moduleId: string,
    moduleFileId: string,
  ) => {
    setExtractingFileId(
      moduleFileId,
    );

    onExtractModuleFile(
      moduleId,
      moduleFileId,
    );
  };

  /*
   * ============================================================
   * CLEAR EXTRACTION
   * ============================================================
   */
  const handleClearExtraction = () => {
    if (
      moduleFileExtraction
        ?.learningModuleFileId
    ) {
      const fileId =
        moduleFileExtraction.learningModuleFileId;

      setExtractedModuleFileIds(
        (previous) => {
          const next = new Set(
            previous,
          );

          next.delete(fileId);

          return next;
        },
      );
    }

    setExtractingFileId(null);

    onClearModuleFileExtraction();
  };

  /*
   * ============================================================
   * CHECK IF AI GENERATION IS AVAILABLE
   * ============================================================
   *
   * Required:
   *
   * 1. Module exists
   * 2. May source file
   * 3. At least one source file extracted
   */
  const hasExtractedModuleContent =
    managedModule !== null &&
    managedModule.files.length > 0 &&
    managedModule.files.some(
      (file) =>
        extractedModuleFileIds.has(
          file.id,
        ),
    );

  /*
   * ============================================================
   * VIEW MODULE
   * ============================================================
   */
  const handleViewModule = (
    module: LearningModule,
  ) => {
    onLoadSections(module);

    onViewModule(module);
  };

  /*
   * ============================================================
   * CLOSE MANAGE MODAL
   * ============================================================
   */
  const closeManageModal = () => {
    setManagedModuleId(null);

    setExtractedModuleFileIds(
      new Set(),
    );

    setExtractingFileId(null);

    onClearModuleFileExtraction();

    onManageModuleClose?.();
  };

  /*
   * ============================================================
   * CLOSE
   * ============================================================
   */
  const handleClose = () => {
    setManagedModuleId(null);

    setExtractedModuleFileIds(
      new Set(),
    );

    setExtractingFileId(null);

    onClearModuleFileExtraction();

    onManageModuleClose?.();

    onClose();
  };

  /*
   * ============================================================
   * MODAL GUARD
   * ============================================================
   */
  if (
    !open ||
    !material ||
    !managedModule
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-800 flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-2xl">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="shrink-0 border-b border-[#e7e9ec] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white">
                {managedModule.moduleNumber}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  Manage Module
                </p>

                <h2 className="mt-1 truncate text-lg font-bold text-gray-900">
                  {managedModule.title}
                </h2>

                {managedModule.description && (
                  <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-gray-500">
                    {managedModule.description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={closeManageModal}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            >
              ×
            </button>
          </div>
        </div>

        {/* =====================================================
            BODY
        ===================================================== */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="space-y-4">
            {/* =================================================
                MODULE ACTIONS
            ================================================= */}
            <section className="rounded-xl border border-[#e7e9ec] bg-white p-4">
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Module Actions
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Manage this module and its
                  learning content.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* VIEW MODULE */}
                <button
                  type="button"
                  onClick={() =>
                    handleViewModule(
                      managedModule,
                    )
                  }
                  className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-blue-700"
                >
                  View Module
                </button>

                {/* ADD SECTION */}
                <button
                  type="button"
                  onClick={() =>
                    onCreateSection(
                      managedModule,
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  + Add Section
                </button>

                {/* GENERATE AI */}
                <button
                  type="button"
                  onClick={() =>
                    onGenerateModule(
                      managedModule.id,
                    )
                  }
                  disabled={
                    isGenerating ||
                    isManagedModuleGenerating ||
                    !hasExtractedModuleContent
                  }
                  title={
                    !hasExtractedModuleContent
                      ? "Extract the source file first."
                      : "Generate AI content"
                  }
                  className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition ${
                    hasExtractedModuleContent
                      ? "bg-[#191c1e] text-white hover:opacity-90"
                      : "cursor-not-allowed bg-gray-200 text-gray-400"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isManagedModuleGenerating
                    ? "Generating..."
                    : !hasExtractedModuleContent
                      ? "Extract Source First"
                      : "Generate AI"}
                </button>

                {/* EDIT MODULE */}
                <button
                  type="button"
                  onClick={() =>
                    onEditModule(
                      managedModule,
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Edit Module
                </button>

                {/* DELETE MODULE */}
                <button
                  type="button"
                  onClick={() =>
                    onDeleteModule(
                      managedModule,
                    )
                  }
                  className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Delete Module
                </button>
              </div>

              {/* EXTRACTION STATUS */}
              <div className="mt-4">
                {hasExtractedModuleContent ? (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      ✓
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-emerald-700">
                        Source extraction complete
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-emerald-600">
                        The extracted content is
                        ready. Generate AI is now
                        available.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                      !
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-amber-700">
                        Source extraction required
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-amber-600">
                        Extract at least one source
                        file before using Generate
                        AI.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                SOURCE FILES
            ================================================= */}
            <section className="rounded-xl border border-[#e7e9ec] bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Module Source Files
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Upload and extract source files
                    used for AI generation.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* UPLOAD */}
                  <label className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50">
                    + Upload Source

                    <input
                      type="file"
                      className="hidden"
                      disabled={isUploading}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0];

                        if (!file) {
                          return;
                        }

                        onUploadModuleFile(
                          managedModule.id,
                          file,
                        );

                        event.target.value = "";
                      }}
                    />
                  </label>

                  {/* EXTRACT ALL */}
                  {managedModule.files
                    .length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onExtractAllModuleFiles(
                          managedModule.id,
                        )
                      }
                      disabled={isExtracting}
                      className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isExtracting
                        ? "Extracting..."
                        : "Extract All"}
                    </button>
                  )}
                </div>
              </div>

              {/* FILE LIST */}
              <div className="mt-4 space-y-3">
                {managedModule.files
                  .length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-[#f8f9fa] p-6 text-center">
                    <p className="text-xs font-semibold text-gray-600">
                      No source files
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Upload a PDF, DOCX, PPTX,
                      or text file.
                    </p>
                  </div>
                ) : (
                  managedModule.files.map(
                    (file) => {
                      const isFileExtracted =
                        extractedModuleFileIds.has(
                          file.id,
                        );

                      const isCurrentlyExtracting =
                        extractingFileId ===
                          file.id &&
                        isExtracting;

                      const isCurrentlyViewed =
                        moduleFileExtraction
                          ?.learningModuleFileId ===
                        file.id;

                      return (
                        <div
                          key={file.id}
                          className={`rounded-xl border p-4 transition ${
                            isFileExtracted
                              ? "border-emerald-200 bg-emerald-50/40"
                              : "border-[#e7e9ec] bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            {/* FILE INFO */}
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold ${
                                  isFileExtracted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {isFileExtracted
                                  ? "✓"
                                  : "FILE"}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-gray-800">
                                  {file.fileName}
                                </p>

                                <p className="mt-1 text-[9px] text-gray-400">
                                  {file.contentType ||
                                    "Unknown file type"}
                                </p>
                              </div>
                            </div>

                            {/* FILE ACTIONS */}
                            <div className="flex flex-wrap gap-2">
                              {/* EXTRACT */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleExtractModuleFile(
                                    managedModule.id,
                                    file.id,
                                  )
                                }
                                disabled={
                                  isExtracting ||
                                  isFileExtracted
                                }
                                className={`rounded-lg px-4 py-2 text-[10px] font-semibold transition ${
                                  isFileExtracted
                                    ? "cursor-default bg-emerald-100 text-emerald-700"
                                    : "bg-[#191c1e] text-white hover:opacity-90"
                                } disabled:cursor-not-allowed disabled:opacity-70`}
                              >
                                {isCurrentlyExtracting
                                  ? "Extracting..."
                                  : isFileExtracted
                                    ? "✓ Extracted"
                                    : "Extract"}
                              </button>

                              {/* EXTRACTION STATUS */}
                              {isFileExtracted && (
                                <span className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[10px] font-semibold text-emerald-700">
                                  {isCurrentlyViewed
                                    ? "Viewing"
                                    : "Extracted"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* EXTRACTION SUCCESS */}
                          {isFileExtracted && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                                ✓
                              </span>

                              <span className="text-[10px] font-semibold text-emerald-700">
                                File successfully
                                extracted
                              </span>
                            </div>
                          )}

                          {/* EXTRACTION CONTENT */}
                          {isCurrentlyViewed &&
                            moduleFileExtraction.text && (
                              <div className="mt-3 overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50">
                                <div className="flex flex-col gap-2 border-b border-blue-100 bg-white/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                                        ✓
                                      </span>

                                      <p className="text-[10px] font-bold text-blue-900">
                                        Extracted Content
                                      </p>
                                    </div>

                                    <p className="mt-1 text-[9px] text-blue-600">
                                      {
                                        moduleFileExtraction.characterCount
                                      }{" "}
                                      characters •{" "}
                                      {
                                        moduleFileExtraction.pageCount
                                      }{" "}
                                      pages
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={
                                      handleClearExtraction
                                    }
                                    className="self-start rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-gray-500 transition hover:bg-gray-50"
                                  >
                                    Clear
                                  </button>
                                </div>

                                <div className="max-h-72 overflow-y-auto bg-white p-4">
                                  <pre className="whitespace-pre-wrap break-words text-[10px] leading-5 text-gray-600">
                                    {
                                      moduleFileExtraction.text
                                    }
                                  </pre>
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    },
                  )
                )}
              </div>
            </section>

            {/* =================================================
                LEARNING SECTIONS
            ================================================= */}
            <section className="rounded-xl border border-[#e7e9ec] bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Learning Sections
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Manage the sections of this
                    module.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onCreateSection(
                      managedModule,
                    )
                  }
                  className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90"
                >
                  + Add Section
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {managedModuleSections.length ===
                0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-[#f8f9fa] p-6 text-center">
                    <p className="text-xs font-semibold text-gray-600">
                      No sections yet
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Add a section or generate the
                      module content using AI.
                    </p>
                  </div>
                ) : (
                  managedModuleSections.map(
                    (section, index) => (
                      <div
                        key={section.id}
                        className="rounded-xl border border-[#e7e9ec] bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[9px] font-bold text-gray-500">
                              {index + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800">
                                {section.title}
                              </p>

                              {section.content && (
                                <p className="mt-1 text-[10px] leading-5 text-gray-500">
                                  {section.content}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onEditSection(
                                  section,
                                )
                              }
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[9px] font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onDeleteSection(
                                  section,
                                )
                              }
                              className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[9px] font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </section>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="shrink-0 border-t border-[#e7e9ec] bg-white px-5 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={closeManageModal}
              className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Back
            </button>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* GENERATE AI CONTENT */}
              <button
                type="button"
                onClick={
                  onGenerateModules
                }
                disabled={
                  isGenerating ||
                  !hasExtractedModuleContent
                }
                title={
                  !hasExtractedModuleContent
                    ? "Extract source content first."
                    : "Generate module content"
                }
                className={`rounded-xl px-5 py-3 text-xs font-semibold transition ${
                  hasExtractedModuleContent
                    ? "bg-[#191c1e] text-white hover:opacity-90"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isGenerating
                  ? "Generating..."
                  : !hasExtractedModuleContent
                    ? "Extract Source First"
                    : "Generate AI Content"}
              </button>

              {/* VIEW MODULE */}
              <button
                type="button"
                onClick={() =>
                  onViewModule(
                    managedModule,
                  )
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                View Module
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}