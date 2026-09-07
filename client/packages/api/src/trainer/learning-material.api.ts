import type {
  CreateLearningMaterialRequest,
  CreateLearningModuleRequest,
  CreateLearningSectionRequest,
  LearningMaterial,
  LearningMaterialExtraction,
  LearningModule,
  LearningSection,
  UpdateLearningMaterialRequest,
  UpdateLearningModuleRequest,
  UpdateLearningSectionRequest,
} from "@repo/types";

import {
  ApiClient,
} from "../api/client";

import {
  LearningMaterialEndpoints,
} from "./LearningMaterialEndpoints";


// ============================================================
// LEARNING MATERIAL API
// ============================================================

export class LearningMaterialApi {

  constructor(
    private readonly api: ApiClient,
  ) {}


  // =========================================================
  // GET LEARNING MATERIALS BY BATCH
  // GET /api/learning-materials/batch/{batchId}
  // =========================================================

  async getByBatchId(
    batchId: string,
  ): Promise<LearningMaterial[]> {

    return this.api.request<LearningMaterial[]>(
      LearningMaterialEndpoints.listByBatch(batchId),
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // GET LEARNING MATERIAL BY ID
  // GET /api/learning-materials/{id}
  // =========================================================

  async getById(
    id: string,
  ): Promise<LearningMaterial> {

    return this.api.request<LearningMaterial>(
      LearningMaterialEndpoints.byId(id),
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // CREATE LEARNING MATERIAL
  // POST /api/learning-materials
  // =========================================================

  async create(
    request: CreateLearningMaterialRequest,
  ): Promise<LearningMaterial> {

    return this.api.request<LearningMaterial>(
      LearningMaterialEndpoints.create,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // ApiClient already stringifies the body.
        body: request,
      },
    );
  }


  // =========================================================
  // UPDATE LEARNING MATERIAL
  // PUT /api/learning-materials/{id}
  // =========================================================

  async update(
    id: string,
    request: UpdateLearningMaterialRequest,
  ): Promise<LearningMaterial> {

    return this.api.request<LearningMaterial>(
      LearningMaterialEndpoints.update(id),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        // ApiClient already stringifies the body.
        body: request,
      },
    );
  }


  // =========================================================
  // DELETE LEARNING MATERIAL
  // DELETE /api/learning-materials/{id}
  // =========================================================

  async delete(
    id: string,
  ): Promise<void> {

    await this.api.request<void>(
      LearningMaterialEndpoints.delete(id),
      {
        method: "DELETE",
      },
    );
  }


  // =========================================================
  // PUBLISH LEARNING MATERIAL
  // PUT /api/learning-materials/{id}/publish
  // =========================================================

  async publish(
    id: string,
  ): Promise<LearningMaterial> {

    return this.api.request<LearningMaterial>(
      LearningMaterialEndpoints.publish(id),
      {
        method: "PUT",
      },
    );
  }


  // =========================================================
  // UPLOAD LEARNING MATERIAL FILE
  // POST /api/learning-materials/{id}/upload
  // =========================================================

  async uploadFile(
    id: string,
    file: File,
  ): Promise<LearningMaterial> {

    const formData =
      new FormData();

    formData.append(
      "File",
      file,
    );

    return this.api.request<LearningMaterial>(
      LearningMaterialEndpoints.uploadFile(id),
      {
        method: "POST",

        body: formData,
      },
    );
  }


  // =========================================================
  // EXTRACT TEXT
  // POST /api/learning-materials/{id}/extract
  // =========================================================

  async extractText(
    id: string,
  ): Promise<LearningMaterialExtraction> {

    return this.api.request<LearningMaterialExtraction>(
      LearningMaterialEndpoints.extractText(id),
      {
        method: "POST",
      },
    );
  }


  // =========================================================
  // GENERATE MODULES
  // POST /api/learning-materials/{id}/generate-modules
  // =========================================================

  async generateModules(
    id: string,
  ): Promise<LearningModule[]> {

    return this.api.request<LearningModule[]>(
      LearningMaterialEndpoints.generateModules(id),
      {
        method: "POST",
      },
    );
  }


  // =========================================================
  // GET MODULES
  // GET /api/learning-materials/{id}/modules
  // =========================================================

  async getModules(
    learningMaterialId: string,
  ): Promise<LearningModule[]> {

    return this.api.request<LearningModule[]>(
      LearningMaterialEndpoints.modules(
        learningMaterialId,
      ),
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // CREATE MODULE
  // POST /api/learning-materials/modules
  // =========================================================

  async createModule(
    request: CreateLearningModuleRequest,
  ): Promise<LearningModule> {

    return this.api.request<LearningModule>(
      LearningMaterialEndpoints.createModule,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: request,
      },
    );
  }


  // =========================================================
  // UPDATE MODULE
  // PUT /api/learning-materials/modules/{moduleId}
  // =========================================================

  async updateModule(
    moduleId: string,
    request: UpdateLearningModuleRequest,
  ): Promise<LearningModule> {

    return this.api.request<LearningModule>(
      LearningMaterialEndpoints.updateModule(
        moduleId,
      ),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: request,
      },
    );
  }


  // =========================================================
  // DELETE MODULE
  // DELETE /api/learning-materials/modules/{moduleId}
  // =========================================================

  async deleteModule(
    moduleId: string,
  ): Promise<void> {

    await this.api.request<void>(
      LearningMaterialEndpoints.deleteModule(
        moduleId,
      ),
      {
        method: "DELETE",
      },
    );
  }


  // =========================================================
  // GET SECTIONS
  // GET /api/learning-materials/modules/{moduleId}/sections
  // =========================================================

  async getSections(
    moduleId: string,
  ): Promise<LearningSection[]> {

    return this.api.request<LearningSection[]>(
      LearningMaterialEndpoints.sections(
        moduleId,
      ),
      {
        method: "GET",
      },
    );
  }


  // =========================================================
  // CREATE SECTION
  // POST /api/learning-materials/sections
  // =========================================================

  async createSection(
    request: CreateLearningSectionRequest,
  ): Promise<LearningSection> {

    return this.api.request<LearningSection>(
      LearningMaterialEndpoints.createSection,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: request,
      },
    );
  }


  // =========================================================
  // UPDATE SECTION
  // PUT /api/learning-materials/sections/{sectionId}
  // =========================================================

  async updateSection(
    sectionId: string,
    request: UpdateLearningSectionRequest,
  ): Promise<LearningSection> {

    return this.api.request<LearningSection>(
      LearningMaterialEndpoints.updateSection(
        sectionId,
      ),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: request,
      },
    );
  }


  // =========================================================
  // DELETE SECTION
  // DELETE /api/learning-materials/sections/{sectionId}
  // =========================================================

  async deleteSection(
    sectionId: string,
  ): Promise<void> {

    await this.api.request<void>(
      LearningMaterialEndpoints.deleteSection(
        sectionId,
      ),
      {
        method: "DELETE",
      },
    );
  }
}