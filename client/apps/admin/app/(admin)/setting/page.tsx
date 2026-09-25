"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { useAdminMe } from "@repo/hooks";

import { adminApi } from "@/lib/api";
import { auth } from "@/lib/auth";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function SettingsPage() {
  const router = useRouter();

  const {
    profile,
    isLoading,
    error,
    refetch,
  } = useAdminMe(adminApi);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [savedMessage, setSavedMessage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>

          <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <X className="h-6 w-6 text-red-500" />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              Unable to load account settings
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading your profile."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { firstName, lastName } = splitFullName(profile.fullName);

  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "A";

  const handleSaved = () => {
    setSavedMessage(true);

    window.setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await auth.logout();

      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);

      /*
       * Even if the API logout request fails, clear the local
       * authentication state if your auth helper supports it.
       */
      try {
        await auth.logout();
      } catch {
        // Ignore secondary logout error.
      }

      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your administrator account and security settings.
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                {initials}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {profile.fullName}
                </p>

                <p className="text-xs text-gray-500">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        {/* Saved message */}
        {savedMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
              <Check className="h-4 w-4" />
            </div>

            <span>Changes saved successfully.</span>
          </div>
        )}

        {/* Account Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SettingsCard
            icon={<User className="h-5 w-5" />}
            title="Administrator Profile"
            description="Your basic administrator account information."
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">
                  {initials}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {profile.fullName}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>

                  <div className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {profile.role}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </SettingsCard>

          <SettingsCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Account Security"
            description="Manage your password and account security."
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <KeyRound className="h-5 w-5 text-gray-700" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Change Password
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Update your administrator password
                    </p>
                  </div>
                </div>

                <span className="text-sm font-medium text-gray-500">
                  Change
                </span>
              </button>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account Status
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Your account is currently active
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>
            </div>
          </SettingsCard>
        </div>

        {/* Account Information */}
        <SettingsCard
          icon={<User className="h-5 w-5" />}
          title="Account Information"
          description="Review the information associated with your administrator account."
        >
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <InfoField
              label="First Name"
              value={firstName || "Not provided"}
            />

            <InfoField
              label="Last Name"
              value={lastName || "Not provided"}
            />

            <InfoField
              label="Email Address"
              value={profile.email}
            />

            <InfoField
              label="Role"
              value={profile.role}
            />
          </div>
        </SettingsCard>

        {/* Session */}
        <SettingsCard
          icon={<LogOut className="h-5 w-5" />}
          title="Session"
          description="Manage your current administrator session."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Sign out of your account
              </p>

              <p className="mt-1 text-xs text-gray-500">
                You will be redirected to the login page after signing out.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />

              {isLoggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </SettingsCard>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          firstName={firstName}
          lastName={lastName}
          email={profile.email}
          role={profile.role}
          onClose={() => setShowProfileModal(false)}
          onSaved={() => {
            setShowProfileModal(false);
            handleSaved();
          }}
        />
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSaved={() => {
            setShowPasswordModal(false);
            handleSaved();
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings Card */
/* -------------------------------------------------------------------------- */

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            {icon}
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Info Field */
/* -------------------------------------------------------------------------- */

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile Modal */
/* -------------------------------------------------------------------------- */

function ProfileModal({
  firstName,
  lastName,
  email,
  role,
  onClose,
  onSaved,
}: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    firstName,
    lastName,
    email,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /*
     * Currently this preserves the existing UI behavior.
     * Connect the actual update API here once the AdminProfile
     * update endpoint is available.
     */
    onSaved();
  };

  return (
    <ModalShell
      title="Edit Profile"
      description="Update your administrator profile information."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="First Name"
            value={form.firstName}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                firstName: value,
              }))
            }
            required
          />

          <FormInput
            label="Last Name"
            value={form.lastName}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                lastName: value,
              }))
            }
          />
        </div>

        <FormInput
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              email: value,
            }))
          }
          required
        />

        <FormInput
          label="Role"
          value={role}
          onChange={() => undefined}
          disabled
        />

        <ModalActions
          onCancel={onClose}
          submitText="Save Changes"
        />
      </form>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Password Modal */
/* -------------------------------------------------------------------------- */

function PasswordModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setValidationError("");

    if (!currentPassword) {
      setValidationError("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setValidationError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setValidationError(
        "New password must be at least 8 characters long.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(
        "New password and confirmation password do not match.",
      );
      return;
    }

    /*
     * Currently this preserves the existing UI behavior.
     * Connect the actual change-password API here once the
     * authenticated password endpoint is available.
     */
    onSaved();
  };

  return (
    <ModalShell
      title="Change Password"
      description="Choose a strong password to protect your account."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="Current Password"
          value={currentPassword}
          showPassword={showCurrent}
          onChange={setCurrentPassword}
          onToggle={() => setShowCurrent((value) => !value)}
        />

        <PasswordInput
          label="New Password"
          value={newPassword}
          showPassword={showNew}
          onChange={setNewPassword}
          onToggle={() => setShowNew((value) => !value)}
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          showPassword={showConfirm}
          onChange={setConfirmPassword}
          onToggle={() => setShowConfirm((value) => !value)}
        />

        {validationError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {validationError}
          </div>
        )}

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-700">
            Password requirements
          </p>

          <ul className="mt-2 space-y-1 text-xs text-gray-500">
            <li>• At least 8 characters</li>
            <li>• Use a combination of letters and numbers</li>
            <li>• Avoid using easily guessed information</li>
          </ul>
        </div>

        <ModalActions
          onCancel={onClose}
          submitText="Update Password"
        />
      </form>
    </ModalShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Password Input */
/* -------------------------------------------------------------------------- */

function PasswordInput({
  label,
  value,
  showPassword,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-gray-400 transition hover:text-gray-700"
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form Input */
/* -------------------------------------------------------------------------- */

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal Actions */
/* -------------------------------------------------------------------------- */

function ModalActions({
  onCancel,
  submitText,
}: {
  onCancel: () => void;
  submitText: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-gray-100 pt-5">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        {submitText}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal Shell */
/* -------------------------------------------------------------------------- */

function ModalShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/40 p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-99 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="pr-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}