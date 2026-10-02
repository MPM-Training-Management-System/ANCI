"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";

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

import type {
  CreateTrainerCertificationRequest,
  CreateTrainerEducationRequest,
} from "@repo/types";

import { notify } from "@repo/hooks";

import Logo from "@/assets/image/ANCILOGO.png";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// ==========================================================
// TYPES
// ==========================================================

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  gender: string;

  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;

  specialization: string;
  professionalTitle: string;
  currentOrganization: string;
  bio: string;
  yearsOfExperience: string;

  professionalLicenseNumber: string;
  professionalLicenseType: string;
  professionalLicenseExpirationDate: string;

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

// ==========================================================
// INITIAL VALUES
// ==========================================================

const initialForm: FormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  birthDate: "",
  gender: "",

  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",

  specialization: "",
  professionalTitle: "",
  currentOrganization: "",
  bio: "",
  yearsOfExperience: "",

  professionalLicenseNumber: "",
  professionalLicenseType: "",
  professionalLicenseExpirationDate: "",

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

const emptyEducation =
  (): CreateTrainerEducationRequest => ({
    degree: "",
    fieldOfStudy: "",
    institution: "",
    yearGraduated: null,
  });

const emptyCertification =
  (): CreateTrainerCertificationRequest => ({
    name: "",
    issuingOrganization: "",
    issuedDate: "",
    expirationDate: "",
    certificateUrl: "",
  });

// ==========================================================
// STEPS
// ==========================================================

const steps = [
  {
    number: 1,
    title: "Personal Information",
    description:
      "Tell us about yourself.",
  },
  {
    number: 2,
    title: "Address",
    description:
      "Provide your complete address.",
  },
  {
    number: 3,
    title: "Professional",
    description:
      "Tell us about your professional background.",
  },
  {
    number: 4,
    title: "Education & Certifications",
    description:
      "Add your educational and professional credentials.",
  },
  {
    number: 5,
    title: "Account",
    description:
      "Create your ACE NextGen trainer account.",
  },
];

// ==========================================================
// PAGE
// ==========================================================

export default function TrainerRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ========================================================
  // FORM
  // ========================================================

  const [form, setForm] =
    useState<FormData>(initialForm);

  const [address, setAddress] =
    useState<AddressData>(initialAddress);

  const [currentStep, setCurrentStep] =
    useState(1);

  // ========================================================
  // PSGC
  // ========================================================

  const [provinces, setProvinces] =
    useState<PsgcItem[]>([]);

  const [municipalities, setMunicipalities] =
    useState<PsgcMunicipality[]>([]);

  const [barangays, setBarangays] =
    useState<PsgcBarangay[]>([]);

  const [addressLoading, setAddressLoading] =
    useState(false);

  // ========================================================
  // EDUCATION / CERTIFICATION
  // ========================================================

  const [educations, setEducations] =
    useState<CreateTrainerEducationRequest[]>([
      emptyEducation(),
    ]);

  const [certifications, setCertifications] =
    useState<CreateTrainerCertificationRequest[]>(
      [emptyCertification()]
    );

  // ========================================================
  // IMAGE
  // ========================================================

  const [preview, setPreview] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // ========================================================
  // GOOGLE
  // ========================================================

  const [isGoogleRegistration, setIsGoogleRegistration] =
    useState(false);

  const [googleIdToken, setGoogleIdToken] =
    useState<string | null>(null);

  const [googleProfileImageUrl, setGoogleProfileImageUrl] =
    useState<string | null>(null);

  // ========================================================
  // OTP
  // ========================================================

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

  // ========================================================
  // ERROR
  // ========================================================

  const [localError, setLocalError] =
    useState<string | null>(null);

  // ========================================================
  // REGISTER HOOK
  // ========================================================

  const {
    registerTrainer,
    isLoading,
    error,
  } = useRegisterTrainer(authApi);

  // ========================================================
  // CURRENT STEP
  // ========================================================

  const currentStepData =
    steps[currentStep - 1];

  if (!currentStepData) {
    return null;
  }

  // ========================================================
  // GOOGLE REGISTRATION LOADER
  // ========================================================

  useEffect(() => {
    const googleMode =
      searchParams.get("google") === "1";

    if (!googleMode) {
      return;
    }

    const token =
      sessionStorage.getItem(
        "google_registration_id_token"
      );

    if (!token) {
      setLocalError(
        "Google registration session expired. Please continue with Google again."
      );

      return;
    }

    const firstName =
      searchParams.get("firstName") ?? "";

    const lastName =
      searchParams.get("lastName") ?? "";

    const email =
      searchParams.get("email") ?? "";

    const profileImageUrl =
      searchParams.get("profileImageUrl") ?? "";

    setIsGoogleRegistration(true);
    setGoogleIdToken(token);

    setForm((current) => ({
      ...current,
      firstName,
      lastName,
      email,
    }));

    if (profileImageUrl) {
      setGoogleProfileImageUrl(
        profileImageUrl
      );
    }
  }, [searchParams]);

  // ========================================================
  // LOAD PROVINCES
  // ========================================================

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setAddressLoading(true);

        const result =
          await getProvinces();

        setProvinces(
          Array.isArray(result)
            ? result
            : []
        );
      } catch (err) {
        console.error(
          "Province loading error:",
          err
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

  // ========================================================
  // IMAGE CLEANUP
  // ========================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ========================================================
  // UPDATE FORM
  // ========================================================

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setLocalError(null);
  };

  // ========================================================
  // PSGC PROVINCE
  // ========================================================

  const handleProvinceChange = async (
    provinceCode: string
  ) => {
    const selected =
      provinces.find(
        (item) =>
          item.code === provinceCode
      );

    setAddress((current) => ({
      ...current,
      provinceCode,
      provinceName:
        selected?.name ?? "",

      municipalityCode: "",
      municipalityName: "",

      barangayCode: "",
      barangayName: "",
    }));

    setMunicipalities([]);
    setBarangays([]);
    setLocalError(null);

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
    } catch (err) {
      console.error(
        "Municipality loading error:",
        err
      );

      setLocalError(
        "Unable to load municipalities."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  // ========================================================
  // PSGC MUNICIPALITY
  // ========================================================

  const handleMunicipalityChange = async (
    municipalityCode: string
  ) => {
    const selected =
      municipalities.find(
        (item) =>
          item.code === municipalityCode
      );

    setAddress((current) => ({
      ...current,
      municipalityCode,
      municipalityName:
        selected?.name ?? "",

      barangayCode: "",
      barangayName: "",
    }));

    setBarangays([]);
    setLocalError(null);

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
    } catch (err) {
      console.error(
        "Barangay loading error:",
        err
      );

      setLocalError(
        "Unable to load barangays."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  // ========================================================
  // PSGC BARANGAY
  // ========================================================

  const handleBarangayChange = (
    barangayCode: string
  ) => {
    const selected =
      barangays.find(
        (item) =>
          item.code === barangayCode
      );

    setAddress((current) => ({
      ...current,
      barangayCode,
      barangayName:
        selected?.name ?? "",
    }));

    setLocalError(null);
  };

  // ========================================================
  // COMPLETE ADDRESS
  // ========================================================

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

  // ========================================================
  // PROFILE IMAGE
  // ========================================================

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

    if (!allowedTypes.includes(file.type)) {
      setLocalError(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      event.target.value = "";

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLocalError(
        "Profile image must be 2MB or smaller."
      );

      event.target.value = "";

      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const nextPreview =
      URL.createObjectURL(file);

    setForm((current) => ({
      ...current,
      profileImage: file,
    }));

    setPreview(nextPreview);
    setLocalError(null);
  };

  const removeProfileImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setForm((current) => ({
      ...current,
      profileImage: null,
    }));

    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ========================================================
  // EDUCATION
  // ========================================================

  const updateEducation = (
    index: number,
    updates: Partial<CreateTrainerEducationRequest>
  ) => {
    setEducations((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                ...updates,
              }
            : item
      )
    );

    setLocalError(null);
  };

  const addEducation = () => {
    setEducations((current) => [
      ...current,
      emptyEducation(),
    ]);
  };

  const removeEducation = (
    index: number
  ) => {
    setEducations((current) => {
      if (current.length === 1) {
        return [
          emptyEducation(),
        ];
      }

      return current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  };

  // ========================================================
  // CERTIFICATION
  // ========================================================

  const updateCertification = (
    index: number,
    updates: Partial<CreateTrainerCertificationRequest>
  ) => {
    setCertifications((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                ...updates,
              }
            : item
      )
    );

    setLocalError(null);
  };

  const addCertification = () => {
    setCertifications((current) => [
      ...current,
      emptyCertification(),
    ]);
  };

  const removeCertification = (
    index: number
  ) => {
    setCertifications((current) => {
      if (current.length === 1) {
        return [
          emptyCertification(),
        ];
      }

      return current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  };

  // ========================================================
  // GOOGLE SUCCESS
  // ========================================================

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    const token =
      credentialResponse.credential;

    if (!token) {
      setLocalError(
        "Google registration failed. No credential was returned."
      );

      return;
    }

    try {
      sessionStorage.setItem(
        "google_registration_id_token",
        token
      );

      const payload =
        decodeJwtPayload(token);

      const firstName =
        typeof payload.given_name === "string"
          ? payload.given_name
          : "";

      const lastName =
        typeof payload.family_name === "string"
          ? payload.family_name
          : "";

      const email =
        typeof payload.email === "string"
          ? payload.email
          : "";

      const picture =
        typeof payload.picture === "string"
          ? payload.picture
          : "";

      setIsGoogleRegistration(true);
      setGoogleIdToken(token);

      setForm((current) => ({
        ...current,
        firstName,
        lastName,
        email,
      }));

      setGoogleProfileImageUrl(
        picture || null
      );

      setLocalError(null);
    } catch (err) {
      console.error(
        "GOOGLE REGISTRATION ERROR:",
        err
      );

      setLocalError(
        "Unable to continue with Google."
      );
    }
  };

  const handleGoogleError = () => {
    setLocalError(
      "Google registration was cancelled or failed. Please try again."
    );
  };

  // ========================================================
  // OTP
  // ========================================================

  const sendOtp = async (
    email: string
  ) => {
    try {
      const response =
        await authApi.sendOtp({
          email,
        });

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
    } catch (err) {
      console.error(
        "SEND OTP ERROR:",
        err
      );

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

    const cleanOtp =
      otp.trim();

    if (!cleanOtp) {
      setOtpError(
        "Please enter the OTP."
      );

      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setOtpError(
        "OTP must be 6 digits."
      );

      return;
    }

    try {
      setOtpLoading(true);

      const response =
        await authApi.verifyOtp({
          email: registeredEmail,
          otpCode: cleanOtp,
        });

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
    } catch (err) {
      console.error(
        "VERIFY OTP ERROR:",
        err
      );

      setOtpError(
        err instanceof Error
          ? err.message
          : "Unable to verify OTP."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(null);
    setOtpSuccess(null);
    setOtp("");

    await sendOtp(
      registeredEmail
    );
  };

  // ========================================================
  // STEP VALIDATION
  // ========================================================

  const validateStep = (
    step: number
  ) => {
    setLocalError(null);

    if (step === 1) {
      if (!form.firstName.trim()) {
        setLocalError(
          "First name is required."
        );

        return false;
      }

      if (!form.lastName.trim()) {
        setLocalError(
          "Last name is required."
        );

        return false;
      }

      if (!form.birthDate) {
        setLocalError(
          "Birth date is required."
        );

        return false;
      }

      if (!form.gender) {
        setLocalError(
          "Please select your gender."
        );

        return false;
      }
    }

    if (step === 2) {
      if (!address.houseNumber.trim()) {
        setLocalError(
          "House / building number is required."
        );

        return false;
      }

      if (!address.provinceCode) {
        setLocalError(
          "Please select a province."
        );

        return false;
      }

      if (!address.municipalityCode) {
        setLocalError(
          "Please select a municipality or city."
        );

        return false;
      }

      if (!address.barangayCode) {
        setLocalError(
          "Please select a barangay."
        );

        return false;
      }
    }

    if (step === 3) {
      if (!form.specialization.trim()) {
        setLocalError(
          "Specialization is required."
        );

        return false;
      }
    }

    if (step === 5) {
      if (!form.email.trim()) {
        setLocalError(
          "Email is required."
        );

        return false;
      }

      if (!form.password) {
        setLocalError(
          "Password is required."
        );

        return false;
      }

      if (form.password.length < 8) {
        setLocalError(
          "Password must be at least 8 characters."
        );

        return false;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        setLocalError(
          "Passwords do not match."
        );

        return false;
      }

      if (
        isGoogleRegistration &&
        !googleIdToken
      ) {
        setLocalError(
          "Google registration session is missing. Please continue with Google again."
        );

        return false;
      }
    }

    return true;
  };

  // ========================================================
  // NEXT
  // ========================================================

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(
        (current) =>
          current + 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ========================================================
  // BACK
  // ========================================================

  const handleBack = () => {
    setLocalError(null);

    if (currentStep > 1) {
      setCurrentStep(
        (current) =>
          current - 1
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ========================================================
  // SUBMIT
  // ========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLocalError(null);

    if (
      isGoogleRegistration &&
      !googleIdToken
    ) {
      setLocalError(
        "Google registration session is missing. Please continue with Google again."
      );

      return;
    }

    const checks: [boolean, string][] = [
      [
        !!form.firstName.trim(),
        "First name is required.",
      ],
      [
        !!form.lastName.trim(),
        "Last name is required.",
      ],
      [
        !!form.birthDate,
        "Birth date is required.",
      ],
      [
        !!form.gender,
        "Please select your gender.",
      ],
      [
        !!address.houseNumber.trim(),
        "House / building number is required.",
      ],
      [
        !!address.provinceCode,
        "Please select a province.",
      ],
      [
        !!address.municipalityCode,
        "Please select a municipality or city.",
      ],
      [
        !!address.barangayCode,
        "Please select a barangay.",
      ],
      [
        !!form.email.trim(),
        "Email is required.",
      ],
      [
        !!form.password,
        "Password is required.",
      ],
      [
        form.password.length >= 8,
        "Password must be at least 8 characters.",
      ],
      [
        form.password === form.confirmPassword,
        "Passwords do not match.",
      ],
      [
        !!form.specialization.trim(),
        "Specialization is required.",
      ],
    ];

    for (const [valid, message] of checks) {
      if (!valid) {
        setLocalError(message);

        return;
      }
    }

    const email =
      form.email
        .trim()
        .toLowerCase();

    const cleanedEducations =
      educations
        .filter(
          (education) =>
            education.degree.trim() &&
            education.institution.trim()
        )
        .map((education) => ({
          degree:
            education.degree.trim(),

          fieldOfStudy:
            education.fieldOfStudy?.trim() ||
            null,

          institution:
            education.institution.trim(),

          yearGraduated:
            education.yearGraduated ??
            null,
        }));

    const cleanedCertifications =
      certifications
        .filter(
          (certification) =>
            certification.name?.trim()
        )
        .map((certification) => ({
          name:
            certification.name.trim(),

          issuingOrganization:
            certification.issuingOrganization
              ?.trim() ||
            null,

          issuedDate:
            certification.issuedDate ||
            null,

          expirationDate:
            certification.expirationDate ||
            null,

          certificateUrl:
            certification.certificateUrl
              ?.trim() ||
            null,
        }));

    const values: RegisterTrainerFormValues = {
      firstName:
        form.firstName.trim(),

      middleName:
        form.middleName.trim(),

      lastName:
        form.lastName.trim(),

      suffix:
        form.suffix.trim(),

      birthDate:
        form.birthDate,

      address:
        completeAddress,

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

      professionalTitle:
        form.professionalTitle.trim(),

      currentOrganization:
        form.currentOrganization.trim(),

      bio:
        form.bio.trim(),

      yearsOfExperience:
        form.yearsOfExperience
          ? Number(
              form.yearsOfExperience
            )
          : undefined,

      professionalLicenseNumber:
        form.professionalLicenseNumber.trim(),

      professionalLicenseType:
        form.professionalLicenseType.trim(),

      professionalLicenseExpirationDate:
        form.professionalLicenseExpirationDate ||
        undefined,

      profileImage:
        form.profileImage ??
        undefined,

      educations:
        cleanedEducations,

      certifications:
        cleanedCertifications,

      googleIdToken:
        isGoogleRegistration
          ? googleIdToken ??
            undefined
          : undefined,
    };

    const response =
      await registerTrainer(values);

    if (!response) {
      return;
    }

    if (isGoogleRegistration) {
      sessionStorage.removeItem(
        "google_registration_id_token"
      );

      setGoogleIdToken(null);

      notify.success(
        "Google registration successful."
      );

      router.push(
        "/login?registered=true"
      );

      return;
    }

    setRegisteredEmail(email);

    setOtp("");

    setOtpError(null);

    setOtpSuccess(
      "Registration submitted. Sending verification code..."
    );

    setShowOtpModal(true);

    await sendOtp(email);
  };

  // ========================================================
  // ERROR
  // ========================================================

  const displayError =
    localError || error;

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
    >
      <main className="min-h-screen bg-[#f7f9ff] text-[#0d2142]">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <Image
                src={Logo}
                alt="ACE NextGen"
                width={48}
                height={48}
                className="h-11 w-11 object-contain"
              />

              <div>
                <p className="text-sm font-bold tracking-wide text-[#002b5c]">
                  ACE NEXTGEN
                </p>

                <p className="text-[11px] text-[#3B7597]">
                  Consultancy Inc.
                </p>
              </div>
            </Link>

            <Link
              href="/login"
              className="text-sm font-semibold text-[#3B7597] transition hover:text-[#002b5c]"
            >
              Already have an account?
              <span className="ml-1 text-[#002b5c]">
                Sign in
              </span>
            </Link>
          </div>
        </header>

        {/* ==================================================
            PAGE
        ================================================== */}

        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-5xl">
            {/* ==================================================
                TITLE
            ================================================== */}

            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#6FD1D7]/40 bg-white px-4 py-2 text-xs font-semibold text-[#3B7597] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#6FD1D7]" />
                Trainer Registration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#002b5c] sm:text-4xl">
                Become an ACE NextGen Trainer
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Create your trainer profile and
                submit your credentials for
                review by ACE NextGen
                Consultancy Inc.
              </p>
            </div>

            {/* ==================================================
                STEPPER
            ================================================== */}

            <div className="mb-8 overflow-x-auto">
              <div className="mx-auto flex min-w-[650px] max-w-4xl items-start justify-between">
                {steps.map(
                  (step, index) => {
                    const active =
                      currentStep ===
                      step.number;

                    const completed =
                      currentStep >
                      step.number;

                    return (
                      <div
                        key={step.number}
                        className="flex flex-1 items-start"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={[
                              "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                              active
                                ? "border-[#002b5c] bg-[#002b5c] text-white"
                                : completed
                                ? "border-[#6FD1D7] bg-[#6FD1D7] text-[#002b5c]"
                                : "border-slate-200 bg-white text-slate-400",
                            ].join(
                              " "
                            )}
                          >
                            {completed
                              ? "✓"
                              : step.number}
                          </div>

                          <div className="mt-2 text-center">
                            <p
                              className={[
                                "text-xs font-bold",
                                active
                                  ? "text-[#002b5c]"
                                  : "text-slate-400",
                              ].join(
                                " "
                              )}
                            >
                              {step.title}
                            </p>
                          </div>
                        </div>

                        {index <
                          steps.length -
                            1 && (
                          <div
                            className={[
                              "mt-5 h-[2px] flex-1",
                              currentStep >
                              step.number
                                ? "bg-[#6FD1D7]"
                                : "bg-slate-200",
                            ].join(
                              " "
                            )}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* ==================================================
                CARD
            ================================================== */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(13,33,66,0.08)]">
              {/* ==================================================
                  CARD HEADER
              ================================================== */}

              <div className="border-b border-slate-100 bg-gradient-to-r from-[#f7f9ff] to-white px-5 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#002b5c] text-white">
                    <span className="text-lg font-bold">
                      {currentStep}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#002b5c]">
                      {
                        currentStepData.title
                      }
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        currentStepData.description
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  ERROR
              ================================================== */}

              {displayError && (
                <div className="mx-5 mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-8">
                  {displayError}
                </div>
              )}

              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-8"
              >
                {/* ==================================================
                    STEP 1
                ================================================== */}

                {currentStep === 1 && (
                  <div className="space-y-8">
                    {/* Profile */}
                    <div>
                      <SectionHeader
                        title="Personal Information"
                        description="Use your legal name and personal details."
                      />

                      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <InputField
                          label="First Name"
                          required
                          value={
                            form.firstName
                          }
                          onChange={(value) =>
                            updateField(
                              "firstName",
                              value
                            )
                          }
                          placeholder="First name"
                        />

                        <InputField
                          label="Middle Name"
                          value={
                            form.middleName
                          }
                          onChange={(value) =>
                            updateField(
                              "middleName",
                              value
                            )
                          }
                          placeholder="Middle name"
                        />

                        <InputField
                          label="Last Name"
                          required
                          value={
                            form.lastName
                          }
                          onChange={(value) =>
                            updateField(
                              "lastName",
                              value
                            )
                          }
                          placeholder="Last name"
                        />

                        <InputField
                          label="Suffix"
                          value={
                            form.suffix
                          }
                          onChange={(value) =>
                            updateField(
                              "suffix",
                              value
                            )
                          }
                          placeholder="Jr., Sr., III"
                        />

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
                              value:
                                "Male",
                              label:
                                "Male",
                            },
                            {
                              value:
                                "Female",
                              label:
                                "Female",
                            },
                            {
                              value:
                                "Prefer not to say",
                              label:
                                "Prefer not to say",
                            },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div>
                      <SectionHeader
                        title="Profile Photo"
                        description="Optional. JPG, PNG, or WEBP up to 2MB."
                      />

                      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                          {preview ? (
                            <Image
                              src={
                                preview
                              }
                              alt="Profile preview"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : googleProfileImageUrl ? (
                            <Image
                              src={
                                googleProfileImageUrl
                              }
                              alt="Google profile"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="mx-auto mb-1 text-2xl text-slate-300">
                                👤
                              </div>

                              <p className="text-[10px] font-medium text-slate-400">
                                No photo
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
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
                            id="profile-image"
                          />

                          <div className="flex flex-wrap gap-3">
                            <label
                              htmlFor="profile-image"
                              className="cursor-pointer rounded-xl bg-[#002b5c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2142]"
                            >
                              Upload Photo
                            </label>

                            {(preview ||
                              googleProfileImageUrl) && (
                              <button
                                type="button"
                                onClick={
                                  removeProfileImage
                                }
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <p className="mt-2 text-xs text-slate-400">
                            Recommended square
                            image for your
                            trainer profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    STEP 2
                ================================================== */}

                {currentStep === 2 && (
                  <div>
                    <SectionHeader
                      title="Complete Address"
                      description="Select your location using the official PSGC location data."
                    />

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <InputField
                        label="House / Building Number"
                        required
                        value={
                          address.houseNumber
                        }
                        onChange={(value) => {
                          setAddress(
                            (current) => ({
                              ...current,
                              houseNumber:
                                value,
                            })
                          );

                          setLocalError(
                            null
                          );
                        }}
                        placeholder="House / building number"
                      />

                      <InputField
                        label="Street"
                        value={
                          address.street
                        }
                        onChange={(value) => {
                          setAddress(
                            (current) => ({
                              ...current,
                              street:
                                value,
                            })
                          );

                          setLocalError(
                            null
                          );
                        }}
                        placeholder="Street"
                      />

                      <InputField
                        label="Sitio / Purok"
                        value={
                          address.sitio
                        }
                        onChange={(value) => {
                          setAddress(
                            (current) => ({
                              ...current,
                              sitio:
                                value,
                            })
                          );

                          setLocalError(
                            null
                          );
                        }}
                        placeholder="Sitio / Purok"
                      />

                      <SelectField
                        label="Province"
                        required
                        value={
                          address.provinceCode
                        }
                        onChange={
                          handleProvinceChange
                        }
                        disabled={
                          addressLoading
                        }
                        options={[
                          {
                            value: "",
                            label:
                              addressLoading
                                ? "Loading provinces..."
                                : "Select province",
                          },
                          ...provinces.map(
                            (province) => ({
                              value:
                                province.code,
                              label:
                                province.name,
                            })
                          ),
                        ]}
                      />

                      <SelectField
                        label="Municipality / City"
                        required
                        value={
                          address.municipalityCode
                        }
                        onChange={
                          handleMunicipalityChange
                        }
                        disabled={
                          !address.provinceCode ||
                          addressLoading
                        }
                        options={[
                          {
                            value: "",
                            label:
                              address.provinceCode
                                ? addressLoading
                                  ? "Loading municipalities..."
                                  : "Select municipality / city"
                                : "Select province first",
                          },
                          ...municipalities.map(
                            (
                              municipality
                            ) => ({
                              value:
                                municipality.code,
                              label:
                                municipality.name,
                            })
                          ),
                        ]}
                      />

                      <SelectField
                        label="Barangay"
                        required
                        value={
                          address.barangayCode
                        }
                        onChange={
                          handleBarangayChange
                        }
                        disabled={
                          !address.municipalityCode ||
                          addressLoading
                        }
                        options={[
                          {
                            value: "",
                            label:
                              address.municipalityCode
                                ? addressLoading
                                  ? "Loading barangays..."
                                  : "Select barangay"
                                : "Select municipality first",
                          },
                          ...barangays.map(
                            (barangay) => ({
                              value:
                                barangay.code,
                              label:
                                barangay.name,
                            })
                          ),
                        ]}
                      />
                    </div>

                    {completeAddress && (
                      <div className="mt-6 rounded-2xl border border-[#6FD1D7]/30 bg-[#f7f9ff] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#3B7597]">
                          Complete Address
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#002b5c]">
                          {completeAddress}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ==================================================
                    STEP 3
                ================================================== */}

                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div>
                      <SectionHeader
                        title="Professional Information"
                        description="Tell us about your expertise and professional experience."
                      />

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <InputField
                          label="Specialization"
                          required
                          value={
                            form.specialization
                          }
                          onChange={(value) =>
                            updateField(
                              "specialization",
                              value
                            )
                          }
                          placeholder="e.g. Mediation"
                        />

                        <InputField
                          label="Professional Title"
                          value={
                            form.professionalTitle
                          }
                          onChange={(value) =>
                            updateField(
                              "professionalTitle",
                              value
                            )
                          }
                          placeholder="e.g. Attorney, Mediator"
                        />

                        <InputField
                          label="Current Organization"
                          value={
                            form.currentOrganization
                          }
                          onChange={(value) =>
                            updateField(
                              "currentOrganization",
                              value
                            )
                          }
                          placeholder="Organization / company"
                        />

                        <InputField
                          label="Years of Experience"
                          type="number"
                          min="0"
                          value={
                            form.yearsOfExperience
                          }
                          onChange={(value) =>
                            updateField(
                              "yearsOfExperience",
                              value
                            )
                          }
                          placeholder="e.g. 5"
                        />
                      </div>

                      <div className="mt-5">
                        <label className="mb-2 block text-sm font-semibold text-[#0d2142]">
                          Professional Bio
                        </label>

                        <textarea
                          value={
                            form.bio
                          }
                          onChange={(event) =>
                            updateField(
                              "bio",
                              event.target
                                .value
                            )
                          }
                          rows={5}
                          placeholder="Briefly describe your professional experience and expertise."
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0d2142] outline-none transition placeholder:text-slate-400 focus:border-[#3B7597] focus:ring-4 focus:ring-[#6FD1D7]/10"
                        />
                      </div>
                    </div>

                    <div>
                      <SectionHeader
                        title="Professional License"
                        description="Optional. Provide your professional license information if applicable."
                      />

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <InputField
                          label="License Type"
                          value={
                            form.professionalLicenseType
                          }
                          onChange={(value) =>
                            updateField(
                              "professionalLicenseType",
                              value
                            )
                          }
                          placeholder="License type"
                        />

                        <InputField
                          label="License Number"
                          value={
                            form.professionalLicenseNumber
                          }
                          onChange={(value) =>
                            updateField(
                              "professionalLicenseNumber",
                              value
                            )
                          }
                          placeholder="License number"
                        />

                        <InputField
                          label="License Expiration Date"
                          type="date"
                          value={
                            form.professionalLicenseExpirationDate
                          }
                          onChange={(value) =>
                            updateField(
                              "professionalLicenseExpirationDate",
                              value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    STEP 4
                ================================================== */}

                {currentStep === 4 && (
                  <div className="space-y-10">
                    {/* Education */}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <SectionHeader
                          title="Education"
                          description="Add your educational background."
                        />

                        <button
                          type="button"
                          onClick={
                            addEducation
                          }
                          className="shrink-0 rounded-xl border border-[#6FD1D7] px-3 py-2 text-xs font-bold text-[#3B7597] transition hover:bg-[#f7f9ff]"
                        >
                          + Add Education
                        </button>
                      </div>

                      <div className="mt-5 space-y-5">
                        {educations.map(
                          (
                            education,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-bold text-[#002b5c]">
                                  Education{" "}
                                  {index +
                                    1}
                                </p>

                                {educations.length >
                                  1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeEducation(
                                        index
                                      )
                                    }
                                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid gap-5 sm:grid-cols-2">
                                <InputField
                                  label="Degree"
                                  required
                                  value={
                                    education.degree
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateEducation(
                                      index,
                                      {
                                        degree:
                                          value,
                                      }
                                    )
                                  }
                                  placeholder="e.g. Bachelor of Science in Information Technology"
                                />

                                <InputField
                                  label="Field of Study"
                                  value={
                                    education.fieldOfStudy ??
                                    ""
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateEducation(
                                      index,
                                      {
                                        fieldOfStudy:
                                          value,
                                      }
                                    )
                                  }
                                  placeholder="Field of study"
                                />

                                <InputField
                                  label="Institution"
                                  required
                                  value={
                                    education.institution
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateEducation(
                                      index,
                                      {
                                        institution:
                                          value,
                                      }
                                    )
                                  }
                                  placeholder="School / University"
                                />

                                <InputField
                                  label="Year Graduated"
                                  type="number"
                                  min="1900"
                                  max="2100"
                                  value={
                                    education.yearGraduated?.toString() ??
                                    ""
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateEducation(
                                      index,
                                      {
                                        yearGraduated:
                                          value
                                            ? Number(
                                                value
                                              )
                                            : null,
                                      }
                                    )
                                  }
                                  placeholder="e.g. 2025"
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <SectionHeader
                          title="Certifications"
                          description="Add your relevant professional certifications."
                        />

                        <button
                          type="button"
                          onClick={
                            addCertification
                          }
                          className="shrink-0 rounded-xl border border-[#6FD1D7] px-3 py-2 text-xs font-bold text-[#3B7597] transition hover:bg-[#f7f9ff]"
                        >
                          + Add Certification
                        </button>
                      </div>

                      <div className="mt-5 space-y-5">
                        {certifications.map(
                          (
                            certification,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-bold text-[#002b5c]">
                                  Certification{" "}
                                  {index +
                                    1}
                                </p>

                                {certifications.length >
                                  1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeCertification(
                                        index
                                      )
                                    }
                                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              <div className="grid gap-5 sm:grid-cols-2">
                                <InputField
                                  label="Certification Name"
                                  required
                                  value={
                                    certification.name
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateCertification(
                                      index,
                                      {
                                        name:
                                          value,
                                      }
                                    )
                                  }
                                  placeholder="Certification name"
                                />

                                <InputField
                                  label="Issuing Organization"
                                  value={
                                    certification.issuingOrganization ??
                                    ""
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateCertification(
                                      index,
                                      {
                                        issuingOrganization:
                                          value,
                                      }
                                    )
                                  }
                                  placeholder="Issuing organization"
                                />

                                <InputField
                                  label="Issued Date"
                                  type="date"
                                  value={
                                    certification.issuedDate ??
                                    ""
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateCertification(
                                      index,
                                      {
                                        issuedDate:
                                          value,
                                      }
                                    )
                                  }
                                />

                                <InputField
                                  label="Expiration Date"
                                  type="date"
                                  value={
                                    certification.expirationDate ??
                                    ""
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateCertification(
                                      index,
                                      {
                                        expirationDate:
                                          value,
                                      }
                                    )
                                  }
                                />

                                <div className="sm:col-span-2">
                                  <InputField
                                    label="Certificate URL"
                                    value={
                                      certification.certificateUrl ??
                                      ""
                                    }
                                    onChange={(
                                      value
                                    ) =>
                                      updateCertification(
                                        index,
                                        {
                                          certificateUrl:
                                            value,
                                        }
                                      )
                                    }
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    STEP 5
                ================================================== */}

                {currentStep === 5 && (
                  <div className="space-y-8">
                    {/* Google */}
                    {!isGoogleRegistration && (
                      <div className="rounded-2xl border border-slate-200 bg-[#f7f9ff] p-5">
                        <div className="mb-4">
                          <p className="text-sm font-bold text-[#002b5c]">
                            Quick registration
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            You may continue with
                            your Google account.
                            Your trainer profile
                            will still be subject
                            to ACE NextGen review.
                          </p>
                        </div>

                        <div className="relative overflow-hidden rounded-xl">
                          <GoogleLogin
                            onSuccess={
                              handleGoogleSuccess
                            }
                            onError={
                              handleGoogleError
                            }
                            width="100%"
                          />
                        </div>
                      </div>
                    )}

                    {/* Google status */}
                    {isGoogleRegistration && (
                      <div className="rounded-2xl border border-[#6FD1D7]/40 bg-[#f7f9ff] p-5">
                        <div className="flex items-center gap-3">
                          {googleProfileImageUrl ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-full">
                              <Image
                                src={
                                  googleProfileImageUrl
                                }
                                alt="Google profile"
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#002b5c] text-white">
                              G
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-bold text-[#002b5c]">
                              Google account connected
                            </p>

                            <p className="text-xs text-slate-500">
                              {
                                form.email
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <SectionHeader
                        title="Account Information"
                        description="Create the credentials you will use to access ACE NextGen."
                      />

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <InputField
                            label="Email Address"
                            required
                            type="email"
                            value={
                              form.email
                            }
                            readOnly={
                              isGoogleRegistration
                            }
                            onChange={(
                              value
                            ) =>
                              updateField(
                                "email",
                                value
                              )
                            }
                            placeholder="you@example.com"
                          />

                          {isGoogleRegistration && (
                            <p className="mt-2 text-xs text-slate-400">
                              Google account
                              email cannot
                              be changed.
                            </p>
                          )}
                        </div>

                        <InputField
                          label="Mobile Number"
                          value={
                            form.mobileNumber
                          }
                          onChange={(value) =>
                            updateField(
                              "mobileNumber",
                              value
                            )
                          }
                          placeholder="09XXXXXXXXX"
                        />

                        <div />

                        <PasswordField
                          label="Password"
                          required
                          value={
                            form.password
                          }
                          onChange={(value) =>
                            updateField(
                              "password",
                              value
                            )
                          }
                          placeholder="At least 8 characters"
                        />

                        <PasswordField
                          label="Confirm Password"
                          required
                          value={
                            form.confirmPassword
                          }
                          onChange={(value) =>
                            updateField(
                              "confirmPassword",
                              value
                            )
                          }
                          placeholder="Confirm password"
                        />
                      </div>

                      <p className="mt-3 text-xs text-slate-400">
                        Password must contain at
                        least 8 characters.
                      </p>
                    </div>

                    {/* Info */}
                    <div className="rounded-2xl border border-[#6FD1D7]/30 bg-[#f7f9ff] p-5">
                      <p className="text-sm font-bold text-[#002b5c]">
                        What happens next?
                      </p>

                      <div className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                        {!isGoogleRegistration ? (
                          <>
                            <p>
                              1. Submit your
                              registration.
                            </p>

                            <p>
                              2. Verify your
                              email using the
                              OTP sent to you.
                            </p>

                            <p>
                              3. Your trainer
                              application will
                              be reviewed by an
                              administrator.
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              1. Submit your
                              trainer
                              registration.
                            </p>

                            <p>
                              2. Your Google
                              email is already
                              verified.
                            </p>

                            <p>
                              3. Your trainer
                              application will
                              be reviewed by an
                              administrator.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={
                          handleBack
                        }
                        disabled={
                          isLoading
                        }
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ← Back
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          router.back()
                        }
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {currentStep <
                  steps.length ? (
                    <button
                      type="button"
                      onClick={
                        handleNext
                      }
                      className="rounded-xl bg-[#002b5c] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d2142]"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        isLoading
                      }
                      className="rounded-xl bg-[#002b5c] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d2142] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading
                        ? "Submitting..."
                        : isGoogleRegistration
                        ? "Complete Registration"
                        : "Continue to Verification"}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <p className="mt-6 text-center text-xs text-slate-400">
              By registering, you agree to
              provide accurate information for
              trainer verification and review.
            </p>
          </div>
        </section>

        {/* ==================================================
            OTP MODAL
        ================================================== */}

        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2142]/60 px-4 py-6 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              <button
                type="button"
                onClick={() =>
                  setShowOtpModal(false)
                }
                disabled={
                  otpLoading
                }
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#002b5c]"
              >
                ×
              </button>

              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7f9ff]">
                  <Image
                    src={Logo}
                    alt="ACE NextGen"
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                </div>

                <h3 className="text-2xl font-bold text-[#002b5c]">
                  Verify your email
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  We sent a 6-digit
                  verification code to
                </p>

                <p className="mt-1 break-all text-sm font-bold text-[#3B7597]">
                  {registeredEmail}
                </p>
              </div>

              <div className="mt-7">
                <label className="mb-2 block text-sm font-semibold text-[#0d2142]">
                  Verification Code
                </label>

                <input
                  value={otp}
                  onChange={(event) => {
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

                    setOtp(value);
                    setOtpError(
                      null
                    );
                  }}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-[#002b5c] outline-none transition focus:border-[#3B7597] focus:ring-4 focus:ring-[#6FD1D7]/10"
                />
              </div>

              {otpError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {otpError}
                </div>
              )}

              {otpSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {otpSuccess}
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleVerifyOtp
                }
                disabled={
                  otpLoading
                }
                className="mt-5 w-full rounded-xl bg-[#002b5c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0d2142] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpLoading
                  ? "Verifying..."
                  : "Verify Email"}
              </button>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={
                    handleResendOtp
                  }
                  disabled={
                    otpLoading
                  }
                  className="text-sm font-semibold text-[#3B7597] transition hover:text-[#002b5c] disabled:opacity-50"
                >
                  Resend verification
                  code
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </GoogleOAuthProvider>
  );
}
function decodeJwtPayload(
  token: string
): Record<string, unknown> {
  try {
    const parts = token.split(".");

    const payload = parts[1];

    if (!payload) {
      return {};
    }

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    return JSON.parse(
      window.atob(padded)
    );
  } catch {
    return {};
  }
}

// ==========================================================
// SECTION HEADER
// ==========================================================

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-[#002b5c]">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ==========================================================
// INPUT FIELD
// ==========================================================

function InputField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  readOnly,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0d2142]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        min={min}
        max={max}
        readOnly={readOnly}
        className={[
          "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0d2142] outline-none transition placeholder:text-slate-400 focus:border-[#3B7597] focus:ring-4 focus:ring-[#6FD1D7]/10",
          readOnly
            ? "cursor-not-allowed bg-slate-50 text-slate-500"
            : "bg-white",
        ].join(" ")}
      />
    </div>
  );
}

// ==========================================================
// SELECT FIELD
// ==========================================================

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0d2142]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0d2142] outline-none transition focus:border-[#3B7597] focus:ring-4 focus:ring-[#6FD1D7]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>
    </div>
  );
}

// ==========================================================
// PASSWORD FIELD
// ==========================================================

function PasswordField({
  label,
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] =
    useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#0d2142]">
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
            show
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
            placeholder
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-20 text-sm text-[#0d2142] outline-none transition placeholder:text-slate-400 focus:border-[#3B7597] focus:ring-4 focus:ring-[#6FD1D7]/10"
        />

        <button
          type="button"
          onClick={() =>
            setShow(
              (current) =>
                !current
            )
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 px-2 text-xs font-semibold text-[#3B7597] hover:text-[#002b5c]"
        >
          {show
            ? "Hide"
            : "Show"}
        </button>
      </div>
    </div>
  );
}