import type {
  TrainerApplication,
  TrainerApplicationDocument,
  TrainerProfile,

  UpdateTrainerApplicationRequest,
  UpdateTrainerProfileRequest,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";


export class TrainerApi {

  constructor(
    private readonly api: ApiClient
  ) {}


 
  async getMyApplication():
    Promise<TrainerProfile> {

    return this.api.request<TrainerProfile>(
      "/api/trainer-applications/me",
      {
        method: "GET",
      }
    );
  }




  async updateMyApplication(
    request: UpdateTrainerApplicationRequest
  ): Promise<TrainerApplication> {

    return this.api.request<TrainerApplication>(
      "/api/trainer-applications/me",
      {
        method: "PUT",

        body: request,
      }
    );
  }


 
  async updateProfileImage(
    file: File
  ): Promise<TrainerApplication> {

    const formData =
      new FormData();


    formData.append(
      "ProfileImage",
      file
    );


    return this.api.request<TrainerApplication>(
      "/api/trainer-applications/me/image",
      {
        method: "PUT",

        body: formData,
      }
    );
  }


  // =========================================================
  // GET APPLICATION BY ID
  // GET /api/trainer-applications/{id}
  // =========================================================

  async getApplicationById(
    id: string
  ): Promise<TrainerApplication> {

    return this.api.request<TrainerApplication>(
      `/api/trainer-applications/${id}`,
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // UPLOAD DOCUMENT
  // POST /api/trainer-applications/{id}/documents
  // =========================================================

  async uploadDocument(
    applicationId: string,

    documentType: string,

    file: File

  ): Promise<TrainerApplicationDocument> {

    const formData =
      new FormData();


    formData.append(
      "DocumentType",
      documentType
    );

    formData.append(
      "File",
      file
    );


    return this.api.request<TrainerApplicationDocument>(
      `/api/trainer-applications/${applicationId}/documents`,
      {
        method: "POST",

        body: formData,
      }
    );
  }


  // =========================================================
  // GET MY PROFILE
  // GET /api/trainer-profiles/me
  // =========================================================

  async getMyProfile():
    Promise<TrainerProfile> {

    return this.api.request<TrainerProfile>(
      "/api/trainer-profiles/me",
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // UPDATE MY PROFILE
  // PUT /api/trainer-profiles/me
  // =========================================================

  async updateMyProfile(
    request: UpdateTrainerProfileRequest
  ): Promise<TrainerProfile> {

    return this.api.request<TrainerProfile>(
      "/api/trainer-profiles/me",
      {
        method: "PUT",

        body: request,
      }
    );
  }


  // =========================================================
  // ADMIN GET TRAINER
  // GET /api/trainer-profiles/{id}
  // =========================================================

  async getProfileById(
    id: string
  ): Promise<TrainerProfile> {

    return this.api.request<TrainerProfile>(
      `/api/trainer-profiles/${id}`,
      {
        method: "GET",
      }
    );
  }


  // =========================================================
  // ADMIN ACTIVE TRAINERS
  // GET /api/trainer-profiles/active
  // =========================================================

  async getActiveTrainers():
    Promise<TrainerProfile[]> {

    return this.api.request<TrainerProfile[]>(
      "/api/trainer-profiles/active",
      {
        method: "GET",
      }
    );
  }

}