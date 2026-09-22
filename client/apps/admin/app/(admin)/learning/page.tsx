"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  LearningMaterial,
  LearningModule,
  LearningSection,
  TrainingBatch,
} from "@repo/types";

import {
  trainingBatchApi,
  learningMaterialApi,
} from "@/lib/api";

import {
  useLearningMaterials,
} from "@repo/hooks";
import { PageSection, StatCard, StatGrid, DataTable,  Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@repo/ui/index";
import { BookCheck, BookOpen, FilePenLine, Layers3 } from "lucide-react";

import {
  columns,
  type LearningMaterialTableMeta,
} from "./columns";

// ============================================================
// TYPES
// ============================================================

type MaterialType =
  | "PDF"
  | "Presentation"
  | "Document"
  | "Video"
  | "Activity"
  | "Other";


// ============================================================
// TYPE STYLES
// ============================================================

const typeStyles: Record<
  MaterialType,
  {
    icon: string;
    className: string;
  }
> = {
  PDF: {
    icon: "PDF",
    className:
      "bg-red-50 text-red-600 border-red-100",
  },

  Presentation: {
    icon: "PPT",
    className:
      "bg-orange-50 text-orange-600 border-orange-100",
  },

  Document: {
    icon: "DOC",
    className:
      "bg-blue-50 text-blue-600 border-blue-100",
  },

  Video: {
    icon: "VID",
    className:
      "bg-purple-50 text-purple-600 border-purple-100",
  },

  Activity: {
    icon: "ACT",
    className:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
  },

  Other: {
    icon: "FILE",
    className:
      "bg-gray-50 text-gray-600 border-gray-200",
  },
};


// ============================================================
// HELPERS
// ============================================================

function getMaterialType(
  value: string,
): MaterialType {

  const type =
    value
      .trim()
      .toLowerCase();

  if (type === "pdf") {
    return "PDF";
  }

  if (
    type === "presentation" ||
    type === "ppt" ||
    type === "pptx"
  ) {
    return "Presentation";
  }

  if (
    type === "document" ||
    type === "doc" ||
    type === "docx"
  ) {
    return "Document";
  }

  if (
    type === "video" ||
    type === "mp4"
  ) {
    return "Video";
  }

  if (type === "activity") {
    return "Activity";
  }

  return "Other";
}


function formatDate(
  value: string | null | undefined,
) {

  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}


function formatFileSize(
  value: number | null,
) {

  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (
    value <
    1024 * 1024
  ) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  if (
    value <
    1024 * 1024 * 1024
  ) {
    return `${(
      value /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    value /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}


// ============================================================
// PAGE
// ============================================================

export default function Learning() {

  // ==========================================================
  // LEARNING MATERIAL HOOK
  // ==========================================================

  const {
    learningMaterials,
    selectedMaterial,
    modules,
    sections,
    extraction,

    isLoading,
    isSaving,
    isUploading,
    isGenerating,
    isExtracting,

    error,

    loadLearningMaterials,
    loadLearningMaterial,
    deleteLearningMaterial,
    publishLearningMaterial,
    uploadLearningMaterial,
    extractLearningMaterialText,
    generateLearningModules,
    loadModules,
    loadSections,
  } = useLearningMaterials(
    learningMaterialApi,
  );


  // ==========================================================
  // BATCHES
  // ==========================================================

  const [
    batches,
    setBatches,
  ] = useState<TrainingBatch[]>([]);

  const [
    isLoadingBatches,
    setIsLoadingBatches,
  ] = useState(false);

  const [
    batchError,
    setBatchError,
  ] = useState<Error | null>(null);


  // ==========================================================
  // ALL MATERIALS
  // ==========================================================

  const [
    allMaterials,
    setAllMaterials,
  ] = useState<LearningMaterial[]>([]);


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    trainingFilter,
    setTrainingFilter,
  ] = useState("All Trainings");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("All Types");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All Status");


  // ==========================================================
  // SELECTED MATERIAL
  // ==========================================================

  const [
    selected,
    setSelected,
  ] = useState<LearningMaterial | null>(
    null,
  );


  // ==========================================================
  // MODALS
  // ==========================================================

  const [
    showView,
    setShowView,
  ] = useState(false);

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);


  // ==========================================================
  // DETAIL LOADING
  // ==========================================================

  const [
    isLoadingDetails,
    setIsLoadingDetails,
  ] = useState(false);


  // ==========================================================
  // ACTION ERROR
  // ==========================================================

  const [
    actionError,
    setActionError,
  ] = useState<Error | null>(
    null,
  );


  // ==========================================================
  // LOAD BATCHES + MATERIALS
  // ==========================================================

  useEffect(() => {

    let cancelled = false;

    async function loadData() {

      try {

        setIsLoadingBatches(true);
        setBatchError(null);
        setActionError(null);

        const batchResult =
          await trainingBatchApi.getAll();

        if (cancelled) {
          return;
        }

        setBatches(
          batchResult,
        );


        // ----------------------------------------------------
        // LOAD MATERIALS PER BATCH
        // ----------------------------------------------------

        const materialResults =
          await Promise.all(
            batchResult.map(
              async (batch) => {

                try {

                  return await loadLearningMaterials(
                    batch.id,
                  );

                } catch {

                  return [];
                }

              },
            ),
          );

        if (cancelled) {
          return;
        }


        // ----------------------------------------------------
        // COMBINE MATERIALS
        // ----------------------------------------------------

        const combined =
          materialResults.flat();


        // ----------------------------------------------------
        // REMOVE DUPLICATES
        // ----------------------------------------------------

        const uniqueMaterials =
          Array.from(
            new Map(
              combined.map(
                (material) => [
                  material.id,
                  material,
                ],
              ),
            ).values(),
          );


        setAllMaterials(
          uniqueMaterials,
        );

      } catch (err) {

        if (cancelled) {
          return;
        }

        const normalized =
          err instanceof Error
            ? err
            : new Error(
                "Failed to load learning materials.",
              );

        setBatchError(
          normalized,
        );

      } finally {

        if (!cancelled) {
          setIsLoadingBatches(false);
        }

      }

    }

    void loadData();

    return () => {
      cancelled = true;
    };

  }, [
    loadLearningMaterials,
  ]);


  // ==========================================================
  // BATCH MAP
  // ==========================================================

  const batchMap = useMemo(
    () => {

      return new Map(
        batches.map(
          (batch) => [
            batch.id,
            batch,
          ],
        ),
      );

    },
    [batches],
  );


  // ==========================================================
  // TRAINING FILTER OPTIONS
  // ==========================================================

  const trainings =
    useMemo(() => {

      return [
        "All Trainings",
        ...Array.from(
          new Set(
            batches
              .map(
                (batch) =>
                  batch.programName,
              )
              .filter(Boolean),
          ),
        ),
      ];

    }, [batches]);


  // ==========================================================
  // FILTER MATERIALS
  // ==========================================================

  const filteredMaterials =
    useMemo(() => {

      const query =
        search
          .toLowerCase()
          .trim();

      return allMaterials.filter(
        (material) => {

          const batch =
            batchMap.get(
              material.trainingBatchId,
            );

          const trainingName =
            batch?.programName ??
            "";

          const batchCode =
            material.batchCode ??
            batch?.batchCode ??
            "";

          const materialType =
            getMaterialType(
              material.materialType,
            );

          const status =
            material.isPublished
              ? "Published"
              : "Draft";


          const matchesSearch =
            !query ||
            material.title
              .toLowerCase()
              .includes(query) ||
            trainingName
              .toLowerCase()
              .includes(query) ||
            batchCode
              .toLowerCase()
              .includes(query) ||
            (
              material.fileName ??
              ""
            )
              .toLowerCase()
              .includes(query);


          const matchesTraining =
            trainingFilter ===
              "All Trainings" ||
            trainingName ===
              trainingFilter;


          const matchesType =
            typeFilter ===
              "All Types" ||
            materialType ===
              typeFilter;


          const matchesStatus =
            statusFilter ===
              "All Status" ||
            status ===
              statusFilter;


          return (
            matchesSearch &&
            matchesTraining &&
            matchesType &&
            matchesStatus
          );

        },
      );

    }, [
      allMaterials,
      batchMap,
      search,
      trainingFilter,
      typeFilter,
      statusFilter,
    ]);


  // ==========================================================
  // SUMMARY
  // ==========================================================

  const publishedCount =
    allMaterials.filter(
      (material) =>
        material.isPublished,
    ).length;


  const draftCount =
    allMaterials.filter(
      (material) =>
        !material.isPublished,
    ).length;


  const totalFileSize =
    allMaterials.reduce(
      (
        total,
        material,
      ) =>
        total +
        (
          material.fileSize ??
          0
        ),
      0,
    );


  // ==========================================================
  // OPEN MATERIAL
  // ==========================================================

  async function viewMaterial(
    material: LearningMaterial,
  ) {

    try {

      setActionError(null);
      setIsLoadingDetails(true);

      const result =
        await loadLearningMaterial(
          material.id,
        );

      setSelected(
        result,
      );

      setShowView(
        true,
      );


      // ------------------------------------------------------
      // LOAD MODULES
      // ------------------------------------------------------

      try {

        await loadModules(
          material.id,
        );

      } catch {
        // Details can still be viewed.
      }

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to load material details.",
            ),
      );

    } finally {

      setIsLoadingDetails(false);
    }

  }


  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteMaterial() {

    if (!selected) {
      return;
    }

    try {

      setActionError(null);

      await deleteLearningMaterial(
        selected.id,
      );

      setAllMaterials(
        (current) =>
          current.filter(
            (material) =>
              material.id !==
              selected.id,
          ),
      );

      setSelected(null);
      setShowDelete(false);
      setShowView(false);

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to delete learning material.",
            ),
      );

    }

  }


  // ==========================================================
  // PUBLISH
  // ==========================================================

  async function publishMaterial(
    material: LearningMaterial,
  ) {

    try {

      setActionError(null);

      const result =
        await publishLearningMaterial(
          material.id,
        );


      setAllMaterials(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              material.id
                ? result
                : item,
          ),
      );


      if (
        selected?.id ===
        material.id
      ) {
        setSelected(
          result,
        );
      }

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to publish learning material.",
            ),
      );

    }

  }


  // ==========================================================
  // UPLOAD / REPLACE FILE
  // ==========================================================

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {

    if (!selected) {
      return;
    }

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {

      setActionError(null);

      const result =
        await uploadLearningMaterial(
          selected.id,
          file,
        );


      setSelected(
        result,
      );


      setAllMaterials(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              selected.id
                ? result
                : item,
          ),
      );

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to upload learning material.",
            ),
      );

    } finally {

      event.target.value = "";
    }

  }


  // ==========================================================
  // EXTRACT
  // ==========================================================

  async function handleExtract() {

    if (!selected) {
      return;
    }

    try {

      setActionError(null);

      await extractLearningMaterialText(
        selected.id,
      );

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to extract document text.",
            ),
      );

    }

  }


  // ==========================================================
  // GENERATE MODULES
  // ==========================================================

  async function handleGenerateModules() {

    if (!selected) {
      return;
    }

    try {

      setActionError(null);

      const result =
        await generateLearningModules(
          selected.id,
        );

      if (result) {
        await loadModules(
          selected.id,
        );
      }

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to generate learning modules.",
            ),
      );

    }

  }


  // ==========================================================
  // LOAD SECTIONS
  // ==========================================================

  async function handleLoadSections(
    module: LearningModule,
  ) {

    try {

      setActionError(null);

      await loadSections(
        module.id,
      );

    } catch (err) {

      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to load learning sections.",
            ),
      );

    }

  }


  // ==========================================================
  // OPEN FILE
  // ==========================================================

  function openMaterial(
    material: LearningMaterial,
  ) {

    if (!material.fileUrl) {
      return;
    }

    window.open(
      material.fileUrl,
      "_blank",
      "noopener,noreferrer",
    );

  }


  // ==========================================================
  // LOADING
  // ==========================================================

  const isPageLoading =
    isLoadingBatches ||
    isLoading;


  // ==========================================================
  // ERROR
  // ==========================================================

  const pageError =
    actionError ??
    batchError ??
    error;


    const tableMeta: LearningMaterialTableMeta = {
  batchMap,

  onView: (material) => {
    void viewMaterial(material);
  },

  onPublish: (material) => {
    void publishMaterial(material);
  },

  onDelete: (material) => {
    setSelected(material);
    setShowDelete(true);
  },
};
  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

    <PageSection
    title="Learning Materials"
    description=" Manage, review, and monitor learning
            resources across training batches."
    ></PageSection>

     


      {/* ======================================================
          ERROR
      ====================================================== */}

      {pageError && (

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-bold text-red-600">
              !
            </div>

            <div>

              <p className="text-sm font-semibold text-red-900">
                Learning Material Error
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {pageError.message}
              </p>

            </div>

          </div>

        </div>

      )}

      <StatGrid>
        <StatCard
        title="Total Materials"
        description="All uploaded resources"
        value={allMaterials.length}
        variant="primary"
        icon={BookOpen}
        ></StatCard>
        <StatCard
        title="Published"
        description="Available to participants"
        value={publishedCount}
        variant="success"
        icon={BookCheck}
        ></StatCard>
        <StatCard
        title="Draft"
        description="Not yet published"
        value={draftCount}
        variant="warning"
        icon={FilePenLine}
        ></StatCard>
        <StatCard
        title="Training Batches"
        description="Batches with training content"
        value={batches.length}
        variant="primary"
        icon={Layers3}
        ></StatCard>
      </StatGrid>
<DataTable
  columns={columns}
  data={filteredMaterials}
  meta={tableMeta}
  loading={isPageLoading}
  searchable
  toolbar={
    <div className="flex flex-wrap items-center gap-2">
      {/* =====================================================
          TRAINING FILTER
      ===================================================== */}
      <Select
        value={trainingFilter}
        onValueChange={setTrainingFilter}
      >
        <SelectTrigger className="h-10 w-55 rounded-xl border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-700">
          <SelectValue placeholder="All Trainings" />
        </SelectTrigger>

        <SelectContent>
          {trainings.map((training) => (
            <SelectItem
              key={training}
              value={training}
            >
              {training}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* =====================================================
          TYPE FILTER
      ===================================================== */}
      <Select
        value={typeFilter}
        onValueChange={setTypeFilter}
      >
        <SelectTrigger className="h-10 w-42 rounded-xl border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-700">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="All Types">
            All Types
          </SelectItem>

          <SelectItem value="PDF">
            PDF
          </SelectItem>

          <SelectItem value="Presentation">
            Presentation
          </SelectItem>

          <SelectItem value="Document">
            Document
          </SelectItem>

          <SelectItem value="Video">
            Video
          </SelectItem>

          <SelectItem value="Activity">
            Activity
          </SelectItem>

          <SelectItem value="Other">
            Other
          </SelectItem>
        </SelectContent>
      </Select>

      {/* =====================================================
          STATUS FILTER
      ===================================================== */}
      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <SelectTrigger className="h-10 w-40 rounded-xl border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-700">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="All Status">
            All Status
          </SelectItem>

          <SelectItem value="Published">
            Published
          </SelectItem>

          <SelectItem value="Draft">
            Draft
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  }
/>

      



      {/* ======================================================
          VIEW / MANAGE MATERIAL MODAL
      ====================================================== */}

      {showView && selected && (

        <Modal
          onClose={() => {
            setShowView(false);
            setSelected(null);
          }}
        >

          {/* HEADER */}

          <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] bg-white px-6 py-5">

            <div className="flex min-w-0 items-center gap-3 pr-6">

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[9px] font-bold ${
                  typeStyles[
                    getMaterialType(
                      selected.materialType,
                    )
                  ].className
                }`}
              >
                {
                  typeStyles[
                    getMaterialType(
                      selected.materialType,
                    )
                  ].icon
                }
              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  Admin Management
                </p>

                <h2 className="mt-1 truncate text-lg font-bold tracking-tight">
                  {selected.title}
                </h2>

              </div>

            </div>

            <button
              type="button"
              onClick={() => {
                setShowView(false);
                setSelected(null);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            >
              ×
            </button>

          </div>


          {/* BODY */}

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

            <div className="space-y-5">

              {/* DESCRIPTION */}

              <div className="rounded-2xl bg-[#f7f8fa] p-5">

                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selected.description ||
                    "No description provided."}
                </p>

              </div>


              {/* INFORMATION */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <Info
                  label="Training"
                  value={
                    batchMap.get(
                      selected.trainingBatchId,
                    )?.programName ??
                    "Unknown Training"
                  }
                />

                <Info
                  label="Batch Code"
                  value={
                    selected.batchCode
                  }
                />

                <Info
                  label="Material Type"
                  value={
                    selected.materialType
                  }
                />

                <Info
                  label="File Name"
                  value={
                    selected.fileName ??
                    "—"
                  }
                />

                <Info
                  label="File Size"
                  value={
                    formatFileSize(
                      selected.fileSize,
                    )
                  }
                />

                <Info
                  label="Created"
                  value={
                    formatDate(
                      selected.createdAt,
                    )
                  }
                />

                <Info
                  label="Updated"
                  value={
                    formatDate(
                      selected.updatedAt,
                    )
                  }
                />

                <Info
                  label="Status"
                  value={
                    selected.isPublished
                      ? "Published"
                      : "Draft"
                  }
                />

              </div>


              {/* FILE ACTIONS */}

              <div className="rounded-2xl border border-[#e7e9ec] p-5">

                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  File Management
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                  <button
                    type="button"
                    onClick={() =>
                      openMaterial(
                        selected,
                      )
                    }
                    disabled={
                      !selected.fileUrl
                    }
                    className="rounded-xl bg-[#191c1e] px-4 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                  >
                    Open File
                  </button>


                  <label className="cursor-pointer rounded-xl border border-[#e7e9ec] px-4 py-3 text-center text-xs font-semibold text-gray-600 transition hover:bg-gray-50">

                    {isUploading
                      ? "Uploading..."
                      : "Replace File"}

                    <input
                      type="file"
                      className="hidden"
                      disabled={
                        isUploading
                      }
                      onChange={
                        handleUpload
                      }
                    />

                  </label>


                  <button
                    type="button"
                    onClick={() =>
                      void handleExtract()
                    }
                    disabled={
                      isExtracting
                    }
                    className="rounded-xl border border-[#e7e9ec] px-4 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isExtracting
                      ? "Extracting..."
                      : "Extract Text"}
                  </button>

                </div>

              </div>


              {/* EXTRACTION */}

              {extraction && (

                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="text-xs font-bold text-blue-900">
                        Extracted Document Text
                      </p>

                      <p className="mt-1 text-[10px] text-blue-700">
                        {extraction.characterCount} characters
                        {" • "}
                        {extraction.pageCount} pages
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 max-h-48 overflow-y-auto rounded-xl bg-white p-4">

                    <pre className="whitespace-pre-wrap break-words text-[11px] leading-5 text-gray-600">
                      {extraction.text ||
                        "No text extracted."}
                    </pre>

                  </div>

                </div>

              )}


              {/* MODULE MANAGEMENT */}

              <div className="rounded-2xl border border-[#e7e9ec] p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-xs font-bold">
                      Learning Modules
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-gray-500">
                      Review or generate modules from
                      the uploaded document.
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      void handleGenerateModules()
                    }
                    disabled={
                      isGenerating
                    }
                    className="rounded-xl bg-[#191c1e] px-4 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating
                      ? "Generating..."
                      : "Generate Modules"}
                  </button>

                </div>


                {/* MODULE LIST */}

                <div className="mt-5 space-y-2">

                  {modules.length === 0 ? (

                    <div className="rounded-xl bg-[#f8f9fa] p-5 text-center">

                      <p className="text-xs font-semibold text-gray-600">
                        No modules found
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        Generate modules from the
                        uploaded document.
                      </p>

                    </div>

                  ) : (

                    modules.map(
                      (module) => (

                        <div
                          key={module.id}
                          className="rounded-xl border border-[#eef0f2] bg-white p-4"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <div className="flex items-center gap-2">

                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600">
                                  {module.moduleNumber}
                                </span>

                                <p className="text-xs font-bold">
                                  {module.title}
                                </p>

                              </div>

                              {module.description && (

                                <p className="mt-2 text-[10px] leading-5 text-gray-500">
                                  {module.description}
                                </p>

                              )}

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                void handleLoadSections(
                                  module,
                                )
                              }
                              className="shrink-0 rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
                            >
                              Sections
                            </button>

                          </div>


                          {/* SECTIONS */}

                          {sections.some(
                            (section) =>
                              section.learningModuleId ===
                              module.id,
                          ) && (

                            <div className="mt-4 space-y-2 border-t border-[#eef0f2] pt-4">

                              {sections
                                .filter(
                                  (
                                    section,
                                  ) =>
                                    section.learningModuleId ===
                                    module.id,
                                )
                                .map(
                                  (
                                    section,
                                  ) => (

                                    <div
                                      key={
                                        section.id
                                      }
                                      className="rounded-lg bg-[#f8f9fa] p-3"
                                    >

                                      <p className="text-[11px] font-semibold">
                                        {section.sectionNumber}.
                                        {" "}
                                        {section.title}
                                      </p>

                                      <p className="mt-1 text-[10px] text-gray-400">
                                        {section.contentType}
                                      </p>

                                      {section.content && (

                                        <p className="mt-2 line-clamp-3 text-[10px] leading-5 text-gray-500">
                                          {
                                            section.content
                                          }
                                        </p>

                                      )}

                                    </div>

                                  ),
                                )}

                            </div>

                          )}

                        </div>

                      ),
                    )

                  )}

                </div>

              </div>


              {/* ADMIN NOTE */}

              <div className="rounded-2xl border border-gray-200 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                    i
                  </div>

                  <div>

                    <p className="text-xs font-bold">
                      Admin controls
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-gray-500">
                      Admin can review the uploaded
                      resource, publish it, replace its
                      file, extract document text, and
                      generate learning modules.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* FOOTER */}

          <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef0f2] bg-white px-6 py-4 sm:flex-row sm:justify-end">

            {!selected.isPublished && (

              <button
                type="button"
                onClick={() =>
                  void publishMaterial(
                    selected,
                  )
                }
                disabled={
                  isSaving
                }
                className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving
                  ? "Publishing..."
                  : "Publish Material"}
              </button>

            )}


            <button
              type="button"
              onClick={() =>
                openMaterial(
                  selected,
                )
              }
              disabled={
                !selected.fileUrl
              }
              className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              Open Material
            </button>


            <button
              type="button"
              onClick={() => {
                setShowView(false);
                setSelected(null);
              }}
              className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Close
            </button>

          </div>

        </Modal>

      )}


      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      {showDelete && selected && (

        <ConfirmDelete
          title="Remove Material?"
          description={`Are you sure you want to remove "${selected.title}" from this training batch?`}
          loading={isSaving}
          onCancel={() =>
            setShowDelete(false)
          }
          onConfirm={() =>
            void deleteMaterial()
          }
        />

      )}

    </div>
  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  description,
  icon,
  type,
}: {
  label: string;
  value: number | string;
  description: string;
  icon: string;
  type?:
    | "success"
    | "warning"
    | "info";
}) {

  const styles = {
    success:
      "bg-emerald-50 text-emerald-700",

    warning:
      "bg-amber-50 text-amber-700",

    info:
      "bg-blue-50 text-blue-700",
  };

  return (

    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
            type
              ? styles[type]
              : "bg-[#f4f5f6] text-gray-600"
          }`}
        >
          {icon}
        </div>

      </div>

      <p className="mt-4 text-[11px] text-gray-400">
        {description}
      </p>

    </div>
  );
}


// ============================================================
// INFO
// ============================================================

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

      <p className="mt-1.5 break-words text-xs font-semibold leading-5">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// MODAL
// ============================================================

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {

  return (

    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl">

        {children}

      </div>

    </div>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {

  return (

    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ⌕
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No learning materials found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your search or filters.
      </p>

    </div>
  );
}


// ============================================================
// DELETE CONFIRMATION
// ============================================================

function ConfirmDelete({
  title,
  description,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {

  return (

    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
          !
        </div>

        <h2 className="mt-5 text-xl font-bold">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Removing..."
              : "Remove"}
          </button>

        </div>

      </div>

    </div>
  );
}