"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type {
  CreateLearningMaterialRequest,
  CreateLearningModuleRequest,
  LearningMaterial,
  LearningModule,
  LearningSection,
  TrainingBatch,
  TrainerAssignment,
} from "@repo/types";

import {
  BookOpen,
  ChevronRight,
  FileText,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

import {
  Badge,
  Button,
  DataTable,
  PageSection,
} from "@repo/ui/index";

import {
  learningMaterialApi,
  trainerAssignmentApi,
  trainingBatchApi,
} from "@/lib/api";

import { useLearningMaterials } from "@repo/hooks";
import { useTrainerAssignments } from "@repo/hooks";
import { columns } from "./columns";


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
// PAGE
// ============================================================

export default function TrainerLearningMaterialsPage() {
  // ==========================================================
  // TRAINER ASSIGNMENTS
  // ==========================================================

  const {
    myAssignments,
    isLoadingMyAssignments,
    loadMyAssignments,
    error: assignmentError,
  } = useTrainerAssignments(
    trainerAssignmentApi,
    {
      loadAll: false,
    },
  );


  // ==========================================================
  // TRAINING BATCHES
  // ==========================================================

  const [
    allBatches,
    setAllBatches,
  ] = useState<TrainingBatch[]>([]);

  const [
    isLoadingBatches,
    setIsLoadingBatches,
  ] = useState(false);

  const [
    batchError,
    setBatchError,
  ] = useState<string | null>(null);


  // ==========================================================
  // LEARNING MATERIALS
  // ==========================================================

  const {
    learningMaterials,
    modules,
    sections,

    isLoading,
    isSaving,
    isUploading,
    isGenerating,

    error: learningMaterialError,

    loadLearningMaterials,
    loadLearningMaterial,

    createLearningMaterial,

    publishLearningMaterial,
    deleteLearningMaterial,

    uploadLearningMaterial,

    generateLearningModules,
    loadModules,

    createLearningModule,

    loadSections,
  } = useLearningMaterials(
    learningMaterialApi,
  );


  // ==========================================================
  // LOCAL MATERIAL STATE
  // ==========================================================

  const [
    allMaterials,
    setAllMaterials,
  ] = useState<LearningMaterial[]>([]);

  const [
    selectedMaterial,
    setSelectedMaterial,
  ] = useState<LearningMaterial | null>(
    null,
  );


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    showCreateMaterial,
    setShowCreateMaterial,
  ] = useState(false);

  const [
    showCreateModule,
    setShowCreateModule,
  ] = useState(false);

  const [
    showMaterialDetails,
    setShowMaterialDetails,
  ] = useState(false);

  const [
    selectedModule,
    setSelectedModule,
  ] = useState<LearningModule | null>(
    null,
  );

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false);

  const [
    materialToDelete,
    setMaterialToDelete,
  ] = useState<LearningMaterial | null>(
    null,
  );

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(null);


  // ==========================================================
  // CREATE MATERIAL FORM
  // ==========================================================

  const [
    materialForm,
    setMaterialForm,
  ] = useState({
    trainingBatchId: "",
    title: "",
    description: "",
    materialType: "PDF" as MaterialType,
    file: null as File | null,
  });


  // ==========================================================
  // CREATE MODULE FORM
  // ==========================================================

  const [
    moduleForm,
    setModuleForm,
  ] = useState({
    title: "",
    description: "",
  });


  // ==========================================================
  // LOAD ALL BATCHES
  // ==========================================================

  const loadBatches = useCallback(
    async () => {
      try {
        setIsLoadingBatches(true);
        setBatchError(null);

        const result =
          await trainingBatchApi.getAll();

        setAllBatches(
          Array.isArray(result)
            ? result
            : [],
        );
      } catch (error) {
        console.error(
          "LOAD TRAINING BATCHES ERROR:",
          error,
        );

        setBatchError(
          error instanceof Error
            ? error.message
            : "Unable to load training batches.",
        );

        setAllBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    },
    [],
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadMyAssignments();
    loadBatches();
  }, [
    loadMyAssignments,
    loadBatches,
  ]);


  // ==========================================================
  // ONLY BATCHES ASSIGNED TO CURRENT TRAINER
  // ==========================================================

  const assignedBatchIds = useMemo(
    () =>
      new Set(
        myAssignments
          .filter(
            assignment =>
              assignment.isActive,
          )
          .map(
            assignment =>
              assignment.trainingBatchId,
          ),
      ),
    [myAssignments],
  );


  const assignedBatches =
    useMemo(
      () =>
        allBatches.filter(
          batch =>
            assignedBatchIds.has(
              batch.id,
            ),
        ),
      [
        allBatches,
        assignedBatchIds,
      ],
    );


  // ==========================================================
  // ASSIGNMENT MAP
  // ==========================================================

  const assignmentMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          TrainerAssignment
        >();

      myAssignments.forEach(
        assignment => {
          if (
            assignment.isActive
          ) {
            map.set(
              assignment.trainingBatchId,
              assignment,
            );
          }
        },
      );

      return map;
    }, [myAssignments]);


  // ==========================================================
  // LOAD MATERIALS ONLY FROM ASSIGNED BATCHES
  // ==========================================================

  const loadAssignedMaterials =
    useCallback(
      async () => {
        if (
          assignedBatches.length === 0
        ) {
          setAllMaterials([]);
          return;
        }

        try {
          const results =
            await Promise.all(
              assignedBatches.map(
                async batch => {
                  try {
                    return await loadLearningMaterials(
                      batch.id,
                    );
                  } catch (error) {
                    console.error(
                      `LOAD MATERIALS FOR BATCH ${batch.id} ERROR:`,
                      error,
                    );

                    return [];
                  }
                },
              ),
            );

          const merged =
            results.flat();

          const unique =
            Array.from(
              new Map(
                merged.map(
                  material => [
                    material.id,
                    material,
                  ],
                ),
              ).values(),
            );

          setAllMaterials(unique);
        } catch (error) {
          console.error(
            "LOAD ASSIGNED MATERIALS ERROR:",
            error,
          );

          setAllMaterials([]);
        }
      },
      [
        assignedBatches,
        loadLearningMaterials,
      ],
    );


  useEffect(() => {
    if (
      !isLoadingMyAssignments &&
      !isLoadingBatches
    ) {
      loadAssignedMaterials();
    }
  }, [
    isLoadingMyAssignments,
    isLoadingBatches,
    loadAssignedMaterials,
  ]);


  // ==========================================================
  // BATCH MAP
  // ==========================================================

  const batchMap =
    useMemo(
      () =>
        new Map(
          assignedBatches.map(
            batch => [
              batch.id,
              batch,
            ],
          ),
        ),
      [assignedBatches],
    );


  // ==========================================================
  // SAFETY FILTER
  // ==========================================================
  //
  // Even if something accidentally gets returned by the API,
  // only show materials belonging to assigned batches.
  //

  const trainerMaterials =
    useMemo(
      () =>
        allMaterials.filter(
          material =>
            assignedBatchIds.has(
              material.trainingBatchId,
            ),
        ),
      [
        allMaterials,
        assignedBatchIds,
      ],
    );


  // ==========================================================
  // STATS
  // ==========================================================

  const publishedCount =
    trainerMaterials.filter(
      material =>
        material.isPublished,
    ).length;

  const draftCount =
    trainerMaterials.filter(
      material =>
        !material.isPublished,
    ).length;


  // ==========================================================
  // OPEN MATERIAL
  // ==========================================================

  const handleView =
    useCallback(
      async (
        material: LearningMaterial,
      ) => {
        // ----------------------------------------------------
        // SECURITY / UI GUARD
        // ----------------------------------------------------

        if (
          !assignedBatchIds.has(
            material.trainingBatchId,
          )
        ) {
          setActionError(
            "You can only manage learning materials for training batches assigned to you.",
          );

          return;
        }

        try {
          setActionError(null);

          const loaded =
            await loadLearningMaterial(
              material.id,
            );

          setSelectedMaterial(
            loaded,
          );

          setShowMaterialDetails(
            true,
          );

          await loadModules(
            material.id,
          );
        } catch (error) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Unable to open learning material.",
          );
        }
      },
      [
        assignedBatchIds,
        loadLearningMaterial,
        loadModules,
      ],
    );


  // ==========================================================
  // PUBLISH
  // ==========================================================

  const handlePublish =
    useCallback(
      async (
        material: LearningMaterial,
      ) => {
        if (
          !assignedBatchIds.has(
            material.trainingBatchId,
          )
        ) {
          setActionError(
            "You are not assigned to this training batch.",
          );

          return;
        }

        try {
          setActionError(null);

          const updated =
            await publishLearningMaterial(
              material.id,
            );

          setAllMaterials(
            current =>
              current.map(
                item =>
                  item.id === updated.id
                    ? updated
                    : item,
              ),
          );

          if (
            selectedMaterial?.id ===
            updated.id
          ) {
            setSelectedMaterial(
              updated,
            );
          }
        } catch (error) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Unable to publish learning material.",
          );
        }
      },
      [
        assignedBatchIds,
        publishLearningMaterial,
        selectedMaterial?.id,
      ],
    );


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete =
    useCallback(
      (material: LearningMaterial) => {
        if (
          !assignedBatchIds.has(
            material.trainingBatchId,
          )
        ) {
          setActionError(
            "You are not assigned to this training batch.",
          );

          return;
        }

        setMaterialToDelete(
          material,
        );

        setShowDeleteConfirm(
          true,
        );
      },
      [assignedBatchIds],
    );


  const confirmDelete =
    useCallback(
      async () => {
        if (
          !materialToDelete
        ) {
          return;
        }

        if (
          !assignedBatchIds.has(
            materialToDelete.trainingBatchId,
          )
        ) {
          setActionError(
            "You are not assigned to this training batch.",
          );

          setShowDeleteConfirm(
            false,
          );

          return;
        }

        try {
          setActionError(null);

          await deleteLearningMaterial(
            materialToDelete.id,
          );

          setAllMaterials(
            current =>
              current.filter(
                material =>
                  material.id !==
                  materialToDelete.id,
              ),
          );

          if (
            selectedMaterial?.id ===
            materialToDelete.id
          ) {
            setSelectedMaterial(
              null,
            );

            setShowMaterialDetails(
              false,
            );
          }

          setMaterialToDelete(
            null,
          );

          setShowDeleteConfirm(
            false,
          );
        } catch (error) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Unable to delete learning material.",
          );
        }
      },
      [
        materialToDelete,
        assignedBatchIds,
        deleteLearningMaterial,
        selectedMaterial?.id,
      ],
    );


  // ==========================================================
  // CREATE MATERIAL
  // ==========================================================

  const handleCreateMaterial =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setActionError(null);

      // ------------------------------------------------------
      // REQUIRED VALIDATION
      // ------------------------------------------------------

      if (
        !materialForm.trainingBatchId
      ) {
        setActionError(
          "Please select a training batch.",
        );

        return;
      }

      // ------------------------------------------------------
      // IMPORTANT:
      // NEVER trust the selected batch from the UI.
      // Make sure it exists in trainer assignments.
      // ------------------------------------------------------

      if (
        !assignedBatchIds.has(
          materialForm.trainingBatchId,
        )
      ) {
        setActionError(
          "You can only create learning materials for training batches assigned to you.",
        );

        return;
      }

      if (
        !materialForm.title.trim()
      ) {
        setActionError(
          "Learning material title is required.",
        );

        return;
      }

      try {
        // ----------------------------------------------------
        // CREATE MATERIAL
        // ----------------------------------------------------

        const request =
          {
            trainingBatchId:
              materialForm.trainingBatchId,

            title:
              materialForm.title.trim(),

            description:
              materialForm.description.trim(),

            materialType:
              materialForm.materialType,
          } as CreateLearningMaterialRequest;

        const created =
          await createLearningMaterial(
            request,
          );

        // ----------------------------------------------------
        // UPLOAD FILE AFTER CREATE
        // ----------------------------------------------------

        let finalMaterial =
          created;

        if (
          materialForm.file
        ) {
          finalMaterial =
            await uploadLearningMaterial(
              created.id,
              materialForm.file,
            );
        }

        // ----------------------------------------------------
        // UPDATE LOCAL LIST
        // ----------------------------------------------------

        setAllMaterials(
          current => {
            const exists =
              current.some(
                material =>
                  material.id ===
                  finalMaterial.id,
              );

            if (exists) {
              return current.map(
                material =>
                  material.id ===
                  finalMaterial.id
                    ? finalMaterial
                    : material,
              );
            }

            return [
              ...current,
              finalMaterial,
            ];
          },
        );

        // ----------------------------------------------------
        // RESET
        // ----------------------------------------------------

        setMaterialForm({
          trainingBatchId:
            assignedBatches[0]?.id ??
            "",
          title: "",
          description: "",
          materialType: "PDF",
          file: null,
        });

        setShowCreateMaterial(
          false,
        );

        // ----------------------------------------------------
        // OPEN CREATED MATERIAL
        // ----------------------------------------------------

        await handleView(
          finalMaterial,
        );
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Unable to create learning material.",
        );
      }
    };


  // ==========================================================
  // CREATE MODULE
  // ==========================================================

  const handleCreateModule =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !selectedMaterial
      ) {
        return;
      }

      if (
        !assignedBatchIds.has(
          selectedMaterial.trainingBatchId,
        )
      ) {
        setActionError(
          "You can only create modules for materials belonging to your assigned training batches.",
        );

        return;
      }

      if (
        !moduleForm.title.trim()
      ) {
        setActionError(
          "Module title is required.",
        );

        return;
      }

      try {
        setActionError(null);

        const nextModuleNumber =
          modules.length === 0
            ? 1
            : Math.max(
                ...modules.map(
                  module =>
                    Number(
                      module.moduleNumber,
                    ) || 0,
                ),
              ) + 1;

        const request =
          {
            learningMaterialId:
              selectedMaterial.id,

            title:
              moduleForm.title.trim(),

            description:
              moduleForm.description.trim(),

            moduleNumber:
              nextModuleNumber,
          } as CreateLearningModuleRequest;

        await createLearningModule(
          request,
        );

        setModuleForm({
          title: "",
          description: "",
        });

        setShowCreateModule(
          false,
        );
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Unable to create learning module.",
        );
      }
    };


  // ==========================================================
  // OPEN CREATE MATERIAL
  // ==========================================================

  const openCreateMaterial =
    () => {
      setActionError(null);

      setMaterialForm(
        current => ({
          ...current,

          trainingBatchId:
            current.trainingBatchId &&
            assignedBatchIds.has(
              current.trainingBatchId,
            )
              ? current.trainingBatchId
              : assignedBatches[0]
                  ?.id ?? "",
        }),
      );

      setShowCreateMaterial(
        true,
      );
    };


  // ==========================================================
  // OPEN CREATE MODULE
  // ==========================================================

  const openCreateModule =
    () => {
      setActionError(null);

      setModuleForm({
        title: "",
        description: "",
      });

      setShowCreateModule(
        true,
      );
    };


  // ==========================================================
  // REFRESH
  // ==========================================================

  const refresh =
    async () => {
      await loadMyAssignments();
      await loadBatches();
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  const pageLoading =
    isLoadingMyAssignments ||
    isLoadingBatches;


  // ==========================================================
  // ERROR
  // ==========================================================

  const pageError =
    actionError ??
    assignmentError ??
    batchError ??
    learningMaterialError?.message ??
    null;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

        <PageSection
          title="Learning Materials"
          description="Create and manage learning materials for your assigned training batches."
        />

        <div className="flex items-center gap-2">

          <Button
            type="button"
            variant="outline"
            onClick={refresh}
            disabled={pageLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                pageLoading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>

          <Button
            type="button"
            onClick={
              openCreateMaterial
            }
            disabled={
              pageLoading ||
              assignedBatches.length ===
                0
            }
          >
            <Plus className="mr-2 h-4 w-4" />

            Create Material
          </Button>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {pageError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}


      {/* ====================================================
          ASSIGNED BATCHES
      ==================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              My Assigned Training Batches
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              You can only create learning materials
              for these batches.
            </p>
          </div>

          <Badge variant="success">
            {assignedBatches.length} assigned
          </Badge>

        </div>


        {pageLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading your assignments...
          </div>
        ) : assignedBatches.length ===
          0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">

            <Layers3 className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No training batches assigned
            </p>

            <p className="mt-1 text-xs text-slate-500">
              You currently do not have an active
              training batch assignment.
            </p>

          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

            {assignedBatches.map(
              batch => {
                const assignment =
                  assignmentMap.get(
                    batch.id,
                  );

                return (
                  <div
                    key={batch.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-900">
                          {batch.programName ??
                            "Training Program"}
                        </p>

                        <p className="mt-1 font-mono text-xs text-slate-500">
                          {batch.batchCode ??
                            "No batch code"}
                        </p>

                      </div>

                      <Badge variant="success">
                        Assigned
                      </Badge>

                    </div>

                    {assignment && (
                      <p className="mt-3 text-[11px] text-slate-400">
                        Assignment ID:{" "}
                        {assignment.id}
                      </p>
                    )}

                  </div>
                );
              },
            )}

          </div>
        )}

      </div>


      {/* ====================================================
          STATS
      ==================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={
            <FileText className="h-5 w-5" />
          }
          label="My Materials"
          value={
            trainerMaterials.length
          }
        />

        <StatCard
          icon={
            <BookOpen className="h-5 w-5" />
          }
          label="Published"
          value={
            publishedCount
          }
        />

        <StatCard
          icon={
            <FileText className="h-5 w-5" />
          }
          label="Drafts"
          value={
            draftCount
          }
        />

        <StatCard
          icon={
            <Layers3 className="h-5 w-5" />
          }
          label="Assigned Batches"
          value={
            assignedBatches.length
          }
        />

      </div>


      {/* ====================================================
          TABLE
      ==================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

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

      </div>


      {/* ====================================================
          CREATE MATERIAL MODAL
      ==================================================== */}

      {showCreateMaterial && (
        <Modal
          title="Create Learning Material"
          onClose={() =>
            setShowCreateMaterial(
              false,
            )
          }
        >

          <form
            onSubmit={
              handleCreateMaterial
            }
            className="space-y-5"
          >

            {/* BATCH */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Training Batch
              </label>

              <select
                value={
                  materialForm.trainingBatchId
                }
                onChange={event =>
                  setMaterialForm(
                    current => ({
                      ...current,
                      trainingBatchId:
                        event.target.value,
                    }),
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
              >

                <option value="">
                  Select assigned training batch
                </option>

                {assignedBatches.map(
                  batch => (
                    <option
                      key={batch.id}
                      value={batch.id}
                    >
                      {batch.programName} —{" "}
                      {batch.batchCode}
                    </option>
                  ),
                )}

              </select>

              <p className="mt-1.5 text-[11px] text-slate-400">
                Only training batches assigned to
                you are available.
              </p>
            </div>


            {/* TITLE */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Title
              </label>

              <input
                type="text"
                value={
                  materialForm.title
                }
                onChange={event =>
                  setMaterialForm(
                    current => ({
                      ...current,
                      title:
                        event.target.value,
                    }),
                  )
                }
                placeholder="e.g. Introduction to Anatomy"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>


            {/* TYPE */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Material Type
              </label>

              <select
                value={
                  materialForm.materialType
                }
                onChange={event =>
                  setMaterialForm(
                    current => ({
                      ...current,
                      materialType:
                        event.target
                          .value as MaterialType,
                    }),
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
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


            {/* DESCRIPTION */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Description
              </label>

              <textarea
                value={
                  materialForm.description
                }
                onChange={event =>
                  setMaterialForm(
                    current => ({
                      ...current,
                      description:
                        event.target.value,
                    }),
                  )
                }
                rows={4}
                placeholder="Describe this learning material..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>


            {/* FILE */}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                File
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-slate-400 hover:bg-slate-100">

                <Upload className="h-5 w-5 text-slate-400" />

                <div className="min-w-0">

                  <p className="truncate text-sm font-medium text-slate-700">
                    {materialForm.file
                      ? materialForm.file.name
                      : "Choose a file"}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    File will be uploaded after
                    the material is created.
                  </p>

                </div>

                <input
                  type="file"
                  className="hidden"
                  onChange={event =>
                    setMaterialForm(
                      current => ({
                        ...current,
                        file:
                          event.target
                            .files?.[0] ??
                          null,
                      }),
                    )
                  }
                />

              </label>
            </div>


            {/* ACTIONS */}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShowCreateMaterial(
                    false,
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  isSaving ||
                  isUploading ||
                  assignedBatches.length ===
                    0
                }
              >

                {isSaving ||
                isUploading ? (
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

            </div>

          </form>

        </Modal>
      )}


      {/* ====================================================
          MATERIAL DETAILS
      ==================================================== */}

      {showMaterialDetails &&
        selectedMaterial && (
          <Modal
            title={
              selectedMaterial.title
            }
            onClose={() => {
              setShowMaterialDetails(
                false,
              );

              setSelectedModule(
                null,
              );
            }}
            wide
          >

            <div className="space-y-6">

              {/* MATERIAL INFO */}

              <div className="grid gap-4 md:grid-cols-2">

                <Info
                  label="Training Program"
                  value={
                    batchMap.get(
                      selectedMaterial.trainingBatchId,
                    )?.programName ??
                    "Unknown"
                  }
                />

                <Info
                  label="Batch"
                  value={
                    selectedMaterial.batchCode ??
                    batchMap.get(
                      selectedMaterial.trainingBatchId,
                    )?.batchCode ??
                    "—"
                  }
                />

                <Info
                  label="Type"
                  value={
                    selectedMaterial.materialType
                  }
                />

                <Info
                  label="Status"
                  value={
                    selectedMaterial.isPublished
                      ? "Published"
                      : "Draft"
                  }
                />

              </div>


              {/* FILE */}

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {selectedMaterial.fileName ??
                          "No file uploaded"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {formatFileSize(
                          selectedMaterial.fileSize,
                        )}
                      </p>

                    </div>

                  </div>

                  <label className="cursor-pointer">

                    <span className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      Replace
                    </span>

                    <input
                      type="file"
                      className="hidden"
                      disabled={
                        isUploading
                      }
                      onChange={async event => {
                        const file =
                          event.target
                            .files?.[0];

                        if (!file) {
                          return;
                        }

                        try {
                          const updated =
                            await uploadLearningMaterial(
                              selectedMaterial.id,
                              file,
                            );

                          setSelectedMaterial(
                            updated,
                          );

                          setAllMaterials(
                            current =>
                              current.map(
                                material =>
                                  material.id ===
                                  updated.id
                                    ? updated
                                    : material,
                              ),
                          );
                        } catch (error) {
                          setActionError(
                            error instanceof Error
                              ? error.message
                              : "Unable to upload file.",
                          );
                        }
                      }}
                    />

                  </label>

                </div>

              </div>


              {/* MODULES */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Learning Modules
                    </h3>

                    <p className="text-xs text-slate-400">
                      Modules belonging to this
                      learning material.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={
                      openCreateModule
                    }
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Module
                  </Button>

                </div>


                {modules.length ===
                0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">

                    <Layers3 className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      No modules yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a module or generate
                      modules from the material.
                    </p>

                    <div className="mt-4 flex justify-center gap-2">

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          isGenerating
                        }
                        onClick={async () => {
                          try {
                            await generateLearningModules(
                              selectedMaterial.id,
                            );
                          } catch (error) {
                            setActionError(
                              error instanceof Error
                                ? error.message
                                : "Unable to generate modules.",
                            );
                          }
                        }}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Modules"
                        )}
                      </Button>

                    </div>

                  </div>
                ) : (
                  <div className="space-y-2">

                    {modules.map(
                      (module, index) => (
                        <button
                          key={
                            module.id
                          }
                          type="button"
                          onClick={async () => {
                            setSelectedModule(
                              module,
                            );

                            try {
                              await loadSections(
                                module.id,
                              );
                            } catch (error) {
                              setActionError(
                                error instanceof Error
                                  ? error.message
                                  : "Unable to load sections.",
                              );
                            }
                          }}
                          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                        >

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                              {module.moduleNumber ??
                                index + 1}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-800">
                                {module.title}
                              </p>

                              {module.description && (
                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                  {
                                    module.description
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />

                        </button>
                      ),
                    )}

                  </div>
                )}

              </div>


              {/* SELECTED MODULE SECTIONS */}

              {selectedModule && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="mb-3">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Module
                    </p>

                    <h4 className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedModule.title}
                    </h4>

                  </div>


                  {sections.length ===
                  0 ? (
                    <p className="text-xs text-slate-400">
                      No sections found for this
                      module.
                    </p>
                  ) : (
                    <div className="space-y-2">

                      {sections.map(
                        (
                          section,
                          index,
                        ) => (
                          <div
                            key={
                              section.id
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-3"
                          >

                            <div className="flex items-start gap-3">

                              <span className="text-xs font-bold text-slate-400">
                                {index +
                                  1}
                              </span>

                              <div>

                                <p className="text-sm font-medium text-slate-800">
                                  {section.title}
                                </p>

                                {section.content && (
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {
                                      section.content
                                    }
                                  </p>
                                )}

                              </div>

                            </div>

                          </div>
                        ),
                      )}

                    </div>
                  )}

                </div>
              )}


              {/* FOOTER */}

              <div className="flex justify-end border-t border-slate-100 pt-4">

                {!selectedMaterial.isPublished && (
                  <Button
                    type="button"
                    onClick={() =>
                      handlePublish(
                        selectedMaterial,
                      )
                    }
                    disabled={
                      isSaving
                    }
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Material"
                    )}
                  </Button>
                )}

              </div>

            </div>

          </Modal>
        )}


      {/* ====================================================
          CREATE MODULE
      ==================================================== */}

      {showCreateModule &&
        selectedMaterial && (
          <Modal
            title="Create Learning Module"
            onClose={() =>
              setShowCreateModule(
                false,
              )
            }
            above
          >

            <form
              onSubmit={
                handleCreateModule
              }
              className="space-y-5"
            >

              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Learning Material
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {
                    selectedMaterial.title
                  }
                </p>

              </div>


              {/* MODULE NUMBER */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Module Number
                </label>

                <input
                  type="text"
                  readOnly
                  value={
                    modules.length ===
                    0
                      ? 1
                      : Math.max(
                          ...modules.map(
                            module =>
                              Number(
                                module.moduleNumber,
                              ) || 0,
                          ),
                        ) + 1
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                />

              </div>


              {/* TITLE */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Module Title
                </label>

                <input
                  type="text"
                  value={
                    moduleForm.title
                  }
                  onChange={event =>
                    setModuleForm(
                      current => ({
                        ...current,
                        title:
                          event.target
                            .value,
                      }),
                    )
                  }
                  placeholder="e.g. Skeletal System"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                />

              </div>


              {/* DESCRIPTION */}

              <div>

                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={
                    moduleForm.description
                  }
                  onChange={event =>
                    setModuleForm(
                      current => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      }),
                    )
                  }
                  rows={4}
                  placeholder="Describe what this module covers..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />

              </div>


              {/* ACTIONS */}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShowCreateModule(
                      false,
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isSaving
                  }
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

              </div>

            </form>

          </Modal>
        )}


      {/* ====================================================
          DELETE CONFIRM
      ==================================================== */}

      {showDeleteConfirm &&
        materialToDelete && (
          <ConfirmDelete
            title="Delete Learning Material?"
            description={`"${materialToDelete.title}" will be permanently deleted.`}
            onCancel={() => {
              setShowDeleteConfirm(
                false,
              );

              setMaterialToDelete(
                null,
              );
            }}
            onConfirm={
              confirmDelete
            }
            loading={
              isSaving
            }
          />
        )}

    </div>
  );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>

      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">
        {label}
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// MODAL
// ============================================================

function Modal({
  title,
  children,
  onClose,
  wide = false,
  above = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
  above?: boolean;
}) {
  return (
    <div
      className={`fixed inset-0 ${
        above
          ? "z-[1100]"
          : "z-[1000]"
      } flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm`}
      onMouseDown={event => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div
        className={`max-h-[90vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${
          wide
            ? "max-w-4xl"
            : "max-w-xl"
        }`}
      >

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <h2 className="text-base font-semibold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        <div className="max-h-[calc(90vh-65px)] overflow-y-auto p-5">
          {children}
        </div>

      </div>

    </div>
  );
}


// ============================================================
// DELETE CONFIRM
// ============================================================

function ConfirmDelete({
  title,
  description,
  onCancel,
  onConfirm,
  loading,
}: {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">

        <div className="mb-5">

          <h2 className="text-base font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>

        </div>

        <div className="flex justify-end gap-2">

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// FILE SIZE
// ============================================================

function formatFileSize(
  value: number | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    value <= 0
  ) {
    return "—";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(
      value / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    value /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}