
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
  TrendingUp,
  CalendarCheck,
  BookOpen,
  Activity,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
} from "lucide-react";

import type {
  TrainerDashboard,
  TrainerDashboardUpcomingSession,
} from "@repo/types";

import { trainerDashboardApi } from "@/lib/api";
import { useTrainerDashboard } from "@repo/hooks";

import {
  Button,
  PageSectionHeader,
  PageSkeleton,
  StatCard,
} from "@repo/ui/index";

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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string | null) {
  if (!value) return "—";

  const time = value.substring(0, 5);
  const [hoursString, minutes] = time.split(":");
  const hours = Number(hoursString);

  if (Number.isNaN(hours)) return value;

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

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

function getProgress(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

/* =========================================================
   REUSABLE DASHBOARD CARD
========================================================= */

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
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(15,23,42,0.055)] ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#28658c]">
              <Icon className="h-[18px] w-[18px]" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-800">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold capitalize ${getStatusClass(status)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  description,
  icon: Icon = CalendarDays,
}: {
  title: string;
  description: string;
  icon?: IconType;
}) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700">
        {title}
      </h3>

      <p className="mt-1.5 max-w-xs text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   TODAY'S SESSION
========================================================= */

function TodaySessionCard({
  session,
}: {
  session: NonNullable<TrainerDashboard["todaySession"]>;
}) {
  const sessionDate = session.sessionDate
    ? new Date(session.sessionDate)
    : null;

  const formattedDate =
    sessionDate && !Number.isNaN(sessionDate.getTime())
      ? sessionDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Today's scheduled session";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Section heading */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Daily Schedule
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Today's Session
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your scheduled training activity for today.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          {formattedDate}
        </div>
      </div>

      {/* Session content */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Time block */}
            <div className="flex shrink-0 flex-row items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:w-36 sm:flex-col sm:items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                <Clock3 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Session Time
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {session.startTime || "--:--"}
                </p>
                <p className="text-xs text-slate-500">
                  to {session.endTime || "--:--"}
                </p>
              </div>
            </div>

            {/* Session details */}
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Training Activity
              </p>

              <h3 className="break-words text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                {session.title || "Untitled Training Session"}
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                Review your scheduled training session and monitor its
                attendance status before the activity begins.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <CalendarCheck className="h-3.5 w-3.5 text-blue-600" />
                  Scheduled Today
                </span>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    session.attendanceOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      session.attendanceOpen
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {session.attendanceOpen
                    ? "Attendance Open"
                    : "Attendance Closed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance status panel */}
        <div className="flex flex-col justify-between border-t border-slate-100 bg-slate-50/80 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Attendance Status
            </p>

            <h3
              className={`mt-1 text-lg font-bold ${
                session.attendanceOpen
                  ? "text-emerald-700"
                  : "text-slate-800"
              }`}
            >
              {session.attendanceOpen
                ? "Currently Active"
                : "Not Yet Active"}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {session.attendanceOpen
                ? "Participants can now record their attendance for this session."
                : "Attendance recording is currently unavailable for this session."}
            </p>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-500">
                Session availability
              </span>
              <span
                className={`font-bold ${
                  session.attendanceOpen
                    ? "text-emerald-700"
                    : "text-slate-600"
                }`}
              >
                {session.attendanceOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
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

  const attendanceRate = getProgress(attendance.attendanceRate);

  const summaryItems = [
    {
      label: "Present",
      count: attendance.present,
      color: "bg-emerald-500",
      text: "text-emerald-700",
      background: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Late",
      count: attendance.late,
      color: "bg-amber-500",
      text: "text-amber-700",
      background: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Absent",
      count: attendance.absent,
      color: "bg-red-500",
      text: "text-red-700",
      background: "bg-red-50",
      border: "border-red-100",
    },
  ];

  return (
    <SectionCard
      title="Attendance Overview"
      description="Attendance performance across your assigned training"
      icon={TrendingUp}
      action={
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-[#3B7597]">
          PERFORMANCE
        </span>
      }
    >
      <div className="space-y-5">

        {/* ATTENDANCE RATE HIGHLIGHT */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-blue-100/60 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Overall Attendance Rate
              </p>

              <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#174b70]">
                {attendance.attendanceRate}%
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Based on present and late attendance
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white text-[#28658c] shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>

          <div className="relative z-10 mt-5 h-2.5 overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#28658c] to-cyan-500 transition-all duration-700"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        {/* ATTENDANCE CHART */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Attendance Breakdown
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                Recorded participant attendance by status
              </p>
            </div>

            <span className="text-[10px] font-semibold text-slate-400">
              {formatNumber(attendance.totalRecorded)} Records
            </span>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                  stroke="#e8edf3"
                />

                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
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
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                    fontSize: "12px",
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

        {/* ATTENDANCE STATUS CARDS */}
        <div className="grid grid-cols-3 gap-2.5">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border ${item.border} ${item.background} p-3`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />

                <p className={`text-[10px] font-semibold ${item.text}`}>
                  {item.label}
                </p>
              </div>

              <p className={`mt-2 text-xl font-extrabold ${item.text}`}>
                {formatNumber(item.count)}
              </p>
            </div>
          ))}
        </div>

        {/* TOTAL RECORDS */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
              <Users className="h-4 w-4" />
            </div>

            <span className="text-xs font-semibold text-slate-600">
              Total Recorded Attendance
            </span>
          </div>

          <span className="text-sm font-extrabold text-slate-900">
            {formatNumber(attendance.totalRecorded)}
          </span>
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
      action={
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
          {sessions.length} Scheduled
        </span>
      }
    >
      {sessions.length === 0 ? (
        <EmptyState
          title="No upcoming sessions"
          description="Your next training sessions will appear here once they are scheduled."
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div
              key={session.trainingSessionId}
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[#28658c]">
                  <CalendarDays className="h-4 w-4" />
                  <span className="mt-0.5 text-[8px] font-bold">
                    #{index + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-xs font-bold leading-5 text-slate-800 transition group-hover:text-[#28658c]">
                    {session.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(session.sessionDate)}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-500">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                      {formatTime(session.startTime)}
                      {" – "}
                      {formatTime(session.endTime)}
                    </span>
                  </div>
                </div>

                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#28658c]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* =========================================================
   NO TRAINING ASSIGNED
========================================================= */

function NoTrainingAssigned() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#28658c]">
          <GraduationCap className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-lg font-extrabold text-slate-800">
          No Training Assigned
        </h2>

        <p className="mt-2 max-w-md text-xs leading-6 text-slate-500">
          You currently do not have an active training assignment.
          Please contact the administrator if you believe this is incorrect.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-700">
          <CircleAlert className="h-3.5 w-3.5" />
          Awaiting Training Assignment
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SESSION PROGRESS
========================================================= */

function SessionProgressCard({
  completed,
  total,
  progress,
}: {
  completed: number;
  total: number;
  progress: number;
}) {
  const safeProgress = getProgress(progress);

  return (
    <SectionCard
      title="Training Progress"
      description="Monitor the completion of your assigned training sessions"
      icon={CheckCircle2}
      action={
        <span className="text-[10px] font-bold text-[#28658c]">
          {safeProgress}% Complete
        </span>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-700">
                Session Completion
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {formatNumber(completed)} of {formatNumber(total)} sessions completed
              </p>
            </div>

            <div className="text-right sm:hidden">
              <span className="text-xl font-extrabold text-[#28658c]">
                {safeProgress}%
              </span>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#174b70] to-[#48a7c7] transition-all duration-700"
              style={{ width: `${safeProgress}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>Progress</span>
            <span>{100 - safeProgress}% remaining</span>
          </div>
        </div>

        <div className="hidden h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-[7px] border-blue-50 bg-white shadow-sm sm:flex">
          <span className="text-xl font-extrabold text-[#28658c]">
            {safeProgress}%
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
            Complete
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-lg font-extrabold text-emerald-700">
              {formatNumber(completed)}
            </p>
            <p className="text-[9px] font-semibold text-emerald-600">
              Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500">
            <Clock3 className="h-4 w-4" />
          </div>

          <div>
            <p className="text-lg font-extrabold text-slate-700">
              {formatNumber(Math.max(total - completed, 0))}
            </p>
            <p className="text-[9px] font-semibold text-slate-500">
              Remaining
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function TrainerDashboardPage() {
  const {
    dashboard,
    loading,
    refreshing,
    error,
    refresh,
  } = useTrainerDashboard(trainerDashboardApi);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isBusy = isRefreshing || refreshing;

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
      <main className="min-h-full bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto flex min-h-[500px] max-w-[1500px] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <XCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-extrabold text-slate-800">
              Unable to Load Dashboard
            </h2>

            <p className="mt-2 text-xs leading-6 text-slate-500">
              {error}
            </p>

            <Button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isBusy}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#103967] px-5 text-xs font-bold text-white transition hover:bg-[#174b70] disabled:opacity-50"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              {isBusy ? "Trying Again..." : "Try Again"}
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return null;
  }

  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <main className="min-h-full bg-[#f5f7fa] p-4 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* PAGE HEADER */}
        <PageSectionHeader
          title="Trainer Dashboard"
          description="Your training workspace at a glance. Monitor participants, review attendance performance, and keep track of your scheduled training sessions."
          badge="ACE NextGen · Trainer Workspace"
          icon={<GraduationCap className="h-4 w-4" />}
          actions={
            <Button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isBusy}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-[11px] font-bold text-white shadow-sm backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              {isBusy ? "Refreshing..." : "Refresh Dashboard"}
            </Button>
          }
        />

        {/* DASHBOARD SECTION LABEL */}
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-slate-800">
              Dashboard Overview
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Summary of your assigned training activities and performance.
            </p>
          </div>

          {isBusy && (
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#28658c]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating dashboard data...
            </span>
          )}
        </div>

        {!dashboard.training ? (
          <NoTrainingAssigned />
        ) : (
          <>
            {/* =================================================
                KEY STATISTICS
            ================================================= */}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                variant="primary"
                title="Participants"
                value={dashboard.stats.totalParticipants}
                description="Participants in your assigned training"
                icon={Users}
              />

              <StatCard
                variant="success"
                title="Total Sessions"
                value={dashboard.stats.totalSessions}
                description="Scheduled training sessions"
                icon={CalendarDays}
              />

              <StatCard
                variant="warning"
                title="Upcoming Sessions"
                value={dashboard.upcomingSessions.length}
                description="Sessions scheduled ahead"
                icon={CalendarCheck}
              />

              <StatCard
                variant="primary"
                title="Attendance Rate"
                value={`${dashboard.stats.attendanceRate}%`}
                description="Present and late attendance"
                icon={UserCheck}
              />
            </div>

            {/* =================================================
                TODAY'S SESSION
            ================================================= */}

           {dashboard.todaySession ? (
  <TodaySessionCard session={dashboard.todaySession} />
) : (
  <NoTrainingAssigned />
)}

            {/* =================================================
                ANALYTICS AND UPCOMING SESSIONS
            ================================================= */}

            <div className="grid min-w-0 gap-5 xl:grid-cols-2">
              <AttendanceSummaryCard
                attendance={dashboard.attendance}
              />

              <UpcomingSessionsCard
                sessions={dashboard.upcomingSessions}
              />
            </div>

            {/* =================================================
                TRAINING PROGRESS
            ================================================= */}

            <SessionProgressCard
              completed={dashboard.stats.completedSessions}
              total={dashboard.stats.totalSessions}
              progress={dashboard.stats.sessionProgress}
            />
          </>
        )}

        {/* =================================================
            DASHBOARD FOOTER
        ================================================= */}

        <footer className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#28658c]">
              <GraduationCap className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-700">
                ACE NextGen Trainer Workspace
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Training management and performance overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Dashboard data is available
          </div>
        </footer>
      </div>
    </main>
  );
}
