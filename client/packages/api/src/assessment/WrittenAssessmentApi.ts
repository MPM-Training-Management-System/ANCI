import {
  ApiClient,
} from "../api/client";

import {
  WrittenAssessmentEndpoints,
} from "./WrittenAssessmentEndpoints";

import type {
  AdminAssessmentChoice,
  AdminAssessmentQuestion,
  AssessmentAttempt,
  AssessmentResult,
  CreateAssessmentChoiceRequest,
  CreateAssessmentQuestionRequest,
  CreateWrittenAssessmentRequest,
  ParticipantAssessment,
  SubmitAssessmentRequest,
  UpdateAssessmentChoiceRequest,
  UpdateAssessmentQuestionRequest,
  UpdateWrittenAssessmentRequest,
  WrittenAssessment,
} from "@repo/types";


// =========================================================
// WRITTEN ASSESSMENT API
//
// Shared API client for:
//
// Admin Web
// Participant Mobile
//
// JSON serialization is handled by ApiClient.
// Do NOT JSON.stringify() request bodies here.
// =========================================================

export class WrittenAssessmentApi {

  constructor(
    private readonly api: ApiClient
  ) {}


  // =======================================================
  // ADMIN
  // WRITTEN ASSESSMENT
  // =======================================================

  async getByBatchId(
    trainingBatchId: string
  ): Promise<WrittenAssessment[]> {

    return this.api.request<WrittenAssessment[]>(
      WrittenAssessmentEndpoints.getByBatchId(
        trainingBatchId
      ),
      {
        method: "GET",
      }
    );
  }


  async getById(
    id: string
  ): Promise<WrittenAssessment> {

    return this.api.request<WrittenAssessment>(
      WrittenAssessmentEndpoints.getById(id),
      {
        method: "GET",
      }
    );
  }


  async create(
    request: CreateWrittenAssessmentRequest
  ): Promise<WrittenAssessment> {

    return this.api.request<WrittenAssessment>(
      WrittenAssessmentEndpoints.create(),
      {
        method: "POST",

        body: request,
      }
    );
  }


  async update(
    id: string,
    request: UpdateWrittenAssessmentRequest
  ): Promise<WrittenAssessment> {

    return this.api.request<WrittenAssessment>(
      WrittenAssessmentEndpoints.update(id),
      {
        method: "PUT",

        body: request,
      }
    );
  }


  async delete(
    id: string
  ): Promise<void> {

    await this.api.request<void>(
      WrittenAssessmentEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }


  async setPublished(
    id: string,
    isPublished: boolean
  ): Promise<WrittenAssessment> {

    return this.api.request<WrittenAssessment>(
      WrittenAssessmentEndpoints.publish(
        id,
        isPublished
      ),
      {
        method: "PUT",
      }
    );
  }


    // =======================================================
  // ADMIN
  // AI QUESTION GENERATION
  // =======================================================

  async generateFromDocument(
    assessmentId: string,
    file: File,
    questionCount: number,
  ): Promise<AdminAssessmentQuestion[]> {

    const formData = new FormData();

    formData.append("file", file);

    return this.api.request<AdminAssessmentQuestion[]>(
      WrittenAssessmentEndpoints.generateFromDocument(
        assessmentId,
        questionCount,
      ),
      {
        method: "POST",

        body: formData,
      }
    );
  }


  // =======================================================
  // ADMIN
  // QUESTIONS
  // =======================================================

  async getQuestions(
    assessmentId: string
  ): Promise<AdminAssessmentQuestion[]> {

    return this.api.request<AdminAssessmentQuestion[]>(
      WrittenAssessmentEndpoints.getQuestions(
        assessmentId
      ),
      {
        method: "GET",
      }
    );
  }


  async createQuestion(
    request: CreateAssessmentQuestionRequest
  ): Promise<AdminAssessmentQuestion> {

    return this.api.request<AdminAssessmentQuestion>(
      WrittenAssessmentEndpoints.createQuestion(),
      {
        method: "POST",

        body: request,
      }
    );
  }


  async updateQuestion(
    questionId: string,
    request: UpdateAssessmentQuestionRequest
  ): Promise<AdminAssessmentQuestion> {

    return this.api.request<AdminAssessmentQuestion>(
      WrittenAssessmentEndpoints.updateQuestion(
        questionId
      ),
      {
        method: "PUT",

        body: request,
      }
    );
  }


  async deleteQuestion(
    questionId: string
  ): Promise<void> {

    await this.api.request<void>(
      WrittenAssessmentEndpoints.deleteQuestion(
        questionId
      ),
      {
        method: "DELETE",
      }
    );
  }


  // =======================================================
  // ADMIN
  // CHOICES
  // =======================================================

  async createChoice(
    request: CreateAssessmentChoiceRequest
  ): Promise<AdminAssessmentChoice> {

    return this.api.request<AdminAssessmentChoice>(
      WrittenAssessmentEndpoints.createChoice(),
      {
        method: "POST",

        body: request,
      }
    );
  }


  async updateChoice(
    choiceId: string,
    request: UpdateAssessmentChoiceRequest
  ): Promise<AdminAssessmentChoice> {

    return this.api.request<AdminAssessmentChoice>(
      WrittenAssessmentEndpoints.updateChoice(
        choiceId
      ),
      {
        method: "PUT",

        body: request,
      }
    );
  }


  async deleteChoice(
    choiceId: string
  ): Promise<void> {

    await this.api.request<void>(
      WrittenAssessmentEndpoints.deleteChoice(
        choiceId
      ),
      {
        method: "DELETE",
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // =======================================================

  async getParticipantAssessment(
    assessmentId: string
  ): Promise<ParticipantAssessment> {

    return this.api.request<ParticipantAssessment>(
      WrittenAssessmentEndpoints.getParticipantAssessment(
        assessmentId
      ),
      {
        method: "GET",
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // START ATTEMPT
  // =======================================================

  async startAttempt(
    writtenAssessmentId: string
  ): Promise<AssessmentAttempt> {

    return this.api.request<AssessmentAttempt>(
      WrittenAssessmentEndpoints.startAttempt(),
      {
        method: "POST",

        body: {
          writtenAssessmentId,
        },
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // GET ATTEMPT
  // =======================================================

  async getAttempt(
    attemptId: string
  ): Promise<AssessmentAttempt> {

    return this.api.request<AssessmentAttempt>(
      WrittenAssessmentEndpoints.getAttempt(
        attemptId
      ),
      {
        method: "GET",
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // SUBMIT ATTEMPT
  // =======================================================

  async submitAttempt(
    request: SubmitAssessmentRequest
  ): Promise<AssessmentResult> {

    return this.api.request<AssessmentResult>(
      WrittenAssessmentEndpoints.submitAttempt(),
      {
        method: "POST",

        body: request,
      }
    );
  }


  // =======================================================
  // PARTICIPANT
  // MY RESULTS
  // =======================================================

  async getMyResults(
    assessmentId: string
  ): Promise<AssessmentResult[]> {

    return this.api.request<AssessmentResult[]>(
      WrittenAssessmentEndpoints.getMyResults(
        assessmentId
      ),
      {
        method: "GET",
      }
    );
  }


  async getParticipantAssessmentsByBatch(
    trainingBatchId: string
  ): Promise<WrittenAssessment[]> {

    return this.api.request<WrittenAssessment[]>(
      WrittenAssessmentEndpoints.getParticipantAssessmentsByBatch(
        trainingBatchId
      ),
      {
        method: "GET",
      }
    );
  }




}