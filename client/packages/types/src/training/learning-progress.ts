export interface LearningSectionProgress {
  sectionId: string;
  sectionNumber: number;
  title: string;
  isRead: boolean;
  readAt: string | null;
  lastReadAt: string | null;
}

export interface LearningModuleProgress {
  moduleId: string;
  moduleNumber: number;
  title: string;
  totalSections: number;
  completedSections: number;
  progressPercentage: number;
  lastReadSectionId: string | null;
  sections: LearningSectionProgress[];
}

export interface LearningMaterialProgress {
  learningMaterialId: string;

  totalModules: number;
  completedModules: number;

  totalSections: number;
  completedSections: number;

  progressPercentage: number;

  lastReadModuleId: string | null;
  lastReadSectionId: string | null;

  modules: LearningModuleProgress[];
}