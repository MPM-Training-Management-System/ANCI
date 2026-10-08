import {
  ApiClient,
} from "../api/client";

import {
  ParticipantProfileEndpoints,
} from "./participant.endpoints";

import type {
  ParticipantProfile,
  ParticipantProfileImage,
  UpdateParticipantProfile,
} from "@repo/types";

export interface UpdateParticipantProfileResponse {
  message: string;
  profile: ParticipantProfile;
}

export class ParticipantProfileApi {
  constructor(
    private readonly api: ApiClient
  ) {}

  async getMyProfile(): Promise<ParticipantProfile> {
    return this.api.request<ParticipantProfile>(
      ParticipantProfileEndpoints.getMyProfile(),
      {
        method: "GET",
      }
    );
  }

  async updateMyProfile(
    request: UpdateParticipantProfile
  ): Promise<UpdateParticipantProfileResponse> {
    return this.api.request<UpdateParticipantProfileResponse>(
      ParticipantProfileEndpoints.updateMyProfile(),
      {
        method: "PUT",
        body: request,
      }
    );
  }

  async updateProfileImage(
    profileImage: ParticipantProfileImage
  ): Promise<UpdateParticipantProfileResponse> {
    const formData = new FormData();

    formData.append(
      "ProfileImage",
      {
        uri: profileImage.uri,
        name: profileImage.name,
        type: profileImage.type,
      } as any
    );

    return this.api.request<UpdateParticipantProfileResponse>(
      ParticipantProfileEndpoints.updateProfileImage(),
      {
        method: "PUT",
        body: formData,
      }
    );
  }
}