"use client";

import {
  Bell,
  Settings,
  Sparkles,
} from "lucide-react";

import {
  Button,
  IconWrapper,
  SectionCard,
} from "@repo/ui/index";

const announcements = [
  {
    id: 1,
    icon: Bell,
    variant: "info" as const,
    title: "New Training Schedule for June 2025",
    description: "Please check the complete schedule for next month.",
    date: "May 22, 2025",
  },
  {
    id: 2,
    icon: Settings,
    variant: "warning" as const,
    title: "System Maintenance Notice",
    description: "The system will undergo maintenance on May 25, 2025.",
    date: "May 20, 2025",
  },
  {
    id: 3,
    icon: Sparkles,
    variant: "primary" as const,
    title: "New Training Materials Available",
    description: "Additional learning modules are now available in the LMS.",
    date: "May 18, 2025",
  },
];

export default function LatestAnnouncements() {
  return (
    <SectionCard
      title="Latest Announcements"
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
        {announcements.map((announcement) => {
          const Icon = announcement.icon;

          return (
            <div
              key={announcement.id}
              className="flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-slate-50"
            >
              <IconWrapper
                size="sm"
                variant={announcement.variant}
              >
                <Icon className="h-5 w-5" />
              </IconWrapper>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-slate-900">
                  {announcement.title}
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  {announcement.description}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {announcement.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}