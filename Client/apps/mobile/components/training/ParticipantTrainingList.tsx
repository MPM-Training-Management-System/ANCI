import type {
  TrainingBatch,
} from "@repo/types";

export interface ParticipantTraining {
  id: string;
  batchId: string;

  code: string;
  title: string;
  description: string;

  mode: "Online" | "Face-to-Face";

  trainer: string;

  schedule: string;
  time: string;

  slots: number;
  enrolled: number;

  duration: string;
  location: string;

  requirements: string[];

  status: string;
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

export function mapTrainingBatchToParticipantTraining(
  batch: TrainingBatch,
): ParticipantTraining {
  const remainingSlots =
    Math.max(
      batch.capacity -
        batch.enrolledCount,
      0,
    );

  return {
    id: batch.id,

    batchId: batch.id,

    code: batch.batchCode,

    title: batch.programName,

    description:
      "Training program available for participant enrollment.",

    mode: "Face-to-Face",

    trainer:
      "Trainer will be assigned",

    schedule:
      `${formatDate(batch.startDate)} - ${formatDate(batch.endDate)}`,

    time:
      "Schedule to be announced",

    slots:
      batch.capacity,

    enrolled:
      batch.enrolledCount,

    duration:
      `${formatDate(batch.startDate)} - ${formatDate(batch.endDate)}`,

    location:
      batch.location ??
      "Location to be announced",

    requirements: [],

    status:
      batch.status,
  };
}