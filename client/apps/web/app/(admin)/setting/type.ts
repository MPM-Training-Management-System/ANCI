export type TrainerProfile = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  specialization: string;
  trainerId: string;
};

export type TrainerNotificationSettings = {
  assignmentAlerts: boolean;
  scheduleAlerts: boolean;
  attendanceAlerts: boolean;
  assessmentAlerts: boolean;
  announcementAlerts: boolean;
  emailNotifications: boolean;
};

export type TrainerPreferenceSettings = {
  availability: string;
  preferredSession: string;
  defaultAttendanceMode: string;
  allowParticipantMessages: boolean;
  showProfileToParticipants: boolean;
};

export type TrainerSystemSettings = {
  timezone: string;
  dateFormat: string;
  language: string;
};