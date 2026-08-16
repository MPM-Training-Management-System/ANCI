"use client";

import {
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
  Clock3,
  IdCard,
  UserCheck,
  AlertCircle,
} from "lucide-react";

import type {
  ParticipantApplicationDetails,
} from "@repo/types";

interface ApplicationDetailsModalProps {
  application: ParticipantApplicationDetails | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApplicationDetailsModal({
  application,
  onClose,
  onApprove,
  onReject,
}: ApplicationDetailsModalProps) {
  if (!application) {
    return null;
  }



  const fullName = [
    application.firstName,
    application.middleName,
    application.lastName,
  ]
    .filter(Boolean)
    .join(" ");



  const initials = [
    application.firstName?.[0],
    application.lastName?.[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();


  const policyPassed =
    application.policyStatus === "Passed";

  const policyFailed =
    application.policyStatus === "Failed";



  const applicationPending =
    application.status === "Pending";

  const applicationApproved =
    application.status === "Approved";

  const applicationRejected =
    application.status === "Rejected";

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
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
          border
          border-gray-200
          bg-white
          shadow-2xl
        "
      >
      

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            bg-white
            px-6
            py-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
              "
            >
              <UserCheck
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Participant Application
              </h2>

              <p className="mt-0.5 text-sm text-gray-500">
                Complete applicant information and
                verification details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            <X size={20} />
          </button>
        </div>



        <div className="overflow-y-auto p-6">



          <div
            className="
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              p-5
              sm:flex-row
              sm:items-center
            "
          >
          

            <div
              className="
                h-24
                w-24
                shrink-0
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-gray-200
              "
            >
              {application.profileImage ? (
                <img
                  src={application.profileImage}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    text-xl
                    font-bold
                    text-gray-500
                  "
                >
                  {initials || (
                    <UserRound size={28} />
                  )}
                </div>
              )}
            </div>

            {/* PROFILE BASIC */}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {fullName}
                </h3>

                {/* APPLICATION STATUS */}

                <span
                  className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    ${
                      applicationPending
                        ? "bg-amber-50 text-amber-700"
                        : applicationApproved
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                    }
                  `}
                >
                  {application.status}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                <p className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail size={14} />
                  {application.email}
                </p>

                <p className="text-sm text-gray-500">
                  @{application.username}
                </p>

                <p className="text-sm text-gray-500">
                  Role: {application.role}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-2.5
                    py-1
                    text-xs
                    font-medium
                    text-blue-700
                  "
                >
                  User ID: {application.userIdNumber}
                </span>

                <span
                  className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-medium
                    ${
                      application.isEmailVerified
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {application.isEmailVerified
                    ? "Email Verified"
                    : "Email Not Verified"}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <Section
            icon={
              <UserRound
                size={17}
                className="text-gray-500"
              />
            }
            title="Account Information"
          >
            <InfoItem
              label="User ID"
              value={application.userIdNumber}
            />

            <InfoItem
              label="Username"
              value={application.username}
            />

            <InfoItem
              label="Email"
              value={application.email}
            />

            <InfoItem
              label="Role"
              value={application.role}
            />

            <InfoItem
              label="Account Status"
              value={
                application.isActive
                  ? "Active"
                  : "Inactive"
              }
            />

            <InfoItem
              label="Email Verification"
              value={
                application.isEmailVerified
                  ? "Verified"
                  : "Not Verified"
              }
            />
          </Section>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <Section
            icon={
              <UserRound
                size={17}
                className="text-gray-500"
              />
            }
            title="Personal Information"
          >
            <InfoItem
              label="First Name"
              value={application.firstName}
            />

            <InfoItem
              label="Middle Name"
              value={
                application.middleName || "—"
              }
            />

            <InfoItem
              label="Last Name"
              value={application.lastName}
            />

            <InfoItem
              label="Date of Birth"
              value={formatDate(
                application.dateOfBirth
              )}
            />

            <InfoItem
              label="Gender"
              value={application.gender}
            />

            <InfoItem
              label="Civil Status"
              value={application.civilStatus}
            />

            <InfoItem
              label="Mobile Number"
              value={application.mobileNumber}
            />

            <InfoItem
              label="Home Address"
              value={application.homeAddress}
              full
            />
          </Section>

          {/* =================================================
              EMERGENCY CONTACT
          ================================================= */}

          <Section
            icon={
              <Phone
                size={17}
                className="text-gray-500"
              />
            }
            title="Emergency Contact"
          >
            <InfoItem
              label="Contact Name"
              value={
                application.emergencyContactName ||
                "—"
              }
            />

            <InfoItem
              label="Relationship"
              value={
                application.emergencyRelationship ||
                "—"
              }
            />

            <InfoItem
              label="Contact Number"
              value={
                application.emergencyContactNumber ||
                "—"
              }
            />
          </Section>

          {/* =================================================
              DOCUMENTS
          ================================================= */}

          <div className="mt-7">
            <div className="mb-3 flex items-center gap-2">
              <IdCard
                size={17}
                className="text-gray-500"
              />

              <h3 className="text-sm font-semibold text-gray-900">
                Submitted Documents
              </h3>
            </div>

            {/* VALID ID */}

            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
              "
            >
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileCheck2
                    size={16}
                    className="text-gray-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Valid Government ID
                    </p>

                    <p className="text-xs text-gray-400">
                      Submitted identification document
                    </p>
                  </div>
                </div>
              </div>

              {application.validId ? (
                <div className="p-4">
                  <div
                    className="
                      overflow-hidden
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                    "
                  >
                    <img
                      src={application.validId}
                      alt="Participant Valid ID"
                      className="
                        mx-auto
                        max-h-[500px]
                        w-full
                        object-contain
                      "
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="
                    flex
                    min-h-56
                    flex-col
                    items-center
                    justify-center
                    text-center
                    text-gray-400
                  "
                >
                  <AlertCircle size={32} />

                  <p className="mt-2 text-sm font-medium">
                    No valid ID submitted
                  </p>

                  <p className="mt-1 text-xs">
                    The applicant did not upload a valid ID.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              POLICY CHECK
          ================================================= */}

          <div className="mt-7">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-gray-500"
              />

              <h3 className="text-sm font-semibold text-gray-900">
                Automatic Policy Check
              </h3>
            </div>

            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
              "
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Policy Status
                  </p>

                  <p className="mt-0.5 text-xs text-gray-400">
                    Automatic registration requirement
                    validation
                  </p>
                </div>

                <span
                  className={`
                    inline-flex
                    w-fit
                    items-center
                    gap-1.5
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    ${
                      policyPassed
                        ? "bg-emerald-50 text-emerald-700"
                        : policyFailed
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }
                  `}
                >
                  {policyPassed && (
                    <CheckCircle2 size={14} />
                  )}

                  {policyFailed && (
                    <AlertCircle size={14} />
                  )}

                  {application.policyStatus}
                </span>
              </div>

              {application.policyRemarks && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                  "
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Policy Remarks
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-700">
                    {application.policyRemarks}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              APPLICATION INFORMATION
          ================================================= */}

          <Section
            icon={
              <CalendarDays
                size={17}
                className="text-gray-500"
              />
            }
            title="Application Information"
          >
            <InfoItem
              label="Application ID"
              value={application.id}
            />

            <InfoItem
              label="User ID"
              value={application.userId}
            />

            <InfoItem
              label="Application Status"
              value={application.status}
            />

            <InfoItem
              label="Submitted At"
              value={formatDateTime(
                application.submittedAt
              )}
            />

            <InfoItem
              label="Reviewed By"
              value={
                application.reviewedBy ||
                "Not reviewed"
              }
            />

            <InfoItem
              label="Reviewed At"
              value={
                application.reviewedAt
                  ? formatDateTime(
                      application.reviewedAt
                    )
                  : "Not reviewed"
              }
            />

            <InfoItem
              label="Rejection Reason"
              value={
                application.rejectionReason ||
                "—"
              }
              full
            />
          </Section>

          {/* =================================================
              REVIEW SUMMARY
          ================================================= */}

          <div className="mt-7">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-100
                  "
                >
                  <ShieldCheck
                    size={18}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Review Summary
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Verify the applicant's personal
                    information, emergency contact,
                    submitted Valid ID, and automatic
                    policy status before approving the
                    application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-gray-100
            bg-gray-50
            px-6
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock3 size={14} />

            <span>
              Submitted{" "}
              {formatDateTime(
                application.submittedAt
              )}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-lg
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-700
                transition
                hover:bg-gray-100
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onReject}
              className="
                rounded-lg
                border
                border-red-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-red-600
                transition
                hover:bg-red-50
              "
            >
              Reject
            </button>

            <button
              type="button"
              onClick={onApprove}
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-green-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-green-700
              "
            >
              <CheckCircle2 size={16} />

              Approve Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-7">
      <div className="mb-3 flex items-center gap-2">
        {icon}

        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-gray-100
        bg-gray-50
        px-4
        py-3
        ${
          full
            ? "sm:col-span-2"
            : ""
        }
      `}
    >
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.08em]
          text-gray-400
        "
      >
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium leading-5 text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value: string
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

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

/* =========================================================
   DATE + TIME
========================================================= */

function formatDateTime(
  value: string
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}