import { auth } from "@/api/auth";

export interface IdValidationResponse {
  isValid: boolean;

  status: string;

  message: string;

  extractedText: string;

  extractedName: string;

  extractedDateOfBirth:
    | string
    | null;

  idType: string;

  nameMatched: boolean;

  dateOfBirthMatched: boolean;

  idTypeMatched: boolean;

  needsAdminReview: boolean;
}

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "http://192.168.137.1:5296";

export interface MobileValidIdFile {
  uri: string;
  name: string;
  type: string;
  idType: string;
}

export async function validateId(
  file: MobileValidIdFile,
  idType: string
): Promise<IdValidationResponse> {

  // =====================================================
  // TOKEN
  // =====================================================

  const token =
    await auth.getToken();

  if (!token) {
    throw new Error(
      "You are not authenticated."
    );
  }

  // =====================================================
  // FORM DATA
  // =====================================================

  const formData =
    new FormData();

  // =====================================================
  // FILE
  // =====================================================

  formData.append(
    "File",
    {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any
  );

  // =====================================================
  // ID TYPE
  // =====================================================

  formData.append(
    "IdType",
    idType
  );

  // =====================================================
  // LOG
  // =====================================================

  console.log(
    "================================"
  );

  console.log(
    "VALIDATING VALID ID"
  );

  console.log(
    "FILE:",
    file.name
  );

  console.log(
    "ID TYPE:",
    idType
  );

  console.log(
    "================================"
  );

  // =====================================================
  // REQUEST
  // =====================================================

  const response =
    await fetch(
      `${API_URL}/api/id-validation/validate`,
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      }
    );

  // =====================================================
  // RESPONSE
  // =====================================================

  const data =
    await response.json();

  console.log(
    "ID VALIDATION RESPONSE:",
    data
  );

  // =====================================================
  // ERROR
  // =====================================================

  if (!response.ok) {
    throw new Error(
      data?.message ??
        "ID validation failed."
    );
  }

  // =====================================================
  // SUCCESS
  // =====================================================

  return data;
}