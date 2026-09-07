import type {
  TrainerApplication,
  TrainerApplicationDocument,
  ReviewTrainerApplicationRequest,
  ReviewTrainerApplicationDocumentRequest,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";


export class TrainerApplicationApi {
  constructor(
    private readonly api: ApiClient
  ) {}


 
  async getAll(): Promise<
    TrainerApplication[]
  > {
    return this.api.request<
      TrainerApplication[]
    >(
      "/api/trainer-applications",
      {
        method: "GET",
      }
    );
  }


 
  async getById(
    id: string
  ): Promise<TrainerApplication> {
    return this.api.request<
      TrainerApplication
    >(
      `/api/trainer-applications/${id}`,
      {
        method: "GET",
      }
    );
  }


 
  async getMyApplication(): Promise<
    TrainerApplication
  > {
    return this.api.request<
      TrainerApplication
    >(
      "/api/trainer-applications/me",
      {
        method: "GET",
      }
    );
  }


 

  async review(
    id: string,
    request: ReviewTrainerApplicationRequest
  ): Promise<void> {
    await this.api.request<void>(
      `/api/trainer-applications/${id}/review`,
      {
        method: "PUT",
        body: request,
      }
    );
  }



  async reviewDocument(
    applicationId: string,
    documentId: string,
    request: ReviewTrainerApplicationDocumentRequest
  ): Promise<void> {
    await this.api.request<void>(
      `/api/trainer-applications/${applicationId}/documents/${documentId}/review`,
      {
        method: "PUT",
        body: request,
      }
    );
  }




  async getMyDocuments(
    applicationId: string
  ): Promise<
    TrainerApplicationDocument[]
  > {
    return this.api.request<
      TrainerApplicationDocument[]
    >(
      `/api/trainer-applications/${applicationId}/documents`,
      {
        method: "GET",
      }
    );
  }
}