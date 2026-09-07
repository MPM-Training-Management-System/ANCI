import type {
  LearningMaterialProgress,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  LearningProgressEndpoints,
} from "./LearningProgressEndpoints";


// ============================================================
// LEARNING PROGRESS API
// ============================================================

export class LearningProgressApi {

  constructor(
    private readonly api: ApiClient,
  ) {}


  // =========================================================
  // GET MATERIAL PROGRESS
  //
  // GET /api/learning-progress/material/{materialId}
  //
  // Participant:
  // Returns the participant's progress for the
  // selected learning material.
  // =========================================================

  async getMaterialProgress(
    materialId: string,
  ): Promise<LearningMaterialProgress> {

    return this.api.request<LearningMaterialProgress>(
      LearningProgressEndpoints.getMaterialProgress(
        materialId,
      ),
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // COMPLETE SECTION
  //
  // POST /api/learning-progress/sections/{sectionId}/complete
  //
  // Participant:
  // Marks the selected section as read.
  // =========================================================

  async completeSection(
    sectionId: string,
  ): Promise<LearningMaterialProgress> {

    return this.api.request<LearningMaterialProgress>(
      LearningProgressEndpoints.completeSection(
        sectionId,
      ),
      {
        method: "POST",
      },
    );
  }
}