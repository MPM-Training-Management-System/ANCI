import {
  ApiClient,
  AuthApi,
  TrainerApplicationApi,
  TrainingProgramApi,
  TrainingProgramDocumentApi,
  TrainingBatchApi,
  TrainerAssignmentApi,
  TrainerApi,
  AdminApi,
  EnrollmentApi,
  AttendanceApi,
  LearningMaterialApi,
  WrittenAssessmentApi,
  ServiceApi
} from "@repo/api";

import {
  auth,
} from "@/lib/auth";




const baseUrl =
  process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured."
  );
}




export const api =
  new ApiClient({
    baseUrl,

    getToken: async () => {
      if (
        typeof window === "undefined"
      ) {
        return null;
      }

      const token =
        auth.getToken();

      console.log(
        "ADMIN API TOKEN:",
        token
          ? "TOKEN EXISTS"
          : "NO TOKEN"
      );

      return token;
    },
  });


// =========================================================
// AUTH API
// =========================================================

export const authApi =
  new AuthApi(api);




export const trainingProgramApi =
  new TrainingProgramApi(api);

  export const serviceApi =
  new ServiceApi(api);


  
export const writtenAssessmentApi =
  new WrittenAssessmentApi(api);

  export const attendanceApi =
  new AttendanceApi(api);

  export const adminApi =
  new AdminApi(api);

  export const learningMaterialApi =
  new LearningMaterialApi(api);





export const trainingProgramDocumentApi =
  new TrainingProgramDocumentApi(api);
  export const enrollmentApi =
  new EnrollmentApi(api);



export const trainingBatchApi =
  new TrainingBatchApi(api);
export const trainerApplicationApi =
  new TrainerApplicationApi(api);

  export const trainerApi =
  new TrainerApi(api);
  
  export const trainerAssignmentApi =
  new TrainerAssignmentApi(api);