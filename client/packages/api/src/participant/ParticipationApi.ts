import {
  ApiClient,
} from "../api/client";

import {
  ParticipationEndpoints,
} from "./PracticalAssessmentEndpoints";

import type {
  ParticipationSetting,
  ParticipationParticipant,
  ParticipationProgress,
  ParticipationRecord,
  SaveParticipationSettingRequest,
  RecordParticipationRequest,
} from "@repo/types";

// =========================================================
// PARTICIPATION API
//
// Shared API client for:
// Admin Web
// Trainer Web
// Participant Mobile
//
// JSON serialization is handled by ApiClient.
// Do NOT JSON.stringify() request bodies here.
// =========================================================

export class ParticipationApi {

  constructor(
    private readonly api: ApiClient
  ) {}

  // =======================================================
  // ADMIN
  // PARTICIPATION SETTING
  // =======================================================

  async getSetting(
    trainingBatchId: string
  ): Promise<ParticipationSetting> {

    return this.api.request<ParticipationSetting>(
      ParticipationEndpoints.getSetting(
        trainingBatchId
      ),
      {
        method: "GET",
      }
    );
  }

  async saveSetting(
    trainingBatchId: string,
    request: SaveParticipationSettingRequest
  ): Promise<ParticipationSetting> {

    return this.api.request<ParticipationSetting>(
      ParticipationEndpoints.saveSetting(
        trainingBatchId
      ),
      {
        method: "PUT",

        body: request,
      }
    );
  }

  // =======================================================
  // TRAINER
  // SESSION PARTICIPANTS
  // =======================================================

  async getSessionParticipants(
    trainingSessionId: string
  ): Promise<ParticipationParticipant[]> {

    return this.api.request<ParticipationParticipant[]>(
      ParticipationEndpoints.getSessionParticipants(
        trainingSessionId
      ),
      {
        method: "GET",
      }
    );
  }

  // =======================================================
  // TRAINER
  // RECORD RECITATION
  // =======================================================

  async record(
    request: RecordParticipationRequest
  ): Promise<ParticipationRecord> {

    return this.api.request<ParticipationRecord>(
      ParticipationEndpoints.record(),
      {
        method: "POST",

        body: request,
      }
    );
  }

  // =======================================================
  // TRAINER
  // REMOVE RECITATION
  // =======================================================

  async remove(
    id: string
  ): Promise<void> {

    await this.api.request<void>(
      ParticipationEndpoints.remove(id),
      {
        method: "DELETE",
      }
    );
  }

  // =======================================================
  // PARTICIPANT
  // PARTICIPATION PROGRESS
  // =======================================================

  async getProgress(
    enrollmentId: string
  ): Promise<ParticipationProgress> {

    return this.api.request<ParticipationProgress>(
      ParticipationEndpoints.getProgress(
        enrollmentId
      ),
      {
        method: "GET",
      }
    );
  }
}