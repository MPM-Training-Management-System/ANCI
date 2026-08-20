"use client";

import {
  useState,
  type FormEvent,
} from "react";

import type {
  AdminProfile,
  NotificationSettings,
  SystemSettings,
  TrainingSettings,
} from "./type";

/* =========================================================
   SETTINGS PAGE
========================================================= */

export default function AdminSettingsPage() {
  /* =======================================================
     PROFILE
  ======================================================= */

  const [profile, setProfile] =
    useState<AdminProfile>({
      firstName: "Ralph",
      lastName: "Gerente",
      email: "admin@anci.edu.ph",
      mobileNumber: "0917 123 4567",
      role: "Administrator",
    });

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [
    notifications,
    setNotifications,
  ] =
    useState<NotificationSettings>({
      enrollmentAlerts: true,
      attendanceAlerts: true,
      assessmentAlerts: true,
      systemAlerts: true,
      emailNotifications: true,
    });

  /* =======================================================
     TRAINING
  ======================================================= */

  const [
    trainingSettings,
    setTrainingSettings,
  ] =
    useState<TrainingSettings>({
      defaultCapacity: 30,
      autoEnrollmentReview: false,
      allowWaitlist: true,
      requireTrainerAssignment: true,
    });

  /* =======================================================
     SYSTEM
  ======================================================= */

  const [
    systemSettings,
    setSystemSettings,
  ] =
    useState<SystemSettings>({
      timezone: "Asia/Manila",
      dateFormat: "MMM DD, YYYY",
      language: "English",
    });

  /* =======================================================
     MODALS
  ======================================================= */

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

  /* =======================================================
     SAVED MESSAGE
  ======================================================= */

  const [saved, setSaved] =
    useState(false);

  function showSaved() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  /* =======================================================
     PROFILE SAVE
  ======================================================= */

  function handleProfileSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

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

  /* =======================================================
     NOTIFICATION TOGGLE
  ======================================================= */

  function toggleNotification(
    key: keyof NotificationSettings,
  ) {
    setNotifications(
      (current) => ({
        ...current,
        [key]: !current[key],
      }),
    );
  }

  /* =======================================================
     TRAINING TOGGLE
  ======================================================= */

  function toggleTraining(
    key:
      | "autoEnrollmentReview"
      | "allowWaitlist"
      | "requireTrainerAssignment",
  ) {
    setTrainingSettings(
      (current) => ({
        ...current,
        [key]: !current[key],
      }),
    );
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
              Administration
            </span>

          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-950">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Manage your administrator account,
                system preferences, training rules,
                notifications, and security settings.
              </p>

            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">

              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Account
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {profile.email}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                {profile.role}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          SAVED MESSAGE
      ================================================= */}

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
              Your settings have been updated.
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          ACCOUNT
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

        {/* PROFILE */}

        <SettingsCard
          eyebrow="Account"
          title="Administrator Profile"
          description="Your personal information and administrator identity."
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-xl font-bold text-white">
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">

              <h3 className="text-lg font-bold text-gray-900">
                {profile.firstName}{" "}
                {profile.lastName}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {profile.email}
              </p>

              <div className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-600">
                {profile.role}
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

        </SettingsCard>

        {/* SECURITY */}

        <SettingsCard
          eyebrow="Security"
          title="Account Security"
          description="Keep your administrator account protected."
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
                  Add another layer of protection
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
        description="Choose which events should generate notifications."
      >

        <div className="grid gap-x-8 gap-y-1 md:grid-cols-2">

          <SettingToggle
            title="Enrollment Alerts"
            description="Notify me when a participant submits an enrollment."
            enabled={
              notifications.enrollmentAlerts
            }
            onChange={() =>
              toggleNotification(
                "enrollmentAlerts",
              )
            }
          />

          <SettingToggle
            title="Attendance Alerts"
            description="Notify me about missing or incomplete attendance."
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
            description="Notify me when assessment results are submitted."
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
            title="System Alerts"
            description="Receive important system and operational alerts."
            enabled={
              notifications.systemAlerts
            }
            onChange={() =>
              toggleNotification(
                "systemAlerts",
              )
            }
          />

          <SettingToggle
            title="Email Notifications"
            description="Receive administrator notifications through email."
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
          TRAINING SETTINGS
      ================================================= */}

      <SettingsCard
        eyebrow="Training Management"
        title="Training Preferences"
        description="Configure default rules used by the training management system."
      >

        <div className="grid gap-6 lg:grid-cols-2">

          {/* CAPACITY */}

          <div className="rounded-2xl border border-gray-200 p-4">

            <label className="text-xs font-bold text-gray-900">
              Default Training Capacity
            </label>

            <p className="mt-1 text-[10px] leading-5 text-gray-500">
              Default number of participants allowed
              in a newly created training batch.
            </p>

            <div className="mt-4 flex items-center gap-3">

              <input
                type="number"
                min={1}
                max={500}
                value={
                  trainingSettings.defaultCapacity
                }
                onChange={(event) =>
                  setTrainingSettings(
                    (current) => ({
                      ...current,
                      defaultCapacity:
                        Number(
                          event.target
                            .value,
                        ),
                    }),
                  )
                }
                className="h-11 w-28 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold outline-none transition focus:border-gray-400 focus:bg-white"
              />

              <span className="text-xs text-gray-500">
                participants
              </span>

            </div>

          </div>

          {/* RULES */}

          <div className="space-y-1">

            <SettingToggle
              title="Allow Waitlist"
              description="Allow participants to join when a batch reaches capacity."
              enabled={
                trainingSettings.allowWaitlist
              }
              onChange={() =>
                toggleTraining(
                  "allowWaitlist",
                )
              }
            />

            <SettingToggle
              title="Require Trainer Assignment"
              description="Require every active training batch to have an assigned trainer."
              enabled={
                trainingSettings.requireTrainerAssignment
              }
              onChange={() =>
                toggleTraining(
                  "requireTrainerAssignment",
                )
              }
            />

            <SettingToggle
              title="Automatic Enrollment Review"
              description="Automatically approve eligible enrollment requests."
              enabled={
                trainingSettings.autoEnrollmentReview
              }
              onChange={() =>
                toggleTraining(
                  "autoEnrollmentReview",
                )
              }
            />

          </div>

        </div>

      </SettingsCard>

      {/* =================================================
          SYSTEM PREFERENCES
      ================================================= */}

      <SettingsCard
        eyebrow="System"
        title="System Preferences"
        description="Configure how information is displayed throughout the administrator portal."
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
            onChange={(value) =>
              setSystemSettings(
                (current) => ({
                  ...current,
                  timezone: value,
                }),
              )
            }
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
            onChange={(value) =>
              setSystemSettings(
                (current) => ({
                  ...current,
                  dateFormat: value,
                }),
              )
            }
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
            onChange={(value) =>
              setSystemSettings(
                (current) => ({
                  ...current,
                  language: value,
                }),
              )
            }
          />

        </div>

      </SettingsCard>

      {/* =================================================
          SYSTEM INFORMATION
      ================================================= */}

      <section className="grid gap-6 lg:grid-cols-2">

        <SettingsCard
          eyebrow="Information"
          title="System Information"
          description="Technical information about the current ANCI portal."
        >

          <div className="grid gap-4 sm:grid-cols-2">

            <InfoItem
              label="Application"
              value="ANCI Training Management"
            />

            <InfoItem
              label="Version"
              value="1.0.0"
            />

            <InfoItem
              label="Environment"
              value="Production"
            />

            <InfoItem
              label="Database"
              value="Connected"
              success
            />

          </div>

        </SettingsCard>

        {/* SESSION */}

        <SettingsCard
          eyebrow="Session"
          title="Current Session"
          description="Information about your current administrator session."
        >

          <div className="space-y-3">

            <InfoRow
              label="Signed in as"
              value={profile.email}
            />

            <InfoRow
              label="Role"
              value={profile.role}
            />

            <InfoRow
              label="Last activity"
              value="Just now"
            />

            <InfoRow
              label="Session status"
              value="Active"
              success
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
            Danger Zone
          </p>

          <h2 className="mt-1 text-base font-bold text-red-900">
            Account Actions
          </h2>

          <p className="mt-1 text-xs text-red-600">
            These actions affect your current administrator
            session.
          </p>

        </div>

        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-bold text-gray-900">
              Sign out of administrator portal
            </p>

            <p className="mt-1 text-xs text-gray-500">
              End your current administrator session.
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
          onSave={(updated) => {
            setProfile(updated);
            setProfileModal(false);
            showSaved();
          }}
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
          description="You will be signed out of the ANCI administrator portal and will need to sign in again."
          confirmText="Sign Out"
          danger
          onClose={() =>
            setLogoutModal(false)
          }
          onConfirm={() => {
            setLogoutModal(false);

            // Replace this with your real auth logout:
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
   SETTING TOGGLE
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
   SELECT SETTING
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
   INFO ITEM
========================================================= */

function InfoItem({
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
  profile: AdminProfile;
  onClose: () => void;
  onSave: (
    profile: AdminProfile,
  ) => void;
}) {
  const [
    form,
    setForm,
  ] = useState(profile);

  function update(
    key: keyof AdminProfile,
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
      title="Edit Administrator Profile"
      description="Update the information associated with your administrator account."
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
              form.mobileNumber
            }
            onChange={(value) =>
              update(
                "mobileNumber",
                value,
              )
            }
          />

        </div>

        <div className="rounded-xl bg-gray-50 p-4">

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Role
          </p>

          <p className="mt-1 text-xs font-bold text-gray-900">
            {form.role}
          </p>

          <p className="mt-1 text-[10px] text-gray-500">
            Administrator role is managed by the
            system.
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
      description="Update your administrator account password."
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
  danger = false,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmText: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell
      title={title}
      description={description}
      onClose={onClose}
    >

      <div className="flex items-center justify-center py-3">

        <div
          className={[
            "flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold",
            danger
              ? "bg-red-50 text-red-600"
              : "bg-gray-100 text-gray-700",
          ].join(" ")}
        >
          !
        </div>

      </div>

      <ModalActions
        onCancel={onClose}
        onSubmit={onConfirm}
        submitText={confirmText}
        danger={danger}
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

        {/* BODY */}

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
        type={onSubmit ? "button" : "submit"}
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