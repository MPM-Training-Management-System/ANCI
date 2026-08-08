import { ApiClient } from "../api/client";
import { ParticipantEndpoints } from "./participant.endpoints";
import type { RegisterParticipantRequest, Participant, UpdateParticipantRequest } from "@repo/types";

export class ParticipantApi {
  constructor(private api: ApiClient) {}

  getAll() {
    return this.api.request<Participant[]>(
      ParticipantEndpoints.list
    );
  }

  getAllparticipant() {
    return this.api.request<Participant[]>(
      ParticipantEndpoints.listParticpant
    );
  }

  getById(id: number) {
    return this.api.request<Participant>(
      ParticipantEndpoints.byId(id)
    );
  }

  register(data: RegisterParticipantRequest) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob);
    }
  });

  return this.api.request<Participant>(
    ParticipantEndpoints.create,
    {
      method: "POST",
      body: formData,
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