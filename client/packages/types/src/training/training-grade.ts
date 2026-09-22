export interface TrainingGrade {
  enrollmentId: string;
  trainingBatchId: string;
  batchCode: string;
  participantName: string;
  profileImageUrl?: string | null;

  // Attendance - 20%
  attendancePercentage: number;
  attendanceWeight: number;
  attendanceWeightedScore: number;

  // Active Participation - 20%
  participationPercentage: number;
  participationWeight: number;
  participationWeightedScore: number;

  // Written Exam - 30%
  examPercentage: number;
  examWeight: number;
  examWeightedScore: number;

  // Practical Assessment - 30%
  practicalPercentage: number;
  practicalWeight: number;
  practicalWeightedScore: number;

  // Final
  overallGrade: number;

  isPassed: boolean;
}