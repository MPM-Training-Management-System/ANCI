"use client";

import {
  Users,
  GraduationCap,
  UserCheck,
} from "lucide-react";

import {
  Card,
} from "@repo/ui/index";

const stats = [
  {
    title: "Total Participants",
    value: "1,240",
    icon: <Users className="h-7 w-7" />,
  },
  {
    title: "Completion Rate",
    value: "94%",
    icon: <GraduationCap className="h-7 w-7" />,
  },
  {
    title: "Active Mentors",
    value: "35",
    icon: <UserCheck className="h-7 w-7" />,
  },
];

export default function TrainingFooterStats() {
  return (
    <Card className="mt-10 p-8">
      <div className="grid gap-8 md:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.title}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              {item.icon}
            </div>

            <h2 className="text-4xl font-bold tracking-tight">
              {item.value}
            </h2>

            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}