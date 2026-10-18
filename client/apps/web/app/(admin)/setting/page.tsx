
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import type { UpdateTrainerProfileRequest } from "@repo/types";

import { authAPIs, trainerApi } from "@/lib/api";

import {
  useForgotPassword,
  useTrainerMe,
} from "@repo/hooks";
import { PageSection } from "@repo/ui/index";

// ============================================================
// HELPERS
// ============================================================

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#3B7597] focus:ring-4 focus:ring-[#3B7597]/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(first?: string | null, last?: string | null) {
  const initials =
    `${first?.trim()?.[0] ?? ""}${last?.trim()?.[0] ?? ""}`
      .toUpperCase();

  return initials || "T";
}

// ============================================================
// PAGE
// ============================================================

export default function TrainerSettingsPage() {
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

  const {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    isLoading: isPasswordLoading,
    error: passwordError,
    reset: resetPasswordState,
  } = useForgotPassword(authAPIs);

  // ----------------------------------------------------------
  // MODAL STATE
  // ----------------------------------------------------------

  const [isEditProfileOpen, setIsEditProfileOpen] =
    useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState(false);

  const [passwordStep, setPasswordStep] = useState<
    "email" | "otp" | "password" | "success"
  >("email");

  // ----------------------------------------------------------
  // PASSWORD FORM
  // ----------------------------------------------------------

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ----------------------------------------------------------
  // PROFILE FORM
  // ----------------------------------------------------------

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [yearsOfExperience, setYearsOfExperience] =
    useState("");

  // These preferences are local UI state until a backend
  // notification-preferences endpoint is connected.
  const [notifications, setNotifications] = useState({
    email: true,
    reminders: true,
    announcements: true,
  });

  // ----------------------------------------------------------
  // PROFILE DISPLAY DATA
  // ----------------------------------------------------------

  const displayName =
    profile?.fullName?.trim() || "Trainer";

  const profileEmail =
    profile?.email?.trim() || "No email available";

  const profileImage = profile?.profileImageUrl || null;

  const initials = useMemo(
    () => getInitials(profile?.firstName, profile?.lastName),
    [profile?.firstName, profile?.lastName]
  );

  // ----------------------------------------------------------
  // SYNC PROFILE TO FORM
  // ----------------------------------------------------------

  useEffect(() => {
    if (!profile) return;

    setFirstName(profile.firstName ?? "");
    setMiddleName(profile.middleName ?? "");
    setLastName(profile.lastName ?? "");

    setBirthDate(
      profile.birthDate
        ? profile.birthDate.substring(0, 10)
        : ""
    );

    setAddress(profile.address ?? "");
    setGender(profile.gender ?? "");
    setMobileNumber(profile.mobileNumber ?? "");
    setSpecialization(profile.specialization ?? "");
    setBio(profile.bio ?? "");

    setYearsOfExperience(
      profile.yearsOfExperience != null
        ? String(profile.yearsOfExperience)
        : ""
    );
  }, [profile]);

  // ----------------------------------------------------------
  // OPEN / CLOSE PROFILE MODAL
  // ----------------------------------------------------------

  function openEditProfile() {
    resetUpdateState();
    setIsEditProfileOpen(true);
  }

  function closeEditProfile() {
    if (isUpdating) return;

    setIsEditProfileOpen(false);
    resetUpdateState();
  }

  // ----------------------------------------------------------
  // UPDATE PROFILE
  // ----------------------------------------------------------

  async function handleUpdateProfile() {
    resetUpdateState();

    const parsedYears =
      yearsOfExperience.trim() === ""
        ? undefined
        : Number(yearsOfExperience);

    if (
      parsedYears !== undefined &&
      (!Number.isFinite(parsedYears) ||
        parsedYears < 0 ||
        parsedYears > 100)
    ) {
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    const payload: UpdateTrainerProfileRequest = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      birthDate: birthDate || null,
      address: address.trim() || undefined,
      gender: gender.trim() || undefined,
      mobileNumber: mobileNumber.trim() || undefined,
      specialization: specialization.trim() || undefined,
      bio: bio.trim() || undefined,
      yearsOfExperience: parsedYears,
    };

    const updated = await updateProfile(payload);

    if (updated) {
      setIsEditProfileOpen(false);
    }
  }

  // ----------------------------------------------------------
  // PASSWORD MODAL
  // ----------------------------------------------------------

  function openPasswordModal() {
    resetPasswordState();

    setEmail(profile?.email ?? "");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStep("email");
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setIsPasswordModalOpen(true);
  }

  function closePasswordModal() {
    if (isPasswordLoading) return;

    setIsPasswordModalOpen(false);
    resetPasswordState();

    setEmail(profile?.email ?? "");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStep("email");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  async function handleSendOtp() {
    if (!email.trim()) return;

    const response = await forgotPassword({
      email: email.trim(),
    });

    if (response?.success) {
      setPasswordStep("otp");
    }
  }

  async function handleVerifyOtp() {
    if (!email.trim() || !otpCode.trim()) return;

    const response = await verifyResetOtp({
      email: email.trim(),
      otpCode: otpCode.trim(),
    });

    if (response?.success) {
      setPasswordStep("password");
    }
  }

  async function handleResetPassword() {
    if (
      !email.trim() ||
      !otpCode.trim() ||
      !newPassword ||
      !confirmPassword ||
      newPassword !== confirmPassword
    ) {
      return;
    }

    const response = await resetPassword({
      email: email.trim(),
      otpCode: otpCode.trim(),
      newPassword,
      confirmPassword,
    });

    if (response?.success) {
      setPasswordStep("success");
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-800">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">

       <PageSection
       className="mb-5"
       title="Account Settings"
       description=" Manage your personal information, professional
              profile, and account security in one place."
              actions={
                 <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#3B7597]/40 hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            Refresh Profile
          </button>
              }
       ></PageSection>

       

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#0d2142] shadow-lg shadow-slate-900/5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d2142] via-[#123d65] to-[#3B7597]" />

          <div className="absolute -right-12 -top-28 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-16 h-52 w-52 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 right-1/3 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/30 bg-white/10 text-3xl font-bold text-white shadow-xl sm:h-28 sm:w-28">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : profileImage ? (
                    <img
                      src={profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                <span
                  className={`absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#123d65] ${
                    profile?.isActive
                      ? "bg-emerald-400"
                      : "bg-slate-400"
                  }`}
                  title={profile?.isActive ? "Active" : "Inactive"}
                >
                  {profile?.isActive ? (
                    <Check className="h-3.5 w-3.5 text-[#0d2142]" />
                  ) : (
                    <Clock3 className="h-3 w-3 text-white" />
                  )}
                </span>
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                    Trainer Account
                  </span>

                  {profile?.isActive && (
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Active
                    </span>
                  )}
                </div>

                <h2 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {isLoading ? "Loading profile..." : displayName}
                </h2>

                <p className="mt-2 flex items-center gap-2 break-all text-sm text-blue-100/80">
                  <Mail className="h-4 w-4 shrink-0" />
                  {profileEmail}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-blue-100/70">
                  <BriefcaseBusiness className="h-4 w-4 shrink-0" />
                  {profile?.specialization || "Professional Trainer"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openEditProfile}
              disabled={isLoading || !profile}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0d2142] shadow-lg transition hover:bg-blue-50 disabled:opacity-50"
            >
              <UserRound className="h-4 w-4" />
              Edit Profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative grid grid-cols-1 divide-y divide-white/10 border-t border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <HeroStat
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              label="Specialization"
              value={profile?.specialization || "Not specified"}
            />

            <HeroStat
              icon={<Activity className="h-4 w-4" />}
              label="Experience"
              value={
                profile?.yearsOfExperience != null
                  ? `${profile.yearsOfExperience} ${
                      profile.yearsOfExperience === 1
                        ? "year"
                        : "years"
                    }`
                  : "Not provided"
              }
            />

            <HeroStat
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Account Status"
              value={profile?.isActive ? "Active Account" : "Inactive Account"}
            />
          </div>
        </section>

        {/* PROFILE ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <X className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Unable to load your profile</p>
              <p className="mt-1">{error}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}

        <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* LEFT COLUMN */}

          <div className="min-w-0 space-y-7">

            {/* PROFILE INFORMATION */}

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
              <SectionHeader
                icon={<CircleUserRound className="h-5 w-5" />}
                title="Personal Information"
                description="Your personal and contact details."
                action={
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="text-sm font-bold text-[#3B7597] transition hover:text-[#0d2142]"
                  >
                    Edit
                  </button>
                }
              />

              {isLoading ? (
                <div className="grid gap-6 p-6 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="animate-pulse">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                      <div className="mt-3 h-5 w-40 max-w-full rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-x-8 gap-y-7 p-5 sm:grid-cols-2 sm:p-7">
                  <InfoItem
                    icon={<UserRound />}
                    label="Full Name"
                    value={displayName}
                  />

                  <InfoItem
                    icon={<Mail />}
                    label="Email Address"
                    value={profileEmail}
                  />

                  <InfoItem
                    icon={<Phone />}
                    label="Mobile Number"
                    value={profile?.mobileNumber || "Not provided"}
                  />

                  <InfoItem
                    icon={<CalendarDays />}
                    label="Date of Birth"
                    value={formatDate(profile?.birthDate)}
                  />

                  <InfoItem
                    icon={<UserRound />}
                    label="Gender"
                    value={profile?.gender || "Not provided"}
                  />

                  <InfoItem
                    icon={<MapPin />}
                    label="Address"
                    value={profile?.address || "Not provided"}
                  />
                </div>
              )}
            </section>

            {/* PROFESSIONAL PROFILE */}

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
              <SectionHeader
                icon={<BriefcaseBusiness className="h-5 w-5" />}
                title="Professional Profile"
                description="Your experience, expertise, and trainer biography."
                action={
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="text-sm font-bold text-[#3B7597] transition hover:text-[#0d2142]"
                  >
                    Edit
                  </button>
                }
              />

              <div className="space-y-6 p-5 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#24577f]">
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Specialization
                    </p>
                    <p className="mt-2 break-words text-base font-bold text-[#0d2142]">
                      {profile?.specialization || "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                      <Activity className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Years of Experience
                    </p>
                    <p className="mt-2 text-base font-bold text-[#0d2142]">
                      {profile?.yearsOfExperience != null
                        ? `${profile.yearsOfExperience} ${
                            profile.yearsOfExperience === 1
                              ? "year"
                              : "years"
                          }`
                        : "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#3B7597]" />
                    <h4 className="text-sm font-bold text-slate-800">
                      About Me
                    </h4>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-4 sm:p-5">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {profile?.bio?.trim() ||
                        "You haven't added a professional biography yet. Add a short introduction about your background, expertise, and training experience."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ACCOUNT ACTIONS */}

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
              <SectionHeader
                icon={<LockKeyhole className="h-5 w-5" />}
                title="Account & Security"
                description="Manage your sign-in credentials and account protection."
              />

              <div className="p-5 sm:p-7">
                <button
                  type="button"
                  onClick={openPasswordModal}
                  className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-[#3B7597]/40 hover:bg-slate-50 sm:p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100">
                    <KeyRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">
                      Change Password
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Verify your email and create a new password.
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#3B7597]" />
                </button>

                <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50/80 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-bold text-emerald-900">
                      Protect your account
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                      Never share your password or email verification
                      codes with anyone.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="space-y-6">

            {/* ACCOUNT STATUS */}

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
              <SectionHeader
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Account Status"
                description="Your current account information."
              />

              <div className="space-y-5 p-5">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      profile?.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {profile?.isActive ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock3 className="h-5 w-5" />
                    )}
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {profile?.isActive ? "Active Account" : "Inactive Account"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {profile?.isActive
                        ? "Your trainer account is active."
                        : "Some trainer features may be unavailable."}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Activation Date
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {formatDate(profile?.activatedAt)}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Account Role
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-[#24577f]">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Trainer
                  </p>
                </div>
              </div>
            </section>

            {/* NOTIFICATIONS */}

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
              <SectionHeader
                icon={<Bell className="h-5 w-5" />}
                title="Notifications"
                description="Manage your notification preferences."
              />

              <div className="divide-y divide-slate-100 px-5">
                <ToggleRow
                  label="Email Notifications"
                  description="Important account updates."
                  checked={notifications.email}
                  onChange={(checked) =>
                    setNotifications((current) => ({
                      ...current,
                      email: checked,
                    }))
                  }
                />

                <ToggleRow
                  label="Training Reminders"
                  description="Upcoming training sessions."
                  checked={notifications.reminders}
                  onChange={(checked) =>
                    setNotifications((current) => ({
                      ...current,
                      reminders: checked,
                    }))
                  }
                />

                <ToggleRow
                  label="Announcements"
                  description="System announcements."
                  checked={notifications.announcements}
                  onChange={(checked) =>
                    setNotifications((current) => ({
                      ...current,
                      announcements: checked,
                    }))
                  }
                />
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                <p className="text-xs leading-5 text-slate-500">
                  Notification switches are currently local
                  preferences and are not saved to the backend.
                </p>
              </div>
            </section>

            {/* QUICK ACTION */}

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2142] to-[#24577f] p-5 text-white shadow-lg shadow-blue-950/10">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/10" />
              <div className="absolute -right-2 -top-2 h-20 w-20 rounded-full border border-white/10" />

              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <UserRound className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-bold">
                  Keep your profile updated
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-100/80">
                  Make sure your contact details and professional
                  information are accurate.
                </p>

                <button
                  type="button"
                  onClick={openEditProfile}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-cyan-200"
                >
                  Update profile
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </aside>
        </div>

        {/* FOOTER */}

        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>ACE NextGen Consultancy Inc.</p>
          <p>Trainer Account Settings</p>
        </footer>
      </div>

      {/* ======================================================
          EDIT PROFILE MODAL
      ====================================================== */}

      {isEditProfileOpen && (
        <ModalOverlay onClose={closeEditProfile}>
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#24577f]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0d2142]">
                    Edit Profile
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Update your personal and professional details.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditProfile}
                disabled={isUpdating}
                aria-label="Close edit profile"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-7">
              {updateError && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <X className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-bold">Unable to update profile</p>
                    <p className="mt-1">{updateError}</p>
                  </div>
                </div>
              )}

              {updateSuccess && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-bold">Profile updated successfully</p>
                    <p className="mt-1 text-xs">
                      Your changes have been saved.
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  Personal Details
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enter your name and contact information.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="First Name"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="Enter first name"
                  required
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
                  required
                />

                <FormField
                  label="Mobile Number"
                  value={mobileNumber}
                  onChange={setMobileNumber}
                  placeholder="Enter mobile number"
                  type="tel"
                />

                <div>
                  <label className={labelClass}>Birth Date</label>
                  <input
                    type="date"
                    value={birthDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(event) => setBirthDate(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Gender</label>
                  <select
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mb-6 mt-8 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  Professional Details
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Describe your area of expertise and experience.
                </p>
              </div>

              <div className="space-y-5">
                <FormField
                  label="Specialization"
                  value={specialization}
                  onChange={setSpecialization}
                  placeholder="e.g. Mediation, Leadership"
                  required
                />

                <div>
                  <label className={labelClass}>
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={yearsOfExperience}
                    onChange={(event) =>
                      setYearsOfExperience(event.target.value)
                    }
                    placeholder="Enter years of experience"
                    className={inputClass}
                  />
                  {yearsOfExperience !== "" &&
                    (!Number.isFinite(Number(yearsOfExperience)) ||
                      Number(yearsOfExperience) < 0 ||
                      Number(yearsOfExperience) > 100 ||
                      !Number.isInteger(Number(yearsOfExperience))) && (
                      <p className="mt-2 text-xs text-red-600">
                        Enter a whole number from 0 to 100.
                      </p>
                    )}
                </div>

                <div>
                  <label className={labelClass}>Address</label>
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    rows={3}
                    placeholder="Enter your complete address"
                    className={`${inputClass} resize-y`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Professional Biography</label>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={5}
                    maxLength={2000}
                    placeholder="Describe your professional background, expertise, and training experience..."
                    className={`${inputClass} resize-y`}
                  />
                  <p className="mt-2 text-right text-xs text-slate-400">
                    {bio.length}/2000 characters
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeEditProfile}
                disabled={isUpdating}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateProfile}
                disabled={
                  isUpdating ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !specialization.trim() ||
                  (yearsOfExperience.trim() !== "" &&
                    (!Number.isInteger(Number(yearsOfExperience)) ||
                      Number(yearsOfExperience) < 0 ||
                      Number(yearsOfExperience) > 100))
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d2142] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#16365f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
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

      {/* ======================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}

      {isPasswordModalOpen && (
        <ModalOverlay onClose={closePasswordModal}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-[#0d2142] px-6 py-6 text-white">
              <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/10" />
              <div className="absolute -right-2 -top-6 h-24 w-24 rounded-full border border-white/10" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold">
                    Change Password
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-blue-100/80">
                    Secure your account with a new password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={isPasswordLoading}
                  aria-label="Close change password"
                  className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {passwordStep !== "success" && (
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center">
                  <PasswordStepIndicator
                    number="1"
                    label="Email"
                    active={passwordStep === "email"}
                    completed={passwordStep !== "email"}
                  />
                  <div
                    className={`mx-2 h-px flex-1 ${
                      passwordStep !== "email"
                        ? "bg-emerald-400"
                        : "bg-slate-200"
                    }`}
                  />
                  <PasswordStepIndicator
                    number="2"
                    label="Verify"
                    active={passwordStep === "otp"}
                    completed={
                      passwordStep === "password"
                    }
                  />
                  <div
                    className={`mx-2 h-px flex-1 ${
                      passwordStep === "password"
                        ? "bg-emerald-400"
                        : "bg-slate-200"
                    }`}
                  />
                  <PasswordStepIndicator
                    number="3"
                    label="Password"
                    active={passwordStep === "password"}
                    completed={false}
                  />
                </div>
              </div>
            )}

            <div className="p-6">
              {passwordError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">
                  {passwordError}
                </div>
              )}

              {/* EMAIL STEP */}

              {passwordStep === "email" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSendOtp();
                  }}
                >
                  <h3 className="font-bold text-slate-900">
                    Verify your email
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    We'll send a verification code to your
                    registered email address.
                  </p>

                  <div className="mt-5">
                    <label className={labelClass}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPasswordLoading || !email.trim()}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2142] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#16365f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OTP STEP */}

              {passwordStep === "otp" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleVerifyOtp();
                  }}
                >
                  <h3 className="font-bold text-slate-900">
                    Enter verification code
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter the code sent to{" "}
                    <span className="break-all font-semibold text-slate-700">
                      {email}
                    </span>
                    .
                  </p>

                  <div className="mt-5">
                    <label className={labelClass}>
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={10}
                      required
                      value={otpCode}
                      onChange={(event) =>
                        setOtpCode(event.target.value)
                      }
                      placeholder="Enter your code"
                      className={`${inputClass} text-center text-lg font-bold tracking-[0.3em]`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPasswordLoading || !otpCode.trim()}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2142] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#16365f] disabled:cursor-not-allowed disabled:opacity-50"
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
                    onClick={() => {
                      setPasswordStep("email");
                      setOtpCode("");
                      resetPasswordState();
                    }}
                    disabled={isPasswordLoading}
                    className="mt-4 w-full text-sm font-semibold text-slate-500 transition hover:text-[#24577f] disabled:opacity-50"
                  >
                    Use a different email
                  </button>
                </form>
              )}

              {/* NEW PASSWORD STEP */}

              {passwordStep === "password" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleResetPassword();
                  }}
                >
                  <h3 className="font-bold text-slate-900">
                    Create a new password
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose a password that you don't use for
                    other accounts.
                  </p>

                  <div className="mt-5">
                    <label className={labelClass}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        placeholder="Enter new password"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        aria-label={
                          showNewPassword
                            ? "Hide new password"
                            : "Show new password"
                        }
                        onClick={() =>
                          setShowNewPassword((current) => !current)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className={labelClass}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Confirm new password"
                        className={`${inputClass} pr-12 ${
                          confirmPassword &&
                          confirmPassword !== newPassword
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {confirmPassword &&
                      confirmPassword !== newPassword && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          Passwords do not match.
                        </p>
                      )}
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs leading-5 text-slate-500">
                      Use at least 8 characters, or follow any
                      stronger password requirements configured
                      by your backend.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isPasswordLoading ||
                      newPassword.length < 8 ||
                      !confirmPassword ||
                      newPassword !== confirmPassword
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2142] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#16365f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SUCCESS STEP */}

              {passwordStep === "success" && (
                <div className="py-5 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    Password Updated!
                  </h3>

                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Your password has been updated successfully.
                    Use your new password the next time you sign in.
                  </p>

                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="mt-6 w-full rounded-xl bg-[#0d2142] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#16365f]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </main>
  );
}

// ============================================================
// HERO STAT
// ============================================================

function HeroStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <span className="text-blue-200/80">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-blue-100/60">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-bold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf2f8] text-[#24577f]">
          {icon}
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="font-bold text-[#0d2142]">
            {title}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            {description}
          </p>
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================
// INFORMATION ITEM
// ============================================================

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1.5 break-words text-sm font-semibold leading-6 text-slate-700">
          {value}
        </p>
      </div>
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
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

// ============================================================
// NOTIFICATION TOGGLE
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
    <div className="flex items-center justify-between gap-4 py-5">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">
          {label}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#24577f]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

// ============================================================
// PASSWORD STEP
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
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
          completed
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-[#0d2142] text-white"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {completed ? (
          <Check className="h-4 w-4" />
        ) : (
          number
        )}
      </div>

      <span
        className={`text-[11px] font-semibold ${
          active
            ? "text-[#0d2142]"
            : completed
              ? "text-emerald-600"
              : "text-slate-400"
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
      className="fixed inset-0 z-999 flex items-center justify-center overflow-y-auto bg-[#071426]/60 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}
