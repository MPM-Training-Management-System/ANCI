import type {
  IdValidationResponse,
} from "@repo/types";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "http://192.168.137.1:5296";

export interface MobileValidIdFile {
  uri?: string;
  name?: string;
  type?: string;
  idType?: string;
}

export async function validateId(
  userId: string,
  file: MobileValidIdFile,
  idType: string
): Promise<IdValidationResponse> {

  console.log(
    "================================"
  );

  console.log(
    "VALIDATING VALID ID"
  );

  console.log(
    "USER ID:",
    userId
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
    "API:",
    `${API_URL}/api/id-validation/validate`
  );

  console.log(
    "================================"
  );

  if (!userId) {
    throw new Error(
      "User ID is required for ID validation."
    );
  }

  if (!file?.uri) {
    throw new Error(
      "Valid ID file is missing."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "UserId",
    userId
  );

  formData.append(
    "File",
    {
      uri: file.uri,
      name:
        file.name ||
        "valid-id.jpg",
      type:
        file.type ||
        "image/jpeg",
    } as any
  );

  formData.append(
    "IdType",
    idType
  );

  const response =
    await fetch(
      `${API_URL}/api/id-validation/validate`,
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",
        },

        body: formData,
      }
    );

  const text =
    await response.text();

  let data: any = {};

  try {
    data =
      text
        ? JSON.parse(text)
        : {};
  } catch {
    data = {
      message: text,
    };
  }

  console.log(
    "================================"
  );

  console.log(
    "ID VALIDATION RESPONSE"
  );

  console.log(
    "HTTP STATUS:",
    response.status
  );

  console.log(
    "RESPONSE:",
    data
  );

  console.log(
    "================================"
  );

  if (!response.ok) {
    throw new Error(
      data?.message ??
        "ID validation failed."
    );
  }

  return data as IdValidationResponse;
}