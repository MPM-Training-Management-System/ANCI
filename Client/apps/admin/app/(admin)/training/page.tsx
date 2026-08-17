"use client";

import { useMemo, useState } from "react";

type ProgramStatus = "Active" | "Draft" | "Archived";

type Requirement = {
  id: string;
  name: string;
  description: string;
  required: boolean;
};

type TrainingProgram = {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  hours: number;
  capacity: number;
  enrolled: number;
  schedule: string;
  location: string;
  trainer: string;
  status: ProgramStatus;
  requirements: Requirement[];
  createdAt: string;
};

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

const initialPrograms: TrainingProgram[] = [
  {
    id: "TRN-001",
    code: "CSS-NCII",
    title: "Computer Systems Servicing NC II",
    category: "Information Technology",
    description:
      "A technical training program covering installation, configuration, maintenance, and troubleshooting of computer systems and networks.",
    duration: "August 20 – October 20, 2026",
    hours: 268,
    capacity: 25,
    enrolled: 18,
    schedule: "Monday – Friday, 8:00 AM – 5:00 PM",
    location: "Computer Laboratory 1",
    trainer: "Maria Santos",
    status: "Active",
    requirements: defaultRequirements,
    createdAt: "August 01, 2026",
  },
  {
    id: "TRN-002",
    code: "WEB-DEV",
    title: "Web Development Fundamentals",
    category: "Information Technology",
    description:
      "Introduction to modern web development covering HTML, CSS, JavaScript, responsive design, and basic application development.",
    duration: "August 25 – October 30, 2026",
    hours: 240,
    capacity: 30,
    enrolled: 21,
    schedule: "Monday – Friday, 9:00 AM – 4:00 PM",
    location: "ICT Laboratory",
    trainer: "John Cruz",
    status: "Active",
    requirements: [
      ...defaultRequirements,
      {
        id: "REQ-005",
        name: "Educational Record",
        description:
          "Latest school record or certificate of educational attainment.",
        required: false,
      },
    ],
    createdAt: "August 03, 2026",
  },
  {
    id: "TRN-003",
    code: "EIM-NCII",
    title: "Electrical Installation and Maintenance NC II",
    category: "Electrical",
    description:
      "Training program focused on electrical installation, maintenance, safety procedures, and troubleshooting.",
    duration: "September 01 – November 15, 2026",
    hours: 268,
    capacity: 20,
    enrolled: 20,
    schedule: "Monday – Friday, 8:00 AM – 5:00 PM",
    location: "Electrical Workshop",
    trainer: "Robert Flores",
    status: "Active",
    requirements: [
      ...defaultRequirements,
      {
        id: "REQ-006",
        name: "Medical Certificate",
        description:
          "Medical certificate confirming fitness for training.",
        required: true,
      },
    ],
    createdAt: "August 04, 2026",
  },
  {
    id: "TRN-004",
    code: "GRAPHICS-01",
    title: "Graphics Design Fundamentals",
    category: "Digital Skills",
    description:
      "Fundamentals of graphic design, visual communication, layout, typography, and digital design tools.",
    duration: "October 05 – November 05, 2026",
    hours: 160,
    capacity: 25,
    enrolled: 0,
    schedule: "Saturday – Sunday, 8:00 AM – 5:00 PM",
    location: "Multimedia Laboratory",
    trainer: "Angela Reyes",
    status: "Draft",
    requirements: defaultRequirements,
    createdAt: "August 10, 2026",
  },
];

const statusStyles: Record<ProgramStatus, string> = {
  Active:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Draft:
    "border-amber-200 bg-amber-50 text-amber-700",
  Archived:
    "border-gray-200 bg-gray-100 text-gray-600",
};

export default function TrainingProgramsPage() {
  const [programs, setPrograms] =
    useState<TrainingProgram[]>(initialPrograms);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [statusFilter, setStatusFilter] =
    useState<"All" | ProgramStatus>("All");

  const [selected, setSelected] =
    useState<TrainingProgram | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [showDelete, setShowDelete] =
    useState(false);

  const [form, setForm] = useState({
    code: "",
    title: "",
    category: "Information Technology",
    description: "",
    duration: "",
    hours: "",
    capacity: "",
    schedule: "",
    location: "",
    trainer: "",
    status: "Draft" as ProgramStatus,
  });

  const [requirements, setRequirements] =
    useState<Requirement[]>([
      ...defaultRequirements.map((item) => ({
        ...item,
      })),
    ]);

  const categories = [
    "All Categories",
    ...Array.from(
      new Set(
        programs.map(
          (program) => program.category,
        ),
      ),
    ),
  ];

  const filteredPrograms = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return programs.filter((program) => {
      const matchesSearch =
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
        categoryFilter === "All Categories" ||
        program.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        program.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    programs,
    search,
    categoryFilter,
    statusFilter,
  ]);

  function openCreate() {
    setSelected(null);

    setForm({
      code: "",
      title: "",
      category: "Information Technology",
      description: "",
      duration: "",
      hours: "",
      capacity: "",
      schedule: "",
      location: "",
      trainer: "",
      status: "Draft",
    });

    setRequirements(
      defaultRequirements.map((item) => ({
        ...item,
      })),
    );

    setShowForm(true);
  }

  function openEdit(program: TrainingProgram) {
    setSelected(program);

    setForm({
      code: program.code,
      title: program.title,
      category: program.category,
      description: program.description,
      duration: program.duration,
      hours: String(program.hours),
      capacity: String(program.capacity),
      schedule: program.schedule,
      location: program.location,
      trainer: program.trainer,
      status: program.status,
    });

    setRequirements(
      program.requirements.map((item) => ({
        ...item,
      })),
    );

    setShowDetails(false);
    setShowForm(true);
  }

  function saveProgram() {
    if (
      !form.code.trim() ||
      !form.title.trim() ||
      !form.description.trim() ||
      !form.duration.trim() ||
      !form.hours ||
      !form.capacity ||
      !form.schedule.trim() ||
      !form.location.trim() ||
      !form.trainer.trim()
    ) {
      alert(
        "Please complete all required training information.",
      );

      return;
    }

    const cleanRequirements =
      requirements.filter(
        (item) => item.name.trim() !== "",
      );

    if (selected) {
      setPrograms((current) =>
        current.map((program) =>
          program.id === selected.id
            ? {
                ...program,
                code: form.code.trim(),
                title: form.title.trim(),
                category: form.category,
                description:
                  form.description.trim(),
                duration:
                  form.duration.trim(),
                hours: Number(form.hours),
                capacity: Number(
                  form.capacity,
                ),
                schedule:
                  form.schedule.trim(),
                location:
                  form.location.trim(),
                trainer:
                  form.trainer.trim(),
                status: form.status,
                requirements:
                  cleanRequirements,
              }
            : program,
        ),
      );
    } else {
      const nextId =
        programs.length + 1;

      const newProgram: TrainingProgram = {
        id: `TRN-${String(nextId).padStart(3, "0")}`,
        code: form.code.trim(),
        title: form.title.trim(),
        category: form.category,
        description:
          form.description.trim(),
        duration: form.duration.trim(),
        hours: Number(form.hours),
        capacity: Number(form.capacity),
        enrolled: 0,
        schedule: form.schedule.trim(),
        location: form.location.trim(),
        trainer: form.trainer.trim(),
        status: form.status,
        requirements: cleanRequirements,
        createdAt: "August 16, 2026",
      };

      setPrograms((current) => [
        ...current,
        newProgram,
      ]);
    }

    setShowForm(false);
    setSelected(null);
  }

  function addRequirement() {
    setRequirements((current) => [
      ...current,
      {
        id: `REQ-${Date.now()}`,
        name: "",
        description: "",
        required: true,
      },
    ]);
  }

  function updateRequirement(
    id: string,
    field: keyof Requirement,
    value: string | boolean,
  ) {
    setRequirements((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function removeRequirement(id: string) {
    setRequirements((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  }

  function deleteProgram() {
    if (!selected) return;

    setPrograms((current) =>
      current.filter(
        (program) =>
          program.id !== selected.id,
      ),
    );

    setShowDelete(false);
    setShowForm(false);
    setShowDetails(false);
    setSelected(null);
  }

  function closeForm() {
    setShowForm(false);
    setSelected(null);
  }

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
              Programs
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
            Training Programs
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Create and manage training programs,
            schedules, capacity, trainers, and
            enrollment requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#191c1e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <span className="text-lg leading-none">
            +
          </span>

          Create Training
        </button>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          label="Total Programs"
          value={programs.length}
          description="All training programs"
          icon="▣"
        />

        <SummaryCard
          label="Active Programs"
          value={
            programs.filter(
              (program) =>
                program.status === "Active",
            ).length
          }
          description="Currently available"
          icon="✓"
          type="success"
        />

        <SummaryCard
          label="Draft Programs"
          value={
            programs.filter(
              (program) =>
                program.status === "Draft",
            ).length
          }
          description="Not yet published"
          icon="◷"
          type="warning"
        />

        <SummaryCard
          label="Total Participants"
          value={programs.reduce(
            (sum, program) =>
              sum + program.enrolled,
            0,
          )}
          description="Across all programs"
          icon="♙"
          type="info"
        />

      </div>

      {/* =====================================================
          INFORMATION
      ===================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
          i
        </div>

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Training requirements
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Requirements configured here will
            automatically be shown to participants
            when they enroll in the selected training
            program.
          </p>
        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

        <div className="border-b border-[#eef0f2] p-5">

          <div className="flex flex-col gap-4">

            <div>
              <h2 className="text-sm font-bold">
                Training Program List
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Manage available programs and their
                enrollment configuration.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

              <div className="relative">

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
                  placeholder="Search training..."
                  className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-4 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
                />

              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
              >
                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ),
                )}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | ProgramStatus,
                  )
                }
                className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none focus:border-gray-300 focus:bg-white"
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

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Training Program
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Category
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Schedule
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Capacity
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Trainer
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

              {filteredPrograms.map(
                (program) => {
                  const percentage =
                    program.capacity === 0
                      ? 0
                      : Math.round(
                          (program.enrolled /
                            program.capacity) *
                            100,
                        );

                  return (
                    <tr
                      key={program.id}
                      className="transition hover:bg-[#fafbfc]"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
                            {program.code
                              .slice(0, 3)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="max-w-[240px] truncate text-sm font-semibold">
                              {program.title}
                            </p>

                            <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                              {program.code}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600">
                          {program.category}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <p className="max-w-[180px] text-xs font-medium leading-5">
                          {program.duration}
                        </p>

                        <p className="mt-0.5 max-w-[200px] text-[10px] leading-4 text-gray-400">
                          {program.schedule}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <div className="w-[120px]">

                          <div className="flex items-center justify-between">

                            <span className="text-xs font-semibold">
                              {program.enrolled}
                              /
                              {program.capacity}
                            </span>

                            <span className="text-[10px] text-gray-400">
                              {percentage}%
                            </span>

                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">

                            <div
                              className={`h-full rounded-full ${
                                percentage >= 100
                                  ? "bg-red-500"
                                  : percentage >= 80
                                    ? "bg-amber-500"
                                    : "bg-[#191c1e]"
                              }`}
                              style={{
                                width: `${Math.min(
                                  percentage,
                                  100,
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-xs font-semibold">
                          {program.trainer}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[program.status]}`}
                        >
                          {program.status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() => {
                              setSelected(
                                program,
                              );
                              setShowDetails(
                                true,
                              );
                            }}
                            className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(program)
                            }
                            className="rounded-lg bg-[#191c1e] px-3 py-2 text-[11px] font-semibold text-white transition hover:opacity-90"
                          >
                            Manage
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                },
              )}

            </tbody>

          </table>

          {filteredPrograms.length ===
            0 && <EmptyState />}

        </div>

        <div className="border-t border-[#eef0f2] px-5 py-4">

          <p className="text-[11px] text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-600">
              {filteredPrograms.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-600">
              {programs.length}
            </span>{" "}
            training programs
          </p>

        </div>

      </section>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {showDetails && selected && (
        <Modal
          onClose={() => {
            setShowDetails(false);
            setSelected(null);
          }}
        >

          <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] bg-white px-6 py-5">

            <div className="pr-6">

              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                Training Program
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                {selected.title}
              </h2>

              <p className="mt-1 font-mono text-[10px] text-gray-400">
                {selected.code}
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setShowDetails(false);
                setSelected(null);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            >
              ×
            </button>

          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

            <div className="space-y-5">

              <div className="rounded-2xl bg-[#f7f8fa] p-5">

                <p className="text-sm leading-6 text-gray-600">
                  {selected.description}
                </p>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Info
                  label="Category"
                  value={selected.category}
                />

                <Info
                  label="Duration"
                  value={selected.duration}
                />

                <Info
                  label="Training Hours"
                  value={`${selected.hours} hours`}
                />

                <Info
                  label="Schedule"
                  value={selected.schedule}
                />

                <Info
                  label="Location"
                  value={selected.location}
                />

                <Info
                  label="Trainer"
                  value={selected.trainer}
                />

                <Info
                  label="Capacity"
                  value={`${selected.enrolled} / ${selected.capacity} participants`}
                />

                <Info
                  label="Status"
                  value={selected.status}
                />

              </div>

              {/* Requirements */}

              <div className="rounded-2xl border border-[#e7e9ec] p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h3 className="text-sm font-bold">
                      Enrollment Requirements
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Requirements participants must
                      complete before enrollment approval.
                    </p>

                  </div>

                  <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600">
                    {
                      selected.requirements.filter(
                        (item) =>
                          item.required,
                      ).length
                    }{" "}
                    Required
                  </span>

                </div>

                <div className="mt-4 space-y-2">

                  {selected.requirements.map(
                    (requirement) => (
                      <div
                        key={requirement.id}
                        className="flex items-center gap-3 rounded-xl bg-[#f8f9fa] p-3"
                      >

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            requirement.required
                              ? "bg-[#191c1e] text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          ✓
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-xs font-semibold">
                            {requirement.name ||
                              "Unnamed requirement"}
                          </p>

                          <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                            {
                              requirement.description
                            }
                          </p>

                        </div>

                        <span
                          className={`shrink-0 text-[9px] font-bold uppercase ${
                            requirement.required
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                        >
                          {requirement.required
                            ? "Required"
                            : "Optional"}
                        </span>

                      </div>
                    ),
                  )}

                </div>

              </div>

            </div>

          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef0f2] bg-white px-6 py-4 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                openEdit(selected)
              }
              className="flex-1 rounded-xl bg-[#191c1e] py-3 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Manage Program
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDetails(false);
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
          CREATE / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <Modal
          wide
          onClose={closeForm}
        >

          {/* HEADER — DOES NOT SCROLL */}

          <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] bg-white px-6 py-5">

            <div className="pr-6">

              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                Training Management
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#17191c]">
                {selected
                  ? "Manage Training Program"
                  : "Create Training Program"}
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Configure training information and
                enrollment requirements.
              </p>

            </div>

            {/* FIXED X */}

            <button
              type="button"
              onClick={closeForm}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
              aria-label="Close modal"
            >
              ×
            </button>

          </div>

          {/* SCROLLABLE BODY */}

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

            <div className="space-y-6">

              {/* BASIC INFORMATION */}

              <FormSection
                title="Basic Information"
                description="General information about the training program."
              >

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <FormInput
                    label="Training Code"
                    value={form.code}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        code: value,
                      })
                    }
                    placeholder="e.g. CSS-NCII"
                    required
                  />

                  <FormInput
                    label="Training Title"
                    value={form.title}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        title: value,
                      })
                    }
                    placeholder="Training program name"
                    required
                  />

                  <FormSelect
                    label="Category"
                    value={form.category}
                    options={[
                      "Information Technology",
                      "Electrical",
                      "Digital Skills",
                      "Construction",
                      "Automotive",
                      "Hospitality",
                      "Other",
                    ]}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        category: value,
                      })
                    }
                  />

                  <FormSelect
                    label="Status"
                    value={form.status}
                    options={[
                      "Active",
                      "Draft",
                      "Archived",
                    ]}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        status:
                          value as ProgramStatus,
                      })
                    }
                  />

                </div>

                <FormTextarea
                  label="Description"
                  value={form.description}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      description: value,
                    })
                  }
                  placeholder="Describe what participants will learn..."
                  required
                />

              </FormSection>

              {/* SCHEDULE */}

              <FormSection
                title="Schedule & Capacity"
                description="Define when and where the training will be conducted."
              >

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <FormInput
                    label="Training Duration"
                    value={form.duration}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        duration: value,
                      })
                    }
                    placeholder="e.g. Aug 20 – Oct 20, 2026"
                    required
                  />

                  <FormInput
                    label="Training Hours"
                    value={form.hours}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        hours: value,
                      })
                    }
                    placeholder="e.g. 268"
                    type="number"
                    required
                  />

                  <FormInput
                    label="Schedule"
                    value={form.schedule}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        schedule: value,
                      })
                    }
                    placeholder="e.g. Mon – Fri, 8 AM – 5 PM"
                    required
                  />

                  <FormInput
                    label="Participant Capacity"
                    value={form.capacity}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        capacity: value,
                      })
                    }
                    placeholder="e.g. 25"
                    type="number"
                    required
                  />

                  <FormInput
                    label="Training Location"
                    value={form.location}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        location: value,
                      })
                    }
                    placeholder="e.g. Computer Laboratory 1"
                    required
                  />

                  <FormInput
                    label="Assigned Trainer"
                    value={form.trainer}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        trainer: value,
                      })
                    }
                    placeholder="e.g. Maria Santos"
                    required
                  />

                </div>

              </FormSection>

              {/* REQUIREMENTS */}

              <FormSection
                title="Enrollment Requirements"
                description="These requirements will automatically appear when participants enroll in this training."
                action={
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
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
                        key={requirement.id}
                        className="rounded-xl border border-[#e7e9ec] bg-[#fafbfc] p-4"
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#191c1e] text-[10px] font-bold text-white">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">

                              <input
                                value={
                                  requirement.name
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateRequirement(
                                    requirement.id,
                                    "name",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="Requirement name"
                                className="h-10 rounded-lg border border-[#e7e9ec] bg-white px-3 text-xs font-semibold outline-none transition focus:border-gray-300"
                              />

                              <label className="flex h-10 items-center gap-2 rounded-lg border border-[#e7e9ec] bg-white px-3">

                                <input
                                  type="checkbox"
                                  checked={
                                    requirement.required
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateRequirement(
                                      requirement.id,
                                      "required",
                                      event
                                        .target
                                        .checked,
                                    )
                                  }
                                  className="h-3.5 w-3.5"
                                />

                                <span className="text-[10px] font-semibold text-gray-600">
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
                                updateRequirement(
                                  requirement.id,
                                  "description",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              placeholder="Describe this requirement..."
                              rows={2}
                              className="mt-2 w-full resize-none rounded-lg border border-[#e7e9ec] bg-white px-3 py-2 text-xs outline-none transition focus:border-gray-300"
                            />

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeRequirement(
                                requirement.id,
                              )
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            title="Remove requirement"
                          >
                            ×
                          </button>

                        </div>

                      </div>
                    ),
                  )}

                </div>

                {requirements.length ===
                  0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">

                    <p className="text-xs font-semibold">
                      No requirements added
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      Add requirements that
                      participants need to submit
                      during enrollment.
                    </p>

                    <button
                      type="button"
                      onClick={addRequirement}
                      className="mt-4 rounded-lg bg-[#191c1e] px-3 py-2 text-[11px] font-semibold text-white"
                    >
                      + Add Requirement
                    </button>

                  </div>
                )}

              </FormSection>

            </div>

          </div>

          {/* FOOTER — DOES NOT SCROLL */}

          <div className="flex shrink-0 flex-col gap-2 border-t border-[#eef0f2] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end">

            {selected && (
              <button
                type="button"
                onClick={() =>
                  setShowDelete(true)
                }
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 sm:mr-auto"
              >
                Delete Program
              </button>
            )}

            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-[#e7e9ec] px-5 py-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveProgram}
              className="rounded-xl bg-[#191c1e] px-5 py-3 text-xs font-semibold text-white transition hover:opacity-90"
            >
              {selected
                ? "Save Changes"
                : "Create Training"}
            </button>

          </div>

        </Modal>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDelete && selected && (
        <ConfirmDelete
          title="Delete Training Program?"
          description={`Are you sure you want to delete "${selected.title}"? This mock action will remove the program from the list.`}
          onCancel={() =>
            setShowDelete(false)
          }
          onConfirm={deleteProgram}
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
   FORM SECTION
========================================================== */

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

          <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
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

/* ==========================================================
   INPUT
========================================================== */

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
  onChange: (value: string) => void;
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
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 text-xs outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
      />

    </div>
  );
}

/* ==========================================================
   SELECT
========================================================== */

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[11px] font-bold text-gray-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 text-xs outline-none transition focus:border-gray-300 focus:bg-white"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </div>
  );
}

/* ==========================================================
   TEXTAREA
========================================================== */

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#fafbfc] px-3 py-2.5 text-xs leading-5 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
      />

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

      <p className="mt-1.5 text-xs font-semibold leading-5">
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
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
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

      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl ${
          wide
            ? "max-w-4xl"
            : "max-w-2xl"
        }`}
      >
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
        No training programs found
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
            Delete Program
          </button>

        </div>

      </div>

    </div>
  );
}