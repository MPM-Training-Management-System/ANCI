import { ApiClient } from "../api/client";
import { ParticipantEndpoints } from "./participant.endpoints";

import type {
  RegisterParticipantRequest,
  Participant,
  UpdateParticipantRequest,
} from "@repo/types";

export class ParticipantApi {
  constructor(private api: ApiClient) {}

  // =====================================================
  // GET ALL
  // =====================================================

  getAll() {
    return this.api.request<Participant[]>(
      ParticipantEndpoints.list
    );
  }

  // =====================================================
  // GET ALL PARTICIPANTS
  // =====================================================

  getAllparticipant() {
    return this.api.request<Participant[]>(
      ParticipantEndpoints.listParticpant
    );
  }

  // =====================================================
  // GET BY ID
  // =====================================================

  getById(id: number) {
    return this.api.request<Participant>(
      ParticipantEndpoints.byId(id)
    );
  }

  // =====================================================
  // REGISTER PARTICIPANT
  // =====================================================

  register(data: RegisterParticipantRequest) {
    const formData = new FormData();

    // =================================================
    // ACCOUNT EMAIL
    // =================================================

    formData.append(
      "Email",
      data.email
    );

    // =================================================
    // PERSONAL INFORMATION
    // =================================================

    formData.append(
      "FirstName",
      data.FirstName
    );

    if (data.MiddleName) {
      formData.append(
        "MiddleName",
        data.MiddleName
      );
    }

    formData.append(
      "LastName",
      data.LastName
    );

    formData.append(
      "DateOfBirth",
      data.DateOfBirth
    );

    formData.append(
      "Gender",
      data.Gender
    );

    formData.append(
      "CivilStatus",
      data.CivilStatus
    );

    formData.append(
      "MobileNumber",
      data.MobileNumber
    );

    formData.append(
      "HomeAddress",
      data.HomeAddress
    );

    // =================================================
    // EMERGENCY CONTACT
    // =================================================

    if (data.EmergencyContactName) {
      formData.append(
        "EmergencyContactName",
        data.EmergencyContactName
      );
    }

    if (data.EmergencyRelationship) {
      formData.append(
        "EmergencyRelationship",
        data.EmergencyRelationship
      );
    }

    if (data.EmergencyContactNumber) {
      formData.append(
        "EmergencyContactNumber",
        data.EmergencyContactNumber
      );
    }

    // =================================================
    // PROFILE IMAGE
    // React Native / Expo
    // =================================================

    if (data.profileImage) {
      const imageUri = data.profileImage;

      const filename =
        imageUri.split("/").pop() ||
        "profile.jpg";

      const extension =
        filename.split(".").pop()?.toLowerCase();

      let mimeType = "image/jpeg";

      if (extension === "png") {
        mimeType = "image/png";
      } else if (extension === "webp") {
        mimeType = "image/webp";
      }

      formData.append(
        "ProfileImage",
        {
          uri: imageUri,
          name: filename,
          type: mimeType,
        } as any
      );
    }

    // =================================================
    // DEBUG
    // =================================================

    console.log(
      "REGISTER PARTICIPANT FORM DATA"
    );

    console.log({
      email: data.email,
      FirstName: data.FirstName,
      MiddleName: data.MiddleName,
      LastName: data.LastName,
      DateOfBirth: data.DateOfBirth,
      Gender: data.Gender,
      CivilStatus: data.CivilStatus,
      MobileNumber: data.MobileNumber,
      HomeAddress: data.HomeAddress,
      EmergencyContactName:
        data.EmergencyContactName,
      EmergencyRelationship:
        data.EmergencyRelationship,
      EmergencyContactNumber:
        data.EmergencyContactNumber,
      ProfileImage:
        data.profileImage,
    });

    // =================================================
    // API REQUEST
    // =================================================

    return this.api.request<Participant>(
      ParticipantEndpoints.create,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(
    id: number,
    data: UpdateParticipantRequest
  ) {
    return this.api.request<Participant>(
      ParticipantEndpoints.update(id),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  // =====================================================
  // DELETE
  // =====================================================

  delete(id: number) {
    return this.api.request<void>(
      ParticipantEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }
}