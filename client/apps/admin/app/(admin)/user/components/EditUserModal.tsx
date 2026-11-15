
"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from "@repo/ui/index";
import type {
  AdminUserDetails,
  UpdateAdminUserRequest,
} from "@repo/types";

type EditUserModalProps = {
  user: AdminUserDetails | null;
  isLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (request: UpdateAdminUserRequest) => Promise<void>;
};

export function EditUserModal({
  user,
  isLoading,
  isSaving,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [form, setForm] = useState<UpdateAdminUserRequest>({});

  useEffect(() => {
    if (!user) return;

    const profile = user.participantProfile ?? user.trainerProfile;

    setForm({
      email: user.email,
      mobileNumber: user.mobileNumber,
      firstName: profile?.firstName ?? null,
      middleName: profile?.middleName ?? null,
      lastName: profile?.lastName ?? null,
      birthDate: profile?.birthDate ?? null,
      address: profile?.address ?? null,
      gender: profile?.gender ?? null,

      highestEducationalAttainment:
        user.participantProfile?.highestEducationalAttainment ?? null,
      educationalStatus:
        user.participantProfile?.educationalStatus ?? null,
      schoolName: user.participantProfile?.schoolName ?? null,
      courseOrDegree: user.participantProfile?.courseOrDegree ?? null,
      fieldOfStudy: user.participantProfile?.fieldOfStudy ?? null,
      yearGraduated: user.participantProfile?.yearGraduated ?? null,

      employmentStatus: user.participantProfile?.employmentStatus ?? null,
      companyName: user.participantProfile?.companyName ?? null,
      jobTitle: user.participantProfile?.jobTitle ?? null,
      industry: user.participantProfile?.industry ?? null,
      yearsOfWorkExperience:
        user.participantProfile?.yearsOfWorkExperience ?? null,

      emergencyContactName:
        user.participantProfile?.emergencyContactName ?? null,
      emergencyContactNumber:
        user.participantProfile?.emergencyContactNumber ?? null,
      emergencyContactRelationship:
        user.participantProfile?.emergencyContactRelationship ?? null,

      specialization: user.trainerProfile?.specialization ?? null,
      bio: user.trainerProfile?.bio ?? null,
      yearsOfExperience: user.trainerProfile?.yearsOfExperience ?? null,
      isActive: user.trainerProfile?.isActive ?? null,
    });
  }, [user]);

  const updateField = <K extends keyof UpdateAdminUserRequest>(
    key: K,
    value: UpdateAdminUserRequest[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const textField = (
    label: string,
    key: keyof UpdateAdminUserRequest,
    type = "text",
  ) => (
    <InputField
      key={key}
      label={label}
      type={type}
      value={form[key] == null ? "" : String(form[key])}
      onChange={(value) => {
        if (key === "yearGraduated" || key === "yearsOfWorkExperience" ||
            key === "yearsOfExperience") {
          updateField(
            key,
            (value.trim() === "" ? null : Number(value)) as
              UpdateAdminUserRequest[typeof key],
          );
        } else {
          updateField(
            key,
            (value === "" && key !== "firstName" &&
              key !== "lastName" && key !== "email"
              ? null
              : value) as UpdateAdminUserRequest[typeof key],
          );
        }
      }}
    />
  );

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit User"
      description="Update account and profile information"
      size="lg"
      closeOnOverlayClick={!isSaving}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onSave(form)}
            disabled={isSaving || isLoading || !user}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : !user ? (
        <EmptyState message="User details are unavailable." />
      ) : (
        <div className="max-h-[65vh] space-y-5 overflow-y-auto overscroll-contain pr-1">
          <ProfileSection title="Basic Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {textField("First Name", "firstName")}
              {textField("Middle Name", "middleName")}
              {textField("Last Name", "lastName")}
              {textField("Email", "email", "email")}
              {textField("Mobile Number", "mobileNumber")}
              {textField("Birth Date", "birthDate", "date")}
              {textField("Gender", "gender")}
              {textField("Address", "address")}
            </div>
          </ProfileSection>

          {user.role === "Participant" && (
            <>
              <ProfileSection title="Educational Background">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {textField("Highest Educational Attainment", "highestEducationalAttainment")}
                  {textField("Educational Status", "educationalStatus")}
                  {textField("School Name", "schoolName")}
                  {textField("Course or Degree", "courseOrDegree")}
                  {textField("Field of Study", "fieldOfStudy")}
                  {textField("Year Graduated", "yearGraduated", "number")}
                </div>
              </ProfileSection>

              <ProfileSection title="Employment Information">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {textField("Employment Status", "employmentStatus")}
                  {textField("Company Name", "companyName")}
                  {textField("Job Title", "jobTitle")}
                  {textField("Industry", "industry")}
                  {textField("Years of Work Experience", "yearsOfWorkExperience", "number")}
                </div>
              </ProfileSection>

              <ProfileSection title="Emergency Contact">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {textField("Contact Name", "emergencyContactName")}
                  {textField("Contact Number", "emergencyContactNumber")}
                  {textField("Relationship", "emergencyContactRelationship")}
                </div>
              </ProfileSection>

              <ProfileSection title="Valid ID Information">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="ID Type"
                    value={user.participantProfile?.validIdType ?? ""}
                    onChange={() => {}}
                    disabled
                  />
                  <InputField
                    label="ID Number"
                    value={user.participantProfile?.validIdNumber ?? ""}
                    onChange={() => {}}
                    disabled
                  />
                </div>

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Uploaded Valid ID
                  </p>

                  {user.participantProfile?.validIdImageUrl ? (
                    <a
                      href={user.participantProfile.validIdImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full-size Valid ID"
                      className="block w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-400"
                    >
                      <img
                        src={user.participantProfile.validIdImageUrl}
                        alt={`Valid ID of ${user.fullName}`}
                        className="block max-h-[450px] min-h-40 w-full object-contain"
                      />
                    </a>
                  ) : (
                    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                      No Valid ID image available.
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Click the picture to view the full-size image.
                  </p>
                </div>
              </ProfileSection>
            </>
          )}

          {user.role === "Trainer" && (
            <ProfileSection title="Trainer Information">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {textField("Specialization", "specialization")}
                  {textField("Years of Experience", "yearsOfExperience", "number")}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Bio
                  </label>
                  <textarea
                    value={form.bio ?? ""}
                    onChange={(event) =>
                      updateField("bio", event.target.value || null)
                    }
                    rows={5}
                    placeholder="Trainer biography..."
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3">
                  <input
                    type="checkbox"
                    checked={form.isActive === true}
                    onChange={(event) =>
                      updateField("isActive", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Trainer profile is active
                  </span>
                </label>
              </div>
            </ProfileSection>
          )}
        </div>
      )}
    </Modal>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
