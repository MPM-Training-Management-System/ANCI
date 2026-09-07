"use client";

import { useState } from "react";
import {
  Check,
  X,
  RotateCcw,
  UserRound,
  Mail,
  Phone,
  BriefcaseBusiness,
  Award,
  CalendarDays,
  FileText,
  ShieldCheck,
  Clock3,
  ChevronRight,
} from "lucide-react";

import {
  useTrainerApplications,
} from "@repo/hooks";

import {
  trainerApplicationApi,
} from "@/lib/api";

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
  } = useTrainerApplications(
    trainerApplicationApi
  );

  const [remarks, setRemarks] =
    useState("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    selectedDecision,
    setSelectedDecision,
  ] = useState<
    "Approved" |
    "Rejected" |
    "NeedsCorrection"
  >("Approved");

  // =========================================================
  // OPEN REVIEW
  // =========================================================

  const openReview = (
    application: (typeof applications)[number]
  ) => {
    setSelectedApplication(
      application
    );

    setRemarks(
      application.adminRemarks ?? ""
    );

    setSelectedDecision(
      "Approved"
    );

    setIsModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (isReviewing) return;

    setIsModalOpen(false);
    setRemarks("");
  };

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const handleReview = async () => {
    if (!selectedApplication) {
      return;
    }

    const success =
      await reviewApplication(
        selectedApplication.id,
        selectedDecision,
        remarks.trim() || undefined
      );

    if (success) {
      setIsModalOpen(false);
      setRemarks("");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="min-h-full bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />

              <p className="text-sm font-medium text-slate-600">
                Loading trainer applications...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>

      <div className="mx-auto max-w-7xl space-y-6">


        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              Trainer Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Trainer Applications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review trainer applications,
              verify submitted information,
              and manage application status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadApplications}
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
            "
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </button>

        </div>


        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <SummaryCard
            label="Total"
            value={applications.length}
            icon={<UserRound className="h-5 w-5" />}
          />

          <SummaryCard
            label="Pending"
            value={
              applications.filter(
                (x) =>
                  x.status.toLowerCase() ===
                  "pending"
              ).length
            }
            icon={<Clock3 className="h-5 w-5" />}
          />

          <SummaryCard
            label="Approved"
            value={
              applications.filter(
                (x) =>
                  x.status.toLowerCase() ===
                  "approved"
              ).length
            }
            icon={<Check className="h-5 w-5" />}
          />

          <SummaryCard
            label="Needs Review"
            value={
              applications.filter(
                (x) => {
                  const status =
                    x.status.toLowerCase();

                  return (
                    status === "rejected" ||
                    status ===
                      "needscorrection" ||
                    status ===
                      "needs correction"
                  );
                }
              ).length
            }
            icon={
              <FileText className="h-5 w-5" />
            }
          />

        </div>


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
            EMPTY STATE
        ===================================================== */}

        {!error &&
          applications.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <UserRound className="h-6 w-6 text-slate-400" />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                No trainer applications
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are currently no trainer
                applications waiting for review.
              </p>

            </div>
          )}


        {/* =====================================================
            TABLE
        ===================================================== */}

        {applications.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-slate-900">
                    Applications
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select an application to
                    review its details.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {applications.length} records
                </span>

              </div>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="border-b border-slate-100 bg-slate-50/70">

                  <tr>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Trainer
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Specialization
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Experience
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Submitted
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {applications.map(
                    (application) => (
                      <tr
                        key={
                          application.id
                        }
                        className="
                          group
                          transition
                          hover:bg-slate-50
                        "
                      >

                        {/* TRAINER */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            {application.profileImageUrl ? (
                              <img
                                src={
                                  application.profileImageUrl
                                }
                                alt={
                                  application.fullName
                                }
                                className="
                                  h-11
                                  w-11
                                  rounded-xl
                                  object-cover
                                  ring-1
                                  ring-slate-200
                                "
                              />
                            ) : (
                              <div className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-100
                                text-slate-500
                              ">
                                <UserRound className="h-5 w-5" />
                              </div>
                            )}

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-slate-900">
                                {
                                  application.fullName
                                }
                              </p>

                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                                <Mail className="h-3 w-3" />
                                {
                                  application.email
                                }
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* SPECIALIZATION */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <BriefcaseBusiness className="h-4 w-4 text-slate-400" />

                            <span>
                              {
                                application.specialization
                              }
                            </span>
                          </div>

                        </td>


                        {/* EXPERIENCE */}

                        <td className="px-6 py-5">

                          <span className="text-sm font-medium text-slate-700">
                            {
                              application.yearsOfExperience ??
                              0
                            }{" "}
                            year
                            {application.yearsOfExperience ===
                            1
                              ? ""
                              : "s"}
                          </span>

                        </td>


                        {/* SUBMITTED */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <CalendarDays className="h-4 w-4 text-slate-400" />

                            {formatDate(
                              application.submittedAt ??
                                application.createdAt
                            )}

                          </div>

                        </td>


                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <StatusBadge
                            status={
                              application.status
                            }
                          />

                        </td>


                        {/* ACTION */}

                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              openReview(
                                application
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              px-3.5
                              py-2
                              text-sm
                              font-semibold
                              text-slate-700
                              shadow-sm
                              transition
                              hover:border-slate-300
                              hover:bg-slate-900
                              hover:text-white
                            "
                          >
                            Review

                            <ChevronRight className="h-4 w-4" />
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>


      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {isModalOpen &&
        selectedApplication && (
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
            onMouseDown={(e) => {
              if (
                e.target === e.currentTarget
              ) {
                closeModal();
              }
            }}
          >

            {/* =================================================
                MODAL
            ================================================= */}

            <div
              className="
                flex
                max-h-[94vh]
                w-full
                max-w-4xl
                flex-col
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-2xl
                ring-1
                ring-black/5
              "
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex min-w-0 items-center gap-4">

                    {selectedApplication.profileImageUrl ? (
                      <img
                        src={
                          selectedApplication.profileImageUrl
                        }
                        alt={
                          selectedApplication.fullName
                        }
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
                      <div className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-slate-100
                        text-slate-500
                      ">
                        <UserRound className="h-6 w-6" />
                      </div>
                    )}

                    <div className="min-w-0">

                      <div className="mb-1 flex items-center gap-2">

                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Trainer Application
                        </span>

                        <StatusBadge
                          status={
                            selectedApplication.status
                          }
                        />

                      </div>

                      <h2 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
                        {
                          selectedApplication.fullName
                        }
                      </h2>

                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {
                          selectedApplication.email
                        }
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={closeModal}
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


              {/* =================================================
                  SCROLLABLE MODAL BODY
              ================================================= */}

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                "
              >

                <div className="space-y-6 p-5 sm:p-7">

                  {/* =================================================
                      PERSONAL INFORMATION
                  ================================================= */}

                  <Section
                    title="Personal Information"
                    icon={
                      <UserRound className="h-4 w-4" />
                    }
                  >

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                      <Info
                        label="Full Name"
                        value={
                          selectedApplication.fullName
                        }
                      />

                      <Info
                        label="Email"
                        value={
                          selectedApplication.email
                        }
                      />

                      <Info
                        label="Mobile Number"
                        value={
                          selectedApplication.mobileNumber ??
                          "Not provided"
                        }
                      />

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
                          selectedApplication.specialization
                        }
                      />

                      <Info
                        label="Years of Experience"
                        value={
                          selectedApplication.yearsOfExperience !=
                          null
                            ? `${selectedApplication.yearsOfExperience} years`
                            : "Not specified"
                        }
                      />

                      <Info
                        label="Certification Name"
                        value={
                          selectedApplication.certificationName ??
                          "Not specified"
                        }
                      />

                      <Info
                        label="Certification Number"
                        value={
                          selectedApplication.certificationNumber ??
                          "Not specified"
                        }
                      />

                    </div>

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

                    {selectedApplication.documents.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                        <FileText className="mx-auto h-6 w-6 text-slate-300" />

                        <p className="mt-2 text-sm font-medium text-slate-600">
                          No documents submitted
                        </p>

                      </div>
                    ) : (
                      <div className="space-y-2">

                        {selectedApplication.documents.map(
                          (document) => (
                            <div
                              key={
                                document.id
                              }
                              className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                              "
                            >

                              <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                  <FileText className="h-5 w-5 text-slate-500" />
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {
                                      document.fileName
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {
                                      document.documentType
                                    }
                                  </p>

                                </div>

                              </div>

                              <StatusBadge
                                status={
                                  document.status
                                }
                              />

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </Section>


                  {/* =================================================
                      CURRENT ADMIN REMARKS
                  ================================================= */}

                  {selectedApplication.adminRemarks && (
                    <Section
                      title="Previous Admin Remarks"
                      icon={
                        <Award className="h-4 w-4" />
                      }
                    >

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-sm leading-6 text-slate-600">
                          {
                            selectedApplication.adminRemarks
                          }
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

                      {/* DECISION BUTTONS */}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                        <DecisionButton
                          active={
                            selectedDecision ===
                            "Approved"
                          }
                          onClick={() =>
                            setSelectedDecision(
                              "Approved"
                            )
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
                              "NeedsCorrection"
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
                            selectedDecision ===
                            "Rejected"
                          }
                          onClick={() =>
                            setSelectedDecision(
                              "Rejected"
                            )
                          }
                          icon={
                            <X className="h-4 w-4" />
                          }
                          title="Reject"
                          description="Decline application"
                        />

                      </div>


                      {/* REMARKS */}

                      <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                          Review Remarks
                        </label>

                        <textarea
                          value={
                            remarks
                          }
                          onChange={(e) =>
                            setRemarks(
                              e.target.value
                            )
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


              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="
                shrink-0
                border-t
                border-slate-200
                bg-white
                px-5
                py-4
                sm:px-7
              ">

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-slate-400">
                    Review the submitted information
                    before confirming your decision.
                  </p>

                  <div className="flex gap-3">

                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={
                        isReviewing
                      }
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
                      onClick={
                        handleReview
                      }
                      disabled={
                        isReviewing
                      }
                      className={`
                        inline-flex
                        min-w-[140px]
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
        )}

    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
    ">

      <div className="flex items-center justify-between">

        <div className="text-slate-400">
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>

      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

    </div>
  );
}


// =========================================================
// SECTION
// =========================================================

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

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

      </div>

      <div>
        {children}
      </div>

    </section>
  );
}


// =========================================================
// INFO
// =========================================================

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}


// =========================================================
// DECISION BUTTON
// =========================================================

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


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  let className =
    "bg-slate-100 text-slate-600";

  if (
    normalized === "approved"
  ) {
    className =
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }

  if (
    normalized === "rejected"
  ) {
    className =
      "bg-red-50 text-red-700 ring-1 ring-red-100";
  }

  if (
    normalized === "pending"
  ) {
    className =
      "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
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
      {status}
    </span>
  );
}


// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
  value: string
) {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}