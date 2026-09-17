"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  ServiceConsultation,
  ServiceConsultationStatus,
} from "@repo/types";

interface ServiceConsultationTableProps {
  consultations: ServiceConsultation[];
  isLoading: boolean;
  onEdit: (
    consultation: ServiceConsultation,
  ) => void;
}

function getStatusStyle(
  status: ServiceConsultationStatus,
) {
  switch (status) {
    case "Scheduled":
      return {
        label: "Scheduled",
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "InProgress":
      return {
        label: "In Progress",
        className:
          "border-indigo-200 bg-indigo-50 text-indigo-700",
      };

    case "Completed":
      return {
        label: "Completed",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "Cancelled":
      return {
        label: "Cancelled",
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
      };

    default:
      return {
        label: status,
        className:
          "border-gray-200 bg-gray-50 text-gray-600",
      };
  }
}

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
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

function formatTime(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export function ServiceConsultationTable({
  consultations,
  isLoading,
  onEdit,
}: ServiceConsultationTableProps) {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      ServiceConsultationStatus | "All"
    >("All");

  const filteredConsultations =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return consultations.filter(
        (consultation) => {
          const matchesSearch =
            !query ||
            [
              consultation.serviceName,
              consultation.applicantName,
              consultation.applicantEmail,
              consultation.notes,
              consultation.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "All" ||
            consultation.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      consultations,
      search,
      statusFilter,
    ]);

  return (
    <section>
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#17191c]">
            Consultations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage client consultation schedules and sessions.
          </p>
        </div>

        <div className="text-xs text-gray-400">
          <span className="font-semibold text-gray-700">
            {
              consultations.length
            }
          </span>{" "}
          {consultations.length ===
          1
            ? "session"
            : "sessions"}
        </div>
      </div>

      {/* ======================================================
          TOOLBAR
      ======================================================= */}

      <div className="mt-5 flex flex-col gap-3 border-y border-gray-100 py-4 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="relative w-full sm:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path
              d="m20 20-3.5-3.5"
            />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search consultations..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target
                .value as
                | ServiceConsultationStatus
                | "All",
            )
          }
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300"
        >
          <option value="All">
            All Status
          </option>

          <option value="Scheduled">
            Scheduled
          </option>

          <option value="InProgress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>
      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      <div className="mt-1 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Service
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Client
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Schedule
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Status
              </th>

              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Meeting
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Action
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center"
                >
                  <p className="text-sm text-gray-400">
                    Loading consultations...
                  </p>
                </td>
              </tr>
            ) : filteredConsultations.length ===
              0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm text-gray-400">
                      —
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-gray-600">
                    No consultations
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {search ||
                    statusFilter !==
                      "All"
                      ? "Try changing your search or filter."
                      : "Scheduled consultations will appear here."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredConsultations.map(
                (
                  consultation,
                ) => {
                  const status =
                    getStatusStyle(
                      consultation.status,
                    );

                  return (
                    <tr
                      key={
                        consultation.id
                      }
                      className="group transition hover:bg-gray-50/70"
                    >
                      {/* SERVICE */}
                      <td className="px-4 py-4">
                        <div className="max-w-[200px]">
                          <p className="truncate text-xs font-semibold text-gray-800">
                            {consultation.serviceName ||
                              "Unknown Service"}
                          </p>

                          {consultation.notes && (
                            <p className="mt-1 truncate text-[11px] text-gray-400">
                              {
                                consultation.notes
                              }
                            </p>
                          )}
                        </div>
                      </td>

                      {/* CLIENT */}
                      <td className="px-4 py-4">
                        <div className="max-w-[200px]">
                          <p className="truncate text-xs font-semibold text-gray-700">
                            {consultation.applicantName ||
                              "Unknown Applicant"}
                          </p>

                          {consultation.applicantEmail && (
                            <p className="mt-1 truncate text-[11px] text-gray-400">
                              {
                                consultation.applicantEmail
                              }
                            </p>
                          )}
                        </div>
                      </td>

                      {/* SCHEDULE */}
                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-xs font-semibold text-gray-700">
                          {formatDate(
                            consultation.scheduledAt,
                          )}
                        </p>

                        <p className="mt-1 whitespace-nowrap text-[11px] text-gray-400">
                          {formatTime(
                            consultation.scheduledAt,
                          )}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* MEETING */}
                      <td className="px-4 py-4">
                        {consultation.meetingLink ? (
                          <a
                            href={
                              consultation.meetingLink
                            }
                            target="_blank"
                            rel="noreferrer"
                            onClick={(
                              event,
                            ) =>
                              event.stopPropagation()
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0b3768] hover:underline"
                          >
                            Open Meeting
                            <span>
                              ↗
                            </span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">
                            —
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(
                              consultation,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-[#17191c]"
                        >
                          View
                          <span className="text-gray-400">
                            →
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          FOOTER
      ======================================================= */}

      {!isLoading &&
        filteredConsultations.length >
          0 && (
          <div className="flex items-center justify-between pt-3 text-[11px] text-gray-400">
            <span>
              Showing{" "}
              <strong className="font-semibold text-gray-600">
                {
                  filteredConsultations.length
                }
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-gray-600">
                {
                  consultations.length
                }
              </strong>{" "}
              consultations
            </span>
          </div>
        )}
    </section>
  );
}