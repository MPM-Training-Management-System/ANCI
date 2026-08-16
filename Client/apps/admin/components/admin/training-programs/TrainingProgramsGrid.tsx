"use client";

import { useState } from "react";

import { useTraining } from "@/hooks/useTraining";
import { TrainingModal } from "./Addmodal";

import {
  EmptyActionCard,
  ProgramCard,
} from "@repo/ui/index";

export default function TrainingProgramsGrid() {
  const { trainings, loading, error } = useTraining();

  const [open, setOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {trainings.map((training) => (
          <ProgramCard
            key={training.programCode}
            image={training.thumbnail}
            title={training.title}
            description={training.description}
            category={training.category}
            reference={training.programCode}
            status={training.status}
            statusColor="success"
            enrolled={0}
            capacity={Number(training.maxParticipants)}
            onView={() => console.log(training.programCode)}
            onEdit={() => console.log(training.programCode)}
          />
        ))}

        <EmptyActionCard
          title="Create New Program"
          description="Define a new institutional development program."
          buttonLabel="New Program"
          onClick={() => setOpen(true)}
        />
      </div>

      <TrainingModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}