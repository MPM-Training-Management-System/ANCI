"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type {
  CreateLearningMaterialRequest,
  CreateLearningModuleRequest,
  CreateLearningSectionRequest,
  LearningMaterial,
  LearningMaterialExtraction,
  LearningModule,
  LearningModuleExtraction,
  LearningSection,
  TrainingBatch,
  TrainerAssignment,
  UpdateLearningMaterialRequest,
  UpdateLearningModuleRequest,
  UpdateLearningSectionRequest,
} from "@repo/types";

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  Badge,
  Button,
  DataTable,
  PageSection,
  StatGrid,
  StatCard
} from "@repo/ui/index";

import {
  learningMaterialApi,
  trainerAssignmentApi,
  trainingBatchApi,
} from "@/lib/api";

import {
  useLearningMaterials,
  useTrainerAssignments,
} from "@repo/hooks";

import { columns } from "./columns";

type MaterialType =
  | "PDF"
  | "Presentation"
  | "Document"
  | "Video"
  | "Activity"
  | "Other";

type ModalType =
  | "create-material"
  | "edit-material"
  | "create-module"
  | "edit-module"
  | "create-section"
  | "edit-section"
  | "delete-material"
  | "delete-module"
  | "delete-section"
  | null;

function formatFileSize(size?: number | null) {
  if (!size || size <= 0) {
    return "No file";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}

function ContentCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h4 className="mb-3 text-sm font-semibold">
        {title}
      </h4>

      <div className="text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

function ListContentCard({
  title,
  items,
}: {
  title: string;
  items?: string[] | null;
}) {
  return (
    <ContentCard title={title}>
      {items && items.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p>No content generated yet.</p>
      )}
    </ContentCard>
  );
}

function Modal({
  title,
  children,
  onClose,
  footer,
  size = "lg",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl" | "2xl";
}) {
  const widthClass =
    size === "md"
      ? "max-w-md"
      : size === "xl"
        ? "max-w-4xl"
        : size === "2xl"
          ? "max-w-6xl"
          : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-990 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`flex max-h-[90vh] w-full ${widthClass} flex-col overflow-hidden rounded-2xl border bg-background shadow-xl`}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmDelete({
  title,
  description,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </Modal>
  );
}

export default function TrainerLearningMaterialsPage() {
  const {
    learningMaterials,
    selectedMaterial,
    extraction,
    modules,
    moduleExtraction,
    sections,

    isLoading,
    isSaving,
    isUploading,
    isGenerating,
    isExtracting,
    isUploadingModule,
    isExtractingModule,

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
    extractLearningModuleText,
    generateModuleAiContent,

    loadSections,
    createLearningSection,
    updateLearningSection,
    deleteLearningSection,

    clearError,
    clearExtraction,
    clearModuleExtraction,
  } = useLearningMaterials(learningMaterialApi);

  const {
    myAssignments,
    isLoadingMyAssignments,
    loadMyAssignments,
    error: assignmentError,
  } = useTrainerAssignments(trainerAssignmentApi, {
    loadAll: false,
  });

  const [allBatches, setAllBatches] = useState<TrainingBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] =
    useState(false);
  const [batchError, setBatchError] = useState<string | null>(
    null,
  );

  const [selectedModule, setSelectedModule] =
    useState<LearningModule | null>(null);

  const [selectedSection, setSelectedSection] =
    useState<LearningSection | null>(null);

  const [modal, setModal] = useState<ModalType>(null);

  const [materialToDelete, setMaterialToDelete] =
    useState<LearningMaterial | null>(null);

  const [moduleToDelete, setModuleToDelete] =
    useState<LearningModule | null>(null);

  const [sectionToDelete, setSectionToDelete] =
    useState<LearningSection | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedBatchId, setSelectedBatchId] =
    useState("");

  const [materialTitle, setMaterialTitle] =
    useState("");

  const [materialDescription, setMaterialDescription] =
    useState("");

  const [materialType, setMaterialType] =
    useState<MaterialType>("PDF");

  const [materialFile, setMaterialFile] =
    useState<File | null>(null);

  const [moduleNumber, setModuleNumber] =
    useState("1");

  const [moduleTitle, setModuleTitle] =
    useState("");

  const [moduleDescription, setModuleDescription] =
    useState("");

  const [moduleWelcomeContent, setModuleWelcomeContent] =
    useState("");

  const [moduleLearningObjectives, setModuleLearningObjectives] =
    useState("");

  const [moduleSummary, setModuleSummary] =
    useState("");

  const [moduleKeyTakeaways, setModuleKeyTakeaways] =
    useState("");

  const [moduleDisplayOrder, setModuleDisplayOrder] =
    useState("1");

  const [moduleFile, setModuleFile] =
    useState<File | null>(null);

  const [sectionNumber, setSectionNumber] =
    useState("1");

  const [sectionTitle, setSectionTitle] =
    useState("");

  const [sectionContentType, setSectionContentType] =
    useState("Text");

  const [sectionContent, setSectionContent] =
    useState("");

  const [sectionMediaUrl, setSectionMediaUrl] =
    useState("");

  const [sectionDisplayOrder, setSectionDisplayOrder] =
    useState("1");

  const assignedBatchIds = useMemo(() => {
    return new Set(
      (myAssignments ?? [])
        .filter((assignment: TrainerAssignment) =>
          assignment.isActive !== false,
        )
        .map(
          (assignment: TrainerAssignment) =>
            assignment.trainingBatchId,
        ),
    );
  }, [myAssignments]);

  const assignedBatches = useMemo(() => {
    return allBatches.filter((batch) =>
      assignedBatchIds.has(batch.id),
    );
  }, [allBatches, assignedBatchIds]);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, TrainerAssignment>();

    for (const assignment of myAssignments ?? []) {
      if (assignment.isActive === false) {
        continue;
      }

      map.set(
        assignment.trainingBatchId,
        assignment,
      );
    }

    return map;
  }, [myAssignments]);

  const batchMap = useMemo(() => {
    const map = new Map<string, TrainingBatch>();

    for (const batch of allBatches) {
      map.set(batch.id, batch);
    }

    return map;
  }, [allBatches]);

  const trainerMaterials = useMemo(() => {
    return learningMaterials.filter((material) =>
      assignedBatchIds.has(material.trainingBatchId),
    );
  }, [learningMaterials, assignedBatchIds]);

  const publishedCount = useMemo(
    () =>
      trainerMaterials.filter(
        (material) => material.isPublished,
      ).length,
    [trainerMaterials],
  );

  const draftCount = useMemo(
    () =>
      trainerMaterials.filter(
        (material) => !material.isPublished,
      ).length,
    [trainerMaterials],
  );

  const loadBatches = useCallback(async () => {
    setIsLoadingBatches(true);
    setBatchError(null);

    try {
      const result = await trainingBatchApi.getAll();
      setAllBatches(result);
    } catch (err) {
      setBatchError(
        getErrorMessage(
          err,
          "Unable to load training batches.",
        ),
      );
    } finally {
      setIsLoadingBatches(false);
    }
  }, []);

  const loadAssignedMaterials = useCallback(async () => {
    if (assignedBatches.length === 0) {
      return;
    }

    try {
      const results = await Promise.all(
        assignedBatches.map((batch) =>
          loadLearningMaterials(batch.id),
        ),
      );

      const flattened = results.flat();

      const unique = Array.from(
        new Map(
          flattened.map((material) => [
            material.id,
            material,
          ]),
        ).values(),
      );

      if (unique.length > 0) {
        // The hook owns the source of truth.
        // Individual batch loading already updates its state.
      }
    } catch {
      // Hook exposes the actual API error.
    }
  }, [
    assignedBatches,
    loadLearningMaterials,
  ]);

  useEffect(() => {
    void loadMyAssignments();
    void loadBatches();
  }, [
    loadMyAssignments,
    loadBatches,
  ]);

  useEffect(() => {
    if (assignedBatches.length > 0) {
      void loadAssignedMaterials();
    }
  }, [
    assignedBatches,
    loadAssignedMaterials,
  ]);

  const resetMaterialForm = useCallback(() => {
    setSelectedBatchId("");
    setMaterialTitle("");
    setMaterialDescription("");
    setMaterialType("PDF");
    setMaterialFile(null);
  }, []);

  const resetModuleForm = useCallback(() => {
    setModuleNumber("1");
    setModuleTitle("");
    setModuleDescription("");
    setModuleWelcomeContent("");
    setModuleLearningObjectives("");
    setModuleSummary("");
    setModuleKeyTakeaways("");
    setModuleDisplayOrder("1");
    setModuleFile(null);
  }, []);

  const resetSectionForm = useCallback(() => {
    setSectionNumber("1");
    setSectionTitle("");
    setSectionContentType("Text");
    setSectionContent("");
    setSectionMediaUrl("");
    setSectionDisplayOrder("1");
  }, []);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      loadMyAssignments(),
      loadBatches(),
    ]);

    if (assignedBatches.length > 0) {
      await loadAssignedMaterials();
    }
  }, [
    loadMyAssignments,
    loadBatches,
    assignedBatches,
    loadAssignedMaterials,
  ]);

  const handleView = useCallback(
    async (material: LearningMaterial) => {
      if (
        !assignedBatchIds.has(
          material.trainingBatchId,
        )
      ) {
        return;
      }

      try {
        clearError();
        clearExtraction();
        clearModuleExtraction();

        setSelectedModule(null);
        setSelectedSection(null);

        const loaded = await loadLearningMaterial(
          material.id,
        );

        setIsDetailsOpen(true);

        await loadModules(loaded.id);
      } catch {
        // Hook handles error state.
      }
    },
    [
      assignedBatchIds,
      clearError,
      clearExtraction,
      clearModuleExtraction,
      loadLearningMaterial,
      loadModules,
    ],
  );

  const handlePublish = useCallback(
    async (material: LearningMaterial) => {
      if (
        !assignedBatchIds.has(
          material.trainingBatchId,
        )
      ) {
        return;
      }

      try {
        await publishLearningMaterial(material.id);
      } catch {
        // Hook handles error.
      }
    },
    [
      assignedBatchIds,
      publishLearningMaterial,
    ],
  );

  const handleDelete = useCallback(
    (material: LearningMaterial) => {
      setMaterialToDelete(material);
      setModal("delete-material");
    },
    [],
  );

  const confirmDeleteMaterial = useCallback(async () => {
    if (!materialToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteLearningMaterial(
        materialToDelete.id,
      );

      if (
        selectedMaterial?.id ===
        materialToDelete.id
      ) {
        setIsDetailsOpen(false);
      }

      setMaterialToDelete(null);
      setModal(null);
    } finally {
      setIsDeleting(false);
    }
  }, [
    materialToDelete,
    deleteLearningMaterial,
    selectedMaterial,
  ]);

  const handleCreateMaterial = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedBatchId) {
      return;
    }

    if (!materialTitle.trim()) {
      return;
    }

    const request: CreateLearningMaterialRequest = {
      trainingBatchId: selectedBatchId,
      title: materialTitle.trim(),
      description:
        materialDescription.trim() || null,
      materialType,
    };

    try {
      const created =
        await createLearningMaterial(request);

      if (materialFile) {
        await uploadLearningMaterial(
          created.id,
          materialFile,
        );
      }

      resetMaterialForm();
      setModal(null);

      const finalMaterial =
        await loadLearningMaterial(created.id);

      setIsDetailsOpen(true);

      await loadModules(finalMaterial.id);
    } catch {
      // Hook handles errors.
    }
  };

  const openEditMaterial = useCallback(() => {
    if (!selectedMaterial) {
      return;
    }

    setMaterialTitle(selectedMaterial.title);
    setMaterialDescription(
      selectedMaterial.description ?? "",
    );
    setMaterialType(
      (selectedMaterial.materialType ||
        "Other") as MaterialType,
    );

    setModal("edit-material");
  }, [selectedMaterial]);

  const handleUpdateMaterial = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedMaterial) {
      return;
    }

    const request: UpdateLearningMaterialRequest = {
      title: materialTitle.trim(),
      description:
        materialDescription.trim() || null,
      materialType,
    };

    try {
      const updated =
        await updateLearningMaterial(
          selectedMaterial.id,
          request,
        );

      if (materialFile) {
        await uploadLearningMaterial(
          updated.id,
          materialFile,
        );
      }

      setMaterialFile(null);
      setModal(null);
    } catch {
      // Hook handles errors.
    }
  };

  const handleMaterialFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setMaterialFile(file);
  };

  const handleExtractMaterial = async () => {
    if (!selectedMaterial) {
      return;
    }

    try {
      await extractLearningMaterialText(
        selectedMaterial.id,
      );
    } catch {
      // Hook handles errors.
    }
  };

  const handleModuleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setModuleFile(file);
  };

  const handleCreateModule = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedMaterial) {
      return;
    }

    const nextNumber =
      modules.length > 0
        ? Math.max(
            ...modules.map(
              (module) => module.moduleNumber,
            ),
          ) + 1
        : 1;

    const nextDisplayOrder =
      modules.length > 0
        ? Math.max(
            ...modules.map(
              (module) => module.displayOrder,
            ),
          ) + 1
        : 1;

    const request: CreateLearningModuleRequest = {
      learningMaterialId:
        selectedMaterial.id,
      moduleNumber:
        Number(moduleNumber) > 0
          ? Number(moduleNumber)
          : nextNumber,
      title: moduleTitle.trim(),
      description:
        moduleDescription.trim() || null,
      displayOrder:
        Number(moduleDisplayOrder) > 0
          ? Number(moduleDisplayOrder)
          : nextDisplayOrder,
    };

    try {
      const created =
        await createLearningModule(request);

      if (moduleFile) {
        const uploaded =
          await uploadLearningModuleFile(
            created.id,
            moduleFile,
          );

        setSelectedModule(uploaded);
      } else {
        setSelectedModule(created);
      }

      await loadModules(selectedMaterial.id);

      if (created.id) {
        await loadSections(created.id);
      }

      resetModuleForm();
      setModuleFile(null);
      setModal(null);
    } catch {
      // Hook handles errors.
    }
  };

  const openEditModule = useCallback(
    (module: LearningModule) => {
      setSelectedModule(module);

      setModuleNumber(
        String(module.moduleNumber),
      );

      setModuleTitle(module.title);
      setModuleDescription(
        module.description ?? "",
      );

      setModuleWelcomeContent(
        module.welcomeContent ?? "",
      );

      setModuleLearningObjectives(
        (module.learningObjectives ?? []).join(
          "\n",
        ),
      );

      setModuleSummary(
        module.summary ?? "",
      );

      setModuleKeyTakeaways(
        (module.keyTakeaways ?? []).join(
          "\n",
        ),
      );

      setModuleDisplayOrder(
        String(module.displayOrder),
      );

      setModal("edit-module");
    },
    [],
  );

  const handleUpdateModule = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedModule) {
      return;
    }

    const learningObjectives =
      moduleLearningObjectives
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    const keyTakeaways =
      moduleKeyTakeaways
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    const request: UpdateLearningModuleRequest = {
      moduleNumber: Number(moduleNumber),
      title: moduleTitle.trim(),
      description:
        moduleDescription.trim() || null,
      welcomeContent:
        moduleWelcomeContent.trim() || null,
      learningObjectives,
      summary:
        moduleSummary.trim() || null,
      keyTakeaways,
      displayOrder: Number(moduleDisplayOrder),
    };

    try {
      const updated =
        await updateLearningModule(
          selectedModule.id,
          request,
        );

      setSelectedModule(updated);
      setModal(null);
    } catch {
      // Hook handles errors.
    }
  };

  const handleUploadModuleFile = async () => {
    if (!selectedModule || !moduleFile) {
      return;
    }

    try {
      const updated =
        await uploadLearningModuleFile(
          selectedModule.id,
          moduleFile,
        );

      setSelectedModule(updated);
      setModuleFile(null);
    } catch {
      // Hook handles errors.
    }
  };

  const handleExtractModule = async (
    module: LearningModule,
  ) => {
    try {
      const result =
        await extractLearningModuleText(
          module.id,
        );

      /*
       * IMPORTANT:
       *
       * The backend returns:
       *
       * LearningModuleExtractionDto {
       *   Text,
       *   CharacterCount,
       *   PageCount,
       *   ...
       * }
       *
       * The hook then places result.text
       * into module.extractedText.
       *
       * Therefore we DO NOT use:
       *
       * moduleExtraction.extractedText
       */
      setSelectedModule((current) => {
        if (!current || current.id !== module.id) {
          return current;
        }

        return {
          ...current,
          extractedText: result.text,
        };
      });
    } catch {
      // Hook handles errors.
    }
  };

  const handleGenerateAi = async (
    module: LearningModule,
  ) => {
    try {
      const updated =
        await generateModuleAiContent(
          module.id,
        );

      setSelectedModule(updated);
    } catch {
      // Hook handles errors.
    }
  };

  const handleDeleteModule = (
    module: LearningModule,
  ) => {
    setModuleToDelete(module);
    setModal("delete-module");
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteLearningModule(
        moduleToDelete.id,
      );

      if (
        selectedModule?.id ===
        moduleToDelete.id
      ) {
        setSelectedModule(null);
      }

      setModuleToDelete(null);
      setModal(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreateSection = useCallback(
    async (module: LearningModule) => {
      setSelectedModule(module);

      const nextNumber =
        sections.length > 0
          ? Math.max(
              ...sections.map(
                (section) =>
                  section.sectionNumber,
              ),
            ) + 1
          : 1;

      const nextDisplayOrder =
        sections.length > 0
          ? Math.max(
              ...sections.map(
                (section) =>
                  section.displayOrder,
              ),
            ) + 1
          : 1;

      setSectionNumber(String(nextNumber));
      setSectionDisplayOrder(
        String(nextDisplayOrder),
      );
      setSectionTitle("");
      setSectionContentType("Text");
      setSectionContent("");
      setSectionMediaUrl("");

      setModal("create-section");
    },
    [sections],
  );

  const handleCreateSection = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedModule) {
      return;
    }

    const request: CreateLearningSectionRequest = {
      learningModuleId:
        selectedModule.id,
      sectionNumber:
        Number(sectionNumber),
      title: sectionTitle.trim(),
      contentType:
        sectionContentType.trim() || "Text",
      content:
        sectionContent.trim() || null,
      mediaUrl:
        sectionMediaUrl.trim() || null,
      displayOrder:
        Number(sectionDisplayOrder),
    };

    try {
      await createLearningSection(request);

      await loadSections(
        selectedModule.id,
      );

      resetSectionForm();
      setModal(null);
    } catch {
      // Hook handles errors.
    }
  };

  const openEditSection = useCallback(
    (section: LearningSection) => {
      setSelectedSection(section);

      setSectionNumber(
        String(section.sectionNumber),
      );

      setSectionTitle(section.title);

      setSectionContentType(
        section.contentType,
      );

      setSectionContent(
        section.content ?? "",
      );

      setSectionMediaUrl(
        section.mediaUrl ?? "",
      );

      setSectionDisplayOrder(
        String(section.displayOrder),
      );

      setModal("edit-section");
    },
    [],
  );

  const handleUpdateSection = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedSection) {
      return;
    }

    const request: UpdateLearningSectionRequest = {
      sectionNumber:
        Number(sectionNumber),
      title: sectionTitle.trim(),
      contentType:
        sectionContentType.trim() || "Text",
      content:
        sectionContent.trim() || null,
      mediaUrl:
        sectionMediaUrl.trim() || null,
      displayOrder:
        Number(sectionDisplayOrder),
    };

    try {
      await updateLearningSection(
        selectedSection.id,
        request,
      );

      if (selectedModule) {
        await loadSections(
          selectedModule.id,
        );
      }

      setSelectedSection(null);
      setModal(null);
    } catch {
      // Hook handles errors.
    }
  };

  const handleDeleteSection = (
    section: LearningSection,
  ) => {
    setSectionToDelete(section);
    setModal("delete-section");
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteLearningSection(
        sectionToDelete.id,
      );

      if (selectedModule) {
        await loadSections(
          selectedModule.id,
        );
      }

      setSectionToDelete(null);
      setModal(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectModule = async (
    module: LearningModule,
  ) => {
    setSelectedModule(module);
    setSelectedSection(null);
    clearModuleExtraction();

    try {
      await loadSections(module.id);
    } catch {
      // Hook handles errors.
    }
  };

  const detailsMaterial =
    selectedMaterial;

  const detailsBatch = detailsMaterial
    ? batchMap.get(
        detailsMaterial.trainingBatchId,
      )
    : undefined;

  return (
    <div className="space-y-6 p-6">
      <PageSection
        title="Learning Materials"
        description="Create, manage, organize, and generate training learning materials."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRefresh()}
              disabled={
                isLoading ||
                isLoadingBatches ||
                isLoadingMyAssignments
              }
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isLoading ||
                  isLoadingBatches ||
                  isLoadingMyAssignments
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </Button>

            <Button
              type="button"
              onClick={() => {
                resetMaterialForm();
                setModal("create-material");
              }}
              disabled={
                assignedBatches.length === 0
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Material
            </Button>
          </div>
        }
      />

      {(error ||
        assignmentError ||
        batchError) && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error ||
            assignmentError ||
            batchError}
        </div>
      )}

      <StatGrid>
        <StatCard
          variant="primary"
          title="My Materials"
          value={trainerMaterials.length}
          icon={
            BookOpen 
          }
        />

        <StatCard
        variant="success"
          title="Published"
          value={publishedCount}
          icon={
            FileText 
          }
        />

        <StatCard
        variant="warning"
          title="Drafts"
          value={draftCount}
          icon={
            Layers3
          }
        />

        <StatCard
        variant="primary"
          title="Assigned Batches"
          value={assignedBatches.length}
          icon={
            BookOpen
          }
        />
      </StatGrid>

        <div>
          {isLoading &&
          trainerMaterials.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading learning materials...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={trainerMaterials}
              meta={{
                batchMap,
                onView: handleView,
                onPublish: handlePublish,
                onDelete: handleDelete,
              }}
            />
          )}
        </div>
   

      {modal === "create-material" && (
        <Modal
          title="Create Learning Material"
          onClose={() => {
            resetMaterialForm();
            setModal(null);
          }}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetMaterialForm();
                  setModal(null);
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="create-material-form"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Material
                  </>
                )}
              </Button>
            </>
          }
        >
          <form
            id="create-material-form"
            onSubmit={handleCreateMaterial}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Training Batch
              </label>

              <select
                value={selectedBatchId}
                onChange={(event) =>
                  setSelectedBatchId(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">
                  Select training batch
                </option>

                {assignedBatches.map((batch) => (
                  <option
                    key={batch.id}
                    value={batch.id}
                  >
                    {batch.batchCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Title
              </label>

              <input
                value={materialTitle}
                onChange={(event) =>
                  setMaterialTitle(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="Enter learning material title"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={materialDescription}
                onChange={(event) =>
                  setMaterialDescription(
                    event.target.value,
                  )
                }
                rows={4}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Material Type
              </label>

              <select
                value={materialType}
                onChange={(event) =>
                  setMaterialType(
                    event.target.value as MaterialType,
                  )
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="PDF">
                  PDF
                </option>
                <option value="Presentation">
                  Presentation
                </option>
                <option value="Document">
                  Document
                </option>
                <option value="Video">
                  Video
                </option>
                <option value="Activity">
                  Activity
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                File
              </label>

              <input
                type="file"
                accept=".pdf,.docx,.pptx"
                onChange={handleMaterialFileChange}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                Allowed: PDF, DOCX, PPTX. Maximum 50 MB.
              </p>
            </div>
          </form>
        </Modal>
      )}

      {isDetailsOpen &&
        detailsMaterial && (
          <Modal
            title={detailsMaterial.title}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedModule(null);
              setSelectedSection(null);
              clearExtraction();
              clearModuleExtraction();
            }}
            size="2xl"
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openEditMaterial}
                >
                  Edit Material
                </Button>

                {!detailsMaterial.isPublished && (
                  <Button
                    type="button"
                    onClick={() =>
                      void handlePublish(
                        detailsMaterial,
                      )
                    }
                  >
                    Publish Material
                  </Button>
                )}
              </>
            }
          >
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Info
                  label="Training Program"
                  value={
                    detailsBatch?.programName 
                    
                  }
                />

                <Info
                  label="Training Batch"
                  value={
                    detailsBatch?.batchCode ??
                    detailsMaterial.batchCode
                  }
                />

                <Info
                  label="Material Type"
                  value={
                    detailsMaterial.materialType
                  }
                />

                <Info
                  label="Status"
                  value={
                    detailsMaterial.isPublished
                      ? "Published"
                      : "Draft"
                  }
                />
              </div>

              <ContentCard title="Description">
                <p>
                  {detailsMaterial.description ||
                    "No description provided."}
                </p>
              </ContentCard>

              <div className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">
                      Learning Material File
                    </h4>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {detailsMaterial.fileName ||
                        "No file uploaded"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted">
                      <Upload className="mr-2 h-4 w-4" />

                      Replace File

                      <input
                        type="file"
                        accept=".pdf,.docx,.pptx"
                        className="hidden"
                        onChange={async (
                          event,
                        ) => {
                          const file =
                            event.target.files?.[0];

                          if (!file) {
                            return;
                          }

                          try {
                            await uploadLearningMaterial(
                              detailsMaterial.id,
                              file,
                            );
                          } catch {
                            // Hook handles error.
                          }
                        }}
                      />
                    </label>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        void handleExtractMaterial()
                      }
                      disabled={
                        !detailsMaterial.fileUrl ||
                        isExtracting
                      }
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Extract Text
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {detailsMaterial.fileName && (
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <Info
                      label="File Name"
                      value={
                        detailsMaterial.fileName
                      }
                    />

                    <Info
                      label="Content Type"
                      value={
                        detailsMaterial.contentType
                      }
                    />

                    <Info
                      label="File Size"
                      value={formatFileSize(
                        detailsMaterial.fileSize,
                      )}
                    />
                  </div>
                )}
              </div>

              {extraction && (
                <div className="rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">
                        Extraction Result
                      </h4>

                      <p className="text-sm text-muted-foreground">
                        {extraction.fileName}
                      </p>
                    </div>

                    <Badge>
                      {extraction.characterCount} characters
                    </Badge>
                  </div>

                  <div className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                    {extraction.text}
                  </div>
                </div>
              )}

              {!extraction &&
                detailsMaterial.extractedText && (
                  <div className="rounded-xl border bg-card p-5">
                    <h4 className="font-semibold">
                      Extracted Text
                    </h4>

                    <div className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                      {detailsMaterial.extractedText}
                    </div>
                  </div>
                )}

              <div className="rounded-xl border bg-card">
                <div className="flex items-center justify-between border-b p-5">
                  <div>
                    <h4 className="font-semibold">
                      Learning Modules
                    </h4>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Organize the material into modules,
                      upload module files, extract content,
                      and generate AI-assisted content.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      resetModuleForm();

                      const nextNumber =
                        modules.length > 0
                          ? Math.max(
                              ...modules.map(
                                (module) =>
                                  module.moduleNumber,
                              ),
                            ) + 1
                          : 1;

                      const nextDisplayOrder =
                        modules.length > 0
                          ? Math.max(
                              ...modules.map(
                                (module) =>
                                  module.displayOrder,
                              ),
                            ) + 1
                          : 1;

                      setModuleNumber(
                        String(nextNumber),
                      );

                      setModuleDisplayOrder(
                        String(
                          nextDisplayOrder,
                        ),
                      );

                      setModal(
                        "create-module",
                      );
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Module
                  </Button>
                </div>

                <div className="divide-y">
                  {modules.length === 0 ? (
                    <div className="p-8 text-center">
                      <Layers3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                      <p className="font-medium">
                        No modules yet
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Add the first learning module.
                      </p>
                    </div>
                  ) : (
                    modules.map((module) => {
                      const isSelected =
                        selectedModule?.id ===
                        module.id;

                      return (
                        <div
                          key={module.id}
                          className="p-5"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              void handleSelectModule(
                                module,
                              )
                            }
                            className="flex w-full items-start justify-between gap-4 text-left"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="mt-0.5">
                                {isSelected ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge>
                                    Module{" "}
                                    {
                                      module.moduleNumber
                                    }
                                  </Badge>

                                  <h5 className="font-semibold">
                                    {module.title}
                                  </h5>
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  {module.description ||
                                    "No description"}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <Badge>
                                {
                                  module.sectionCount
                                }{" "}
                                section
                                {module.sectionCount !==
                                1
                                  ? "s"
                                  : ""}
                              </Badge>
                            </div>
                          </button>

                          {isSelected && (
                            <div className="mt-5 space-y-5 border-t pt-5">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    openEditModule(
                                      module,
                                    )
                                  }
                                >
                                  Edit
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    void handleGenerateAi(
                                      module,
                                    )
                                  }
                                  disabled={
                                    isGenerating
                                  }
                                >
                                  {isGenerating ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      Generate AI Content
                                    </>
                                  )}
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    handleDeleteModule(
                                      module,
                                    )
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>

                              <div className="rounded-xl border p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <h5 className="font-semibold">
                                      Module File
                                    </h5>

                                    <p className="text-sm text-muted-foreground">
                                      {module.fileName ||
                                        "No module file uploaded"}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted">
                                      <Upload className="mr-2 h-4 w-4" />

                                      Upload File

                                      <input
                                        type="file"
                                        accept=".pdf,.docx,.pptx"
                                        className="hidden"
                                        onChange={async (
                                          event,
                                        ) => {
                                          const file =
                                            event
                                              .target
                                              .files?.[0];

                                          if (!file) {
                                            return;
                                          }

                                          try {
                                            const updated =
                                              await uploadLearningModuleFile(
                                                module.id,
                                                file,
                                              );

                                            setSelectedModule(
                                              updated,
                                            );
                                          } catch {
                                            // Hook handles error.
                                          }
                                        }}
                                      />
                                    </label>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() =>
                                        void handleExtractModule(
                                          module,
                                        )
                                      }
                                      disabled={
                                        !module.fileUrl ||
                                        isExtractingModule
                                      }
                                    >
                                      {isExtractingModule ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Extracting...
                                        </>
                                      ) : (
                                        <>
                                          <FileText className="mr-2 h-4 w-4" />
                                          Extract Text
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {module.fileName && (
                                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                                    <Info
                                      label="File Name"
                                      value={
                                        module.fileName
                                      }
                                    />

                                    <Info
                                      label="Content Type"
                                      value={
                                        module.contentType
                                      }
                                    />

                                    <Info
                                      label="File Size"
                                      value={formatFileSize(
                                        module.fileSize,
                                      )}
                                    />
                                  </div>
                                )}
                              </div>

                              {moduleExtraction &&
                                moduleExtraction.learningModuleId ===
                                  module.id && (
                                  <div className="rounded-xl border bg-muted/30 p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div>
                                        <h5 className="font-semibold">
                                          Module Extraction
                                        </h5>

                                        <p className="text-sm text-muted-foreground">
                                          {
                                            moduleExtraction.fileName
                                          }
                                        </p>
                                      </div>

                                      <Badge>
                                        {
                                          moduleExtraction.characterCount
                                        }{" "}
                                        characters
                                      </Badge>
                                    </div>

                                    <div className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-4 text-sm">
                                      {
                                        moduleExtraction.text
                                      }
                                    </div>
                                  </div>
                                )}

                              {module.extractedText && (
                                <div className="rounded-xl border bg-muted/30 p-5">
                                  <h5 className="font-semibold">
                                    Extracted Text
                                  </h5>

                                  <div className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-background p-4 text-sm">
                                    {
                                      module.extractedText
                                    }
                                  </div>
                                </div>
                              )}

                              <div className="grid gap-4 md:grid-cols-2">
                                <ContentCard title="Welcome Content">
                                  {module.welcomeContent ||
                                    "No AI-generated welcome content yet."}
                                </ContentCard>

                                <ContentCard title="Summary">
                                  {module.summary ||
                                    "No AI-generated summary yet."}
                                </ContentCard>

                                <ListContentCard
                                  title="Learning Objectives"
                                  items={
                                    module.learningObjectives
                                  }
                                />

                                <ListContentCard
                                  title="Key Takeaways"
                                  items={
                                    module.keyTakeaways
                                  }
                                />
                              </div>

                              <div className="rounded-xl border">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                                  <div>
                                    <h5 className="font-semibold">
                                      Sections
                                    </h5>

                                    <p className="text-sm text-muted-foreground">
                                      Manage the sections inside
                                      this module.
                                    </p>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      void openCreateSection(
                                        module,
                                      )
                                    }
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Section
                                  </Button>
                                </div>

                                <div className="divide-y">
                                  {sections.length ===
                                  0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                      No sections yet.
                                    </div>
                                  ) : (
                                    sections.map(
                                      (
                                        section,
                                      ) => (
                                        <div
                                          key={
                                            section.id
                                          }
                                          className="flex flex-wrap items-start justify-between gap-4 p-4"
                                        >
                                          <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                              <Badge>
                                                Section{" "}
                                                {
                                                  section.sectionNumber
                                                }
                                              </Badge>

                                              <p className="font-medium">
                                                {
                                                  section.title
                                                }
                                              </p>
                                            </div>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                              {
                                                section.contentType
                                              }
                                            </p>

                                            {section.content && (
                                              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                {
                                                  section.content
                                                }
                                              </p>
                                            )}
                                          </div>

                                          <div className="flex gap-2">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                openEditSection(
                                                  section,
                                                )
                                              }
                                            >
                                              Edit
                                            </Button>

                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteSection(
                                                  section,
                                                )
                                              }
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              Delete
                                            </Button>
                                          </div>
                                        </div>
                                      ),
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}

      {modal === "edit-material" &&
        selectedMaterial && (
          <Modal
            title="Edit Learning Material"
            onClose={() => setModal(null)}
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  form="edit-material-form"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            }
          >
            <form
              id="edit-material-form"
              onSubmit={handleUpdateMaterial}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title
                </label>

                <input
                  value={materialTitle}
                  onChange={(event) =>
                    setMaterialTitle(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={materialDescription}
                  onChange={(event) =>
                    setMaterialDescription(
                      event.target.value,
                    )
                  }
                  rows={4}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Material Type
                </label>

                <select
                  value={materialType}
                  onChange={(event) =>
                    setMaterialType(
                      event.target.value as MaterialType,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="PDF">
                    PDF
                  </option>
                  <option value="Presentation">
                    Presentation
                  </option>
                  <option value="Document">
                    Document
                  </option>
                  <option value="Video">
                    Video
                  </option>
                  <option value="Activity">
                    Activity
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Replace File
                </label>

                <input
                  type="file"
                  accept=".pdf,.docx,.pptx"
                  onChange={handleMaterialFileChange}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            </form>
          </Modal>
        )}

      {modal === "create-module" &&
        selectedMaterial && (
          <Modal
            title="Create Learning Module"
            onClose={() => {
              resetModuleForm();
              setModal(null);
            }}
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetModuleForm();
                    setModal(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  form="create-module-form"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Module
                    </>
                  )}
                </Button>
              </>
            }
          >
            <form
              id="create-module-form"
              onSubmit={handleCreateModule}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Module Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={moduleNumber}
                    onChange={(event) =>
                      setModuleNumber(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={moduleDisplayOrder}
                    onChange={(event) =>
                      setModuleDisplayOrder(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title
                </label>

                <input
                  value={moduleTitle}
                  onChange={(event) =>
                    setModuleTitle(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Module title"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={moduleDescription}
                  onChange={(event) =>
                    setModuleDescription(
                      event.target.value,
                    )
                  }
                  rows={4}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Module File
                </label>

                <input
                  type="file"
                  accept=".pdf,.docx,.pptx"
                  onChange={handleModuleFileChange}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  Allowed: PDF, DOCX, PPTX. Maximum 50 MB.
                </p>
              </div>
            </form>
          </Modal>
        )}

      {modal === "edit-module" &&
        selectedModule && (
          <Modal
            title="Edit Learning Module"
            onClose={() => setModal(null)}
            size="xl"
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  form="edit-module-form"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Module"
                  )}
                </Button>
              </>
            }
          >
            <form
              id="edit-module-form"
              onSubmit={handleUpdateModule}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Module Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={moduleNumber}
                    onChange={(event) =>
                      setModuleNumber(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={moduleDisplayOrder}
                    onChange={(event) =>
                      setModuleDisplayOrder(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title
                </label>

                <input
                  value={moduleTitle}
                  onChange={(event) =>
                    setModuleTitle(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={moduleDescription}
                  onChange={(event) =>
                    setModuleDescription(
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="rounded-xl border p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />

                  <h4 className="font-semibold">
                    AI Content
                  </h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Welcome Content
                    </label>

                    <textarea
                      value={
                        moduleWelcomeContent
                      }
                      onChange={(event) =>
                        setModuleWelcomeContent(
                          event.target.value,
                        )
                      }
                      rows={4}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Learning Objectives
                    </label>

                    <textarea
                      value={
                        moduleLearningObjectives
                      }
                      onChange={(event) =>
                        setModuleLearningObjectives(
                          event.target.value,
                        )
                      }
                      rows={5}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="One objective per line"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Summary
                    </label>

                    <textarea
                      value={moduleSummary}
                      onChange={(event) =>
                        setModuleSummary(
                          event.target.value,
                        )
                      }
                      rows={5}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Key Takeaways
                    </label>

                    <textarea
                      value={moduleKeyTakeaways}
                      onChange={(event) =>
                        setModuleKeyTakeaways(
                          event.target.value,
                        )
                      }
                      rows={5}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="One takeaway per line"
                    />
                  </div>
                </div>
              </div>
            </form>
          </Modal>
        )}

      {modal === "create-section" &&
        selectedModule && (
          <Modal
            title="Create Learning Section"
            onClose={() => {
              resetSectionForm();
              setModal(null);
            }}
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetSectionForm();
                    setModal(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  form="create-section-form"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Section
                    </>
                  )}
                </Button>
              </>
            }
          >
            <form
              id="create-section-form"
              onSubmit={handleCreateSection}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Section Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={sectionNumber}
                    onChange={(event) =>
                      setSectionNumber(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={sectionDisplayOrder}
                    onChange={(event) =>
                      setSectionDisplayOrder(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title
                </label>

                <input
                  value={sectionTitle}
                  onChange={(event) =>
                    setSectionTitle(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Content Type
                </label>

                <select
                  value={sectionContentType}
                  onChange={(event) =>
                    setSectionContentType(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="Text">
                    Text
                  </option>
                  <option value="Video">
                    Video
                  </option>
                  <option value="Image">
                    Image
                  </option>
                  <option value="Document">
                    Document
                  </option>
                  <option value="Activity">
                    Activity
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Content
                </label>

                <textarea
                  value={sectionContent}
                  onChange={(event) =>
                    setSectionContent(
                      event.target.value,
                    )
                  }
                  rows={6}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Media URL
                </label>

                <input
                  value={sectionMediaUrl}
                  onChange={(event) =>
                    setSectionMediaUrl(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder="Optional media URL"
                />
              </div>
            </form>
          </Modal>
        )}

      {modal === "edit-section" &&
        selectedSection && (
          <Modal
            title="Edit Learning Section"
            onClose={() => setModal(null)}
            footer={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  form="edit-section-form"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Section"
                  )}
                </Button>
              </>
            }
          >
            <form
              id="edit-section-form"
              onSubmit={handleUpdateSection}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Section Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={sectionNumber}
                    onChange={(event) =>
                      setSectionNumber(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={sectionDisplayOrder}
                    onChange={(event) =>
                      setSectionDisplayOrder(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Title
                </label>

                <input
                  value={sectionTitle}
                  onChange={(event) =>
                    setSectionTitle(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Content Type
                </label>

                <select
                  value={sectionContentType}
                  onChange={(event) =>
                    setSectionContentType(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="Text">
                    Text
                  </option>
                  <option value="Video">
                    Video
                  </option>
                  <option value="Image">
                    Image
                  </option>
                  <option value="Document">
                    Document
                  </option>
                  <option value="Activity">
                    Activity
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Content
                </label>

                <textarea
                  value={sectionContent}
                  onChange={(event) =>
                    setSectionContent(
                      event.target.value,
                    )
                  }
                  rows={6}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Media URL
                </label>

                <input
                  value={sectionMediaUrl}
                  onChange={(event) =>
                    setSectionMediaUrl(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            </form>
          </Modal>
        )}

      {modal === "delete-material" &&
        materialToDelete && (
          <ConfirmDelete
            title="Delete Learning Material"
            description={`Are you sure you want to delete "${materialToDelete.title}"? This will also affect its related modules and sections according to your database relationship configuration.`}
            onCancel={() => {
              setMaterialToDelete(null);
              setModal(null);
            }}
            onConfirm={() =>
              void confirmDeleteMaterial()
            }
            isDeleting={isDeleting}
          />
        )}

      {modal === "delete-module" &&
        moduleToDelete && (
          <ConfirmDelete
            title="Delete Learning Module"
            description={`Are you sure you want to delete "${moduleToDelete.title}"?`}
            onCancel={() => {
              setModuleToDelete(null);
              setModal(null);
            }}
            onConfirm={() =>
              void confirmDeleteModule()
            }
            isDeleting={isDeleting}
          />
        )}

      {modal === "delete-section" &&
        sectionToDelete && (
          <ConfirmDelete
            title="Delete Learning Section"
            description={`Are you sure you want to delete "${sectionToDelete.title}"?`}
            onCancel={() => {
              setSectionToDelete(null);
              setModal(null);
            }}
            onConfirm={() =>
              void confirmDeleteSection()
            }
            isDeleting={isDeleting}
          />
        )}
    </div>
  );
}