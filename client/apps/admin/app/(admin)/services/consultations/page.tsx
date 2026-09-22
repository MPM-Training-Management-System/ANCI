"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  ServiceConsultation,
  ServiceConsultationStatus,
} from "@repo/types";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceConsultationTable } from "@/components/Services/ServiceConsultationTable";
import { ServiceConsultationModal } from "@/components/Services/ServiceConsultationModal";

import {
  PageSection,
  StatCard,
  StatGrid,
} from "@repo/ui/index";

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

  // =========================
  // STATISTICS
  // =========================

  const consultationStats = useMemo(() => {
    return {
      total: consultations.length,

      scheduled: consultations.filter(
        (consultation) =>
          consultation.status === "Scheduled",
      ).length,

      inProgress: consultations.filter(
        (consultation) =>
          consultation.status === "InProgress",
      ).length,

      completed: consultations.filter(
        (consultation) =>
          consultation.status === "Completed",
      ).length,

      cancelled: consultations.filter(
        (consultation) =>
          consultation.status === "Cancelled",
      ).length,
    };
  }, [consultations]);

  // =========================
  // EDIT
  // =========================

  const handleEdit = (
    consultation: ServiceConsultation,
  ) => {
    setSelectedConsultation(consultation);
    setIsConsultationOpen(true);
  };

  // =========================
  // CLOSE
  // =========================

  const handleClose = () => {
    if (isSubmittingConsultation) {
      return;
    }

    setIsConsultationOpen(false);
    setSelectedConsultation(null);
  };

  // =========================
  // SUBMIT
  // =========================

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

        notes:
          notes.trim() || null,
      });
    } else {
      result = await updateConsultation(
        selectedConsultation.id,
        {
          scheduledAt,
          meetingLink,
          notes:
            notes.trim() || null,
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
      {/* =========================
          HEADER
      ========================== */}

      <PageSection
        title="Consultations"
        description="Manage and monitor service consultations."
      />

      {/* =========================
          STATISTICS
      ========================== */}

      <StatGrid>
        <StatCard
          title="Total Consultations"
          value={consultationStats.total}
          variant="primary"
        />

        <StatCard
          title="Scheduled"
          value={consultationStats.scheduled}
          variant="warning"
        />

        <StatCard
          title="In Progress"
          value={consultationStats.inProgress}
          variant="primary"
        />

        <StatCard
          title="Completed"
          value={consultationStats.completed}
          variant="success"
        />

        <StatCard
          title="Cancelled"
          value={consultationStats.cancelled}
          variant="danger"
        />
      </StatGrid>

      {/* =========================
          ERROR
      ========================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =========================
          TABLE
      ========================== */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <ServiceConsultationTable
            consultations={consultations}
            isLoading={
              isLoadingConsultations
            }
            onEdit={handleEdit}
          />
        </div>
      </section>

      {/* =========================
          CONSULTATION MODAL
      ========================== */}

      <ServiceConsultationModal
        open={isConsultationOpen}
        consultation={
          selectedConsultation
        }
        isSubmitting={
          isSubmittingConsultation
        }
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </div>
  );
}