"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@repo/ui/index";

import type {
  ServiceRequest,
  ServiceRequestStatus,
} from "@repo/types";

import {
  columns,
  type ServiceTrainingTableMeta,
} from "./Trainingcolumns";

interface ServiceTrainingTableProps {
  requests: ServiceRequest[];
  isLoading: boolean;
  onView: (request: ServiceRequest) => void;
}

export function ServiceTrainingTable({
  requests,
  isLoading,
  onView,
}: ServiceTrainingTableProps) {
  const [statusFilter, setStatusFilter] = useState<
    "All" | ServiceRequestStatus
  >("All");

  // ============================================================
  // TRAINING REQUESTS ONLY
  // ============================================================

  const trainingRequests = useMemo(() => {
    return requests.filter(
      (request) =>
        request.resolutionType === "Training",
    );
  }, [requests]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredRequests = useMemo(() => {
    return trainingRequests.filter((request) => {
      return (
        statusFilter === "All" ||
        request.status === statusFilter
      );
    });
  }, [trainingRequests, statusFilter]);

  // ============================================================
  // TABLE DATA
  // ============================================================

  const tableData = useMemo(() => {
    return filteredRequests.map((request) => ({
      ...request,

      searchValue: [
        request.serviceName,
        request.applicantName,
        request.applicantEmail,
        request.remarks,
        request.adminRemarks,
        request.status,
        request.resolutionType,
        "Training",
      ]
        .filter(Boolean)
        .join(" "),
    }));
  }, [filteredRequests]);

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

  const meta: ServiceTrainingTableMeta = {
    onView,
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DataTable
      columns={columns}
      data={tableData}
      searchable
      searchPlaceholder="Search applicant, email, or service..."
      showPagination
      emptyTitle={
        isLoading
          ? "Loading training requests..."
          : "No training requests found"
      }
      emptyDescription={
        isLoading
          ? "Please wait while training requests are loaded."
          : hasFilters
            ? "No training requests match the selected filters."
            : "Requests resolved as Training will appear here."
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
                  | ServiceRequestStatus,
              )
            }
            className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300 focus:bg-white"
          >
            <option value="All">
              All Status
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
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

            <option value="Rejected">
              Rejected
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