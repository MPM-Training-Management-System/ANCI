"use client";

import { useMemo, useState } from "react";

type MaterialType =
  | "Module"
  | "Presentation"
  | "Video"
  | "Document"
  | "Link";

type MaterialStatus =
  | "Published"
  | "Draft";

type TrainingOption = {
  name: string;
  code: string;
};

type LearningMaterial = {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  status: MaterialStatus;
  training: string;
  trainingCode: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  updatedAt: string;
  url?: string;
};

const trainingOptions: TrainingOption[] = [
  {
    name: "Computer Systems Servicing NC II",
    code: "CSS-NCII",
  },
  {
    name: "Web Development Fundamentals",
    code: "WEB-DEV",
  },
  {
    name: "Electrical Installation and Maintenance NC II",
    code: "EIM-NCII",
  },
];

const materialTypes: MaterialType[] = [
  "Module",
  "Presentation",
  "Video",
  "Document",
  "Link",
];

const initialMaterials: LearningMaterial[] = [
  {
    id: "MAT-001",
    title: "Basic Computer Hardware",
    description:
      "Introduction to computer hardware components and their functions.",
    type: "Module",
    status: "Published",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    fileName:
      "basic-computer-hardware.pdf",
    fileSize: "4.2 MB",
    uploadedAt: "August 10, 2026",
    updatedAt: "August 12, 2026",
  },
  {
    id: "MAT-002",
    title: "Computer Networking Fundamentals",
    description:
      "Fundamental networking concepts, devices, protocols, and topologies.",
    type: "Presentation",
    status: "Published",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    fileName:
      "networking-fundamentals.pptx",
    fileSize: "7.8 MB",
    uploadedAt: "August 9, 2026",
    updatedAt: "August 11, 2026",
  },
  {
    id: "MAT-003",
    title: "Installing Operating Systems",
    description:
      "Step-by-step guide for preparing and installing operating systems.",
    type: "Module",
    status: "Published",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    fileName:
      "installing-operating-systems.pdf",
    fileSize: "5.1 MB",
    uploadedAt: "August 8, 2026",
    updatedAt: "August 8, 2026",
  },
  {
    id: "MAT-004",
    title: "Introduction to PC Assembly",
    description:
      "Video demonstration of proper PC component installation and assembly.",
    type: "Video",
    status: "Published",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    fileName:
      "pc-assembly.mp4",
    fileSize: "48.5 MB",
    uploadedAt: "August 6, 2026",
    updatedAt: "August 7, 2026",
  },
  {
    id: "MAT-005",
    title: "LAN Cable Crimping Guide",
    description:
      "Practical guide for creating and testing Ethernet cables.",
    type: "Document",
    status: "Draft",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    fileName:
      "lan-cable-crimping.docx",
    fileSize: "2.1 MB",
    uploadedAt: "August 5, 2026",
    updatedAt: "August 5, 2026",
  },
  {
    id: "MAT-006",
    title: "Network Troubleshooting Reference",
    description:
      "Quick reference for common network connectivity problems.",
    type: "Document",
    status: "Published",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    fileName:
      "network-troubleshooting.pdf",
    fileSize: "3.4 MB",
    uploadedAt: "August 3, 2026",
    updatedAt: "August 4, 2026",
  },
  {
    id: "MAT-007",
    title: "Safety Procedures in Computer Servicing",
    description:
      "Safety guidelines that trainees must observe during laboratory activities.",
    type: "Module",
    status: "Published",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    fileName:
      "safety-procedures.pdf",
    fileSize: "2.8 MB",
    uploadedAt: "August 1, 2026",
    updatedAt: "August 2, 2026",
  },
  {
    id: "MAT-008",
    title: "HTML and CSS Fundamentals",
    description:
      "Introduction to HTML structure and CSS styling.",
    type: "Module",
    status: "Published",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    fileName:
      "html-css-fundamentals.pdf",
    fileSize: "6.2 MB",
    uploadedAt: "August 9, 2026",
    updatedAt: "August 10, 2026",
  },
  {
    id: "MAT-009",
    title: "JavaScript Basics",
    description:
      "Introduction to JavaScript syntax, variables, functions, and events.",
    type: "Presentation",
    status: "Draft",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    fileName:
      "javascript-basics.pptx",
    fileSize: "8.4 MB",
    uploadedAt: "August 7, 2026",
    updatedAt: "August 7, 2026",
  },
  {
    id: "MAT-010",
    title: "Electrical Safety",
    description:
      "Basic electrical safety procedures and workplace practices.",
    type: "Module",
    status: "Published",
    training:
      "Electrical Installation and Maintenance NC II",
    trainingCode: "EIM-NCII",
    fileName:
      "electrical-safety.pdf",
    fileSize: "3.8 MB",
    uploadedAt: "August 5, 2026",
    updatedAt: "August 6, 2026",
  },
];

const emptyForm = {
  title: "",
  description: "",
  type: "Module" as MaterialType,
  status: "Draft" as MaterialStatus,
  fileName: "",
  fileSize: "",
  url: "",
};

export default function TrainerLearningMaterialsPage() {
  const [selectedTraining, setSelectedTraining] =
    useState(
      "Computer Systems Servicing NC II",
    );

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState<"All" | MaterialType>("All");

  const [statusFilter, setStatusFilter] =
    useState<
      "All" | MaterialStatus
    >("All");

  const [materials, setMaterials] =
    useState<LearningMaterial[]>(
      initialMaterials,
    );

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedMaterial, setSelectedMaterial] =
    useState<LearningMaterial | null>(
      null,
    );

  const [editingMaterial, setEditingMaterial] =
    useState<LearningMaterial | null>(
      null,
    );

  const [form, setForm] =
    useState(emptyForm);

  const filteredMaterials =
    useMemo(() => {
      const query = search
        .toLowerCase()
        .trim();

      return materials
        .filter(
          (material) =>
            material.training ===
            selectedTraining,
        )
        .filter((material) => {
          if (typeFilter === "All") {
            return true;
          }

          return (
            material.type === typeFilter
          );
        })
        .filter((material) => {
          if (statusFilter === "All") {
            return true;
          }

          return (
            material.status ===
            statusFilter
          );
        })
        .filter((material) => {
          if (!query) {
            return true;
          }

          return (
            material.title
              .toLowerCase()
              .includes(query) ||
            material.description
              .toLowerCase()
              .includes(query) ||
            material.fileName
              .toLowerCase()
              .includes(query)
          );
        })
        .sort((a, b) =>
          a.title.localeCompare(
            b.title,
            undefined,
            {
              sensitivity: "base",
            },
          ),
        );
    }, [
      materials,
      selectedTraining,
      search,
      typeFilter,
      statusFilter,
    ]);

  const trainingMaterials =
    materials.filter(
      (material) =>
        material.training ===
        selectedTraining,
    );

  const publishedCount =
    trainingMaterials.filter(
      (material) =>
        material.status ===
        "Published",
    ).length;

  const draftCount =
    trainingMaterials.filter(
      (material) =>
        material.status === "Draft",
    ).length;

  const moduleCount =
    trainingMaterials.filter(
      (material) =>
        material.type === "Module",
    ).length;

  const videoCount =
    trainingMaterials.filter(
      (material) =>
        material.type === "Video",
    ).length;

  function openAddModal() {
    setEditingMaterial(null);
    setForm(emptyForm);
    setShowAddModal(true);
  }

  function openEditModal(
    material: LearningMaterial,
  ) {
    setEditingMaterial(material);

    setForm({
      title: material.title,
      description: material.description,
      type: material.type,
      status: material.status,
      fileName: material.fileName,
      fileSize: material.fileSize,
      url: material.url ?? "",
    });

    setShowAddModal(true);
  }

  function openViewModal(
    material: LearningMaterial,
  ) {
    setSelectedMaterial(material);
    setShowViewModal(true);
  }

  function openDeleteModal(
    material: LearningMaterial,
  ) {
    setSelectedMaterial(material);
    setShowDeleteModal(true);
  }

  function saveMaterial() {
    if (!form.title.trim()) {
      alert("Please enter a material title.");
      return;
    }

    if (editingMaterial) {
      setMaterials((current) =>
        current.map((material) =>
          material.id ===
          editingMaterial.id
            ? {
                ...material,
                title:
                  form.title.trim(),
                description:
                  form.description.trim(),
                type: form.type,
                status: form.status,
                fileName:
                  form.fileName.trim() ||
                  "No file attached",
                fileSize:
                  form.fileSize.trim() ||
                  "—",
                url:
                  form.url.trim() ||
                  undefined,
                updatedAt:
                  getTodayDate(),
              }
            : material,
        ),
      );
    } else {
      const newMaterial: LearningMaterial =
        {
          id: `MAT-${String(
            materials.length + 1,
          ).padStart(3, "0")}`,
          title: form.title.trim(),
          description:
            form.description.trim(),
          type: form.type,
          status: form.status,
          training:
            selectedTraining,
          trainingCode:
            getTrainingCode(
              selectedTraining,
            ),
          fileName:
            form.fileName.trim() ||
            "No file attached",
          fileSize:
            form.fileSize.trim() ||
            "—",
          uploadedAt:
            getTodayDate(),
          updatedAt:
            getTodayDate(),
          url:
            form.url.trim() ||
            undefined,
        };

      setMaterials((current) => [
        newMaterial,
        ...current,
      ]);
    }

    setShowAddModal(false);
    setEditingMaterial(null);
    setForm(emptyForm);
  }

  function deleteMaterial() {
    if (!selectedMaterial) {
      return;
    }

    setMaterials((current) =>
      current.filter(
        (material) =>
          material.id !==
          selectedMaterial.id,
      ),
    );

    setSelectedMaterial(null);
    setShowDeleteModal(false);
  }

  function togglePublish(
    material: LearningMaterial,
  ) {
    setMaterials((current) =>
      current.map((item) =>
        item.id === material.id
          ? {
              ...item,
              status:
                item.status ===
                "Published"
                  ? "Draft"
                  : "Published",
              updatedAt:
                getTodayDate(),
            }
          : item,
      ),
    );
  }

  function resetFilters() {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>Trainer</span>
            <span>/</span>
            <span className="font-medium text-gray-600">
              Learning Materials
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Learning Materials
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Upload and organize learning
            materials for your assigned training
            programs.
          </p>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#191c1e] px-5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <span className="mr-2 text-base">
            +
          </span>
          Add Material
        </button>

      </div>

      {/* =====================================================
          INFO
      ===================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          i
        </div>

        <div>

          <p className="text-sm font-semibold text-blue-900">
            Training Materials
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Materials published here will be
            available to participants enrolled in
            the selected training program.
          </p>

        </div>

      </div>

      {/* =====================================================
          TRAINING SELECT
      ===================================================== */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="max-w-xl">

          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
            Training Program
          </label>

          <select
            value={selectedTraining}
            onChange={(event) => {
              setSelectedTraining(
                event.target.value,
              );

              resetFilters();
            }}
            className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
          >

            {trainingOptions.map(
              (training) => (
                <option
                  key={training.code}
                  value={training.name}
                >
                  {training.name}
                </option>
              ),
            )}

          </select>

        </div>

      </section>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <SummaryCard
          label="Total Materials"
          value={
            trainingMaterials.length
          }
        />

        <SummaryCard
          label="Published"
          value={publishedCount}
          type="success"
        />

        <SummaryCard
          label="Draft"
          value={draftCount}
          type="warning"
        />

        <SummaryCard
          label="Modules"
          value={moduleCount}
          type="info"
        />

      </div>

      {/* =====================================================
          MATERIALS TABLE
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

        {/* TABLE HEADER */}

        <div className="border-b border-[#eef0f2] p-5">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div>

              <h2 className="text-sm font-bold">
                Materials
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {selectedTraining}
              </p>

            </div>

            <div className="flex w-full flex-col gap-2 md:flex-row xl:w-auto">

              {/* SEARCH */}

              <div className="relative w-full md:w-64">

                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search material..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-9 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-gray-200"
                  >
                    ×
                  </button>
                )}

              </div>

              {/* TYPE */}

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target
                      .value as
                      | "All"
                      | MaterialType,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:bg-white"
              >

                <option value="All">
                  All Types
                </option>

                {materialTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}

              </select>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as
                      | "All"
                      | MaterialStatus,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:bg-white"
              >

                <option value="All">
                  All Status
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Draft">
                  Draft
                </option>

              </select>

            </div>

          </div>

          {(search ||
            typeFilter !== "All" ||
            statusFilter !== "All") && (
            <div className="mt-4 flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">
                {
                  filteredMaterials.length
                }{" "}
                result
                {filteredMaterials.length !==
                1
                  ? "s"
                  : ""}
              </span>

              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-semibold text-gray-500 underline underline-offset-2 hover:text-gray-800"
              >
                Clear filters
              </button>

            </div>
          )}

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Material
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Type
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  File
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Updated
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#eef0f2]">

              {filteredMaterials.map(
                (material) => (
                  <tr
                    key={material.id}
                    className="transition hover:bg-[#fafbfc]"
                  >

                    {/* MATERIAL */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${getTypeStyle(
                            material.type,
                          )}`}
                        >
                          {getTypeIcon(
                            material.type,
                          )}
                        </div>

                        <div className="max-w-[330px]">

                          <p className="truncate text-xs font-semibold">
                            {material.title}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-gray-400">
                            {material.description}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">

                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[9px] font-bold text-gray-600">
                        {material.type}
                      </span>

                    </td>

                    {/* FILE */}

                    <td className="px-5 py-4">

                      <div>

                        <p className="max-w-[190px] truncate text-[10px] font-medium text-gray-600">
                          {material.fileName}
                        </p>

                        <p className="mt-1 text-[9px] text-gray-400">
                          {material.fileSize}
                        </p>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                          material.status ===
                          "Published"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {material.status}
                      </span>

                    </td>

                    {/* UPDATED */}

                    <td className="px-5 py-4 text-[10px] text-gray-500">
                      {material.updatedAt}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-1.5">

                        <button
                          type="button"
                          onClick={() =>
                            openViewModal(
                              material,
                            )
                          }
                          className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              material,
                            )
                          }
                          className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            togglePublish(
                              material,
                            )
                          }
                          className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${
                            material.status ===
                            "Published"
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {material.status ===
                          "Published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(
                              material,
                            )
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>

        {filteredMaterials.length ===
          0 && <EmptyMaterials />}

        {/* FOOTER */}

        <div className="flex flex-col gap-2 border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-[10px] text-gray-400">
            Materials are automatically sorted
            alphabetically by title.
          </p>

          <p className="text-[10px] font-medium text-gray-500">
            {filteredMaterials.length}{" "}
            displayed
          </p>

        </div>

      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showAddModal && (
        <MaterialFormModal
          editing={editingMaterial}
          form={form}
          setForm={setForm}
          onClose={() => {
            setShowAddModal(false);
            setEditingMaterial(null);
          }}
          onSave={saveMaterial}
        />
      )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {showViewModal &&
        selectedMaterial && (
          <ViewMaterialModal
            material={selectedMaterial}
            onClose={() => {
              setShowViewModal(false);
              setSelectedMaterial(null);
            }}
            onEdit={() => {
              setShowViewModal(false);
              openEditModal(
                selectedMaterial,
              );
            }}
          />
        )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDeleteModal &&
        selectedMaterial && (
          <DeleteMaterialModal
            material={selectedMaterial}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedMaterial(null);
            }}
            onConfirm={deleteMaterial}
          />
        )}

    </div>
  );
}

/* ==========================================================
   MATERIAL FORM MODAL
========================================================== */

function MaterialFormModal({
  editing,
  form,
  setForm,
  onClose,
  onSave,
}: {
  editing: LearningMaterial | null;
  form: typeof emptyForm;
  setForm: React.Dispatch<
    React.SetStateAction<
      typeof emptyForm
    >
  >;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Learning Materials
            </p>

            <h2 className="mt-1 text-lg font-bold">
              {editing
                ? "Edit Material"
                : "Add Material"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {editing
                ? "Update the learning material details."
                : "Add a new learning material for this training."}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          <div className="space-y-5">

            {/* TITLE */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Material Title
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }))
                }
                placeholder="e.g. Basic Computer Hardware"
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Describe what this material contains..."
                rows={4}
                className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
              />

            </div>

            {/* TYPE + STATUS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Material Type
                </label>

                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target
                        .value as MaterialType,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
                >

                  {materialTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ),
                  )}

                </select>

              </div>

              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target
                        .value as MaterialStatus,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
                >

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>

                </select>

              </div>

            </div>

            {/* FILE NAME */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                File
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">

                <input
                  value={form.fileName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fileName:
                        event.target.value,
                    }))
                  }
                  placeholder="File name, e.g. module-1.pdf"
                  className="h-11 flex-1 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      fileName:
                        "uploaded-material.pdf",
                      fileSize: "3.5 MB",
                    }))
                  }
                  className="h-11 rounded-xl border border-[#e7e9ec] bg-white px-4 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Choose File
                </button>

              </div>

              <p className="mt-1.5 text-[10px] text-gray-400">
                Mock upload for now.
              </p>

            </div>

            {/* FILE SIZE */}

            <div>

              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                File Size
              </label>

              <input
                value={form.fileSize}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fileSize:
                      event.target.value,
                  }))
                }
                placeholder="e.g. 4.5 MB"
                className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
              />

            </div>

            {/* LINK */}

            {form.type === "Link" && (
              <div>

                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Resource Link
                </label>

                <input
                  value={form.url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      url: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/resource"
                  className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs outline-none focus:bg-white"
                />

              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white hover:opacity-90"
          >
            {editing
              ? "Save Changes"
              : "Add Material"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   VIEW MATERIAL MODAL
========================================================== */

function ViewMaterialModal({
  material,
  onClose,
  onEdit,
}: {
  material: LearningMaterial;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${getTypeStyle(
                material.type,
              )}`}
            >
              {getTypeIcon(
                material.type,
              )}
            </div>

            <div>

              <p className="text-[10px] text-gray-400">
                {material.type}
              </p>

              <h2 className="mt-1 text-lg font-bold">
                {material.title}
              </h2>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          <div className="space-y-4">

            {/* STATUS */}

            <div className="flex items-center justify-between rounded-2xl bg-[#f8f9fa] p-5">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                    material.status ===
                    "Published"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {material.status}
                </span>

              </div>

              <div className="text-right">

                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Material ID
                </p>

                <p className="mt-2 font-mono text-xs font-semibold">
                  {material.id}
                </p>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="rounded-2xl border border-[#e7e9ec] p-5">

              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {material.description ||
                  "No description provided."}
              </p>

            </div>

            {/* DETAILS */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <Detail
                label="Training"
                value={material.training}
              />

              <Detail
                label="Type"
                value={material.type}
              />

              <Detail
                label="File"
                value={material.fileName}
              />

              <Detail
                label="File Size"
                value={material.fileSize}
              />

              <Detail
                label="Uploaded"
                value={material.uploadedAt}
              />

              <Detail
                label="Last Updated"
                value={material.updatedAt}
              />

            </div>

            {material.url && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-blue-500">
                  Resource Link
                </p>

                <p className="mt-2 break-all text-xs font-medium text-blue-700">
                  {material.url}
                </p>

              </div>
            )}

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 justify-end gap-3 border-t border-[#eef0f2] px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white hover:opacity-90"
          >
            Edit Material
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   DELETE MODAL
========================================================== */

function DeleteMaterialModal({
  material,
  onClose,
  onConfirm,
}: {
  material: LearningMaterial;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
          !
        </div>

        <h2 className="mt-5 text-xl font-bold">
          Delete Material?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-700">
            {material.title}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   SUMMARY CARD
========================================================== */

function SummaryCard({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
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
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-4">

      <p className="text-[11px] font-medium text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          type
            ? styles[type].split(" ")[1]
            : "text-[#191c1e]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   DETAIL
========================================================== */

function Detail({
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

      <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-gray-700">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   EMPTY STATE
========================================================== */

function EmptyMaterials() {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ▣
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No learning materials found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Try changing your filters or add a
        new material.
      </p>

    </div>
  );
}

/* ==========================================================
   HELPERS
========================================================== */

function getTrainingCode(
  trainingName: string,
) {
  return (
    trainingOptions.find(
      (training) =>
        training.name === trainingName,
    )?.code ?? ""
  );
}

function getTodayDate() {
  return new Date().toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

function getTypeIcon(
  type: MaterialType,
) {
  switch (type) {
    case "Module":
      return "M";

    case "Presentation":
      return "P";

    case "Video":
      return "▶";

    case "Document":
      return "D";

    case "Link":
      return "↗";

    default:
      return "•";
  }
}

function getTypeStyle(
  type: MaterialType,
) {
  switch (type) {
    case "Module":
      return "bg-violet-50 text-violet-700";

    case "Presentation":
      return "bg-orange-50 text-orange-700";

    case "Video":
      return "bg-red-50 text-red-700";

    case "Document":
      return "bg-blue-50 text-blue-700";

    case "Link":
      return "bg-cyan-50 text-cyan-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}