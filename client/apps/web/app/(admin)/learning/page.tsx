"use client";

import {
  useEffect,
  useMemo,
  useRef,
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
  Plus,
} from "lucide-react";

import {
  columns,
  type TrainerLearningModuleRow,
  type TrainerLearningModuleTableMeta,
} from "./columns";

import LearningMaterialDetailsModal from "@/components/learning/LearningMaterialDetailsModal";
import LearningModuleFormModal from "@/components/learning/LearningModuleFormModal";
import LearningSectionFormModal from "@/components/learning/LearningSectionFormModal";
import ConfirmDeleteModal from "@/components/learning/ConfirmDeleteModal";
import TrainerModulePreviewModal from "@/components/learning/TrainerModulePreviewModal";

// ============================================================
// TYPES
// ============================================================

type DeleteTarget =
  | "module"
  | "section";

// ============================================================
// PAGE
// ============================================================

export default function TrainerLearning() {
  // ==========================================================
  // REFS
  // ==========================================================

  const replaceFileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const replaceMaterialIdRef =
    useRef<string | null>(
      null,
    );

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
  // ALL PUBLISHED MATERIALS
  // ==========================================================

  const [
    allMaterials,
    setAllMaterials,
  ] = useState<LearningMaterial[]>(
    [],
  );

  // ==========================================================
  // ALL MODULES
  // ==========================================================

  const [
    allModules,
    setAllModules,
  ] = useState<LearningModule[]>(
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
  // MANAGE MODULE MODAL
  // ==========================================================

  const [
    manageModuleId,
    setManageModuleId,
  ] = useState<string | null>(
    null,
  );

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
  // ACTION ERROR
  // ==========================================================

  const [
    actionError,
    setActionError,
  ] = useState<Error | null>(
    null,
  );

  // ==========================================================
  // LOAD ASSIGNED BATCHES
  // + PUBLISHED MATERIALS
  // + MODULES
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setIsLoadingBatches(true);
        setBatchError(null);
        setActionError(null);

        // ------------------------------------------------------
        // 1. GET TRAINER-ASSIGNED BATCHES
        // ------------------------------------------------------

        const batchResult =
          await trainingBatchApi.getAssigned();

        if (cancelled) {
          return;
        }

        setBatches(batchResult);

        // ------------------------------------------------------
        // 2. GET LEARNING MATERIALS
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // 3. REMOVE DUPLICATES
        // ------------------------------------------------------

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

        // ------------------------------------------------------
        // 4. ONLY PUBLISHED MATERIALS
        // ------------------------------------------------------

        const publishedMaterials =
          uniqueMaterials.filter(
            (material) =>
              material.isPublished,
          );

        setAllMaterials(
          publishedMaterials,
        );

        // ------------------------------------------------------
        // 5. LOAD MODULES
        // ------------------------------------------------------

        const moduleResults =
          await Promise.all(
            publishedMaterials.map(
              async (material) => {
                try {
                  return await loadModules(
                    material.id,
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

        const combinedModules =
          moduleResults.flat();

        // ------------------------------------------------------
        // 6. REMOVE DUPLICATE MODULES
        // ------------------------------------------------------

        const uniqueModules =
          Array.from(
            new Map(
              combinedModules.map(
                (module) => [
                  module.id,
                  module,
                ],
              ),
            ).values(),
          );

        setAllModules(
          uniqueModules,
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        const normalized =
          err instanceof Error
            ? err
            : new Error(
                "Failed to load trainer learning data.",
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
    loadModules,
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
  // MODULE TABLE ROWS
  // ==========================================================

  const moduleRows =
    useMemo<TrainerLearningModuleRow[]>(
      () => {
        return allModules.map(
          (module) => {
            const material =
              allMaterials.find(
                (item) =>
                  item.id ===
                  module.learningMaterialId,
              );

            const batch =
              material
                ? batchMap.get(
                    material.trainingBatchId,
                  ) ?? null
                : null;

            return {
              module,
              batch,
              lessonCount: 0,
            };
          },
        );
      },
      [
        allModules,
        allMaterials,
        batchMap,
      ],
    );

  // ==========================================================
  // FILTER MODULES
  // ==========================================================

  const filteredModules =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return moduleRows.filter(
        (row) => {
          const module =
            row.module;

          const trainingName =
            row.batch
              ?.programName ?? "";

          const batchCode =
            row.batch
              ?.batchCode ?? "";

          const hasContent =
            Boolean(
              module.welcomeContent ||
                module.learningObjectives ||
                module.summary ||
                module.keyTakeaways,
            );

          const moduleStatus =
            hasContent
              ? "Ready"
              : "Draft";

          const matchesSearch =
            !query ||
            module.title
              .toLowerCase()
              .includes(query) ||
            trainingName
              .toLowerCase()
              .includes(query) ||
            batchCode
              .toLowerCase()
              .includes(query);

          const matchesTraining =
            trainingFilter ===
              "All Trainings" ||
            trainingName ===
              trainingFilter;

          const matchesStatus =
            statusFilter ===
              "All Status" ||
            moduleStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesTraining &&
            matchesStatus
          );
        },
      );
    }, [
      moduleRows,
      search,
      trainingFilter,
      statusFilter,
    ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const publishedCount =
    allMaterials.length;

  const moduleCount =
    allModules.length;

  const lessonCount =
    sections.length;

  // ==========================================================
  // GET MATERIAL FROM MODULE ROW
  // ==========================================================

  function getMaterialForRow(
    row: TrainerLearningModuleRow,
  ) {
    return (
      allMaterials.find(
        (material) =>
          material.id ===
          row.module.learningMaterialId,
      ) ?? null
    );
  }

  // ==========================================================
  // OPEN MATERIAL
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
  // OPEN MATERIAL FROM TABLE
  // ==========================================================

  function handleOpenMaterial(
    row: TrainerLearningModuleRow,
  ) {
    const material =
      getMaterialForRow(row);

    if (!material) {
      setActionError(
        new Error(
          "Learning material not found.",
        ),
      );

      return;
    }

    openMaterial(material);
  }

  // ==========================================================
  // REPLACE MATERIAL FILE
  // ==========================================================

  function handleReplaceMaterial(
    row: TrainerLearningModuleRow,
  ) {
    const material =
      getMaterialForRow(row);

    if (!material) {
      setActionError(
        new Error(
          "Learning material not found.",
        ),
      );

      return;
    }

    replaceMaterialIdRef.current =
      material.id;

    replaceFileInputRef.current?.click();
  }

  // ==========================================================
  // HANDLE REPLACE FILE
  // ==========================================================

  async function handleReplaceFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    const materialId =
      replaceMaterialIdRef.current;

    event.target.value = "";

    if (
      !file ||
      !materialId
    ) {
      return;
    }

    try {
      setActionError(null);

      await learningMaterialApi.uploadFile(
        materialId,
        file,
      );

      const refreshed =
        await loadLearningMaterial(
          materialId,
        );

      setAllMaterials(
        (current) =>
          current.map(
            (material) =>
              material.id ===
              materialId
                ? refreshed
                : material,
          ),
      );

      if (
        selected?.id ===
        materialId
      ) {
        setSelected(
          refreshed,
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to replace learning material.",
            ),
      );
    } finally {
      replaceMaterialIdRef.current =
        null;
    }
  }

  // ==========================================================
  // EXTRACT MATERIAL
  // ==========================================================

  async function handleExtractMaterial(
    row: TrainerLearningModuleRow,
  ) {
    const material =
      getMaterialForRow(row);

    if (!material) {
      setActionError(
        new Error(
          "Learning material not found.",
        ),
      );

      return;
    }

    try {
      setActionError(null);

      await learningMaterialApi.extractText(
        material.id,
      );

      const refreshed =
        await loadLearningMaterial(
          material.id,
        );

      setAllMaterials(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              material.id
                ? refreshed
                : item,
          ),
      );

      if (
        selected?.id ===
        material.id
      ) {
        setSelected(
          refreshed,
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err
          : new Error(
              "Failed to extract learning material text.",
            ),
      );
    }
  }

  // ==========================================================
  // OPEN MANAGE MODULE
  // ==========================================================

  function openManageModule(
    row: TrainerLearningModuleRow,
  ) {
    const material =
      getMaterialForRow(row);

    if (!material) {
      setActionError(
        new Error(
          "The learning material for this module could not be found.",
        ),
      );

      return;
    }

    setSelected(
      material,
    );

    setManageModuleId(
      row.module.id,
    );

    void (async () => {
      try {
        setActionError(null);

        await loadModules(
          material.id,
        );

        await loadSections(
          row.module.id,
        );
      } catch (err) {
        setActionError(
          err instanceof Error
            ? err
            : new Error(
                "Failed to load module details.",
              ),
        );
      }
    })();
  }

  // ==========================================================
  // CLOSE MANAGE MODULE
  // ==========================================================

  function closeManageModule() {
    setManageModuleId(
      null,
    );

    clearModuleFileExtraction();
  }

  // ==========================================================
  // CREATE MODULE
  // ==========================================================

  function openCreateModule() {
    const material =
      selected ??
      allMaterials[0] ??
      null;

    if (!material) {
      setActionError(
        new Error(
          "No published learning material is available.",
        ),
      );

      return;
    }

    setSelected(
      material,
    );

    setSelectedModule(
      null,
    );

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
  //
  // IMPORTANT:
  //
  // moduleNumber and displayOrder are NO LONGER SENT.
  //
  // The backend automatically generates them.
  // ==========================================================

  const handleModuleSubmit = async (
    data: {
      learningMaterialId: string;
      title: string;
      description: string;
    },
  ) => {
    try {
      setActionError(null);

      if (
        !data.learningMaterialId
      ) {
        throw new Error(
          "No learning material is currently selected.",
        );
      }

      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      if (
        moduleFormMode ===
        "create"
      ) {
        await createLearningModule({
          learningMaterialId:
            data.learningMaterialId,

          title:
            data.title,

          description:
            data.description ||
            null,
        });
      }

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      else {
        if (!selectedModule) {
          throw new Error(
            "No learning module is currently selected.",
          );
        }

        await updateLearningModule(
          selectedModule.id,
          {
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
          },
        );
      }

      // --------------------------------------------------------
      // REFRESH MODULES
      // --------------------------------------------------------

      const updatedModules =
        await loadModules(
          data.learningMaterialId,
        );

      setAllModules(
        (current) => {
          const otherModules =
            current.filter(
              (module) =>
                module.learningMaterialId !==
                data.learningMaterialId,
            );

          return [
            ...otherModules,
            ...updatedModules,
          ];
        },
      );

      // --------------------------------------------------------
      // CLOSE
      // --------------------------------------------------------

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
  };

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

      setAllModules(
        (current) =>
          current.filter(
            (module) =>
              module.id !==
              selectedModule.id,
          ),
      );

      if (selected) {
        const updatedModules =
          await loadModules(
            selected.id,
          );

        setAllModules(
          (current) => {
            const otherModules =
              current.filter(
                (module) =>
                  module.learningMaterialId !==
                  selected.id,
              );

            return [
              ...otherModules,
              ...updatedModules,
            ];
          },
        );
      }

      if (
        manageModuleId ===
        selectedModule.id
      ) {
        closeManageModule();
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
        const updatedModules =
          await loadModules(
            selected.id,
          );

        setAllModules(
          (current) => {
            const otherModules =
              current.filter(
                (module) =>
                  module.learningMaterialId !==
                  selected.id,
              );

            return [
              ...otherModules,
              ...updatedModules,
            ];
          },
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
        const updatedModules =
          await loadModules(
            selected.id,
          );

        setAllModules(
          (current) => {
            const otherModules =
              current.filter(
                (module) =>
                  module.learningMaterialId !==
                  selected.id,
              );

            return [
              ...otherModules,
              ...updatedModules,
            ];
          },
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
        const updatedModules =
          await loadModules(
            selected.id,
          );

        setAllModules(
          (current) => {
            const otherModules =
              current.filter(
                (module) =>
                  module.learningMaterialId !==
                  selected.id,
              );

            return [
              ...otherModules,
              ...updatedModules,
            ];
          },
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
        const updatedModules =
          await loadModules(
            selected.id,
          );

        setAllModules(
          (current) => {
            const otherModules =
              current.filter(
                (module) =>
                  module.learningMaterialId !==
                  selected.id,
              );

            return [
              ...otherModules,
              ...updatedModules,
            ];
          },
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

      const materialModules =
        await loadModules(
          selected.id,
        );

      if (
        materialModules.length ===
        0
      ) {
        throw new Error(
          "No learning modules found. Please create a learning module first.",
        );
      }

      for (
        const module of
        materialModules
      ) {
        setGeneratingModuleId(
          module.id,
        );

        await generateModuleAiContent(
          module.id,
        );
      }

      setGeneratingModuleId(
        null,
      );

      const updatedModules =
        await loadModules(
          selected.id,
        );

      setAllModules(
        (current) => {
          const otherModules =
            current.filter(
              (module) =>
                module.learningMaterialId !==
                selected.id,
            );

          return [
            ...otherModules,
            ...updatedModules,
          ];
        },
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
      setGeneratingModuleId(
        null,
      );

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
  // TABLE META
  // ==========================================================

  const tableMeta: TrainerLearningModuleTableMeta = {
    // --------------------------------------------------------
    // MANAGE
    // --------------------------------------------------------

    onManage: (
      row,
    ) => {
      openManageModule(
        row,
      );
    },

    // --------------------------------------------------------
    // OPEN
    // --------------------------------------------------------

    onOpenMaterial:
      handleOpenMaterial,

    // --------------------------------------------------------
    // REPLACE
    // --------------------------------------------------------

    onReplaceMaterial:
      handleReplaceMaterial,

    // --------------------------------------------------------
    // EXTRACT
    // --------------------------------------------------------

    onExtractMaterial:
      handleExtractMaterial,

    // --------------------------------------------------------
    // DELETE
    // --------------------------------------------------------

    onDeleteModule: (
      row,
    ) => {
      openDeleteModule(
        row.module,
      );
    },
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="m-5 space-y-6">

      {/* ======================================================
          HIDDEN REPLACE FILE INPUT
      ====================================================== */}

      <input
        ref={
          replaceFileInputRef
        }
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        onChange={
          handleReplaceFileChange
        }
      />

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageSection
        title="Learning Modules"
        description="Manage modules and lessons from published learning materials assigned to your training batches."
      />

      {/* ======================================================
          ERROR
      ====================================================== */}

      {(actionError ||
        batchError ||
        error) && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-sm font-bold text-red-600">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-900">
                Learning Module Error
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                {
                  actionError
                    ?.message ??
                  batchError
                    ?.message ??
                  error
                }
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
          description="Resources available for training"
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
          description="Lessons currently loaded"
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
        columns={
          columns
        }

        data={
          filteredModules
        }

        meta={
          tableMeta
        }

        loading={
          isLoadingBatches ||
          isLoading
        }

        searchable

        toolbar={
          <div className="flex w-full flex-wrap items-center gap-2">

           

<div className="ml-auto flex items-center gap-2">

  {/* ==================================================
      OPEN FILE
  ================================================== */}

  <button
    type="button"
    onClick={() => {
      const material =
        selected ??
        allMaterials[0] ??
        null;

      if (!material) {
        setActionError(
          new Error(
            "No published learning material is available.",
          ),
        );

        return;
      }

      openMaterial(
        material,
      );
    }}
    disabled={
      allMaterials.length === 0
    }
    className={[
      "inline-flex h-10",
      "items-center justify-center gap-2",
      "rounded-xl",
      "border border-[#002b5c]",
      "bg-white",
      "px-4",
      "text-sm font-semibold",
      "text-[#002b5c]",
      "transition",
      "hover:bg-[#f3f7fb]",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    ].join(" ")}
  >
    <BookOpen className="h-4 w-4" />

    Open File
  </button>

  {/* ==================================================
      ADD MODULE
  ================================================== */}

  <button
    type="button"
    onClick={
      openCreateModule
    }
    disabled={
      allMaterials.length === 0
    }
    className={[
      "inline-flex h-10",
      "items-center justify-center gap-2",
      "rounded-xl",
      "bg-[#002b5c]",
      "px-4",
      "text-sm font-semibold",
      "text-white",
      "transition",
      "hover:bg-[#0d2142]",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    ].join(" ")}
  >
    <Plus className="h-4 w-4" />

    Add Module
  </button>

</div>

          </div>
        }
      />

      {/* ======================================================
          MANAGE MODULE MODAL
      ====================================================== */}

      <LearningMaterialDetailsModal
        open={
          manageModuleId !== null
        }

        material={
          selected
        }

        modules={
          modules
        }

        sections={
          sections
        }

        batchMap={
          batchMap
        }

        moduleFileExtraction={
          moduleFileExtraction
        }

        isUploading={
          isSaving
        }

        isGenerating={
          isGenerating
        }

        isExtracting={
          isExtracting
        }

        generatingModuleId={
          generatingModuleId
        }

        initialManagedModuleId={
          manageModuleId
        }

        onManageModuleClose={
          closeManageModule
        }

        onClose={
          closeManageModule
        }

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

        onGenerateModules={() => {
          void handleGenerateModules();
        }}

        onGenerateModule={(
          moduleId,
        ) => {
          void handleGenerateModule(
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

        onCreateSection={
          openCreateSection
        }

        onEditModule={
          openEditModule
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

        onViewModule={
          openModulePreview
        }
      />

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
          manageModuleId ??
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
          DELETE MODAL
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