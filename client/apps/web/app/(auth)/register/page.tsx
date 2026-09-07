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

// ============================================================
// FORM TYPES
// ============================================================

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

// ============================================================
// INITIAL DATA
// ============================================================

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

// ============================================================
// PAGE
// ============================================================

export default function TrainerRegisterPage() {
  const router = useRouter();

  // ==========================================================
  // REGISTER HOOK
  // ==========================================================

  const {
    registerTrainer,
    isLoading,
    error,
  } = useRegisterTrainer(authApi);

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] =
    useState<FormData>(
      initialForm
    );

  // ==========================================================
  // ADDRESS
  // ==========================================================

  const [address, setAddress] =
    useState<AddressData>(
      initialAddress
    );

  const [provinces, setProvinces] =
    useState<PsgcItem[]>([]);

  const [municipalities, setMunicipalities] =
    useState<PsgcMunicipality[]>([]);

  const [barangays, setBarangays] =
    useState<PsgcBarangay[]>([]);

  const [addressLoading, setAddressLoading] =
    useState(false);

  // ==========================================================
  // IMAGE
  // ==========================================================

  const [preview, setPreview] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  // ==========================================================
  // PASSWORD
  // ==========================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==========================================================
  // ERROR
  // ==========================================================

  const [localError, setLocalError] =
    useState<string | null>(null);

  // ==========================================================
  // OTP MODAL
  // ==========================================================

  const [showOtpModal, setShowOtpModal] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [otpError, setOtpError] =
    useState<string | null>(null);

  const [otpSuccess, setOtpSuccess] =
    useState<string | null>(null);

  const [registeredEmail, setRegisteredEmail] =
    useState("");

  // ==========================================================
  // LOAD PROVINCES
  // ==========================================================

  useEffect(() => {
    const loadProvinces =
      async () => {
        try {
          setAddressLoading(true);

          const result =
            await getProvinces();

          setProvinces(
            Array.isArray(result)
              ? result
              : []
          );
        } catch (error) {
          console.error(
            "Province loading error:",
            error
          );

          setLocalError(
            "Unable to load provinces."
          );
        } finally {
          setAddressLoading(false);
        }
      };

    loadProvinces();
  }, []);

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setLocalError(null);
  };

  // ==========================================================
  // PROVINCE
  // ==========================================================

  const handleProvinceChange =
    async (
      provinceCode: string
    ) => {
      const selected =
        provinces.find(
          (province) =>
            province.code ===
            provinceCode
        );

      setAddress(
        (current) => ({
          ...current,

          provinceCode,

          provinceName:
            selected?.name ??
            "",

          municipalityCode: "",
          municipalityName: "",

          barangayCode: "",
          barangayName: "",
        })
      );

      setMunicipalities([]);

      setBarangays([]);

      if (!provinceCode) {
        return;
      }

      try {
        setAddressLoading(true);

        const result =
          await getMunicipalities(
            provinceCode
          );

        setMunicipalities(
          Array.isArray(result)
            ? result
            : []
        );
      } catch (error) {
        console.error(
          "Municipality loading error:",
          error
        );

        setLocalError(
          "Unable to load municipalities."
        );
      } finally {
        setAddressLoading(false);
      }
    };

  // ==========================================================
  // MUNICIPALITY
  // ==========================================================

  const handleMunicipalityChange =
    async (
      municipalityCode: string
    ) => {
      const selected =
        municipalities.find(
          (municipality) =>
            municipality.code ===
            municipalityCode
        );

      setAddress(
        (current) => ({
          ...current,

          municipalityCode,

          municipalityName:
            selected?.name ??
            "",

          barangayCode: "",
          barangayName: "",
        })
      );

      setBarangays([]);

      if (!municipalityCode) {
        return;
      }

      try {
        setAddressLoading(true);

        const result =
          await getBarangays(
            municipalityCode
          );

        setBarangays(
          Array.isArray(result)
            ? result
            : []
        );
      } catch (error) {
        console.error(
          "Barangay loading error:",
          error
        );

        setLocalError(
          "Unable to load barangays."
        );
      } finally {
        setAddressLoading(false);
      }
    };

  // ==========================================================
  // BARANGAY
  // ==========================================================

  const handleBarangayChange = (
    barangayCode: string
  ) => {
    const selected =
      barangays.find(
        (barangay) =>
          barangay.code ===
          barangayCode
      );

    setAddress(
      (current) => ({
        ...current,

        barangayCode,

        barangayName:
          selected?.name ??
          "",
      })
    );
  };

  // ==========================================================
  // COMPLETE ADDRESS
  // ==========================================================

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

  // ==========================================================
  // IMAGE
  // ==========================================================

  const handleProfileImage = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setLocalError(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setLocalError(
        "Profile image must be 2MB or smaller."
      );

      return;
    }

    setForm(
      (current) => ({
        ...current,
        profileImage: file,
      })
    );

    setPreview(
      URL.createObjectURL(file)
    );

    setLocalError(null);
  };

  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  const removeProfileImage =
    () => {
      setForm(
        (current) => ({
          ...current,
          profileImage: null,
        })
      );

      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    };

  // ==========================================================
  // SEND OTP
  // ==========================================================

  const sendOtp = async (
    email: string
  ) => {
    try {
      console.log(
        "Sending OTP:",
        email
      );

      const response =
        await authApi.sendOtp({
          email,
        });

      console.log(
        "SEND OTP RESPONSE:",
        response
      );

      if (!response.success) {
        setOtpError(
          response.message ||
            "Unable to send verification code."
        );

        return false;
      }

      setOtpSuccess(
        "Verification code sent successfully."
      );

      return true;
    } catch (error) {
      console.error(
        "SEND OTP ERROR:",
        error
      );

      setOtpError(
        error instanceof Error
          ? error.message
          : "Unable to send verification code."
      );

      return false;
    }
  };

  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  const handleVerifyOtp =
    async () => {
      setOtpError(null);
      setOtpSuccess(null);

      const cleanOtp =
        otp.trim();

      if (!cleanOtp) {
        setOtpError(
          "Please enter the OTP."
        );

        return;
      }

      if (
        cleanOtp.length !== 6
      ) {
        setOtpError(
          "OTP must be 6 digits."
        );

        return;
      }

      try {
        setOtpLoading(true);

        console.log(
          "Verifying OTP:",
          {
            email:
              registeredEmail,
            otp:
              cleanOtp,
          }
        );

        const response =
          await authApi.verifyOtp({
            email:
              registeredEmail,
            otpCode:
              cleanOtp,
          });

        console.log(
          "VERIFY OTP RESPONSE:",
          response
        );

        if (!response.success) {
          setOtpError(
            response.message ||
              "Invalid or expired OTP."
          );

          return;
        }

        setOtpSuccess(
          "Email verified successfully!"
        );

        setOtp("");

        setTimeout(() => {
          setShowOtpModal(false);

          router.push(
            "/login?verified=true"
          );
        }, 1000);

      } catch (error) {
        console.error(
          "VERIFY OTP ERROR:",
          error
        );

        setOtpError(
          error instanceof Error
            ? error.message
            : "Unable to verify OTP."
        );
      } finally {
        setOtpLoading(false);
      }
    };

  // ==========================================================
  // RESEND OTP
  // ==========================================================

  const handleResendOtp =
    async () => {
      setOtpError(null);
      setOtpSuccess(null);

      setOtp("");

      await sendOtp(
        registeredEmail
      );
    };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setLocalError(null);

      // ======================================================
      // VALIDATION
      // ======================================================

      if (
        !form.firstName.trim()
      ) {
        setLocalError(
          "First name is required."
        );

        return;
      }

      if (
        !form.lastName.trim()
      ) {
        setLocalError(
          "Last name is required."
        );

        return;
      }

      if (!form.birthDate) {
        setLocalError(
          "Birth date is required."
        );

        return;
      }

      if (!form.gender) {
        setLocalError(
          "Please select your gender."
        );

        return;
      }

      if (
        !address.houseNumber.trim()
      ) {
        setLocalError(
          "House / building number is required."
        );

        return;
      }

      if (!address.provinceCode) {
        setLocalError(
          "Please select a province."
        );

        return;
      }

      if (
        !address.municipalityCode
      ) {
        setLocalError(
          "Please select a municipality or city."
        );

        return;
      }

      if (
        !address.barangayCode
      ) {
        setLocalError(
          "Please select a barangay."
        );

        return;
      }

      if (!form.email.trim()) {
        setLocalError(
          "Email is required."
        );

        return;
      }

      if (!form.password) {
        setLocalError(
          "Password is required."
        );

        return;
      }

      if (
        form.password.length < 8
      ) {
        setLocalError(
          "Password must be at least 8 characters."
        );

        return;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        setLocalError(
          "Passwords do not match."
        );

        return;
      }

      if (
        !form.specialization.trim()
      ) {
        setLocalError(
          "Specialization is required."
        );

        return;
      }

      // ======================================================
      // EMAIL
      // ======================================================

      const email =
        form.email
          .trim()
          .toLowerCase();

      // ======================================================
      // ADDRESS
      // ======================================================

      const finalAddress = [
        address.houseNumber.trim(),
        address.street.trim(),
        address.sitio.trim(),
        address.barangayName,
        address.municipalityName,
        address.provinceName,
      ]
        .filter(Boolean)
        .join(", ");

      // ======================================================
      // REGISTER REQUEST
      // ======================================================

      const values:
        RegisterTrainerFormValues = {
        firstName:
          form.firstName.trim(),

        middleName:
          form.middleName.trim(),

        lastName:
          form.lastName.trim(),

        birthDate:
          form.birthDate,

        address:
          finalAddress,

        gender:
          form.gender,

        email,

        mobileNumber:
          form.mobileNumber.trim(),

        password:
          form.password,

        confirmPassword:
          form.confirmPassword,

        specialization:
          form.specialization.trim(),

        yearsOfExperience:
          form.yearsOfExperience
            ? Number(
                form.yearsOfExperience
              )
            : undefined,

        certificationName:
          form.certificationName.trim(),

        certificationNumber:
          form.certificationNumber.trim(),

        profileImage:
          form.profileImage ??
          undefined,
      };

      // ======================================================
      // REGISTER
      // ======================================================

      console.log(
        "REGISTERING TRAINER..."
      );

      const response =
        await registerTrainer(
          values
        );

      console.log(
        "REGISTER RESPONSE:",
        response
      );

      // ======================================================
      // IMPORTANT
      // ======================================================
      //
      // We do NOT rely only on response.success.
      // If a response exists, registration reached
      // the API successfully.
      //
      // ======================================================

      if (!response) {
        return;
      }

      // ======================================================
      // OPEN MODAL FIRST
      // ======================================================

      setRegisteredEmail(
        email
      );

      setOtp("");

      setOtpError(null);

      setOtpSuccess(
        "Registration submitted. Sending verification code..."
      );

      setShowOtpModal(true);

      // ======================================================
      // SEND OTP
      // ======================================================

      await sendOtp(email);
    };

  // ==========================================================
  // ERROR
  // ==========================================================

  const displayError =
    localError ||
    error;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#fafbfc] text-[#172033]">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="border-b border-[#e8ebf0] bg-white">

        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4ff] text-[#1769e0]">
              <HomeIcon />
            </div>

            <span className="text-[17px] font-semibold">
              Ace Next Gen
            </span>

          </button>

          <div className="hidden items-center gap-2 text-sm text-[#697386] sm:flex">

            <span>
              Already registered?
            </span>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/login"
                )
              }
              className="font-medium text-[#1769e0] hover:underline"
            >
              Login
            </button>

          </div>

        </div>

      </header>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* ==================================================
            TITLE
        ================================================== */}

        <div className="mb-8 flex items-start gap-4">

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3e7ed] bg-white text-[#596579] transition hover:bg-[#f8fafc]"
          >
            <ArrowLeftIcon />
          </button>

          <div>

            <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-[#1769e0]">
              Trainer Registration
            </p>

            <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              Create your trainer account
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#697386]">
              Provide your personal and professional
              information to apply as a trainer.
            </p>

          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {displayError && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {displayError}
          </div>

        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">

            {/* =================================================
                PERSONAL
            ================================================== */}

            <section className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-[0_2px_10px_rgba(20,35,60,0.025)] sm:p-7">

              <SectionHeader
                icon={<UserIcon />}
                title="Personal Information"
                description="Basic information about you."
              />

              <div className="mt-7 space-y-5">

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <InputField
                    label="First Name"
                    required
                    placeholder="Enter first name"
                    value={
                      form.firstName
                    }
                    onChange={(value) =>
                      updateField(
                        "firstName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Middle Name"
                    placeholder="Enter middle name"
                    value={
                      form.middleName
                    }
                    onChange={(value) =>
                      updateField(
                        "middleName",
                        value
                      )
                    }
                  />

                </div>

                <InputField
                  label="Last Name"
                  required
                  placeholder="Enter last name"
                  value={
                    form.lastName
                  }
                  onChange={(value) =>
                    updateField(
                      "lastName",
                      value
                    )
                  }
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <InputField
                    label="Birth Date"
                    required
                    type="date"
                    value={
                      form.birthDate
                    }
                    onChange={(value) =>
                      updateField(
                        "birthDate",
                        value
                      )
                    }
                  />

                  <SelectField
                    label="Gender"
                    required
                    value={
                      form.gender
                    }
                    onChange={(value) =>
                      updateField(
                        "gender",
                        value
                      )
                    }
                    options={[
                      {
                        label:
                          "Select gender",
                        value: "",
                      },
                      {
                        label:
                          "Male",
                        value:
                          "Male",
                      },
                      {
                        label:
                          "Female",
                        value:
                          "Female",
                      },
                      {
                        label:
                          "Prefer not to say",
                        value:
                          "Prefer not to say",
                      },
                    ]}
                  />

                </div>

                {/* =================================================
                    ADDRESS
                ================================================== */}

                <div className="pt-3">

                  <div className="mb-4">

                    <h3 className="text-sm font-semibold text-[#344054]">
                      Address
                    </h3>

                    <p className="mt-1 text-xs text-[#8a94a6]">
                      Select your location. The system will
                      submit it as one complete address.
                    </p>

                  </div>

                  <div className="space-y-5">

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      <InputField
                        label="House / Building Number"
                        required
                        placeholder="e.g. 123"
                        value={
                          address.houseNumber
                        }
                        onChange={(value) =>
                          setAddress(
                            (
                              current
                            ) => ({
                              ...current,
                              houseNumber:
                                value,
                            })
                          )
                        }
                      />

                      <InputField
                        label="Street"
                        placeholder="e.g. Rizal Street"
                        value={
                          address.street
                        }
                        onChange={(value) =>
                          setAddress(
                            (
                              current
                            ) => ({
                              ...current,
                              street:
                                value,
                            })
                          )
                        }
                      />

                    </div>

                    <InputField
                      label="Sitio / Purok"
                      placeholder="Optional"
                      value={
                        address.sitio
                      }
                      onChange={(value) =>
                        setAddress(
                          (
                            current
                          ) => ({
                            ...current,
                            sitio:
                              value,
                          })
                        )
                      }
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                      <SelectField
                        label="Province"
                        required
                        value={
                          address.provinceCode
                        }
                        onChange={
                          handleProvinceChange
                        }
                        options={[
                          {
                            label:
                              addressLoading &&
                              provinces.length ===
                                0
                                ? "Loading..."
                                : "Select province",
                            value:
                              "",
                          },
                          ...provinces.map(
                            (
                              province
                            ) => ({
                              label:
                                province.name,
                              value:
                                province.code,
                            })
                          ),
                        ]}
                      />

                      <SelectField
                        label="Municipality / City"
                        required
                        disabled={
                          !address.provinceCode
                        }
                        value={
                          address.municipalityCode
                        }
                        onChange={
                          handleMunicipalityChange
                        }
                        options={[
                          {
                            label:
                              "Select municipality / city",
                            value:
                              "",
                          },
                          ...municipalities.map(
                            (
                              municipality
                            ) => ({
                              label:
                                municipality.name,
                              value:
                                municipality.code,
                            })
                          ),
                        ]}
                      />

                      <SelectField
                        label="Barangay"
                        required
                        disabled={
                          !address.municipalityCode
                        }
                        value={
                          address.barangayCode
                        }
                        onChange={
                          handleBarangayChange
                        }
                        options={[
                          {
                            label:
                              "Select barangay",
                            value:
                              "",
                          },
                          ...barangays.map(
                            (
                              barangay
                            ) => ({
                              label:
                                barangay.name,
                              value:
                                barangay.code,
                            })
                          ),
                        ]}
                      />

                    </div>

                    {completeAddress && (

                      <div className="rounded-xl border border-[#e3eaf5] bg-[#f8fbff] px-4 py-3">

                        <p className="text-[11px] font-medium uppercase tracking-wide text-[#8a94a6]">
                          Complete Address
                        </p>

                        <p className="mt-1 text-sm leading-5 text-[#344054]">
                          {completeAddress}
                        </p>

                      </div>

                    )}

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                RIGHT
            ================================================== */}

            <div className="space-y-5">

              {/* =================================================
                  PHOTO
              ================================================== */}

              <section className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-[0_2px_10px_rgba(20,35,60,0.025)]">

                <SectionHeader
                  icon={<ImageIcon />}
                  title="Profile Photo"
                  description="Optional"
                />

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleProfileImage
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="group mt-6 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#cfd7e3] bg-[#fcfdff] px-5 py-9 transition hover:border-[#1769e0] hover:bg-[#f8fbff]"
                >

                  {preview ? (

                    <img
                      src={
                        preview
                      }
                      alt="Profile preview"
                      className="h-32 w-32 rounded-full object-cover ring-4 ring-[#eef4ff]"
                    />

                  ) : (

                    <>
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#eef4ff] text-[#1769e0]">
                        <UploadIcon />
                      </div>

                      <span className="text-sm font-medium text-[#1769e0]">
                        Click to upload
                      </span>

                      <span className="mt-1 text-xs text-[#8a94a6]">
                        JPG, PNG or WEBP · Max 2MB
                      </span>
                    </>

                  )}

                </button>

                {preview && (

                  <button
                    type="button"
                    onClick={
                      removeProfileImage
                    }
                    className="mt-3 w-full text-center text-xs font-medium text-[#667085] hover:text-red-600"
                  >
                    Remove photo
                  </button>

                )}

              </section>

              {/* =================================================
                  PROFESSIONAL
              ================================================== */}

              <section className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-[0_2px_10px_rgba(20,35,60,0.025)]">

                <SectionHeader
                  icon={<BriefcaseIcon />}
                  title="Professional Details"
                  description="Your training background."
                />

                <div className="mt-6 space-y-5">

                  <InputField
                    label="Specialization"
                    required
                    placeholder="e.g. Leadership Training"
                    value={
                      form.specialization
                    }
                    onChange={(value) =>
                      updateField(
                        "specialization",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Years of Experience"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={
                      form.yearsOfExperience
                    }
                    onChange={(value) =>
                      updateField(
                        "yearsOfExperience",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Certification Name"
                    placeholder="e.g. TESDA NC II"
                    value={
                      form.certificationName
                    }
                    onChange={(value) =>
                      updateField(
                        "certificationName",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Certification Number"
                    placeholder="Certification number"
                    value={
                      form.certificationNumber
                    }
                    onChange={(value) =>
                      updateField(
                        "certificationNumber",
                        value
                      )
                    }
                  />

                </div>

              </section>

            </div>

          </div>

          {/* =================================================
              ACCOUNT
          ================================================== */}

          <section className="rounded-2xl border border-[#e5e9ef] bg-white p-6 shadow-[0_2px_10px_rgba(20,35,60,0.025)] sm:p-7">

            <SectionHeader
              icon={<LockIcon />}
              title="Account Information"
              description="Credentials for your trainer account."
            />

            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <InputField
                label="Email Address"
                required
                type="email"
                placeholder="Enter email address"
                value={
                  form.email
                }
                onChange={(value) =>
                  updateField(
                    "email",
                    value
                  )
                }
              />

              <InputField
                label="Mobile Number"
                type="tel"
                placeholder="Enter mobile number"
                value={
                  form.mobileNumber
                }
                onChange={(value) =>
                  updateField(
                    "mobileNumber",
                    value
                  )
                }
              />

              <PasswordField
                label="Password"
                required
                value={
                  form.password
                }
                visible={
                  showPassword
                }
                onToggle={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                onChange={(value) =>
                  updateField(
                    "password",
                    value
                  )
                }
              />

              <PasswordField
                label="Confirm Password"
                required
                value={
                  form.confirmPassword
                }
                visible={
                  showConfirmPassword
                }
                onToggle={() =>
                  setShowConfirmPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                onChange={(value) =>
                  updateField(
                    "confirmPassword",
                    value
                  )
                }
              />

            </div>

            <p className="mt-3 text-xs text-[#8a94a6]">
              Password must contain at least 8 characters.
            </p>

          </section>

          {/* =================================================
              REVIEW
          ================================================== */}

          <section className="flex gap-4 rounded-2xl border border-[#dfe8f7] bg-[#f8fbff] p-5">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1769e0] shadow-sm">
              <InfoIcon />
            </div>

            <div>

              <h3 className="text-sm font-semibold text-[#243047]">
                Application Review
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#697386]">
                After submitting your registration,
                verify your email using the OTP. Your
                trainer application will then be reviewed
                by the administrator.
              </p>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-4 border-t border-[#e8ebf0] pt-6 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-[#697386]">

              Already have an account?

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/login"
                  )
                }
                className="ml-1 font-medium text-[#1769e0] hover:underline"
              >
                Login
              </button>

            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() =>
                  router.back()
                }
                className="rounded-xl border border-[#dfe4eb] bg-white px-6 py-3 text-sm font-medium text-[#344054] transition hover:bg-[#f8fafc]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isLoading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1769e0] px-7 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(23,105,224,0.18)] transition hover:bg-[#1259c4] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isLoading
                  ? "Submitting..."
                  : "Continue to Verification"}

                {!isLoading && (
                  <ArrowRightIcon />
                )}

              </button>

            </div>

          </div>

        </form>

      </div>

      {/* ======================================================
          OTP MODAL
      ======================================================= */}

      {showOtpModal && (

        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#101828]/50 px-5 backdrop-blur-sm"
          onClick={() => {

            if (
              !otpLoading
            ) {
              setShowOtpModal(
                false
              );

              setOtp("");

              setOtpError(
                null
              );

              setOtpSuccess(
                null
              );
            }

          }}
        >

          {/* ==================================================
              MODAL
          ================================================== */}

          <div
            className="relative w-full max-w-[430px] rounded-[28px] border border-[#e5e9ef] bg-white p-7 shadow-[0_30px_90px_rgba(16,24,40,0.22)] sm:p-8"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            {/* =================================================
                CLOSE
            ================================================== */}

            <button
              type="button"
              disabled={
                otpLoading
              }
              onClick={() => {

                setShowOtpModal(
                  false
                );

                setOtp("");

                setOtpError(
                  null
                );

                setOtpSuccess(
                  null
                );

              }}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#98a2b3] transition hover:bg-[#f2f4f7] hover:text-[#344054] disabled:opacity-50"
            >
              <CloseIcon />
            </button>

            {/* =================================================
                ICON
            ================================================== */}

            <div className="flex justify-center">

              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-[#eef4ff] text-[#1769e0]">

                <MailIcon />

              </div>

            </div>

            {/* =================================================
                TITLE
            ================================================== */}

            <div className="mt-5 text-center">

              <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#172033]">
                Verify your email
              </h2>

              <p className="mx-auto mt-2 max-w-[340px] text-sm leading-6 text-[#697386]">
                Enter the 6-digit verification code
                we sent to your email.
              </p>

              <div className="mt-3 rounded-xl bg-[#f8fbff] px-4 py-3">

                <p className="break-all text-sm font-semibold text-[#1769e0]">
                  {registeredEmail}
                </p>

              </div>

            </div>

            {/* =================================================
                OTP
            ================================================== */}

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
                value={
                  otp
                }
                onChange={(
                  event
                ) => {

                  const value =
                    event.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        6
                      );

                  setOtp(
                    value
                  );

                  setOtpError(
                    null
                  );

                  setOtpSuccess(
                    null
                  );

                }}
                onKeyDown={(
                  event
                ) => {

                  if (
                    event.key ===
                      "Enter" &&
                    otp.length ===
                      6 &&
                    !otpLoading
                  ) {
                    handleVerifyOtp();
                  }

                }}
                placeholder="000000"
                className="w-full rounded-2xl border border-[#dfe4eb] bg-[#fcfdff] px-4 py-4 text-center text-2xl font-semibold tracking-[0.4em] text-[#172033] outline-none transition placeholder:text-[#c4cad4] focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-[#1769e0]/10"
              />

              {/* =================================================
                  ERROR
              ================================================== */}

              {otpError && (

                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                  {otpError}
                </div>

              )}

              {/* =================================================
                  SUCCESS
              ================================================== */}

              {otpSuccess && !otpError && (

                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs leading-5 text-green-700">
                  {otpSuccess}
                </div>

              )}

            </div>

            {/* =================================================
                VERIFY
            ================================================== */}

            <button
              type="button"
              disabled={
                otpLoading ||
                otp.length !== 6
              }
              onClick={
                handleVerifyOtp
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1769e0] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(23,105,224,0.18)] transition hover:bg-[#1259c4] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {otpLoading
                ? "Verifying..."
                : "Verify Email"}

              {!otpLoading && (
                <ArrowRightIcon />
              )}

            </button>

            {/* =================================================
                RESEND
            ================================================== */}

            <div className="mt-5 text-center">

              <p className="text-xs text-[#8a94a6]">
                Didn't receive the code?
              </p>

              <button
                type="button"
                disabled={
                  otpLoading
                }
                onClick={
                  handleResendOtp
                }
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

// ============================================================
// SECTION HEADER
// ============================================================

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

        <h2 className="text-[15px] font-semibold text-[#243047]">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-[#8a94a6]">
          {description}
        </p>

      </div>

    </div>
  );
}

// ============================================================
// INPUT
// ============================================================

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
  onChange: (
    value: string
  ) => void;
  type?: string;
  min?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-[#344054]">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        min={min}
        value={value}
        placeholder={
          placeholder
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 text-sm text-[#172033] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/8"
      />

    </div>
  );
}

// ============================================================
// SELECT
// ============================================================

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
  onChange: (
    value: string
  ) => void;
  options: {
    label: string;
    value: string;
  }[];
  disabled?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-[#344054]">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      <div className="relative">

        <select
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full appearance-none rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 pr-10 text-sm text-[#172033] outline-none transition focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/8 disabled:cursor-not-allowed disabled:bg-[#f7f8fa] disabled:text-[#98a2b3]"
        >

          {options.map(
            (option) => (
              <option
                key={
                  option.value ||
                  option.label
                }
                value={
                  option.value
                }
              >
                {option.label}
              </option>
            )
          )}

        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8a94a6]">

          <ChevronDownIcon />

        </div>

      </div>

    </div>
  );
}

// ============================================================
// PASSWORD
// ============================================================

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
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-[#344054]">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

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
              event.target.value
            )
          }
          placeholder={
            label
          }
          className="w-full rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 pr-12 text-sm text-[#172033] outline-none transition placeholder:text-[#98a2b3] focus:border-[#1769e0] focus:ring-4 focus:ring-[#1769e0]/8"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8a94a6] hover:text-[#1769e0]"
        >

          <EyeIcon />

        </button>

      </div>

    </div>
  );
}

// ============================================================
// ICONS
// ============================================================

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m3 10 9-6 9 6" />
      <path d="M5 10v9h14v-9" />
      <path d="M9 19v-5h6v5" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
      />
      <circle
        cx="8.5"
        cy="8.5"
        r="1.5"
      />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
      />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}