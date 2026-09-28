"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import type {
  CreateLearningMaterialRequest,
  CreateLearningModuleRequest,
  CreateLearningSectionRequest,
  LearningMaterial,
  LearningModule,
  LearningSection,
  TrainingBatch,
  UpdateLearningMaterialRequest,
  UpdateLearningModuleRequest,
  UpdateLearningSectionRequest,
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
  FilePenLine,
  Layers3,
} from "lucide-react";

import {
  columns,
  type LearningMaterialTableMeta,
} from "./columns";

import ConfirmDeleteModal from "@/components/learning/ConfirmDeleteModal";
import LearningMaterialDetailsModal from "@/components/learning/LearningMaterialDetailsModal";
import LearningMaterialsFormModal from "@/components/learning/LearningMaterialFormModal";
import LearningModuleFormModal from "@/components/learning/LearningModuleFormModal";
import LearningSectionFormModal from "@/components/learning/LearningSectionFormModal";
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
  | "material"
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

export default function Learning() {

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
] = useState<string | null>(null);

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
    isUploading,
    isGenerating,
    isExtracting,

    error,

    loadLearningMaterials,
    loadLearningMaterial,
    createLearningMaterial,
    updateLearningMaterial,
    deleteLearningMaterial,
    publishLearningMaterial,
    uploadLearningMaterial,
    extractLearningMaterialText,

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
  // MODAL STATES
  // ==========================================================

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const [
    showMaterialForm,
    setShowMaterialForm,
  ] = useState(false);

  const [
    materialFormMode,
    setMaterialFormMode,
  ] = useState<"create" | "edit">(
    "create",
  );

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

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<DeleteTarget>(
    "material",
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
  ] = useState<Error | null>(null);

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

  const draftCount =
    allMaterials.filter(
      (material) =>
        !material.isPublished,
    ).length;

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
  // CREATE MATERIAL
  // ==========================================================

  function openCreateMaterial() {
    setMaterialFormMode(
      "create",
    );

    setSelected(null);

    setShowMaterialForm(
      true,
    );
  }

  // ==========================================================
  // EDIT MATERIAL
  // ==========================================================

  function openEditMaterial(
    material: LearningMaterial,
  ) {
    setMaterialFormMode(
      "edit",
    );

    setSelected(material);

    setShowMaterialForm(
      true,
    );
  }

  // ==========================================================
  // SAVE MATERIAL
  // ==========================================================

  async function handleMaterialSubmit(
    data: {
      trainingBatchId: string;
      title: string;
      description: string;
      materialType: string;
      file: File | null;
    },
  ) {
    try {
      setActionError(null);

      if (
        materialFormMode ===
        "create"
      ) {
        // ----------------------------------------------------
        // CREATE MATERIAL RECORD
        // ----------------------------------------------------

        const payload: CreateLearningMaterialRequest =
          {
            trainingBatchId:
              data.trainingBatchId,

            title:
              data.title,

            description:
              data.description ||
              null,

            materialType:
              data.materialType,
          };

        const result =
          await createLearningMaterial(
            payload,
          );

        let finalMaterial =
          result;

        // ----------------------------------------------------
        // UPLOAD FILE AFTER MATERIAL CREATION
        // ----------------------------------------------------

        if (data.file) {
          finalMaterial =
            await uploadLearningMaterial(
              result.id,
              data.file,
            );
        }

        // ----------------------------------------------------
        // UPDATE LOCAL MATERIAL LIST
        // ----------------------------------------------------

        setAllMaterials(
          (current) => [
            finalMaterial,
            ...current,
          ],
        );

        setSelected(
          finalMaterial,
        );
      } else {
        // ----------------------------------------------------
        // EDIT MATERIAL
        // ----------------------------------------------------

        if (!selected) {
          return;
        }

        const payload: UpdateLearningMaterialRequest =
          {
            title:
              data.title,

            description:
              data.description ||
              null,

            materialType:
              data.materialType,
          };

        let result =
          await updateLearningMaterial(
            selected.id,
            payload,
          );

        // ----------------------------------------------------
        // OPTIONAL FILE REPLACEMENT
        // ----------------------------------------------------

        if (data.file) {
          result =
            await uploadLearningMaterial(
              selected.id,
              data.file,
            );
        }

        // ----------------------------------------------------
        // UPDATE LOCAL MATERIAL LIST
        // ----------------------------------------------------

        setAllMaterials(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                result.id
                  ? result
                  : item,
            ),
        );

        setSelected(
          result,
        );
      }

      setShowMaterialForm(
        false,
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to save learning material.",
            ),
      );
    }
  }

  // ==========================================================
  // DELETE MATERIAL
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
      setShowDetails(false);
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
  // PUBLISH MATERIAL
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

      setSelected(
        result,
      );
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
  // UPLOAD MATERIAL FILE
  // ==========================================================

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
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
  // EXTRACT MATERIAL
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
      await generateModuleAiContent(module.id);
    }

    const updatedModules = await loadModules(
      selected.id,
    );

    // Reload sections for the generated modules.
    for (const module of updatedModules) {
      await loadSections(module.id);
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

async function handleGenerateModule(
  moduleId: string,
) {
  try {
    setActionError(null);
    setGeneratingModuleId(moduleId);

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
    setGeneratingModuleId(null);
  }
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

    if (moduleFormMode === "create") {
      const payload: CreateLearningModuleRequest = {
        learningMaterialId: selected.id,
        moduleNumber: data.moduleNumber,
        title: data.title,
        description: data.description || null,
        displayOrder: data.displayOrder,
      };

      await createLearningModule(payload);
    } else {
      if (!selectedModule) {
        return;
      }

      const payload: UpdateLearningModuleRequest = {
        moduleNumber: data.moduleNumber,
        title: data.title,
        description: data.description || null,
        welcomeContent:
          selectedModule.welcomeContent,
        learningObjectives:
          selectedModule.learningObjectives,
        summary:
          selectedModule.summary,
        keyTakeaways:
          selectedModule.keyTakeaways,
        displayOrder: data.displayOrder,
      };

      await updateLearningModule(
        selectedModule.id,
        payload,
      );
    }

    await loadModules(selected.id);

    setShowModuleForm(false);
    setSelectedModule(null);
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
        const payload: CreateLearningSectionRequest =
          {
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
          };

        await createLearningSection(
          payload,
        );
      } else {
        if (!selectedSection) {
          return;
        }

        const payload: UpdateLearningSectionRequest =
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
          };

        await updateLearningSection(
          selectedSection.id,
          payload,
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
  // DELETE TARGET
  // ==========================================================

  function openDeleteMaterial(
    material: LearningMaterial,
  ) {
    setSelected(
      material,
    );

    setDeleteTarget(
      "material",
    );

    setShowDelete(
      true,
    );
  }

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
      "material"
    ) {
      await deleteMaterial();
      return;
    }

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
    "material"
      ? "Remove Material?"
      : deleteTarget ===
          "module"
        ? "Remove Module?"
        : "Remove Section?";

  const deleteDescription =
    deleteTarget ===
    "material"
      ? `Are you sure you want to remove "${selected?.title ?? ""}" from this training batch?`
      : deleteTarget ===
          "module"
        ? `Are you sure you want to remove "${selectedModule?.title ?? ""}"?`
        : `Are you sure you want to remove "${selectedSection?.title ?? ""}"?`;

  // ==========================================================
  // PAGE STATES
  // ==========================================================

  const isPageLoading =
    isLoadingBatches ||
    isLoading ||
    isLoadingDetails;

  const pageErrorMessage =
    actionError?.message ??
    batchError?.message ??
    error ??
    null;

  // ==========================================================
  // TABLE META
  // ==========================================================

  const tableMeta: LearningMaterialTableMeta = {
    batchMap,

    onView: (material) => {
      void viewMaterial(
        material,
      );
    },

    onPublish: (material) => {
      void publishMaterial(
        material,
      );
    },

    onDelete: (material) => {
      openDeleteMaterial(
        material,
      );
    },
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
        description="Manage, review, and monitor learning resources across training batches."
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
          title="Total Materials"
          description="All uploaded resources"
          value={
            allMaterials.length
          }
          variant="primary"
          icon={BookOpen}
        />

        <StatCard
          title="Published"
          description="Available to participants"
          value={
            publishedCount
          }
          variant="success"
          icon={BookCheck}
        />

        <StatCard
          title="Draft"
          description="Not yet published"
          value={
            draftCount
          }
          variant="warning"
          icon={FilePenLine}
        />

        <StatCard
          title="Training Batches"
          description="Batches with training content"
          value={
            batches.length
          }
          variant="primary"
          icon={Layers3}
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
              value={trainingFilter}
              onValueChange={
                setTrainingFilter
              }
            >
              <SelectTrigger className="h-10 w-55 rounded-xl border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-700">
                <SelectValue placeholder="All Trainings" />
              </SelectTrigger>

              <SelectContent>
                {trainings.map(
                  (training) => (
                    <SelectItem
                      key={training}
                      value={training}
                    >
                      {training}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {/* TYPE */}

            <Select
              value={typeFilter}
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
              value={statusFilter}
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

            {/* CREATE */}

            <button
              type="button"
              onClick={
                openCreateMaterial
              }
              className="h-10 rounded-xl bg-[#191c1e] px-4 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Add Material
            </button>
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
         generatingModuleId={
    generatingModuleId
  }
  onGenerateModule={(
    moduleId,
  ) => {
    void handleGenerateModule(
      moduleId,
    );
  }}
        extraction={extraction}
        onViewModule={openModulePreview}
        moduleFileExtraction={
          moduleFileExtraction
        }
        isSaving={isSaving}
        isUploading={
          isUploading
        }
        isGenerating={
          isGenerating
        }
        isExtracting={
          isExtracting
        }
        onClose={() => {
          setShowDetails(false);
          setSelected(null);
        }}
        onPublish={() => {
          if (selected) {
            void publishMaterial(
              selected,
            );
          }
        }}
        onOpenMaterial={() => {
          if (selected) {
            openMaterial(
              selected,
            );
          }
        }}
        onUploadMaterial={
          handleUpload
        }
        onExtractMaterial={() => {
          void handleExtract();
        }}
        onGenerateModules={() => {
          void handleGenerateModules();
        }}
        onUploadModuleFile={(
          moduleId,
          file,
        ) => {
          void handleUploadModuleFile(
            moduleId,
            file,
          );
        }}
        onExtractModuleFile={(
          moduleId,
          moduleFileId,
        ) => {
          void handleExtractModuleFile(
            moduleId,
            moduleFileId,
          );
        }}
        onExtractAllModuleFiles={(
          moduleId,
        ) => {
          void handleExtractAllModuleFiles(
            moduleId,
          );
        }}
        onLoadSections={(
          module,
        ) => {
          void handleLoadSections(
            module,
          );
        }}
        onCreateModule={
          openCreateModule
        }
        onEditModule={
          openEditModule
        }
        onCreateSection={
          openCreateSection
        }
        onEditSection={
          openEditSection
        }
        onDeleteModule={
          openDeleteModule
        }
        onDeleteSection={
          openDeleteSection
        }
        onClearModuleFileExtraction={
          clearModuleFileExtraction
        }
      />

<TrainerModulePreviewModal
  open={showModulePreview}
  module={previewModule}
  sections={sections}
  onClose={closeModulePreview}
/>
      {/* ======================================================
          MATERIAL FORM
      ====================================================== */}

      <LearningMaterialsFormModal
        open={
          showMaterialForm
        }
        mode={
          materialFormMode
        }
        material={
          selected
        }
        batches={
          batches
        }
        loading={
          isSaving ||
          isUploading
        }
        onClose={() => {
          setShowMaterialForm(
            false,
          );
        }}
        onSubmit={(data) => {
          void handleMaterialSubmit(
            data,
          );
        }}
      />

      {/* ======================================================
          MODULE FORM
      ====================================================== */}
<LearningModuleFormModal
  open={showModuleForm}
  mode={moduleFormMode}
  module={selectedModule}
  learningMaterialId={selected?.id ?? ""}
  loading={isSaving}
  onClose={() => {
    setShowModuleForm(false);
    setSelectedModule(null);
  }}
  onSubmit={(data) => {
    void handleModuleSubmit(data);
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