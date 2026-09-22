"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
} from "@repo/ui/index";

import type { Service } from "@repo/types";

import {
  columns,
  type ServiceTableMeta,
} from "@/app/(admin)/services/columns";

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServiceTable({
  services,
  isLoading,
  onEdit,
  onDelete,
}: ServiceTableProps) {
  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState<"All" | "Active" | "Inactive">("All");

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        services
          .map((service) => service.category)
          .filter(Boolean),
      ),
    ).sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        categoryFilter === "All" ||
        service.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active"
          ? service.isActive
          : !service.isActive);

      return (
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    services,
    categoryFilter,
    statusFilter,
  ]);

  const tableData = useMemo(() => {
    return filteredServices.map((service) => ({
      ...service,
      searchValue: [
        service.serviceCode,
        service.name,
        service.category,
        service.description ?? "",
        service.requiresTraining
          ? "training required"
          : "training not required",
        service.isActive
          ? "active"
          : "inactive",
      ]
        .filter(Boolean)
        .join(" "),
    }));
  }, [filteredServices]);

  const hasFilters =
    categoryFilter !== "All" ||
    statusFilter !== "All";

  const clearFilters = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
  };

  const meta: ServiceTableMeta = {
    onEdit,
    onDelete,
  };

  return (
    <DataTable
      columns={columns}
      data={tableData}
      searchable
      searchPlaceholder="Search services..."
      showPagination
      emptyTitle={
        isLoading
          ? "Loading services..."
          : "No services found"
      }
      emptyDescription={
        isLoading
          ? "Please wait while services are loaded."
          : hasFilters
            ? "No services match the selected filters."
            : "Create your first service to get started."
      }
      meta={meta}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value,
              )
            }
            className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300 focus:bg-white"
          >
            <option value="All">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "All"
                  | "Active"
                  | "Inactive",
              )
            }
            className="h-10 rounded-xl border border-[#e7e9ec] bg-[#f8f9fa] px-3 text-xs font-medium text-gray-600 outline-none transition focus:border-gray-300 focus:bg-white"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
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
