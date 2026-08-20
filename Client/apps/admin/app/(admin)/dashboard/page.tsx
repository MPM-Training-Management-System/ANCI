"use client";

import {
  useRouter,
} from "next/navigation";

import type {
  Activity,
  EnrollmentTrend,
  QuickAction,
  TrainingCapacity,
  UpcomingTraining,
} from "./type";

/* =========================================================
   MOCK DATA
========================================================= */

const quickActions: QuickAction[] = [
  {
    id: "participants",
    title: "Participants",
    description:
      "Manage registered participants",
    href: "/participants",
    icon: "participant",
  },

  {
    id: "training",
    title: "Create Training",
    description:
      "Create a new training program",
    href: "/training",
    icon: "training",
  },

  {
    id: "enrollment",
    title: "Review Enrollments",
    description:
      "Check pending applications",
    href: "/enrollment",
    icon: "enrollment",
  },

  {
    id: "trainer",
    title: "Assign Trainer",
    description:
      "Manage trainer assignments",
    href: "/trainers",
    icon: "trainer",
  },

  {
    id: "attendance",
    title: "Attendance",
    description:
      "Monitor training attendance",
    href: "/attendance",
    icon: "attendance",
  },

  {
    id: "reports",
    title: "Generate Report",
    description:
      "View system reports",
    href: "/reports",
    icon: "report",
  },
];

const upcomingTrainings: UpcomingTraining[] = [
  {
    id: "TR-001",
    title:
      "Computer Systems Servicing NC II",
    batch: "CSS-NCII-2026-02",
    trainer: "Maria Santos",
    date: "Aug 20, 2026",
    time: "8:00 AM – 4:00 PM",
    location:
      "Computer Laboratory 01",
    enrolled: 24,
    capacity: 30,
  },

  {
    id: "TR-002",
    title:
      "Web Development Fundamentals",
    batch: "WEB-DEV-2026-01",
    trainer: "John Cruz",
    date: "Aug 25, 2026",
    time: "9:00 AM – 5:00 PM",
    location:
      "ICT Laboratory",
    enrolled: 18,
    capacity: 25,
  },

  {
    id: "TR-003",
    title:
      "Electrical Installation NC II",
    batch: "EIM-NCII-2026-01",
    trainer: "Robert Flores",
    date: "Sep 01, 2026",
    time: "8:00 AM – 4:00 PM",
    location:
      "Electrical Workshop",
    enrolled: 20,
    capacity: 25,
  },
];

const enrollmentTrend: EnrollmentTrend[] = [
  {
    month: "Jan",
    value: 86,
  },
  {
    month: "Feb",
    value: 104,
  },
  {
    month: "Mar",
    value: 118,
  },
  {
    month: "Apr",
    value: 132,
  },
  {
    month: "May",
    value: 145,
  },
  {
    month: "Jun",
    value: 158,
  },
  {
    month: "Jul",
    value: 176,
  },
  {
    month: "Aug",
    value: 194,
  },
];

const trainingCapacity: TrainingCapacity[] =
  [
    {
      name: "CSS NC II",
      enrolled: 24,
      capacity: 30,
    },

    {
      name: "Web Development",
      enrolled: 18,
      capacity: 25,
    },

    {
      name: "EIM NC II",
      enrolled: 20,
      capacity: 25,
    },

    {
      name: "Computer Programming",
      enrolled: 22,
      capacity: 30,
    },
  ];

const activities: Activity[] = [
  {
    id: "ACT-001",
    title:
      "New enrollment request",
    description:
      "Juan Dela Cruz submitted an enrollment request.",
    time: "10 min ago",
    type: "enrollment",
  },

  {
    id: "ACT-002",
    title:
      "Training batch created",
    description:
      "CSS-NCII-2026-02 was created.",
    time: "42 min ago",
    type: "training",
  },

  {
    id: "ACT-003",
    title:
      "Attendance submitted",
    description:
      "Maria Santos submitted today's attendance.",
    time: "1 hr ago",
    type: "attendance",
  },

  {
    id: "ACT-004",
    title:
      "Assessment completed",
    description:
      "Web Development assessment results were recorded.",
    time: "2 hrs ago",
    type: "assessment",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <main className="space-y-6 pb-10">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

        {/* decorative background */}

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gray-100 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-gray-50 blur-3xl" />

        <div className="relative">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">

                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  System Operational
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Good morning, Admin.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                Here's what's happening across
                your training operations today.
                Review pending actions, monitor
                active programs, and keep your
                training center moving.
              </p>

            </div>

            <div className="shrink-0">

              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">

                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Today
                </p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  August 19, 2026
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Wednesday
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Shortcuts
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Jump directly to the tasks you use
              most.
            </p>
          </div>

        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {quickActions.map(
            (action) => (
              <button
                key={action.id}
                type="button"
                onClick={() =>
                  router.push(
                    action.href,
                  )
                }
                className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
              >

                <ActionIcon
                  type={action.icon}
                />

                <div className="min-w-0 flex-1">

                  <p className="text-sm font-bold text-gray-900">
                    {action.title}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {action.description}
                  </p>

                </div>

                <span className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-600">
                  →
                </span>

              </button>
            ),
          )}

        </div>

      </section>

      {/* =================================================
          ATTENTION CENTER
      ================================================= */}

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">

        {/* pending action */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Needs Attention
              </p>

              <h2 className="mt-1 text-lg font-bold text-gray-900">
                24 items need review
              </h2>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/enrollment",
                )
              }
              className="text-xs font-semibold text-gray-600 hover:text-gray-950"
            >
              View all →
            </button>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <AttentionCard
              title="Enrollments"
              value="12"
              description="Pending approval"
              onClick={() =>
                router.push(
                  "/enrollment",
                )
              }
            />

            <AttentionCard
              title="Trainer Assignment"
              value="5"
              description="Need assignment"
              onClick={() =>
                router.push(
                  "/trainers",
                )
              }
            />

            <AttentionCard
              title="Attendance"
              value="7"
              description="Missing today"
              onClick={() =>
                router.push(
                  "/attendance",
                )
              }
            />

          </div>

        </div>

        {/* completion */}

        <div className="rounded-2xl border border-gray-200 bg-gray-950 p-5 text-white shadow-sm">

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Training Performance
          </p>

          <div className="mt-5 flex items-end justify-between">

            <div>

              <p className="text-4xl font-bold tracking-tight">
                82%
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Overall completion rate
              </p>

            </div>

            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-emerald-400">
              +6.4%
            </span>

          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-white"
              style={{
                width: "82%",
              }}
            />

          </div>

          <div className="mt-3 flex justify-between text-[10px] text-gray-500">

            <span>
              Current
            </span>

            <span>
              Target 90%
            </span>

          </div>

        </div>

      </section>

      {/* =================================================
          ANALYTICS
      ================================================= */}

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">

        {/* ENROLLMENT GRAPH */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Enrollment Analytics
              </p>

              <h2 className="mt-1 text-lg font-bold text-gray-900">
                Enrollment Trend
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Participant applications over the
                last eight months.
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 px-3 py-2">

              <p className="text-[10px] text-gray-400">
                August
              </p>

              <p className="text-sm font-bold text-gray-900">
                194
              </p>

            </div>

          </div>

          <div className="mt-5">

            <EnrollmentChart
              data={
                enrollmentTrend
              }
            />

          </div>

        </div>

        {/* CAPACITY */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Capacity
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              Training Utilization
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Current enrollment versus available
              slots.
            </p>

          </div>

          <div className="mt-6 space-y-5">

            {trainingCapacity.map(
              (item) => (
                <CapacityItem
                  key={item.name}
                  {...item}
                />
              ),
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          UPCOMING TRAININGS
      ================================================= */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Schedule
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900">
              Upcoming Trainings
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              What's coming up next.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/training",
              )
            }
            className="text-xs font-semibold text-gray-600 hover:text-gray-950"
          >
            Manage trainings →
          </button>

        </div>

        <div className="grid gap-4 lg:grid-cols-3">

          {upcomingTrainings.map(
            (training) => (
              <UpcomingTrainingCard
                key={training.id}
                training={training}
                onClick={() =>
                  router.push(
                    `/training/${training.id}`,
                  )
                }
              />
            ),
          )}

        </div>

      </section>

      {/* =================================================
          BOTTOM AREA
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

        {/* RECENT ACTIVITY */}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Timeline
              </p>

              <h2 className="mt-1 text-base font-bold text-gray-900">
                Recent Activity
              </h2>

            </div>

            <button
              type="button"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900"
            >
              View activity
            </button>

          </div>

          <div className="divide-y divide-gray-100">

            {activities.map(
              (activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                />
              ),
            )}

          </div>

        </div>

        {/* SYSTEM SNAPSHOT */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            System Snapshot
          </p>

          <h2 className="mt-1 text-base font-bold text-gray-900">
            ANCI Operations
          </h2>

          <div className="mt-5 space-y-4">

            <SystemStatus
              title="Registration System"
              status="Operational"
            />

            <SystemStatus
              title="Training Management"
              status="Operational"
            />

            <SystemStatus
              title="Attendance System"
              status="Operational"
            />

            <SystemStatus
              title="Assessment Module"
              status="Operational"
            />

            <SystemStatus
              title="Report Generation"
              status="Operational"
            />

          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">

            <div className="flex justify-between text-xs">

              <span className="text-gray-500">
                Last system sync
              </span>

              <span className="font-semibold text-gray-900">
                2 minutes ago
              </span>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   QUICK ACTION ICON
========================================================= */

function ActionIcon({
  type,
}: {
  type: QuickAction["icon"];
}) {
  const symbols = {
    participant: "P",
    training: "T",
    enrollment: "E",
    trainer: "TR",
    attendance: "A",
    report: "R",
  };

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-black text-gray-700 transition group-hover:bg-gray-900 group-hover:text-white">
      {symbols[type]}
    </div>
  );
}

/* =========================================================
   ATTENTION CARD
========================================================= */

function AttentionCard({
  title,
  value,
  description,
  onClick,
}: {
  title: string;
  value: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-gray-300 hover:bg-white"
    >

      <p className="text-xs font-semibold text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-gray-400">
        {description}
      </p>

    </button>
  );
}

/* =========================================================
   ENROLLMENT CHART
========================================================= */

function EnrollmentChart({
  data,
}: {
  data: EnrollmentTrend[];
}) {
  const width = 800;
  const height = 280;

  const left = 45;
  const right = 20;
  const top = 20;
  const bottom = 40;

  const chartWidth =
    width - left - right;

  const chartHeight =
    height - top - bottom;

  const max = Math.max(
    ...data.map(
      (item) => item.value,
    ),
  );

  const min = Math.min(
    ...data.map(
      (item) => item.value,
    ),
  );

  const range = max - min || 1;

  const points = data.map(
    (item, index) => {
      const x =
        left +
        (index /
          Math.max(
            data.length - 1,
            1,
          )) *
          chartWidth;

      const y =
        top +
        (1 -
          (item.value - min) /
            range) *
          chartHeight;

      return {
        ...item,
        x,
        y,
      };
    },
  );

  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const area = `${line} L ${
    points[points.length - 1]
      .x
  } ${height - bottom} L ${
    points[0].x
  } ${height - bottom} Z`;

  return (
    <div className="overflow-x-auto">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[280px] min-w-[650px] w-full"
      >

        {/* GRID */}

        {[0, 1, 2, 3, 4].map(
          (index) => {
            const y =
              top +
              (chartHeight /
                4) *
                index;

            const value = Math.round(
              max -
                (range / 4) *
                  index,
            );

            return (
              <g key={index}>

                <line
                  x1={left}
                  x2={
                    width -
                    right
                  }
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-100"
                />

                <text
                  x={left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-gray-400 text-[10px]"
                >
                  {value}
                </text>

              </g>
            );
          },
        )}

        {/* AREA */}

        <path
          d={area}
          fill="currentColor"
          className="text-gray-100"
        />

        {/* LINE */}

        <path
          d={line}
          fill="none"
          stroke="currentColor"
          className="text-gray-900"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* POINTS */}

        {points.map(
          (point) => (
            <g
              key={point.month}
            >

              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke="currentColor"
                className="text-gray-900"
                strokeWidth="3"
              />

              <text
                x={point.x}
                y={
                  height - 14
                }
                textAnchor="middle"
                className="fill-gray-400 text-[10px]"
              >
                {point.month}
              </text>

            </g>
          ),
        )}

      </svg>

    </div>
  );
}

/* =========================================================
   CAPACITY ITEM
========================================================= */

function CapacityItem({
  name,
  enrolled,
  capacity,
}: TrainingCapacity) {
  const percentage = Math.round(
    (enrolled / capacity) *
      100,
  );

  return (
    <div>

      <div className="mb-2 flex items-center justify-between gap-3">

        <span className="truncate text-xs font-semibold text-gray-700">
          {name}
        </span>

        <span className="shrink-0 text-xs font-bold text-gray-900">
          {enrolled}/{capacity}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">

        <div
          className="h-full rounded-full bg-gray-900 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="mt-1 text-right text-[9px] text-gray-400">
        {percentage}% capacity
      </p>

    </div>
  );
}

/* =========================================================
   UPCOMING TRAINING CARD
========================================================= */

function UpcomingTrainingCard({
  training,
  onClick,
}: {
  training: UpcomingTraining;
  onClick: () => void;
}) {
  const percentage = Math.round(
    (training.enrolled /
      training.capacity) *
      100,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >

      {/* DATE STRIP */}

      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">

        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Upcoming
        </span>

        <span className="text-[10px] font-semibold text-gray-400">
          {training.id}
        </span>

      </div>

      <div className="p-5">

        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-gray-900">
          {training.title}
        </h3>

        <p className="mt-1 font-mono text-[9px] text-gray-400">
          {training.batch}
        </p>

        <div className="mt-5 space-y-2.5">

          <DetailRow
            label="Date"
            value={training.date}
          />

          <DetailRow
            label="Time"
            value={training.time}
          />

          <DetailRow
            label="Trainer"
            value={training.trainer}
          />

          <DetailRow
            label="Location"
            value={training.location}
          />

        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">

          <div className="flex items-center justify-between">

            <span className="text-[10px] font-semibold text-gray-500">
              Enrollment
            </span>

            <span className="text-[10px] font-bold text-gray-900">
              {training.enrolled}/
              {training.capacity}
            </span>

          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">

            <div
              className="h-full rounded-full bg-gray-900"
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

        </div>

        <div className="mt-4 text-right text-xs font-bold text-gray-400 transition group-hover:text-gray-900">
          Open training →
        </div>

      </div>

    </button>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">

      <span className="w-14 shrink-0 text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span className="text-[10px] font-medium text-gray-700">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({
  activity,
}: {
  activity: Activity;
}) {
  return (
    <div className="flex gap-4 px-5 py-4">

      <div className="relative flex shrink-0 flex-col items-center">

        <ActivityIcon
          type={activity.type}
        />

        <span className="absolute top-10 h-full w-px bg-gray-100" />

      </div>

      <div className="min-w-0 flex-1">

        <div className="flex flex-col justify-between gap-1 sm:flex-row">

          <p className="text-sm font-semibold text-gray-900">
            {activity.title}
          </p>

          <span className="text-[10px] text-gray-400">
            {activity.time}
          </span>

        </div>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {activity.description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   ACTIVITY ICON
========================================================= */

function ActivityIcon({
  type,
}: {
  type: Activity["type"];
}) {
  const labels = {
    enrollment: "E",
    training: "T",
    attendance: "A",
    assessment: "AS",
    system: "S",
  };

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[9px] font-black text-gray-600">
      {labels[type]}
    </div>
  );
}

/* =========================================================
   SYSTEM STATUS
========================================================= */

function SystemStatus({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <span className="h-2 w-2 rounded-full bg-emerald-500" />

        <span className="text-xs font-medium text-gray-700">
          {title}
        </span>

      </div>

      <span className="text-[10px] font-semibold text-emerald-600">
        {status}
      </span>

    </div>
  );
}