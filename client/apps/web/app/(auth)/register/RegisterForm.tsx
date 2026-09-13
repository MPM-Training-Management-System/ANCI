/* TrainerRegisterForm.tsx */
"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { useForm, type UseFormRegister } from "react-hook-form";

import {
  useRegisterTrainer,
  RegisterTrainerFormValues,
} from "@/hooks/useRegisterTrainer";
import { authApi } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 text-sm text-[#172033] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/10";

export default function TrainerRegisterForm() {
  const { registerTrainer, isLoading, error } =
    useRegisterTrainer(authApi);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterTrainerFormValues>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      specialization: "",
      yearsOfExperience: undefined,
      certificationName: "",
      certificationNumber: "",
      profileImage: undefined,
    },
  });

  const [profileImage, setProfileImage] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must not exceed 5MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: RegisterTrainerFormValues) => {
    if (!agreeTerms) {
      alert("Please agree to the Terms and Conditions.");
      return;
    }

    const email = data.email.trim().toLowerCase();

    const registration = await registerTrainer({
      ...data,
      email,
      profileImage,
    });

    if (!registration) return;

    try {
      const otpResponse = await authApi.sendOtp({ email });

      if (!otpResponse.success) {
        alert(otpResponse.message || "Unable to send OTP.");
        return;
      }

      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to send OTP.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-5 py-8 text-[#172033] sm:px-8 lg:py-12">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-50 [background-image:linear-gradient(#dfe5ee_1px,transparent_1px),linear-gradient(90deg,#dfe5ee_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 mx-auto max-w-[1060px]">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#092653] text-white shadow-[0_5px_16px_rgba(9,38,83,0.16)]">
              <AceLogo />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.15em]">
                ACE
              </p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a94a6]">
                Next Gen Consultancy Inc.
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="hidden text-sm font-semibold text-[#1769e0] hover:underline sm:block"
          >
            Already have an account? Sign in
          </Link>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[#e2e7ee] bg-white shadow-[0_22px_70px_rgba(16,24,40,0.10)]">
          <div className="bg-[#092653] px-6 py-8 text-white sm:px-9">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#092653]">
                <AceLogo />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A059]">
                  Trainer Portal
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  Create your trainer account
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                  Complete your profile and professional information to apply
                  for access to the ACE NextGen Trainer Portal.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-9">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <section>
                <SectionTitle
                  title="Profile Photo"
                  description="Optional trainer profile photo."
                />

                <div className="mt-4 flex flex-col items-center gap-5 rounded-2xl border border-dashed border-[#cfd7e3] bg-[#f9fbfe] p-6 sm:flex-row">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#b0b8c5] ring-1 ring-[#dfe4eb]">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon size={40} />
                    )}
                  </div>

                  <div className="text-center sm:text-left">
                    <label
                      htmlFor="profileImage"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dfe4eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:border-[#1769e0] hover:bg-[#f8fbff]"
                    >
                      <UploadIcon />
                      {preview ? "Change Photo" : "Choose Photo"}
                    </label>

                    <input
                      id="profileImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    <p className="mt-2 text-xs text-[#8a94a6]">
                      JPG, PNG or WEBP · Maximum 5MB
                    </p>

                    {profileImage && (
                      <p className="mt-2 max-w-[280px] truncate text-xs font-medium text-[#1769e0]">
                        {profileImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <SectionTitle
                  title="Personal Information"
                  description="Tell us who you are."
                />

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Field
                    label="First Name"
                    error={errors.firstName?.message}
                  >
                    <input
                      {...register("firstName", {
                        required: "First name is required.",
                      })}
                      placeholder="Juan"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Middle Name"
                    error={errors.middleName?.message}
                  >
                    <input
                      {...register("middleName")}
                      placeholder="Dela"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Last Name"
                    error={errors.lastName?.message}
                  >
                    <input
                      {...register("lastName", {
                        required: "Last name is required.",
                      })}
                      placeholder="Cruz"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <SectionTitle
                  title="Account Information"
                  description="Your login and contact details."
                />

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Email" error={errors.email?.message}>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required.",
                      })}
                      placeholder="juan@email.com"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Mobile Number"
                    error={errors.mobileNumber?.message}
                  >
                    <input
                      type="tel"
                      {...register("mobileNumber")}
                      placeholder="09123456789"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <SectionTitle
                  title="Professional Information"
                  description="Your experience and qualifications."
                />

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field
                    label="Specialization"
                    error={errors.specialization?.message}
                  >
                    <input
                      {...register("specialization", {
                        required: "Specialization is required.",
                      })}
                      placeholder="e.g. Leadership Training"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Years of Experience"
                    error={errors.yearsOfExperience?.message}
                  >
                    <input
                      type="number"
                      min="0"
                      {...register("yearsOfExperience", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      })}
                      placeholder="5"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Certification Name"
                    error={errors.certificationName?.message}
                  >
                    <input
                      {...register("certificationName")}
                      placeholder="e.g. TESDA NC II"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Certification Number"
                    error={errors.certificationNumber?.message}
                  >
                    <input
                      {...register("certificationNumber")}
                      placeholder="Certification number"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </section>

              <section>
                <SectionTitle
                  title="Password"
                  description="Secure your trainer account."
                />

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <PasswordField
                    label="Password"
                    error={errors.password?.message}
                    register={register}
                    field="password"
                    visible={showPassword}
                    onToggle={() => setShowPassword((value) => !value)}
                  />

                  <PasswordField
                    label="Confirm Password"
                    error={errors.confirmPassword?.message}
                    register={register}
                    field="confirmPassword"
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                  />
                </div>

                <p className="mt-3 text-xs text-[#8a94a6]">
                  Password must contain at least 8 characters.
                </p>
              </section>

              <div className="flex gap-4 rounded-2xl border border-[#dfe8f7] bg-[#f8fbff] p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1769e0] shadow-sm">
                  <ShieldIcon />
                </div>

                <p className="text-xs leading-5 text-[#697386]">
                  After registration, you will verify your email using an OTP
                  before continuing to the trainer application process.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e8ebf0] bg-[#f9fafb] p-4">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) =>
                    setAgreeTerms(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-[#cfd7e3]"
                />

                <span className="text-sm leading-6 text-[#596579]">
                  I agree to the Terms and Conditions and Privacy Policy.
                </span>
              </label>

              <div className="border-t border-[#e8ebf0] pt-6">
                <button
                  type="submit"
                  disabled={isLoading || !agreeTerms}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#092653] px-5 py-3.5 text-sm font-bold text-white shadow-[0_5px_16px_rgba(9,38,83,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0c326b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading
                    ? "Creating Account..."
                    : "Continue to Verification"}
                  {!isLoading && <ArrowRightIcon />}
                </button>
              </div>

              <p className="text-center text-sm text-[#697386]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#1769e0] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#243047]">{title}</h2>
      <p className="mt-1 text-xs text-[#8a94a6]">{description}</p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#344054]">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  error,
  register,
  field,
  visible,
  onToggle,
}: {
  label: string;
  error?: string;
  register: UseFormRegister<RegisterTrainerFormValues>;
  field: "password" | "confirmPassword";
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          {...register(field, {
            required:
              field === "password"
                ? "Password is required."
                : "Please confirm your password.",
            ...(field === "password"
              ? {
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters.",
                  },
                }
              : {}),
          })}
          placeholder={label}
          className={`${inputClass} pr-12`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8a94a6] hover:text-[#1769e0]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </Field>
  );
}

function Svg({
  children,
  size = 18,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function AceLogo({ size = 25 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M28 65 42 31h10l20 34h-11l-4-8H39l-3 8H28Z"
        fill="currentColor"
      />
      <path d="M43 49h11l-5-11-6 11Z" fill="white" />
      <path d="M62 31h12v34H62z" fill="currentColor" />
    </svg>
  );
}

function UserIcon({ size = 38 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Svg>
  );
}

function UploadIcon() {
  return (
    <Svg size={17}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg size={17}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg size={17}>
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </Svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <Svg>
      {visible ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18.7 18.7 0 0 1-3.1 4.2" />
          <path d="M6.2 6.2C3.6 8 2 12 2 12s3.5 8 10 8a10.5 10.5 0 0 0 3.1-.5" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </Svg>
  );
}
