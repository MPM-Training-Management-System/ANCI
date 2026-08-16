"use client";

import {
  Clock3,
  FileCheck2,
  ChevronRight,
  UserCheck,
  Users,
} from "lucide-react";

import type {
  UserApplicationResponse,
} from "@repo/types";

import {
  SectionCard,
} from "@repo/ui/index";

interface PendingApprovalsProps {
  applications:
    UserApplicationResponse[];

  onSelect: (
    application: UserApplicationResponse
  ) => void;
}

export default function PendingApprovals({
  applications,
  onSelect,
}: PendingApprovalsProps) {
  return (
    <SectionCard
      title="Pending Approvals"
      description="Participant and trainer applications awaiting review"
      count={applications.length}
    >
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <FileCheck2
              size={22}
              className="text-gray-400"
            />
          </div>

          <p className="text-sm font-semibold text-gray-700">
            No pending applications
          </p>

          <p className="mt-1 max-w-[260px] text-xs leading-5 text-gray-400">
            New participant and trainer
            applications will appear here
            when they are submitted.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map(
            (application) => {
              const fullName =
                application.fullName ||
                [
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

              const isTrainer =
                application.role
                  .toLowerCase() ===
                "trainer";

              return (
                <button
                  key={application.id}
                  type="button"
                  onClick={() =>
                    onSelect(
                      application
                    )
                  }
                  className="
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-gray-100
                    bg-white
                    p-3
                    text-left
                    transition
                    hover:border-blue-200
                    hover:bg-blue-50/40
                  "
                >
                  {/* =================================
                      PROFILE
                  ================================= */}

                  <div
                    className="
                      h-11
                      w-11
                      shrink-0
                      overflow-hidden
                      rounded-xl
                      bg-gray-100
                    "
                  >
                    {application.profileImage ? (
                      <img
                        src={
                          application.profileImage
                        }
                        alt={
                          fullName ||
                          "Applicant"
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          text-xs
                          font-bold
                          text-gray-500
                        "
                      >
                        {initials ||
                          "?"}
                      </div>
                    )}
                  </div>

                  {/* =================================
                      INFORMATION
                  ================================= */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {fullName ||
                          "Unknown Applicant"}
                      </p>

                      <ChevronRight
                        size={16}
                        className="
                          shrink-0
                          text-gray-300
                          transition
                          group-hover:translate-x-0.5
                          group-hover:text-blue-500
                        "
                      />
                    </div>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {
                        application.email
                      }
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {/* ROLE */}

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          px-2
                          py-0.5
                          text-[10px]
                          font-semibold
                          ${
                            isTrainer
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }
                        `}
                      >
                        {isTrainer ? (
                          <UserCheck
                            size={10}
                          />
                        ) : (
                          <Users
                            size={10}
                          />
                        )}

                        {
                          application.role
                        }
                      </span>

                      {/* STATUS */}

                      <span
                        className="
                          rounded-full
                          bg-amber-50
                          px-2
                          py-0.5
                          text-[10px]
                          font-semibold
                          text-amber-700
                        "
                      >
                        {
                          application.status
                        }
                      </span>

                      {/* DATE */}

                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock3
                          size={11}
                        />

                        {formatDate(
                          application.submittedAt
                        )}
                      </span>
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      )}
    </SectionCard>
  );
}

// =====================================================
// DATE
// =====================================================

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString();
}