"use client";

import {
  useState,
  type FormEvent,
} from "react";
import type {
  TrainerNotificationSettings,
  TrainerPreferenceSettings,
  
  TrainerSystemSettings,
} from "./type";
import { TrainerProfile } from "@repo/types";
import { useTrainerMe } from "@repo/hooks";
import { trainerApi } from "@/lib/api";

export default function TrainerSettingsPage() {
 const {
  profile,
  isLoading,
  error,
  refetch
 } = useTrainerMe(trainerApi)



  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [
    notifications,
    setNotifications,
  ] =
    useState<TrainerNotificationSettings>({
      assignmentAlerts: true,
      scheduleAlerts: true,
      attendanceAlerts: true,
      assessmentAlerts: true,
      announcementAlerts: true,
      emailNotifications: true,
    });

  /* =======================================================
     TRAINER PREFERENCES
  ======================================================= */

  const [
    preferences,
    setPreferences,
  ] =
    useState<TrainerPreferenceSettings>({
      availability: "Available",
      preferredSession: "Morning",
      defaultAttendanceMode: "Manual",
      allowParticipantMessages: true,
      showProfileToParticipants: true,
    });

  /* =======================================================
     SYSTEM
  ======================================================= */

  const [
    systemSettings,
    setSystemSettings,
  ] =
    useState<TrainerSystemSettings>({
      timezone: "Asia/Manila",
      dateFormat: "MMM DD, YYYY",
      language: "English",
    });



  const [
    profileModal,
    setProfileModal,
  ] = useState(false);

  const [
    passwordModal,
    setPasswordModal,
  ] = useState(false);

  const [
    logoutModal,
    setLogoutModal,
  ] = useState(false);



  const [saved, setSaved] =
    useState(false);

    if (isLoading) {
  return (
    <main className="flex min-h-[400px] items-center justify-center">
      <p className="text-sm text-gray-500">
        Loading trainer profile...
      </p>
    </main>
  );
}

console.log(profile);

if (error) {
  return (
    <main className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <p className="text-sm font-semibold text-red-600">
        Failed to load trainer profile.
      </p>

      <button
        type="button"
        onClick={refetch}
        className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white"
      >
        Try Again
      </button>
    </main>
  );
}

if (!profile) {
  return (
    <main className="flex min-h-[400px] items-center justify-center">
      <p className="text-sm text-gray-500">
        Trainer profile not found.
      </p>
    </main>
  );
}

  function showSaved() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  /* =======================================================
     NOTIFICATION TOGGLE
  ======================================================= */

  function toggleNotification(
    key: keyof TrainerNotificationSettings,
  ) {
    setNotifications(
      (current) => ({
        ...current,
        [key]: !current[key],
      }),
    );

    showSaved();
  }

  /* =======================================================
     PREFERENCE TOGGLE
  ======================================================= */

  function togglePreference(
    key:
      | "allowParticipantMessages"
      | "showProfileToParticipants",
  ) {
    setPreferences(
      (current) => ({
        ...current,
        [key]: !current[key],
      }),
    );

    showSaved();
  }

  /* =======================================================
     PROFILE SAVE
  ======================================================= */

  function handleProfileSave(
    updated: TrainerProfile,
  ) {
    
    setProfileModal(false);
    showSaved();
  }

  /* =======================================================
     PASSWORD SAVE
  ======================================================= */

  function handlePasswordSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordModal(false);
    showSaved();
  }
  
  
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 pb-12">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gray-100 blur-3xl" />

        <div className="relative">

          <div className="mb-3 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-gray-900" />

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              Trainer Portal
            </span>

          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Manage your trainer profile,
                notifications, availability,
                training preferences, and
                account security.
              </p>

            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">

              

              <div>

                <p className="text-sm font-bold text-gray-900">
                  {profile.firstName}{" "}
                  {profile.lastName}
                </p>

                <p className="mt-0.5 text-[10px] text-gray-500">
                  {profile.userCode}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
            ✓
          </div>

          <div>

            <p className="text-xs font-bold text-emerald-800">
              Changes saved
            </p>

            <p className="text-[10px] text-emerald-600">
              Your trainer settings have been updated.
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          PROFILE + SECURITY
      ======================================= ========== */}

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

        {/* PROFILE */}

        <SettingsCard
          eyebrow="Account"
          title="Trainer Profile"
          description="Your trainer identity and professional information."
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
  {profile.profileImageUrl ? (
    <img
      src={profile.profileImageUrl}
      alt={profile.fullName ?? "Trainer Profile"}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-500">
      {(profile.fullName ?? "?")
        .charAt(0)
        .toUpperCase()}
    </div>
  )}
</div>

            <div className="min-w-0 flex-1">

              <h3 className="text-lg font-bold text-gray-900">
                {profile.fullName}{" "}
                {profile.lastName}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {profile.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-600">
                  Trainer
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                  Active
                </span>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setProfileModal(true)
              }
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Edit Profile
            </button>

          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            <InfoBox
              label="Trainer ID"
              value={profile.userCode}
            />

            <InfoBox
              label="Specialization"
              value={
                profile.specialization
              }
            />

          </div>

        </SettingsCard>

        {/* SECURITY */}

        <SettingsCard
          eyebrow="Security"
          title="Account Security"
          description="Protect your trainer account and personal information."
        >

          <div className="space-y-3">

            <button
              type="button"
              onClick={() =>
                setPasswordModal(true)
              }
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
            >

              <div>

                <p className="text-xs font-bold text-gray-900">
                  Change Password
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Update your account password
                </p>

              </div>

              <span className="text-lg text-gray-300">
                →
              </span>

            </button>

            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">

              <div>

                <p className="text-xs font-bold text-gray-900">
                  Two-Factor Authentication
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Add additional protection to your account
                </p>

              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-[9px] font-bold text-amber-600">
                Not Enabled
              </span>

            </div>

          </div>

        </SettingsCard>

      </section>

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      <SettingsCard
        eyebrow="Preferences"
        title="Notifications"
        description="Choose which trainer events should generate notifications."
      >

        <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">

          <SettingToggle
            title="Training Assignments"
            description="Notify me when I am assigned to a training program."
            enabled={
              notifications.assignmentAlerts
            }
            onChange={() =>
              toggleNotification(
                "assignmentAlerts",
              )
            }
          />

          <SettingToggle
            title="Schedule Alerts"
            description="Notify me about upcoming training schedules and changes."
            enabled={
              notifications.scheduleAlerts
            }
            onChange={() =>
              toggleNotification(
                "scheduleAlerts",
              )
            }
          />

          <SettingToggle
            title="Attendance Alerts"
            description="Notify me about attendance records and missing submissions."
            enabled={
              notifications.attendanceAlerts
            }
            onChange={() =>
              toggleNotification(
                "attendanceAlerts",
              )
            }
          />

          <SettingToggle
            title="Assessment Alerts"
            description="Notify me when assessment results or evaluations require attention."
            enabled={
              notifications.assessmentAlerts
            }
            onChange={() =>
              toggleNotification(
                "assessmentAlerts",
              )
            }
          />

          <SettingToggle
            title="Announcements"
            description="Receive important announcements from administrators."
            enabled={
              notifications.announcementAlerts
            }
            onChange={() =>
              toggleNotification(
                "announcementAlerts",
              )
            }
          />

          <SettingToggle
            title="Email Notifications"
            description="Receive trainer notifications through email."
            enabled={
              notifications.emailNotifications
            }
            onChange={() =>
              toggleNotification(
                "emailNotifications",
              )
            }
          />

        </div>

      </SettingsCard>

      {/* =================================================
          TRAINER PREFERENCES
      ================================================= */}

      <SettingsCard
        eyebrow="Trainer Preferences"
        title="Training Preferences"
        description="Configure your availability and default training behavior."
      >

        <div className="grid gap-6 lg:grid-cols-2">

          {/* AVAILABILITY */}

          <div className="space-y-4">

            <SelectSetting
              label="Availability Status"
              value={
                preferences.availability
              }
              options={[
                "Available",
                "Limited Availability",
                "Unavailable",
              ]}
              onChange={(value) => {
                setPreferences(
                  (current) => ({
                    ...current,
                    availability:
                      value,
                  }),
                );

                showSaved();
              }}
            />

            <SelectSetting
              label="Preferred Training Session"
              value={
                preferences.preferredSession
              }
              options={[
                "Morning",
                "Afternoon",
                "Evening",
                "Any Session",
              ]}
              onChange={(value) => {
                setPreferences(
                  (current) => ({
                    ...current,
                    preferredSession:
                      value,
                  }),
                );

                showSaved();
              }}
            />

            <SelectSetting
              label="Default Attendance Mode"
              value={
                preferences.defaultAttendanceMode
              }
              options={[
                "Manual",
                "QR Code",
                "Biometric",
              ]}
              onChange={(value) => {
                setPreferences(
                  (current) => ({
                    ...current,
                    defaultAttendanceMode:
                      value,
                  }),
                );

                showSaved();
              }}
            />

          </div>

          {/* TRAINER VISIBILITY */}

          <div>

            <SettingToggle
              title="Participant Messages"
              description="Allow participants enrolled in your training to send you messages."
              enabled={
                preferences.allowParticipantMessages
              }
              onChange={() =>
                togglePreference(
                  "allowParticipantMessages",
                )
              }
            />

            <SettingToggle
              title="Show Trainer Profile"
              description="Allow participants to view your trainer profile and specialization."
              enabled={
                preferences.showProfileToParticipants
              }
              onChange={() =>
                togglePreference(
                  "showProfileToParticipants",
                )
              }
            />

          </div>

        </div>

      </SettingsCard>

      {/* =================================================
          PROFESSIONAL INFORMATION
      ================================================= */}

      <SettingsCard
        eyebrow="Professional"
        title="Trainer Information"
        description="Information used by the training management system when assigning programs."
      >

        <div className="grid gap-4 md:grid-cols-3">

          <InfoBox
            label="Trainer ID"
            value={profile.userCode}
          />

          <InfoBox
            label="Specialization"
            value={
              profile.specialization
            }
          />

          <InfoBox
            label="Current Status"
            value="Active"
            success
          />

        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Assignment Note
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-600">
            Your specialization and availability
            are used by administrators when assigning
            you to training programs. Keep this
            information updated to ensure appropriate
            training assignments.
          </p>

        </div>

      </SettingsCard>

      {/* =================================================
          SYSTEM PREFERENCES
      ================================================= */}

      <SettingsCard
        eyebrow="System"
        title="System Preferences"
        description="Configure how information is displayed in your trainer portal."
      >

        <div className="grid gap-4 md:grid-cols-3">

          <SelectSetting
            label="Timezone"
            value={
              systemSettings.timezone
            }
            options={[
              "Asia/Manila",
              "Asia/Singapore",
              "Asia/Tokyo",
              "UTC",
            ]}
            onChange={(value) => {
              setSystemSettings(
                (current) => ({
                  ...current,
                  timezone: value,
                }),
              );

              showSaved();
            }}
          />

          <SelectSetting
            label="Date Format"
            value={
              systemSettings.dateFormat
            }
            options={[
              "MMM DD, YYYY",
              "DD/MM/YYYY",
              "MM/DD/YYYY",
              "YYYY-MM-DD",
            ]}
            onChange={(value) => {
              setSystemSettings(
                (current) => ({
                  ...current,
                  dateFormat: value,
                }),
              );

              showSaved();
            }}
          />

          <SelectSetting
            label="Language"
            value={
              systemSettings.language
            }
            options={[
              "English",
              "Filipino",
            ]}
            onChange={(value) => {
              setSystemSettings(
                (current) => ({
                  ...current,
                  language: value,
                }),
              );

              showSaved();
            }}
          />

        </div>

      </SettingsCard>

      {/* =================================================
          SESSION
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-2">

        <SettingsCard
          eyebrow="Session"
          title="Current Session"
          description="Information about your current trainer session."
        >

          <div className="space-y-3">

            <InfoRow
              label="Signed in as"
              value={profile.email}
            />

            <InfoRow
              label="Trainer ID"
              value={profile.userCode}
            />

            <InfoRow
              label="Role"
              value="Trainer"
            />

            <InfoRow
              label="Session status"
              value="Active"
              success
            />

          </div>

        </SettingsCard>

        <SettingsCard
          eyebrow="Information"
          title="Portal Information"
          description="Current ANCI trainer portal information."
        >

          <div className="grid gap-3 sm:grid-cols-2">

            <InfoBox
              label="Application"
              value="ANCI Training Management"
            />

            <InfoBox
              label="Portal"
              value="Trainer Portal"
            />

            <InfoBox
              label="Version"
              value="1.0.0"
            />

            <InfoBox
              label="Environment"
              value="Production"
            />

          </div>

        </SettingsCard>

      </section>

      {/* =================================================
          DANGER ZONE
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">

        <div className="border-b border-red-100 bg-red-50/50 px-5 py-4">

          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
            Account
          </p>

          <h2 className="mt-1 text-base font-bold text-red-900">
            Sign Out
          </h2>

          <p className="mt-1 text-xs text-red-600">
            End your current trainer portal session.
          </p>

        </div>

        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-bold text-gray-900">
              Sign out of trainer portal
            </p>

            <p className="mt-1 text-xs text-gray-500">
              You will need to sign in again to access
              your trainer account.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setLogoutModal(true)
            }
            className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
          >
            Sign Out
          </button>

        </div>

      </section>

      {/* =================================================
          PROFILE MODAL
      ================================================= */}

      {profileModal && (
        <ProfileModal
          profile={profile}
          onClose={() =>
            setProfileModal(false)
          }
          onSave={handleProfileSave}
        />
      )}

      {/* =================================================
          PASSWORD MODAL
      ================================================= */}

      {passwordModal && (
        <PasswordModal
          onClose={() =>
            setPasswordModal(false)
          }
          onSave={
            handlePasswordSave
          }
        />
      )}

      {/* =================================================
          LOGOUT MODAL
      ================================================= */}

      {logoutModal && (
        <ConfirmModal
          title="Sign out?"
          description="You will be signed out of the ANCI trainer portal and will need to sign in again."
          confirmText="Sign Out"
          onClose={() =>
            setLogoutModal(false)
          }
          onConfirm={() => {
            setLogoutModal(false);

            // Replace with your actual auth logout:
            // await auth.logout();

            window.location.href =
              "/login";
          }}
        />
      )}

    </main>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-base font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>

      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 border-b border-gray-100 py-4 text-left last:border-b-0"
    >

      <div className="min-w-0">

        <p className="text-xs font-bold text-gray-900">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-[10px] leading-5 text-gray-500">
          {description}
        </p>

      </div>

      <span
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition",
          enabled
            ? "bg-gray-900"
            : "bg-gray-200",
        ].join(" ")}
      >

        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
            enabled
              ? "left-6"
              : "left-1",
          ].join(" ")}
        />

      </span>

    </button>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectSetting({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div>

      <label className="text-xs font-bold text-gray-900">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-400 focus:bg-white"
      >

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ),
        )}

      </select>

    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        {success && (
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        )}

        <p
          className={[
            "text-xs font-bold",
            success
              ? "text-emerald-600"
              : "text-gray-900",
          ].join(" ")}
        >
          {value}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
  success = false,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">

      <span className="text-[10px] font-medium text-gray-500">
        {label}
      </span>

      <span
        className={[
          "text-right text-[10px] font-bold",
          success
            ? "text-emerald-600"
            : "text-gray-900",
        ].join(" ")}
      >
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   PROFILE MODAL
========================================================= */

function ProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: TrainerProfile;
  onClose: () => void;
  onSave: (
    profile: TrainerProfile,
  ) => void;
}) {
  const [
    form,
    setForm,
  ] = useState(profile);

  function update(
    key: keyof TrainerProfile,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  }

  return (
    <ModalShell
      title="Edit Trainer Profile"
      description="Update your trainer information."
      onClose={onClose}
    >

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="space-y-5"
      >

        <div className="grid gap-4 sm:grid-cols-2">

          <FormInput
            label="First Name"
            value={form.firstName}
            onChange={(value) =>
              update(
                "firstName",
                value,
              )
            }
          />

          <FormInput
            label="Last Name"
            value={form.lastName}
            onChange={(value) =>
              update(
                "lastName",
                value,
              )
            }
          />

          <FormInput
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(value) =>
              update(
                "email",
                value,
              )
            }
          />

          <FormInput
            label="Mobile Number"
            value={
              form.userCode
            }
            onChange={(value) =>
              update(
                "mobileNumber",
                value,
              )
            }
          />

        </div>

        <div>

          <label className="text-xs font-bold text-gray-900">
            Specialization
          </label>

          <textarea
            value={
              form.specialization
            }
            onChange={(event) =>
              update(
                "specialization",
                event.target.value,
              )
            }
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-medium text-gray-800 outline-none transition focus:border-gray-400 focus:bg-white"
          />

        </div>

        <div className="rounded-xl bg-gray-50 p-4">

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Trainer ID
          </p>

          <p className="mt-1 text-xs font-bold text-gray-900">
            {form.userCode}
          </p>

          <p className="mt-1 text-[10px] text-gray-500">
            Trainer ID is assigned by the system.
          </p>

        </div>

        <ModalActions
          onCancel={onClose}
          submitText="Save Changes"
        />

      </form>

    </ModalShell>
  );
}

/* =========================================================
   PASSWORD MODAL
========================================================= */

function PasswordModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}) {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!currentPassword) {
      setError(
        "Enter your current password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    setError("");

    onSave(event);
  }

  return (
    <ModalShell
      title="Change Password"
      description="Update your trainer account password."
      onClose={onClose}
    >

      <form
        onSubmit={submit}
        className="space-y-5"
      >

        <FormInput
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />

        <FormInput
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
        />

        <FormInput
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <ModalActions
          onCancel={onClose}
          submitText="Update Password"
        />

      </form>

    </ModalShell>
  );
}

/* =========================================================
   CONFIRM MODAL
========================================================= */

function ConfirmModal({
  title,
  description,
  confirmText,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      title={title}
      description={description}
      onClose={onClose}
    >

      <div className="flex items-center justify-center py-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-bold text-red-600">
          !
        </div>

      </div>

      <ModalActions
        onCancel={onClose}
        onSubmit={onConfirm}
        submitText={confirmText}
        danger
      />

    </ModalShell>
  );
}

/* =========================================================
   MODAL SHELL
========================================================= */

function ModalShell({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">

      <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]">

        {/* HEADER */}

        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-5 py-4">

          <div className="pr-4">

            <h2 className="text-lg font-bold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              {description}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200"
          >
            ×
          </button>

        </div>

        {/* SCROLLABLE BODY */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {children}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   MODAL ACTIONS
========================================================= */

function ModalActions({
  onCancel,
  onSubmit,
  submitText,
  danger = false,
}: {
  onCancel: () => void;
  onSubmit?: () => void;
  submitText: string;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        type={
          onSubmit
            ? "button"
            : "submit"
        }
        onClick={onSubmit}
        className={[
          "rounded-xl px-4 py-2.5 text-xs font-bold text-white transition",
          danger
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gray-900 hover:bg-gray-800",
        ].join(" ")}
      >
        {submitText}
      </button>

    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
}) {
  return (
    <div>

      <label className="text-xs font-bold text-gray-900">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
      />

    </div>
  );
}