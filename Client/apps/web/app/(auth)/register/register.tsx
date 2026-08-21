"use client";

import { useState } from "react";

import {
  Button,
  Stepper,
} from "@repo/ui/index";

import type {
  RegisterTrainerForm,
} from "@repo/types";

import PersonalInfoForm from "./personal-info/PersonalInfoForm";
import ProfessionalForm from "./professional/ProfessionalForm";
import ProfileImageForm from "./profile-image/ProfileImageForm";
import ValidIdForm from "./valid-id/ValidIdForm";



// =====================================================
// STEPS
// =====================================================

const steps = [
  "Personal",
  "Professional",
  "Profile Image",
  "Valid ID",
];

// =====================================================
// COMPONENT
// =====================================================

export default function TrainerRegistration() {



  const [currentStep, setCurrentStep] =
    useState(1);


  const [loading, setLoading] =
    useState(false);

  // ===================================================
  // ERROR
  // ===================================================

  const [error, setError] =
    useState("");

  // ===================================================
  // TRAINER FORM
  // ===================================================

  const [form, setForm] =
    useState<RegisterTrainerForm>({
      firstName: "",
      middleName: "",
      lastName: "",

      dateOfBirth: "",
      gender: "",
      civilStatus: "",

      mobileNumber: "",
      homeAddress: "",

      expertise: "",
      yearsOfExperience: 0,
      organization: "",
      biography: "",

      profileImage: undefined,
      validId: undefined,
    });

  // ===================================================
  // UPDATE FORM
  // ===================================================

  const updateForm = (
    values: Partial<RegisterTrainerForm>
  ) => {
    setForm((previous) => ({
      ...previous,
      ...values,
    }));
  };

  // ===================================================
  // NEXT
  // ===================================================

  const handleNext = () => {
    setError("");

    setCurrentStep((previous) =>
      Math.min(
        previous + 1,
        steps.length
      )
    );
  };

  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {
    setError("");

    setCurrentStep((previous) =>
      Math.max(
        previous - 1,
        1
      )
    );
  };

  // ===================================================
  // FINAL SUBMIT
  // ===================================================

  const handleSubmit = async () => {

    setError("");

    // -----------------------------------------------
    // PERSONAL VALIDATION
    // -----------------------------------------------

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dateOfBirth ||
      !form.gender ||
      !form.civilStatus ||
      !form.mobileNumber.trim() ||
      !form.homeAddress.trim()
    ) {
      setError(
        "Please complete all personal information."
      );

      setCurrentStep(1);

      return;
    }

    // -----------------------------------------------
    // PROFESSIONAL VALIDATION
    // -----------------------------------------------

    if (
      !form.expertise.trim() ||
      form.yearsOfExperience < 0 ||
      !form.organization.trim() ||
      !form.biography.trim()
    ) {
      setError(
        "Please complete all professional information."
      );

      setCurrentStep(2);

      return;
    }

    // -----------------------------------------------
    // PROFILE IMAGE
    // -----------------------------------------------

    if (!form.profileImage) {
      setError(
        "Please upload your profile image."
      );

      setCurrentStep(3);

      return;
    }

    // -----------------------------------------------
    // VALID ID
    // -----------------------------------------------

    if (!form.validId) {
      setError(
        "Please upload your valid ID."
      );

      setCurrentStep(4);

      return;
    }

    // -----------------------------------------------
    // SUBMIT
    // -----------------------------------------------

    try {

      setLoading(true);

      console.log(
        "================================"
      );

      console.log(
        "FINAL TRAINER FORM"
      );

      console.log(form);

      console.log(
        "================================"
      );

    

      

      alert(
        "Trainer application submitted successfully."
      );

    } catch (error) {

      console.error(
        "TRAINER REGISTRATION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit trainer application."
      );

    } finally {

      setLoading(false);

    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="w-full space-y-8">

      {/* =================================================
          STEPPER
      ================================================= */}

      <Stepper
        currentStep={currentStep}
        steps={steps}
      />

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-700">
            Registration Error
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

        </div>
      )}

      {/* =================================================
          STEP 1
      ================================================= */}

      {currentStep === 1 && (
        <PersonalInfoForm
          form={form}
          updateForm={updateForm}
          onNext={handleNext}
        />
      )}

      {/* =================================================
          STEP 2
      ================================================= */}

      {currentStep === 2 && (
        <ProfessionalForm
          form={form}
          updateForm={updateForm}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {/* =================================================
          STEP 3
      ================================================= */}

      {currentStep === 3 && (
        <ProfileImageForm
          form={form}
          updateForm={updateForm}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {/* =================================================
          STEP 4
      ================================================= */}

      {currentStep === 4 && (
        <ValidIdForm
          form={form}
          updateForm={updateForm}
          onBack={handleBack}
          onSubmit={handleSubmit}
          loading={loading} userId={""}        />
      )}

    </div>
  );
}