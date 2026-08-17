import { ApiClient } from "../api/client";
import { TrainerEndpoints } from "./trainer.endpoint";

import type {
  RegisterTrainerForm,
  TrainerApplicationDetails,
  TrainerApplicationResponse,
} from "@repo/types";

export class TrainerApi {
  constructor(
    private api: ApiClient
  ) {}

  // =====================================================
  // COMPLETE TRAINER PROFILE
  // =====================================================

  completeProfile(
    data: RegisterTrainerForm
  ) {
    const formData = new FormData();

    // ==========================================
    // PERSONAL
    // ==========================================

    formData.append(
      "FirstName",
      data.firstName
    );

    formData.append(
      "MiddleName",
      data.middleName ?? ""
    );

    formData.append(
      "LastName",
      data.lastName
    );

    formData.append(
      "DateOfBirth",
      data.dateOfBirth
    );

    formData.append(
      "Gender",
      data.gender
    );

    formData.append(
      "CivilStatus",
      data.civilStatus
    );

    // ==========================================
    // CONTACT
    // ==========================================

    formData.append(
      "MobileNumber",
      data.mobileNumber
    );

    formData.append(
      "HomeAddress",
      data.homeAddress
    );

    // ==========================================
    // PROFESSIONAL
    // ==========================================

    formData.append(
      "Expertise",
      data.expertise
    );

    formData.append(
      "YearsOfExperience",
      String(data.yearsOfExperience)
    );

    formData.append(
      "Organization",
      data.organization
    );

    formData.append(
      "Biography",
      data.biography
    );

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    if (
      data.profileImage instanceof File
    ) {
      formData.append(
        "ProfileImage",
        data.profileImage,
        data.profileImage.name
      );
    }

    // ==========================================
    // VALID ID
    // ==========================================

    if (
      data.validId instanceof File
    ) {
      formData.append(
        "ValidId",
        data.validId,
        data.validId.name
      );
    }

    // ==========================================
    // REQUEST
    // ==========================================

    return this.api.request<{
      message: string;
      trainer: unknown;
    }>(
      TrainerEndpoints.create,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  // =====================================================
  // GET ALL TRAINERS
  // =====================================================

  getAll() {
    return this.api.request<
      TrainerApplicationResponse[]
    >(
      TrainerEndpoints.list,
      {
        method: "GET",
      }
    );
  }

  

  // =====================================================
  // GET TRAINER BY ID
  // =====================================================

getById(
  id: string
) {
  return this.api.request<TrainerApplicationDetails>(
    TrainerEndpoints.byId(id)
  );
}

  // =====================================================
  // UPDATE
  // =====================================================

  update(
    id: string,
    data: RegisterTrainerForm
  ) {
    const formData = new FormData();

    // ==========================================
    // PERSONAL
    // ==========================================

    formData.append(
      "FirstName",
      data.firstName
    );

    formData.append(
      "MiddleName",
      data.middleName ?? ""
    );

    formData.append(
      "LastName",
      data.lastName
    );

    formData.append(
      "DateOfBirth",
      data.dateOfBirth
    );

    formData.append(
      "Gender",
      data.gender
    );

    formData.append(
      "CivilStatus",
      data.civilStatus
    );

    // ==========================================
    // CONTACT
    // ==========================================

    formData.append(
      "MobileNumber",
      data.mobileNumber
    );

    formData.append(
      "HomeAddress",
      data.homeAddress
    );

    // ==========================================
    // PROFESSIONAL
    // ==========================================

    formData.append(
      "Expertise",
      data.expertise
    );

    formData.append(
      "YearsOfExperience",
      String(data.yearsOfExperience)
    );

    formData.append(
      "Organization",
      data.organization
    );

    formData.append(
      "Biography",
      data.biography
    );

    // ==========================================
    // PROFILE IMAGE
    // ==========================================

    if (
      data.profileImage instanceof File
    ) {
      formData.append(
        "ProfileImage",
        data.profileImage,
        data.profileImage.name
      );
    }

    // ==========================================
    // VALID ID
    // ==========================================

    if (
      data.validId instanceof File
    ) {
      formData.append(
        "ValidId",
        data.validId,
        data.validId.name
      );
    }

    // ==========================================
    // REQUEST
    // ==========================================

    return this.api.request(
      TrainerEndpoints.update(id),
      {
        method: "PUT",
        body: formData,
      }
    );
  }

  // =====================================================
  // DELETE
  // =====================================================

  delete(id: string) {
    return this.api.request(
      TrainerEndpoints.delete(id),
      {
        method: "DELETE",
      }
    );
  }

  // =====================================================
  // ACTIVATE / DEACTIVATE
  // =====================================================

  changeStatus(
    id: string,
    isActive: boolean
  ) {
    return this.api.request(
      TrainerEndpoints.status(
        id,
        isActive
      ),
      {
        method: "PATCH",
      }
    );
  }

  // =====================================================
  // APPROVE / REJECT
  // =====================================================

  verify(
    id: string,
    isVerified: boolean
  ) {
    return this.api.request(
      TrainerEndpoints.verify(
        id,
        isVerified
      ),
      {
        method: "PATCH",
      }
    );
  }
}