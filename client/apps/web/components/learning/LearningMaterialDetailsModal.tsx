"use client";

import { useState } from "react";

import type {
  LearningMaterial,
  LearningModule,
  LearningSection,
  TrainingBatch,
} from "@repo/types";
import { Plus } from "lucide-react";

interface LearningMaterialDetailsModalProps {
  open: boolean;
  material: LearningMaterial | null;
  modules: LearningModule[];
  sections: LearningSection[];
  batchMap: Map<string, TrainingBatch>;

  extraction: {
    learningMaterialId: string;
    fileName: string;
    contentType: string | null;
    text: string;
    characterCount: number;
    pageCount: number;
  } | null;

  moduleFileExtraction: {
    learningModuleFileId: string;
    learningModuleId: string;
    fileName: string | null;
    contentType: string | null;
    text: string;
    characterCount: number;
    pageCount: number;
  } | null;

  isSaving: boolean;
  isUploading: boolean;
  isGenerating: boolean;
  isExtracting: boolean;

  generatingModuleId: string | null;

  onClose: () => void;

  onPublish: () => void;
  onOpenMaterial: () => void;

  onUploadMaterial: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;

  onExtractMaterial: () => void;

  onGenerateModules: () => void;

  onGenerateModule: (moduleId: string) => void;

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

  onLoadSections: (
    module: LearningModule,
  ) => void;

  onCreateModule: () => void;

  onEditModule: (
    module: LearningModule,
  ) => void;

  onCreateSection: (
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
}

export default function LearningMaterialDetailsModal({
  open,
  material,
  modules,
  sections,
  batchMap,
  extraction,
  moduleFileExtraction,
  isSaving,
  isUploading,
  isGenerating,
  isExtracting,
  generatingModuleId,
  onClose,
  onPublish,
  onOpenMaterial,
  onUploadMaterial,
  onExtractMaterial,
  onGenerateModules,
  onGenerateModule,
  onUploadModuleFile,
  onExtractModuleFile,
  onExtractAllModuleFiles,
  onLoadSections,
  onCreateModule,
  onEditModule,
  onCreateSection,
  onEditSection,
  onDeleteModule,
  onDeleteSection,
  onClearModuleFileExtraction,
  onViewModule,
}: LearningMaterialDetailsModalProps) {
  const [managedModuleId, setManagedModuleId] =
    useState<string | null>(null);

  if (!open || !material) {
    return null;
  }

  const managedModule =
    modules.find(
      (module) => module.id === managedModuleId,
    ) ?? null;

  const managedModuleSections = managedModule
    ? sections.filter(
        (section) =>
          section.learningModuleId ===
          managedModule.id,
      )
    : [];

  const isManagedModuleGenerating =
    managedModule
      ? generatingModuleId === managedModule.id
      : false;

  const closeManageModal = () => {
    setManagedModuleId(null);
    onClearModuleFileExtraction();
  };

  /**
   * View Module
   *
   * Load the sections first, then open/view the module.
   */
  const handleViewModule = (
    module: LearningModule,
  ) => {
    onLoadSections(module);
    onViewModule(module);
  };

  return (
    <>
      {/* =========================================================
          MAIN LEARNING MATERIAL MODAL
      ========================================================= */}
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-5"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-2xl">
          {/* =====================================================
              HEADER
          ===================================================== */}
          <div className="shrink-0 border-b border-[#e7e9ec] bg-white px-6 py-5">
            <div className="flex items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[10px] font-bold text-blue-600">
                  LMS
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Admin Management
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                        material.isPublished
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {material.isPublished
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-gray-900">
                    {material.title}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {material.materialType} •{" "}
                    {material.batchCode}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
              >
                ×
              </button>
            </div>
          </div>

          {/* =====================================================
              MAIN BODY
          ===================================================== */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="space-y-5">
              {/* ===================================================
                  MATERIAL OVERVIEW
              =================================================== */}
              <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Material Overview
                </p>

                <h3 className="mt-1 text-sm font-bold text-gray-900">
                  {material.title}
                </h3>

                <div className="mt-4 rounded-xl bg-[#f7f8fa] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                    Description
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {material.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Info
                    label="Training"
                    value={
                      batchMap.get(
                        material.trainingBatchId,
                      )?.programName ??
                      "Unknown Training"
                    }
                  />

                  <Info
                    label="Batch Code"
                    value={material.batchCode}
                  />

                  <Info
                    label="Material Type"
                    value={material.materialType}
                  />

                  <Info
                    label="Status"
                    value={
                      material.isPublished
                        ? "Published"
                        : "Draft"
                    }
                  />
                </div>
              </section>

              {/* ===================================================
                  SOURCE MATERIAL
              =================================================== */}
              <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                      Source Material
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Manage the main learning material
                      file and extract its text content.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onOpenMaterial}
                      disabled={!material.fileUrl}
                      className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                    >
                      Open File
                    </button>

                    <label className="cursor-pointer rounded-xl border border-[#e7e9ec] bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50">
                      {isUploading
                        ? "Uploading..."
                        : "Replace File"}

                      <input
                        type="file"
                        className="hidden"
                        disabled={isUploading}
                        onChange={onUploadMaterial}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={onExtractMaterial}
                      disabled={isExtracting}
                      className="rounded-xl border border-[#e7e9ec] bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      {isExtracting
                        ? "Extracting..."
                        : "Extract Text"}
                    </button>
                  </div>
                </div>
              </section>

              {/* ===================================================
                  MATERIAL EXTRACTION
              =================================================== */}
              {extraction && (
                <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-900">
                        Extracted Document Text
                      </p>

                      <p className="mt-1 truncate text-[10px] text-blue-700">
                        {extraction.fileName}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-lg bg-white/70 px-3 py-2 text-[10px] font-semibold text-blue-700">
                      {extraction.characterCount}{" "}
                      characters •{" "}
                      {extraction.pageCount} pages
                    </div>
                  </div>

                  <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-blue-100 bg-white p-4">
                    <pre className="whitespace-pre-wrap break-words text-[11px] leading-5 text-gray-600">
                      {extraction.text ||
                        "No text extracted."}
                    </pre>
                  </div>
                </section>
              )}

              {/* ===================================================
                  LEARNING MODULES
              =================================================== */}
              <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">
                <div className="flex flex-col gap-4 border-b border-[#eef0f2] pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">
                        Learning Modules
                      </p>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold text-gray-500">
                        {modules.length}
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] leading-5 text-gray-500">
                      Select a module to manage its
                      content, source files, and sections.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onCreateModule}
                    className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    + Add Module
                  </button>
                </div>

                {/* =================================================
                    MODULE CARDS
                ================================================= */}
                <div className="mt-5 space-y-3">
                  {modules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-[#f8f9fa] p-8 text-center">
                      <p className="text-xs font-semibold text-gray-600">
                        No modules found
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        Add a module to start organizing
                        this learning material.
                      </p>
                    </div>
                  ) : (
                    modules.map((module) => {
                      const moduleSections =
                        sections.filter(
                          (section) =>
                            section.learningModuleId ===
                            module.id,
                        );

                      return (
                        <div
                          key={module.id}
                          className="rounded-2xl border border-[#e7e9ec] bg-white transition hover:border-gray-300 hover:shadow-sm"
                        >
                          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            {/* MODULE INFO */}
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white">
                                {module.moduleNumber}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate text-sm font-bold text-gray-900">
                                    {module.title}
                                  </h4>

                                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-gray-500">
                                    Module{" "}
                                    {module.moduleNumber}
                                  </span>
                                </div>

                                <p className="mt-1 line-clamp-1 text-[10px] text-gray-500">
                                  {module.description ||
                                    "No description available."}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-md bg-gray-100 px-2 py-1 text-[8px] font-semibold text-gray-500">
                                    {module.files.length}{" "}
                                    source{" "}
                                    {module.files
                                      .length === 1
                                      ? "file"
                                      : "files"}
                                  </span>

                                  <span className="rounded-md bg-gray-100 px-2 py-1 text-[8px] font-semibold text-gray-500">
                                    {
                                      moduleSections.length
                                    }{" "}
                                    section
                                    {moduleSections.length ===
                                    1
                                      ? ""
                                      : "s"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* MANAGE BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                setManagedModuleId(
                                  module.id,
                                );
                              }}
                              className="shrink-0 rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              Manage Module
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* ===================================================
                  ADMIN NOTE
              =================================================== */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                    i
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Admin Controls
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-gray-500">
                      Select a module and click{" "}
                      <span className="font-semibold">
                        Manage Module
                      </span>{" "}
                      to access its actions, source
                      files, and learning sections.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* =====================================================
              MAIN FOOTER
          ===================================================== */}
          <div className="shrink-0 border-t border-[#e7e9ec] bg-white px-6 py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={onOpenMaterial}
                disabled={!material.fileUrl}
                className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                Open Material
              </button>

              {!material.isPublished && (
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSaving
                    ? "Publishing..."
                    : "Publish Material"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MANAGE MODULE MODAL
      ========================================================= */}
      {managedModule && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeManageModal();
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-2xl">
            {/* =====================================================
                MANAGE MODAL HEADER
            ===================================================== */}
            <div className="shrink-0 border-b border-[#e7e9ec] bg-white px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-bold text-white">
                    {managedModule.moduleNumber}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Manage Module{" "}
                      {managedModule.moduleNumber}
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
                MANAGE MODAL BODY
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
                      Manage and generate content for
                      this module.
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
                    <button
                    className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-blue-700"
  type="button"
  onClick={() => onCreateSection(managedModule)}
>
  Add Section
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
                        generatingModuleId !== null
                      }
                      className="rounded-lg bg-[#191c1e] px-3 py-2 text-[10px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isManagedModuleGenerating
                        ? "Generating..."
                        : "Generate AI"}
                    </button>

                    {/* EDIT MODULE */}
                    <button
                      type="button"
                      onClick={() =>
                        onEditModule(managedModule)
                      }
                      className="rounded-lg border border-[#e7e9ec] bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      Edit Module
                    </button>

                    {/* DELETE MODULE */}
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteModule(
                          managedModule,
                        );
                        closeManageModal();
                      }}
                      className="rounded-lg border border-red-100 bg-white px-3 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete Module
                    </button>
                  </div>
                </section>

                {/* =================================================
                    SOURCE FILES
                ================================================= */}
                <section className="rounded-xl border border-[#e7e9ec] bg-white">
                  <div className="flex flex-col gap-3 border-b border-[#eef0f2] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                          Source Files
                        </p>

                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-bold text-gray-500">
                          {
                            managedModule.files
                              .length
                          }
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-gray-500">
                        Manage source files for this
                        module.
                      </p>
                    </div>

                    <label className="cursor-pointer rounded-lg border border-[#e7e9ec] bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50">
                      + Upload File

                      <input
                        type="file"
                        className="hidden"
                        disabled={isUploading}
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
                  </div>

                  <div className="p-4">
                    {managedModule.files.length ===
                    0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 bg-[#f8f9fa] p-5 text-center">
                        <p className="text-[10px] font-semibold text-gray-500">
                          No source files uploaded
                          yet.
                        </p>

                        <p className="mt-1 text-[9px] text-gray-400">
                          Upload a file to use it as
                          module source content.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {managedModule.files.map(
                          (file) => (
                            <div
                              key={file.id}
                              className="flex flex-col gap-3 rounded-lg border border-[#e7e9ec] bg-[#fafbfc] p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[8px] font-bold text-gray-500">
                                  FILE
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-[11px] font-semibold text-gray-700">
                                    {file.fileName ??
                                      "Unnamed file"}
                                  </p>

                                  <p className="mt-1 text-[9px] text-gray-400">
                                    {file.contentType ??
                                      "Unknown type"}
                                    {" • "}
                                    {Math.round(
                                      file.fileSize /
                                        1024,
                                    )}
                                    KB
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  onExtractModuleFile(
                                    managedModule.id,
                                    file.id,
                                  )
                                }
                                disabled={
                                  isExtracting
                                }
                                className="shrink-0 rounded-lg border border-[#e7e9ec] bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                              >
                                {isExtracting
                                  ? "Extracting..."
                                  : "Extract"}
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {managedModule.files.length >
                      0 && (
                      <button
                        type="button"
                        onClick={() =>
                          onExtractAllModuleFiles(
                            managedModule.id,
                          )
                        }
                        disabled={isExtracting}
                        className="mt-3 w-full rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-[10px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        {isExtracting
                          ? "Extracting Files..."
                          : "Extract All Module Files"}
                      </button>
                    )}
                  </div>
                </section>

                {/* =================================================
                    EXTRACTED SOURCE
                ================================================= */}
                {moduleFileExtraction &&
                  moduleFileExtraction.learningModuleId ===
                    managedModule.id && (
                    <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-blue-900">
                            Extracted Source
                          </p>

                          <p className="mt-1 truncate text-[10px] text-blue-700">
                            {
                              moduleFileExtraction.fileName
                            }
                          </p>

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
                            onClearModuleFileExtraction
                          }
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </div>

                      <div className="mt-3 max-h-48 overflow-y-auto rounded-lg bg-white p-3">
                        <pre className="whitespace-pre-wrap break-words text-[10px] leading-5 text-gray-600">
                          {
                            moduleFileExtraction.text
                          }
                        </pre>
                      </div>
                    </section>
                  )}

                {/* =================================================
                    LEARNING SECTIONS
                ================================================= */}
                <section className="rounded-xl border border-[#e7e9ec] bg-white">
                  <div className="border-b border-[#eef0f2] p-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                        Learning Sections
                      </p>

                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-bold text-gray-500">
                        {
                          managedModuleSections.length
                        }
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] text-gray-500">
                      Sections are loaded when you
                      click View Module.
                    </p>
                  </div>

                  <div className="p-4">
                    {managedModuleSections.length ===
                    0 ? (
                      <div className="rounded-lg bg-[#f8f9fa] p-5 text-center">
                        <p className="text-[10px] font-semibold text-gray-500">
                          No sections loaded.
                        </p>

                        <p className="mt-1 text-[9px] text-gray-400">
                          Click{" "}
                          <span className="font-semibold">
                            View Module
                          </span>{" "}
                          above to load and view the
                          sections for this module.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {managedModuleSections.map(
                          (section) => (
                            <div
                              key={section.id}
                              className="rounded-lg border border-[#e7e9ec] bg-[#fafbfc] p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[9px] font-bold text-gray-500">
                                    {
                                      section.sectionNumber
                                    }
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-gray-800">
                                      {section.title}
                                    </p>

                                    <p className="mt-1 text-[9px] uppercase tracking-wide text-gray-400">
                                      {
                                        section.contentType
                                      }
                                    </p>

                                    {section.content && (
                                      <p className="mt-2 line-clamp-3 text-[10px] leading-5 text-gray-500">
                                        {
                                          section.content
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onEditSection(
                                        section,
                                      )
                                    }
                                    className="rounded-lg border border-[#e7e9ec] bg-white px-2.5 py-1.5 text-[9px] font-semibold text-gray-600 transition hover:bg-gray-50"
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
                                    className="rounded-lg border border-red-100 bg-white px-2.5 py-1.5 text-[9px] font-semibold text-red-600 transition hover:bg-red-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* =====================================================
                MANAGE MODAL FOOTER
            ===================================================== */}
            <div className="shrink-0 border-t border-[#e7e9ec] bg-white px-5 py-4 sm:px-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeManageModal}
                  className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   INFO COMPONENT
============================================================ */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-gray-800">
        {value}
      </p>
    </div>
  );
}