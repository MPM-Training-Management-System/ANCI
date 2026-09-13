/* TrainerRegisterPage.tsx */
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  useRegisterTrainer,
  RegisterTrainerFormValues,
} from "@/hooks/useRegisterTrainer";
import { authApi } from "@/lib/api";

import {
  getBarangays,
  getMunicipalities,
  getProvinces,
  type PsgcBarangay,
  type PsgcItem,
  type PsgcMunicipality,
} from "@/lib/psgc";

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  yearsOfExperience: string;
  certificationName: string;
  certificationNumber: string;
  profileImage: File | null;
}

interface AddressData {
  houseNumber: string;
  street: string;
  sitio: string;
  provinceCode: string;
  provinceName: string;
  municipalityCode: string;
  municipalityName: string;
  barangayCode: string;
  barangayName: string;
}

const initialForm: FormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  specialization: "",
  yearsOfExperience: "",
  certificationName: "",
  certificationNumber: "",
  profileImage: null,
};

const initialAddress: AddressData = {
  houseNumber: "",
  street: "",
  sitio: "",
  provinceCode: "",
  provinceName: "",
  municipalityCode: "",
  municipalityName: "",
  barangayCode: "",
  barangayName: "",
};

export default function TrainerRegisterPage() {
  const router = useRouter();

  const { registerTrainer, isLoading, error } =
    useRegisterTrainer(authApi);

  const [form, setForm] = useState<FormData>(initialForm);
  const [address, setAddress] = useState<AddressData>(initialAddress);

  const [provinces, setProvinces] = useState<PsgcItem[]>([]);
  const [municipalities, setMunicipalities] = useState<PsgcMunicipality[]>([]);
  const [barangays, setBarangays] = useState<PsgcBarangay[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setAddressLoading(true);
        const result = await getProvinces();
        setProvinces(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Province loading error:", err);
        setLocalError("Unable to load provinces.");
      } finally {
        setAddressLoading(false);
      }
    };

    loadProvinces();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setLocalError(null);
  };

  const handleProvinceChange = async (provinceCode: string) => {
    const selected = provinces.find((item) => item.code === provinceCode);

    setAddress((current) => ({
      ...current,
      provinceCode,
      provinceName: selected?.name ?? "",
      municipalityCode: "",
      municipalityName: "",
      barangayCode: "",
      barangayName: "",
    }));

    setMunicipalities([]);
    setBarangays([]);

    if (!provinceCode) return;

    try {
      setAddressLoading(true);
      const result = await getMunicipalities(provinceCode);
      setMunicipalities(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Municipality loading error:", err);
      setLocalError("Unable to load municipalities.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleMunicipalityChange = async (municipalityCode: string) => {
    const selected = municipalities.find(
      (item) => item.code === municipalityCode
    );

    setAddress((current) => ({
      ...current,
      municipalityCode,
      municipalityName: selected?.name ?? "",
      barangayCode: "",
      barangayName: "",
    }));

    setBarangays([]);

    if (!municipalityCode) return;

    try {
      setAddressLoading(true);
      const result = await getBarangays(municipalityCode);
      setBarangays(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Barangay loading error:", err);
      setLocalError("Unable to load barangays.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleBarangayChange = (barangayCode: string) => {
    const selected = barangays.find((item) => item.code === barangayCode);

    setAddress((current) => ({
      ...current,
      barangayCode,
      barangayName: selected?.name ?? "",
    }));

    setLocalError(null);
  };

  const completeAddress = [
    address.houseNumber.trim(),
    address.street.trim(),
    address.sitio.trim(),
    address.barangayName,
    address.municipalityName,
    address.provinceName,
  ]
    .filter(Boolean)
    .join(", ");

  const handleProfileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setLocalError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLocalError("Profile image must be 2MB or smaller.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setForm((current) => ({ ...current, profileImage: file }));
    setPreview(URL.createObjectURL(file));
    setLocalError(null);
  };

  const removeProfileImage = () => {
    if (preview) URL.revokeObjectURL(preview);

    setForm((current) => ({ ...current, profileImage: null }));
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const response = await authApi.sendOtp({ email });

      if (!response.success) {
        setOtpError(
          response.message || "Unable to send verification code."
        );
        return false;
      }

      setOtpSuccess("Verification code sent successfully.");
      return true;
    } catch (err) {
      console.error("SEND OTP ERROR:", err);
      setOtpError(
        err instanceof Error
          ? err.message
          : "Unable to send verification code."
      );
      return false;
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    setOtpSuccess(null);

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      setOtpError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setOtpError("OTP must be 6 digits.");
      return;
    }

    try {
      setOtpLoading(true);

      const response = await authApi.verifyOtp({
        email: registeredEmail,
        otpCode: cleanOtp,
      });

      if (!response.success) {
        setOtpError(response.message || "Invalid or expired OTP.");
        return;
      }

      setOtpSuccess("Email verified successfully!");
      setOtp("");

      setTimeout(() => {
        setShowOtpModal(false);
        router.push("/login?verified=true");
      }, 1000);
    } catch (err) {
      console.error("VERIFY OTP ERROR:", err);
      setOtpError(
        err instanceof Error ? err.message : "Unable to verify OTP."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(null);
    setOtpSuccess(null);
    setOtp("");
    await sendOtp(registeredEmail);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const checks: [boolean, string][] = [
      [!!form.firstName.trim(), "First name is required."],
      [!!form.lastName.trim(), "Last name is required."],
      [!!form.birthDate, "Birth date is required."],
      [!!form.gender, "Please select your gender."],
      [!!address.houseNumber.trim(), "House / building number is required."],
      [!!address.provinceCode, "Please select a province."],
      [
        !!address.municipalityCode,
        "Please select a municipality or city.",
      ],
      [!!address.barangayCode, "Please select a barangay."],
      [!!form.email.trim(), "Email is required."],
      [!!form.password, "Password is required."],
      [
        form.password.length >= 8,
        "Password must be at least 8 characters.",
      ],
      [
        form.password === form.confirmPassword,
        "Passwords do not match.",
      ],
      [!!form.specialization.trim(), "Specialization is required."],
    ];

    for (const [valid, message] of checks) {
      if (!valid) {
        setLocalError(message);
        return;
      }
    }

    const email = form.email.trim().toLowerCase();

    const values: RegisterTrainerFormValues = {
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim(),
      lastName: form.lastName.trim(),
      birthDate: form.birthDate,
      address: completeAddress,
      gender: form.gender,
      email,
      mobileNumber: form.mobileNumber.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      specialization: form.specialization.trim(),
      yearsOfExperience: form.yearsOfExperience
        ? Number(form.yearsOfExperience)
        : undefined,
      certificationName: form.certificationName.trim(),
      certificationNumber: form.certificationNumber.trim(),
      profileImage: form.profileImage ?? undefined,
    };

    const response = await registerTrainer(values);

    if (!response) return;

    setRegisteredEmail(email);
    setOtp("");
    setOtpError(null);
    setOtpSuccess("Registration submitted. Sending verification code...");
    setShowOtpModal(true);

    await sendOtp(email);
  };

  const displayError = localError || error;

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#172033]">
      {/* Subtle grid — same visual language as the landing page */}
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-50 [background-image:linear-gradient(#dfe5ee_1px,transparent_1px),linear-gradient(90deg,#dfe5ee_1px,transparent_1px)] [background-size:42px_42px]" />

      <header className="relative z-20 border-b border-[#e6eaf0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-7 lg:px-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#092653] text-white shadow-[0_5px_16px_rgba(9,38,83,0.16)]">
              <AceLogo />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.15em] text-[#172033]">
                ACE
              </p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#8a94a6]">
                Next Gen Consultancy Inc.
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-3 text-sm text-[#697386] sm:flex">
            <span>Already registered?</span>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-semibold text-[#1769e0] hover:underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 py-7 sm:px-7 lg:px-8 lg:py-10">
        <div className="mb-7 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe4eb] bg-white text-[#596579] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f8fafc]"
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>

          <div className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#98a2b3] md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />
            Secure Trainer Application
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-[#e2e7ee] bg-white shadow-[0_22px_70px_rgba(16,24,40,0.10)] lg:grid lg:grid-cols-[310px_minmax(0,1fr)]">
          {/* BRAND PANEL */}
          <aside className="relative hidden overflow-hidden bg-[#092653] lg:block">
            <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[#1769a8]/35" />
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#123c79]/75" />
            <div className="absolute right-[-50px] top-[42%] h-44 w-44 rounded-full border border-white/10" />
            <div className="absolute left-10 top-[45%] h-16 w-16 rounded-full bg-[#C5A059]/10" />

            <div className="relative flex min-h-[860px] flex-col justify-between p-9 xl:p-10">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#092653] shadow-lg">
                    <AceLogo />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.16em] text-white">
                      ACE
                    </p>
                    <p className="text-[10px] tracking-[0.18em] text-white/55">
                      NEXT GEN
                    </p>
                  </div>
                </div>

                <div className="mt-20">
                  <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.24em] text-[#C5A059]">
                    Trainer Portal
                  </p>

                  <h2 className="text-[38px] font-semibold leading-[1.08] tracking-[-0.045em] text-white">
                    Build Your
                    <br />
                    Trainer
                    <br />
                    Profile.
                  </h2>

                  <p className="mt-6 max-w-[245px] text-sm leading-7 text-white/60">
                    Join the ACE NextGen training network and manage your
                    professional training journey through one secure platform.
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-8 h-px w-full bg-white/10" />

                <div className="space-y-4">
                  <Step number="01" title="Create your profile" active />
                  <Step number="02" title="Verify your email" />
                  <Step number="03" title="Application review" />
                </div>

                <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]">
                      <ShieldIcon />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                        Secure Registration
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/60">
                        Your information is submitted for account creation
                        and trainer application review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* FORM AREA */}
          <section className="min-w-0 bg-white px-5 py-7 sm:px-8 sm:py-9 lg:px-10 xl:px-12">
            <div className="mx-auto max-w-[850px]">
              <div className="mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1769e0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1769e0]" />
                  Trainer Registration
                </div>

                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033] sm:text-[30px]">
                  Create your trainer account
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#697386]">
                  Complete your profile and professional information to apply
                  for access to the ACE NextGen Trainer Portal.
                </p>
              </div>

              {displayError && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  <AlertIcon />
                  <span>{displayError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-[0_5px_24px_rgba(20,35,60,0.035)] sm:p-6">
                  <SectionHeader
                    icon={<UserIcon />}
                    title="Personal Information"
                    description="Basic information about you."
                  />

                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <InputField
                        label="First Name"
                        required
                        placeholder="Enter first name"
                        value={form.firstName}
                        onChange={(value) => updateField("firstName", value)}
                      />
                      <InputField
                        label="Middle Name"
                        placeholder="Enter middle name"
                        value={form.middleName}
                        onChange={(value) => updateField("middleName", value)}
                      />
                      <InputField
                        label="Last Name"
                        required
                        placeholder="Enter last name"
                        value={form.lastName}
                        onChange={(value) => updateField("lastName", value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InputField
                        label="Birth Date"
                        required
                        type="date"
                        value={form.birthDate}
                        onChange={(value) => updateField("birthDate", value)}
                      />
                      <SelectField
                        label="Gender"
                        required
                        value={form.gender}
                        onChange={(value) => updateField("gender", value)}
                        options={[
                          { label: "Select gender", value: "" },
                          { label: "Male", value: "Male" },
                          { label: "Female", value: "Female" },
                          {
                            label: "Prefer not to say",
                            value: "Prefer not to say",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-[0_5px_24px_rgba(20,35,60,0.035)] sm:p-6">
                  <SectionHeader
                    icon={<ImageIcon />}
                    title="Profile Photo"
                    description="Optional profile photo."
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfileImage}
                    className="hidden"
                  />

                  <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-dashed border-[#cfd7e3] bg-[#f9fbfe] p-6 sm:flex-row">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#dfe4eb]">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-[#b0b8c5]">
                          <UserIcon size={40} />
                        </div>
                      )}
                    </div>

                    <div className="text-center sm:text-left">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#dfe4eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] transition hover:border-[#1769e0] hover:bg-[#f8fbff]"
                      >
                        <UploadIcon />
                        {preview ? "Change Photo" : "Upload Photo"}
                      </button>

                      <p className="mt-2 text-xs text-[#8a94a6]">
                        JPG, PNG or WEBP · Maximum 2MB
                      </p>

                      {preview && (
                        <button
                          type="button"
                          onClick={removeProfileImage}
                          className="mt-2 text-xs font-semibold text-[#697386] hover:text-red-600"
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-[0_5px_24px_rgba(20,35,60,0.035)] sm:p-6">
                  <SectionHeader
                    icon={<LocationIcon />}
                    title="Address Information"
                    description="Select your location details."
                  />

                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InputField
                        label="House / Building Number"
                        required
                        placeholder="e.g. 123"
                        value={address.houseNumber}
                        onChange={(value) =>
                          setAddress((current) => ({
                            ...current,
                            houseNumber: value,
                          }))
                        }
                      />
                      <InputField
                        label="Street"
                        placeholder="e.g. Rizal Street"
                        value={address.street}
                        onChange={(value) =>
                          setAddress((current) => ({
                            ...current,
                            street: value,
                          }))
                        }
                      />
                    </div>

                    <InputField
                      label="Sitio / Purok"
                      placeholder="Optional"
                      value={address.sitio}
                      onChange={(value) =>
                        setAddress((current) => ({
                          ...current,
                          sitio: value,
                        }))
                      }
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <SelectField
                        label="Province"
                        required
                        value={address.provinceCode}
                        onChange={handleProvinceChange}
                        options={[
                          {
                            label:
                              addressLoading && provinces.length === 0
                                ? "Loading..."
                                : "Select province",
                            value: "",
                          },
                          ...provinces.map((province) => ({
                            label: province.name,
                            value: province.code,
                          })),
                        ]}
                      />

                      <SelectField
                        label="Municipality / City"
                        required
                        disabled={!address.provinceCode}
                        value={address.municipalityCode}
                        onChange={handleMunicipalityChange}
                        options={[
                          {
                            label: "Select municipality / city",
                            value: "",
                          },
                          ...municipalities.map((municipality) => ({
                            label: municipality.name,
                            value: municipality.code,
                          })),
                        ]}
                      />

                      <SelectField
                        label="Barangay"
                        required
                        disabled={!address.municipalityCode}
                        value={address.barangayCode}
                        onChange={handleBarangayChange}
                        options={[
                          { label: "Select barangay", value: "" },
                          ...barangays.map((barangay) => ({
                            label: barangay.name,
                            value: barangay.code,
                          })),
                        ]}
                      />
                    </div>

                    {completeAddress && (
                      <div className="rounded-xl border border-[#dfe8f7] bg-[#f8fbff] px-4 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8a94a6]">
                          Complete Address
                        </p>
                        <p className="mt-1 text-sm leading-5 text-[#344054]">
                          {completeAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-[0_5px_24px_rgba(20,35,60,0.035)] sm:p-6">
                  <SectionHeader
                    icon={<BriefcaseIcon />}
                    title="Professional Details"
                    description="Tell us about your training background."
                  />

                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InputField
                      label="Specialization"
                      required
                      placeholder="e.g. Leadership Training"
                      value={form.specialization}
                      onChange={(value) =>
                        updateField("specialization", value)
                      }
                    />

                    <InputField
                      label="Years of Experience"
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={form.yearsOfExperience}
                      onChange={(value) =>
                        updateField("yearsOfExperience", value)
                      }
                    />

                    <InputField
                      label="Certification Name"
                      placeholder="e.g. TESDA NC II"
                      value={form.certificationName}
                      onChange={(value) =>
                        updateField("certificationName", value)
                      }
                    />

                    <InputField
                      label="Certification Number"
                      placeholder="Certification number"
                      value={form.certificationNumber}
                      onChange={(value) =>
                        updateField("certificationNumber", value)
                      }
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e5e9ef] bg-white p-5 shadow-[0_5px_24px_rgba(20,35,60,0.035)] sm:p-6">
                  <SectionHeader
                    icon={<LockIcon />}
                    title="Account Information"
                    description="Credentials and contact information."
                  />

                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InputField
                      label="Email Address"
                      required
                      type="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={(value) => updateField("email", value)}
                    />

                    <InputField
                      label="Mobile Number"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={form.mobileNumber}
                      onChange={(value) =>
                        updateField("mobileNumber", value)
                      }
                    />

                    <PasswordField
                      label="Password"
                      required
                      value={form.password}
                      visible={showPassword}
                      onToggle={() => setShowPassword((value) => !value)}
                      onChange={(value) => updateField("password", value)}
                    />

                    <PasswordField
                      label="Confirm Password"
                      required
                      value={form.confirmPassword}
                      visible={showConfirmPassword}
                      onToggle={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      onChange={(value) =>
                        updateField("confirmPassword", value)
                      }
                    />
                  </div>

                  <p className="mt-3 text-xs text-[#8a94a6]">
                    Password must contain at least 8 characters.
                  </p>
                </section>

                <section className="flex gap-4 rounded-2xl border border-[#dfe8f7] bg-[#f8fbff] p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1769e0] shadow-sm">
                    <InfoIcon />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-[#243047]">
                      What happens next?
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#697386]">
                      Submit your registration, verify your email using the
                      OTP, then wait for the administrator to review your
                      trainer application.
                    </p>
                  </div>
                </section>

                <div className="flex flex-col-reverse gap-3 border-t border-[#e8ebf0] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#697386]">
                    Already have an account?
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="ml-1 font-semibold text-[#1769e0] hover:underline"
                    >
                      Sign in
                    </button>
                  </p>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="rounded-xl border border-[#dfe4eb] bg-white px-6 py-3 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc]"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#092653] px-7 py-3 text-sm font-semibold text-white shadow-[0_5px_16px_rgba(9,38,83,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0c326b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? "Submitting..." : "Continue to Verification"}
                      {!isLoading && <ArrowRightIcon />}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>

      {showOtpModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#101828]/55 px-5 backdrop-blur-sm"
          onClick={() => {
            if (!otpLoading) {
              setShowOtpModal(false);
              setOtp("");
              setOtpError(null);
              setOtpSuccess(null);
            }
          }}
        >
          <div
            className="relative w-full max-w-[440px] rounded-[28px] border border-[#e5e9ef] bg-white p-7 shadow-[0_30px_90px_rgba(16,24,40,0.22)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              disabled={otpLoading}
              onClick={() => {
                setShowOtpModal(false);
                setOtp("");
                setOtpError(null);
                setOtpSuccess(null);
              }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#98a2b3] transition hover:bg-[#f2f4f7] hover:text-[#344054] disabled:opacity-50"
              aria-label="Close verification dialog"
            >
              <CloseIcon />
            </button>

            <div className="flex justify-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-[#092653] text-white shadow-[0_8px_20px_rgba(9,38,83,0.15)]">
                <AceLogo size={32} />
              </div>
            </div>

            <div className="mt-5 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                Email Verification
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#172033]">
                Verify your email
              </h2>

              <p className="mx-auto mt-2 max-w-[340px] text-sm leading-6 text-[#697386]">
                Enter the 6-digit verification code we sent to your email.
              </p>

              <div className="mt-4 rounded-xl bg-[#f8fbff] px-4 py-3">
                <p className="break-all text-sm font-semibold text-[#1769e0]">
                  {registeredEmail}
                </p>
              </div>
            </div>

            <div className="mt-7">
              <label className="mb-2 block text-xs font-semibold text-[#344054]">
                Verification Code
              </label>

              <input
                autoFocus
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setOtp(value);
                  setOtpError(null);
                  setOtpSuccess(null);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    otp.length === 6 &&
                    !otpLoading
                  ) {
                    handleVerifyOtp();
                  }
                }}
                placeholder="000000"
                className="w-full rounded-2xl border border-[#dfe4eb] bg-[#fcfdff] px-4 py-4 text-center text-2xl font-semibold tracking-[0.4em] text-[#172033] outline-none transition placeholder:text-[#c4cad4] focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-[#1769e0]/10"
              />

              {otpError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  {otpError}
                </div>
              )}

              {otpSuccess && !otpError && (
                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs leading-5 text-green-700">
                  {otpSuccess}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={otpLoading || otp.length !== 6}
              onClick={handleVerifyOtp}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#092653] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_5px_16px_rgba(9,38,83,0.16)] transition hover:bg-[#0c326b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {otpLoading ? "Verifying..." : "Verify Email"}
              {!otpLoading && <ArrowRightIcon />}
            </button>

            <div className="mt-5 text-center">
              <p className="text-xs text-[#8a94a6]">Didn't receive the code?</p>

              <button
                type="button"
                disabled={otpLoading}
                onClick={handleResendOtp}
                className="mt-1 text-xs font-semibold text-[#1769e0] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resend verification code
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Step({
  number,
  title,
  active = false,
}: {
  number: string;
  title: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-[9px] font-bold ${
          active
            ? "border-[#C5A059] bg-[#C5A059] text-[#092653]"
            : "border-white/15 bg-white/5 text-white/45"
        }`}
      >
        {number}
      </div>
      <span
        className={`text-xs ${
          active ? "font-semibold text-white" : "text-white/45"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef4ff] text-[#1769e0]">
        {icon}
      </div>
      <div>
        <h2 className="text-[15px] font-semibold text-[#243047]">{title}</h2>
        <p className="mt-0.5 text-xs text-[#8a94a6]">{description}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  required,
  placeholder,
  value,
  onChange,
  type = "text",
  min,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#344054]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 text-sm text-[#172033] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/10"
      />
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#344054]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 pr-10 text-sm text-[#172033] outline-none transition focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/10 disabled:cursor-not-allowed disabled:bg-[#f7f8fa] disabled:text-[#98a2b3]"
        >
          {options.map((option) => (
            <option key={option.value || option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8a94a6]">
          <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  required,
  value,
  visible,
  onToggle,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-[#344054]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={label}
          className="w-full rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 pr-12 text-sm text-[#172033] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/10"
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
    </div>
  );
}

function Svg({
  children,
  size = 18,
  strokeWidth = 1.8,
}: {
  children: React.ReactNode;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Svg>
  );
}

function ImageIcon() {
  return (
    <Svg>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </Svg>
  );
}

function UploadIcon() {
  return (
    <Svg size={18}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </Svg>
  );
}

function BriefcaseIcon() {
  return (
    <Svg>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

function LocationIcon() {
  return (
    <Svg>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Svg>
  );
}

function AlertIcon() {
  return (
    <div className="mt-0.5">
      <Svg size={17}>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4" />
        <path d="M12 16h.01" />
      </Svg>
    </div>
  );
}

function ShieldIcon() {
  return (
    <Svg size={16}>
      <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg size={16}>
      <path d="m6 9 6 6 6-6" />
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

function CloseIcon() {
  return (
    <Svg>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Svg>
  );
}

function ArrowLeftIcon() {
  return (
    <Svg>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg size={17} strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}
