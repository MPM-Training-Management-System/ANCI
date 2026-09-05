import type {
  Enrollment,
  CreateEnrollmentRequest,
  ReviewEnrollmentRequest,
  EnrollmentDocument,
  ReviewEnrollmentDocumentRequest,
  TrainingProgramRequirement,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  EnrollmentEndpoints,
  EnrollmentDocumentEndpoints,
} from "./EnrollmentEndpoint";


// =========================================================
// ENROLLMENT API
//
// Shared API client for:
//
// Participant Mobile
// Admin Web
//
// Authorization is handled by the backend
// using the authenticated user's JWT role.
// =========================================================

export class EnrollmentApi {

  constructor(
    private readonly api: ApiClient
  ) {}


  // =======================================================
  // PARTICIPANT
  // CREATE ENROLLMENT
  //
  // POST /api/enrollments
  //
  // Used when a participant submits
  // an enrollment application.
  // =======================================================
async getRequirements(
  trainingBatchId: string
): Promise<TrainingProgramRequirement[]> {
  return this.api.request<TrainingProgramRequirement[]>(
    `/api/enrollments/requirements/${trainingBatchId}`,
    {
      method: "GET",
    }
  );
}

  async create(
    request: CreateEnrollmentRequest
  ): Promise<Enrollment> {

    return this.api.request<Enrollment>(
      EnrollmentEndpoints.create,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: request,
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // GET MY ENROLLMENTS
  //
  // GET /api/enrollments/me
  //
  // Returns all enrollments belonging to
  // the currently authenticated participant.
  // =======================================================

  async getMyEnrollments():
    Promise<Enrollment[]> {

    return this.api.request<Enrollment[]>(
      EnrollmentEndpoints.myEnrollments,
      {
        method: "GET",
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // GET ENROLLMENT BY ID
  //
  // GET /api/enrollments/{id}
  //
  // Gets a specific enrollment of the
  // currently authenticated participant.
  // =======================================================

  async getById(
    id: string
  ): Promise<Enrollment> {

    return this.api.request<Enrollment>(
      EnrollmentEndpoints.byId(id),
      {
        method: "GET",
      }
    );
  }


  // =======================================================
  // ADMIN
  // GET PENDING ENROLLMENTS
  //
  // GET /api/enrollments/pending
  //
  // Used by Admin to display enrollment
  // applications waiting for review.
  // =======================================================

  async getPending():
    Promise<Enrollment[]> {

    return this.api.request<Enrollment[]>(
      EnrollmentEndpoints.getAllForAdmin,
      {
        method: "GET",
      }
    );
  }

  async getparticipant():
    Promise<Enrollment[]> {

    return this.api.request<Enrollment[]>(
      EnrollmentEndpoints.getfortrainer,
      {
        method: "GET",
      }
    );
  }

  

  // =======================================================
  // ADMIN
  // REVIEW ENROLLMENT
  //
  // PUT /api/enrollments/{id}/review
  //
  // Used by Admin to approve or reject
  // a participant's enrollment.
  // =======================================================

  async review(
    id: string,
    request: ReviewEnrollmentRequest
  ): Promise<void> {

    await this.api.request<void>(
      EnrollmentEndpoints.review(id),
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: request,
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // UPLOAD ENROLLMENT DOCUMENT
  //
  // POST
  // /api/enrollments/{enrollmentId}/documents
  //
  // NOTE:
  // This endpoint uses multipart/form-data.
  // =======================================================

  async uploadDocument(
    enrollmentId: string,
    formData: FormData
  ): Promise<EnrollmentDocument> {

    return this.api.request<EnrollmentDocument>(
      EnrollmentDocumentEndpoints.upload(
        enrollmentId
      ),
      {
        method: "POST",

        body: formData,
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // GET ENROLLMENT DOCUMENTS
  //
  // GET
  // /api/enrollments/{enrollmentId}/documents
  // =======================================================

  async getDocuments(
    enrollmentId: string
  ): Promise<EnrollmentDocument[]> {

    return this.api.request<
      EnrollmentDocument[]
    >(
      EnrollmentDocumentEndpoints.getAll(
        enrollmentId
      ),
      {
        method: "GET",
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // DELETE ENROLLMENT DOCUMENT
  //
  // DELETE
  // /api/enrollments/{enrollmentId}/documents/{documentId}
  // =======================================================

  async deleteDocument(
    enrollmentId: string,
    documentId: string
  ): Promise<void> {

    await this.api.request<void>(
      EnrollmentDocumentEndpoints.delete(
        enrollmentId,
        documentId
      ),
      {
        method: "DELETE",
      }
    );
  }
  
 async getDocumentsForAdmin(
    enrollmentId: string
  ): Promise<EnrollmentDocument[]> {

    return this.api.request<EnrollmentDocument[]>(
      EnrollmentDocumentEndpoints.getAllForAdmin(
        enrollmentId
      ),
      {
        method: "GET",
      }
    );
  }

  // =======================================================
  // ADMIN
  // REVIEW ENROLLMENT DOCUMENT
  //
  // PUT
  // /api/enrollments/{enrollmentId}/documents/{documentId}/review
  // =======================================================

  async reviewDocument(
    enrollmentId: string,
    documentId: string,
    request: ReviewEnrollmentDocumentRequest
  ): Promise<void> {

    await this.api.request<void>(
      EnrollmentDocumentEndpoints.review(
        enrollmentId,
        documentId
      ),
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: request,
      }
    );
  }

  
}