import type {
  TrainingProgramDocument,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  TrainingProgramDocumentEndpoint,
} from "./TrainingDocumentsEndpoints";

export class TrainingProgramDocumentApi {
  constructor(
    private readonly api: ApiClient
  ) {}

  async getAll(
    trainingProgramId: string
  ): Promise<TrainingProgramDocument[]> {
    return this.api.request<TrainingProgramDocument[]>(
      TrainingProgramDocumentEndpoint.getAll(
        trainingProgramId
      ),
      {
        method: "GET",
      }
    );
  }

  async upload(
    trainingProgramId: string,
    file: File,
    documentType: string
  ): Promise<TrainingProgramDocument> {
    const formData = new FormData();

    formData.append("File", file);
    formData.append(
      "DocumentType",
      documentType
    );

    return this.api.request<TrainingProgramDocument>(
      TrainingProgramDocumentEndpoint.upload(
        trainingProgramId
      ),
      {
        method: "POST",
        body: formData,
      }
    );
  }

  async delete(
    trainingProgramId: string,
    documentId: string
  ): Promise<void> {
    await this.api.request<void>(
      TrainingProgramDocumentEndpoint.delete(
        trainingProgramId,
        documentId
      ),
      {
        method: "DELETE",
      }
    );
  }
}