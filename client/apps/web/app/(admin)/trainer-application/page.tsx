"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Loader2,
  Upload,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  Button,
  Input,
  Spinner,
} from "@repo/ui/index";

import { authApi } from "@/lib/api";
import { notify } from "@repo/hooks";

import {
  useTrainerApplication,
} from "@/hooks/useTrainerApplication";

const statusConfig = {
  Pending: {
    title: "Application Submitted",
    description:
      "Your trainer application has been submitted and is waiting for administrator review.",
    icon: Clock3,
  },

  UnderReview: {
    title: "Application Under Review",
    description:
      "The administrator is currently reviewing your trainer application and submitted documents.",
    icon: FileCheck2,
  },

  NeedsCorrection: {
    title: "Correction Required",
    description:
      "Your application needs some corrections. Please review the administrator remarks and update your information.",
    icon: AlertCircle,
  },

  Approved: {
    title: "Application Approved",
    description:
      "Congratulations! Your trainer application has been approved. You now have full access to the trainer dashboard.",
    icon: CheckCircle2,
  },

  Rejected: {
    title: "Application Rejected",
    description:
      "Your trainer application was not approved. Please review the administrator remarks below.",
    icon: XCircle,
  },
};

export default function TrainerApplicationPage() {
  const {
    application,
    documents,

    isLoading,
    isUpdating,
    isUploading,

    error,

    updateApplication,
    updateProfileImage,
    uploadDocument,
    deleteDocument,

    status,

    isPending,
    isUnderReview,
    needsCorrection,
    isApproved,
    isRejected,
  } = useTrainerApplication(authApi);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [specialization, setSpecialization] =
    useState("");

  const [professionalTitle, setProfessionalTitle] =
    useState("");

  const [currentOrganization, setCurrentOrganization] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [yearsOfExperience, setYearsOfExperience] =
    useState("");

  const [professionalLicenseNumber, setProfessionalLicenseNumber] =
    useState("");

  const [professionalLicenseType, setProfessionalLicenseType] =
    useState("");

  const [
    professionalLicenseExpirationDate,
    setProfessionalLicenseExpirationDate,
  ] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [documentType, setDocumentType] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // =========================================================
  // LOAD APPLICATION INTO FORM
  // =========================================================

  useEffect(() => {
    if (!application) {
      return;
    }

    setSpecialization(
      application.specialization ?? ""
    );

    setProfessionalTitle(
      application.professionalTitle ?? ""
    );

    setCurrentOrganization(
      application.currentOrganization ?? ""
    );

    setBio(
      application.bio ?? ""
    );

    setYearsOfExperience(
      application.yearsOfExperience !== null &&
      application.yearsOfExperience !== undefined
        ? String(application.yearsOfExperience)
        : ""
    );

    setProfessionalLicenseNumber(
      application.professionalLicenseNumber ?? ""
    );

    setProfessionalLicenseType(
      application.professionalLicenseType ?? ""
    );

    setProfessionalLicenseExpirationDate(
      application.professionalLicenseExpirationDate ?? ""
    );
  }, [application]);

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="md" />

          <p className="text-sm text-slate-500">
            Loading your trainer application...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO APPLICATION
  // =========================================================

  if (!application) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle
              size={28}
              className="text-red-500"
            />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Application Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            We could not find your trainer application.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // =========================================================
  // STATUS
  // =========================================================

  const currentStatus =
    status ?? "Pending";

  const config =
    statusConfig[
      currentStatus as keyof typeof statusConfig
    ] ?? statusConfig.Pending;

  const StatusIcon =
    config.icon;

  // =========================================================
  // EDIT ACCESS
  // =========================================================

  const canEdit =
    needsCorrection;

  const canUploadDocuments =
    !isApproved &&
    !isRejected &&
    !isUnderReview;

  const canChangeProfileImage =
    !isApproved &&
    !isUnderReview &&
    !isRejected;

  // =========================================================
  // SAVE APPLICATION
  // =========================================================

  const handleSave = async () => {
    const parsedYears =
      yearsOfExperience.trim() === ""
        ? null
        : Number(yearsOfExperience);

    if (
      parsedYears !== null &&
      (!Number.isInteger(parsedYears) ||
        parsedYears < 0)
    ) {
      notify.error(
        "Years of experience must be a valid whole number."
      );

      return;
    }

    const response =
      await updateApplication({
        specialization:
          specialization.trim() || null,

        professionalTitle:
          professionalTitle.trim() || null,

        currentOrganization:
          currentOrganization.trim() || null,

        bio:
          bio.trim() || null,

        yearsOfExperience:
          parsedYears,

        professionalLicenseNumber:
          professionalLicenseNumber.trim() || null,

        professionalLicenseType:
          professionalLicenseType.trim() || null,

        professionalLicenseExpirationDate:
          professionalLicenseExpirationDate || null,
      });

    if (response) {
      notify.success(
        "Trainer application updated successfully."
      );
    }
  };

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const handleProfileImage = async (
    file: File
  ) => {
    const response =
      await updateProfileImage(file);

    if (response) {
      notify.success(
        "Profile image updated successfully."
      );
    }
  };

  // =========================================================
  // DOCUMENT SELECT
  // =========================================================

  const handleDocumentSelect = (
    file: File
  ) => {
    setSelectedFile(file);
  };

  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      notify.error(
        "Please select a document first."
      );

      return;
    }

    if (!documentType.trim()) {
      notify.error(
        "Please enter the document type."
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "DocumentType",
      documentType.trim()
    );

    formData.append(
      "File",
      selectedFile
    );

    const response =
      await uploadDocument(formData);

    if (response) {
      notify.success(
        "Document uploaded successfully."
      );

      setSelectedFile(null);
      setDocumentType("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // =========================================================
  // DELETE DOCUMENT
  // =========================================================

  const handleDeleteDocument = async (
    documentId: string
  ) => {
    const success =
      await deleteDocument(documentId);

    if (success) {
      notify.success(
        "Document deleted successfully."
      );
    }
  };

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const profileImage =
    application.profileImageUrl;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-600">
              <UserRound size={14} />
              Trainer Portal
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Trainer Application
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and monitor your trainer application.
            </p>
          </div>

          <div
            className={`
              inline-flex w-fit items-center gap-2 rounded-full
              px-4 py-2 text-sm font-semibold
              ${
                isApproved
                  ? "bg-green-50 text-green-700"
                  : isRejected
                    ? "bg-red-50 text-red-700"
                    : needsCorrection
                      ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-blue-700"
              }
            `}
          >
            <StatusIcon size={16} />

            {currentStatus}
          </div>

        </div>
      </div>

      {/* =====================================================
          STATUS CARD
      ===================================================== */}

      <div
        className={`
          mb-6 rounded-2xl border p-6 shadow-sm
          ${
            isApproved
              ? "border-green-200 bg-green-50"
              : isRejected
                ? "border-red-200 bg-red-50"
                : needsCorrection
                  ? "border-amber-200 bg-amber-50"
                  : "border-blue-200 bg-blue-50"
          }
        `}
      >
        <div className="flex gap-4">

          <div className="shrink-0">
            <div
              className={`
                flex h-12 w-12 items-center justify-center
                rounded-xl bg-white shadow-sm
                ${
                  isApproved
                    ? "text-green-600"
                    : isRejected
                      ? "text-red-600"
                      : needsCorrection
                        ? "text-amber-600"
                        : "text-blue-600"
                }
              `}
            >
              <StatusIcon size={24} />
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {config.title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {config.description}
            </p>

            {application.adminRemarks && (
              <div className="mt-4 rounded-xl border border-white/80 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Administrator Remarks
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {application.adminRemarks}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="space-y-6">

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Personal information submitted with your application.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <InfoField
                label="First Name"
                value={application.firstName}
              />

              <InfoField
                label="Middle Name"
                value={application.middleName}
              />

              <InfoField
                label="Last Name"
                value={application.lastName}
              />

              <InfoField
                label="Suffix"
                value={application.suffix}
              />

              <InfoField
                label="Birth Date"
                value={application.birthDate}
              />

              <InfoField
                label="Gender"
                value={application.gender}
              />

              <InfoField
                label="Email"
                value={application.email}
              />

              <InfoField
                label="Mobile Number"
                value={application.mobileNumber}
              />

              <div className="md:col-span-2">
                <InfoField
                  label="Address"
                  value={application.address}
                />
              </div>

            </div>

          </section>

          {/* =================================================
              PROFESSIONAL INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Professional Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and update your professional information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* SPECIALIZATION */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Specialization
                </label>

                <Input
                  value={specialization}
                  onChange={(e) =>
                    setSpecialization(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  placeholder="e.g. Mediation"
                  className="w-full"
                />
              </div>

              {/* PROFESSIONAL TITLE */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Professional Title
                </label>

                <Input
                  value={professionalTitle}
                  onChange={(e) =>
                    setProfessionalTitle(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  placeholder="e.g. Senior Trainer"
                  className="w-full"
                />
              </div>

              {/* ORGANIZATION */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Organization
                </label>

                <Input
                  value={currentOrganization}
                  onChange={(e) =>
                    setCurrentOrganization(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  placeholder="Organization"
                  className="w-full"
                />
              </div>

              {/* YEARS */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Years of Experience
                </label>

                <Input
                  type="number"
                  min="0"
                  value={yearsOfExperience}
                  onChange={(e) =>
                    setYearsOfExperience(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  placeholder="0"
                  className="w-full"
                />
              </div>

              {/* BIO */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Professional Bio
                </label>

                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  rows={5}
                  placeholder="Tell us about your professional experience..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

            </div>

            {canEdit && (
              <div className="mt-6 flex justify-end">

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isUpdating}
                  variant="primary"
                  className="rounded-lg px-6"
                >
                  {isUpdating ? (
                    <>
                      <Loader2
                        size={16}
                        className="mr-2 animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    "Update Application"
                  )}
                </Button>

              </div>
            )}

          </section>

          {/* =================================================
              PROFESSIONAL LICENSE
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Professional License
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Professional license information submitted with your application.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* LICENSE NUMBER */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  License Number
                </label>

                <Input
                  value={professionalLicenseNumber}
                  onChange={(e) =>
                    setProfessionalLicenseNumber(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  placeholder="License number"
                  className="w-full"
                />
              </div>

              {/* LICENSE TYPE */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  License Type
                </label>

                <Input
                  value={professionalLicenseType}
                  onChange={(e) =>
                    setProfessionalLicenseType(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  placeholder="License type"
                  className="w-full"
                />
              </div>

              {/* EXPIRATION */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expiration Date
                </label>

                <Input
                  type="date"
                  value={
                    professionalLicenseExpirationDate
                  }
                  onChange={(e) =>
                    setProfessionalLicenseExpirationDate(
                      e.target.value
                    )
                  }
                  disabled={!canEdit}
                  className="w-full"
                />
              </div>

            </div>

          </section>

          {/* =================================================
              EDUCATION
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Educational Background
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Educational information submitted with your trainer application.
              </p>
            </div>

            {application.educations?.length > 0 ? (
              <div className="space-y-3">

                {application.educations.map(
                  (education) => (
                    <div
                      key={education.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {education.degree}
                          </h3>

                          {education.fieldOfStudy && (
                            <p className="mt-1 text-sm text-slate-600">
                              {education.fieldOfStudy}
                            </p>
                          )}

                          <p className="mt-2 text-sm text-slate-500">
                            {education.institution}
                          </p>

                          {education.yearGraduated && (
                            <p className="mt-1 text-xs text-slate-400">
                              Graduated:{" "}
                              {education.yearGraduated}
                            </p>
                          )}
                        </div>

                        <FileCheck2
                          size={18}
                          className="shrink-0 text-teal-600"
                        />

                      </div>
                    </div>
                  )
                )}

              </div>
            ) : (
              <EmptyState text="No educational background submitted." />
            )}

          </section>

          {/* =================================================
              CERTIFICATIONS
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Certifications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Professional certifications submitted with your application.
              </p>
            </div>

            {application.certifications?.length > 0 ? (
              <div className="space-y-3">

                {application.certifications.map(
                  (certification) => (
                    <div
                      key={certification.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {certification.name}
                          </h3>

                          {certification.issuingOrganization && (
                            <p className="mt-1 text-sm text-slate-600">
                              {certification.issuingOrganization}
                            </p>
                          )}
                        </div>

                        <FileCheck2
                          size={18}
                          className="shrink-0 text-teal-600"
                        />

                      </div>

                      <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">

                        {certification.issuedDate && (
                          <div>
                            <span className="font-semibold">
                              Issued:
                            </span>{" "}
                            {certification.issuedDate}
                          </div>
                        )}

                        {certification.expirationDate && (
                          <div>
                            <span className="font-semibold">
                              Expires:
                            </span>{" "}
                            {certification.expirationDate}
                          </div>
                        )}

                        {certification.certificateUrl && (
                          <div className="sm:col-span-2">
                            <a
                              href={
                                certification.certificateUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-teal-600 hover:text-teal-700"
                            >
                              View Certificate
                            </a>
                          </div>
                        )}

                      </div>
                    </div>
                  )
                )}

              </div>
            ) : (
              <EmptyState text="No certifications submitted." />
            )}

          </section>

          {/* =================================================
              SUPPORTING DOCUMENTS
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Supporting Documents
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload documents required for your trainer application.
              </p>
            </div>

            {/* UPLOAD */}

            {canUploadDocuments && (
              <div className="mb-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">

                <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">

                  {/* DOCUMENT TYPE */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Document Type
                    </label>

                    <Input
                      value={documentType}
                      onChange={(e) =>
                        setDocumentType(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Certificate"
                      className="w-full bg-white"
                    />
                  </div>

                  {/* FILE */}

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      File
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0];

                        if (file) {
                          handleDocumentSelect(
                            file
                          );
                        }
                      }}
                      className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  {/* UPLOAD */}

                  <Button
                    type="button"
                    onClick={
                      handleUploadDocument
                    }
                    disabled={
                      isUploading ||
                      !selectedFile ||
                      !documentType.trim()
                    }
                    variant="primary"
                    className="rounded-lg"
                  >
                    {isUploading ? (
                      <Loader2
                        size={16}
                        className="mr-2 animate-spin"
                      />
                    ) : (
                      <Upload
                        size={16}
                        className="mr-2"
                      />
                    )}

                    Upload
                  </Button>

                </div>
              </div>
            )}

            {/* DOCUMENT LIST */}

            <div className="space-y-3">

              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                  <FileText
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    No documents uploaded yet.
                  </p>

                </div>
              ) : (
                documents.map(
                  (document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <FileText
                            size={20}
                            className="text-slate-600"
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {document.fileName}
                          </p>

                          <p className="text-xs text-slate-500">
                            {document.documentType}
                          </p>

                        </div>

                      </div>

                      <div className="flex shrink-0 items-center gap-3">

                        <span
                          className={`
                            rounded-full px-3 py-1 text-xs font-semibold
                            ${
                              document.status === "Approved"
                                ? "bg-green-50 text-green-700"
                                : document.status === "Rejected"
                                  ? "bg-red-50 text-red-700"
                                  : document.status === "NeedsCorrection"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                            }
                          `}
                        >
                          {document.status}
                        </span>

                        {!isApproved &&
                          document.status !==
                            "Approved" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteDocument(
                                  document.id
                                )
                              }
                              className="text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </section>

        </div>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================= */}

        <div className="space-y-6">

          {/* =================================================
              PROFILE
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 font-bold text-slate-900">
              Profile
            </h2>

            <div className="flex flex-col items-center">

              <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-slate-100 bg-slate-100">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Trainer profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound
                      size={42}
                      className="text-slate-300"
                    />
                  </div>
                )}

              </div>

              {canChangeProfileImage && (
                <label className="cursor-pointer">

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (file) {
                        handleProfileImage(
                          file
                        );
                      }
                    }}
                  />

                  <span className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">

                    <Upload
                      size={14}
                      className="mr-2"
                    />

                    Change Photo

                  </span>

                </label>
              )}

            </div>

          </section>

          {/* =================================================
              APPLICATION SUMMARY
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 font-bold text-slate-900">
              Application Summary
            </h2>

            <div className="space-y-4">

              <SummaryItem
                label="Application ID"
                value={application.id}
              />

              <SummaryItem
                label="Status"
                value={currentStatus}
              />

              <SummaryItem
                label="Submitted"
                value={formatDate(
                  application.submittedAt
                )}
              />

              <SummaryItem
                label="Created"
                value={formatDate(
                  application.createdAt
                )}
              />

            </div>

          </section>

          {/* =================================================
              APPLICATION TIMELINE
          ================================================= */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 font-bold text-slate-900">
              Application Status
            </h2>

            <div className="space-y-5">

              <TimelineItem
                title="Application Submitted"
                active
                done
              />

              <TimelineItem
                title="Administrator Review"
                active={
                  isUnderReview ||
                  isApproved ||
                  isRejected ||
                  needsCorrection
                }
                done={
                  isApproved ||
                  isRejected ||
                  needsCorrection
                }
              />

              <TimelineItem
                title="Final Decision"
                active={
                  isApproved ||
                  isRejected
                }
                done={
                  isApproved ||
                  isRejected
                }
                last
              />

            </div>

          </section>

          {/* =================================================
              ACCESS NOTICE
          ================================================= */}

          <section
            className={`
              rounded-2xl border p-5
              ${
                isApproved
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }
            `}
          >

            <div className="flex gap-3">

              {isApproved ? (
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-green-600"
                />
              ) : (
                <Clock3
                  size={20}
                  className="mt-0.5 shrink-0 text-slate-500"
                />
              )}

              <div>

                <h3 className="text-sm font-bold text-slate-900">
                  {isApproved
                    ? "Trainer Access Enabled"
                    : "Trainer Access Locked"}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isApproved
                    ? "Your trainer dashboard and all trainer features are now available."
                    : "Your trainer dashboard remains locked until your application is approved by an administrator."}
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-red-200 bg-white p-4 shadow-xl">

          <div className="flex gap-3">

            <AlertCircle
              size={20}
              className="shrink-0 text-red-500"
            />

            <div>

              <p className="text-sm font-semibold text-slate-900">
                Something went wrong
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {error}
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =========================================================
// INFO FIELD
// =========================================================

function InfoField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

// =========================================================
// SUMMARY ITEM
// =========================================================

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm text-slate-700">
        {value}
      </p>
    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
      <p className="text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}

// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

// =========================================================
// TIMELINE ITEM
// =========================================================

function TimelineItem({
  title,
  active,
  done,
  last = false,
}: {
  title: string;
  active: boolean;
  done: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-3">

      {!last && (
        <div
          className={`
            absolute left-[9px] top-5 h-full w-px
            ${
              done
                ? "bg-teal-400"
                : "bg-slate-200"
            }
          `}
        />
      )}

      <div
        className={`
          relative z-10 flex h-5 w-5 shrink-0
          items-center justify-center rounded-full
          ${
            done
              ? "bg-teal-500"
              : active
                ? "border-2 border-teal-500 bg-white"
                : "border-2 border-slate-200 bg-white"
          }
        `}
      >
        {done && (
          <CheckCircle2
            size={14}
            className="text-white"
          />
        )}
      </div>

      <p
        className={`
          text-sm
          ${
            active
              ? "font-semibold text-slate-900"
              : "text-slate-400"
          }
        `}
      >
        {title}
      </p>

    </div>
  );
}