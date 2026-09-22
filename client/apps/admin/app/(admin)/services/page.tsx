"use client";

import { useEffect, useState } from "react";

import type {
  CreateService,
  Service,
  UpdateService,
} from "@repo/types";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";
import { StatCard } from "@repo/ui/index";

import { ServiceHeader } from "@/components/Services/ServiceHeader";
import { ServiceTable } from "@/components/Services/ServiceTable";
import { ServiceFormModal } from "@/components/Services/ServiceFormModal";
import { DeleteServiceDialog } from "@/components/Services/DeleteServiceDialog";

export default function ServicesPage() {
  const {
    services,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    getServices,
    createService,
    updateService,
    deleteService,
  } = useService(serviceApi);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [serviceToDelete, setServiceToDelete] =
    useState<Service | null>(null);

  useEffect(() => {
    void getServices();

    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isCreating || isUpdating) {
      return;
    }

    setIsFormOpen(false);
    setSelectedService(null);
  };

  const handleSubmit = async (
    data: CreateService | UpdateService,
  ) => {
    if (selectedService) {
      const result = await updateService(
        selectedService.id,
        data as UpdateService,
      );

      if (result) {
        setIsFormOpen(false);
        setSelectedService(null);

        await getServices();
      }

      return;
    }

    const result = await createService(
      data as CreateService,
    );

    if (result) {
      setIsFormOpen(false);
      setSelectedService(null);

      await getServices();
    }
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    if (isDeleting) {
      return;
    }

    setIsDeleteOpen(false);
    setServiceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) {
      return;
    }

    const success = await deleteService(
      serviceToDelete.id,
    );

    if (success) {
      setIsDeleteOpen(false);
      setServiceToDelete(null);

      await getServices();
    }
  };

  const totalServices = services.length;

  const activeServices = services.filter(
    (service) => service.isActive,
  ).length;

  return (
    <div className="space-y-6">
      <ServiceHeader onCreate={handleCreate} />

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">
            !
          </div>

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
        <StatCard
          title="Total Services"
          value={totalServices}
          description={`${activeServices} active`}
          variant="primary"
        />

        <StatCard
          title="Active Services"
          value={activeServices}
          description="Currently available services"
          variant="success"
        />
      </div>

      <section >
        <div>
          <ServiceTable
            services={services}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </section>

      <ServiceFormModal
        open={isFormOpen}
        service={selectedService}
        isSubmitting={isCreating || isUpdating}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <DeleteServiceDialog
        service={isDeleteOpen ? serviceToDelete : null}
        isDeleting={isDeleting}
        onCancel={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}