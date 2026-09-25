"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  AdminDashboard,
  RecentEnrollment,
  UpcomingBatch,
} from "@repo/types";

import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  GraduationCap,
  Loader2,
  RefreshCw,
  ServerCog,
  TrendingUp,
  UserCheck,
  UserRound,
  Users,
  UserCog,
  XCircle,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { adminDashboardApi } from "@/lib/api";
import { useAdminDashboard } from "@repo/hooks";
import { PageSkeleton } from "@repo/ui/index";

/* =========================================================
   TYPES
========================================================= */

type IconType = React.ComponentType<{
  className?: string;
  size?: number;
}>;

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: IconType;
  iconClassName?: string;
  loading?: boolean;
};

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

type MetricRowProps = {
  label: string;
  value: string | number;
  icon?: IconType;
  iconClassName?: string;
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

function formatDateTime(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("completed") ||
    normalized.includes("passed") ||
    normalized.includes("active") ||
    normalized.includes("present") ||
    normalized.includes("resolved")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("ongoing") ||
    normalized.includes("upcoming")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalized.includes("rejected") ||
    normalized.includes("failed") ||
    normalized.includes("revoked") ||
    normalized.includes("absent")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

/* =========================================================
   REUSABLE UI
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName = "bg-slate-100 text-slate-700",
  loading = false,
}: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {typeof value === "number"
                ? formatNumber(value)
                : value}
            </p>
          )}

          {description && (
            <p className="mt-2 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
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

function MetricRow({
  label,
  value,
  icon: Icon,
  iconClassName = "bg-slate-100 text-slate-500",
}: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}

        <span className="truncate text-sm text-slate-600">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-sm font-semibold text-slate-900">
        {typeof value === "number"
          ? formatNumber(value)
          : value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${getStatusClass(
        status,
      )}`}
    >
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
        <Activity className="h-5 w-5" />
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
   CHART TOOLTIP
========================================================= */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-[160px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-900">
        {label}
      </p>

      <div className="space-y-1.5">
        {payload.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center justify-between gap-5"
          >
            <span className="text-xs text-slate-500">
              {item.name}
            </span>

            <span className="text-xs font-semibold text-slate-900">
              {formatNumber(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   LINE CHART
========================================================= */

function EnrollmentLineGraph({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  const data = dashboard.monthlyActivity ?? [];

  return (
    <SectionCard
      title="Training Activity"
      description="Monthly enrollments and completed trainings"
      icon={TrendingUp}
      className="h-full"
    >
      {data.length === 0 ? (
        <EmptyState
          title="No activity data"
          description="Monthly training activity will appear here once data is available."
        />
      ) : (
        <div className="h-[330px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />

              <Tooltip
                cursor={{
                  stroke: "#cbd5e1",
                  strokeDasharray: "4 4",
                }}
                content={<ChartTooltip />}
              />

              <Legend
                verticalAlign="top"
                align="right"
                height={35}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              />

              <Line
                type="monotone"
                dataKey="enrollments"
                name="Enrollments"
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "#0f172a",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                }}
              />

              <Line
                type="monotone"
                dataKey="completedTrainings"
                name="Completed Trainings"
                stroke="#94a3b8"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "#94a3b8",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}

/* =========================================================
   BAR CHART
========================================================= */

function TrainingBarGraph({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  const data = useMemo(
    () => [
      {
        name: "Programs",
        value: dashboard.training.totalTrainingPrograms,
      },
      {
        name: "Batches",
        value: dashboard.training.totalBatches,
      },
      {
        name: "Ongoing",
        value: dashboard.training.ongoingBatches,
      },
      {
        name: "Completed",
        value: dashboard.training.completedBatches,
      },
    ],
    [dashboard],
  );

  return (
    <SectionCard
      title="Training Overview"
      description="Current training program and batch counts"
      icon={BarChart3}
      className="h-full"
    >
      <div className="h-[330px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 15,
              right: 10,
              left: -20,
              bottom: 0,
            }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
            />

            <Tooltip
              cursor={{
                fill: "#f8fafc",
              }}
              content={<ChartTooltip />}
            />

            <Bar
              dataKey="value"
              name="Count"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            >
              {data.map((_, index) => (
                <Cell
                  key={`training-bar-${index}`}
                  fill={
                    [
                      "#0f172a",
                      "#475569",
                      "#64748b",
                      "#94a3b8",
                    ][index]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

/* =========================================================
   ENROLLMENT STATUS
========================================================= */

function EnrollmentStatusCard({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  const data = [
    {
      name: "Pending",
      value: dashboard.enrollments.pendingEnrollments,
    },
    {
      name: "Approved",
      value: dashboard.enrollments.approvedEnrollments,
    },
    {
      name: "Completed",
      value: dashboard.enrollments.completedEnrollments,
    },
    {
      name: "Rejected",
      value: dashboard.enrollments.rejectedEnrollments,
    },
  ];

  const total = data.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const colors = [
    "#f59e0b",
    "#10b981",
    "#64748b",
    "#ef4444",
  ];

  return (
    <SectionCard
      title="Enrollment Status"
      description="Current enrollment distribution"
      icon={ClipboardCheck}
    >
      {total === 0 ? (
        <EmptyState
          title="No enrollments"
          description="Enrollment statistics will appear here once participants enroll."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-center">
          <div className="relative mx-auto h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`enrollment-${index}`}
                      fill={colors[index]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  content={<ChartTooltip />}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">
                {formatNumber(total)}
              </span>

              <span className="text-[10px] text-slate-400">
                Total
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {data.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: colors[index],
                    }}
                  />

                  <span className="text-sm text-slate-600">
                    {item.name}
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {formatNumber(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* =========================================================
   RECENT ENROLLMENTS
========================================================= */

function RecentEnrollmentsCard({
  enrollments,
}: {
  enrollments: RecentEnrollment[];
}) {
  return (
    <SectionCard
      title="Recent Enrollments"
      description="Latest participant enrollment activity"
      icon={Users}
    >
      {enrollments.length === 0 ? (
        <EmptyState
          title="No recent enrollments"
          description="New enrollment activity will appear here."
        />
      ) : (
        <div className="space-y-1">
          {enrollments.slice(0, 6).map((enrollment) => (
            <div
              key={enrollment.enrollmentId}
              className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {getInitials(enrollment.participantName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {enrollment.participantName}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {enrollment.batchCode}
                  {" • "}
                  {formatDateTime(enrollment.enrolledAt)}
                </p>
              </div>

              <StatusBadge status={enrollment.status} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* =========================================================
   UPCOMING BATCHES
========================================================= */

function UpcomingBatchesCard({
  batches,
}: {
  batches: UpcomingBatch[];
}) {
  return (
    <SectionCard
      title="Upcoming Batches"
      description="Scheduled training batches"
      icon={CalendarDays}
    >
      {batches.length === 0 ? (
        <EmptyState
          title="No upcoming batches"
          description="Scheduled training batches will appear here."
        />
      ) : (
        <div className="space-y-3">
          {batches.slice(0, 5).map((batch) => {
            const percentage =
              batch.capacity > 0
                ? Math.min(
                    (batch.enrolledCount / batch.capacity) * 100,
                    100,
                  )
                : 0;

            return (
              <div
                key={batch.trainingBatchId}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">
                      {batch.batchCode}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {batch.programName}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {formatDate(batch.startDate)}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Enrollment
                    </span>

                    <span className="font-medium text-slate-600">
                      {batch.enrolledCount} / {batch.capacity}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-700 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

/* =========================================================
   SERVICE REQUESTS
========================================================= */

function ServiceRequestsCard({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  return (
    <SectionCard
      title="Service Requests"
      description="Current service request activity"
      icon={ServerCog}
    >
      <div className="divide-y divide-slate-100">
        <MetricRow
          label="Total Requests"
          value={dashboard.serviceRequests.totalRequests}
          icon={ServerCog}
        />

        <MetricRow
          label="Pending"
          value={dashboard.serviceRequests.pendingRequests}
          icon={Clock3}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <MetricRow
          label="Resolved"
          value={dashboard.serviceRequests.resolvedRequests}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>
    </SectionCard>
  );
}

/* =========================================================
   TRAINER APPLICATIONS
========================================================= */

function TrainerApplicationsCard({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  return (
    <SectionCard
      title="Trainer Applications"
      description="Application review summary"
      icon={UserCog}
    >
      <div className="divide-y divide-slate-100">
        <MetricRow
          label="Total Applications"
          value={
            dashboard.trainerApplications.totalApplications
          }
          icon={UserRound}
        />

        <MetricRow
          label="Pending"
          value={
            dashboard.trainerApplications.pendingApplications
          }
          icon={Clock3}
          iconClassName="bg-amber-50 text-amber-600"
        />

        <MetricRow
          label="Approved"
          value={
            dashboard.trainerApplications.approvedApplications
          }
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <MetricRow
          label="Rejected"
          value={
            dashboard.trainerApplications.rejectedApplications
          }
          icon={XCircle}
          iconClassName="bg-red-50 text-red-600"
        />
      </div>
    </SectionCard>
  );
}

/* =========================================================
   CERTIFICATES
========================================================= */

function CertificatesCard({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  return (
    <SectionCard
      title="Certificates"
      description="Certificate issuance summary"
      icon={Award}
    >
      <div className="divide-y divide-slate-100">
        <MetricRow
          label="Total Issued"
          value={dashboard.certificates.totalIssued}
          icon={Award}
        />

        <MetricRow
          label="Issued This Month"
          value={dashboard.certificates.issuedThisMonth}
          icon={TrendingUp}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <MetricRow
          label="Revoked"
          value={dashboard.certificates.revokedCount}
          icon={XCircle}
          iconClassName="bg-red-50 text-red-600"
        />
      </div>
    </SectionCard>
  );
}

/* =========================================================
   ATTENDANCE
========================================================= */

function AttendanceCard({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  return (
    <SectionCard
      title="Today's Attendance"
      description="Attendance records for today"
      icon={UserCheck}
    >
      <div className="divide-y divide-slate-100">
        <MetricRow
          label="Total Records"
          value={dashboard.attendance.totalRecordsToday}
          icon={ClipboardCheck}
        />

        <MetricRow
          label="Present"
          value={dashboard.attendance.presentToday}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <MetricRow
          label="Absent"
          value={dashboard.attendance.absentToday}
          icon={XCircle}
          iconClassName="bg-red-50 text-red-600"
        />
      </div>
    </SectionCard>
  );
}

/* =========================================================
   ASSESSMENT PERFORMANCE
========================================================= */

function AssessmentPerformanceCard({
  dashboard,
}: {
  dashboard: AdminDashboard;
}) {
  const passRate = Math.max(
    0,
    Math.min(
      dashboard.assessments.passRatePercentage,
      100,
    ),
  );

  return (
    <SectionCard
      title="Assessment Performance"
      description="Overall evaluated assessment results"
      icon={FileCheck2}
    >
      <div className="grid gap-5 md:grid-cols-[1fr_180px] md:items-center">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Pass Rate
            </span>

            <span className="text-lg font-bold text-slate-900">
              {passRate.toFixed(1)}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-800 transition-all"
              style={{
                width: `${passRate}%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100">
            <div className="px-3 py-3 text-center">
              <p className="text-lg font-bold text-slate-900">
                {formatNumber(
                  dashboard.assessments
                    .totalAttemptsEvaluated,
                )}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Evaluated
              </p>
            </div>

            <div className="px-3 py-3 text-center">
              <p className="text-lg font-bold text-emerald-600">
                {formatNumber(
                  dashboard.assessments.passedCount,
                )}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Passed
              </p>
            </div>

            <div className="px-3 py-3 text-center">
              <p className="text-lg font-bold text-red-600">
                {formatNumber(
                  dashboard.assessments.failedCount,
                )}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Failed
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {passRate.toFixed(0)}%
            </p>

            <p className="text-[10px] text-slate-400">
              Pass Rate
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminDashboardPage() {
  const {
    dashboard,
    isLoading,
    error,
    getDashboard,
  } = useAdminDashboard(adminDashboardApi);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

useEffect(() => {
  getDashboard();
}, [getDashboard]);
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await getDashboard();
    } finally {
      setIsRefreshing(false);
    }
  };

if (isLoading && !dashboard) {
  return (
    <PageSkeleton
      statCards={4}
      showHeader
      showCharts
      chartCount={2}
    />
  );
}



  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !dashboard) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
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
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <Activity className="h-4 w-4" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Admin Dashboard
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Overview of users, training, services, assessments,
              and system activity.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =================================================
            TOP STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={dashboard.users.totalUsers}
            description={`${formatNumber(
              dashboard.users.totalParticipants,
            )} participants`}
            icon={Users}
            iconClassName="bg-slate-100 text-slate-700"
          />

          <StatCard
            title="Participants"
            value={dashboard.users.totalParticipants}
            description={`${formatNumber(
              dashboard.users.unverifiedEmailCount,
            )} unverified email`}
            icon={GraduationCap}
            iconClassName="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Trainers"
            value={dashboard.users.totalTrainers}
            description={`${formatNumber(
              dashboard.trainerApplications.pendingApplications,
            )} pending applications`}
            icon={UserCheck}
            iconClassName="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Training Programs"
            value={dashboard.training.totalTrainingPrograms}
            description={`${formatNumber(
              dashboard.training.activeTrainingPrograms,
            )} active programs`}
            icon={BookOpen}
            iconClassName="bg-violet-50 text-violet-600"
          />
        </div>

        {/* =================================================
            CHARTS
        ================================================= */}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <EnrollmentLineGraph dashboard={dashboard} />

          <TrainingBarGraph dashboard={dashboard} />
        </div>

        {/* =================================================
            ENROLLMENT + TRAINING
        ================================================= */}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <EnrollmentStatusCard dashboard={dashboard} />

          <SectionCard
            title="Training Statistics"
            description="Current training and batch status"
            icon={BookOpen}
          >
            <div className="divide-y divide-slate-100">
              <MetricRow
                label="Active Programs"
                value={
                  dashboard.training.activeTrainingPrograms
                }
                icon={BookOpen}
                iconClassName="bg-violet-50 text-violet-600"
              />

              <MetricRow
                label="Total Programs"
                value={
                  dashboard.training.totalTrainingPrograms
                }
                icon={BookOpen}
              />

              <MetricRow
                label="Total Batches"
                value={dashboard.training.totalBatches}
                icon={CalendarDays}
              />

              <MetricRow
                label="Ongoing Batches"
                value={dashboard.training.ongoingBatches}
                icon={Activity}
                iconClassName="bg-amber-50 text-amber-600"
              />

              <MetricRow
                label="Upcoming Batches"
                value={
                  dashboard.training.upcomingBatchesCount
                }
                icon={Clock3}
                iconClassName="bg-blue-50 text-blue-600"
              />

              <MetricRow
                label="Completed Batches"
                value={
                  dashboard.training.completedBatches
                }
                icon={CheckCircle2}
                iconClassName="bg-emerald-50 text-emerald-600"
              />
            </div>
          </SectionCard>
        </div>

        {/* =================================================
            RECENT + UPCOMING
        ================================================= */}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <RecentEnrollmentsCard
            enrollments={dashboard.recentEnrollments}
          />

          <UpcomingBatchesCard
            batches={dashboard.upcomingBatches}
          />
        </div>

        {/* =================================================
            SYSTEM METRICS
        ================================================= */}

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <ServiceRequestsCard dashboard={dashboard} />

          <TrainerApplicationsCard dashboard={dashboard} />

          <CertificatesCard dashboard={dashboard} />

          <AttendanceCard dashboard={dashboard} />
        </div>

        {/* =================================================
            ASSESSMENT
        ================================================= */}

        <div className="mt-5">
          <AssessmentPerformanceCard dashboard={dashboard} />
        </div>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity className="h-3.5 w-3.5" />
            <span>
              Dashboard data is loaded from the admin dashboard
              API.
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>
              Updated automatically when refreshed.
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}