"use client";

import {
  Award,
  BookOpen,
  ClipboardList,
  Users,
} from "lucide-react";

import {
  PageSection,
  StatCard,
  StatsGrid,
} from "@repo/ui/index";
import { useParticipants } from "@/hooks/useParticipants";
import TrainingOverview from "@/components/admin/dashboard/TrainingOverview";
import UpcomingSchedule from "@/components/admin/dashboard/UpcomingSchedule";
import RecentActivities from "@/components/admin/dashboard/RecentActivities";
import TrainingProgress from "@/components/admin/dashboard/TrainingProgress";
import LatestAnnouncements from "@/components/admin/dashboard/LatestAnnouncements";

export default function DashboardPage() {
   const { count, loading } = useParticipants();

    

  return (
    <PageSection
      title="Welcome back, John Dela Cruz! "
      description="Here's what's happening today in the Integrated Service and Training Management System."
    >
      <StatsGrid>
  <StatCard
    loading={loading}
    variant="primary"
    title="Total Students"
    icon={Users}
    value={count}
    description="Total enrolled participants"
  />

  <StatCard
    loading={loading}
    variant="primary"
    title="Assigned Classes"
    value={18}
    icon={BookOpen}
    description="asd"
  />

  <StatCard
    loading={loading}
    variant="primary"
    title="Today's Training Sessions"
    value={12}
    icon={ClipboardList}
    description="asd"
  />

  <StatCard
    loading={loading}
    variant="primary"
    title="Attendance Rate"
    value={156}
    icon={Award}
    description="asd"
  />
</StatsGrid>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrainingOverview />
        </div>

        <UpcomingSchedule />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <RecentActivities />

        <TrainingProgress />

        <LatestAnnouncements />
      </div>
    </PageSection>
  );
}