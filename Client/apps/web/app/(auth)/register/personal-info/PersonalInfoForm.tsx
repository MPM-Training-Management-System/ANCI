"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui/index";

import type {
  RegisterTrainerForm,
} from "@repo/types";

// =====================================================
// PROPS
// =====================================================

interface PersonalInfoFormProps {

  form: RegisterTrainerForm;

  updateForm: (
    values: Partial<RegisterTrainerForm>
  ) => void;

  onNext: () => void;
}

// =====================================================
// COMPONENT
// =====================================================

export default function PersonalInfoForm({
  form,
  updateForm,
  onNext,
}: PersonalInfoFormProps) {

  // ===================================================
  // SUBMIT
  // ===================================================

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    const formData =
      new FormData(
        event.currentTarget
      );

    // ===============================================
    // SAVE PERSONAL INFORMATION
    // ===============================================

    updateForm({

      firstName:
        String(
          formData.get("firstName") ?? ""
        ),

      middleName:
        String(
          formData.get("middleName") ?? ""
        ),

      lastName:
        String(
          formData.get("lastName") ?? ""
        ),

      dateOfBirth:
        String(
          formData.get("dateOfBirth") ?? ""
        ),

      gender:
        String(
          formData.get("gender") ?? ""
        ),

      civilStatus:
        String(
          formData.get("civilStatus") ?? ""
        ),

      mobileNumber:
        String(
          formData.get("mobileNumber") ?? ""
        ),

      homeAddress:
        String(
          formData.get("homeAddress") ?? ""
        ),
    });

    // ===============================================
    // GO TO STEP 2
    // ===============================================

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
            Step 1
          </span>

        </div>

        <CardTitle className="text-3xl font-bold">
          Personal Information
        </CardTitle>

        <CardDescription
          className="
            mt-2
            max-w-lg
            leading-6
          "
        >
          Please provide your personal information
          to complete your trainer profile.
        </CardDescription>

      </CardHeader>

      {/* =================================================
          CONTENT
      ================================================= */}

      <CardContent className="pt-8">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              NAME
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-3
            "
          >

            {/* FIRST NAME */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                First Name
              </label>

              <Input
                name="firstName"
                placeholder="Juan"
                defaultValue={
                  form.firstName
                }
                required
              />

            </div>

            {/* MIDDLE NAME */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Middle Name
              </label>

              <Input
                name="middleName"
                placeholder="Santos"
                defaultValue={
                  form.middleName ?? ""
                }
              />

            </div>

            {/* LAST NAME */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Last Name
              </label>

              <Input
                name="lastName"
                placeholder="Dela Cruz"
                defaultValue={
                  form.lastName
                }
                required
              />

            </div>

          </div>

          {/* =================================================
              DATE OF BIRTH + GENDER
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >

            {/* DATE OF BIRTH */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Date of Birth
              </label>

              <Input
                type="date"
                name="dateOfBirth"
                defaultValue={
                  form.dateOfBirth
                }
                required
              />

            </div>

            {/* GENDER */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Gender
              </label>

              <select
                name="gender"
                defaultValue={
                  form.gender
                }
                required
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
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              CIVIL STATUS + MOBILE
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >

            {/* CIVIL STATUS */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Civil Status
              </label>

              <select
                name="civilStatus"
                defaultValue={
                  form.civilStatus
                }
                required
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
                  Select civil status
                </option>

                <option value="Single">
                  Single
                </option>

                <option value="Married">
                  Married
                </option>

                <option value="Widowed">
                  Widowed
                </option>

                <option value="Separated">
                  Separated
                </option>

              </select>

            </div>

            {/* MOBILE */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Mobile Number
              </label>

              <Input
                type="tel"
                name="mobileNumber"
                placeholder="09XXXXXXXXX"
                defaultValue={
                  form.mobileNumber
                }
                required
              />

            </div>

          </div>

          {/* =================================================
              HOME ADDRESS
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
              Home Address
            </label>

            <Input
              name="homeAddress"
              placeholder="Complete home address"
              defaultValue={
                form.homeAddress
              }
              required
            />

          </div>

          {/* =================================================
              ACTION
          ================================================= */}

          <div
            className="
              flex
              justify-end
              border-t
              border-slate-200
              pt-6
            "
          >

            <Button
              type="submit"
            >
              Continue
            </Button>

          </div>

        </form>

      </CardContent>

    </Card>
  );
}