
import {
  ApiClient,
  AuthApi,
  TrainerApi,
  TrainerApplicationApi,
  AttendanceApi,
  TrainingBatchApi,
  TrainerAssignmentApi,
  EnrollmentApi,
  ServiceApi,
  AuthAPIs,
  PracticalAssessmentApi,
  ParticipantApi
} from "@repo/api";
import { auth } from "./auth";

export const apiClient = new ApiClient({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ?? "",
      getToken: async () => {
      return auth.getToken();
    },
});


export const trainerApi =
  new TrainerApi(apiClient);
export const practicalAssessmentApi =
  new PracticalAssessmentApi(apiClient);
  export const authApi =
  new AuthApi(apiClient);
    export const participantApi =
  new ParticipantApi(apiClient);
export const serviceApi =
  new ServiceApi(apiClient);
export const trainerApplicationApi =
  new TrainerApplicationApi(apiClient);

  export const attendanceApi =
  new AttendanceApi(apiClient);
    export const authAPIs =
  new AuthAPIs(apiClient);


  export const trainingBatchApi =
  new TrainingBatchApi(apiClient);

  
  export const trainerAssignmentApi =
  new TrainerAssignmentApi(apiClient);

    export const enrollmentApi =
  new EnrollmentApi(apiClient);