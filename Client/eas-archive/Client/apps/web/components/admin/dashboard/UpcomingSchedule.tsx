"use client";

import { CalendarDays, Clock3, MapPin } from "lucide-react";

import {
  Badge,
  Button,
  SectionCard,
} from "@repo/ui/index";

const schedules = [
  {
    id: 1,
    month: "May",
    day: "24",
    title: "Effective Communication Skills",
    type: "Training",
    time: "8:00 AM - 5:00 PM",
    location: "Training Room A",
  },
  {
    id: 2,
    month: "May",
    day: "25",
    title: "Leadership and Teamwork",
    type: "Training",
    time: "8:00 AM - 5:00 PM",
    location: "Training Room B",
  },
  {
    id: 3,
    month: "May",
    day: "27",
    title: "Customer Service Excellence",
    type: "Training",
    time: "8:00 AM - 5:00 PM",
    location: "Training Room A",
  },
  {
    id: 4,
    month: "May",
    day: "30",
    title: "Communication Exam",
    type: "Examination",
    time: "9:00 AM - 12:00 PM",
    location: "Computer Lab 1",
  },
];

export default function UpcomingSchedule() {
  return (
    <SectionCard
      title="Upcoming Schedule"
      headerRight={
        <Button variant="ghost" size="sm">
          View All
        </Button>
      }
    >
      <div className="space-y-5">
        {schedules.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-xl transition-colors hover:bg-slate-50 p-2"
          >
            {/* Date */}
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-slate-100">
              <span className="text-[11px] font-semibold uppercase text-slate-500">
                {item.month}
              </span>

              <span className="text-2xl font-bold text-slate-900">
                {item.day}
              </span>
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h4 className="line-clamp-2 font-semibold text-slate-900">
                  {item.title}
                </h4>

                <Badge
                  className={
                    item.type === "Training"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-100"
                  }
                >
                  {item.type}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {item.time}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full">
          <CalendarDays className="mr-2 h-4 w-4" />
          View Calendar
        </Button>
      </div>
    </SectionCard>
  );
}