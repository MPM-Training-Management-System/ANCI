"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@repo/ui/index";

import type {
  ServiceConsultation,
  ServiceConsultationStatus,
} from "@repo/types";

import {
  columns,
  type ServiceConsultationTableMeta,
} from "./Consultationcolumns";

interface ServiceConsultationTableProps {
  consultations: ServiceConsultation[];
  isLoading: boolean;
  onEdit: (
    consultation: ServiceConsultation,
  ) => void;
}

export function ServiceConsultationTable({
  consultations,
  isLoading,
  onEdit,
}: ServiceConsultationTableProps) {
  const [statusFilter, setStatusFilter] = useState<
    "All" | ServiceConsultationStatus
  >("All");

  // ============================================================
  // FILTERED DATA
  // ============================================================

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      return (
        statusFilter === "All" ||
        consultation.status === statusFilter
      );
    });
  }, [consultations, statusFilter]);

  // ============================================================
  // TABLE DATA
  // ============================================================

  const tableData = useMemo(() => {
    return filteredConsultations.map(
      (consultation) => ({
        ...consultation,

        searchValue: [
          consultation.serviceName,
          consultation.applicantName,
          consultation.applicantEmail,
          consultation.notes,
          consultation.status,
          consultation.meetingLink,
        ]
          .filter(Boolean)
          .join(" "),
      }),
    );
  }, [filteredConsultations]);

  // ============================================================
  // FILTER STATE
  // ============================================================

  const hasFilters = statusFilter !== "All";

  const clearFilters = () => {
    setStatusFilter("All");
  };

  // ============================================================
  // META
  // ============================================================

  const meta: ServiceConsultationTableMeta = {
    onEdit,
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DataTable
      columns={columns}
      data={tableData}
      searchable
      searchPlaceholder="Search consultations..."
      showPagination
      emptyTitle={
        isLoading
          ? "Loading consultations..."
          : "No consultations found"
      }
      emptyDescription={
        isLoading
          ? "Please wait while consultations are loaded."
          : hasFilters
            ? "No consultations match the selected filter."
            : "Scheduled consultations will appear here."
      }
      meta={meta}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | ServiceConsultationStatus,
              )
            }
            className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300 focus:bg-white"
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

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-4 text-xs font-medium text-gray-600 transition hover:bg-white"
            >
              Clear
            </button>
          )}
        </div>
      }
    />
  );
}