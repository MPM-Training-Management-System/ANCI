"use client";

import { useMemo, useState } from "react";

import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  DataTable,
  PageSection,
  PageSkeleton,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import { useTrainerApplications } from "@repo/hooks";

import { trainerApplicationApi } from "@/lib/api";

import { columns } from "./columns";
import type { TrainerApplicationRow } from "./columns";

import type { TrainerApplication } from "@repo/types";

export default function TrainerApplicationsPage() {
  const {
    applications,
    selectedApplication,
    setSelectedApplication,
    isLoading,
    isReviewing,
    error,
    loadApplications,
    reviewApplication,
  } = useTrainerApplications(trainerApplicationApi);

  const [remarks, setRemarks] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDecision, setSelectedDecision] = useState<
    "Approved" | "Rejected" | "NeedsCorrection"
  >("Approved");

  const [statusFilter, setStatusFilter] = useState("All");

  // =========================================================
  // OPEN REVIEW
  // =========================================================

  const openReview = (
    application: (typeof applications)[number],
  ) => {
    setSelectedApplication(application);

    setRemarks(application.adminRemarks ?? "");

    setSelectedDecision("Approved");

    setIsModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (isReviewing) return;

    setIsModalOpen(false);
    setRemarks("");
    setSelectedApplication(null);
  };

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const handleReview = async () => {
    if (!selectedApplication) {
      return;
    }

    const success = await reviewApplication(
      selectedApplication.id,
      selectedDecision,
      remarks.trim() || undefined,
    );

    if (success) {
      setIsModalOpen(false);
      setRemarks("");
      setSelectedApplication(null);
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredApplications = useMemo(() => {
    if (statusFilter === "All") {
      return applications;
    }

    return applications.filter(
      (application) =>
        application.status.toLowerCase() ===
        statusFilter.toLowerCase(),
    );
  }, [applications, statusFilter]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status.toLowerCase() === "pending",
  ).length;

  const approvedApplications = applications.filter(
    (application) =>
      application.status.toLowerCase() === "approved",
  ).length;

  const needsReviewApplications = applications.filter(
    (application) => {
      const status = application.status.toLowerCase();

      return (
        status === "rejected" ||
        status === "needscorrection" ||
        status === "needs correction"
      );
    },
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading && applications.length === 0) {
    return (
      <PageSkeleton
        statCards={4}
        showHeader
        showTable
        tableRows={8}
        tableColumns={7}
      />
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-full lg:p-2">
      <PageSection
        title="Trainer Applications"
        description="Review trainer applications, verify submitted information, and manage application status."
        actions={
          <button
            type="button"
            onClick={loadApplications}
            disabled={isLoading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:border-slate-300
              hover:bg-slate-50
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RotateCcw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        }
      />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <StatGrid>
          <StatCard
            title="Total Applications"
            value={totalApplications}
            description="All submitted applications"
            icon={UsersRound}
            variant="primary"
          />

          <StatCard
            title="Pending"
            value={pendingApplications}
            description="Awaiting review"
            icon={Clock3}
            variant="warning"
          />

          <StatCard
            title="Approved"
            value={approvedApplications}
            description="Approved applications"
            icon={Check}
            variant="success"
          />

          <StatCard
            title="Needs Review"
            value={needsReviewApplications}
            description="Rejected or needs correction"
            icon={FileText}
            variant="danger"
          />
        </StatGrid>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <X className="h-4 w-4 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load applications
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TABLE
        ===================================================== */}

        <DataTable
          columns={columns}
          data={filteredApplications as TrainerApplicationRow[]}
          searchable
          searchPlaceholder="Search trainer applications..."
          showPagination
          emptyTitle={
            isLoading
              ? "Loading trainer applications..."
              : "No trainer applications"
          }
          emptyDescription={
            isLoading
              ? "Please wait while applications are loaded."
              : statusFilter !== "All"
                ? "No applications match the selected status."
                : "There are currently no trainer applications."
          }
          meta={{
            onReview: (application: TrainerApplication) =>
              openReview(
                application as (typeof applications)[number],
              ),
          }}
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="
                  h-10
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-slate-400
                  focus:ring-4
                  focus:ring-slate-100
                "
                aria-label="Filter trainer applications by status"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="UnderReview">
                  Under Review
                </option>
                <option value="Approved">Approved</option>
                <option value="NeedsCorrection">
                  Needs Correction
                </option>
                <option value="Rejected">Rejected</option>
              </select>

              <div
                className="
                  flex
                  h-10
                  items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  text-xs
                  font-semibold
                  text-slate-500
                "
              >
                {filteredApplications.length} records
              </div>
            </div>
          }
        />
      </div>

      {/* =======================================================
          REVIEW MODAL
      ======================================================= */}

      {isModalOpen && selectedApplication && (
        <ReviewModal
          application={selectedApplication}
          remarks={remarks}
          setRemarks={setRemarks}
          selectedDecision={selectedDecision}
          setSelectedDecision={setSelectedDecision}
          isReviewing={isReviewing}
          onClose={closeModal}
          onSubmit={handleReview}
        />
      )}
    </div>
  );
}

// =============================================================
// REVIEW MODAL
// =============================================================

function ReviewModal({
  application,
  remarks,
  setRemarks,
  selectedDecision,
  setSelectedDecision,
  isReviewing,
  onClose,
  onSubmit,
}: {
  application: TrainerApplication;
  remarks: string;
  setRemarks: (value: string) => void;
  selectedDecision:
    | "Approved"
    | "Rejected"
    | "NeedsCorrection";
  setSelectedDecision: (
    value:
      | "Approved"
      | "Rejected"
      | "NeedsCorrection",
  ) => void;
  isReviewing: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/60
        p-3
        backdrop-blur-sm
        sm:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[94vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          ring-1
          ring-black/5
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* =====================================================
            MODAL HEADER
        ===================================================== */}

        <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {application.profileImageUrl ? (
                <img
                  src={application.profileImageUrl}
                  alt={application.fullName}
                  className="
                    h-14
                    w-14
                    shrink-0
                    rounded-2xl
                    object-cover
                    ring-1
                    ring-slate-200
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-100
                    text-slate-500
                  "
                >
                  <UserRound className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Trainer Application
                  </span>

                  <StatusBadge
                    status={application.status}
                  />
                </div>

                <h2 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
                  {application.fullName}
                </h2>

                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {application.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isReviewing}
              aria-label="Close modal"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* =====================================================
            MODAL BODY
        ===================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-7 p-5 sm:p-7">
            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <Section
              title="Personal Information"
              icon={<UserRound className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info
                  label="User Code"
                  value={application.userCode}
                />

                <Info
                  label="First Name"
                  value={getValue(
                    application,
                    "firstName",
                  )}
                />

                <Info
                  label="Middle Name"
                  value={getValue(
                    application,
                    "middleName",
                  )}
                />

                <Info
                  label="Last Name"
                  value={getValue(
                    application,
                    "lastName",
                  )}
                />

                <Info
                  label="Suffix"
                  value={getValue(
                    application,
                    "suffix",
                  )}
                />

                <Info
                  label="Birth Date"
                  value={formatDate(
                    getValue(
                      application,
                      "birthDate",
                    ),
                  )}
                />

                <Info
                  label="Gender"
                  value={getValue(
                    application,
                    "gender",
                  )}
                />

                <Info
                  label="Email"
                  value={application.email}
                />

                <Info
                  label="Mobile Number"
                  value={
                    application.mobileNumber ??
                    "Not provided"
                  }
                />

                <div className="sm:col-span-2 lg:col-span-3">
                  <Info
                    label="Address"
                    value={getValue(
                      application,
                      "address",
                    )}
                    icon={
                      <MapPin className="h-4 w-4" />
                    }
                  />
                </div>
              </div>
            </Section>

            {/* =================================================
                PROFESSIONAL INFORMATION
            ================================================= */}

            <Section
              title="Professional Information"
              icon={
                <BriefcaseBusiness className="h-4 w-4" />
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Info
                  label="Specialization"
                  value={
                    application.specialization ??
                    "Not provided"
                  }
                />

                <Info
                  label="Professional Title"
                  value={
                    application.professionalTitle ??
                    "Not provided"
                  }
                />

                <Info
                  label="Current Organization"
                  value={
                    application.currentOrganization ??
                    "Not provided"
                  }
                />

                <Info
                  label="Years of Experience"
                  value={
                    application.yearsOfExperience !=
                    null
                      ? `${application.yearsOfExperience} years`
                      : "Not specified"
                  }
                />

                <div className="sm:col-span-2">
                  <Info
                    label="Professional Bio"
                    value={
                      application.bio ??
                      "Not provided"
                    }
                    multiline
                  />
                </div>
              </div>
            </Section>

            {/* =================================================
                PROFESSIONAL LICENSE
            ================================================= */}

            <Section
              title="Professional License"
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info
                  label="License Number"
                  value={
                    application.professionalLicenseNumber ??
                    "Not provided"
                  }
                />

                <Info
                  label="License Type"
                  value={
                    application.professionalLicenseType ??
                    "Not provided"
                  }
                />

                <Info
                  label="Expiration Date"
                  value={
                    application.professionalLicenseExpirationDate
                      ? formatDate(
                          application.professionalLicenseExpirationDate,
                        )
                      : "Not provided"
                  }
                />
              </div>
            </Section>

            {/* =================================================
                EDUCATIONAL BACKGROUND
            ================================================= */}

            <Section
              title="Educational Background"
              icon={
                <Award className="h-4 w-4" />
              }
            >
              <EducationList application={application} />
            </Section>

            {/* =================================================
                CERTIFICATIONS
            ================================================= */}

            <Section
              title="Certifications"
              icon={
                <Award className="h-4 w-4" />
              }
            >
              <CertificationList
                application={application}
              />
            </Section>

            {/* =================================================
                DOCUMENTS
            ================================================= */}

            <Section
              title="Submitted Documents"
              icon={
                <FileText className="h-4 w-4" />
              }
            >
              <DocumentList
                application={application}
              />
            </Section>

            {/* =================================================
                APPLICATION INFORMATION
            ================================================= */}

            <Section
              title="Application Information"
              icon={
                <CalendarDays className="h-4 w-4" />
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Info
                  label="Application Status"
                  value={application.status}
                />

                <Info
                  label="Created At"
                  value={formatDate(
                    application.createdAt,
                  )}
                />

                <Info
                  label="Submitted At"
                  value={
                    application.submittedAt
                      ? formatDate(
                          application.submittedAt,
                        )
                      : "Not submitted"
                  }
                />
              </div>
            </Section>

            {/* =================================================
                PREVIOUS ADMIN REMARKS
            ================================================= */}

            {application.adminRemarks && (
              <Section
                title="Previous Admin Remarks"
                icon={
                  <FileCheck2 className="h-4 w-4" />
                }
              >
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                  "
                >
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {application.adminRemarks}
                  </p>
                </div>
              </Section>
            )}

            {/* =================================================
                REVIEW
            ================================================= */}

            <Section
              title="Review Decision"
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DecisionButton
                    active={
                      selectedDecision === "Approved"
                    }
                    onClick={() =>
                      setSelectedDecision("Approved")
                    }
                    icon={
                      <Check className="h-4 w-4" />
                    }
                    title="Approve"
                    description="Accept application"
                  />

                  <DecisionButton
                    active={
                      selectedDecision ===
                      "NeedsCorrection"
                    }
                    onClick={() =>
                      setSelectedDecision(
                        "NeedsCorrection",
                      )
                    }
                    icon={
                      <RotateCcw className="h-4 w-4" />
                    }
                    title="Needs Correction"
                    description="Request changes"
                  />

                  <DecisionButton
                    active={
                      selectedDecision === "Rejected"
                    }
                    onClick={() =>
                      setSelectedDecision("Rejected")
                    }
                    icon={
                      <X className="h-4 w-4" />
                    }
                    title="Reject"
                    description="Decline application"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Review Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(event) =>
                      setRemarks(event.target.value)
                    }
                    rows={5}
                    placeholder={
                      selectedDecision ===
                      "Approved"
                        ? "Add optional remarks for the trainer..."
                        : "Explain what the trainer needs to know..."
                    }
                    className="
                      w-full
                      resize-y
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-slate-800
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-slate-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-slate-100
                    "
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* =====================================================
            MODAL FOOTER
        ===================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-slate-200
            bg-white
            px-5
            py-4
            sm:px-7
          "
        >
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Review all submitted information before
              confirming your decision.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isReviewing}
                className="
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={isReviewing}
                className={`
                  inline-flex
                  min-w-[150px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  ${
                    selectedDecision ===
                    "Rejected"
                      ? "bg-red-600 hover:bg-red-700"
                      : selectedDecision ===
                          "NeedsCorrection"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-slate-900 hover:bg-slate-800"
                  }
                `}
              >
                {isReviewing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : selectedDecision ===
                  "Approved" ? (
                  <>
                    <Check className="h-4 w-4" />
                    Approve
                  </>
                ) : selectedDecision ===
                  "Rejected" ? (
                  <>
                    <X className="h-4 w-4" />
                    Reject
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Request Correction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// EDUCATION LIST
// =============================================================

function EducationList({
  application,
}: {
  application: TrainerApplication;
}) {
  const educations = (
    application.educations ?? []
  ) as unknown[];

  if (educations.length === 0) {
    return <EmptyState text="No educational background submitted." />;
  }

  return (
    <div className="space-y-3">
      {educations.map((education, index) => {
        const item = asRecord(education);

        return (
          <div
            key={
              String(
                item.id ??
                  item.Id ??
                  `education-${index}`,
              )
            }
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              p-4
            "
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Award className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {getRecordValue(
                    item,
                    "degree",
                    "Degree",
                  )}
                </p>

                <p className="text-xs text-slate-400">
                  Education #{index + 1}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info
                label="Degree"
                value={getRecordValue(
                  item,
                  "degree",
                  "Degree",
                )}
              />

              <Info
                label="Field of Study"
                value={getRecordValue(
                  item,
                  "fieldOfStudy",
                  "FieldOfStudy",
                )}
              />

              <Info
                label="Institution"
                value={getRecordValue(
                  item,
                  "institution",
                  "Institution",
                  "schoolName",
                  "SchoolName",
                )}
              />

              <Info
                label="Year Graduated"
                value={getRecordValue(
                  item,
                  "yearGraduated",
                  "YearGraduated",
                  "graduationYear",
                  "GraduationYear",
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
function CertificationList({
  application,
}: {
  application: TrainerApplication;
}) {
  const certifications = application.certifications ?? [];

  if (certifications.length === 0) {
    return (
      <EmptyState text="No certifications submitted." />
    );
  }

  return (
    <div className="space-y-3">
      {certifications.map((certification, index) => (
        <div
          key={
            certification.id ??
            `certification-${index}`
          }
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-4
          "
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-slate-100
                text-slate-500
              "
            >
              <Award className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {certification.name}
              </p>

              <p className="text-xs text-slate-400">
                Certification #{index + 1}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info
              label="Certification Name"
              value={certification.name}
            />

            <Info
              label="Issuing Organization"
              value={
                certification.issuingOrganization
              }
            />

            <Info
              label="Issue Date"
              value={
                certification.issuedDate
                  ? formatDate(
                      certification.issuedDate,
                    )
                  : "Not provided"
              }
            />

            <Info
              label="Expiration Date"
              value={
                certification.expirationDate
                  ? formatDate(
                      certification.expirationDate,
                    )
                  : "Not provided"
              }
            />

            {certification.certificateUrl && (
              <div
                className="
                  flex
                  items-end
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50/70
                  p-4
                "
              >
                <a
                  href={certification.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-slate-900
                    px-3
                    py-2
                    text-xs
                    font-bold
                    text-white
                    transition
                    hover:bg-slate-800
                  "
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Certificate
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
// =============================================================
// DOCUMENT LIST
// =============================================================

function DocumentList({
  application,
}: {
  application: TrainerApplication;
}) {
  const documents = (
    application.documents ?? []
  ) as unknown[];

  if (documents.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border
          border-dashed
          border-slate-200
          bg-slate-50
          p-8
          text-center
        "
      >
        <FileText className="mx-auto h-7 w-7 text-slate-300" />

        <p className="mt-2 text-sm font-semibold text-slate-600">
          No documents submitted
        </p>

        <p className="mt-1 text-xs text-slate-400">
          The trainer did not upload any supporting
          documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((document, index) => {
        const item = asRecord(document);

        const fileName = getRecordValue(
          item,
          "fileName",
          "FileName",
          "name",
          "Name",
        );

        const documentType = getRecordValue(
          item,
          "documentType",
          "DocumentType",
          "type",
          "Type",
        );

        const documentStatus = getRecordValue(
          item,
          "status",
          "Status",
        );

        const fileUrl = getRecordValue(
          item,
          "fileUrl",
          "FileUrl",
          "url",
          "Url",
          "documentUrl",
          "DocumentUrl",
        );

        return (
          <div
            key={
              String(
                item.id ??
                  item.Id ??
                  `document-${index}`,
              )
            }
            className="
              flex
              flex-col
              gap-4
              rounded-xl
              border
              border-slate-200
              bg-white
              p-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                "
              >
                <FileText className="h-5 w-5 text-slate-500" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {fileName}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {documentType}
                  </span>

                  {documentStatus && (
                    <>
                      <span className="text-slate-300">
                        •
                      </span>

                      <StatusBadge
                        status={documentStatus}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>

            {fileUrl !== "Not provided" && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                "
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Document
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================
// SECTION
// =============================================================

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-slate-100
            text-slate-600
          "
        >
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

// =============================================================
// INFO
// =============================================================

function Info({
  label,
  value,
  icon,
  multiline = false,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
  multiline?: boolean;
}) {
  const displayValue =
    value && value.trim()
      ? value
      : "Not provided";

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50/70
        p-4
      "
    >
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="text-slate-400">
            {icon}
          </span>
        )}

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>

      <p
        className={`
          mt-1.5
          break-words
          text-sm
          font-semibold
          text-slate-800
          ${
            multiline
              ? "whitespace-pre-wrap leading-6"
              : ""
          }
        `}
      >
        {displayValue}
      </p>
    </div>
  );
}

// =============================================================
// EMPTY STATE
// =============================================================

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-dashed
        border-slate-200
        bg-slate-50
        p-7
        text-center
      "
    >
      <FileText className="mx-auto h-6 w-6 text-slate-300" />

      <p className="mt-2 text-sm font-medium text-slate-500">
        {text}
      </p>
    </div>
  );
}

// =============================================================
// DECISION BUTTON
// =============================================================

function DecisionButton({
  active,
  onClick,
  icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl
        border
        p-4
        text-left
        transition
        ${
          active
            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      <div
        className={`
          mb-3
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          ${
            active
              ? "bg-white/10 text-white"
              : "bg-slate-100 text-slate-500"
          }
        `}
      >
        {icon}
      </div>

      <p className="text-sm font-bold">
        {title}
      </p>

      <p
        className={`
          mt-1
          text-xs
          ${
            active
              ? "text-white/60"
              : "text-slate-400"
          }
        `}
      >
        {description}
      </p>
    </button>
  );
}

// =============================================================
// STATUS BADGE
// =============================================================

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const normalized = (
    status ?? "Unknown"
  ).toLowerCase();

  let className =
    "bg-slate-100 text-slate-600";

  if (normalized === "approved") {
    className =
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }

  if (normalized === "rejected") {
    className =
      "bg-red-50 text-red-700 ring-1 ring-red-100";
  }

  if (normalized === "pending") {
    className =
      "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }

  if (normalized === "underreview") {
    className =
      "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  }

  if (
    normalized === "needscorrection" ||
    normalized === "needs correction"
  ) {
    className =
      "bg-orange-50 text-orange-700 ring-1 ring-orange-100";
  }

  return (
    <span
      className={`
        inline-flex
        whitespace-nowrap
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-bold
        uppercase
        tracking-wide
        ${className}
      `}
    >
      {status ?? "Unknown"}
    </span>
  );
}

// =============================================================
// DATE FORMAT
// =============================================================

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatOptionalDate(
  value?: string,
) {
  if (!value || value === "Not provided") {
    return "Not provided";
  }

  return formatDate(value);
}

// =============================================================
// SAFE RECORD HELPERS
// =============================================================

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    typeof value === "object" &&
    value !== null
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function getRecordValue(
  record: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = record[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return "Not provided";
}

function getValue(
  object: unknown,
  ...keys: string[]
): string {
  const record = asRecord(object);

  return getRecordValue(record, ...keys);
}