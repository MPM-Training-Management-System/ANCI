
import {
  ApiClient,
  AuthApi,
  TrainerApi,
  TrainerApplicationApi,
  AttendanceApi,
  TrainingBatchApi,
  TrainerAssignmentApi,
  
} from "@repo/api";
import { auth } from "./auth";

const apiClient = new ApiClient({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ?? "",
      getToken: async () => {
      return auth.getToken();
    },
});


export const trainerApi =
  new TrainerApi(apiClient);
export const authApi =
  new AuthApi(apiClient);

export const trainerApplicationApi =
  new TrainerApplicationApi(apiClient);

  export const attendanceApi =
  new AttendanceApi(apiClient);

  export const trainingBatchApi =
  new TrainingBatchApi(apiClient);

  
  export const trainerAssignmentApi =
  new TrainerAssignmentApi(apiClient);