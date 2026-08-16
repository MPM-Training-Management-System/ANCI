"use client";

import {
  Button,
  Progress,
  SectionCard,
} from "@repo/ui/index";

const programs = [
  {
    id: 1,
    title: "Effective Communication Skills",
    progress: 65,
  },
  {
    id: 2,
    title: "Leadership and Teamwork",
    progress: 72,
  },
  {
    id: 3,
    title: "Customer Service Excellence",
    progress: 48,
  },
  {
    id: 4,
    title: "Time Management",
    progress: 81,
  },
  {
    id: 5,
    title: "Problem Solving and Decision Making",
    progress: 60,
  },
];

export default function TrainingProgress() {
  return (
    <SectionCard
      title="Training Progress"
      description="Completion rate by training program"
      headerRight={
        <Button
          variant="ghost"
          size="sm"
        >
          View Report
        </Button>
      }
    >
      <div className="space-y-6">
        {programs.map((program) => (
          <div key={program.id}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-700">
                {program.title}
              </h4>

              <span className="text-sm font-semibold text-slate-900">
                {program.progress}%
              </span>
            </div>

            <Progress value={program.progress} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}