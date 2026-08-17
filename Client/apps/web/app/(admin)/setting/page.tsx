"use client";

import { useState } from "react";

type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "preferences";

type NotificationSettings = {
  enrollment: boolean;
  attendance: boolean;
  assessment: boolean;
  exam: boolean;
  announcements: boolean;
};

type PreferenceSettings = {
  language: string;
  dateFormat: string;
  timeFormat: string;
  theme: string;
  defaultTraining: string;
};

const trainingOptions = [
  {
    code: "CSS-NCII",
    name: "Computer Systems Servicing NC II",
  },
  {
    code: "EIM-NCII",
    name: "Electrical Installation and Maintenance NC II",
  },
  {
    code: "WEB-DEV",
    name: "Web Development Fundamentals",
  },
];

export default function TrainerSettingsPage() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("profile");

  const [profile, setProfile] = useState({
    firstName: "Ralph",
    middleName: "Joed",
    lastName: "Gerente",
    email: "trainer@anci.edu.ph",
    contactNumber: "0917 123 4567",
    trainerId: "TRN-001",
    specialization:
      "Computer Systems Servicing",
    bio: "Certified trainer specializing in computer systems servicing, hardware troubleshooting, networking, and basic technical support.",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      enrollment: true,
      attendance: true,
      assessment: true,
      exam: true,
      announcements: true,
    });

  const [preferences, setPreferences] =
    useState<PreferenceSettings>({
      language: "English",
      dateFormat: "MMM DD, YYYY",
      timeFormat: "12-hour",
      theme: "System",
      defaultTraining:
        "Computer Systems Servicing NC II",
    });

  const [saved, setSaved] = useState(false);

  function showSavedMessage() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function saveProfile() {
    showSavedMessage();
  }

  function changePassword() {
    if (
      !security.currentPassword ||
      !security.newPassword ||
      !security.confirmPassword
    ) {
      return;
    }

    if (
      security.newPassword !==
      security.confirmPassword
    ) {
      return;
    }

    setSecurity({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    showSavedMessage();
  }

  function saveNotifications() {
    showSavedMessage();
  }

  function savePreferences() {
    showSavedMessage();
  }

  function toggleNotification(
    key: keyof NotificationSettings,
  ) {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <div className="min-h-full space-y-6">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div>

        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          <span>Trainer</span>

          <span>/</span>

          <span className="font-medium text-gray-600">
            Settings
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Manage your trainer profile, account
          security, notifications, and system
          preferences.
        </p>

      </div>

      {/* =====================================================
          SAVED MESSAGE
      ====================================================== */}

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            ✓
          </div>

          <div>
            <p className="text-xs font-bold text-emerald-800">
              Changes saved
            </p>

            <p className="mt-0.5 text-[10px] text-emerald-600">
              Your settings have been updated
              successfully.
            </p>
          </div>

        </div>
      )}

      {/* =====================================================
          SETTINGS LAYOUT
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">

        {/* ===================================================
            SIDEBAR
        ==================================================== */}

        <aside className="h-fit rounded-2xl border border-[#e7e9ec] bg-white p-2">

          <SettingsNavItem
            active={
              activeTab === "profile"
            }
            icon="person"
            title="Profile"
            description="Personal information"
            onClick={() =>
              setActiveTab("profile")
            }
          />

          <SettingsNavItem
            active={
              activeTab === "security"
            }
            icon="lock"
            title="Account & Security"
            description="Password and account"
            onClick={() =>
              setActiveTab("security")
            }
          />

          <SettingsNavItem
            active={
              activeTab ===
              "notifications"
            }
            icon="bell"
            title="Notifications"
            description="Alerts and updates"
            onClick={() =>
              setActiveTab(
                "notifications",
              )
            }
          />

          <SettingsNavItem
            active={
              activeTab ===
              "preferences"
            }
            icon="settings"
            title="Preferences"
            description="System preferences"
            onClick={() =>
              setActiveTab(
                "preferences",
              )
            }
          />

        </aside>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="min-w-0">

          {/* =================================================
              PROFILE
          ================================================== */}

          {activeTab === "profile" && (
            <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

              <SettingsHeader
                title="Profile"
                description="Manage the information displayed on your trainer account."
              />

              <div className="p-5 sm:p-6">

                {/* PROFILE TOP */}

                <div className="flex flex-col gap-5 border-b border-[#eef0f2] pb-6 sm:flex-row sm:items-center">

                  <div className="relative">

                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#191c1e] text-xl font-bold text-white">
                      RG
                    </div>

                    <button
                      type="button"
                      className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs shadow-sm transition hover:bg-gray-200"
                    >
                      ✎
                    </button>

                  </div>

                  <div>

                    <h2 className="text-base font-bold text-[#191c1e]">
                      {profile.firstName}{" "}
                      {profile.lastName}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Trainer ID:{" "}
                      {profile.trainerId}
                    </p>

                    <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                      Active Trainer
                    </div>

                  </div>

                </div>

                {/* PERSONAL INFORMATION */}

                <div className="mt-6">

                  <SectionTitle
                    title="Personal Information"
                    description="Basic information about your trainer account."
                  />

                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    <InputField
                      label="First Name"
                      value={
                        profile.firstName
                      }
                      onChange={(value) =>
                        setProfile({
                          ...profile,
                          firstName:
                            value,
                        })
                      }
                    />

                    <InputField
                      label="Middle Name"
                      value={
                        profile.middleName
                      }
                      onChange={(value) =>
                        setProfile({
                          ...profile,
                          middleName:
                            value,
                        })
                      }
                    />

                    <InputField
                      label="Last Name"
                      value={
                        profile.lastName
                      }
                      onChange={(value) =>
                        setProfile({
                          ...profile,
                          lastName:
                            value,
                        })
                      }
                    />

                    <InputField
                      label="Contact Number"
                      value={
                        profile.contactNumber
                      }
                      onChange={(value) =>
                        setProfile({
                          ...profile,
                          contactNumber:
                            value,
                        })
                      }
                    />

                    <InputField
                      label="Email Address"
                      value={
                        profile.email
                      }
                      disabled
                      helper="Email address is managed by your account."
                    />

                    <InputField
                      label="Trainer ID"
                      value={
                        profile.trainerId
                      }
                      disabled
                      helper="Trainer ID cannot be changed."
                    />

                  </div>

                </div>

                {/* TRAINER INFORMATION */}

                <div className="mt-8 border-t border-[#eef0f2] pt-6">

                  <SectionTitle
                    title="Trainer Information"
                    description="Information about your training specialization."
                  />

                  <div className="mt-5 space-y-4">

                    <InputField
                      label="Specialization"
                      value={
                        profile.specialization
                      }
                      onChange={(value) =>
                        setProfile({
                          ...profile,
                          specialization:
                            value,
                        })
                      }
                    />

                    <div>

                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                        Bio
                      </label>

                      <textarea
                        value={
                          profile.bio
                        }
                        onChange={(event) =>
                          setProfile({
                            ...profile,
                            bio: event.target
                              .value,
                          })
                        }
                        rows={5}
                        className="w-full resize-none rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 py-3 text-xs leading-5 text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                      />

                      <p className="mt-1.5 text-[9px] text-gray-400">
                        This information may be
                        visible to participants
                        assigned to your training.
                      </p>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-8 flex justify-end border-t border-[#eef0f2] pt-5">

                  <button
                    type="button"
                    onClick={
                      saveProfile
                    }
                    className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                  >
                    Save Changes
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              SECURITY
          ================================================== */}

          {activeTab === "security" && (
            <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

              <SettingsHeader
                title="Account & Security"
                description="Manage your password and protect your trainer account."
              />

              <div className="p-5 sm:p-6">

                {/* ACCOUNT INFO */}

                <div className="rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm text-gray-500 shadow-sm">
                      ✓
                    </div>

                    <div>

                      <p className="text-xs font-bold">
                        Account Status
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-gray-500">
                        Your trainer account is
                        currently active and
                        authorized to manage assigned
                        training programs.
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                        Active
                      </span>

                    </div>

                  </div>

                </div>

                {/* PASSWORD */}

                <div className="mt-8">

                  <SectionTitle
                    title="Change Password"
                    description="Use a strong password that you do not use on other accounts."
                  />

                  <div className="mt-5 max-w-xl space-y-4">

                    <PasswordField
                      label="Current Password"
                      value={
                        security.currentPassword
                      }
                      visible={
                        showCurrentPassword
                      }
                      onChange={(value) =>
                        setSecurity({
                          ...security,
                          currentPassword:
                            value,
                        })
                      }
                      onToggle={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword,
                        )
                      }
                    />

                    <PasswordField
                      label="New Password"
                      value={
                        security.newPassword
                      }
                      visible={
                        showNewPassword
                      }
                      onChange={(value) =>
                        setSecurity({
                          ...security,
                          newPassword:
                            value,
                        })
                      }
                      onToggle={() =>
                        setShowNewPassword(
                          !showNewPassword,
                        )
                      }
                    />

                    <PasswordField
                      label="Confirm New Password"
                      value={
                        security.confirmPassword
                      }
                      visible={
                        showConfirmPassword
                      }
                      onChange={(value) =>
                        setSecurity({
                          ...security,
                          confirmPassword:
                            value,
                        })
                      }
                      onToggle={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword,
                        )
                      }
                    />

                    {security.newPassword &&
                      security.confirmPassword &&
                      security.newPassword !==
                        security.confirmPassword && (
                        <p className="text-[10px] font-medium text-red-500">
                          Passwords do not
                          match.
                        </p>
                      )}

                  </div>

                </div>

                {/* PASSWORD REQUIREMENTS */}

                <div className="mt-6 max-w-xl rounded-2xl border border-[#e7e9ec] p-4">

                  <p className="text-xs font-bold">
                    Password requirements
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">

                    <RequirementText>
                      At least 8 characters
                    </RequirementText>

                    <RequirementText>
                      One uppercase letter
                    </RequirementText>

                    <RequirementText>
                      One lowercase letter
                    </RequirementText>

                    <RequirementText>
                      One number
                    </RequirementText>

                  </div>

                </div>

                <div className="mt-8 flex justify-end border-t border-[#eef0f2] pt-5">

                  <button
                    type="button"
                    onClick={
                      changePassword
                    }
                    className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                  >
                    Update Password
                  </button>

                </div>

                {/* DANGER ZONE */}

                <div className="mt-10 border-t border-[#eef0f2] pt-6">

                  <SectionTitle
                    title="Session"
                    description="Manage your current account session."
                  />

                  <button
                    type="button"
                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Sign Out
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          {activeTab ===
            "notifications" && (
            <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

              <SettingsHeader
                title="Notifications"
                description="Choose which updates you want to receive as a trainer."
              />

              <div className="p-5 sm:p-6">

                <SectionTitle
                  title="Training Notifications"
                  description="Receive notifications related to your assigned training programs."
                />

                <div className="mt-5 divide-y divide-[#eef0f2] rounded-2xl border border-[#e7e9ec]">

                  <NotificationRow
                    title="New Enrollment"
                    description="Get notified when a participant enrolls in your assigned training."
                    enabled={
                      notifications.enrollment
                    }
                    onToggle={() =>
                      toggleNotification(
                        "enrollment",
                      )
                    }
                  />

                  <NotificationRow
                    title="Attendance"
                    description="Receive updates when participants submit attendance or when attendance requires attention."
                    enabled={
                      notifications.attendance
                    }
                    onToggle={() =>
                      toggleNotification(
                        "attendance",
                      )
                    }
                  />

                  <NotificationRow
                    title="Assessment Submissions"
                    description="Get notified when participants submit trainer-created assessments."
                    enabled={
                      notifications.assessment
                    }
                    onToggle={() =>
                      toggleNotification(
                        "assessment",
                      )
                    }
                  />

                  <NotificationRow
                    title="Exam Submissions"
                    description="Receive notifications when participants complete their examination."
                    enabled={
                      notifications.exam
                    }
                    onToggle={() =>
                      toggleNotification(
                        "exam",
                      )
                    }
                  />

                  <NotificationRow
                    title="Training Announcements"
                    description="Receive important announcements and updates about your assigned training."
                    enabled={
                      notifications.announcements
                    }
                    onToggle={() =>
                      toggleNotification(
                        "announcements",
                      )
                    }
                  />

                </div>

                {/* GENERAL */}

                <div className="mt-8">

                  <SectionTitle
                    title="Notification Delivery"
                    description="Choose how important notifications should appear."
                  />

                  <div className="mt-5 rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-4">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-xs font-semibold">
                          In-app notifications
                        </p>

                        <p className="mt-1 text-[10px] text-gray-400">
                          Notifications appear in
                          your trainer dashboard.
                        </p>

                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                        Enabled
                      </span>

                    </div>

                  </div>

                </div>

                <div className="mt-8 flex justify-end border-t border-[#eef0f2] pt-5">

                  <button
                    type="button"
                    onClick={
                      saveNotifications
                    }
                    className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                  >
                    Save Preferences
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* =================================================
              PREFERENCES
          ================================================== */}

          {activeTab ===
            "preferences" && (
            <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white">

              <SettingsHeader
                title="Preferences"
                description="Customize how the trainer portal displays information."
              />

              <div className="p-5 sm:p-6">

                <SectionTitle
                  title="Display Preferences"
                  description="These preferences affect your trainer portal experience."
                />

                <div className="mt-5 grid gap-4 md:grid-cols-2">

                  {/* LANGUAGE */}

                  <SelectField
                    label="Language"
                    value={
                      preferences.language
                    }
                    onChange={(value) =>
                      setPreferences({
                        ...preferences,
                        language:
                          value,
                      })
                    }
                    options={[
                      "English",
                      "Filipino",
                    ]}
                  />

                  {/* DATE FORMAT */}

                  <SelectField
                    label="Date Format"
                    value={
                      preferences.dateFormat
                    }
                    onChange={(value) =>
                      setPreferences({
                        ...preferences,
                        dateFormat:
                          value,
                      })
                    }
                    options={[
                      "MMM DD, YYYY",
                      "DD/MM/YYYY",
                      "MM/DD/YYYY",
                    ]}
                  />

                  {/* TIME */}

                  <SelectField
                    label="Time Format"
                    value={
                      preferences.timeFormat
                    }
                    onChange={(value) =>
                      setPreferences({
                        ...preferences,
                        timeFormat:
                          value,
                      })
                    }
                    options={[
                      "12-hour",
                      "24-hour",
                    ]}
                  />

                  {/* THEME */}

                  <SelectField
                    label="Theme"
                    value={
                      preferences.theme
                    }
                    onChange={(value) =>
                      setPreferences({
                        ...preferences,
                        theme:
                          value,
                      })
                    }
                    options={[
                      "System",
                      "Light",
                      "Dark",
                    ]}
                  />

                </div>

                {/* DEFAULT TRAINING */}

                <div className="mt-8 border-t border-[#eef0f2] pt-6">

                  <SectionTitle
                    title="Training Preferences"
                    description="Choose which assigned training should be selected by default."
                  />

                  <div className="mt-5 max-w-xl">

                    <SelectField
                      label="Default Training Program"
                      value={
                        preferences.defaultTraining
                      }
                      onChange={(value) =>
                        setPreferences({
                          ...preferences,
                          defaultTraining:
                            value,
                        })
                      }
                      options={trainingOptions.map(
                        (
                          training,
                        ) =>
                          training.name,
                      )}
                    />

                    <p className="mt-2 text-[9px] leading-4 text-gray-400">
                      This does not change your
                      assigned training programs.
                      It only controls which training
                      is selected first when you open
                      trainer modules.
                    </p>

                  </div>

                </div>

                {/* QUICK PREVIEW */}

                <div className="mt-8 border-t border-[#eef0f2] pt-6">

                  <SectionTitle
                    title="Preview"
                    description="Example of how your selected preferences will appear."
                  />

                  <div className="mt-5 rounded-2xl border border-[#e7e9ec] bg-[#fafbfc] p-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                          Current Training
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {
                            preferences.defaultTraining
                          }
                        </p>

                      </div>

                      <div className="text-left sm:text-right">

                        <p className="text-[10px] text-gray-400">
                          Example Date
                        </p>

                        <p className="mt-1 text-xs font-semibold">
                          {formatPreviewDate(
                            preferences.dateFormat,
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                <div className="mt-8 flex justify-end border-t border-[#eef0f2] pt-5">

                  <button
                    type="button"
                    onClick={
                      savePreferences
                    }
                    className="rounded-xl bg-[#191c1e] px-5 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                  >
                    Save Preferences
                  </button>

                </div>

              </div>

            </section>
          )}

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   SETTINGS NAV
========================================================= */

function SettingsNavItem({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon:
    | "person"
    | "lock"
    | "bell"
    | "settings";
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
        active
          ? "bg-[#f1f2f3]"
          : "hover:bg-[#f8f9fa]"
      }`}
    >

      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
          active
            ? "bg-[#191c1e] text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {getIcon(icon)}
      </div>

      <div className="min-w-0">

        <p
          className={`truncate text-[11px] font-bold ${
            active
              ? "text-[#191c1e]"
              : "text-gray-600"
          }`}
        >
          {title}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-gray-400">
          {description}
        </p>

      </div>

    </button>
  );
}

/* =========================================================
   HEADER
========================================================= */

function SettingsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#eef0f2] px-5 py-5 sm:px-6">

      <h2 className="text-base font-bold text-[#191c1e]">
        {title}
      </h2>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>

      <h3 className="text-sm font-bold text-[#191c1e]">
        {title}
      </h3>

      <p className="mt-1 text-[10px] text-gray-400">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  onChange,
  disabled = false,
  helper,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  helper?: string;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </label>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange?.(
            event.target.value,
          )
        }
        className={`h-11 w-full rounded-xl border border-[#e7e9ec] px-3 text-xs outline-none transition ${
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "bg-[#f8f9fa] text-gray-700 focus:border-gray-300 focus:bg-white"
        }`}
      />

      {helper && (
        <p className="mt-1.5 text-[9px] text-gray-400">
          {helper}
        </p>
      )}

    </div>
  );
}

/* =========================================================
   PASSWORD
========================================================= */

function PasswordField({
  label,
  value,
  visible,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </label>

      <div className="relative">

        <input
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 pr-12 text-xs text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-xs text-gray-400 transition hover:bg-gray-200"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible
            ? "◉"
            : "○"}
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white"
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
   NOTIFICATION ROW
========================================================= */

function NotificationRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">

      <div className="min-w-0">

        <p className="text-xs font-semibold text-[#191c1e]">
          {title}
        </p>

        <p className="mt-1 max-w-2xl text-[10px] leading-5 text-gray-400">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-[#191c1e]"
            : "bg-gray-200"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

/* =========================================================
   REQUIREMENT TEXT
========================================================= */

function RequirementText({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">

      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-700">
        ✓
      </span>

      <span className="text-[10px] text-gray-500">
        {children}
      </span>

    </div>
  );
}

/* =========================================================
   ICONS
========================================================= */

function getIcon(
  icon:
    | "person"
    | "lock"
    | "bell"
    | "settings",
) {
  if (icon === "person") {
    return "●";
  }

  if (icon === "lock") {
    return "◆";
  }

  if (icon === "bell") {
    return "●";
  }

  return "⚙";
}

/* =========================================================
   DATE PREVIEW
========================================================= */

function formatPreviewDate(
  format: string,
) {
  const date =
    new Date(
      "2026-08-17T14:30:00",
    );

  if (
    format ===
    "DD/MM/YYYY"
  ) {
    return "17/08/2026";
  }

  if (
    format ===
    "MM/DD/YYYY"
  ) {
    return "08/17/2026";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      year: "numeric",
    },
  );
}