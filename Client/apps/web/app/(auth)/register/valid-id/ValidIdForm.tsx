"use client";

import { useState } from "react";

import {
  FileCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { validateId } from "@repo/api";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/index";

import type {
  RegisterTrainerForm,
} from "@repo/types";

interface ValidIdFormProps {
  form: RegisterTrainerForm;

  updateForm: (
    values: Partial<RegisterTrainerForm>
  ) => void;

  userId: string;

  onBack: () => void;

  onSubmit: () => Promise<void>;

  loading: boolean;
}

// =======================================================
// ID TYPES
// =======================================================

const validIdTypes = [
  "Philippine Passport",
  "Driver's License",
  "National ID",
  "UMID",
  "SSS ID",
  "PhilHealth ID",
  "PRC ID",
  "Postal ID",
  "Voter's ID",
  "Other",
];

// =======================================================
// COMPONENT
// =======================================================

export default function ValidIdForm({
  form,
  updateForm,
  userId,
  onBack,
  onSubmit,
  loading,
}: ValidIdFormProps) {

  // =====================================================
  // ID TYPE
  // =====================================================

  const [idType, setIdType] = useState(
    form.validIdType ?? ""
  );

  // =====================================================
  // SELECTED FILE
  // =====================================================

  const [selectedFile, setSelectedFile] =
    useState<File | null>(
      form.validId instanceof File
        ? form.validId
        : null
    );

  // =====================================================
  // VALIDATION
  // =====================================================

  const [isValidating, setIsValidating] =
    useState(false);

  const [validationResult, setValidationResult] =
    useState<Awaited<
      ReturnType<typeof validateId>
    > | null>(null);

  const [validationError, setValidationError] =
    useState("");

  // =====================================================
  // FILE CHANGE
  // =====================================================

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // =================================================
    // ID TYPE
    // =================================================

    if (!idType) {
      alert(
        "Please select your ID type first."
      );

      event.target.value = "";

      return;
    }

    // =================================================
    // FILE TYPE
    // =================================================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please upload a JPG, JPEG, PNG, WebP, or PDF file."
      );

      event.target.value = "";

      return;
    }

    // =================================================
    // FILE SIZE
    // =================================================

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Valid ID must not exceed 10 MB."
      );

      event.target.value = "";

      return;
    }

    // =================================================
    // SAVE FILE
    // =================================================

    setSelectedFile(file);

    setValidationResult(null);
    setValidationError("");

    updateForm({
      validId: file,
      validIdType: idType,
    });

    event.target.value = "";
  }

  // =====================================================
  // ID TYPE CHANGE
  // =====================================================

  function handleIdTypeChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const value =
      event.target.value;

    setIdType(value);

    setValidationResult(null);
    setValidationError("");

    updateForm({
      validIdType: value,
    });
  }

  // =====================================================
  // REMOVE FILE
  // =====================================================

  function handleRemove() {
    setSelectedFile(null);

    setValidationResult(null);
    setValidationError("");

    updateForm({
      validId: undefined,
    });
  }

  // =====================================================
  // VALIDATE ID
  //
  // THIS HAPPENS AFTER APPLICATION SUBMISSION
  // =====================================================

  async function validateSubmittedId() {
    if (!selectedFile) {
      console.error(
        "ID VALIDATION: NO FILE"
      );

      return;
    }

    if (!idType) {
      console.error(
        "ID VALIDATION: NO ID TYPE"
      );

      return;
    }

    try {
      setIsValidating(true);

      setValidationError("");

      console.log(
        "================================"
      );

      console.log(
        "STARTING ID VALIDATION"
      );

      console.log(
        "FILE:",
        selectedFile.name
      );

      console.log(
        "FILE TYPE:",
        selectedFile.type
      );

      console.log(
        "FILE SIZE:",
        selectedFile.size
      );

      console.log(
        "ID TYPE:",
        idType
      );

      console.log(
        "================================"
      );

      // =================================================
      // CALL BACKEND
      // =================================================

      const response =
        await validateId(
          userId,
          selectedFile,
          idType
        );

      // =================================================
      // SAVE RESPONSE
      // =================================================

      setValidationResult(
        response
      );

      // =================================================
      // COMPLETE CONSOLE RESULT
      // =================================================

      console.log(
        "================================"
      );

      console.log(
        "ID VALIDATION RESULT"
      );

      console.log(
        "================================"
      );

      console.log(
        "FULL RESPONSE:",
        response
      );

      console.log(
        "IS VALID:",
        response.isValid
      );

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "MESSAGE:",
        response.message
      );

      console.log(
        "EXTRACTED TEXT:",
        response.extractedText
      );

      console.log(
        "EXTRACTED NAME:",
        response.extractedName
      );

      console.log(
        "EXTRACTED DATE OF BIRTH:",
        response.extractedDateOfBirth
      );

      console.log(
        "ID TYPE:",
        response.idType
      );

      console.log(
        "NAME MATCHED:",
        response.nameMatched
      );

      console.log(
        "DATE OF BIRTH MATCHED:",
        response.dateOfBirthMatched
      );

      console.log(
        "ID TYPE MATCHED:",
        response.idTypeMatched
      );

      console.log(
        "NEEDS ADMIN REVIEW:",
        response.needsAdminReview
      );

      console.log(
        "================================"
      );

      // =================================================
      // RESULT MESSAGE
      // =================================================

      if (response.isValid) {
        console.log(
          "✅ VALID ID"
        );

        console.log(
          "ID information successfully matched."
        );
      } else if (
        response.needsAdminReview
      ) {
        console.log(
          "⚠️ ID REQUIRES ADMIN REVIEW"
        );
      } else {
        console.log(
          "❌ ID VALIDATION FAILED"
        );
      }

    } catch (error) {
      console.error(
        "================================"
      );

      console.error(
        "ID VALIDATION ERROR"
      );

      console.error(
        error
      );

      console.error(
        "================================"
      );

      setValidationError(
        error instanceof Error
          ? error.message
          : "ID validation failed."
      );

    } finally {
      setIsValidating(false);
    }
  }

  // =====================================================
  // SUBMIT APPLICATION
  //
  // IMPORTANT:
  //
  // APPLICATION IS SUBMITTED FIRST.
  //
  // AFTER THAT:
  // validateSubmittedId()
  // =====================================================

  async function handleSubmit() {
    // =================================================
    // BASIC CHECKS
    // =================================================

    if (!idType) {
      alert(
        "Please select your valid ID type."
      );

      return;
    }

    if (!selectedFile) {
      alert(
        "Please upload your valid ID."
      );

      return;
    }

    try {
      console.log(
        "================================"
      );

      console.log(
        "SUBMIT APPLICATION"
      );

      console.log(
        "================================"
      );

      // =================================================
      // 1. EXISTING APPLICATION SUBMISSION
      // =================================================

      await onSubmit();

      console.log(
        "================================"
      );

      console.log(
        "APPLICATION SUBMITTED SUCCESSFULLY"
      );

      console.log(
        "NOW STARTING ID VALIDATION"
      );

      console.log(
        "================================"
      );

      // =================================================
      // 2. VALIDATE ID AFTER SUBMISSION
      // =================================================

      await validateSubmittedId();

    } catch (error) {
      console.error(
        "================================"
      );

      console.error(
        "APPLICATION SUBMISSION ERROR"
      );

      console.error(
        error
      );

      console.error(
        "================================"
      );
    }
  }

  // =====================================================
  // BUSY
  // =====================================================

  const isBusy =
    loading ||
    isValidating;

  // =====================================================
  // UI
  // =====================================================

  return (
    <Card className="w-full">

      {/* =================================================
          HEADER
      ================================================= */}

      <CardHeader
        className="
          border-b
          bg-slate-50/60
          pb-8
        "
      >

        <div className="mb-2">
          <span
            className="
              inline-flex
              items-center
              rounded-full
              bg-slate-100
              px-3
              py-1
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-teal-700
            "
          >
            Step 4
          </span>
        </div>

        <CardTitle
          className="
            text-3xl
            font-bold
          "
        >
          Valid ID
        </CardTitle>

        <CardDescription
          className="
            mt-2
            max-w-lg
            leading-6
          "
        >
          Upload a clear copy of your
          government-issued valid ID.
          Your application will be
          submitted first, then the
          system will automatically
          validate the ID.
        </CardDescription>

      </CardHeader>

      {/* =================================================
          CONTENT
      ================================================= */}

      <CardContent className="pt-8">

        <div className="space-y-6">

          {/* =================================================
              ID TYPE
          ================================================= */}

          <div>

            <label
              className="
                mb-2
                block
                text-sm
                font-medium
              "
            >
              ID Type
            </label>

            <select
              value={idType}
              onChange={
                handleIdTypeChange
              }
              disabled={isBusy}
              className="
                h-10
                w-full
                rounded-md
                border
                border-input
                bg-background
                px-3
                text-sm
              "
            >

              <option value="">
                Select ID type
              </option>

              {validIdTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

          </div>

          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <div
            className="
              rounded-xl
              border-2
              border-dashed
              border-slate-300
              bg-slate-50
              p-8
            "
          >

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
              "
            >

              {/* FILE ICON */}

              {selectedFile ? (

                <div className="relative">

                  <div
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-2xl
                      bg-primary/10
                    "
                  >

                    <FileCheck
                      className="
                        h-12
                        w-12
                        text-primary
                      "
                    />

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleRemove
                    }
                    disabled={isBusy}
                    className="
                      absolute
                      -right-2
                      -top-2
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-red-500
                      text-white
                      shadow
                      hover:bg-red-600
                    "
                  >

                    <X
                      className="
                        h-4
                        w-4
                      "
                    />

                  </button>

                </div>

              ) : (

                <div
                  className="
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-200
                  "
                >

                  <FileCheck
                    className="
                      h-12
                      w-12
                      text-slate-400
                    "
                  />

                </div>

              )}

              {/* =================================================
                  CHOOSE FILE
              ================================================= */}

              <label
                className={
                  isBusy
                    ? "mt-6 cursor-not-allowed"
                    : "mt-6 cursor-pointer"
                }
              >

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-md
                    bg-primary
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:opacity-90
                  "
                >
                  {selectedFile
                    ? "Change Valid ID"
                    : "Choose Valid ID"}
                </span>

                <input
                  type="file"
                  accept="
                    image/jpeg,
                    image/png,
                    image/webp,
                    application/pdf
                  "
                  className="hidden"
                  onChange={
                    handleFileChange
                  }
                  disabled={isBusy}
                />

              </label>

              <p
                className="
                  mt-3
                  text-center
                  text-xs
                  text-slate-500
                "
              >
                Accepted formats:
                JPG, JPEG, PNG, WebP, PDF
              </p>

              <p
                className="
                  mt-1
                  text-center
                  text-xs
                  text-slate-400
                "
              >
                Maximum file size:
                10 MB
              </p>

            </div>

          </div>

          {/* =================================================
              SELECTED FILE
          ================================================= */}

          {selectedFile && (

            <div
              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                p-4
              "
            >

              <p
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Selected ID
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Type:{" "}

                <span
                  className="
                    font-medium
                    text-slate-700
                  "
                >
                  {idType}
                </span>
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  text-slate-500
                "
              >
                File:
                {" "}
                {selectedFile.name}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Size:
                {" "}
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}
                {" "}
                MB
              </p>

            </div>

          )}

          {/* =================================================
              VALIDATION ERROR
          ================================================= */}

          {validationError && (

            <div
              className="
                flex
                gap-3
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
              "
            >

              <AlertTriangle
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-red-600
                "
              />

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-red-700
                  "
                >
                  ID Validation Failed
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-red-600
                  "
                >
                  {validationError}
                </p>

              </div>

            </div>

          )}

          {/* =================================================
              VALIDATION RESULT
          ================================================= */}

          {validationResult && (

            <div
              className={
                validationResult.isValid
                  ? `
                    rounded-xl
                    border
                    border-green-200
                    bg-green-50
                    p-5
                  `
                  : validationResult.needsAdminReview
                    ? `
                      rounded-xl
                      border
                      border-amber-200
                      bg-amber-50
                      p-5
                    `
                    : `
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      p-5
                    `
              }
            >

              <div className="flex gap-3">

                {validationResult.isValid ? (

                  <CheckCircle2
                    className="
                      h-6
                      w-6
                      shrink-0
                      text-green-600
                    "
                  />

                ) : (

                  <AlertTriangle
                    className="
                      h-6
                      w-6
                      shrink-0
                      text-amber-600
                    "
                  />

                )}

                <div>

                  <p
                    className={
                      validationResult.isValid
                        ? `
                          font-bold
                          text-green-800
                        `
                        : validationResult.needsAdminReview
                          ? `
                            font-bold
                            text-amber-800
                          `
                          : `
                            font-bold
                            text-red-800
                          `
                    }
                  >

                    {validationResult.isValid
                      ? "ID Successfully Verified"
                      : validationResult.needsAdminReview
                        ? "ID Requires Admin Review"
                        : "ID Validation Failed"}

                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-600
                    "
                  >
                    {validationResult.message}
                  </p>

                </div>

              </div>

              {/* =================================================
                  MATCH DETAILS
              ================================================= */}

              <div
                className="
                  mt-5
                  space-y-3
                  border-t
                  border-slate-200/70
                  pt-4
                "
              >

                <ValidationRow
                  label="Name"
                  matched={
                    validationResult.nameMatched
                  }
                />

                <ValidationRow
                  label="Date of Birth"
                  matched={
                    validationResult.dateOfBirthMatched
                  }
                />

                <ValidationRow
                  label="ID Type"
                  matched={
                    validationResult.idTypeMatched
                  }
                />

              </div>

              {/* =================================================
                  EXTRACTED INFORMATION
              ================================================= */}

              <div
                className="
                  mt-5
                  border-t
                  border-slate-200/70
                  pt-4
                "
              >

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  OCR Result
                </p>

                <div
                  className="
                    mt-3
                    space-y-2
                    text-sm
                  "
                >

                  <p>
                    <span className="font-semibold">
                      Extracted Name:
                    </span>
                    {" "}
                    {validationResult.extractedName ||
                      "Not detected"}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Extracted DOB:
                    </span>
                    {" "}
                    {validationResult.extractedDateOfBirth ||
                      "Not detected"}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Detected ID Type:
                    </span>
                    {" "}
                    {validationResult.idType ||
                      "Not detected"}
                  </p>

                </div>

              </div>

              {/* =================================================
                  ADMIN REVIEW
              ================================================= */}

              {validationResult.needsAdminReview && (

                <div
                  className="
                    mt-4
                    rounded-lg
                    bg-white/70
                    p-3
                    text-xs
                    text-amber-700
                  "
                >
                  The application has already been
                  submitted. The ID did not fully match
                  the registered information and will
                  require administrator review.
                </div>

              )}

            </div>

          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              flex
              justify-between
              border-t
              border-slate-200
              pt-6
            "
          >

            {/* BACK */}

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isBusy}
            >
              Back
            </Button>

            {/* SUBMIT APPLICATION */}

            <Button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={
                isBusy ||
                !selectedFile ||
                !idType
              }
            >

              {loading ? (

                <>
                  <Loader2
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Submitting...

                </>

              ) : isValidating ? (

                <>
                  <Loader2
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Verifying ID...

                </>

              ) : (

                "Submit Application"

              )}

            </Button>

          </div>

        </div>

      </CardContent>

    </Card>
  );
}

// =======================================================
// VALIDATION ROW
// =======================================================

function ValidationRow({
  label,
  matched,
}: {
  label: string;
  matched: boolean;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        text-sm
      "
    >

      <span className="text-slate-600">
        {label}
      </span>

      <span
        className={
          matched
            ? `
              font-semibold
              text-green-600
            `
            : `
              font-semibold
              text-red-600
            `
        }
      >
        {matched
          ? "Matched"
          : "Not Matched"}
      </span>

    </div>
  );
}