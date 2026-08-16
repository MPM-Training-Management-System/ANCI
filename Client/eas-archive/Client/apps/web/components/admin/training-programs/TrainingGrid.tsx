"use client";

import { TrainingCard } from "./TrainingCard";

export interface Training {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  trainer: string;
  participants: number;
  capacity: number;
  startDate: string;
  endDate: string;
  status: "Draft" | "Open" | "Ongoing" | "Completed";
  image?: string;
}

interface TrainingGridProps {
  trainings: Training[];
  onView?: (training: Training) => void;
  onEdit?: (training: Training) => void;
}

export function TrainingGrid({
  trainings,
  onView,
  onEdit,
}: TrainingGridProps) {
  if (trainings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">
          No Training Programs
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          No training programs found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {trainings.map((training) => (
        <TrainingCard
          key={training.id}
          {...training}
          onView={() => onView?.(training)}
          onEdit={() => onEdit?.(training)}
        />
      ))}
    </div>
  );
}