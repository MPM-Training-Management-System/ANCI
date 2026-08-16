"use client";

import { useState } from "react";
import { FileCheck, X } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/index";

import type { RegisterTrainerForm } from "@repo/types";

interface ValidIdFormProps {
  form: RegisterTrainerForm;

  updateForm: (
    values: Partial<RegisterTrainerForm>
  ) => void;

  onBack: () => void;

  onSubmit: () => void;

  loading: boolean;
}

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

export default function ValidIdForm({
  form,
  updateForm,
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
  // ACTUAL BROWSER FILE
  // =====================================================

  const [selectedFile, setSelectedFile] =
    useState<File | null>(
      form.validId instanceof File
        ? form.validId
        : null
    );

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
    // ID TYPE REQUIRED
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
    // IMPORTANT
    // SAVE THE REAL FILE
    // =================================================

    setSelectedFile(file);

    updateForm({
      validId: file,
      validIdType: idType,
    });

    // Allow same file to be selected again
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

    updateForm({
      validIdType: value,
    });
  }

  // =====================================================
  // REMOVE FILE
  // =====================================================

  function handleRemove() {
    setSelectedFile(null);

    updateForm({
      validId: undefined,
    });
  }



  function handleSubmit() {
    if (!idType) {
      alert(
        "Please select your valid ID type."
      );

      return;
    }

    if (!(selectedFile instanceof File)) {
      alert(
        "Please upload your valid ID."
      );

      return;
    }

    onSubmit();
  }


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

        <CardTitle className="text-3xl font-bold">
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
              disabled={loading}
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
                    disabled={loading}
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
                    <X className="h-4 w-4" />
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

              {/* CHOOSE FILE */}

              <label className="mt-6 cursor-pointer">

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
                  disabled={loading}
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
                Maximum file size: 10 MB
              </p>

            </div>
          </div>

          {/* =================================================
              SELECTED FILE
          ================================================= */}

          {selectedFile instanceof File && (
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
                <span className="font-medium text-slate-700">
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
                File: {selectedFile.name}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                Size:{" "}
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
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
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              Back
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                !(selectedFile instanceof File) ||
                !idType
              }
            >
              {loading
                ? "Submitting..."
                : "Submit Application"}
            </Button>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}