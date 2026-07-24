import { ApiClient } from "../client";
import { ParticipantEndpoints } from "./participant.endpoints";
import type { CreateParticipantRequest, Participant, UpdateParticipantRequest } from "@repo/types";

export class ParticipantApi {
  constructor(private api: ApiClient) {}

  getAll() {
    return this.api.request<Participant[]>(
      ParticipantEndpoints.list
    );
  }

  getById(id: number) {
    return this.api.request<Participant>(
      ParticipantEndpoints.byId(id)
    );
  }

  create(data: CreateParticipantRequest) {
    return this.api.request<Participant>(
      ParticipantEndpoints.create,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  update(id: number, data: UpdateParticipantRequest) {
    return this.api.request<Participant>(
      ParticipantEndpoints.update(id),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  delete(id: number) {
    return this.api.request<void>(
      ParticipantEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }
}