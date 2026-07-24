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

import TrainingOverview from "@/components/admin/dashboard/TrainingOverview";
import UpcomingSchedule from "@/components/admin/dashboard/UpcomingSchedule";
import RecentActivities from "@/components/admin/dashboard/RecentActivities";
import TrainingProgress from "@/components/admin/dashboard/TrainingProgress";
import LatestAnnouncements from "@/components/admin/dashboard/LatestAnnouncements";

export default function DashboardPage() {
  return (
    <PageSection
      title="Welcome back, John Dela Cruz! 👋"
      description="Here's what's happening today in the Integrated Service and Training Management System."
    >
      <StatsGrid>
        <StatCard
          title="Total Participants"
          value={248}
          icon={Users}
      
          footer="from last month"
        />

        <StatCard
          title="Active Trainings"
          value={18}
          icon={BookOpen}
          footer="ongoing this week"
        />

        <StatCard
          title="Examinations"
          value={12}
          icon={ClipboardList}
         
          footer="upcoming exams"
        />

        <StatCard
          title="Certificates Issued"
          value={156}
          icon={Award}
         
          footer="this month"
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