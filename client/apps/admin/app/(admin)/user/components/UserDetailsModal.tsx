
"use client";

import * as React from "react";

import type {
  AdminUserDetails,
  UserRole,
  UserStatus,
} from "@repo/types";

import { Modal } from "@repo/ui/index";

export function UserDetailsModal({
  user,
  isLoading,
  onClose,
}: {
  user: AdminUserDetails | null;
  isLoading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={isLoading || user !== null}
      onClose={onClose}
      title="User Details"
      description="Account and profile information"
      size="lg"
      closeOnOverlayClick={true}
    >
      {isLoading ? (
        <LoadingState />
      ) : !user ? (
        <EmptyState message="User details are unavailable." />
      ) : (
        <div className="space-y-5">
          {/* USER HEADER */}

          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <Avatar
              name={user.fullName}
              imageUrl={
                user.participantProfile?.profileImageUrl ??
                user.trainerProfile?.profileImageUrl ??
                null
              }
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {user.fullName}
                </h3>

                <RoleBadge role={user.role} />

                <StatusBadge status={user.status} />
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {user.userCode}
              </p>
            </div>
          </div>

          {/* ACCOUNT INFORMATION */}

          <ProfileSection title="Account Information">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Info label="Email" value={user.email} />

              <Info
                label="Mobile Number"
                value={user.mobileNumber || "Not specified"}
              />

              <Info label="Role" value={user.role} />

              <Info label="Status" value={user.status} />

              <Info
                label="Email Verification"
                value={
                  user.isEmailVerified
                    ? "Verified"
                    : "Not verified"
                }
              />

              <Info
                label="Created"
                value={formatDate(user.createdAt)}
              />

              <Info
                label="Updated"
                value={formatDate(user.updatedAt)}
              />
            </div>
          </ProfileSection>

          {/* PARTICIPANT PROFILE */}

          {user.participantProfile && (
            <ProfileSection title="Participant Profile">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <Info
                  label="First Name"
                  value={
                    user.participantProfile.firstName ||
                    "Not specified"
                  }
                />

                <Info
                  label="Middle Name"
                  value={
                    user.participantProfile.middleName ||
                    "Not specified"
                  }
                />

                <Info
                  label="Last Name"
                  value={
                    user.participantProfile.lastName ||
                    "Not specified"
                  }
                />

                <Info
                  label="Birth Date"
                  value={
                    user.participantProfile.birthDate
                      ? formatDate(
                          user.participantProfile.birthDate
                        )
                      : "Not specified"
                  }
                />

                <Info
                  label="Gender"
                  value={
                    user.participantProfile.gender ||
                    "Not specified"
                  }
                />

                <Info
                  label="Address"
                  value={
                    user.participantProfile.address ||
                    "Not specified"
                  }
                />
              </div>
            </ProfileSection>
          )}

          {/* TRAINER PROFILE */}

          {user.trainerProfile && (
            <ProfileSection title="Trainer Profile">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <Info
                  label="First Name"
                  value={
                    user.trainerProfile.firstName ||
                    "Not specified"
                  }
                />

                <Info
                  label="Middle Name"
                  value={
                    user.trainerProfile.middleName ||
                    "Not specified"
                  }
                />

                <Info
                  label="Last Name"
                  value={
                    user.trainerProfile.lastName ||
                    "Not specified"
                  }
                />

                <Info
                  label="Specialization"
                  value={
                    user.trainerProfile.specialization ||
                    "Not specified"
                  }
                />

                <Info
                  label="Years of Experience"
                  value={
                    user.trainerProfile.yearsOfExperience != null
                      ? String(
                          user.trainerProfile.yearsOfExperience
                        )
                      : "Not specified"
                  }
                />

                <Info
                  label="Trainer Active"
                  value={
                    user.trainerProfile.isActive ? "Yes" : "No"
                  }
                />

                <Info
                  label="Gender"
                  value={
                    user.trainerProfile.gender ||
                    "Not specified"
                  }
                />

                <Info
                  label="Birth Date"
                  value={
                    user.trainerProfile.birthDate
                      ? formatDate(user.trainerProfile.birthDate)
                      : "Not specified"
                  }
                />

                <Info
                  label="Activated At"
                  value={
                    user.trainerProfile.activatedAt
                      ? formatDate(user.trainerProfile.activatedAt)
                      : "Not specified"
                  }
                />
              </div>

              {user.trainerProfile.bio && (
                <div className="mt-5 border-t border-gray-200 pt-5">
                  <Info
                    label="Bio"
                    value={user.trainerProfile.bio}
                  />
                </div>
              )}

              <div className="mt-5 border-t border-gray-200 pt-5">
                <Info
                  label="Address"
                  value={
                    user.trainerProfile.address ||
                    "Not specified"
                  }
                />
              </div>
            </ProfileSection>
          )}
        </div>
      )}

      {/* FOOTER */}

      <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* =================================================================
   PROFILE SECTION
================================================================= */

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
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

/* =================================================================
   INFO
================================================================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm leading-5 text-gray-700">
        {value}
      </p>
    </div>
  );
}

/* =================================================================
   AVATAR
================================================================= */

function Avatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

/* =================================================================
   ROLE BADGE
================================================================= */

function RoleBadge({ role }: { role: UserRole }) {
  let className =
    "border-gray-200 bg-gray-50 text-gray-600";

  if (role === "Participant") {
    className =
      "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (role === "Trainer") {
    className =
      "border-purple-100 bg-purple-50 text-purple-700";
  }

  if (role === "Admin") {
    className =
      "border-gray-200 bg-gray-100 text-gray-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}
    >
      {role}
    </span>
  );
}

/* =================================================================
   STATUS BADGE
================================================================= */

function StatusBadge({ status }: { status: UserStatus }) {
  let className =
    "border-gray-200 bg-gray-50 text-gray-600";

  if (status === "Active" || status === "Approved") {
    className =
      "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    className =
      "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (status === "Rejected") {
    className =
      "border-red-100 bg-red-50 text-red-700";
  }

  if (status === "Suspended") {
    className =
      "border-orange-100 bg-orange-50 text-orange-700";
  }

  if (status === "Inactive") {
    className =
      "border-gray-200 bg-gray-50 text-gray-500";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${className}`}
    >
      {status}
    </span>
  );
}

/* =================================================================
   LOADING STATE
================================================================= */

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

/* =================================================================
   EMPTY STATE
================================================================= */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

/* =================================================================
   HELPERS
================================================================= */

function getInitials(name: string) {
  if (!name) return "?";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

function formatDate(value: string) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
