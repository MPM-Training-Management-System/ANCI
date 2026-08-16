"use client";

import {
  CheckCircle2,
  FileUp,
  UserPlus,
  Award,
} from "lucide-react";

import {
  Button,
  IconWrapper,
  SectionCard,
} from "@repo/ui/index";

const activities = [
  {
    id: 1,
    icon: CheckCircle2,
    variant: "success" as const,
    title: "Juan Santos",
    action: "completed the exam",
    subtitle: "Effective Communication Skills",
    time: "2 hours ago",
  },
  {
    id: 2,
    icon: UserPlus,
    variant: "info" as const,
    title: "Maria Garcia",
    action: "enrolled in training",
    subtitle: "Leadership and Teamwork",
    time: "4 hours ago",
  },
  {
    id: 3,
    icon: FileUp,
    variant: "primary" as const,
    title: "New learning material",
    action: "uploaded",
    subtitle: "Presentation Skills - Module 3",
    time: "1 day ago",
  },
  {
    id: 4,
    icon: Award,
    variant: "warning" as const,
    title: "Certificate issued",
    action: "to 8 participants",
    subtitle: "Customer Service Excellence",
    time: "2 days ago",
  },
];

export default function RecentActivities() {
  return (
    <SectionCard
      title="Recent Activities"
      headerRight={
        <Button
          variant="ghost"
          size="sm"
        >
          View All
        </Button>
      }
    >
      <div className="space-y-5">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-slate-50"
            >
              <IconWrapper
                size="sm"
                variant={activity.variant}
              >
                <Icon className="h-5 w-5" />
              </IconWrapper>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {activity.title}{" "}
                      <span className="font-normal text-slate-500">
                        {activity.action}
                      </span>
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      {activity.subtitle}
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-xs text-slate-400">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}