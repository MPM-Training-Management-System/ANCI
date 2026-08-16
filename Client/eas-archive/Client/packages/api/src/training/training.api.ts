import { ApiClient } from "../api/client";
import { TrainingEndpoints } from "./training.endpoint";
import type { Training } from "@repo/types";

export class TrainingApi {
  constructor(
    private api: ApiClient
  ) {}

  getAll() {
    return this.api.get<Training[]>(
      TrainingEndpoints.list
    );
  }

  getById(id: number) {
    return this.api.get<Training>(
      TrainingEndpoints.byId(id)
    );
  }
}