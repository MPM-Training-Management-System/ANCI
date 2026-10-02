"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  RefreshCw,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import type {
  TrainerDashboard,
  TrainerDashboardUpcomingSession,
} from "@repo/types";

import { trainerDashboardApi } from "@/lib/api";
import { useTrainerDashboard } from "@repo/hooks";
import { PageSkeleton, StatCard } from "@repo/ui/index";
import { useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =========================================================
   TYPES
========================================================= */

type IconType = React.ComponentType<{
  className?: string;
  size?: number;
}>;


type SectionCardProps = {
  title: string;
  description?: string;
  icon?: IconType;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

type StatusBadgeProps = {
  status: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) return "—";

  const time = value.substring(0, 5);

  const [hoursString, minutes] = time.split(":");

  const hours = Number(hoursString);

  if (Number.isNaN(hours)) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";

  const displayHour =
    hours % 12 === 0
      ? 12
      : hours % 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("completed") ||
    normalized.includes("approved") ||
    normalized.includes("active") ||
    normalized.includes("present")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("ongoing") ||
    normalized.includes("upcoming") ||
    normalized.includes("pending") ||
    normalized.includes("late")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized.includes("absent") ||
    normalized.includes("rejected") ||
    normalized.includes("failed")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}


function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  action,
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-xs text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${getStatusClass(
        status
      )}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <CalendarDays className="h-5 w-5" />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ASSIGNED TRAINING
========================================================= */

function AssignedTrainingCard({
  training,
}: {
  training: NonNullable<
    TrainerDashboard["training"]
  >;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* TOP HEADER */}

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f4f7] text-[#3B7597]">
            <GraduationCap className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Assigned Training
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Your current training assignment
            </p>
          </div>
        </div>

        <StatusBadge status={training.status} />
      </div>

      {/* TRAINING CONTENT */}

      <div className="p-5">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-[#f8fbfc] via-white to-[#eef7f8]">
          {/* Decorative element */}

          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#6FD1D7]/10" />

          <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[#3B7597]/5" />

          <div className="relative p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* LEFT */}

              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e4f4f6] text-[#3B7597] shadow-sm">
                  <GraduationCap className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#3B7597]">
                    Training Program
                  </p>

                  <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    {training.trainingName}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                      <span className="font-medium text-slate-600">
                        Batch:
                      </span>

                      {training.batchName}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div className="flex shrink-0 flex-wrap gap-3">
                <div className="rounded-xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Participants
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#3B7597]" />

                    <span className="text-lg font-bold text-slate-900">
                      {formatNumber(
                        training.participantCount
                      )}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Schedule
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#3B7597]" />

                    <span className="text-sm font-semibold text-slate-900">
                      {formatDate(
                        training.startDate
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DATE INFORMATION */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Start Date
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {formatDate(
                        training.startDate
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      End Date
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      {formatDate(
                        training.endDate
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TODAY SESSION
========================================================= */

function TodaySessionCard({
  session,
}: {
  session: TrainerDashboard["todaySession"];
}) {
  return (
    <SectionCard
      title="Today's Session"
      description="Your training session for today"
      icon={CalendarDays}
    >
      {!session ? (
        <EmptyState
          title="No session scheduled today"
          description="There is no training session scheduled for today."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          {/* SESSION HEADER */}

          <div className="border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3B7597]">
                  Today's Training Session
                </p>

                <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {session.title}
                </h3>
              </div>

              <StatusBadge
                status={session.status}
              />
            </div>
          </div>

          {/* SESSION BODY */}

          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* DATE */}

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Session Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(
                        session.sessionDate
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* TIME */}

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                      Session Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatTime(
                        session.startTime
                      )}{" "}
                      <span className="font-normal text-slate-400">
                        to
                      </span>{" "}
                      {formatTime(
                        session.endTime
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ATTENDANCE STATUS */}

            <div className="mt-4">
              {session.attendanceOpen ? (
                <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <UserCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Attendance is currently open
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-600">
                        Participants can now record their attendance.
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                    Live
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Attendance is closed
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Attendance is not currently available for this session.
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                    Closed
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* =========================================================
   ATTENDANCE SUMMARY
========================================================= */

function AttendanceSummaryCard({
  attendance,
}: {
  attendance: TrainerDashboard["attendance"];
}) {
  const chartData = [
    {
      status: "Present",
      count: attendance.present,
    },
    {
      status: "Late",
      count: attendance.late,
    },
    {
      status: "Absent",
      count: attendance.absent,
    },
  ];

  return (
    <SectionCard
      title="Attendance Summary"
      description="Attendance records for your assigned training"
      icon={UserCheck}
    >
      <div className="space-y-5">
        {/* LINE CHART */}

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-4">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Attendance Trend
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Present, late, and absent attendance records
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#3B7597]" />
                Records
              </span>
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                  }}
                />

                <Tooltip
                  cursor={{
                    stroke: "#cbd5e1",
                    strokeWidth: 1,
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 4px 12px rgba(15, 23, 42, 0.08)",
                    backgroundColor: "#ffffff",
                  }}
                  labelStyle={{
                    color: "#334155",
                    fontWeight: 600,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="Attendance"
                  stroke="#3B7597"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    strokeWidth: 2,
                    fill: "#ffffff",
                    stroke: "#3B7597",
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 2,
                    fill: "#ffffff",
                    stroke: "#3B7597",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-medium text-emerald-700">
                Present
              </p>
            </div>

            <p className="mt-2 text-xl font-bold text-emerald-600">
              {formatNumber(attendance.present)}
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />

              <p className="text-xs font-medium text-amber-700">
                Late
              </p>
            </div>

            <p className="mt-2 text-xl font-bold text-amber-600">
              {formatNumber(attendance.late)}
            </p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />

              <p className="text-xs font-medium text-red-700">
                Absent
              </p>
            </div>

            <p className="mt-2 text-xl font-bold text-red-600">
              {formatNumber(attendance.absent)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500">
              Total Recorded
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatNumber(
                attendance.totalRecorded
              )}
            </p>
          </div>
        </div>

        {/* ATTENDANCE RATE */}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Attendance Rate
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Present and late attendance
              </p>
            </div>

            <span className="text-lg font-bold text-slate-900">
              {attendance.attendanceRate}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#3B7597] transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.max(
                    attendance.attendanceRate,
                    0
                  ),
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* =========================================================
   UPCOMING SESSIONS
========================================================= */

function UpcomingSessionsCard({
  sessions,
}: {
  sessions: TrainerDashboardUpcomingSession[];
}) {
  return (
    <SectionCard
      title="Upcoming Sessions"
      description="Your next scheduled training sessions"
      icon={CalendarDays}
    >
      {sessions.length === 0 ? (
        <EmptyState
          title="No upcoming sessions"
          description="Your next training sessions will appear here once they are scheduled."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.trainingSessionId}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {session.title}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />

                      {formatDate(
                        session.sessionDate
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />

                      {formatTime(
                        session.startTime
                      )}

                      {" - "}

                      {formatTime(
                        session.endTime
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                  <Clock3 className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* =========================================================
   NO ASSIGNMENT
========================================================= */

function NoTrainingAssigned() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <GraduationCap className="h-7 w-7" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        No Training Assigned
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        You currently do not have an active training
        assignment. Please contact the administrator
        if you believe this is incorrect.
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainerDashboardPage() {
  const {
    dashboard,
    loading,
    refreshing,
    error,
    refresh,
  } = useTrainerDashboard(
    trainerDashboardApi
  );

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !dashboard) {
    return (
      <PageSkeleton
        statCards={4}
        showHeader
        showCharts={false}
      />
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !dashboard) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto flex min-h-[500px] max-w-[1600px] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              {isRefreshing
                ? "Trying Again..."
                : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!dashboard) {
    return null;
  }

  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Trainer Dashboard
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Overview of your assigned training,
              participants, attendance, and sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              isRefreshing || refreshing
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing || refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            {isRefreshing || refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =================================================
            NO TRAINING
        ================================================= */}

        {!dashboard.training ? (
          <NoTrainingAssigned />
        ) : (
          <>
            {/* =============================================
                ASSIGNED TRAINING
            ============================================== */}

            <AssignedTrainingCard
              training={dashboard.training}
            />

        

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
              variant="primary"
                title="Participants"
                value={
                  dashboard.stats
                    .totalParticipants
                }
                description="Participants in your assigned training"
                icon={Users}
              
              />

              <StatCard
                title="Total Sessions"
                variant="success"
                value={
                  dashboard.stats
                    .totalSessions
                }
                description="Scheduled sessions for this training"
                icon={CalendarDays}
         
              />
                <StatCard
  variant="warning"
  title="Upcoming Sessions"
  value={dashboard.upcomingSessions.length}
  description="Sessions scheduled ahead"
  icon={CalendarDays}
/>

              <StatCard
              variant="primary"
                title="Attendance Rate"
                value={`${dashboard.stats.attendanceRate}%`}
                description="Present and late attendance"
                icon={UserCheck}
           
              />
            </div>

      

            <div className="mt-5">
              <TodaySessionCard
                session={dashboard.todaySession}
              />
            </div>

     

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <AttendanceSummaryCard
                attendance={
                  dashboard.attendance
                }
              />

              <UpcomingSessionsCard
                sessions={
                  dashboard.upcomingSessions
                }
              />
            </div>

            {/* =============================================
                SESSION PROGRESS
            ============================================== */}

            <div className="mt-5">
              <SectionCard
                title="Session Progress"
                description="Progress of your assigned training"
                icon={CheckCircle2}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Completed Sessions
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          dashboard.stats
                            .completedSessions
                        }{" "}
                        of{" "}
                        {
                          dashboard.stats
                            .totalSessions
                        }{" "}
                        sessions completed
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-slate-900">
                      {
                        dashboard.stats
                          .sessionProgress
                      }%
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#3B7597] transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            dashboard.stats
                              .sessionProgress,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </SectionCard>
            </div>
          </>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <GraduationCap className="h-3.5 w-3.5" />

            <span>
              Trainer dashboard for your assigned
              training.
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="h-3.5 w-3.5" />

            <span>
              Refresh to get the latest dashboard
              data.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}