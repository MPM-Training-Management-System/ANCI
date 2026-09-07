export type NotificationSettings = {
  enrollmentAlerts: boolean;
  attendanceAlerts: boolean;
  assessmentAlerts: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
};

export type TrainingSettings = {
  defaultCapacity: number;
  autoEnrollmentReview: boolean;
  allowWaitlist: boolean;
  requireTrainerAssignment: boolean;
};

export type SystemSettings = {
  timezone: string;
  dateFormat: string;
  language: string;
};

export type AdminProfile = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
};