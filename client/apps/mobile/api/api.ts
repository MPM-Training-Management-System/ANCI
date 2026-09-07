import {
  ApiClient,
  AuthApi,
  ParticipantApi,
  TrainingBatchApi,
  EnrollmentApi,
  AttendanceApi,
} from "@repo/api";
import { auth } from "./auth";
const apiClient = new ApiClient({
  baseUrl:
    process.env.EXPO_PUBLIC_API_URL ?? "",
    getToken: async() =>{
      return auth.getToken();
    },
});
export const participantApi = new ParticipantApi(apiClient);
export const authApi =
  new AuthApi(apiClient);

  export const trainingBatchApi =
  new TrainingBatchApi(apiClient);
  
  export const enrollmentApi =
  new EnrollmentApi(apiClient);


   export const attendanceApi =
  new AttendanceApi(apiClient);