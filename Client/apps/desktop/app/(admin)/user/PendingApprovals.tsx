"use client";

import {
  Clock3,
  FileCheck2,
  ChevronRight,
} from "lucide-react";

import type {
  ParticipantApplication,
} from "@repo/types";

interface PendingApprovalsProps {
  applications: ParticipantApplication[];
  onSelect: (
    application: ParticipantApplication
  ) => void;
}

export default function PendingApprovals({
  applications,
  onSelect,
}: PendingApprovalsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Pending Approvals
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Participant applications awaiting review
          </p>
        </div>

        <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-amber-50 px-2 text-xs font-bold text-amber-700">
          {applications.length}
        </div>
      </div>

      {/* =====================================================
          APPLICATION LIST
      ===================================================== */}

      <div className="max-h-[520px] overflow-y-auto p-3">
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

            <p className="mt-1 max-w-[240px] text-xs leading-5 text-gray-400">
              New participant applications will appear
              here when they are submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.map((application) => {
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

              return (
                <button
                  key={application.id}
                  type="button"
                  onClick={() =>
                    onSelect(application)
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
                  {/* PROFILE */}

                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {application.profileImage ? (
                      <img
                        src={application.profileImage}
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-500">
                        {initials || "?"}
                      </div>
                    )}
                  </div>

                  {/* INFORMATION */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {fullName}
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
                      {application.email}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        {application.status}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock3 size={11} />

                        {new Date(
                          application.submittedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}