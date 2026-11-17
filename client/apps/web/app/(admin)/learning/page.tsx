"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
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
  BookOpen,
  BookCheck,
  Layers3,
  FileText,
  FolderOpen,
  Plus,
  Search,
  ChevronRight,
  ArrowUpRight,
  Clock3,
  CircleCheck,
  Pencil,
  Trash2,
  Upload,
  RefreshCw,
  X,
  File,
  FileUp,
  Eye,
  GraduationCap,
  ListChecks,
  PanelLeft,
  Image as ImageIcon,
  Heading,
  AlignLeft,
  List,
  ListOrdered,
  CircleDot,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
} from "lucide-react";

// ============================================================
// LESSON CONTENT TYPES
// ============================================================

type LessonBlockType =
  | "paragraph"
  | "heading"
  | "bulletList"
  | "numberedList"
  | "radioList"
  | "image";

type LessonBlock = {
  id: string;
  type: LessonBlockType;
  content?: string;
  items?: string[];
  url?: string;
  caption?: string;
};

type LessonContent = {
  version: 1;
  objectives: string[];
  blocks: LessonBlock[];
};

function createBlock(type: LessonBlockType): LessonBlock {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    content:
      type === "paragraph" || type === "heading" ? "" : undefined,
    items:
      type === "bulletList" ||
      type === "numberedList" ||
      type === "radioList"
        ? [""]
        : undefined,
    url: type === "image" ? "" : undefined,
    caption: type === "image" ? "" : undefined,
  };
}

function parseLessonContent(raw?: string | null): LessonContent {
  const fallback: LessonContent = {
    version: 1,
    objectives: [],
    blocks: [],
  };

  if (!raw?.trim()) return fallback;

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.blocks)
    ) {
      return {
        version: 1,
        objectives: Array.isArray(parsed.objectives)
          ? parsed.objectives.filter(
              (item: unknown): item is string =>
                typeof item === "string",
            )
          : [],
        blocks: parsed.blocks
          .filter(
            (block: any) =>
              block &&
              typeof block === "object" &&
              [
                "paragraph",
                "heading",
                "bulletList",
                "numberedList",
                "radioList",
                "image",
              ].includes(block.type),
          )
          .map((block: any) => ({
            id:
              typeof block.id === "string"
                ? block.id
                : `${Date.now()}-${Math.random()}`,
            type: block.type as LessonBlockType,
            content:
              typeof block.content === "string"
                ? block.content
                : "",
            items: Array.isArray(block.items)
              ? block.items.filter(
                  (item: unknown): item is string =>
                    typeof item === "string",
                )
              : undefined,
            url:
              typeof block.url === "string"
                ? block.url
                : "",
            caption:
              typeof block.caption === "string"
                ? block.caption
                : "",
          })),
      };
    }
  } catch {
    // Existing plain-text lesson content is handled below.
  }

  return {
    version: 1,
    objectives: [],
    blocks: [
      {
        id: "legacy-content",
        type: "paragraph",
        content: raw,
      },
    ],
  };
}

function serializeLessonContent(
  objectives: string[],
  blocks: LessonBlock[],
): string {
  const content: LessonContent = {
    version: 1,
    objectives: objectives
      .map((item) => item.trim())
      .filter(Boolean),
    blocks: blocks.map((block) => ({
      ...block,
      content: block.content?.trim() ?? "",
      items: block.items
        ?.map((item) => item.trim())
        .filter(Boolean),
      url: block.url?.trim() ?? "",
      caption: block.caption?.trim() ?? "",
    })),
  };

  return JSON.stringify(content);
}

function escapeLessonHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function blocksToEditorHtml(blocks: LessonBlock[]): string {
  return blocks.map((block) => {
    if (block.type === "heading") return `<h2>${block.content || ""}</h2>`;
    if (block.type === "paragraph") return `<p>${block.content || ""}</p>`;
   if (block.type === "bulletList" || block.type === "radioList") {
      return `<ul>${(block.items ?? [])
        .map((item) => `<li>${item.replace(/<\/?p[^>]*>/gi, "")}</li>`)
        .join("")}</ul>`;
    }
    if (block.type === "numberedList") {
      return `<ol>${(block.items ?? [])
        .map((item) => `<li>${item.replace(/<\/?p[^>]*>/gi, "")}</li>`)
        .join("")}</ol>`;
    }
    if (block.type === "image" && block.url) {
      return `<p><img src="${escapeLessonHtml(block.url)}" alt="${escapeLessonHtml(block.caption || "Lesson image")}" /></p>`;
    }
    return "";
  }).join("") || "<p><br></p>";
}

function editorHtmlToBlocks(html: string): LessonBlock[] {
  const root = document.createElement("div");
  root.innerHTML = html;
  const result: LessonBlock[] = [];
  const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const addParagraph = (node: Element) => {
    const content = node.innerHTML.trim();
    if (content || node.textContent?.trim()) result.push({ id: makeId(), type: "paragraph", content });
  };
  Array.from(root.children).forEach((node) => {
    const tag = node.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      result.push({ id: makeId(), type: "heading", content: node.innerHTML.trim() });
   } else if (tag === "ul" || tag === "ol") {
      const items = Array.from(node.querySelectorAll(":scope > li"))
        .map((item) => {
          // Tanggalin ang wrapper na <p> sa loob ng <li> kung mayroon
          return item.innerHTML
            .replace(/<\/?p[^>]*>/gi, "")
            .trim();
        })
        .filter(Boolean);
      if (items.length) {
        result.push({ 
          id: makeId(), 
          type: tag === "ul" ? "bulletList" : "numberedList", 
          items 
        });
      }
    } else if (tag === "img") {
      const img = node as HTMLImageElement;
      result.push({ id: makeId(), type: "image", url: img.src, caption: img.alt || "" });
    } else if (node.querySelector("img")) {
      const img = node.querySelector("img") as HTMLImageElement;
      const before = node.cloneNode(true) as Element;
      before.querySelector("img")?.remove();
      if (before.textContent?.trim()) addParagraph(before);
      result.push({ id: makeId(), type: "image", url: img.getAttribute("src") || "", caption: img.getAttribute("alt") || "" });
    } else if (tag === "div") {
      addParagraph(node);
    } else {
      addParagraph(node);
    }
  });
  if (!result.length && root.textContent?.trim()) {
    result.push({ id: makeId(), type: "paragraph", content: escapeLessonHtml(root.textContent).replace(/\n/g, "<br>") });
  }
  return result;
}

// ============================================================
// PAGE
// ============================================================

export default function TrainerLearning() {
  const {
    modules,
    sections,
    isLoading,
    isSaving,
    isExtracting,
    error,
    loadLearningMaterials,
    loadModules,
    createLearningModule,
    updateLearningModule,
    deleteLearningModule,
    uploadLearningModuleFile,
    extractLearningModuleFileText,
    extractAllLearningModuleFiles,
    loadSections,
    createLearningSection,
    updateLearningSection,
    deleteLearningSection,
  } = useLearningMaterials(learningMaterialApi);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadModuleIdRef = useRef<string | null>(null);

  const [batches, setBatches] = useState<TrainingBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const [allMaterials, setAllMaterials] = useState<LearningMaterial[]>([]);
  const [allModules, setAllModules] = useState<LearningModule[]>([]);

  const [selectedMaterial, setSelectedMaterial] =
    useState<LearningMaterial | null>(null);

  const [selectedModule, setSelectedModule] =
    useState<LearningModule | null>(null);

  const [search, setSearch] = useState("");
  const [trainingFilter, setTrainingFilter] = useState("All Trainings");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);

  const [editingModule, setEditingModule] =
    useState<LearningModule | null>(null);

  const [editingSection, setEditingSection] =
    useState<LearningSection | null>(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<"module" | "section" | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");

  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContentType, setSectionContentType] = useState("Text");
  const [sectionMediaUrl, setSectionMediaUrl] = useState("");

  const [lessonObjectives, setLessonObjectives] = useState<string[]>([""]);
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([
    createBlock("paragraph"),
  ]);
  const lessonEditorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showSectionForm && lessonEditorRef.current) {
      lessonEditorRef.current.innerHTML = blocksToEditorHtml(lessonBlocks);
    }
  }, [showSectionForm, editingSection]);

  const loadData = useCallback(async () => {
    try {
      setIsLoadingBatches(true);
      setActionError(null);

      const batchResults = await trainingBatchApi.getAssigned();
      setBatches(batchResults);

      const materialResults = await Promise.all(
        batchResults.map(async (batch) => {
          try {
            return await loadLearningMaterials(batch.id);
          } catch {
            return [];
          }
        }),
      );

      const uniqueMaterials = Array.from(
        new Map(
          materialResults.flat().map((material) => [
            material.id,
            material,
          ]),
        ).values(),
      );

      setAllMaterials(uniqueMaterials);

      const moduleResults = await Promise.all(
        uniqueMaterials.map(async (material) => {
          try {
            return await loadModules(material.id);
          } catch {
            return [];
          }
        }),
      );

      const uniqueModules = Array.from(
        new Map(
          moduleResults.flat().map((module) => [
            module.id,
            module,
          ]),
        ).values(),
      );

      setAllModules(uniqueModules);

      setSelectedMaterial((current) => {
        if (current) {
          return (
            uniqueMaterials.find(
              (material) => material.id === current.id,
            ) ??
            uniqueMaterials[0] ??
            null
          );
        }

        return uniqueMaterials[0] ?? null;
      });
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to load learning materials.",
      );
    } finally {
      setIsLoadingBatches(false);
    }
  }, [loadLearningMaterials, loadModules]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const batchMap = useMemo(
    () =>
      new Map(
        batches.map((batch) => [batch.id, batch]),
      ),
    [batches],
  );

  const trainingOptions = useMemo(
    () => [
      "All Trainings",
      ...Array.from(
        new Set(
          batches
            .map((batch) => batch.programName)
            .filter(Boolean),
        ),
      ),
    ],
    [batches],
  );

  const filteredMaterials = useMemo(() => {
    const query = search.toLowerCase().trim();

    return allMaterials.filter((material) => {
      const batch = batchMap.get(material.trainingBatchId);

      const trainingName = batch?.programName ?? "";
      const batchCode = batch?.batchCode ?? "";

      const matchesSearch =
        !query ||
        material.title.toLowerCase().includes(query) ||
        trainingName.toLowerCase().includes(query) ||
        batchCode.toLowerCase().includes(query);

      const matchesTraining =
        trainingFilter === "All Trainings" ||
        trainingName === trainingFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        (statusFilter === "Published" && material.isPublished) ||
        (statusFilter === "Draft" && !material.isPublished);

      return matchesSearch && matchesTraining && matchesStatus;
    });
  }, [
    allMaterials,
    batchMap,
    search,
    trainingFilter,
    statusFilter,
  ]);

  const selectedModules = useMemo(() => {
    if (!selectedMaterial) return [];

    return allModules
      .filter(
        (module) =>
          module.learningMaterialId === selectedMaterial.id,
      )
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [allModules, selectedMaterial]);

  const publishedCount = allMaterials.filter(
    (material) => material.isPublished,
  ).length;

  const draftCount = allMaterials.length - publishedCount;
  const moduleCount = allModules.length;

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      await loadData();
      setSuccessMessage("Learning materials refreshed.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleSelectMaterial(material: LearningMaterial) {
    setSelectedMaterial(material);
    setSelectedModule(null);
    setActionError(null);

    try {
      await loadModules(material.id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to load modules.",
      );
    }
  }

  async function handleSelectModule(module: LearningModule) {
    setSelectedModule(module);
    setActionError(null);

    try {
      await loadSections(module.id);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to load lessons.",
      );
    }
  }

  function handleOpenSource() {
    if (!selectedMaterial?.fileUrl) {
      setActionError("No source document is available.");
      return;
    }

    window.open(
      selectedMaterial.fileUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function openCreateModule() {
    if (!selectedMaterial) {
      setActionError("Please select a learning material first.");
      return;
    }

    setEditingModule(null);
    setModuleTitle("");
    setModuleDescription("");
    setShowModuleForm(true);
  }

  function openEditModule(module: LearningModule) {
    setEditingModule(module);
    setModuleTitle(module.title);
    setModuleDescription(module.description ?? "");
    setShowModuleForm(true);
  }

  function closeModuleForm() {
    setShowModuleForm(false);
    setEditingModule(null);
    setModuleTitle("");
    setModuleDescription("");
  }

  async function handleSaveModule() {
    if (!selectedMaterial) {
      setActionError("No learning material is selected.");
      return;
    }

    if (!moduleTitle.trim()) {
      setActionError("Module title is required.");
      return;
    }

    try {
      setActionError(null);
      setSuccessMessage(null);

      if (editingModule) {
        await updateLearningModule(editingModule.id, {
          title: moduleTitle.trim(),
          description: moduleDescription.trim() || null,
          welcomeContent: editingModule.welcomeContent,
          learningObjectives: editingModule.learningObjectives,
          summary: editingModule.summary,
          keyTakeaways: editingModule.keyTakeaways,
        });
      } else {
        await createLearningModule({
          learningMaterialId: selectedMaterial.id,
          title: moduleTitle.trim(),
          description: moduleDescription.trim() || null,
        });
      }

      const refreshedModules = await loadModules(selectedMaterial.id);

      setAllModules((current) => [
        ...current.filter(
          (module) =>
            module.learningMaterialId !== selectedMaterial.id,
        ),
        ...refreshedModules,
      ]);

      closeModuleForm();

      setSuccessMessage(
        editingModule
          ? "Module updated successfully."
          : "Module created successfully.",
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to save module.",
      );
    }
  }

  function openDeleteModule(module: LearningModule) {
    setSelectedModule(module);
    setDeleteTarget("module");
    setShowDeleteConfirmation(true);
  }

  function resetLessonForm() {
    setSectionTitle("");
    setSectionContentType("Text");
    setSectionMediaUrl("");
    setLessonObjectives([""]);
    setLessonBlocks([createBlock("paragraph")]);
  }

  function openCreateSection() {
    if (!selectedModule) {
      setActionError("Select a module first.");
      return;
    }

    setEditingSection(null);
    resetLessonForm();
    setShowSectionForm(true);
  }

  function openEditSection(section: LearningSection) {
    const parsed = parseLessonContent(section.content);

    setEditingSection(section);
    setSectionTitle(section.title);
    setSectionContentType(section.contentType);
    setSectionMediaUrl(section.mediaUrl ?? "");

    setLessonObjectives(
      parsed.objectives.length > 0
        ? parsed.objectives
        : [""],
    );

    setLessonBlocks(
      parsed.blocks.length > 0
        ? parsed.blocks
        : [createBlock("paragraph")],
    );

    setShowSectionForm(true);
  }

  function closeSectionForm() {
    setShowSectionForm(false);
    setEditingSection(null);
    resetLessonForm();
  }

  function validateLesson(): string | null {
    if (!sectionTitle.trim()) {
      return "Lesson title is required.";
    }

    const editorHtml = lessonEditorRef.current?.innerHTML ?? "";
    const currentBlocks = editorHtmlToBlocks(editorHtml);
    if (currentBlocks.length === 0) {
      return "Please add some lesson content.";
    }

    for (const block of currentBlocks) {
      if (
        (block.type === "paragraph" || block.type === "heading") &&
        !block.content?.trim()
      ) {
        return "Please complete all paragraph and heading blocks.";
      }

      if (
        [
          "bulletList",
          "numberedList",
          "radioList",
        ].includes(block.type)
      ) {
        const validItems = (block.items ?? []).filter(
          (item) => item.trim(),
        );

        if (validItems.length === 0) {
          return "Each list block must have at least one item.";
        }
      }

      if (block.type === "image" && !block.url?.trim()) {
        return "Please provide an image URL for every image block.";
      }
    }

    if (
      (sectionContentType === "Video" ||
        sectionContentType === "Link") &&
      !sectionMediaUrl.trim()
    ) {
      return "Please provide the media URL.";
    }

    return null;
  }

  async function handleSaveSection() {
    if (!selectedModule) {
      setActionError("No module is selected.");
      return;
    }

    const validationError = validateLesson();

    if (validationError) {
      setActionError(validationError);
      return;
    }

    try {
      setActionError(null);
      setSuccessMessage(null);

      const serializedContent = JSON.stringify({
        version: 1,
        blocks: editorHtmlToBlocks(lessonEditorRef.current?.innerHTML ?? "").map((block) => ({
          ...block,
          content: block.content?.trim() || "",
          items: block.items?.map((item) => item.trim()).filter(Boolean),
          url: block.url?.trim() || "",
          caption: block.caption?.trim() || "",
        })),
      });

      const request = {
        title: sectionTitle.trim(),
        contentType: sectionContentType,
        content: serializedContent,
        mediaUrl: sectionMediaUrl.trim() || null,
      };

      if (editingSection) {
        await updateLearningSection(editingSection.id, {
          ...request,
          sectionNumber: editingSection.sectionNumber,
          displayOrder: editingSection.displayOrder,
        });
      } else {
        const nextNumber =
          sections.length > 0
            ? Math.max(...sections.map((section) => section.sectionNumber)) + 1
            : 1;

        await createLearningSection({
          learningModuleId: selectedModule.id,
          ...request,
          sectionNumber: nextNumber,
          displayOrder: nextNumber,
        });
      }

      await loadSections(selectedModule.id);

      closeSectionForm();

      setSuccessMessage(
        editingSection
          ? "Lesson updated successfully."
          : "Lesson created successfully.",
      );
    } catch (error) {
      console.error("LESSON SAVE ERROR:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to save lesson.",
      );
    }
  }

  function openDeleteSection(section: LearningSection) {
    setEditingSection(section);
    setDeleteTarget("section");
    setShowDeleteConfirmation(true);
  }

  async function handleConfirmDelete() {
    try {
      setActionError(null);

      if (deleteTarget === "module" && selectedModule) {
        await deleteLearningModule(selectedModule.id);

        if (selectedMaterial) {
          const refreshedModules = await loadModules(
            selectedMaterial.id,
          );

          setAllModules((current) => [
            ...current.filter(
              (module) =>
                module.learningMaterialId !== selectedMaterial.id,
            ),
            ...refreshedModules,
          ]);
        }

        setSelectedModule(null);
        setSuccessMessage("Module deleted successfully.");
      }

      if (deleteTarget === "section" && editingSection) {
        await deleteLearningSection(editingSection.id);

        if (selectedModule) {
          await loadSections(selectedModule.id);
        }

        setSuccessMessage("Lesson deleted successfully.");
      }

      setShowDeleteConfirmation(false);
      setDeleteTarget(null);
      setEditingSection(null);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to delete item.",
      );
    }
  }

  function openFileUpload(moduleId: string) {
    uploadModuleIdRef.current = moduleId;
    fileInputRef.current?.click();
  }

  async function handleFileUploadChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    const moduleId = uploadModuleIdRef.current;

    event.target.value = "";

    if (!file || !moduleId) return;

    try {
      setActionError(null);

      await uploadLearningModuleFile(moduleId, file);

      if (selectedMaterial) {
        const refreshedModules = await loadModules(
          selectedMaterial.id,
        );

        setAllModules((current) => [
          ...current.filter(
            (module) =>
              module.learningMaterialId !== selectedMaterial.id,
          ),
          ...refreshedModules,
        ]);

        const refreshedSelectedModule = refreshedModules.find(
          (module) => module.id === moduleId,
        );

        if (refreshedSelectedModule) {
          setSelectedModule(refreshedSelectedModule);
        }
      }

      setSuccessMessage("Supporting file uploaded successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to upload supporting file.",
      );
    } finally {
      uploadModuleIdRef.current = null;
    }
  }

  async function handleExtractFile(
    moduleId: string,
    fileId: string,
  ) {
    try {
      setActionError(null);

      await extractLearningModuleFileText(moduleId, fileId);

      setSuccessMessage("File text extraction completed.");

      if (selectedMaterial) {
        const refreshedModules = await loadModules(
          selectedMaterial.id,
        );

        setAllModules((current) => [
          ...current.filter(
            (module) =>
              module.learningMaterialId !== selectedMaterial.id,
          ),
          ...refreshedModules,
        ]);
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to extract file text.",
      );
    }
  }

  async function handleExtractAllFiles(moduleId: string) {
    try {
      setActionError(null);

      await extractAllLearningModuleFiles(moduleId);

      if (selectedMaterial) {
        const refreshedModules = await loadModules(
          selectedMaterial.id,
        );

        setAllModules((current) => [
          ...current.filter(
            (module) =>
              module.learningMaterialId !== selectedMaterial.id,
          ),
          ...refreshedModules,
        ]);
      }

      setSuccessMessage("Supporting files processed successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to extract supporting files.",
      );
    }
  }

  function handleOpenFile(url?: string | null) {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f7fa] p-5 lg:p-7">
      <style jsx global>{`
        .lesson-rich-editor:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }
        .lesson-rich-editor h1 { font-size: 1.8rem; line-height: 2.2rem; font-weight: 800; margin: 1rem 0 .5rem; color: #002b5c; }
        .lesson-rich-editor h2 { font-size: 1.45rem; line-height: 1.9rem; font-weight: 750; margin: .9rem 0 .45rem; color: #002b5c; }
        .lesson-rich-editor h3 { font-size: 1.2rem; line-height: 1.7rem; font-weight: 700; margin: .8rem 0 .4rem; color: #002b5c; }
        .lesson-rich-editor p { margin: .45rem 0; }
        .lesson-rich-editor ul { list-style: disc; padding-left: 1.6rem; margin: .6rem 0; }
        .lesson-rich-editor ol { list-style: decimal; padding-left: 1.6rem; margin: .6rem 0; }
        .lesson-rich-editor li { padding-left: .2rem; margin: .2rem 0; }
        .lesson-rich-editor a { color: #2563eb; text-decoration: underline; }
        .lesson-rich-editor img { max-width: 100%; height: auto; border-radius: .5rem; margin: .75rem 0; }
      `}</style>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        onChange={handleFileUploadChange}
      />

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#64748b]">
            <GraduationCap className="h-4 w-4" />
            Trainer Workspace
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#002b5c]">
            Learning Materials
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your assigned training curriculum, modules, lessons,
            and supporting files.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={isRefreshing || isLoadingBatches}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dce3ec] bg-white px-4 text-sm font-semibold text-[#002b5c] shadow-sm transition hover:bg-[#f3f7fb] disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* ALERTS */}
      {actionError && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div>
            <p className="text-sm font-semibold text-red-800">
              Something went wrong
            </p>
            <p className="mt-1 text-xs text-red-700">{actionError}</p>
          </div>

          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && !actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CircleCheck className="h-4 w-4" />
            {successMessage}
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Assigned Materials",
            value: allMaterials.length,
            description: "From your assigned batches",
            icon: BookOpen,
          },
          {
            label: "Published Materials",
            value: publishedCount,
            description: "Available to participants",
            icon: BookCheck,
          },
          {
            label: "Draft Materials",
            value: draftCount,
            description: "Still being prepared",
            icon: Clock3,
          },
          {
            label: "Total Modules",
            value: moduleCount,
            description: "Across assigned materials",
            icon: Layers3,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e7ebf0] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#002b5c]">
                    {item.value}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf0f7] text-[#002b5c]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* MATERIAL LIBRARY */}
      <section className="overflow-hidden rounded-2xl border border-[#e7ebf0] bg-white shadow-sm">
        <div className="border-b border-[#edf0f4] p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#002b5c]">
                Assigned Learning Materials
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a material to start organizing its curriculum.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search materials..."
                  className="h-10 w-full rounded-xl border border-[#dce3ec] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#002b5c] sm:w-56"
                />
              </div>

              <select
                value={trainingFilter}
                onChange={(event) => setTrainingFilter(event.target.value)}
                className="h-10 rounded-xl border border-[#dce3ec] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#002b5c]"
              >
                {trainingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-xl border border-[#dce3ec] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#002b5c]"
              >
                <option value="All Status">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5">
          {isLoadingBatches || isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf0f7] text-[#002b5c]">
                <FolderOpen className="h-8 w-8" />
              </div>

              <h3 className="mt-4 font-semibold text-[#002b5c]">
                No learning materials found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Materials assigned to your training batches will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredMaterials.map((material) => {
                const batch = batchMap.get(material.trainingBatchId);

                const materialModules = allModules.filter(
                  (module) =>
                    module.learningMaterialId === material.id,
                );

                const active = selectedMaterial?.id === material.id;

                return (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => void handleSelectMaterial(material)}
                    className={[
                      "group rounded-2xl border p-5 text-left transition",
                      active
                        ? "border-[#002b5c] bg-[#f3f7fb] shadow-md ring-1 ring-[#002b5c]"
                        : "border-[#e7ebf0] bg-white hover:border-[#aabbd0] hover:shadow-md",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf0f7] text-[#002b5c]">
                        <BookOpen className="h-6 w-6" />
                      </div>

                      <span
                        className={[
                          "rounded-full px-3 py-1 text-[11px] font-semibold",
                          material.isPublished
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700",
                        ].join(" ")}
                      >
                        {material.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <h3 className="mt-5 line-clamp-2 text-base font-bold text-[#002b5c]">
                      {material.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {batch?.programName ?? "Training Program"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">
                        {batch?.batchCode ?? "No batch code"}
                      </span>

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">
                        {materialModules.length} Modules
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#e7ebf0] pt-4">
                      <span className="text-xs font-semibold text-[#002b5c]">
                        Manage Curriculum
                      </span>

                      <ChevronRight className="h-4 w-4 text-[#002b5c] transition group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SELECTED MATERIAL WORKSPACE */}
      {selectedMaterial && (
        <section className="overflow-hidden rounded-2xl border border-[#e7ebf0] bg-white shadow-sm">
          <div className="bg-[#002b5c] p-5 text-white">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
                    Selected Material
                  </span>

                  <span className="text-xs text-blue-100">
                    {batchMap.get(selectedMaterial.trainingBatchId)?.batchCode ?? ""}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold">
                  {selectedMaterial.title}
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  {batchMap.get(selectedMaterial.trainingBatchId)?.programName ??
                    "Training Program"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOpenSource}
                  disabled={!selectedMaterial.fileUrl}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  View Source
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={openCreateModule}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#002b5c] transition hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Module
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
            {/* MODULE SIDEBAR */}
            <aside className="border-b border-[#edf0f4] bg-[#f9fafc] p-4 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#002b5c]">
                    Course Modules
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedModules.length} modules
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateModule}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#002b5c] text-white transition hover:bg-[#0d2142]"
                  title="Add module"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {selectedModules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#cbd5e1] p-5 text-center">
                  <Layers3 className="mx-auto h-7 w-7 text-slate-400" />

                  <p className="mt-3 text-xs font-semibold text-slate-600">
                    No modules yet
                  </p>

                  <button
                    type="button"
                    onClick={openCreateModule}
                    className="mt-3 text-xs font-semibold text-[#002b5c] hover:underline"
                  >
                    Create a module
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedModules.map((module, index) => {
                    const active = selectedModule?.id === module.id;

                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => void handleSelectModule(module)}
                        className={[
                          "w-full rounded-xl border p-3 text-left transition",
                          active
                            ? "border-[#002b5c] bg-white shadow-sm"
                            : "border-transparent hover:border-[#e2e8f0] hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={[
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              active
                                ? "bg-[#002b5c] text-white"
                                : "bg-[#eaf0f7] text-[#002b5c]",
                            ].join(" ")}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold text-[#002b5c]">
                              {module.title}
                            </p>

                            <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                              {module.description || "No description"}
                            </p>
                          </div>

                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>

            {/* MODULE DETAILS */}
            <div className="min-w-0 p-5">
              {!selectedModule ? (
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf0f7] text-[#002b5c]">
                    <PanelLeft className="h-8 w-8" />
                  </div>

                  <h3 className="mt-4 font-semibold text-[#002b5c]">
                    Select a module
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Choose a module from the sidebar to manage its lessons
                    and supporting files.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* MODULE HEADER */}
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Layers3 className="h-4 w-4" />
                        Module Details
                      </div>

                      <h3 className="mt-2 text-xl font-bold text-[#002b5c]">
                        {selectedModule.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedModule.description ||
                          "No module description provided."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModule(selectedModule)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dce3ec] px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Module
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModule(selectedModule)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-100 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* MODULE SUMMARY */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#e7ebf0] bg-[#fafbfd] p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <ListChecks className="h-4 w-4" />
                        <span className="text-xs font-medium">Lessons</span>
                      </div>

                      <p className="mt-2 text-2xl font-bold text-[#002b5c]">
                        {sections.length}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e7ebf0] bg-[#fafbfd] p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <File className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Supporting Files
                        </span>
                      </div>

                      <p className="mt-2 text-2xl font-bold text-[#002b5c]">
                        {selectedModule.files?.length ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e7ebf0] bg-[#fafbfd] p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CircleCheck className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          Module Content
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#002b5c]">
                        {selectedModule.welcomeContent ||
                        selectedModule.learningObjectives ||
                        selectedModule.summary ||
                        selectedModule.keyTakeaways
                          ? "Content added"
                          : "Not completed"}
                      </p>
                    </div>
                  </div>

                  {/* LESSONS */}
                  <section>
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="font-bold text-[#002b5c]">
                          Lessons
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Create and organize the learning content for this module.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openCreateSection}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#002b5c] px-3 text-xs font-semibold text-white transition hover:bg-[#0d2142]"
                      >
                        <Plus className="h-4 w-4" />
                        Add Lesson
                      </button>
                    </div>

                    {sections.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#fafbfd] px-5 py-10 text-center">
                        <FileText className="mx-auto h-8 w-8 text-slate-400" />

                        <p className="mt-3 text-sm font-semibold text-[#002b5c]">
                          No lessons added
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Start building this module by adding your first lesson.
                        </p>

                        <button
                          type="button"
                          onClick={openCreateSection}
                          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#002b5c] hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Create Lesson
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sections
                          .slice()
                          .sort(
                            (a, b) => a.displayOrder - b.displayOrder,
                          )
                          .map((section, index) => (
                            <div
                              key={`${section.id ?? "section"}-${index}`}
                              className="flex flex-col justify-between gap-3 rounded-xl border border-[#e7ebf0] p-4 transition hover:border-[#b7c6d8] sm:flex-row sm:items-center"
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf0f7] text-xs font-bold text-[#002b5c]">
                                  {String(index + 1).padStart(2, "0")}
                                </div>

                                <div className="min-w-0">
                                  <h5 className="font-semibold text-[#002b5c]">
                                    {section.title}
                                  </h5>

                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                                      {section.contentType}
                                    </span>

                                    <span className="text-[11px] text-slate-400">
                                      Lesson {section.sectionNumber}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 sm:shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openEditSection(section)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dce3ec] px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openDeleteSection(section)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-100 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </section>

                  {/* SUPPORTING FILES */}
                  <section className="border-t border-[#edf0f4] pt-6">
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="font-bold text-[#002b5c]">
                          Supporting Files
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Upload documents and references for this module.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(selectedModule.files?.length ?? 0) > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleExtractAllFiles(selectedModule.id)
                            }
                            disabled={isExtracting}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dce3ec] px-3 text-xs font-semibold text-[#002b5c] transition hover:bg-[#f3f7fb] disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${
                                isExtracting ? "animate-spin" : ""
                              }`}
                            />
                            Extract All
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openFileUpload(selectedModule.id)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#002b5c] px-3 text-xs font-semibold text-white transition hover:bg-[#0d2142]"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Upload File
                        </button>
                      </div>
                    </div>

                    {(selectedModule.files?.length ?? 0) === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#fafbfd] px-5 py-8 text-center">
                        <FileUp className="mx-auto h-8 w-8 text-slate-400" />

                        <p className="mt-3 text-sm font-semibold text-[#002b5c]">
                          No supporting files
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Upload PDF, Word, PowerPoint, or text documents.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedModule.files?.map((file) => (
                          <div
                            key={file.id}
                            className="flex flex-col justify-between gap-3 rounded-xl border border-[#e7ebf0] p-4 sm:flex-row sm:items-center"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf0f7] text-[#002b5c]">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#002b5c]">
                                  {file.fileName}
                                </p>

                                <p className="mt-1 text-[11px] text-slate-500">
                                  {file.contentType || "Document"}
                                  {file.fileSize
                                    ? ` • ${(file.fileSize / 1024).toFixed(1)} KB`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleExtractFile(
                                    selectedModule.id,
                                    file.id,
                                  )
                                }
                                disabled={isExtracting}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dce3ec] px-3 text-xs font-semibold text-[#002b5c] hover:bg-[#f3f7fb] disabled:opacity-50"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Extract Text
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenFile(file.fileUrl)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#dce3ec] px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MODULE FORM */}
      {showModuleForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#edf0f4] p-5">
              <div>
                <h3 className="font-bold text-[#002b5c]">
                  {editingModule ? "Edit Module" : "Create Module"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Add the module information for your curriculum.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModuleForm}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Module Title
                </label>

                <input
                  value={moduleTitle}
                  onChange={(event) => setModuleTitle(event.target.value)}
                  placeholder="Enter module title"
                  className="h-11 w-full rounded-xl border border-[#dce3ec] px-3 text-sm outline-none focus:border-[#002b5c]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={moduleDescription}
                  onChange={(event) =>
                    setModuleDescription(event.target.value)
                  }
                  placeholder="Describe what this module covers..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#dce3ec] p-3 text-sm outline-none focus:border-[#002b5c]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0f4] bg-[#fafbfd] p-5">
              <button
                type="button"
                onClick={closeModuleForm}
                className="h-10 rounded-xl border border-[#dce3ec] px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleSaveModule()}
                disabled={isSaving}
                className="h-10 rounded-xl bg-[#002b5c] px-5 text-sm font-semibold text-white hover:bg-[#0d2142] disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingModule
                    ? "Save Changes"
                    : "Create Module"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRUCTURED LESSON EDITOR */}
      {showSectionForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-3 sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* EDITOR HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#edf0f4] p-5">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <GraduationCap className="h-4 w-4" />
                  Lesson Builder
                </div>

                <h3 className="mt-1 text-lg font-bold text-[#002b5c]">
                  {editingSection ? "Edit Lesson" : "Create Lesson"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Organize objectives and content blocks for participants.
                </p>
              </div>

              <button
                type="button"
                onClick={closeSectionForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* EDITOR BODY */}
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* LESSON INFORMATION */}
              <section className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#002b5c]">
                    Lesson Information
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Start with the lesson title and optional media.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Lesson Title *
                  </label>

                  <input
                    value={sectionTitle}
                    onChange={(event) =>
                      setSectionTitle(event.target.value)
                    }
                    placeholder="Example: Introduction to Mediation"
                    className="h-11 w-full rounded-xl border border-[#dce3ec] px-3 text-sm outline-none focus:border-[#002b5c]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700">
                      Content Type
                    </label>

                    <select
                      value={sectionContentType}
                      onChange={(event) =>
                        setSectionContentType(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3ec] bg-white px-3 text-sm outline-none focus:border-[#002b5c]"
                    >
                      <option value="Text">Text</option>
                      <option value="Video">Video</option>
                      <option value="Link">External Link</option>
                    </select>
                  </div>

                  {(sectionContentType === "Video" ||
                    sectionContentType === "Link") && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Media URL *
                      </label>

                      <input
                        value={sectionMediaUrl}
                        onChange={(event) =>
                          setSectionMediaUrl(event.target.value)
                        }
                        placeholder="https://..."
                        className="h-11 w-full rounded-xl border border-[#dce3ec] px-3 text-sm outline-none focus:border-[#002b5c]"
                      />
                    </div>
                  )}
                </div>
              </section>

              <div className="border-t border-[#edf0f4]" />

              {/* CONTENT BUILDER */}
              <section className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#002b5c]">
                    Lesson Content *
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Add content blocks in the order you want participants to read them.
                  </p>
                </div>

                {/* WORD-STYLE RICH TEXT TOOLBAR */}
                <div className="overflow-hidden rounded-xl border border-[#dce3ec] bg-white shadow-sm">
                  <div className="flex flex-wrap items-center gap-1 border-b border-[#e7ebf0] bg-[#f8fafc] p-2">
                    <select
                      aria-label="Text style"
                      defaultValue="P"
                      onChange={(event) => {
                        lessonEditorRef.current?.focus();
                        document.execCommand("formatBlock", false, event.target.value);
                        event.target.value = "P";
                      }}
                      className="h-9 rounded-lg border border-[#dce3ec] bg-white px-2 text-xs font-semibold text-[#002b5c]"
                    >
                      <option value="P">Paragraph</option>
                      <option value="H1">Heading 1</option>
                      <option value="H2">Heading 2</option>
                      <option value="H3">Heading 3</option>
                    </select>
                    <span className="mx-1 h-6 w-px bg-slate-200" />
                    {[
                      { label: "Bold", command: "bold", text: "B", style: "font-bold" },
                      { label: "Italic", command: "italic", text: "I", style: "italic" },
                      { label: "Underline", command: "underline", text: "U", style: "underline" },
                    ].map((tool) => (
                      <button key={tool.command} type="button" title={tool.label}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => { lessonEditorRef.current?.focus(); document.execCommand(tool.command); }}
                        className={`h-9 min-w-9 rounded-lg border border-[#dce3ec] bg-white px-3 text-sm text-[#002b5c] hover:bg-[#eaf0f7] ${tool.style}`}>
                        {tool.text}
                      </button>
                    ))}
                    <span className="mx-1 h-6 w-px bg-slate-200" />
                    {[
                      { label: "Bulleted list", command: "insertUnorderedList", icon: List },
                      { label: "Numbered list", command: "insertOrderedList", icon: ListOrdered },
                      { label: "Align left", command: "justifyLeft", icon: AlignLeft },
                    ].map((tool) => {
                      const Icon = tool.icon;
                      return <button key={tool.command} type="button" title={tool.label}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => { lessonEditorRef.current?.focus(); document.execCommand(tool.command); }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce3ec] bg-white text-[#002b5c] hover:bg-[#eaf0f7]">
                        <Icon className="h-4 w-4" />
                      </button>;
                    })}
                    <button type="button" title="Insert link"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => { const url = window.prompt("Enter the link URL:"); if (url) { lessonEditorRef.current?.focus(); document.execCommand("createLink", false, url); } }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce3ec] bg-white text-[#002b5c] hover:bg-[#eaf0f7]">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <button type="button" title="Insert image by URL"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => { const url = window.prompt("Enter the image URL:"); if (url) { lessonEditorRef.current?.focus(); document.execCommand("insertImage", false, url); } }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce3ec] bg-white text-[#002b5c] hover:bg-[#eaf0f7]">
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div
                    ref={lessonEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    aria-label="Lesson content editor"
                    aria-multiline="true"
                    data-placeholder="Start writing your lesson here. Select any text and use the toolbar to format it..."
                    className="lesson-rich-editor min-h-[420px] w-full whitespace-pre-wrap px-6 py-5 text-sm leading-7 text-slate-700 outline-none"
                    onInput={() => {
                      if (actionError) setActionError(null);
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Type continuously like a document. Highlight text first, then choose a heading, bullet list, or numbered list from the toolbar.
                </p>
              </section>

              {/* CONTENT PREVIEW */}
              <section className="rounded-xl border border-[#dce3ec] bg-[#f8fafc] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#002b5c]" />

                  <h4 className="text-xs font-bold text-[#002b5c]">
                    Lesson Structure Preview
                  </h4>
                </div>

                <div className="space-y-3 rounded-lg border border-[#edf0f4] bg-white p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Lesson
                    </p>

                    <h5 className="mt-1 font-bold text-[#002b5c]">
                      {sectionTitle.trim() || "Untitled Lesson"}
                    </h5>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase text-slate-400">
                      Objectives
                    </p>

                    <div className="space-y-1.5">
                      {lessonObjectives.filter((item) => item.trim()).map(
                        (objective, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-xs text-slate-600"
                          >
                            <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            {objective}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#edf0f4] pt-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase text-slate-400">
                      Content Blocks ({lessonBlocks.length})
                    </p>

                    <p className="text-xs leading-6 text-slate-500">Your formatted lesson content will be saved in the existing JSON content field, preserving headings, paragraphs, lists, and inline formatting.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* EDITOR FOOTER */}
            <div className="flex shrink-0 flex-col-reverse justify-between gap-3 border-t border-[#edf0f4] bg-[#fafbfd] p-4 sm:flex-row sm:items-center sm:px-6">
              <p className="text-[10px] text-slate-400">
                All objectives and content blocks are saved in one lesson content field.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeSectionForm}
                  className="h-10 rounded-xl border border-[#dce3ec] px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleSaveSection()}
                  disabled={isSaving}
                  className="h-10 rounded-xl bg-[#002b5c] px-5 text-sm font-semibold text-white hover:bg-[#0d2142] disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : editingSection
                      ? "Save Changes"
                      : "Create Lesson"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#002b5c]">
              Delete {deleteTarget === "module" ? "Module" : "Lesson"}?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-700">
                {deleteTarget === "module"
                  ? selectedModule?.title
                  : editingSection?.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="h-10 rounded-xl border border-[#dce3ec] px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isSaving}
                className="h-10 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}