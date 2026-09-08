import {
  ApiClient,
  AuthApi,
  ParticipantApi,
  TrainingBatchApi,
  EnrollmentApi,
  AttendanceApi,
  LearningMaterialApi,
  LearningProgressApi,
  WrittenAssessmentApi,
} from "@repo/api";

import { auth } from "./auth";

export const apiClient = new ApiClient({
  baseUrl:
    process.env.EXPO_PUBLIC_API_URL ?? "",
  getToken: async () => {
    return auth.getToken();
  },
});

export const participantApi =
  new ParticipantApi(apiClient);

export const authApi =
  new AuthApi(apiClient);

export const learningProgressApi =
  new LearningProgressApi(apiClient);

export const writtenAssessmentApi =
  new WrittenAssessmentApi(apiClient);

export const trainingBatchApi =
  new TrainingBatchApi(apiClient);

export const enrollmentApi =
  new EnrollmentApi(apiClient);

export const attendanceApi =
  new AttendanceApi(apiClient);

export const learningMaterialApi =
  new LearningMaterialApi(apiClient);