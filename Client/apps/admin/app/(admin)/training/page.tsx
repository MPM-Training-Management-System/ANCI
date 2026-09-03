"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DataTable,
  StatCard,
  StatGrid,
  Button,
} from "@repo/ui/index";

import {
  useTrainingPrograms,
  useTrainingProgramDocuments,
  useTrainingBatches,
  useTrainerAssignments,
} from "@repo/hooks";

import {
  trainingProgramApi,
  trainingProgramDocumentApi,
  trainingBatchApi,
  trainerApi,
  trainerAssignmentApi,
} from "@/lib/api";

import type {
  TrainingProgram as ApiTrainingProgram,
  TrainingBatch,
  CreateTrainingProgramRequest,
  UpdateTrainingProgramRequest,
  TrainingProgramRequirementRequest,
  CreateTrainingBatchRequest,
  UpdateTrainingBatchRequest,
  UpdateTrainingBatchStatusRequest,
  TrainerProfile,
  TrainerAssignment,
  AssignTrainerRequest,
} from "@repo/types";

import {
  columns,
  type ProgramStatus,
  type Requirement,
  type TrainingProgram,
} from "./columns";

// ============================================================
// DEFAULT REQUIREMENTS
// ============================================================

const defaultRequirements: Requirement[] = [
  {
    id: "REQ-001",
    name: "Valid Government ID",
    description:
      "Any valid government-issued identification card.",
    required: true,
  },
  {
    id: "REQ-002",
    name: "Birth Certificate",
    description:
      "PSA or certified copy of birth certificate.",
    required: true,
  },
  {
    id: "REQ-003",
    name: "2x2 ID Photo",
    description:
      "Recent 2x2 identification photo.",
    required: true,
  },
  {
    id: "REQ-004",
    name: "Registration Form",
    description:
      "Completed and signed training registration form.",
    required: true,
  },
];

// ============================================================
// BATCH FORM
// ============================================================

type BatchFormState = {
  trainingProgramId: string;
  batchCode: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  capacity: string;
};

// ============================================================
// DATE HELPERS
// ============================================================

function toDateInputValue(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

// ============================================================
// STATUS
// ============================================================

const batchStatuses = [
  "Draft",
  "Published",
  "Ongoing",
  "Completed",
  "Cancelled",
] as const;

// ============================================================
// PAGE
// ============================================================

export default function TrainingProgramsPage() {
  // ==========================================================
  // TRAINER ASSIGNMENTS
  // ==========================================================

  const {
    assignments,
    assignTrainer,
    removeAssignment,
    isCreating: isCreatingAssignment,
    isDeleting: isDeletingAssignment,
    error: assignmentError,
    loadAssignments,
    getAssignmentByBatch,
  } = useTrainerAssignments(
    trainerAssignmentApi,
  );

  // ==========================================================
  // ACTIVE TRAINERS
  // ==========================================================

  const [
    activeTrainers,
    setActiveTrainers,
  ] = useState<TrainerProfile[]>([]);

  const [
    isLoadingTrainers,
    setIsLoadingTrainers,
  ] = useState(false);

  const [
    selectedTrainerId,
    setSelectedTrainerId,
  ] = useState("");

  const [
    isAssigningTrainer,
    setIsAssigningTrainer,
  ] = useState(false);

  const [
    assigningBatch,
    setAssigningBatch,
  ] = useState<TrainingBatch | null>(
    null,
  );

  // ==========================================================
  // LOAD ACTIVE TRAINERS
  // ==========================================================

  const loadActiveTrainers =
    useCallback(
      async () => {
        try {
          setIsLoadingTrainers(true);

          const result =
            await trainerApi.getActiveTrainers();

          setActiveTrainers(
            Array.isArray(result)
              ? result
              : [],
          );
        } catch (error) {
          console.error(
            "LOAD ACTIVE TRAINERS ERROR:",
            error,
          );

          setActiveTrainers([]);
        } finally {
          setIsLoadingTrainers(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadActiveTrainers();
  }, [
    loadActiveTrainers,
  ]);

  // ==========================================================
  // OPEN ASSIGN TRAINER
  // ==========================================================

  const openAssignTrainer =
    useCallback(
      (
        batch: TrainingBatch,
      ) => {
        setAssigningBatch(batch);

        const existingAssignment =
          getAssignmentByBatch(
            batch.id,
          );

        setSelectedTrainerId(
          existingAssignment
            ?.trainerProfileId ??
            "",
        );
      },
      [
        getAssignmentByBatch,
      ],
    );

  // ==========================================================
  // SAVE TRAINER ASSIGNMENT
  // ==========================================================

  const saveTrainerAssignment =
    useCallback(
      async () => {
        if (!assigningBatch) {
          return;
        }

        if (!selectedTrainerId) {
          alert(
            "Please select a trainer.",
          );
          return;
        }

        const existingAssignment =
          getAssignmentByBatch(
            assigningBatch.id,
          );

        if (
          existingAssignment &&
          existingAssignment.trainerProfileId ===
            selectedTrainerId
        ) {
          setAssigningBatch(null);
          setSelectedTrainerId("");
          return;
        }

        setIsAssigningTrainer(true);

        try {
          if (
            existingAssignment &&
            existingAssignment.trainerProfileId !==
              selectedTrainerId
          ) {
            const removed =
              await removeAssignment(
                existingAssignment.id,
              );

            if (!removed) {
              return;
            }
          }

          const payload:
            AssignTrainerRequest = {
            trainerProfileId:
              selectedTrainerId,

            trainingBatchId:
              assigningBatch.id,
          };

          const result =
            await assignTrainer(
              payload,
            );

          if (!result) {
            return;
          }

          await loadAssignments();

          alert(
            "Trainer assigned successfully.",
          );

          setAssigningBatch(null);
          setSelectedTrainerId("");
        } catch (error) {
          console.error(
            "SAVE TRAINER ASSIGNMENT ERROR:",
            error,
          );

          alert(
            error instanceof Error
              ? error.message
              : "Unable to assign trainer.",
          );
        } finally {
          setIsAssigningTrainer(false);
        }
      },
      [
        assigningBatch,
        selectedTrainerId,
        getAssignmentByBatch,
        removeAssignment,
        assignTrainer,
        loadAssignments,
      ],
    );

  // ==========================================================
  // REMOVE TRAINER
  // ==========================================================

  const handleRemoveTrainer =
    useCallback(
      async (
        batch: TrainingBatch,
      ) => {
        const assignment =
          getAssignmentByBatch(
            batch.id,
          );

        if (!assignment) {
          return;
        }

        const confirmed =
          window.confirm(
            `Remove ${assignment.trainerName} from batch ${batch.batchCode}?`,
          );

        if (!confirmed) {
          return;
        }

        const success =
          await removeAssignment(
            assignment.id,
          );

        if (!success) {
          return;
        }

        await loadAssignments();

        alert(
          "Trainer assignment removed.",
        );
      },
      [
        getAssignmentByBatch,
        removeAssignment,
        loadAssignments,
      ],
    );

  // ==========================================================
  // TRAINING PROGRAMS
  // ==========================================================

  const {
    programs: apiPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    isLoading: isLoadingPrograms,
    isCreating: isCreatingProgram,
    isUpdating: isUpdatingProgram,
    isDeleting: isDeletingProgram,
    error: programError,
  } =
    useTrainingPrograms(
      trainingProgramApi,
    );

  // ==========================================================
  // TRAINING BATCHES
  // ==========================================================

  const {
    batches,
    createBatch,
    updateBatch,
    updateBatchStatus,
    deleteBatch,
    isLoading: isLoadingBatches,
    isCreating: isCreatingBatch,
    isUpdating: isUpdatingBatch,
    isDeleting: isDeletingBatch,
    isUpdatingStatus:
      isUpdatingBatchStatus,
    error: batchError,
  } =
    useTrainingBatches(
      trainingBatchApi,
    );

  const handleDeleteBatch =
  useCallback(
    async (
      batch: TrainingBatch,
    ) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to delete batch ${batch.batchCode}?`,
        );

      if (!confirmed) {
        return;
      }

      const success =
        await deleteBatch(
          batch.id,
        );

      if (!success) {
        return;
      }

      setSelectedBatch(
        (current) =>
          current?.id === batch.id
            ? null
            : current,
      );

      setShowBatchForm(
        false,
      );

      alert(
        "Training batch deleted successfully.",
      );
    },
    [
      deleteBatch,
    ],
  );
  // ==========================================================
  // LOCAL PROGRAMS
  // ==========================================================

  const [
    programs,
    setPrograms,
  ] =
    useState<TrainingProgram[]>([]);

  // ==========================================================
  // SELECTED PROGRAM
  // ==========================================================

  const [
    selected,
    setSelected,
  ] =
    useState<TrainingProgram | null>(
      null,
    );

  // ==========================================================
  // SELECTED BATCH
  // ==========================================================

  const [
    selectedBatch,
    setSelectedBatch,
  ] =
    useState<TrainingBatch | null>(
      null,
    );

  // ==========================================================
  // MODALS
  // ==========================================================

  const [
    showDetails,
    setShowDetails,
  ] =
    useState(false);

  const [
    showForm,
    setShowForm,
  ] =
    useState(false);

  const [
    showDelete,
    setShowDelete,
  ] =
    useState(false);

  const [
    showBatchForm,
    setShowBatchForm,
  ] =
    useState(false);

  // ==========================================================
  // PROGRAM FORM
  // ==========================================================

  const [
    form,
    setForm,
  ] =
    useState({
      code: "",
      title: "",
      category:
        "Information Technology",
      description: "",
      hours: "",
    });

  // ==========================================================
  // REQUIREMENTS
  // ==========================================================

  const [
    requirements,
    setRequirements,
  ] =
    useState<Requirement[]>(
      defaultRequirements.map(
        (item) => ({
          ...item,
        }),
      ),
    );

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  const [
    selectedFiles,
    setSelectedFiles,
  ] =
    useState<
      {
        id: string;
        file: File;
        documentType: string;
      }[]
    >([]);

  const [
    documentType,
    setDocumentType,
  ] =
    useState(
      "TrainingManual",
    );

  // ==========================================================
  // BATCH FORM
  // ==========================================================

  const [
    batchForm,
    setBatchForm,
  ] =
    useState<BatchFormState>({
      trainingProgramId: "",
      batchCode: "",
      location: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      capacity: "",
    });

  // ==========================================================
  // BATCH SUBMIT LOCK
  // ==========================================================

  const isSavingBatchRef =
    useRef(false);

  // ==========================================================
  // DOCUMENT HOOK
  // ==========================================================

  const {
    documents,
    isLoading:
      isLoadingDocuments,
    isUploading,
    isDeleting:
      isDeletingDocument,
    error:
      documentError,
    loadDocuments,
    deleteDocument,
  } =
    useTrainingProgramDocuments(
      selected?.id ?? null,
      trainingProgramDocumentApi,
    );

  // ==========================================================
  // SYNC PROGRAMS FROM API
  // ==========================================================

  useEffect(() => {
    if (!Array.isArray(apiPrograms)) {
      setPrograms([]);
      return;
    }

    const mappedPrograms:
      TrainingProgram[] =
      apiPrograms.map(
        (
          program: ApiTrainingProgram,
        ) => {
          const programBatches =
            batches.filter(
              (batch) =>
                batch.programName ===
                program.name,
            );

          const totalCapacity =
            programBatches.reduce(
              (
                total,
                batch,
              ) =>
                total +
                batch.capacity,
              0,
            );

          const totalEnrolled =
            programBatches.reduce(
              (
                total,
                batch,
              ) =>
                total +
                batch.enrolledCount,
              0,
            );

          const activeBatch =
            programBatches.find(
              (batch) =>
                batch.status !==
                  "Completed" &&
                batch.status !==
                  "Cancelled",
            );

          return {
            id:
              program.id,

            code:
              program.programCode,

            title:
              program.name,

            category:
              "Information Technology",

            description:
              program.description ??
              "",

            duration:
              `${program.durationHours} hours`,

            hours:
              program.durationHours,

            capacity:
              totalCapacity,

            enrolled:
              totalEnrolled,

            schedule:
              activeBatch
                ? `${toDateInputValue(
                    activeBatch.startDate,
                  )} - ${toDateInputValue(
                    activeBatch.endDate,
                  )}`
                : "Not configured",

            location:
              activeBatch?.location ??
              "Not configured",

            trainer:
              "Not assigned",

            status:
              program.isActive
                ? "Active"
                : "Draft",

            requirements:
              program.requirements?.map(
                (
                  requirement,
                ) => ({
                  id:
                    requirement.id,

                  name:
                    requirement.name,

                  description:
                    requirement.description ??
                    "",

                  required:
                    requirement.isRequired,
                }),
              ) ?? [],

            createdAt:
              new Date(
                program.createdAt,
              ).toLocaleDateString(),
          };
        },
      );

    setPrograms(
      mappedPrograms,
    );
  }, [
    apiPrograms,
    batches,
  ]);

  // ==========================================================
  // LOAD DOCUMENTS
  // ==========================================================

  useEffect(() => {
    if (!selected?.id) {
      return;
    }

    loadDocuments();
  }, [
    selected?.id,
    loadDocuments,
  ]);

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories =
    useMemo(
      () => [
        "All Categories",
        ...Array.from(
          new Set(
            programs.map(
              (program) =>
                program.category,
            ),
          ),
        ),
      ],
      [programs],
    );

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState(
      "All Categories",
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      "All" | ProgramStatus
    >("All");

  // ==========================================================
  // FILTER PROGRAMS
  // ==========================================================

  const filteredPrograms =
    useMemo(
      () => {
        const query =
          search
            .toLowerCase()
            .trim();

        return programs.filter(
          (program) => {
            const matchesSearch =
              !query ||
              program.title
                .toLowerCase()
                .includes(query) ||
              program.code
                .toLowerCase()
                .includes(query) ||
              program.category
                .toLowerCase()
                .includes(query) ||
              program.trainer
                .toLowerCase()
                .includes(query);

            const matchesCategory =
              categoryFilter ===
                "All Categories" ||
              program.category ===
                categoryFilter;

            const matchesStatus =
              statusFilter ===
                "All" ||
              program.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesStatus
            );
          },
        );
      },
      [
        programs,
        search,
        categoryFilter,
        statusFilter,
      ],
    );

  // ==========================================================
  // OPEN CREATE PROGRAM
  // ==========================================================

  const openCreate =
    useCallback(
      () => {
        setSelected(null);

        setForm({
          code: "",
          title: "",
          category:
            "Information Technology",
          description: "",
          hours: "",
        });

        setRequirements(
          defaultRequirements.map(
            (item) => ({
              ...item,
            }),
          ),
        );

        setSelectedFiles([]);

        setDocumentType(
          "TrainingManual",
        );

        setShowForm(true);
      },
      [],
    );

  // ==========================================================
  // VIEW PROGRAM
  // ==========================================================

  const handleView =
    useCallback(
      (
        program: TrainingProgram,
      ) => {
        setSelected(
          program,
        );

        setShowDetails(
          true,
        );
      },
      [],
    );

  // ==========================================================
  // MANAGE PROGRAM
  // ==========================================================

  const handleManage =
    useCallback(
      (
        program: TrainingProgram,
      ) => {
        setSelected(
          program,
        );

        setForm({
          code:
            program.code,

          title:
            program.title,

          category:
            program.category,

          description:
            program.description,

          hours:
            String(
              program.hours,
            ),
        });

        setRequirements(
          program.requirements.map(
            (item) => ({
              ...item,
            }),
          ),
        );

        setSelectedFiles([]);

        setDocumentType(
          "TrainingManual",
        );

        setShowDetails(
          false,
        );

        setShowForm(
          true,
        );
      },
      [],
    );

  // ==========================================================
  // DELETE PROGRAM
  // ==========================================================

  const handleDelete =
    useCallback(
      (
        program: TrainingProgram,
      ) => {
        setSelected(
          program,
        );

        setShowDelete(
          true,
        );
      },
      [],
    );

  // ==========================================================
  // ADD REQUIREMENT
  // ==========================================================

  const addRequirement =
    useCallback(
      () => {
        setRequirements(
          (current) => [
            ...current,

            {
              id:
                `REQ-${Date.now()}`,

              name: "",

              description: "",

              required: true,
            },
          ],
        );
      },
      [],
    );

  // ==========================================================
  // UPDATE REQUIREMENT
  // ==========================================================

  const updateRequirement =
    useCallback(
      (
        id: string,
        field: keyof Requirement,
        value:
          | string
          | boolean,
      ) => {
        setRequirements(
          (current) =>
            current.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      [field]:
                        value,
                    }
                  : item,
            ),
        );
      },
      [],
    );

  // ==========================================================
  // REMOVE REQUIREMENT
  // ==========================================================

  const removeRequirement =
    useCallback(
      (
        id: string,
      ) => {
        setRequirements(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id,
            ),
        );
      },
      [],
    );

  // ==========================================================
  // SELECT DOCUMENT
  // ==========================================================

  const handleDocumentSelect =
    useCallback(
      (
        file: File,
      ) => {
        const allowedExtensions =
          [
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".ppt",
            ".pptx",
          ];

        const extension =
          "." +
          (
            file.name
              .split(".")
              .pop() ??
              ""
          ).toLowerCase();

        if (
          !allowedExtensions.includes(
            extension,
          )
        ) {
          alert(
            "Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.",
          );

          return;
        }

        setSelectedFiles(
          (current) => [
            ...current,

            {
              id:
                `${Date.now()}-${file.name}`,

              file,

              documentType,
            },
          ],
        );
      },
      [documentType],
    );

  // ==========================================================
  // REMOVE SELECTED FILE
  // ==========================================================

  const removeSelectedFile =
    useCallback(
      (
        id: string,
      ) => {
        setSelectedFiles(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id,
            ),
        );
      },
      [],
    );

  // ==========================================================
  // UPLOAD DOCUMENTS
  // ==========================================================

  const uploadPendingDocuments =
    useCallback(
      async (
        trainingProgramId: string,
      ) => {
        if (
          selectedFiles.length ===
          0
        ) {
          return true;
        }

        try {
          for (
            const item of
            selectedFiles
          ) {
            await trainingProgramDocumentApi.upload(
              trainingProgramId,
              item.file,
              item.documentType,
            );
          }

          setSelectedFiles([]);

          await loadDocuments();

          return true;
        } catch (error) {
          console.error(
            "UPLOAD TRAINING DOCUMENTS ERROR:",
            error,
          );

          alert(
            error instanceof Error
              ? error.message
              : "Unable to upload training documents.",
          );

          return false;
        }
      },
      [
        selectedFiles,
        loadDocuments,
      ],
    );

  // ==========================================================
  // SAVE PROGRAM
  // ==========================================================

  const saveProgram =
    useCallback(
      async () => {
        const programCode =
          form.code.trim();

        const name =
          form.title.trim();

        const description =
          form.description.trim();

        const durationHours =
          Number(
            form.hours,
          );

        if (!programCode) {
          alert(
            "Training code is required.",
          );
          return;
        }

        if (!name) {
          alert(
            "Training name is required.",
          );
          return;
        }

        if (!description) {
          alert(
            "Training description is required.",
          );
          return;
        }

        if (
          !Number.isFinite(
            durationHours,
          ) ||
          durationHours <= 0
        ) {
          alert(
            "Duration hours must be greater than 0.",
          );
          return;
        }

        const requirementPayload:
          TrainingProgramRequirementRequest[] =
          requirements
            .filter(
              (
                requirement,
              ) =>
                requirement.name.trim() !==
                "",
            )
            .map(
              (
                requirement,
                index,
              ) => ({
                name:
                  requirement.name.trim(),

                description:
                  requirement.description.trim() ||
                  null,

                isRequired:
                  requirement.required,

                displayOrder:
                  index + 1,
              }),
            );

        if (!selected) {
          const payload:
            CreateTrainingProgramRequest =
            {
              programCode,
              name,
              description,
              durationHours,
              requirements:
                requirementPayload,
            };

          const result =
            await createProgram(
              payload,
            );

          if (!result) {
            return;
          }

          if (
            selectedFiles.length >
            0
          ) {
            await uploadPendingDocuments(
              result.id,
            );
          }

          alert(
            "Training program created successfully.",
          );

          setShowForm(
            false,
          );

          setSelected(
            null,
          );

          return;
        }

        const payload:
          UpdateTrainingProgramRequest =
          {
            programCode,
            name,
            description:
              description ||
              null,
            durationHours,
            requirements:
              requirementPayload,
          };

        const success =
          await updateProgram(
            selected.id,
            payload,
          );

        if (!success) {
          return;
        }

        if (
          selectedFiles.length >
          0
        ) {
          await uploadPendingDocuments(
            selected.id,
          );
        }

        alert(
          "Training program updated successfully.",
        );

        setShowForm(
          false,
        );

        setSelected(
          null,
        );
      },
      [
        form,
        selected,
        requirements,
        selectedFiles,
        createProgram,
        updateProgram,
        uploadPendingDocuments,
      ],
    );

  // ==========================================================
  // CONFIRM DELETE PROGRAM
  // ==========================================================

  const confirmDelete =
    useCallback(
      async () => {
        if (!selected) {
          return;
        }

        const success =
          await deleteProgram(
            selected.id,
          );

        if (!success) {
          return;
        }

        setShowDelete(
          false,
        );

        setShowForm(
          false,
        );

        setShowDetails(
          false,
        );

        setSelected(
          null,
        );
      },
      [
        selected,
        deleteProgram,
      ],
    );

  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  const closeForm =
    useCallback(
      () => {
        setShowForm(
          false,
        );

        setSelected(
          null,
        );

        setSelectedFiles([]);
      },
      [],
    );

  // ==========================================================
  // OPEN CREATE BATCH
  // ==========================================================

  const openCreateBatch =
    useCallback(
      (
        program?: TrainingProgram,
      ) => {
        setSelectedBatch(
          null,
        );

        setBatchForm({
          trainingProgramId:
            program?.id ?? "",

          batchCode: "",

          location: "",

          startDate: "",

          endDate: "",

          startTime: "",

          endTime: "",

          capacity: "",
        });

        setShowBatchForm(
          true,
        );
      },
      [],
    );

  // ==========================================================
  // OPEN EDIT BATCH
  // ==========================================================

  const openEditBatch =
    useCallback(
      (
        batch: TrainingBatch,
      ) => {
        const program =
          programs.find(
            (item) =>
              item.title ===
              batch.programName,
          );

        if (!program) {
          alert(
            `Training program "${batch.programName}" could not be found.`,
          );

          return;
        }

        setSelectedBatch(
          batch,
        );

        setBatchForm({
          trainingProgramId:
            program.id,

          batchCode:
            batch.batchCode,

          location:
            batch.location ??
            "",

          startDate:
            toDateInputValue(
              batch.startDate,
            ),

          endDate:
            toDateInputValue(
              batch.endDate,
            ),

          startTime: "",

          endTime: "",

          capacity:
            String(
              batch.capacity,
            ),
        });

        setShowBatchForm(
          true,
        );
      },
      [programs],
    );

  // ==========================================================
  // SAVE BATCH
  // ==========================================================

  const saveBatch =
    useCallback(
      async () => {
        if (
          isSavingBatchRef.current
        ) {
          console.warn(
            "SAVE BATCH IGNORED: request already in progress.",
          );

          return;
        }

        if (
          !batchForm.trainingProgramId
        ) {
          alert(
            "Please select a training program.",
          );

          return;
        }

        if (
          !batchForm.batchCode.trim()
        ) {
          alert(
            "Batch code is required.",
          );

          return;
        }

        if (
          !batchForm.startDate
        ) {
          alert(
            "Start date is required.",
          );

          return;
        }

        if (
          !batchForm.endDate
        ) {
          alert(
            "End date is required.",
          );

          return;
        }

        const capacity =
          Number(
            batchForm.capacity,
          );

        if (
          !Number.isFinite(
            capacity,
          ) ||
          capacity <= 0
        ) {
          alert(
            "Capacity must be greater than 0.",
          );

          return;
        }

        if (
          batchForm.endDate <
          batchForm.startDate
        ) {
          alert(
            "End date cannot be earlier than start date.",
          );

          return;
        }

        const payload:
          CreateTrainingBatchRequest =
          {
            trainingProgramId:
              batchForm.trainingProgramId,

            batchCode:
              batchForm.batchCode.trim(),

            location:
              batchForm.location.trim() ||
              null,

            startDate:
              `${batchForm.startDate}T00:00:00`,

            endDate:
              `${batchForm.endDate}T00:00:00`,

            startTime:
              batchForm.startTime
                ? `${batchForm.startTime}:00`
                : null,

            endTime:
              batchForm.endTime
                ? `${batchForm.endTime}:00`
                : null,

            capacity,
          };

        console.log(
          "========== SAVE TRAINING BATCH ==========",
        );

        console.log(
          "MODE:",
          selectedBatch
            ? "UPDATE"
            : "CREATE",
        );

        console.log(
          "PAYLOAD:",
          JSON.stringify(
            payload,
            null,
            2,
          ),
        );

        console.log(
          "==========================================",
        );

        isSavingBatchRef.current =
          true;

        try {
          if (!selectedBatch) {
            const result =
              await createBatch(
                payload,
              );

            if (!result) {
              return;
            }

            alert(
              "Training batch created successfully.",
            );

            setShowBatchForm(
              false,
            );

            setSelectedBatch(
              null,
            );

            return;
          }

          const updatePayload:
            UpdateTrainingBatchRequest =
            payload;

          const success =
            await updateBatch(
              selectedBatch.id,
              updatePayload,
            );

          if (!success) {
            return;
          }

          alert(
            "Training batch updated successfully.",
          );

          setShowBatchForm(
            false,
          );

          setSelectedBatch(
            null,
          );
        } catch (error) {
          console.error(
            "SAVE TRAINING BATCH ERROR:",
            error,
          );

          alert(
            error instanceof Error
              ? error.message
              : "Unable to save training batch.",
          );
        } finally {
          isSavingBatchRef.current =
            false;
        }
      },
      [
        batchForm,
        selectedBatch,
        createBatch,
        updateBatch,
      ],
    );

  // ==========================================================
  // UPDATE BATCH STATUS
  // ==========================================================

  const handleBatchStatus =
    useCallback(
      async (
        batch: TrainingBatch,
        status: string,
      ) => {
        const normalizedStatus =
          status as
            UpdateTrainingBatchStatusRequest;

        const success =
          await updateBatchStatus(
            batch.id,
            normalizedStatus,
          );

        if (!success) {
          return;
        }

        alert(
          `Batch status updated to ${status}.`,
        );
      },
      [
        updateBatchStatus,
      ],
    );

  // ==========================================================
  // PROGRAM STATS
  // ==========================================================

  const totalPrograms =
    programs.length;

  const activePrograms =
    programs.filter(
      (program) =>
        program.status ===
        "Active",
    ).length;

  const draftPrograms =
    programs.filter(
      (program) =>
        program.status ===
        "Draft",
    ).length;

  const totalParticipants =
    batches.reduce(
      (
        total,
        batch,
      ) =>
        total +
        batch.enrolledCount,
      0,
    );

  // ==========================================================
  // BATCHES FOR SELECTED PROGRAM
  // ==========================================================

  const selectedProgramBatches =
    useMemo(
      () => {
        if (!selected) {
          return [];
        }

        return batches.filter(
          (batch) =>
            batch.programName ===
            selected.title,
        );
      },
      [
        batches,
        selected,
      ],
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>
              Training
            </span>

            <span>
              /
            </span>

            <span className="font-medium text-gray-600">
              Programs
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Training Programs
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Create and manage training
            programs, schedules,
            capacity, batches,
            trainer assignments,
            and enrollment requirements.
          </p>

        </div>

        <div className="flex gap-2">

          <Button
            variant="primary"
            onClick={
              openCreate
            }
          >
            <span className="text-lg leading-none">
              +
            </span>

            Create Training
          </Button>

        </div>

      </div>

      {/* STATS */}

      <StatGrid>

        <StatCard
          title="Total Programs"
          value={
            totalPrograms
          }
          description="All training programs"
        />

        <StatCard
          title="Active Programs"
          value={
            activePrograms
          }
          description="Currently available"
        />

        <StatCard
          title="Draft Programs"
          value={
            draftPrograms
          }
          description="Not yet published"
        />

        <StatCard
          title="Total Participants"
          value={
            totalParticipants
          }
          description="Across all batches"
        />

      </StatGrid>

      {/* INFO */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          i
        </div>

        <div>

          <p className="text-sm font-semibold text-blue-900">
            Enrollment requirements
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Requirements configured
            for a training program are
            used during participant
            enrollment.
          </p>

        </div>

      </div>

      {/* ERRORS */}

      {programError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {programError}
        </div>
      )}

      {batchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {batchError}
        </div>
      )}

      {assignmentError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {assignmentError}
        </div>
      )}

      {documentError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {documentError}
        </div>
      )}

      {/* PROGRAM TABLE */}

      <DataTable
        title="Training Program List"
        description="Manage programs and their enrollment configuration."
        columns={columns}
        data={
          filteredPrograms
        }
        searchable
        searchPlaceholder="Search training programs..."
        showPagination
        emptyTitle={
          isLoadingPrograms
            ? "Loading training programs..."
            : "No training programs found"
        }
        emptyDescription={
          isLoadingPrograms
            ? "Please wait while training programs are loaded."
            : "Create your first training program to get started."
        }
        addButton={{
          label:
            "Create Training",
          onClick:
            openCreate,
        }}
        meta={{
          onView:
            handleView,

          onManage:
            handleManage,

          onDelete:
            handleDelete,

          onCreateBatch:
            openCreateBatch,

          batches,
        }}
        toolbar={
          <div className="flex flex-wrap gap-2">

            <input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search..."
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:border-gray-300 focus:bg-white"
            />

            <select
              value={
                categoryFilter
              }
              onChange={(
                event,
              ) =>
                setCategoryFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none"
            >

              {categories.map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                ),
              )}

            </select>

            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | ProgramStatus,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none"
            >

              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Archived">
                Archived
              </option>

            </select>

          </div>
        }
      />

      {/* ======================================================
          SELECTED PROGRAM DETAILS
      ====================================================== */}

      {showDetails &&
        selected && (

          <ProgramDetailsModal
            program={
              selected
            }

            batches={
              selectedProgramBatches
            }

            assignments={
              assignments
            }

            documents={
              documents
            }

            isLoadingDocuments={
              isLoadingDocuments
            }

            onAssignTrainer={
              openAssignTrainer
            }

            onRemoveTrainer={
              handleRemoveTrainer
            }

            onClose={() => {
              setShowDetails(
                false,
              );

              setSelected(
                null,
              );
            }}

            onManage={() =>
              handleManage(
                selected,
              )
            }

            onCreateBatch={() =>
              openCreateBatch(
                selected,
              )
            }

            onEditBatch={
              openEditBatch
            }

            onDeleteBatch={
              handleDeleteBatch
            }

            isDeletingBatch={
              isDeletingBatch
            }

            onUpdateBatchStatus={
              handleBatchStatus
            }

            isUpdatingStatus={
              isUpdatingBatchStatus
            }
          />

        )}

      {/* ======================================================
          PROGRAM FORM
      ====================================================== */}

      {showForm && (

        <ProgramFormModal
          selected={
            selected
          }

          form={
            form
          }

          setForm={
            setForm
          }

          requirements={
            requirements
          }

          onAddRequirement={
            addRequirement
          }

          onUpdateRequirement={
            updateRequirement
          }

          onRemoveRequirement={
            removeRequirement
          }

          selectedFiles={
            selectedFiles
          }

          documentType={
            documentType
          }

          setDocumentType={
            setDocumentType
          }

          onDocumentSelect={
            handleDocumentSelect
          }

          onRemoveSelectedFile={
            removeSelectedFile
          }

          documents={
            documents
          }

          isLoadingDocuments={
            isLoadingDocuments
          }

          isUploading={
            isUploading
          }

          isDeleting={
            isDeletingDocument
          }

          onDeleteDocument={
            deleteDocument
          }

          onClose={
            closeForm
          }

          onSave={
            saveProgram
          }

          onDelete={() => {
            if (selected) {
              setShowDelete(
                true,
              );
            }
          }}

          isCreating={
            isCreatingProgram ||
            isUpdatingProgram
          }
        />

      )}

      {/* DELETE PROGRAM */}

      {showDelete &&
        selected && (

          <DeleteModal
            program={
              selected
            }

            isDeleting={
              isDeletingProgram
            }

            onCancel={() =>
              setShowDelete(
                false,
              )
            }

            onConfirm={
              confirmDelete
            }
          />

        )}

      {/* BATCH FORM */}

      {showBatchForm && (

        <BatchFormModal
          selectedBatch={
            selectedBatch
          }

          batchForm={
            batchForm
          }

          setBatchForm={
            setBatchForm
          }

          programs={
            programs
          }

          isCreating={
            isCreatingBatch
          }

          isUpdating={
            isUpdatingBatch
          }

          onClose={() => {
            setShowBatchForm(
              false,
            );

            setSelectedBatch(
              null,
            );
          }}

          onSave={
            saveBatch
          }
        />

      )}

      {/* ======================================================
          ASSIGN TRAINER MODAL
      ====================================================== */}

      {assigningBatch && (

        <TrainerAssignmentModal
          batch={
            assigningBatch
          }

          trainers={
            activeTrainers
          }

          assignments={
            assignments
          }

          selectedTrainerId={
            selectedTrainerId
          }

          setSelectedTrainerId={
            setSelectedTrainerId
          }

          isLoadingTrainers={
            isLoadingTrainers
          }

          isAssigning={
            isAssigningTrainer ||
            isCreatingAssignment
          }

          isDeleting={
            isDeletingAssignment
          }

          onClose={() => {
            if (
              isAssigningTrainer ||
              isCreatingAssignment ||
              isDeletingAssignment
            ) {
              return;
            }

            setAssigningBatch(
              null,
            );

            setSelectedTrainerId(
              "",
            );
          }}

          onSave={
            saveTrainerAssignment
          }
        />

      )}

    </div>
  );
}

// ============================================================
// PROGRAM DETAILS MODAL
// ============================================================

function ProgramDetailsModal({
  program,
  batches,
  assignments,
  documents,
  isLoadingDocuments,
  onClose,
  onManage,
  onCreateBatch,
  onEditBatch,
  onDeleteBatch,
  isDeletingBatch,
  onAssignTrainer,
  onRemoveTrainer,
  onUpdateBatchStatus,
  isUpdatingStatus,
}: {
  program: TrainingProgram;

  batches: TrainingBatch[];

  assignments: TrainerAssignment[];

  documents: {
    id: string;
    documentName: string;
    documentType: string;
    fileUrl: string;
    uploadedAt: string;
  }[];

  isLoadingDocuments: boolean;

  onClose: () => void;

  onManage: () => void;

  onCreateBatch: () => void;

  onEditBatch: (
    batch: TrainingBatch,
  ) => void;

  onDeleteBatch: (
    batch: TrainingBatch,
  ) => Promise<void>;

  isDeletingBatch: boolean;

  onAssignTrainer: (
    batch: TrainingBatch,
  ) => void;

  onRemoveTrainer: (
    batch: TrainingBatch,
  ) => Promise<void>;

  onUpdateBatchStatus: (
    batch: TrainingBatch,
    status: string,
  ) => Promise<void>;

  isUpdatingStatus: boolean;
}) {
  return (
    <Modal
      wide
      onClose={
        onClose
      }
    >

      {/* HEADER */}

      <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
            Training Program
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {
              program.title
            }
          </h2>

          <p className="mt-1 font-mono text-[10px] text-gray-400">
            {
              program.code
            }
          </p>

        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500"
        >
          ×
        </button>

      </div>

      {/* BODY */}

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

        <div className="space-y-5">

          {/* DESCRIPTION */}

          <div className="rounded-2xl bg-[#f7f8fa] p-5">

            <p className="text-sm leading-6 text-gray-600">
              {
                program.description
              }
            </p>

          </div>

          {/* PROGRAM INFO */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <Info
              title="Category"
              value={
                program.category
              }
            />

            <Info
              title="Duration"
              value={
                program.duration
              }
            />

            <Info
              title="Training Hours"
              value={`${program.hours} hours`}
            />

            <Info
              title="Status"
              value={
                program.status
              }
            />

            <Info
              title="Capacity"
              value={`${program.enrolled} / ${program.capacity}`}
            />

            <Info
              title="Location"
              value={
                program.location
              }
            />

          </div>

          {/* BATCHES */}

          <div className="rounded-2xl border border-[#e7e9ec] p-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h3 className="text-sm font-bold">
                  Training Batches
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Schedule and manage batches
                  and trainer assignments
                  for this training program.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  onCreateBatch
                }
                className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[11px] font-semibold text-white"
              >
                + Create Batch
              </button>

            </div>

            <div className="mt-4 space-y-3">

              {batches.length ===
              0 ? (

                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">

                  <p className="text-xs font-semibold text-gray-600">
                    No training batches
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    Create a batch for this
                    training program.
                  </p>

                </div>

              ) : (

                batches.map(
                  (
                    batch,
                  ) => {

                    const assignment =
                      assignments.find(
                        (
                          item,
                        ) =>
                          item.trainingBatchId ===
                            batch.id &&
                          item.isActive,
                      );

                    return (
                      <div
                        key={
                          batch.id
                        }
                        className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4"
                      >

                        <div className="flex flex-col gap-4">

                          {/* BATCH HEADER */}

                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="text-xs font-bold text-gray-800">
                                  {
                                    batch.batchCode
                                  }
                                </p>

                                <span className="rounded-full bg-gray-200 px-2 py-1 text-[9px] font-bold text-gray-600">
                                  {
                                    batch.status
                                  }
                                </span>

                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">

                                <SmallInfo
                                  label="Start"
                                  value={
                                    toDateInputValue(
                                      batch.startDate,
                                    )
                                  }
                                />

                                <SmallInfo
                                  label="End"
                                  value={
                                    toDateInputValue(
                                      batch.endDate,
                                    )
                                  }
                                />

                                <SmallInfo
                                  label="Capacity"
                                  value={String(
                                    batch.capacity,
                                  )}
                                />

                                <SmallInfo
                                  label="Enrolled"
                                  value={String(
                                    batch.enrolledCount,
                                  )}
                                />

                              </div>

                              <p className="mt-2 text-[10px] text-gray-500">
                                Location:{" "}
                                {batch.location ??
                                  "Not specified"}
                              </p>

                            </div>

                            {/* BATCH ACTIONS */}

                            <div className="flex flex-wrap gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  onEditBatch(
                                    batch,
                                  )
                                }
                                className="rounded-lg border border-[#e7e9ec] bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
                              >
                                Edit
                              </button>

                              <select
                                value={
                                  batch.status
                                }
                                disabled={
                                  isUpdatingStatus ||
                                  isDeletingBatch
                                }
                                onChange={(
                                  event,
                                ) =>
                                  onUpdateBatchStatus(
                                    batch,
                                    event.target.value,
                                  )
                                }
                                className="rounded-lg border border-[#e7e9ec] bg-white px-2 py-2 text-[10px] font-semibold text-gray-600 disabled:opacity-50"
                              >

                                {batchStatuses.map(
                                  (
                                    status,
                                  ) => (
                                    <option
                                      key={
                                        status
                                      }
                                      value={
                                        status
                                      }
                                    >
                                      {status}
                                    </option>
                                  ),
                                )}

                              </select>

                              <button
                                type="button"
                                onClick={() =>
                                  onDeleteBatch(
                                    batch,
                                  )
                                }
                                disabled={
                                  isDeletingBatch ||
                                  isUpdatingStatus
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isDeletingBatch
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>

                            </div>

                          </div>

                          {/* TRAINER ASSIGNMENT */}

                          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                              <div className="min-w-0">

                                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                                  Assigned Trainer
                                </p>

                                {assignment ? (

                                  <div className="mt-1 flex items-center gap-2">

                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[9px] font-bold text-white">
                                      {assignment.trainerName
                                        ?.charAt(0)
                                        .toUpperCase() ??
                                        "T"}
                                    </div>

                                    <div className="min-w-0">

                                      <p className="truncate text-xs font-semibold text-gray-800">
                                        {
                                          assignment.trainerName
                                        }
                                      </p>

                                      <p className="text-[9px] text-gray-400">
                                        Assigned
                                      </p>

                                    </div>

                                  </div>

                                ) : (

                                  <p className="mt-1 text-xs font-medium text-gray-400">
                                    No trainer assigned
                                  </p>

                                )}

                              </div>

                              <div className="flex gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    onAssignTrainer(
                                      batch,
                                    )
                                  }
                                  disabled={
                                    isDeletingBatch
                                  }
                                  className="rounded-lg bg-gray-900 px-3 py-2 text-[10px] font-semibold text-white disabled:opacity-50"
                                >
                                  {assignment
                                    ? "Change Trainer"
                                    : "Assign Trainer"}
                                </button>

                                {assignment && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onRemoveTrainer(
                                        batch,
                                      )
                                    }
                                    disabled={
                                      isDeletingBatch
                                    }
                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 disabled:opacity-50"
                                  >
                                    Remove
                                  </button>

                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  },
                )

              )}

            </div>

          </div>

          {/* REQUIREMENTS */}

          <div className="rounded-2xl border border-[#e7e9ec] p-5">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-sm font-bold">
                  Enrollment Requirements
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Requirements participants
                  need to submit.
                </p>

              </div>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                {
                  program.requirements.filter(
                    (requirement) =>
                      requirement.required,
                  ).length
                }{" "}
                Required
              </span>

            </div>

            <div className="mt-4 space-y-2">

              {program.requirements.length ===
              0 ? (

                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500">
                  No requirements configured.
                </div>

              ) : (

                program.requirements.map(
                  (
                    requirement,
                  ) => (

                    <div
                      key={
                        requirement.id
                      }
                      className="flex items-start gap-3 rounded-xl bg-[#fafbfc] p-3"
                    >

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-[10px] font-bold text-white">
                        ✓
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-800">
                          {
                            requirement.name
                          }
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-gray-500">
                          {
                            requirement.description ||
                            "No description."
                          }
                        </p>

                      </div>

                    </div>

                  ),
                )

              )}

            </div>

          </div>

          {/* DOCUMENTS */}

          <div className="rounded-2xl border border-[#e7e9ec] p-5">

            <h3 className="text-sm font-bold">
              Training Documents
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Documents attached to this
              training program.
            </p>

            <div className="mt-4 space-y-2">

              {isLoadingDocuments ? (

                <div className="rounded-xl bg-[#fafbfc] p-5 text-center text-xs text-gray-500">
                  Loading documents...
                </div>

              ) : documents.length ===
                0 ? (

                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500">
                  No documents uploaded.
                </div>

              ) : (

                documents.map(
                  (
                    document,
                  ) => (

                    <a
                      key={
                        document.id
                      }
                      href={
                        document.fileUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-[#fafbfc] p-3"
                    >

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200">
                        📄
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-xs font-semibold">
                          {
                            document.documentName
                          }
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {
                            document.documentType
                          }
                        </p>

                      </div>

                      <span className="text-xs text-gray-400">
                        ↗
                      </span>

                    </a>

                  ),
                )

              )}

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="flex shrink-0 gap-2 border-t border-[#eef0f2] px-6 py-4">

        <button
          type="button"
          onClick={
            onManage
          }
          className="flex-1 rounded-xl bg-[#191c1e] py-3 text-xs font-semibold text-white"
        >
          Manage Program
        </button>

        <button
          type="button"
          onClick={
            onClose
          }
          className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600"
        >
          Close
        </button>

      </div>

    </Modal>
  );
}

// ============================================================
// TRAINER ASSIGNMENT MODAL
// ============================================================

function TrainerAssignmentModal({
  batch,
  trainers,
  assignments,
  selectedTrainerId,
  setSelectedTrainerId,
  isLoadingTrainers,
  isAssigning,
  isDeleting,
  onClose,
  onSave,
}: {
  batch: TrainingBatch;

  trainers: TrainerProfile[];

  assignments: TrainerAssignment[];

  selectedTrainerId: string;

  setSelectedTrainerId: (
    value: string,
  ) => void;

  isLoadingTrainers: boolean;

  isAssigning: boolean;

  isDeleting: boolean;

  onClose: () => void;

  onSave: () => void;
}) {
  const currentAssignment =
    assignments.find(
      (assignment) =>
        assignment.trainingBatchId ===
          batch.id &&
        assignment.isActive,
    );

  const isSaving =
    isAssigning ||
    isDeleting;

  return (
    <Modal
      onClose={
        onClose
      }
    >

      {/* HEADER */}

      <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
            Trainer Assignment
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            {currentAssignment
              ? "Change Trainer"
              : "Assign Trainer"}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Assign an active trainer to
            this training batch.
          </p>

        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            isSaving
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 disabled:opacity-50"
        >
          ×
        </button>

      </div>

      {/* BODY */}

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

        <div className="space-y-5">

          {/* BATCH INFORMATION */}

          <div className="rounded-2xl bg-[#f7f8fa] p-5">

            <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
              Training Batch
            </p>

            <p className="mt-1 text-sm font-bold text-gray-900">
              {
                batch.batchCode
              }
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">

              <SmallInfo
                label="Program"
                value={
                  batch.programName
                }
              />

              <SmallInfo
                label="Capacity"
                value={
                  String(
                    batch.capacity,
                  )
                }
              />

              <SmallInfo
                label="Start"
                value={
                  toDateInputValue(
                    batch.startDate,
                  )
                }
              />

              <SmallInfo
                label="End"
                value={
                  toDateInputValue(
                    batch.endDate,
                  )
                }
              />

            </div>

          </div>

          {/* CURRENT TRAINER */}

          {currentAssignment && (

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">

              <p className="text-[9px] font-bold uppercase tracking-wide text-green-600">
                Current Trainer
              </p>

              <div className="mt-2 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  {currentAssignment.trainerName
                    ?.charAt(0)
                    .toUpperCase() ??
                    "T"}
                </div>

                <div>

                  <p className="text-xs font-bold text-green-900">
                    {
                      currentAssignment.trainerName
                    }
                  </p>

                  <p className="mt-0.5 text-[10px] text-green-700">
                    Currently assigned
                  </p>

                </div>

              </div>

            </div>

          )}

          {/* TRAINER SELECT */}

          <div>

            <label className="mb-1.5 block text-[11px] font-bold text-gray-600">
              Select Trainer
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            {isLoadingTrainers ? (

              <div className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4 text-xs text-gray-500">
                Loading active trainers...
              </div>

            ) : trainers.length ===
              0 ? (

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                <p className="text-xs font-semibold text-red-700">
                  No active trainers found.
                </p>

                <p className="mt-1 text-[10px] leading-5 text-red-600">
                  Activate a trainer profile
                  before assigning a trainer
                  to this batch.
                </p>

              </div>

            ) : (

              <select
                value={
                  selectedTrainerId
                }
                onChange={(
                  event,
                ) =>
                  setSelectedTrainerId(
                    event.target.value,
                  )
                }
                disabled={
                  isSaving
                }
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 text-xs outline-none focus:border-gray-300 focus:bg-white disabled:opacity-50"
              >

                <option value="">
                  Select a trainer...
                </option>

                {trainers.map(
                  (
                    trainer,
                  ) => (

                    <option
                      key={
                        trainer.id
                      }
                      value={
                        trainer.id
                      }
                    >
                      {
                        trainer.fullName
                      }
                      {" — "}
                      {
                        trainer.specialization
                      }
                    </option>

                  ),
                )}

              </select>

            )}

          </div>

          {/* SELECTED TRAINER PREVIEW */}

          {selectedTrainerId && (

            (() => {
              const trainer =
                trainers.find(
                  (item) =>
                    item.id ===
                    selectedTrainerId,
                );

              if (!trainer) {
                return null;
              }

              return (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <p className="text-[9px] font-bold uppercase tracking-wide text-blue-600">
                    Selected Trainer
                  </p>

                  <div className="mt-2 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                      {trainer.fullName
                        ?.charAt(0)
                        .toUpperCase() ??
                        "T"}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-xs font-bold text-gray-900">
                        {
                          trainer.fullName
                        }
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-500">
                        {
                          trainer.specialization ||
                          "No specialization"
                        }
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {
                          trainer.email
                        }
                      </p>

                    </div>

                  </div>

                </div>
              );
            })()

          )}

        </div>

      </div>

      {/* FOOTER */}

      <div className="flex shrink-0 justify-end gap-2 border-t border-[#eef0f2] px-6 py-4">

        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            isSaving
          }
          className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={
            onSave
          }
          disabled={
            isSaving ||
            isLoadingTrainers ||
            trainers.length === 0 ||
            !selectedTrainerId
          }
          className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isSaving
            ? "Assigning..."
            : currentAssignment
              ? "Change Trainer"
              : "Assign Trainer"}
        </button>

      </div>

    </Modal>
  );
}

// ============================================================
// BATCH FORM MODAL
// ============================================================

function BatchFormModal({
  selectedBatch,
  batchForm,
  setBatchForm,
  programs,
  isCreating,
  isUpdating,
  onClose,
  onSave,
}: {
  selectedBatch:
    | TrainingBatch
    | null;

  batchForm: BatchFormState;

  setBatchForm: React.Dispatch<
    React.SetStateAction<BatchFormState>
  >;

  programs: TrainingProgram[];

  isCreating: boolean;

  isUpdating: boolean;

  onClose: () => void;

  onSave: () => void;
}) {
  const isSaving =
    isCreating ||
    isUpdating;

  return (
    <Modal
      onClose={
        onClose
      }
    >

      <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
            Training Management
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {
              selectedBatch
                ? "Edit Training Batch"
                : "Create Training Batch"
            }
          </h2>

        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            isSaving
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500"
        >
          ×
        </button>

      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

        <div className="space-y-5">

          <FormSelect
            label="Training Program"
            value={
              batchForm.trainingProgramId
            }
            options={
              programs.map(
                (program) =>
                  program.id,
              )
            }
            optionLabels={
              programs.reduce(
                (
                  result,
                  program,
                ) => ({
                  ...result,
                  [program.id]:
                    `${program.code} — ${program.title}`,
                }),
                {} as Record<
                  string,
                  string
                >,
              )
            }
            onChange={(
              value,
            ) =>
              setBatchForm(
                (
                  current,
                ) => ({
                  ...current,
                  trainingProgramId:
                    value,
                }),
              )
            }
          />

          <FormInput
            label="Batch Code"
            value={
              batchForm.batchCode
            }
            onChange={(
              value,
            ) =>
              setBatchForm(
                (
                  current,
                ) => ({
                  ...current,
                  batchCode:
                    value,
                }),
              )
            }
            placeholder="AFS-001"
            required
          />

          <FormInput
            label="Location"
            value={
              batchForm.location
            }
            onChange={(
              value,
            ) =>
              setBatchForm(
                (
                  current,
                ) => ({
                  ...current,
                  location:
                    value,
                }),
              )
            }
            placeholder="CDM Training Room"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <FormInput
              label="Start Date"
              type="date"
              value={
                batchForm.startDate
              }
              onChange={(
                value,
              ) =>
                setBatchForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    startDate:
                      value,
                  }),
                )
              }
              required
            />

            <FormInput
              label="End Date"
              type="date"
              value={
                batchForm.endDate
              }
              onChange={(
                value,
              ) =>
                setBatchForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    endDate:
                      value,
                  }),
                )
              }
              required
            />

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <FormInput
              label="Start Time"
              type="time"
              value={
                batchForm.startTime
              }
              onChange={(
                value,
              ) =>
                setBatchForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    startTime:
                      value,
                  }),
                )
              }
            />

            <FormInput
              label="End Time"
              type="time"
              value={
                batchForm.endTime
              }
              onChange={(
                value,
              ) =>
                setBatchForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    endTime:
                      value,
                  }),
                )
              }
            />

          </div>

          <FormInput
            label="Capacity"
            type="number"
            value={
              batchForm.capacity
            }
            onChange={(
              value,
            ) =>
              setBatchForm(
                (
                  current,
                ) => ({
                  ...current,
                  capacity:
                    value,
                }),
              )
            }
            placeholder="30"
            required
          />

        </div>

      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-[#eef0f2] px-6 py-4">

        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            isSaving
          }
          className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={
            onSave
          }
          disabled={
            isSaving
          }
          className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : selectedBatch
              ? "Save Changes"
              : "Create Batch"}
        </button>

      </div>

    </Modal>
  );
}

// ============================================================
// PROGRAM FORM MODAL
// ============================================================

function ProgramFormModal({
  selected,
  form,
  setForm,
  requirements,
  onAddRequirement,
  onUpdateRequirement,
  onRemoveRequirement,
  selectedFiles,
  documentType,
  setDocumentType,
  onDocumentSelect,
  onRemoveSelectedFile,
  documents,
  isLoadingDocuments,
  isUploading,
  isDeleting,
  onDeleteDocument,
  onClose,
  onSave,
  onDelete,
  isCreating,
}: {
  selected:
    | TrainingProgram
    | null;

  form: {
    code: string;
    title: string;
    category: string;
    description: string;
    hours: string;
  };

  setForm: React.Dispatch<
    React.SetStateAction<{
      code: string;
      title: string;
      category: string;
      description: string;
      hours: string;
    }>
  >;

  requirements: Requirement[];

  onAddRequirement: () => void;

  onUpdateRequirement: (
    id: string,
    field: keyof Requirement,
    value:
      | string
      | boolean,
  ) => void;

  onRemoveRequirement: (
    id: string,
  ) => void;

  selectedFiles: {
    id: string;
    file: File;
    documentType: string;
  }[];

  documentType: string;

  setDocumentType: (
    value: string,
  ) => void;

  onDocumentSelect: (
    file: File,
  ) => void;

  onRemoveSelectedFile: (
    id: string,
  ) => void;

  documents: {
    id: string;
    documentName: string;
    documentType: string;
    fileUrl: string;
    uploadedAt: string;
  }[];

  isLoadingDocuments: boolean;

  isUploading: boolean;

  isDeleting: boolean;

  onDeleteDocument: (
    documentId: string,
  ) => Promise<boolean>;

  onClose: () => void;

  onSave: () => void;

  onDelete: () => void;

  isCreating: boolean;
}) {
  return (
    <Modal
      wide
      onClose={
        onClose
      }
    >

      <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
            Training Management
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {
              selected
                ? "Manage Training Program"
                : "Create Training Program"
            }
          </h2>

        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            isCreating ||
            isUploading
          }
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500"
        >
          ×
        </button>

      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

        <div className="space-y-6">

          <FormSection
            title="Basic Information"
            description="General information about the training program."
          >

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <FormInput
                label="Training Code"
                value={
                  form.code
                }
                onChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    code:
                      value,
                  })
                }
                placeholder="CSS-NCII"
                required
              />

              <FormInput
                label="Training Name"
                value={
                  form.title
                }
                onChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    title:
                      value,
                  })
                }
                placeholder="Training program name"
                required
              />

              <FormSelect
                label="Category"
                value={
                  form.category
                }
                options={[
                  "Information Technology",
                  "Electrical",
                  "Digital Skills",
                  "Construction",
                  "Automotive",
                  "Hospitality",
                  "Other",
                ]}
                onChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    category:
                      value,
                  })
                }
              />

              <FormInput
                label="Duration Hours"
                type="number"
                value={
                  form.hours
                }
                onChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    hours:
                      value,
                  })
                }
                placeholder="268"
                required
              />

            </div>

            <FormTextarea
              label="Description"
              value={
                form.description
              }
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  description:
                    value,
                })
              }
              placeholder="Describe the training program..."
              required
            />

          </FormSection>

          <FormSection
            title="Enrollment Requirements"
            description="Documents and requirements participants must complete."
            action={
              <button
                type="button"
                onClick={
                  onAddRequirement
                }
                className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[11px] font-semibold text-gray-600"
              >
                + Add Requirement
              </button>
            }
          >

            <div className="space-y-3">

              {requirements.map(
                (
                  requirement,
                  index,
                ) => (

                  <div
                    key={
                      requirement.id
                    }
                    className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4"
                  >

                    <div className="flex gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-[10px] font-bold text-white">
                        {
                          index + 1
                        }
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="grid gap-3 md:grid-cols-[1fr_auto]">

                          <input
                            value={
                              requirement.name
                            }
                            onChange={(
                              event,
                            ) =>
                              onUpdateRequirement(
                                requirement.id,
                                "name",
                                event.target.value,
                              )
                            }
                            placeholder="Requirement name"
                            className="h-10 rounded-lg border border-[#e7e9ec] bg-white px-3 text-xs outline-none"
                          />

                          <label className="flex items-center gap-2 rounded-lg border border-[#e7e9ec] bg-white px-3">

                            <input
                              type="checkbox"
                              checked={
                                requirement.required
                              }
                              onChange={(
                                event,
                              ) =>
                                onUpdateRequirement(
                                  requirement.id,
                                  "required",
                                  event.target.checked,
                                )
                              }
                            />

                            <span className="text-[10px] font-semibold">
                              Required
                            </span>

                          </label>

                        </div>

                        <textarea
                          value={
                            requirement.description
                          }
                          onChange={(
                            event,
                          ) =>
                            onUpdateRequirement(
                              requirement.id,
                              "description",
                              event.target.value,
                            )
                          }
                          placeholder="Requirement description"
                          rows={2}
                          className="mt-2 w-full resize-none rounded-lg border border-[#e7e9ec] bg-white px-3 py-2 text-xs outline-none"
                        />

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveRequirement(
                            requirement.id,
                          )
                        }
                        className="h-8 w-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        ×
                      </button>

                    </div>

                  </div>

                ),
              )}

            </div>

          </FormSection>

          <FormSection
            title="Training Documents"
            description="Upload manuals, curriculum, syllabus, guides, and other training files."
            action={
              <label className="cursor-pointer rounded-lg border border-[#e7e9ec] px-3 py-2 text-[11px] font-semibold text-gray-600">

                + Add Document

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                  onChange={(
                    event,
                  ) => {
                    const file =
                      event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    onDocumentSelect(
                      file,
                    );

                    event.target.value =
                      "";
                  }}
                />

              </label>
            }
          >

            <div>

              <label className="mb-1.5 block text-[11px] font-bold text-gray-600">
                Document Type
              </label>

              <select
                value={
                  documentType
                }
                onChange={(
                  event,
                ) =>
                  setDocumentType(
                    event.target.value,
                  )
                }
                className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 text-xs outline-none"
              >

                <option value="TrainingManual">
                  Training Manual
                </option>

                <option value="Curriculum">
                  Curriculum
                </option>

                <option value="Syllabus">
                  Syllabus
                </option>

                <option value="TrainingGuide">
                  Training Guide
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

            {selectedFiles.length >
              0 && (

              <div className="space-y-2">

                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Files to Upload
                </p>

                {selectedFiles.map(
                  (
                    item,
                  ) => (

                    <div
                      key={
                        item.id
                      }
                      className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3"
                    >

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                        📄
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-xs font-semibold">
                          {
                            item.file.name
                          }
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {
                            item.documentType
                          }
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveSelectedFile(
                            item.id,
                          )
                        }
                        disabled={
                          isUploading
                        }
                        className="h-8 w-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        ×
                      </button>

                    </div>

                  ),
                )}

              </div>

            )}

            {selected && (

              <div className="space-y-2">

                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Uploaded Documents
                </p>

                {isLoadingDocuments ? (

                  <div className="rounded-xl bg-gray-50 p-5 text-center text-xs text-gray-500">
                    Loading documents...
                  </div>

                ) : documents.length ===
                  0 ? (

                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500">
                    No documents uploaded.
                  </div>

                ) : (

                  documents.map(
                    (
                      document,
                    ) => (

                      <div
                        key={
                          document.id
                        }
                        className="flex items-center gap-3 rounded-xl bg-[#fafbfc] p-3"
                      >

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200">
                          📄
                        </div>

                        <div className="min-w-0 flex-1">

                          <a
                            href={
                              document.fileUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-xs font-semibold hover:underline"
                          >
                            {
                              document.documentName
                            }
                          </a>

                          <p className="mt-1 text-[10px] text-gray-500">
                            {
                              document.documentType
                            }
                          </p>

                        </div>

                        <button
                          type="button"
                          disabled={
                            isDeleting
                          }
                          onClick={async () => {
                            if (
                              !window.confirm(
                                `Delete ${document.documentName}?`,
                              )
                            ) {
                              return;
                            }

                            await onDeleteDocument(
                              document.id,
                            );
                          }}
                          className="rounded-lg px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>

                      </div>

                    ),
                  )

                )}

              </div>

            )}

          </FormSection>

        </div>

      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef0f2] px-6 py-4 sm:flex-row sm:justify-end">

        {selected && (

          <button
            type="button"
            onClick={
              onDelete
            }
            disabled={
              isCreating ||
              isUploading ||
              isDeleting
            }
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-semibold text-red-700 hover:bg-red-100 sm:mr-auto"
          >
            Delete Program
          </button>

        )}

        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            isCreating ||
            isUploading
          }
          className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={
            onSave
          }
          disabled={
            isCreating ||
            isUploading
          }
          className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isUploading
            ? "Uploading..."
            : isCreating
              ? "Saving..."
              : selected
                ? "Save Changes"
                : "Create Training"}
        </button>

      </div>

    </Modal>
  );
}

// ============================================================
// DELETE PROGRAM MODAL
// ============================================================

function DeleteModal({
  program,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  program: TrainingProgram;

  isDeleting: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 font-bold text-red-600">
          !
        </div>

        <h2 className="mt-5 text-xl font-bold">
          Delete Training Program?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">

          Are you sure you want to
          delete{" "}

          <strong>
            {
              program.title
            }
          </strong>
          ?

        </p>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              isDeleting
            }
            className="flex-1 rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              isDeleting
            }
            className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Program"}
          </button>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// GENERIC MODAL
// ============================================================

function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
          wide
            ? "max-w-5xl"
            : "max-w-2xl"
        }`}
      >
        {
          children
        }
      </div>

    </div>
  );
}

// ============================================================
// FORM SECTION
// ============================================================

function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e7e9ec] bg-white">

      <div className="flex flex-col gap-3 border-b border-[#eef0f2] p-5 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-sm font-bold">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>

        </div>

        {action}

      </div>

      <div className="space-y-4 p-5">
        {children}
      </div>

    </section>
  );
}

// ============================================================
// INPUT
// ============================================================

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[11px] font-bold text-gray-600">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={
          type
        }
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 text-xs outline-none focus:border-gray-300 focus:bg-white"
      />

    </div>
  );
}

// ============================================================
// SELECT
// ============================================================

function FormSelect({
  label,
  value,
  options,
  optionLabels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  optionLabels?: Record<
    string,
    string
  >;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[11px] font-bold text-gray-600">
        {label}
      </label>

      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 text-xs outline-none focus:border-gray-300 focus:bg-white"
      >

        <option value="">
          Select...
        </option>

        {options.map(
          (
            option,
          ) => (

            <option
              key={
                option
              }
              value={
                option
              }
            >
              {
                optionLabels?.[
                  option
                ] ??
                option
              }
            </option>

          ),
        )}

      </select>

    </div>
  );
}

// ============================================================
// TEXTAREA
// ============================================================

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[11px] font-bold text-gray-600">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <textarea
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        rows={4}
        className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 py-3 text-xs leading-5 outline-none focus:border-gray-300 focus:bg-white"
      />

    </div>
  );
}

// ============================================================
// INFO
// ============================================================

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {title}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}

// ============================================================
// SMALL INFO
// ============================================================

function SmallInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-gray-700">
        {value}
      </p>

    </div>
  );
}