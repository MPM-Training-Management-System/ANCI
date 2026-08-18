export type MaterialType =
  | "Module"
  | "Presentation"
  | "Video"
  | "Document"
  | "Link";

export type MaterialStatus =
  | "Published"
  | "Draft";

export type TrainingOption = {
  name: string;
  code: string;
};

export type LearningMaterial = {
  id: string;

  title: string;

  description: string;

  type: MaterialType;

  status: MaterialStatus;

  training: string;

  trainingCode: string;

  fileName: string;

  fileSize: string;

  uploadedAt: string;

  updatedAt: string;

  url?: string;
};