"use client";

import { useMemo, useState } from "react";

type MaterialType =
  | "PDF"
  | "Presentation"
  | "Document"
  | "Video"
  | "Activity";

type MaterialStatus =
  | "Published"
  | "Draft"
  | "Archived";

type LearningMaterial = {
  id: string;
  title: string;
  description: string;
  training: string;
  trainingCode: string;
  module: string;
  type: MaterialType;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  status: MaterialStatus;
  downloads: number;
};

const initialMaterials: LearningMaterial[] = [
  {
    id: "MAT-001",
    title: "Computer Hardware Fundamentals",
    description:
      "Introduction to computer hardware components, functions, and basic maintenance.",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    module: "Module 1 — Introduction to CSS",
    type: "PDF",
    fileName:
      "computer-hardware-fundamentals.pdf",
    fileSize: "4.8 MB",
    uploadedBy: "Maria Santos",
    uploadedDate: "August 12, 2026",
    status: "Published",
    downloads: 42,
  },
  {
    id: "MAT-002",
    title: "Installing Computer Systems",
    description:
      "Learning module covering proper installation and configuration of computer systems.",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    module:
      "Module 2 — Installing Computer Systems",
    type: "PDF",
    fileName:
      "installing-computer-systems.pdf",
    fileSize: "6.2 MB",
    uploadedBy: "Maria Santos",
    uploadedDate: "August 13, 2026",
    status: "Published",
    downloads: 35,
  },
  {
    id: "MAT-003",
    title: "Networking Fundamentals",
    description:
      "Basic concepts of networking, network devices, IP addressing, and connectivity.",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    module: "Module 3 — Networking",
    type: "Presentation",
    fileName:
      "networking-fundamentals.pptx",
    fileSize: "8.5 MB",
    uploadedBy: "Maria Santos",
    uploadedDate: "August 14, 2026",
    status: "Published",
    downloads: 29,
  },
  {
    id: "MAT-004",
    title: "Computer Assembly Activity",
    description:
      "Hands-on activity sheet for assembling and disassembling computer components.",
    training:
      "Computer Systems Servicing NC II",
    trainingCode: "CSS-NCII",
    module: "Module 2 — Computer Assembly",
    type: "Activity",
    fileName:
      "computer-assembly-activity.pdf",
    fileSize: "2.1 MB",
    uploadedBy: "Maria Santos",
    uploadedDate: "August 15, 2026",
    status: "Published",
    downloads: 21,
  },
  {
    id: "MAT-005",
    title: "HTML and CSS Fundamentals",
    description:
      "Introduction to HTML structure, CSS styling, selectors, and responsive layouts.",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    module: "Module 1 — Web Fundamentals",
    type: "PDF",
    fileName:
      "html-css-fundamentals.pdf",
    fileSize: "5.4 MB",
    uploadedBy: "John Cruz",
    uploadedDate: "August 10, 2026",
    status: "Published",
    downloads: 48,
  },
  {
    id: "MAT-006",
    title: "JavaScript Basics",
    description:
      "Basic JavaScript syntax, variables, functions, conditions, and events.",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    module: "Module 2 — JavaScript",
    type: "Presentation",
    fileName:
      "javascript-basics.pptx",
    fileSize: "7.3 MB",
    uploadedBy: "John Cruz",
    uploadedDate: "August 11, 2026",
    status: "Published",
    downloads: 31,
  },
  {
    id: "MAT-007",
    title: "Responsive Web Design Demo",
    description:
      "Video demonstration of responsive web layouts using modern CSS techniques.",
    training:
      "Web Development Fundamentals",
    trainingCode: "WEB-DEV",
    module: "Module 3 — Responsive Design",
    type: "Video",
    fileName:
      "responsive-web-design.mp4",
    fileSize: "48.6 MB",
    uploadedBy: "John Cruz",
    uploadedDate: "August 12, 2026",
    status: "Published",
    downloads: 26,
  },
  {
    id: "MAT-008",
    title: "Electrical Safety Guidelines",
    description:
      "Safety procedures and precautions when working with electrical installations.",
    training:
      "Electrical Installation and Maintenance NC II",
    trainingCode: "EIM-NCII",
    module: "Module 1 — Electrical Safety",
    type: "Document",
    fileName:
      "electrical-safety-guidelines.docx",
    fileSize: "1.9 MB",
    uploadedBy: "Robert Flores",
    uploadedDate: "August 09, 2026",
    status: "Published",
    downloads: 37,
  },
  {
    id: "MAT-009",
    title: "Electrical Installation Activity",
    description:
      "Practical activity for basic electrical installation procedures.",
    training:
      "Electrical Installation and Maintenance NC II",
    trainingCode: "EIM-NCII",
    module:
      "Module 2 — Electrical Installation",
    type: "Activity",
    fileName:
      "electrical-installation-activity.pdf",
    fileSize: "3.4 MB",
    uploadedBy: "Robert Flores",
    uploadedDate: "August 14, 2026",
    status: "Draft",
    downloads: 0,
  },
  {
    id: "MAT-010",
    title: "Graphic Design Principles",
    description:
      "Fundamentals of composition, typography, color, hierarchy, and visual balance.",
    training:
      "Graphics Design Fundamentals",
    trainingCode: "GRAPHICS-01",
    module: "Module 1 — Design Fundamentals",
    type: "PDF",
    fileName:
      "graphic-design-principles.pdf",
    fileSize: "3.7 MB",
    uploadedBy: "Angela Reyes",
    uploadedDate: "August 15, 2026",
    status: "Published",
    downloads: 18,
  },
];

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
};

const statusStyles: Record<
  MaterialStatus,
  string
> = {
  Published:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Draft:
    "border-amber-200 bg-amber-50 text-amber-700",
  Archived:
    "border-gray-200 bg-gray-100 text-gray-600",
};

export default function Learning() {
  const [materials, setMaterials] =
    useState<LearningMaterial[]>(
      initialMaterials,
    );

  const [search, setSearch] =
    useState("");

  const [trainingFilter, setTrainingFilter] =
    useState("All Trainings");

  const [typeFilter, setTypeFilter] =
    useState("All Types");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [selected, setSelected] =
    useState<LearningMaterial | null>(
      null,
    );

  const [showView, setShowView] =
    useState(false);

  const [showDelete, setShowDelete] =
    useState(false);

  const trainings = [
    "All Trainings",
    ...Array.from(
      new Set(
        materials.map(
          (material) =>
            material.training,
        ),
      ),
    ),
  ];

  const filteredMaterials = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return materials.filter((material) => {
      const matchesSearch =
        material.title
          .toLowerCase()
          .includes(query) ||
        material.training
          .toLowerCase()
          .includes(query) ||
        material.trainingCode
          .toLowerCase()
          .includes(query) ||
        material.module
          .toLowerCase()
          .includes(query) ||
        material.uploadedBy
          .toLowerCase()
          .includes(query);

      const matchesTraining =
        trainingFilter ===
          "All Trainings" ||
        material.training ===
          trainingFilter;

      const matchesType =
        typeFilter === "All Types" ||
        material.type === typeFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        material.status === statusFilter;

      return (
        matchesSearch &&
        matchesTraining &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    materials,
    search,
    trainingFilter,
    typeFilter,
    statusFilter,
  ]);

  function viewMaterial(
    material: LearningMaterial,
  ) {
    setSelected(material);
    setShowView(true);
  }

  function deleteMaterial() {
    if (!selected) return;

    setMaterials((current) =>
      current.filter(
        (material) =>
          material.id !== selected.id,
      ),
    );

    setSelected(null);
    setShowDelete(false);
    setShowView(false);
  }

  function mockDownload(
    material: LearningMaterial,
  ) {
    alert(
      `Mock download:\n\n${material.fileName}\n\nIn the real system, this button will download the actual file.`,
    );
  }

  const publishedCount =
    materials.filter(
      (material) =>
        material.status === "Published",
    ).length;

  const draftCount =
    materials.filter(
      (material) =>
        material.status === "Draft",
    ).length;

  const totalDownloads =
    materials.reduce(
      (sum, material) =>
        sum + material.downloads,
      0,
    );

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>Training</span>
            <span>/</span>
            <span className="font-medium text-gray-600">
              Learning Materials
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Learning Materials
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            View and monitor learning resources
            uploaded by trainers for each training
            program.
          </p>

        </div>

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
            Admin view
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Trainers are responsible for uploading
            and maintaining learning materials.
            Admin can monitor, view, and download
            available materials.
          </p>

        </div>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          label="Total Materials"
          value={materials.length}
          description="All uploaded resources"
          icon="▣"
        />

        <SummaryCard
          label="Published"
          value={publishedCount}
          description="Available to participants"
          icon="✓"
          type="success"
        />

        <SummaryCard
          label="Draft"
          value={draftCount}
          description="Not yet published"
          icon="◷"
          type="warning"
        />

        <SummaryCard
          label="Total Downloads"
          value={totalDownloads}
          description="Material downloads"
          icon="↓"
          type="info"
        />

      </div>

      {/* =====================================================
          MATERIAL TABLE
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

        {/* FILTERS */}

        <div className="border-b border-[#eef0f2] p-5">

          <div className="flex flex-col gap-4">

            <div>

              <h2 className="text-sm font-bold">
                Material Library
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Browse learning materials by training,
                type, or publication status.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">

              {/* Search */}

              <div className="relative lg:col-span-1">

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
                  placeholder="Search materials..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-4 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

              </div>

              {/* Training */}

              <select
                value={trainingFilter}
                onChange={(event) =>
                  setTrainingFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
              >
                {trainings.map(
                  (training) => (
                    <option
                      key={training}
                      value={training}
                    >
                      {training}
                    </option>
                  ),
                )}
              </select>

              {/* Type */}

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
              >
                <option value="All Types">
                  All Types
                </option>

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
              </select>

              {/* Status */}

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
              >
                <option value="All Status">
                  All Status
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Archived">
                  Archived
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Learning Material
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Training
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Module
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Uploaded By
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#f0f1f2]">

              {filteredMaterials.map(
                (material) => {
                  const type =
                    typeStyles[
                      material.type
                    ];

                  return (
                    <tr
                      key={material.id}
                      className="transition hover:bg-[#fafbfc]"
                    >

                      {/* Material */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[9px] font-bold ${type.className}`}
                          >
                            {type.icon}
                          </div>

                          <div className="min-w-0">

                            <p className="max-w-[260px] truncate text-sm font-semibold">
                              {material.title}
                            </p>

                            <p className="mt-0.5 max-w-[260px] truncate font-mono text-[10px] text-gray-400">
                              {material.fileName}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Training */}

                      <td className="px-5 py-4">

                        <div>

                          <p className="max-w-[210px] text-xs font-semibold leading-5">
                            {material.training}
                          </p>

                          <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                            {material.trainingCode}
                          </p>

                        </div>

                      </td>

                      {/* Module */}

                      <td className="px-5 py-4">

                        <p className="max-w-[200px] text-xs leading-5 text-gray-600">
                          {material.module}
                        </p>

                      </td>

                      {/* Uploaded By */}

                      <td className="px-5 py-4">

                        <p className="text-xs font-semibold">
                          {material.uploadedBy}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {material.uploadedDate}
                        </p>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[material.status]}`}
                        >
                          {material.status}
                        </span>

                      </td>

                      {/* Action */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              viewMaterial(
                                material,
                              )
                            }
                            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              mockDownload(
                                material,
                              )
                            }
                            className="rounded-lg bg-[#191c1e] px-3 py-2 text-[11px] font-semibold text-white transition hover:opacity-90"
                          >
                            Download
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

          {filteredMaterials.length ===
            0 && <EmptyState />}

        </div>

        {/* FOOTER */}

        <div className="border-t border-[#eef0f2] px-5 py-4">

          <p className="text-[11px] text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              {filteredMaterials.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-600">
              {materials.length}
            </span>{" "}
            learning materials
          </p>

        </div>

      </section>

      {/* =====================================================
          VIEW MATERIAL MODAL
      ===================================================== */}

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
                    selected.type
                  ].className
                }`}
              >
                {
                  typeStyles[
                    selected.type
                  ].icon
                }
              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  Learning Material
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
              aria-label="Close"
            >
              ×
            </button>

          </div>

          {/* SCROLLABLE BODY */}

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

            <div className="space-y-5">

              {/* Description */}

              <div className="rounded-2xl bg-[#f7f8fa] p-5">

                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selected.description}
                </p>

              </div>

              {/* Information */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <Info
                  label="Training"
                  value={selected.training}
                />

                <Info
                  label="Training Code"
                  value={selected.trainingCode}
                />

                <Info
                  label="Module"
                  value={selected.module}
                />

                <Info
                  label="Material Type"
                  value={selected.type}
                />

                <Info
                  label="File Name"
                  value={selected.fileName}
                />

                <Info
                  label="File Size"
                  value={selected.fileSize}
                />

                <Info
                  label="Uploaded By"
                  value={selected.uploadedBy}
                />

                <Info
                  label="Uploaded Date"
                  value={selected.uploadedDate}
                />

                <Info
                  label="Downloads"
                  value={`${selected.downloads} downloads`}
                />

                <Info
                  label="Status"
                  value={selected.status}
                />

              </div>

              {/* Admin Note */}

              <div className="rounded-2xl border border-gray-200 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                    i
                  </div>

                  <div>

                    <p className="text-xs font-bold">
                      Admin monitoring
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-gray-500">
                      This material was uploaded by the
                      assigned trainer. Admin can review
                      and download the material but does
                      not manage the training content.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef0f2] bg-white px-6 py-4 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                mockDownload(selected)
              }
              className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Download Material
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

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDelete && selected && (
        <ConfirmDelete
          title="Remove Material?"
          description={`Are you sure you want to remove "${selected.title}" from the mock material library?`}
          onCancel={() =>
            setShowDelete(false)
          }
          onConfirm={deleteMaterial}
        />
      )}

    </div>
  );
}

/* ==========================================================
   SUMMARY CARD
========================================================== */

function SummaryCard({
  label,
  value,
  description,
  icon,
  type,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  type?: "success" | "warning" | "info";
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

/* ==========================================================
   INFO
========================================================== */

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

/* ==========================================================
   MODAL
========================================================== */

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

      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl">

        {children}

      </div>

    </div>
  );
}

/* ==========================================================
   EMPTY STATE
========================================================== */

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

/* ==========================================================
   DELETE CONFIRMATION
========================================================== */

function ConfirmDelete({
  title,
  description,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
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
            className="flex-1 rounded-xl border border-[#e7e9ec] py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Remove
          </button>

        </div>

      </div>

    </div>
  );
}