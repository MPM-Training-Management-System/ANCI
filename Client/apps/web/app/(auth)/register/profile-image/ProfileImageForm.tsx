"use client";

import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

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

// =====================================================
// PROPS
// =====================================================

interface ProfileImageFormProps {
  form: RegisterTrainerForm;

  updateForm: (
    values: Partial<RegisterTrainerForm>
  ) => void;

  onNext: () => void;

  onBack: () => void;
}

// =====================================================
// COMPONENT
// =====================================================

export default function ProfileImageForm({
  form,
  updateForm,
  onNext,
  onBack,
}: ProfileImageFormProps) {

  // ===================================================
  // PREVIEW
  // ===================================================

  const [preview, setPreview] =
    useState<string | null>(null);

  // ===================================================
  // CREATE IMAGE PREVIEW
  // ===================================================

  useEffect(() => {

    if (!form.profileImage) {
      setPreview(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(
        form.profileImage
      );

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };

  }, [form.profileImage]);

  // ===================================================
  // FILE CHANGE
  // ===================================================

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // -----------------------------------------------
    // VALIDATE FILE TYPE
    // -----------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {

      alert(
        "Please select a JPG, PNG, or WebP image."
      );

      event.target.value = "";

      return;
    }

    // -----------------------------------------------
    // VALIDATE FILE SIZE
    // -----------------------------------------------

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {

      alert(
        "Profile image must not exceed 5 MB."
      );

      event.target.value = "";

      return;
    }

    // -----------------------------------------------
    // SAVE TO PARENT FORM
    // -----------------------------------------------

    updateForm({
      profileImage: file,
    });

  }

  // ===================================================
  // REMOVE IMAGE
  // ===================================================

  function handleRemove() {

    updateForm({
      profileImage: undefined,
    });

    setPreview(null);
  }

  // ===================================================
  // CONTINUE
  // ===================================================

  function handleContinue() {

    if (!form.profileImage) {

      alert(
        "Please upload your profile image."
      );

      return;
    }

    onNext();
  }

  // ===================================================
  // UI
  // ===================================================

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
            Step 3
          </span>

        </div>

        <CardTitle className="text-3xl font-bold">
          Profile Image
        </CardTitle>

        <CardDescription
          className="
            mt-2
            max-w-lg
            leading-6
          "
        >
          Upload a clear and recent profile photo
          that will be used on your trainer profile.
        </CardDescription>

      </CardHeader>

      {/* =================================================
          CONTENT
      ================================================= */}

      <CardContent className="pt-8">

        <div className="space-y-6">

          {/* =================================================
              UPLOAD AREA
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

              {/* =================================================
                  IMAGE PREVIEW
              ================================================= */}

              {preview ? (

                <div className="relative">

                  <img
                    src={preview}
                    alt="Profile preview"
                    className="
                      h-48
                      w-48
                      rounded-full
                      border-4
                      border-white
                      object-cover
                      shadow
                    "
                  />

                  {/* REMOVE */}

                  <button
                    type="button"
                    onClick={handleRemove}
                    className="
                      absolute
                      right-0
                      top-0
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-red-500
                      text-white
                      shadow
                      transition
                      hover:bg-red-600
                    "
                    aria-label="Remove profile image"
                  >

                    <X className="h-5 w-5" />

                  </button>

                </div>

              ) : (

                /* =================================================
                    EMPTY PREVIEW
                ================================================= */

                <div
                  className="
                    flex
                    h-48
                    w-48
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-200
                  "
                >

                  <ImagePlus
                    className="
                      h-14
                      w-14
                      text-slate-400
                    "
                  />

                </div>

              )}

              {/* =================================================
                  FILE INPUT
              ================================================= */}

              <label
                className="
                  mt-6
                  cursor-pointer
                "
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
                    transition
                    hover:opacity-90
                  "
                >
                  {form.profileImage
                    ? "Change Image"
                    : "Choose Profile Image"}
                </span>

                <input
                  type="file"
                  accept="
                    image/jpeg,
                    image/png,
                    image/webp
                  "
                  className="hidden"
                  onChange={
                    handleFileChange
                  }
                />

              </label>

              {/* =================================================
                  HELP TEXT
              ================================================= */}

              <p
                className="
                  mt-3
                  text-center
                  text-xs
                  text-slate-500
                "
              >
                Accepted formats: JPG, PNG, WebP
              </p>

              <p
                className="
                  mt-1
                  text-center
                  text-xs
                  text-slate-400
                "
              >
                Maximum file size: 5 MB.
              </p>

            </div>

          </div>

          {/* =================================================
              SELECTED FILE
          ================================================= */}

          {form.profileImage && (

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
                Selected file
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  text-slate-500
                "
              >
                {form.profileImage.name}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                "
              >
                {(
                  form.profileImage.size /
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

            {/* BACK */}

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
            >
              Back
            </Button>

            {/* CONTINUE */}

            <Button
              type="button"
              onClick={handleContinue}
            >
              Continue
            </Button>

          </div>

        </div>

      </CardContent>

    </Card>
  );
}