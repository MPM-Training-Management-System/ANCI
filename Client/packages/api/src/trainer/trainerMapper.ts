import type {
  TrainerApplicationResponse,
  TrainerApplicationDetails,
} from "@repo/types";

export function mapTrainerApplication(
  trainer: TrainerApplicationResponse
): TrainerApplicationDetails {
  return {
    id: trainer.id,
    userId: trainer.userId,

    // Backend currently may not return this
    // so provide a safe fallback.
    userIdNumber:
      "",

    username:
      trainer.username,

    email:
      trainer.email,

    firstName:
      trainer.firstName,

    middleName:
      trainer.middleName,

    lastName:
      trainer.lastName,

    fullName:
      trainer.fullName ||
      [
        trainer.firstName,
        trainer.middleName,
        trainer.lastName,
      ]
        .filter(Boolean)
        .join(" "),

    dateOfBirth:
      trainer.dateOfBirth,

    gender:
      trainer.gender,

    civilStatus:
      trainer.civilStatus,

    mobileNumber:
      trainer.mobileNumber,

    homeAddress:
      trainer.homeAddress,

    expertise:
      trainer.expertise,

    yearsOfExperience:
      trainer.yearsOfExperience,

    organization:
      trainer.organization,

    biography:
      trainer.biography,

    profileImage:
      trainer.profileImage,

    validId:
      trainer.validId,

    role:
      "Trainer",

    isProfileCompleted:
      trainer.isProfileCompleted,

    isActive:
      trainer.isActive,

    isEmailVerified:
      trainer.isEmailVerified,

    status:
      mapApplicationStatus(
        trainer.applicationStatus
      ),

    policyStatus:
      mapPolicyStatus(
        trainer.policyStatus
      ),

    policyRemarks:
      trainer.policyRemarks,

    submittedAt:
      trainer.submittedAt ??
      trainer.createdAt,

    createdAt:
      trainer.createdAt,

    reviewedBy:
      null,

    reviewedAt:
      null,

    rejectionReason:
      null,

    emergencyContactName:
      null,

    emergencyRelationship:
      null,

    emergencyContactNumber:
      null,
  };
}

function mapApplicationStatus(
  value?: number
):
  | "Pending"
  | "Approved"
  | "Rejected" {
  switch (value) {
    case 1:
      return "Approved";

    case 2:
      return "Rejected";

    default:
      return "Pending";
  }
}

function mapPolicyStatus(
  value?: number
):
  | "Pending"
  | "Passed"
  | "Failed" {
  switch (value) {
    case 1:
      return "Passed";

    case 2:
      return "Failed";

    default:
      return "Pending";
  }
}