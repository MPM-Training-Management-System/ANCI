"use client";

import { useMemo, useState } from "react";

type TrainingStatus =
  | "Active"
  | "Upcoming"
  | "Completed";

type ParticipantStatus =
  | "Active"
  | "Completed"
  | "Dropped";

type Participant = {
  id: string;
  name: string;
  email: string;
  status: ParticipantStatus;
  attendance: number;
  assessment: "Passed" | "Pending" | "Failed";
};

type Material = {
  id: string;
  title: string;
  type: "PDF" | "Presentation" | "Video" | "Activity";
};

type Training = {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  schedule: string;
  location: string;
  capacity: number;
  participants: number;
  attendanceRate: number;
  status: TrainingStatus;
  assignedDate: string;
  participantsList: Participant[];
  materials: Material[];
};

const mockTrainings: Training[] = [
  {
    id: "TRN-001",
    code: "CSS-NCII",
    title: "Computer Systems Servicing NC II",
    category: "Information Technology",
    description:
      "Technical training focused on installation, configuration, maintenance, and troubleshooting of computer systems and networks.",
    startDate: "August 20, 2026",
    endDate: "October 20, 2026",
    schedule: "Monday – Friday, 8:00 AM – 5:00 PM",
    location: "Computer Laboratory 1",
    capacity: 25,
    participants: 18,
    attendanceRate: 92,
    status: "Active",
    assignedDate: "August 10, 2026",
    participantsList: [
      {
        id: "P-001",
        name: "Juan Dela Cruz",
        email: "juan.delacruz@example.com",
        status: "Active",
        attendance: 96,
        assessment: "Passed",
      },
      {
        id: "P-002",
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        status: "Active",
        attendance: 91,
        assessment: "Passed",
      },
      {
        id: "P-003",
        name: "Pedro Santos",
        email: "pedro.santos@example.com",
        status: "Active",
        attendance: 87,
        assessment: "Pending",
      },
      {
        id: "P-004",
        name: "Ana Reyes",
        email: "ana.reyes@example.com",
        status: "Active",
        attendance: 94,
        assessment: "Passed",
      },
      {
        id: "P-005",
        name: "Mark Villanueva",
        email: "mark.villanueva@example.com",
        status: "Active",
        attendance: 89,
        assessment: "Pending",
      },
    ],
    materials: [
      {
        id: "MAT-001",
        title: "Computer Hardware Fundamentals",
        type: "PDF",
      },
      {
        id: "MAT-002",
        title: "Installing Computer Systems",
        type: "PDF",
      },
      {
        id: "MAT-003",
        title: "Networking Fundamentals",
        type: "Presentation",
      },
      {
        id: "MAT-004",
        title: "Computer Assembly Activity",
        type: "Activity",
      },
    ],
  },
  {
    id: "TRN-002",
    code: "WEB-DEV",
    title: "Web Development Fundamentals",
    category: "Digital Skills",
    description:
      "Introduction to modern web development covering HTML, CSS, JavaScript, responsive design, and basic application development.",
    startDate: "August 25, 2026",
    endDate: "October 30, 2026",
    schedule: "Monday – Friday, 9:00 AM – 4:00 PM",
    location: "ICT Laboratory",
    capacity: 30,
    participants: 21,
    attendanceRate: 88,
    status: "Upcoming",
    assignedDate: "August 12, 2026",
    participantsList: [
      {
        id: "P-006",
        name: "Kevin Ramos",
        email: "kevin.ramos@example.com",
        status: "Active",
        attendance: 0,
        assessment: "Pending",
      },
      {
        id: "P-007",
        name: "Sarah Mendoza",
        email: "sarah.mendoza@example.com",
        status: "Active",
        attendance: 0,
        assessment: "Pending",
      },
      {
        id: "P-008",
        name: "Daniel Torres",
        email: "daniel.torres@example.com",
        status: "Active",
        attendance: 0,
        assessment: "Pending",
      },
    ],
    materials: [
      {
        id: "MAT-005",
        title: "HTML and CSS Fundamentals",
        type: "PDF",
      },
      {
        id: "MAT-006",
        title: "JavaScript Basics",
        type: "Presentation",
      },
      {
        id: "MAT-007",
        title: "Responsive Web Design Demo",
        type: "Video",
      },
    ],
  },
  {
    id: "TRN-003",
    code: "EIM-NCII",
    title: "Electrical Installation and Maintenance NC II",
    category: "Electrical",
    description:
      "Training program covering electrical installation, maintenance, safety procedures, and troubleshooting.",
    startDate: "June 01, 2026",
    endDate: "August 10, 2026",
    schedule: "Monday – Friday, 8:00 AM – 5:00 PM",
    location: "Electrical Workshop",
    capacity: 20,
    participants: 20,
    attendanceRate: 94,
    status: "Completed",
    assignedDate: "May 20, 2026",
    participantsList: [
      {
        id: "P-009",
        name: "Michael Aquino",
        email: "michael.aquino@example.com",
        status: "Completed",
        attendance: 97,
        assessment: "Passed",
      },
      {
        id: "P-010",
        name: "James Bautista",
        email: "james.bautista@example.com",
        status: "Completed",
        attendance: 95,
        assessment: "Passed",
      },
      {
        id: "P-011",
        name: "Carlo Fernandez",
        email: "carlo.fernandez@example.com",
        status: "Completed",
        attendance: 91,
        assessment: "Passed",
      },
    ],
    materials: [
      {
        id: "MAT-008",
        title: "Electrical Safety Guidelines",
        type: "PDF",
      },
      {
        id: "MAT-009",
        title: "Electrical Installation Activity",
        type: "Activity",
      },
    ],
  },
];

const statusStyles: Record<TrainingStatus, string> = {
  Active:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Upcoming:
    "border-blue-200 bg-blue-50 text-blue-700",
  Completed:
    "border-gray-200 bg-gray-100 text-gray-600",
};

const materialStyles: Record<
  Material["type"],
  string
> = {
  PDF: "bg-red-50 text-red-600",
  Presentation: "bg-orange-50 text-orange-600",
  Video: "bg-purple-50 text-purple-600",
  Activity: "bg-emerald-50 text-emerald-600",
};

export default function MyTrainingPage() {
  const [trainings] =
    useState<Training[]>(mockTrainings);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | TrainingStatus>("All");

  const [selected, setSelected] =
    useState<Training | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("Overview");

  const filteredTrainings = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return trainings.filter((training) => {
      const matchesSearch =
        training.title
          .toLowerCase()
          .includes(query) ||
        training.code
          .toLowerCase()
          .includes(query) ||
        training.category
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        training.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [trainings, search, statusFilter]);

  const activeCount = trainings.filter(
    (training) =>
      training.status === "Active",
  ).length;

  const upcomingCount = trainings.filter(
    (training) =>
      training.status === "Upcoming",
  ).length;

  const completedCount = trainings.filter(
    (training) =>
      training.status === "Completed",
  ).length;

  const totalParticipants =
    trainings.reduce(
      (sum, training) =>
        sum + training.participants,
      0,
    );

  function openTraining(training: Training) {
    setSelected(training);
    setActiveTab("Overview");
    setShowDetails(true);
  }

  function closeTraining() {
    setSelected(null);
    setShowDetails(false);
  }

  return (
    <div className="space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>

        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <span>Trainer</span>
          <span>/</span>
          <span className="font-medium text-gray-600">
            My Training
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
          My Training
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          View the training programs assigned to
          you and manage your training activities.
        </p>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          label="My Trainings"
          value={trainings.length}
          description="All assigned trainings"
          icon="▣"
        />

        <SummaryCard
          label="Active"
          value={activeCount}
          description="Currently conducting"
          icon="✓"
          type="success"
        />

        <SummaryCard
          label="Upcoming"
          value={upcomingCount}
          description="Starting soon"
          icon="◷"
          type="info"
        />

        <SummaryCard
          label="Participants"
          value={totalParticipants}
          description="Across assigned trainings"
          icon="♙"
        />

      </div>

      {/* =====================================================
          SEARCH / FILTER
      ===================================================== */}

      <section className="rounded-2xl border border-[#e7e9ec] bg-white p-5">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h2 className="text-sm font-bold">
              Assigned Trainings
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              These training programs were assigned
              to you by the administrator.
            </p>

          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

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
                className="h-10 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] pl-9 pr-4 text-xs outline-none transition focus:border-gray-300 focus:bg-white sm:w-[240px]"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | TrainingStatus,
                )
              }
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium outline-none transition focus:border-gray-300 focus:bg-white"
            >

              <option value="All">
                All Trainings
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Upcoming">
                Upcoming
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

          </div>

        </div>

      </section>

      {/* =====================================================
          TRAINING CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {filteredTrainings.map(
          (training) => {
            const capacityPercent =
              Math.round(
                (training.participants /
                  training.capacity) *
                  100,
              );

            return (
              <TrainingCard
                key={training.id}
                training={training}
                capacityPercent={
                  capacityPercent
                }
                onView={() =>
                  openTraining(training)
                }
              />
            );
          },
        )}

      </div>

      {filteredTrainings.length === 0 && (
        <EmptyState />
      )}

      {/* =====================================================
          TRAINING DETAILS MODAL
      ===================================================== */}

      {showDetails && selected && (
        <TrainingDetailsModal
          training={selected}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={closeTraining}
        />
      )}

    </div>
  );
}

/* ==========================================================
   TRAINING CARD
========================================================== */

function TrainingCard({
  training,
  capacityPercent,
  onView,
}: {
  training: Training;
  capacityPercent: number;
  onView: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:border-gray-300 hover:shadow-sm">

      {/* TOP */}

      <div className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-xs font-bold text-white">
              {training.code
                .slice(0, 3)
                .toUpperCase()}
            </div>

            <div className="min-w-0">

              <p className="font-mono text-[10px] font-medium text-gray-400">
                {training.code}
              </p>

              <h3 className="mt-1 truncate text-base font-bold tracking-tight">
                {training.title}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {training.category}
              </p>

            </div>

          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[training.status]}`}
          >
            {training.status}
          </span>

        </div>

        {/* DESCRIPTION */}

        <p className="mt-5 line-clamp-2 text-xs leading-5 text-gray-500">
          {training.description}
        </p>

        {/* DETAILS */}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <DetailItem
            icon="▣"
            label="Training Period"
            value={`${training.startDate} – ${training.endDate}`}
          />

          <DetailItem
            icon="◷"
            label="Schedule"
            value={training.schedule}
          />

          <DetailItem
            icon="⌖"
            label="Location"
            value={training.location}
          />

          <DetailItem
            icon="♙"
            label="Participants"
            value={`${training.participants} / ${training.capacity}`}
          />

        </div>

      </div>

      {/* CAPACITY */}

      <div className="border-t border-[#eef0f2] px-5 py-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Enrollment Capacity
            </p>

            <p className="mt-1 text-xs font-semibold">
              {training.participants} participants
            </p>

          </div>

          <span className="text-[10px] font-bold text-gray-500">
            {capacityPercent}%
          </span>

        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">

          <div
            className={`h-full rounded-full ${
              capacityPercent >= 100
                ? "bg-red-500"
                : capacityPercent >= 80
                  ? "bg-amber-500"
                  : "bg-[#191c1e]"
            }`}
            style={{
              width: `${Math.min(
                capacityPercent,
                100,
              )}%`,
            }}
          />

        </div>

      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-between border-t border-[#eef0f2] bg-[#fafbfc] px-5 py-4">

        <p className="text-[10px] text-gray-400">
          Assigned{" "}
          <span className="font-semibold text-gray-600">
            {training.assignedDate}
          </span>
        </p>

        <button
          type="button"
          onClick={onView}
          className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
        >
          View Training
        </button>

      </div>

    </div>
  );
}

/* ==========================================================
   TRAINING DETAILS MODAL
========================================================== */

function TrainingDetailsModal({
  training,
  activeTab,
  setActiveTab,
  onClose,
}: {
  training: Training;
  activeTab: string;
  setActiveTab: (
    tab: string,
  ) => void;
  onClose: () => void;
}) {
  const tabs = [
    "Overview",
    "Participants",
    "Schedule",
    "Learning Materials",
    "Attendance",
    "Assessment",
    "Completion",
  ];

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

      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] bg-white px-6 py-5">

          <div className="flex min-w-0 items-center gap-3 pr-6">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
              {training.code
                .slice(0, 3)
                .toUpperCase()}
            </div>

            <div className="min-w-0">

              <p className="font-mono text-[10px] text-gray-400">
                {training.code}
              </p>

              <h2 className="mt-1 truncate text-lg font-bold tracking-tight">
                {training.title}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {training.category}
              </p>

            </div>

          </div>

          {/* FIXED X */}

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            aria-label="Close"
          >
            ×
          </button>

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="shrink-0 overflow-x-auto border-b border-[#eef0f2] bg-white px-4">

          <div className="flex min-w-max">

            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`relative px-4 py-3 text-[11px] font-semibold transition ${
                  activeTab === tab
                    ? "text-[#191c1e]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}

                {activeTab === tab && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#191c1e]" />
                )}
              </button>
            ))}

          </div>

        </div>

        {/* =================================================
            SCROLLABLE BODY
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

          {activeTab === "Overview" && (
            <OverviewTab
              training={training}
            />
          )}

          {activeTab === "Participants" && (
            <ParticipantsTab
              training={training}
            />
          )}

          {activeTab === "Schedule" && (
            <ScheduleTab
              training={training}
            />
          )}

          {activeTab ===
            "Learning Materials" && (
            <MaterialsTab
              training={training}
            />
          )}

          {activeTab === "Attendance" && (
            <AttendanceTab
              training={training}
            />
          )}

          {activeTab === "Assessment" && (
            <AssessmentTab
              training={training}
            />
          )}

          {activeTab === "Completion" && (
            <CompletionTab
              training={training}
            />
          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-t border-[#eef0f2] bg-white px-6 py-4">

          <p className="text-[10px] text-gray-400">
            Assigned by Administrator
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e7e9ec] px-5 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   OVERVIEW TAB
========================================================== */

function OverviewTab({
  training,
}: {
  training: Training;
}) {
  return (
    <div className="space-y-5">

      <div className="rounded-2xl bg-[#f7f8fa] p-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
              Training Overview
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              {training.description}
            </p>

          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[training.status]}`}
          >
            {training.status}
          </span>

        </div>

      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatBox
          label="Participants"
          value={`${training.participants}/${training.capacity}`}
        />

        <StatBox
          label="Attendance"
          value={`${training.attendanceRate}%`}
        />

        <StatBox
          label="Materials"
          value={String(
            training.materials.length,
          )}
        />

        <StatBox
          label="Location"
          value={training.location}
        />

      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <InfoCard
          title="Training Period"
          value={`${training.startDate} – ${training.endDate}`}
        />

        <InfoCard
          title="Schedule"
          value={training.schedule}
        />

        <InfoCard
          title="Training Location"
          value={training.location}
        />

        <InfoCard
          title="Assigned Date"
          value={training.assignedDate}
        />

      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">

        <p className="text-xs font-bold text-blue-900">
          Trainer responsibility
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Manage attendance, learning materials,
          assessments, and participant completion
          for this assigned training.
        </p>

      </div>

    </div>
  );
}

/* ==========================================================
   PARTICIPANTS TAB
========================================================== */

function ParticipantsTab({
  training,
}: {
  training: Training;
}) {
  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-sm font-bold">
            Training Participants
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Participants enrolled in this assigned
            training.
          </p>

        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-600">
          {training.participants} Participants
        </span>

      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e7e9ec]">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead>

              <tr className="border-b border-[#eef0f2] bg-[#fafbfc]">

                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Participant
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Attendance
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                  Assessment
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#eef0f2]">

              {training.participantsList.map(
                (participant) => (
                  <tr
                    key={participant.id}
                    className="hover:bg-[#fafbfc]"
                  >

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#191c1e] text-[10px] font-bold text-white">
                          {getInitials(
                            participant.name,
                          )}
                        </div>

                        <div>

                          <p className="text-xs font-semibold">
                            {participant.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-gray-400">
                            {participant.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-4 py-4">

                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                        {participant.status}
                      </span>

                    </td>

                    <td className="px-4 py-4">

                      {participant.attendance ===
                      0 ? (
                        <span className="text-[10px] text-gray-400">
                          Not started
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-bold ${
                            participant.attendance >=
                            90
                              ? "text-emerald-600"
                              : participant.attendance >=
                                  80
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {
                            participant.attendance
                          }
                          %
                        </span>
                      )}

                    </td>

                    <td className="px-4 py-4">

                      <AssessmentBadge
                        value={
                          participant.assessment
                        }
                      />

                    </td>

                  </tr>
                ),
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   SCHEDULE TAB
========================================================== */

function ScheduleTab({
  training,
}: {
  training: Training;
}) {
  const schedule = [
    {
      date: "August 20, 2026",
      topic: "Introduction to Computer Systems",
      time: "8:00 AM – 5:00 PM",
      type: "Lecture",
    },
    {
      date: "August 21, 2026",
      topic: "Computer Hardware Components",
      time: "8:00 AM – 5:00 PM",
      type: "Lecture + Activity",
    },
    {
      date: "August 24, 2026",
      topic: "Computer Assembly",
      time: "8:00 AM – 5:00 PM",
      type: "Laboratory",
    },
    {
      date: "August 25, 2026",
      topic: "Operating System Installation",
      time: "8:00 AM – 5:00 PM",
      type: "Laboratory",
    },
  ];

  return (
    <div className="space-y-5">

      <div>

        <h3 className="text-sm font-bold">
          Training Schedule
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Schedule for {training.title}.
        </p>

      </div>

      <div className="rounded-2xl border border-[#e7e9ec]">

        {schedule.map(
          (item, index) => (
            <div
              key={`${item.date}-${index}`}
              className="flex flex-col gap-3 border-b border-[#eef0f2] p-5 last:border-b-0 sm:flex-row sm:items-center"
            >

              <div className="w-36 shrink-0">

                <p className="text-xs font-bold">
                  {item.date}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  {item.time}
                </p>

              </div>

              <div className="h-px flex-1 bg-gray-100 sm:h-10 sm:w-px" />

              <div className="min-w-0 flex-1">

                <p className="text-xs font-semibold">
                  {item.topic}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  {item.type}
                </p>

              </div>

              <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[10px] font-semibold text-gray-600">
                {training.location}
              </div>

            </div>
          ),
        )}

      </div>

    </div>
  );
}

/* ==========================================================
   MATERIALS TAB
========================================================== */

function MaterialsTab({
  training,
}: {
  training: Training;
}) {
  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-sm font-bold">
            Learning Materials
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Materials prepared for this training.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            alert(
              "Mock upload action. In the actual system, the trainer can upload a learning material here.",
            )
          }
          className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[11px] font-semibold text-white"
        >
          + Upload Material
        </button>

      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {training.materials.map(
          (material) => (
            <div
              key={material.id}
              className="flex items-center gap-3 rounded-2xl border border-[#e7e9ec] bg-white p-4"
            >

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[9px] font-bold ${
                  materialStyles[
                    material.type
                  ]
                }`}
              >
                {material.type ===
                "Presentation"
                  ? "PPT"
                  : material.type ===
                      "Activity"
                    ? "ACT"
                    : material.type ===
                        "Video"
                      ? "VID"
                      : "PDF"}
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-semibold">
                  {material.title}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  {material.type}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  alert(
                    `Mock view:\n${material.title}`,
                  )
                }
                className="rounded-lg border border-[#e7e9ec] px-3 py-2 text-[10px] font-semibold text-gray-600"
              >
                View
              </button>

            </div>
          ),
        )}

      </div>

    </div>
  );
}

/* ==========================================================
   ATTENDANCE TAB
========================================================== */

function AttendanceTab({
  training,
}: {
  training: Training;
}) {
  return (
    <div className="space-y-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-sm font-bold">
            Attendance
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Manage attendance for your assigned
            participants.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            alert(
              "Mock attendance management screen.",
            )
          }
          className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[11px] font-semibold text-white"
        >
          Manage Attendance
        </button>

      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatBox
          label="Attendance Rate"
          value={`${training.attendanceRate}%`}
        />

        <StatBox
          label="Present Today"
          value={`${Math.max(
            training.participants - 2,
            0,
          )}`}
        />

        <StatBox
          label="Needs Attention"
          value="2"
        />

      </div>

      <div className="rounded-2xl border border-[#e7e9ec] p-5">

        <p className="text-xs font-bold">
          Recent Attendance
        </p>

        <div className="mt-4 space-y-2">

          {training.participantsList
            .slice(0, 5)
            .map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between rounded-xl bg-[#f8f9fa] px-4 py-3"
              >

                <div>

                  <p className="text-xs font-semibold">
                    {participant.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Attendance rate
                  </p>

                </div>

                <span className="text-xs font-bold">
                  {participant.attendance}%
                </span>

              </div>
            ))}

        </div>

      </div>

    </div>
  );
}

/* ==========================================================
   ASSESSMENT TAB
========================================================== */

function AssessmentTab({
  training,
}: {
  training: Training;
}) {
  const passed =
    training.participantsList.filter(
      (participant) =>
        participant.assessment ===
        "Passed",
    ).length;

  const pending =
    training.participantsList.filter(
      (participant) =>
        participant.assessment ===
        "Pending",
    ).length;

  const failed =
    training.participantsList.filter(
      (participant) =>
        participant.assessment ===
        "Failed",
    ).length;

  return (
    <div className="space-y-5">

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h3 className="text-sm font-bold">
            Assessment / Exam Results
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Manage assessments and participant
            results for this training.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            alert(
              "Mock assessment management screen.",
            )
          }
          className="rounded-xl bg-[#191c1e] px-4 py-2.5 text-[11px] font-semibold text-white"
        >
          Manage Assessment
        </button>

      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatBox
          label="Passed"
          value={String(passed)}
        />

        <StatBox
          label="Pending"
          value={String(pending)}
        />

        <StatBox
          label="Failed"
          value={String(failed)}
        />

      </div>

      <div className="rounded-2xl border border-[#e7e9ec]">

        {training.participantsList.map(
          (participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between border-b border-[#eef0f2] p-4 last:border-b-0"
            >

              <div>

                <p className="text-xs font-semibold">
                  {participant.name}
                </p>

                <p className="mt-1 text-[10px] text-gray-400">
                  {participant.email}
                </p>

              </div>

              <AssessmentBadge
                value={
                  participant.assessment
                }
              />

            </div>
          ),
        )}

      </div>

    </div>
  );
}

/* ==========================================================
   COMPLETION TAB
========================================================== */

function CompletionTab({
  training,
}: {
  training: Training;
}) {
  const completed =
    training.participantsList.filter(
      (participant) =>
        participant.status ===
        "Completed",
    ).length;

  const eligible =
    training.participantsList.filter(
      (participant) =>
        participant.attendance >= 90 &&
        participant.assessment ===
          "Passed",
    ).length;

  return (
    <div className="space-y-5">

      <div>

        <h3 className="text-sm font-bold">
          Completion
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Review participant completion and
          certificate eligibility.
        </p>

      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatBox
          label="Completed"
          value={String(completed)}
        />

        <StatBox
          label="Eligible"
          value={String(eligible)}
        />

        <StatBox
          label="Total Participants"
          value={String(
            training.participants,
          )}
        />

      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">

        <p className="text-xs font-bold text-blue-900">
          Certificate workflow
        </p>

        <p className="mt-1 text-[11px] leading-5 text-blue-700">
          Trainer verifies attendance and assessment
          completion. Final certificate generation
          and release will be handled by the
          administrator.
        </p>

      </div>

      <div className="rounded-2xl border border-[#e7e9ec]">

        {training.participantsList.map(
          (participant) => {
            const isEligible =
              participant.attendance >=
                90 &&
              participant.assessment ===
                "Passed";

            return (
              <div
                key={participant.id}
                className="flex flex-col gap-3 border-b border-[#eef0f2] p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>

                  <p className="text-xs font-semibold">
                    {participant.name}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Attendance{" "}
                    {participant.attendance}%
                    {" • "}
                    Assessment{" "}
                    {participant.assessment}
                  </p>

                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                    isEligible
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {isEligible
                    ? "Certificate Eligible"
                    : "For Completion"}
                </span>

              </div>
            );
          },
        )}

      </div>

    </div>
  );
}

/* ==========================================================
   DETAIL ITEM
========================================================== */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#f8f9fa] p-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs text-gray-500 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-400">
          {label}
        </p>

        <p className="mt-1 text-xs font-semibold leading-5">
          {value}
        </p>

      </div>

    </div>
  );
}

/* ==========================================================
   STAT BOX
========================================================== */

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e9ec] bg-white p-4">

      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </p>

      <p className="mt-2 truncate text-xl font-bold tracking-tight">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e9ec] p-5">

      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-xs font-semibold leading-5">
        {value}
      </p>

    </div>
  );
}

/* ==========================================================
   ASSESSMENT BADGE
========================================================== */

function AssessmentBadge({
  value,
}: {
  value: Participant["assessment"];
}) {
  const styles = {
    Passed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    Pending:
      "border-amber-200 bg-amber-50 text-amber-700",
    Failed:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${styles[value]}`}
    >
      {value}
    </span>
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
   EMPTY STATE
========================================================== */

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#dfe2e5] bg-white px-6 py-16 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-lg text-gray-400">
        ⌕
      </div>

      <h3 className="mt-4 text-sm font-bold">
        No trainings found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        No assigned training matches your current
        search or filter.
      </p>

    </div>
  );
}

/* ==========================================================
   INITIALS
========================================================== */

function getInitials(
  name: string,
) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}