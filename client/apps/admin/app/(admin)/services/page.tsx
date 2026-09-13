"use client";

import { useEffect, useState } from "react";

import type {
  CreateService,
  Service,
  ServiceRequest,
  ServiceRequestStatus,
  UpdateService,
} from "@repo/types";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import {
  StatCard,
  StatGrid,
} from "@repo/ui/index";

import { ServiceHeader } from "@/components/Services/ServiceHeader";
import { ServiceTable } from "@/components/Services/ServiceTable";
import { ServiceFormModal } from "@/components/Services/ServiceFormModal";
import { DeleteServiceDialog } from "@/components/Services/DeleteServiceDialog";
import { ServiceRequestTable } from "@/components/Services/ServiceRequestTable";
import { ServiceRequestReviewModal } from "@/components/Services/ServiceRequestReviewModal";

export default function ServicesPage() {
  // ============================================================
  // SERVICE HOOK
  // ============================================================

  const {
    // Services
    services,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Service Requests
    serviceRequests,
    isUpdatingRequest,

    // Error
    error,

    // Service Actions
    getServices,
    createService,
    updateService,
    deleteService,

    // Service Request Actions
    getServiceRequests,
    updateServiceRequestStatus,
  } = useService(serviceApi);

  // ============================================================
  // SERVICE FORM STATE
  // ============================================================

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  // ============================================================
  // DELETE STATE
  // ============================================================

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [serviceToDelete, setServiceToDelete] =
    useState<Service | null>(null);

  // ============================================================
  // SERVICE SEARCH
  // ============================================================

  const [search, setSearch] =
    useState("");

  // ============================================================
  // SERVICE REQUEST REVIEW STATE
  // ============================================================

  const [isReviewOpen, setIsReviewOpen] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  // ============================================================
  // INITIAL DATA LOAD
  // ============================================================

  useEffect(() => {
    getServices();
    getServiceRequests();
  }, [
    getServices,
    getServiceRequests,
  ]);

  // ============================================================
  // SERVICE SEARCH HANDLERS
  // ============================================================

  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  // ============================================================
  // CREATE SERVICE
  // ============================================================

  const handleCreate = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  // ============================================================
  // EDIT SERVICE
  // ============================================================

  const handleEdit = (
    service: Service,
  ) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  // ============================================================
  // CLOSE SERVICE FORM
  // ============================================================

  const handleCloseForm = () => {
    if (
      isCreating ||
      isUpdating
    ) {
      return;
    }

    setIsFormOpen(false);
    setSelectedService(null);
  };

  // ============================================================
  // CREATE / UPDATE SERVICE
  // ============================================================

  const handleSubmit = async (
    data:
      | CreateService
      | UpdateService,
  ) => {
    // UPDATE
    if (selectedService) {
      const result =
        await updateService(
          selectedService.id,
          data as UpdateService,
        );

      if (result) {
        setIsFormOpen(false);
        setSelectedService(null);
      }

      return;
    }

    // CREATE
    const result =
      await createService(
        data as CreateService,
      );

    if (result) {
      setIsFormOpen(false);
      setSelectedService(null);
    }
  };

  // ============================================================
  // DELETE SERVICE
  // ============================================================

  const handleDelete = (
    service: Service,
  ) => {
    setServiceToDelete(service);
    setIsDeleteOpen(true);
  };

  // ============================================================
  // CLOSE DELETE DIALOG
  // ============================================================

  const handleCloseDelete = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteOpen(false);
    setServiceToDelete(null);
  };

  // ============================================================
  // CONFIRM DELETE
  // ============================================================

  const handleConfirmDelete =
    async () => {
      if (!serviceToDelete) {
        return;
      }

      const success =
        await deleteService(
          serviceToDelete.id,
        );

      if (success) {
        setIsDeleteOpen(false);
        setServiceToDelete(null);
      }
    };

  // ============================================================
  // REVIEW SERVICE REQUEST
  // ============================================================

  const handleReviewRequest = (
    request: ServiceRequest,
  ) => {
    setSelectedRequest(request);
    setIsReviewOpen(true);
  };

  // ============================================================
  // CLOSE REVIEW MODAL
  // ============================================================

  const handleCloseReview = () => {
    if (isUpdatingRequest) {
      return;
    }

    setIsReviewOpen(false);
    setSelectedRequest(null);
  };

  // ============================================================
  // APPROVE / REJECT SERVICE REQUEST
  // ============================================================

  const handleRequestStatusUpdate =
    async (
      status: ServiceRequestStatus,
      remarks: string,
    ) => {
      if (!selectedRequest) {
        return;
      }

      const result =
        await updateServiceRequestStatus(
          selectedRequest.id,
          {
            status,
            remarks,
          },
        );

      if (result) {
        setIsReviewOpen(false);
        setSelectedRequest(null);
      }
    };

  // ============================================================
  // SERVICE STATISTICS
  // ============================================================

  const totalServices =
    services.length;

  const activeServices =
    services.filter(
      (service) =>
        service.isActive,
    ).length;

  const inactiveServices =
    services.filter(
      (service) =>
        !service.isActive,
    ).length;

  const trainingServices =
    services.filter(
      (service) =>
        service.requiresTraining,
    ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <ServiceHeader
        onCreate={handleCreate}
      />

      {/* ======================================================
          ERROR ALERT
      ======================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          SERVICE STATISTICS
      ======================================================= */}

      <StatGrid>
        <StatCard
          title="Total Services"
          value={totalServices}
          description="All services registered in the system."
        />

        <StatCard
          title="Active Services"
          value={activeServices}
          description="Services currently available."
        />

        <StatCard
          title="Inactive Services"
          value={inactiveServices}
          description="Services currently disabled."
        />

        <StatCard
          title="Training Services"
          value={trainingServices}
          description="Services that require participant training."
        />
      </StatGrid>

      {/* ======================================================
          AVAILABLE SERVICES
      ======================================================= */}

      <ServiceTable
        services={services}
        isLoading={isLoading}
        search={search}
        onSearchChange={
          handleSearchChange
        }
        onClearSearch={
          handleClearSearch
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* ======================================================
          SERVICE REQUESTS
      ======================================================= */}

      <ServiceRequestTable
        requests={serviceRequests}
        isLoading={isLoading}
        onReview={
          handleReviewRequest
        }
      />

      {/* ======================================================
          CREATE / EDIT SERVICE MODAL
      ======================================================= */}

      <ServiceFormModal
        open={isFormOpen}
        service={selectedService}
        isSubmitting={
          isCreating ||
          isUpdating
        }
        onClose={
          handleCloseForm
        }
        onSubmit={
          handleSubmit
        }
      />

      {/* ======================================================
          DELETE SERVICE DIALOG
      ======================================================= */}

      <DeleteServiceDialog
        service={
          isDeleteOpen
            ? serviceToDelete
            : null
        }
        isDeleting={isDeleting}
        onCancel={
          handleCloseDelete
        }
        onConfirm={
          handleConfirmDelete
        }
      />

      {/* ======================================================
          SERVICE REQUEST REVIEW MODAL
      ======================================================= */}

      <ServiceRequestReviewModal
        open={isReviewOpen}
        request={selectedRequest}
        isSubmitting={
          isUpdatingRequest
        }
        onClose={
          handleCloseReview
        }
        onSubmit={
          handleRequestStatusUpdate
        }
      />
    </div>
  );
}