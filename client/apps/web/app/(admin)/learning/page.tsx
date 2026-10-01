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

import { useLearningMaterials } from "@repo/hooks";

import {
  PageSection,
  StatCard,
  StatGrid,
  DataTable,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui/index";

import {
  BookCheck,
  BookOpen,
  Layers3,
  GraduationCap,
} from "lucide-react";

import {
  columns,
  type LearningMaterialTableMeta,
} from "./columns";

import LearningMaterialDetailsModal from "@/components/learning/LearningMaterialDetailsModal";
import LearningModuleFormModal from "@/components/learning/LearningModuleFormModal";
import LearningSectionFormModal from "@/components/learning/LearningSectionFormModal";
import ConfirmDeleteModal from "@/components/learning/ConfirmDeleteModal";
import TrainerModulePreviewModal from "@/components/learning/TrainerModulePreviewModal";

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

type DeleteTarget =
  | "module"
  | "section";

// ============================================================
// HELPERS
// ============================================================

function getMaterialType(
  value: string,
): MaterialType {
  const type = value
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

// ============================================================
// PAGE
// ============================================================

export default function TrainerLearning() {
  // ==========================================================
  // MODULE PREVIEW
  // ==========================================================

  const [
    showModulePreview,
    setShowModulePreview,
  ] = useState(false);

  const [
    previewModule,
    setPreviewModule,
  ] = useState<LearningModule | null>(
    null,
  );

  const [
    generatingModuleId,
    setGeneratingModuleId,
  ] = useState<string | null>(
    null,
  );

  function openModulePreview(
    module: LearningModule,
  ) {
    setPreviewModule(module);
    setShowModulePreview(true);
  }

  function closeModulePreview() {
    setShowModulePreview(false);
    setPreviewModule(null);
  }

  // ==========================================================
  // LEARNING MATERIAL HOOK
  // ==========================================================

  const {
    extraction,
    modules,
    moduleFileExtraction,
    sections,

    isLoading,
    isSaving,
    isGenerating,
    isExtracting,

    error,

    loadLearningMaterials,
    loadLearningMaterial,

    loadModules,
    createLearningModule,
    updateLearningModule,
    deleteLearningModule,

    uploadLearningModuleFile,
    extractLearningModuleFileText,
    extractAllLearningModuleFiles,

    generateModuleAiContent,

    loadSections,
    createLearningSection,
    updateLearningSection,
    deleteLearningSection,

    clearModuleFileExtraction,
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
  ] = useState<Error | null>(
    null,
  );

  // ==========================================================
  // ALL MATERIALS
  // ==========================================================

  const [
    allMaterials,
    setAllMaterials,
  ] = useState<LearningMaterial[]>(
    [],
  );

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
  // DETAILS MODAL
  // ==========================================================

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  // ==========================================================
  // MODULE FORM
  // ==========================================================

  const [
    showModuleForm,
    setShowModuleForm,
  ] = useState(false);

  const [
    moduleFormMode,
    setModuleFormMode,
  ] = useState<"create" | "edit">(
    "create",
  );

  const [
    selectedModule,
    setSelectedModule,
  ] = useState<LearningModule | null>(
    null,
  );

  // ==========================================================
  // SECTION FORM
  // ==========================================================

  const [
    showSectionForm,
    setShowSectionForm,
  ] = useState(false);

  const [
    sectionFormMode,
    setSectionFormMode,
  ] = useState<"create" | "edit">(
    "create",
  );

  const [
    selectedSection,
    setSelectedSection,
  ] = useState<LearningSection | null>(
    null,
  );

  // ==========================================================
  // DELETE
  // ==========================================================

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<DeleteTarget>(
    "module",
  );

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

        setBatches(batchResult);

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

        const combined =
          materialResults.flat();

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

        /*
         * TRAINER VIEW
         *
         * Only display materials that
         * Admin has already published.
         *
         * Draft materials remain hidden
         * from the Trainer.
         */
        const publishedMaterials =
          uniqueMaterials.filter(
            (material) =>
              material.isPublished,
          );

        setAllMaterials(
          publishedMaterials,
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
          setIsLoadingBatches(
            false,
          );
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
    () =>
      new Map(
        batches.map(
          (batch) => [
            batch.id,
            batch,
          ],
        ),
      ),
    [batches],
  );

  // ==========================================================
  // TRAININGS
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

  const moduleCount =
    modules.length;

  const lessonCount =
    sections.length;

  // ==========================================================
  // VIEW MATERIAL
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

      setSelected(result);
      setShowDetails(true);

      await loadModules(
        material.id,
      );
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
  // OPEN MATERIAL
  //
  // ADMIN-UPLOADED FILE
  // TRAINER CAN ONLY VIEW IT
  // ==========================================================

  function openMaterial(
    material: LearningMaterial,
  ) {
    if (!material.fileUrl) {
      setActionError(
        new Error(
          "This learning material does not have an uploaded file.",
        ),
      );

      return;
    }

    window.open(
      material.fileUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  // ==========================================================
  // CREATE MODULE
  // ==========================================================

  function openCreateModule() {
    if (!selected) {
      return;
    }

    setSelectedModule(null);

    setModuleFormMode(
      "create",
    );

    setShowModuleForm(
      true,
    );
  }

  // ==========================================================
  // EDIT MODULE
  // ==========================================================

  function openEditModule(
    module: LearningModule,
  ) {
    setSelectedModule(
      module,
    );

    setModuleFormMode(
      "edit",
    );

    setShowModuleForm(
      true,
    );
  }

  // ==========================================================
  // SAVE MODULE
  // ==========================================================

  async function handleModuleSubmit(
    data: {
      learningMaterialId: string;
      moduleNumber: number;
      title: string;
      description: string;
      displayOrder: number;
    },
  ) {
    try {
      setActionError(null);

      if (!selected) {
        throw new Error(
          "No learning material is currently selected.",
        );
      }

      if (
        moduleFormMode ===
        "create"
      ) {
        await createLearningModule({
          learningMaterialId:
            selected.id,

          moduleNumber:
            data.moduleNumber,

          title:
            data.title,

          description:
            data.description ||
            null,

          displayOrder:
            data.displayOrder,
        });
      } else {
        if (!selectedModule) {
          return;
        }

        await updateLearningModule(
          selectedModule.id,
          {
            moduleNumber:
              data.moduleNumber,

            title:
              data.title,

            description:
              data.description ||
              null,

            welcomeContent:
              selectedModule.welcomeContent,

            learningObjectives:
              selectedModule.learningObjectives,

            summary:
              selectedModule.summary,

            keyTakeaways:
              selectedModule.keyTakeaways,

            displayOrder:
              data.displayOrder,
          },
        );
      }

      await loadModules(
        selected.id,
      );

      setShowModuleForm(
        false,
      );

      setSelectedModule(
        null,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to save learning module.",
            ),
      );
    }
  }

  // ==========================================================
  // DELETE MODULE
  // ==========================================================

  async function deleteModule() {
    if (!selectedModule) {
      return;
    }

    try {
      setActionError(null);

      await deleteLearningModule(
        selectedModule.id,
      );

      if (selected) {
        await loadModules(
          selected.id,
        );
      }

      setSelectedModule(
        null,
      );

      setShowDelete(
        false,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to delete learning module.",
            ),
      );
    }
  }

  // ==========================================================
  // UPLOAD MODULE FILE
  // ==========================================================

  async function handleUploadModuleFile(
    moduleId: string,
    file: File,
  ) {
    try {
      setActionError(null);

      await uploadLearningModuleFile(
        moduleId,
        file,
      );

      if (selected) {
        await loadModules(
          selected.id,
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to upload module file.",
            ),
      );
    }
  }

  // ==========================================================
  // EXTRACT MODULE FILE
  // ==========================================================

  async function handleExtractModuleFile(
    moduleId: string,
    moduleFileId: string,
  ) {
    try {
      setActionError(null);

      await extractLearningModuleFileText(
        moduleId,
        moduleFileId,
      );

      if (selected) {
        await loadModules(
          selected.id,
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to extract module file.",
            ),
      );
    }
  }

  // ==========================================================
  // EXTRACT ALL MODULE FILES
  // ==========================================================

  async function handleExtractAllModuleFiles(
    moduleId: string,
  ) {
    try {
      setActionError(null);

      await extractAllLearningModuleFiles(
        moduleId,
      );

      if (selected) {
        await loadModules(
          selected.id,
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to extract all module files.",
            ),
      );
    }
  }

  // ==========================================================
  // GENERATE SINGLE MODULE
  // ==========================================================

  async function handleGenerateModule(
    moduleId: string,
  ) {
    try {
      setActionError(null);

      setGeneratingModuleId(
        moduleId,
      );

      await generateModuleAiContent(
        moduleId,
      );

      if (selected) {
        await loadModules(
          selected.id,
        );
      }

      await loadSections(
        moduleId,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to generate AI content.",
            ),
      );
    } finally {
      setGeneratingModuleId(
        null,
      );
    }
  }

  // ==========================================================
  // GENERATE ALL MODULES
  // ==========================================================

  async function handleGenerateModules() {
    if (!selected) {
      return;
    }

    try {
      setActionError(null);

      if (modules.length === 0) {
        throw new Error(
          "No learning modules found. Please create a learning module first.",
        );
      }

      for (const module of modules) {
        await generateModuleAiContent(
          module.id,
        );
      }

      const updatedModules =
        await loadModules(
          selected.id,
        );

      for (
        const module of
        updatedModules
      ) {
        await loadSections(
          module.id,
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to generate learning module content.",
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
  // CREATE SECTION
  // ==========================================================

  function openCreateSection(
    module: LearningModule,
  ) {
    setSelectedModule(
      module,
    );

    setSelectedSection(
      null,
    );

    setSectionFormMode(
      "create",
    );

    setShowSectionForm(
      true,
    );
  }

  // ==========================================================
  // EDIT SECTION
  // ==========================================================

  function openEditSection(
    section: LearningSection,
  ) {
    setSelectedSection(
      section,
    );

    setSelectedModule(
      null,
    );

    setSectionFormMode(
      "edit",
    );

    setShowSectionForm(
      true,
    );
  }

  // ==========================================================
  // SAVE SECTION
  // ==========================================================

  async function handleSectionSubmit(
    data: {
      learningModuleId: string;
      sectionNumber: number;
      title: string;
      contentType: string;
      content: string;
      mediaUrl: string;
      displayOrder: number;
    },
  ) {
    try {
      setActionError(null);

      if (
        sectionFormMode ===
        "create"
      ) {
        await createLearningSection({
          learningModuleId:
            data.learningModuleId,

          sectionNumber:
            data.sectionNumber,

          title:
            data.title,

          contentType:
            data.contentType,

          content:
            data.content ||
            null,

          mediaUrl:
            data.mediaUrl ||
            null,

          displayOrder:
            data.displayOrder,
        });
      } else {
        if (!selectedSection) {
          return;
        }

        await updateLearningSection(
          selectedSection.id,
          {
            sectionNumber:
              data.sectionNumber,

            title:
              data.title,

            contentType:
              data.contentType,

            content:
              data.content ||
              null,

            mediaUrl:
              data.mediaUrl ||
              null,

            displayOrder:
              data.displayOrder,
          },
        );
      }

      await loadSections(
        data.learningModuleId,
      );

      setShowSectionForm(
        false,
      );

      setSelectedSection(
        null,
      );

      setSelectedModule(
        null,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to save learning section.",
            ),
      );
    }
  }

  // ==========================================================
  // DELETE SECTION
  // ==========================================================

  async function deleteSection() {
    if (!selectedSection) {
      return;
    }

    try {
      setActionError(null);

      await deleteLearningSection(
        selectedSection.id,
      );

      if (
        selectedSection.learningModuleId
      ) {
        await loadSections(
          selectedSection.learningModuleId,
        );
      }

      setSelectedSection(
        null,
      );

      setShowDelete(
        false,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to delete learning section.",
            ),
      );
    }
  }

  // ==========================================================
  // DELETE TARGET
  // ==========================================================

  function openDeleteModule(
    module: LearningModule,
  ) {
    setSelectedModule(
      module,
    );

    setDeleteTarget(
      "module",
    );

    setShowDelete(
      true,
    );
  }

  function openDeleteSection(
    section: LearningSection,
  ) {
    setSelectedSection(
      section,
    );

    setDeleteTarget(
      "section",
    );

    setShowDelete(
      true,
    );
  }

  async function handleDeleteConfirm() {
    if (
      deleteTarget ===
      "module"
    ) {
      await deleteModule();
      return;
    }

    await deleteSection();
  }

  // ==========================================================
  // DELETE MODAL TEXT
  // ==========================================================

  const deleteTitle =
    deleteTarget ===
    "module"
      ? "Remove Module?"
      : "Remove Section?";

  const deleteDescription =
    deleteTarget ===
    "module"
      ? `Are you sure you want to remove "${selectedModule?.title ?? ""}"?`
      : `Are you sure you want to remove "${selectedSection?.title ?? ""}"?`;

  // ==========================================================
  // PAGE ERROR
  // ==========================================================

  const pageErrorMessage =
    actionError?.message ??
    batchError?.message ??
    error ??
    null;

  // ==========================================================
  // PAGE LOADING
  // ==========================================================

  const isPageLoading =
    isLoadingBatches ||
    isLoading ||
    isLoadingDetails;

  // ==========================================================
  // TABLE META
  // ==========================================================

  const tableMeta:
    LearningMaterialTableMeta = {
      batchMap,

      onView: (
        material
      ) => {
        void viewMaterial(
          material
        );
      },
      onPublish: function (material: LearningMaterial): void {
        throw new Error("Function not implemented.");
      },
      onDelete: function (material: LearningMaterial): void {
        throw new Error("Function not implemented.");
      }
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageSection
        title="Learning Materials"
        description="View published learning materials and develop training modules and lessons."
      />

      {/* ======================================================
          ERROR
      ====================================================== */}

      {pageErrorMessage && (
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
                {pageErrorMessage}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          STATS
      ====================================================== */}

      <StatGrid>

        <StatCard
          title="Learning Materials"
          description="Published resources available"
          value={
            allMaterials.length
          }
          variant="primary"
          icon={BookOpen}
        />

        <StatCard
          title="Published"
          description="Available training resources"
          value={
            publishedCount
          }
          variant="success"
          icon={BookCheck}
        />

        <StatCard
          title="Modules"
          description="Modules you manage"
          value={
            moduleCount
          }
          variant="primary"
          icon={Layers3}
        />

        <StatCard
          title="Lessons"
          description="Lessons you manage"
          value={
            lessonCount
          }
          variant="warning"
          icon={GraduationCap}
        />

      </StatGrid>

      {/* ======================================================
          DATA TABLE
      ====================================================== */}

      <DataTable
        columns={columns}
        data={filteredMaterials}
        meta={tableMeta}
        loading={isPageLoading}
        searchable
        toolbar={
          <div className="flex flex-wrap items-center gap-2">

            {/* TRAINING */}

            <Select
              value={
                trainingFilter
              }
              onValueChange={
                setTrainingFilter
              }
            >
              <SelectTrigger className="h-10 w-55 rounded-xl border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-700">
                <SelectValue placeholder="All Trainings" />
              </SelectTrigger>

              <SelectContent>
                {trainings.map(
                  (
                    training,
                  ) => (
                    <SelectItem
                      key={
                        training
                      }
                      value={
                        training
                      }
                    >
                      {
                        training
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {/* TYPE */}

            <Select
              value={
                typeFilter
              }
              onValueChange={
                setTypeFilter
              }
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

            {/* STATUS */}

            <Select
              value={
                statusFilter
              }
              onValueChange={
                setStatusFilter
              }
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
          DETAILS MODAL
      ====================================================== */}

      <LearningMaterialDetailsModal
        open={showDetails}

        material={selected}

        modules={modules}

        sections={sections}

        batchMap={batchMap}

        generatingModuleId={generatingModuleId}

        onGenerateModule={(
          moduleId
        ) => {
          void handleGenerateModule(
            moduleId
          );
        } }

        extraction={extraction}

        onViewModule={openModulePreview}

        moduleFileExtraction={moduleFileExtraction}

        isSaving={isSaving}

        /*
         * Trainer does not upload
         * or modify Admin's source file.
         */
        isUploading={false}

        isGenerating={isGenerating}

        isExtracting={isExtracting}

        onClose={() => {
          setShowDetails(
            false
          );

          setSelected(
            null
          );
        } }

        /*
         * ADMIN-ONLY ACTIONS ARE
         * INTENTIONALLY NOT PASSED:
         *
         * onPublish
         * onUploadMaterial
         * onExtractMaterial
         */
        onOpenMaterial={() => {
          if (selected) {
            openMaterial(
              selected
            );
          }
        } }

        /*
         * TRAINER MODULE ACTIONS
         */
        onGenerateModules={() => {
          void handleGenerateModules();
        } }

        onUploadModuleFile={(
          moduleId,
          file
        ) => {
          void handleUploadModuleFile(
            moduleId,
            file
          );
        } }

        onExtractModuleFile={(
          moduleId,
          moduleFileId
        ) => {
          void handleExtractModuleFile(
            moduleId,
            moduleFileId
          );
        } }

        onExtractAllModuleFiles={(
          moduleId
        ) => {
          void handleExtractAllModuleFiles(
            moduleId
          );
        } }

        onLoadSections={(
          module
        ) => {
          void handleLoadSections(
            module
          );
        } }

        onCreateModule={openCreateModule}

        onEditModule={openEditModule}

        onCreateSection={openCreateSection}

        onEditSection={openEditSection}

        onDeleteModule={openDeleteModule}

        onDeleteSection={openDeleteSection}

        onClearModuleFileExtraction={clearModuleFileExtraction} onPublish={function (): void {
          throw new Error("Function not implemented.");
        } } onUploadMaterial={function (event: React.ChangeEvent<HTMLInputElement>): void {
          throw new Error("Function not implemented.");
        } } onExtractMaterial={function (): void {
          throw new Error("Function not implemented.");
        } }      />

      {/* ======================================================
          MODULE PREVIEW
      ====================================================== */}

      <TrainerModulePreviewModal
        open={
          showModulePreview
        }

        module={
          previewModule
        }

        sections={
          sections
        }

        onClose={
          closeModulePreview
        }
      />

      {/* ======================================================
          MODULE FORM
      ====================================================== */}

      <LearningModuleFormModal
        open={
          showModuleForm
        }

        mode={
          moduleFormMode
        }

        module={
          selectedModule
        }

        learningMaterialId={
          selected?.id ?? ""
        }

        loading={
          isSaving
        }

        onClose={() => {
          setShowModuleForm(
            false,
          );

          setSelectedModule(
            null,
          );
        }}

        onSubmit={(data) => {
          void handleModuleSubmit(
            data,
          );
        }}
      />

      {/* ======================================================
          SECTION FORM
      ====================================================== */}

      <LearningSectionFormModal
        open={
          showSectionForm
        }

        mode={
          sectionFormMode
        }

        learningModuleId={
          selectedModule?.id ??
          selectedSection?.learningModuleId ??
          ""
        }

        section={
          selectedSection
        }

        loading={
          isSaving
        }

        onClose={() => {
          setShowSectionForm(
            false,
          );

          setSelectedSection(
            null,
          );

          setSelectedModule(
            null,
          );
        }}

        onSubmit={(data) => {
          void handleSectionSubmit(
            data,
          );
        }}
      />

      {/* ======================================================
          DELETE
      ====================================================== */}

      {showDelete && (
        <ConfirmDeleteModal
          title={
            deleteTitle
          }

          description={
            deleteDescription
          }

          loading={
            isSaving
          }

          onCancel={() => {
            setShowDelete(
              false,
            );
          }}

          onConfirm={() => {
            void handleDeleteConfirm();
          }}
        />
      )}

    </div>
  );
}