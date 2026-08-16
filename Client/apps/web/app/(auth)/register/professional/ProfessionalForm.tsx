"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "@repo/ui/index";

import type {
  RegisterTrainerForm,
} from "@repo/types";

// =====================================================
// PROPS
// =====================================================

interface ProfessionalFormProps {
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

export default function ProfessionalForm({
  form,
  updateForm,
  onNext,
  onBack,
}: ProfessionalFormProps) {

  // ===================================================
  // SUBMIT
  // ===================================================

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formData =
      new FormData(event.currentTarget);

    // ===============================================
    // SAVE PROFESSIONAL INFORMATION
    // ===============================================

    updateForm({
      expertise: String(
        formData.get("expertise") ?? ""
      ),

      yearsOfExperience: Number(
        formData.get("yearsOfExperience") ?? 0
      ),

      organization: String(
        formData.get("organization") ?? ""
      ),

      biography: String(
        formData.get("biography") ?? ""
      ),
    });

    // ===============================================
    // GO TO STEP 3
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
            Step 2
          </span>

        </div>

        <CardTitle className="text-3xl font-bold">
          Professional Information
        </CardTitle>

        <CardDescription
          className="
            mt-2
            max-w-lg
            leading-6
          "
        >
          Tell us about your professional background,
          expertise, and experience as a trainer.
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
              EXPERTISE
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
              Expertise
            </label>

            <Input
              name="expertise"
              placeholder="e.g. Roll Ball Training"
              defaultValue={
                form.expertise
              }
              required
            />

            <p className="mt-1 text-xs text-slate-400">
              Specify your primary training expertise.
            </p>

          </div>

          {/* =================================================
              EXPERIENCE + ORGANIZATION
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
            "
          >

            {/* YEARS OF EXPERIENCE */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Years of Experience
              </label>

              <Input
                type="number"
                name="yearsOfExperience"
                min={0}
                placeholder="0"
                defaultValue={
                  form.yearsOfExperience
                }
                required
              />

            </div>

            {/* ORGANIZATION */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Organization
              </label>

              <Input
                name="organization"
                placeholder="Organization / Association"
                defaultValue={
                  form.organization
                }
                required
              />

            </div>

          </div>

          {/* =================================================
              BIOGRAPHY
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
              Biography
            </label>

            <Textarea
              name="biography"
              placeholder="
Tell us about your training background,
achievements, experience, and professional expertise.
              "
              defaultValue={
                form.biography
              }
              rows={7}
              required
            />

            <p className="mt-1 text-xs text-slate-400">
              Provide a short professional background
              that can be used on your trainer profile.
            </p>

          </div>

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

            {/* NEXT */}

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