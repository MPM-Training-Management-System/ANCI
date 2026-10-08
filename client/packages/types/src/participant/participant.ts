export interface ParticipantProfile {
  id: string;
  userId: string;
  userCode: string;

  fullName: string;
  email: string;

  firstName: string;
  middleName: string;
  lastName: string;

  mobileNumber: string;
  birthDate: string;
  address: string;
  gender: string;

  profileImageUrl: string;

  role: string;
  status: string;
}

export interface UpdateParticipantProfile {
  firstName: string;
  middleName: string;
  lastName: string;
  mobileNumber: string;
  birthDate: string;
  address: string;
  gender: string;
}

/**
 * Image selected from Expo ImagePicker.
 *
 * This is different from browser File.
 */
export interface ParticipantProfileImage {
  uri: string;
  name: string;
  type: string;
}