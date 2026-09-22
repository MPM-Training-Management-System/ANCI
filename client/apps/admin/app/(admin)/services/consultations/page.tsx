"use client";

import { useEffect, useState } from "react";

import type {
  ServiceConsultation,
  ServiceConsultationStatus,
} from "@repo/types";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceConsultationTable } from "@/components/Services/ServiceConsultationTable";
import { ServiceConsultationModal } from "@/components/Services/ServiceConsultationModal";

export default function ServiceConsultationsPage() {
  const {
    consultations,
    isLoadingConsultations,
    isSubmittingConsultation,
    error,

    getConsultations,
    createConsultation,
    updateConsultation,
  } = useService(serviceApi);

  const [
    isConsultationOpen,
    setIsConsultationOpen,
  ] = useState(false);

  const [
    selectedConsultation,
    setSelectedConsultation,
  ] = useState<ServiceConsultation | null>(
    null,
  );

  useEffect(() => {
    void getConsultations();

    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (
    consultation: ServiceConsultation,
  ) => {
    setSelectedConsultation(consultation);
    setIsConsultationOpen(true);
  };

  const handleClose = () => {
    if (isSubmittingConsultation) {
      return;
    }

    setIsConsultationOpen(false);
    setSelectedConsultation(null);
  };

  const handleSubmit = async (
    scheduledAt: string,
    meetingLink: string,
    notes: string,
    status: ServiceConsultationStatus,
  ) => {
    if (!selectedConsultation) {
      return;
    }

    let result:
      | ServiceConsultation
      | null = null;

    if (!selectedConsultation.id) {
      result = await createConsultation({
        serviceRequestId:
          selectedConsultation.serviceRequestId,
        scheduledAt,
        meetingLink,
        notes: notes.trim() || null,
      });
    } else {
      result = await updateConsultation(
        selectedConsultation.id,
        {
          scheduledAt,
          meetingLink,
          notes: notes.trim() || null,
          status,
        },
      );
    }

    if (!result) {
      return;
    }

    setIsConsultationOpen(false);
    setSelectedConsultation(null);

    await getConsultations();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#17191c]">
          Consultations
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage scheduled service consultations.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <ServiceConsultationTable
            consultations={consultations}
            isLoading={isLoadingConsultations}
            onEdit={handleEdit}
          />
        </div>
      </section>

      <ServiceConsultationModal
        open={isConsultationOpen}
        consultation={selectedConsultation}
        isSubmitting={isSubmittingConsultation}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}