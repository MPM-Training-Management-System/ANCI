export interface IdValidationResponse {
  isValid: boolean;
  status: string;
  message: string;

  extractedText: string;
  extractedName: string;
  extractedDateOfBirth: string | null;

  idType: string;

  nameMatched: boolean;
  dateOfBirthMatched: boolean;
  idTypeMatched: boolean;

  needsAdminReview: boolean;
  role: string;
}