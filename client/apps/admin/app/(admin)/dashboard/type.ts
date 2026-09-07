export type QuickAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon:
    | "participant"
    | "training"
    | "enrollment"
    | "trainer"
    | "attendance"
    | "report";
};

export type UpcomingTraining = {
  id: string;
  title: string;
  batch: string;
  trainer: string;
  date: string;
  time: string;
  location: string;
  enrolled: number;
  capacity: number;
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  time: string;
  type:
    | "enrollment"
    | "training"
    | "attendance"
    | "assessment"
    | "system";
};

export type EnrollmentTrend = {
  month: string;
  value: number;
};

export type TrainingCapacity = {
  name: string;
  enrolled: number;
  capacity: number;
};