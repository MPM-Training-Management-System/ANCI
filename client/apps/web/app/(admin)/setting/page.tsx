"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import type {
  UpdateTrainerProfileRequest,
} from "@repo/types";

import {
  authAPIs,
  trainerApi,
} from "@/lib/api";

import {
  useForgotPassword,
  useTrainerMe,
} from "@repo/hooks";


// ============================================================
// HELPERS
// ============================================================

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatStatus(
  status?: string | null
) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2");
}


// ============================================================
// PAGE
// ============================================================

export default function TrainerSettingsPage() {
  // ==========================================================
  // TRAINER PROFILE
  // ==========================================================

  const {
    profile,
    isLoading,
    isUpdating,
    error,
    updateError,
    updateSuccess,
    refetch,
    updateProfile,
    resetUpdateState,
  } = useTrainerMe(trainerApi);


  // ==========================================================
  // PASSWORD
  // ==========================================================

  const {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    isLoading: isPasswordLoading,
    error: passwordError,
    success: passwordSuccess,
    reset: resetPasswordState,
  } = useForgotPassword(authAPIs);


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    isEditProfileOpen,
    setIsEditProfileOpen,
  ] = useState(false);

  const [
    isPasswordModalOpen,
    setIsPasswordModalOpen,
  ] = useState(false);

  const [
    passwordStep,
    setPasswordStep,
  ] = useState<
    "email" | "otp" | "password" | "success"
  >("email");

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    otpCode,
    setOtpCode,
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
    notifications,
    setNotifications,
  ] = useState({
    email: true,
    reminders: true,
    announcements: true,
  });


  // ==========================================================
  // EDIT FORM STATE
  // ==========================================================

  const [
    firstName,
    setFirstName,
  ] = useState("");

  const [
    middleName,
    setMiddleName,
  ] = useState("");

  const [
    lastName,
    setLastName,
  ] = useState("");

  const [
    birthDate,
    setBirthDate,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    gender,
    setGender,
  ] = useState("");

  const [
    mobileNumber,
    setMobileNumber,
  ] = useState("");

  const [
    specialization,
    setSpecialization,
  ] = useState("");

  const [
    bio,
    setBio,
  ] = useState("");

  const [
    yearsOfExperience,
    setYearsOfExperience,
  ] = useState("");


  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const displayName =
    profile?.fullName?.trim() ||
    "Trainer";

  const profileEmail =
    profile?.email?.trim() ||
    "No email available";

  const profileImage =
    profile?.profileImageUrl ||
    null;

  const initials = useMemo(() => {
    const first =
      profile?.firstName?.trim()?.charAt(0) ||
      "";

    const last =
      profile?.lastName?.trim()?.charAt(0) ||
      "";

    const value =
      `${first}${last}`.toUpperCase();

    return value || "T";
  }, [
    profile?.firstName,
    profile?.lastName,
  ]);


  // ==========================================================
  // SYNC PROFILE → EDIT FORM
  // ==========================================================

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFirstName(
      profile.firstName ?? ""
    );

    setMiddleName(
      profile.middleName ?? ""
    );

    setLastName(
      profile.lastName ?? ""
    );

    setBirthDate(
      profile.birthDate
        ? profile.birthDate.substring(0, 10)
        : ""
    );

    setAddress(
      profile.address ?? ""
    );

    setGender(
      profile.gender ?? ""
    );

    setMobileNumber(
      profile.mobileNumber ?? ""
    );

    setSpecialization(
      profile.specialization ?? ""
    );

    setBio(
      profile.bio ?? ""
    );

    setYearsOfExperience(
      profile.yearsOfExperience !== null &&
      profile.yearsOfExperience !== undefined
        ? String(profile.yearsOfExperience)
        : ""
    );
  }, [profile]);


  // ==========================================================
  // OPEN EDIT PROFILE
  // ==========================================================

  const openEditProfile = () => {
    resetUpdateState();

    if (profile) {
      setFirstName(
        profile.firstName ?? ""
      );

      setMiddleName(
        profile.middleName ?? ""
      );

      setLastName(
        profile.lastName ?? ""
      );

      setBirthDate(
        profile.birthDate
          ? profile.birthDate.substring(0, 10)
          : ""
      );

      setAddress(
        profile.address ?? ""
      );

      setGender(
        profile.gender ?? ""
      );

      setMobileNumber(
        profile.mobileNumber ?? ""
      );

      setSpecialization(
        profile.specialization ?? ""
      );

      setBio(
        profile.bio ?? ""
      );

      setYearsOfExperience(
        profile.yearsOfExperience !== null &&
        profile.yearsOfExperience !== undefined
          ? String(
              profile.yearsOfExperience
            )
          : ""
      );
    }

    setIsEditProfileOpen(true);
  };


  // ==========================================================
  // CLOSE EDIT PROFILE
  // ==========================================================

  const closeEditProfile = () => {
    if (isUpdating) {
      return;
    }

    setIsEditProfileOpen(false);
    resetUpdateState();
  };


  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleUpdateProfile =
    async () => {
      resetUpdateState();

      const parsedYears =
        yearsOfExperience.trim() === ""
          ? undefined
          : Number(yearsOfExperience);

      if (
        parsedYears !== undefined &&
        (
          Number.isNaN(parsedYears) ||
          parsedYears < 0 ||
          parsedYears > 100
        )
      ) {
        return;
      }

      const payload:
        UpdateTrainerProfileRequest = {
          firstName:
            firstName.trim() || undefined,

          middleName:
            middleName.trim() || undefined,

          lastName:
            lastName.trim() || undefined,

          birthDate:
            birthDate || null,

          address:
            address.trim() || undefined,

          gender:
            gender.trim() || undefined,

          mobileNumber:
            mobileNumber.trim() || undefined,

          specialization:
            specialization.trim() || undefined,

          bio:
            bio.trim() || undefined,

          yearsOfExperience:
            parsedYears,
        };

      const updated =
        await updateProfile(
          payload
        );

      if (updated) {
        setIsEditProfileOpen(false);
      }
    };


  // ==========================================================
  // OPEN PASSWORD MODAL
  // ==========================================================

  const openPasswordModal = () => {
    resetPasswordState();

    setEmail(
      profile?.email ?? ""
    );

    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordStep("email");

    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setIsPasswordModalOpen(true);
  };


  // ==========================================================
  // CLOSE PASSWORD MODAL
  // ==========================================================

  const closePasswordModal = () => {
    if (isPasswordLoading) {
      return;
    }

    setIsPasswordModalOpen(false);

    resetPasswordState();

    setEmail(
      profile?.email ?? ""
    );

    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordStep("email");

    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };


  // ==========================================================
  // SEND OTP
  // ==========================================================

  const handleSendOtp =
    async () => {
      if (!email.trim()) {
        return;
      }

      const response =
        await forgotPassword({
          email: email.trim(),
        });

      if (response?.success) {
        setPasswordStep("otp");
      }
    };


  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  const handleVerifyOtp =
    async () => {
      if (!email.trim() || !otpCode.trim()) {
        return;
      }

      const response =
        await verifyResetOtp({
          email: email.trim(),
          otpCode: otpCode.trim(),
        });

      if (response?.success) {
        setPasswordStep("password");
      }
    };


  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const handleResetPassword =
    async () => {
      if (
        !email.trim() ||
        !otpCode.trim() ||
        !newPassword ||
        !confirmPassword
      ) {
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return;
      }

      const response =
        await resetPassword({
          email: email.trim(),
          otpCode: otpCode.trim(),
          newPassword,
          confirmPassword,
        });

      if (response?.success) {
        setPasswordStep("success");
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Settings
              </h1>

              <p className="text-sm text-gray-500">
                Manage your trainer profile,
                password, and preferences.
              </p>
            </div>
          </div>
        </div>


        {/* =====================================================
            PROFILE CARD
        ====================================================== */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

          <div className="px-5 pb-5 sm:px-6">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">

                {/* PROFILE IMAGE */}

                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-blue-100 shadow-sm ring-1 ring-gray-200">

                  {isLoading ? (
                    <div className="h-full w-full animate-pulse bg-gray-200" />
                  ) : profileImage ? (
                    <img
                      src={profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700">
                      <span className="text-xl font-bold">
                        {initials}
                      </span>
                    </div>
                  )}

                </div>


                {/* PROFILE NAME */}

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLoading
                      ? "Loading..."
                      : displayName}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                      {profileEmail}
                    </span>

                    {profile?.isActive && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                </div>

              </div>


              {/* REFRESH */}

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isLoading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

            </div>
          </div>
        </section>


        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <X className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to load profile
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}


        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ===================================================
              LEFT / MAIN
          ==================================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* =================================================
                ACCOUNT
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <CircleUserRound className="h-5 w-5 text-blue-600" />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Account
                    </h3>

                    <p className="text-xs text-gray-500">
                      Manage your trainer information.
                    </p>
                  </div>
                </div>
              </div>


              <div className="divide-y divide-gray-100">

                {/* PROFILE */}

                <button
                  type="button"
                  onClick={openEditProfile}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        Profile Information
                      </p>

                      <p className="text-sm text-gray-500">
                        Update your personal and professional information.
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>


                {/* PASSWORD */}

                <button
                  type="button"
                  onClick={openPasswordModal}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <KeyRound className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        Change Password
                      </p>

                      <p className="text-sm text-gray-500">
                        Change your account password using email verification.
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>

              </div>
            </section>


            {/* =================================================
                PROFILE SUMMARY
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <h3 className="font-semibold text-gray-900">
                  Profile Information
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Your current trainer information.
                </p>
              </div>


              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

                <InfoItem
                  label="Full Name"
                  value={displayName}
                />

                <InfoItem
                  label="Email"
                  value={profileEmail}
                />

                <InfoItem
                  label="Mobile Number"
                  value={
                    profile?.mobileNumber ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="Gender"
                  value={
                    profile?.gender ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="Birth Date"
                  value={formatDate(
                    profile?.birthDate
                  )}
                />

                <InfoItem
                  label="Years of Experience"
                  value={
                    profile?.yearsOfExperience !==
                      null &&
                    profile?.yearsOfExperience !==
                      undefined
                      ? `${profile.yearsOfExperience} year${
                          profile.yearsOfExperience === 1
                            ? ""
                            : "s"
                        }`
                      : "Not provided"
                  }
                />

                <InfoItem
                  label="Specialization"
                  value={
                    profile?.specialization ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="Address"
                  value={
                    profile?.address ||
                    "Not provided"
                  }
                />

                <div className="sm:col-span-2">
                  <InfoItem
                    label="Bio"
                    value={
                      profile?.bio ||
                      "No bio provided."
                    }
                  />
                </div>

              </div>
            </section>

          </div>


          {/* ===================================================
              RIGHT
          ==================================================== */}

          <div className="space-y-6">

            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-600" />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>

                    <p className="text-xs text-gray-500">
                      Manage notification preferences.
                    </p>
                  </div>
                </div>
              </div>


              <div className="space-y-4 p-5">

                <ToggleRow
                  label="Email Notifications"
                  description="Receive important account updates."
                  checked={notifications.email}
                  onChange={(checked) =>
                    setNotifications(
                      (current) => ({
                        ...current,
                        email: checked,
                      })
                    )
                  }
                />

                <ToggleRow
                  label="Training Reminders"
                  description="Receive reminders for upcoming sessions."
                  checked={notifications.reminders}
                  onChange={(checked) =>
                    setNotifications(
                      (current) => ({
                        ...current,
                        reminders: checked,
                      })
                    )
                  }
                />

                <ToggleRow
                  label="Announcements"
                  description="Receive system announcements."
                  checked={notifications.announcements}
                  onChange={(checked) =>
                    setNotifications(
                      (current) => ({
                        ...current,
                        announcements: checked,
                      })
                    )
                  }
                />

              </div>
            </section>


            {/* =================================================
                SECURITY
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-5 w-5 text-purple-600" />

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Security
                    </h3>

                    <p className="text-xs text-gray-500">
                      Protect your account.
                    </p>
                  </div>
                </div>
              </div>


              <div className="p-5">

                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-green-600" />

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Account Security
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Keep your password private and update it regularly.
                      </p>
                    </div>
                  </div>
                </div>


                <button
                  type="button"
                  onClick={openPasswordModal}
                  className="mt-4 flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <KeyRound className="h-4 w-4 text-gray-500" />

                    <span className="text-sm font-medium text-gray-700">
                      Change Password
                    </span>
                  </span>

                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

              </div>
            </section>


            {/* =================================================
                ACCOUNT STATUS
            ================================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="font-semibold text-gray-900">
                  Account Status
                </h3>
              </div>

              <div className="space-y-4 p-5">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Account
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        profile?.isActive
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />

                    <span className="text-sm font-medium text-gray-700">
                      {profile?.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>


                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Activated
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {formatDate(
                      profile?.activatedAt
                    )}
                  </p>
                </div>

              </div>
            </section>

          </div>
        </div>
      </div>


      {/* ========================================================
          EDIT PROFILE MODAL
      ========================================================= */}

      {isEditProfileOpen && (
        <ModalOverlay
          onClose={closeEditProfile}
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your trainer information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditProfile}
                disabled={isUpdating}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>


            {/* BODY */}

            <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">

              {updateError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-semibold">
                    Unable to update profile
                  </p>

                  <p className="mt-1">
                    {updateError}
                  </p>
                </div>
              )}

              {updateSuccess && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle2 className="h-5 w-5" />

                  <span>
                    Profile updated successfully.
                  </span>
                </div>
              )}


              <div className="grid gap-5 sm:grid-cols-2">

                <FormField
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="Enter first name"
                />

                <FormField
                  label="Middle Name"
                  value={middleName}
                  onChange={setMiddleName}
                  placeholder="Enter middle name"
                />

                <FormField
                  label="Last Name"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Enter last name"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Birth Date
                  </label>

                  <input
                    type="date"
                    value={birthDate}
                    onChange={(event) =>
                      setBirthDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                <FormField
                  label="Mobile Number"
                  value={mobileNumber}
                  onChange={setMobileNumber}
                  placeholder="Enter mobile number"
                />


                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Gender
                  </label>

                  <select
                    value={gender}
                    onChange={(event) =>
                      setGender(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>


                <FormField
                  label="Specialization"
                  value={specialization}
                  onChange={setSpecialization}
                  placeholder="e.g. Mediation, Leadership"
                />


                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={yearsOfExperience}
                    onChange={(event) =>
                      setYearsOfExperience(
                        event.target.value
                      )
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    value={address}
                    onChange={(event) =>
                      setAddress(
                        event.target.value
                      )
                    }
                    rows={3}
                    placeholder="Enter your address"
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Bio
                  </label>

                  <textarea
                    value={bio}
                    onChange={(event) =>
                      setBio(
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Tell us about yourself and your professional experience."
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>
            </div>


            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

              <button
                type="button"
                onClick={closeEditProfile}
                disabled={isUpdating}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateProfile}
                disabled={
                  isUpdating ||
                  !specialization.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>

            </div>

          </div>
        </ModalOverlay>
      )}


      {/* ========================================================
          PASSWORD MODAL
      ========================================================= */}

      {isPasswordModalOpen && (
        <ModalOverlay
          onClose={closePasswordModal}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <KeyRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">
                    Change Password
                  </h2>

                  <p className="text-xs text-gray-500">
                    Securely update your password.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={isPasswordLoading}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

            </div>


            {/* PROGRESS */}

            {passwordStep !== "success" && (
              <div className="border-b border-gray-100 px-5 py-4">

                <div className="flex items-center">

                  <PasswordStepIndicator
                    number="1"
                    label="Email"
                    active={
                      passwordStep === "email"
                    }
                    completed={
                      passwordStep !== "email"
                    }
                  />

                  <div className="h-px flex-1 bg-gray-200" />

                  <PasswordStepIndicator
                    number="2"
                    label="OTP"
                    active={
                      passwordStep === "otp"
                    }
                    completed={
                      passwordStep === "password"
                    }
                  />

                  <div className="h-px flex-1 bg-gray-200" />

                  <PasswordStepIndicator
                    number="3"
                    label="Password"
                    active={
                      passwordStep === "password"
                    }
                    completed={false}
                  />

                </div>
              </div>
            )}


            {/* BODY */}

            <div className="p-5">

              {passwordError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}


              {/* EMAIL */}

              {passwordStep === "email" && (
                <div>

                  <div className="mb-5">
                    <h3 className="font-semibold text-gray-900">
                      Verify your email
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Enter your account email and we'll send you a verification code.
                    </p>
                  </div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={
                      isPasswordLoading ||
                      !email.trim()
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>

                </div>
              )}


              {/* OTP */}

              {passwordStep === "otp" && (
                <div>

                  <div className="mb-5">
                    <h3 className="font-semibold text-gray-900">
                      Enter verification code
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      We sent a verification code to{" "}
                      <span className="font-medium text-gray-700">
                        {email}
                      </span>
                    </p>
                  </div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={10}
                    value={otpCode}
                    onChange={(event) =>
                      setOtpCode(
                        event.target.value
                      )
                    }
                    placeholder="Enter OTP"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-lg font-semibold tracking-[0.35em] outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={
                      isPasswordLoading ||
                      !otpCode.trim()
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPasswordStep("email")
                    }
                    disabled={isPasswordLoading}
                    className="mt-3 w-full text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Use a different email
                  </button>

                </div>
              )}


              {/* NEW PASSWORD */}

              {passwordStep === "password" && (
                <div>

                  <div className="mb-5">
                    <h3 className="font-semibold text-gray-900">
                      Create a new password
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                      Choose a strong password for your account.
                    </p>
                  </div>


                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter new password"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-11 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>


                  <label className="mb-2 mt-4 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-11 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>


                  {confirmPassword &&
                    newPassword !==
                      confirmPassword && (
                      <p className="mt-2 text-xs text-red-600">
                        Passwords do not match.
                      </p>
                    )}


                  <button
                    type="button"
                    onClick={
                      handleResetPassword
                    }
                    disabled={
                      isPasswordLoading ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !==
                        confirmPassword
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>

                </div>
              )}


              {/* SUCCESS */}

              {passwordStep === "success" && (
                <div className="py-5 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-gray-900">
                    Password Updated
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    Your password has been updated successfully.
                    You can now use your new password the next time you sign in.
                  </p>

                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="mt-6 w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                  >
                    Done
                  </button>

                </div>
              )}

            </div>

          </div>
        </ModalOverlay>
      )}

    </div>
  );
}


// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}


// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}


// ============================================================
// TOGGLE ROW
// ============================================================

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">
          {label}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-600"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}


// ============================================================
// PASSWORD STEP INDICATOR
// ============================================================

function PasswordStepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: string;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">

      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
          completed
            ? "bg-green-600 text-white"
            : active
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          number
        )}
      </div>

      <span
        className={`text-[10px] font-medium ${
          active
            ? "text-purple-600"
            : "text-gray-400"
        }`}
      >
        {label}
      </span>

    </div>
  );
}


// ============================================================
// MODAL OVERLAY
// ============================================================

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}