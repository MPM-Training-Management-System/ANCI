"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  CreateService,
  Service,
  ServiceConsultation,
  ServiceConsultationStatus,
  ServiceRequest,
  ServiceRequestResolutionType,
  ServiceRequestStatus,
  UpdateService,
} from "@repo/types";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceHeader } from "@/components/Services/ServiceHeader";
import { ServiceTable } from "@/components/Services/ServiceTable";
import { ServiceFormModal } from "@/components/Services/ServiceFormModal";
import { DeleteServiceDialog } from "@/components/Services/DeleteServiceDialog";
import { ServiceRequestTable } from "@/components/Services/ServiceRequestTable";
import { ServiceRequestReviewModal } from "@/components/Services/ServiceRequestReviewModal";
import { ServiceConsultationTable } from "@/components/Services/ServiceConsultationTable";
import { ServiceConsultationModal } from "@/components/Services/ServiceConsultationModal";
import { ServiceTrainingTable } from "@/components/Services/ServiceTrainingTable";

// ============================================================
// SERVICE TAB
// ============================================================

type ServiceTab =
  | "services"
  | "requests"
  | "consultations"
  | "training";

// ============================================================
// PAGE
// ============================================================

export default function ServicesPage() {
  // ============================================================
  // SERVICE HOOK
  // ============================================================

  const {
    // ----------------------------------------------------------
    // Services
    // ----------------------------------------------------------

    services,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // ----------------------------------------------------------
    // Service Requests
    // ----------------------------------------------------------

    serviceRequests,
    isUpdatingRequest,

    // ----------------------------------------------------------
    // Consultations
    // ----------------------------------------------------------

    consultations,
    isLoadingConsultations,
    isSubmittingConsultation,

    // ----------------------------------------------------------
    // Error
    // ----------------------------------------------------------

    error,

    // ----------------------------------------------------------
    // Service Actions
    // ----------------------------------------------------------

    getServices,
    createService,
    updateService,
    deleteService,

    // ----------------------------------------------------------
    // Service Request Actions
    // ----------------------------------------------------------

    getServiceRequests,
    reviewServiceRequest,

    // ----------------------------------------------------------
    // Consultation Actions
    // ----------------------------------------------------------

    getConsultations,
    createConsultation,
    updateConsultation,
  } = useService(serviceApi);

  // ============================================================
  // ACTIVE TAB
  // ============================================================

  const [activeTab, setActiveTab] =
    useState<ServiceTab>("services");

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
  // REQUEST REVIEW STATE
  // ============================================================

  const [isReviewOpen, setIsReviewOpen] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  // ============================================================
  // CONSULTATION STATE
  // ============================================================

  const [isConsultationOpen, setIsConsultationOpen] =
    useState(false);

  const [selectedConsultation, setSelectedConsultation] =
    useState<ServiceConsultation | null>(null);

  // ============================================================
  // INITIAL DATA LOAD
  // ============================================================

  useEffect(() => {
    void getServices();
    void getServiceRequests();
    void getConsultations();

    // We only want to load the initial page data once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // SERVICE SEARCH
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
    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    if (selectedService) {
      const result =
        await updateService(
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

    // ----------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------

    const result =
      await createService(
        data as CreateService,
      );

    if (result) {
      setIsFormOpen(false);
      setSelectedService(null);

      await getServices();
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
  // CLOSE DELETE
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

        await getServices();
      }
    };

  // ============================================================
  // MANAGE SERVICE REQUEST
  // ============================================================

  const handleReviewRequest = (
    request: ServiceRequest,
  ) => {
    /*
     * ----------------------------------------------------------
     * CONSULTATION MANAGEMENT
     * ----------------------------------------------------------
     *
     * Once a request has already been resolved as a
     * consultation, the admin should manage the consultation
     * instead of opening the request review modal again.
     *
     * Possible flow:
     *
     * Approved + Consultation
     *        ↓
     * Manage
     *        ↓
     * Existing consultation?
     *     YES       NO
     *      ↓         ↓
     *    Edit      Schedule
     */

    if (
      request.resolutionType ===
        "Consultation" &&
      request.status !== "Pending" &&
      request.status !== "Rejected"
    ) {
      const existingConsultation =
        consultations.find(
          (consultation) =>
            consultation.serviceRequestId ===
            request.id,
        );

      // --------------------------------------------------------
      // EXISTING CONSULTATION
      // --------------------------------------------------------

      if (existingConsultation) {
        setSelectedConsultation(
          existingConsultation,
        );
      }

      // --------------------------------------------------------
      // NO CONSULTATION YET
      // --------------------------------------------------------

      else {
        setSelectedConsultation({
          id: "",

          serviceRequestId:
            request.id,

          serviceName:
            request.serviceName,

          applicantName:
            request.applicantName,

          applicantEmail:
            request.applicantEmail,

          scheduledAt: "",

          endedAt: null,

          meetingLink: "",

          notes: null,

          status:
            "Scheduled",

          createdAt: "",

          updatedAt: "",
        });
      }

      setActiveTab(
        "consultations",
      );

      setIsConsultationOpen(
        true,
      );

      return;
    }

    // ----------------------------------------------------------
    // NORMAL REQUEST REVIEW
    // ----------------------------------------------------------

    setSelectedRequest(request);
    setIsReviewOpen(true);
  };

  // ============================================================
  // CLOSE REQUEST REVIEW
  // ============================================================

  const handleCloseReview = () => {
    if (isUpdatingRequest) {
      return;
    }

    setIsReviewOpen(false);
    setSelectedRequest(null);
  };

  // ============================================================
  // REQUEST REVIEW
  // ============================================================

  const handleRequestReview = async (
    status: ServiceRequestStatus,
    resolutionType:
      | ServiceRequestResolutionType
      | null,
    adminRemarks: string,
  ) => {
    if (!selectedRequest) {
      return;
    }

    const result =
      await reviewServiceRequest(
        selectedRequest.id,
        {
          status,

          resolutionType,

          adminRemarks:
            adminRemarks.trim() ||
            null,
        },
      );

    if (!result) {
      return;
    }

    // ----------------------------------------------------------
    // Close request review modal
    // ----------------------------------------------------------

    setIsReviewOpen(false);
    setSelectedRequest(null);

    /*
     * ----------------------------------------------------------
     * IMPORTANT
     * ----------------------------------------------------------
     *
     * We no longer automatically open a new consultation here.
     *
     * The request is only approved as Consultation.
     *
     * The admin can then click MANAGE from the Requests table.
     *
     * That Manage action will determine whether to:
     *
     * - create a new consultation
     * - edit an existing consultation
     *
     * This prevents duplicate consultation creation.
     */

    // ----------------------------------------------------------
    // Training pathway
    // ----------------------------------------------------------

    if (
      status === "Approved" &&
      resolutionType ===
        "Training"
    ) {
      setActiveTab(
        "training",
      );
    }

    // ----------------------------------------------------------
    // Refresh data
    // ----------------------------------------------------------

    await Promise.all([
      getServiceRequests(),
      getConsultations(),
    ]);
  };

  // ============================================================
  // EDIT / MANAGE CONSULTATION
  // ============================================================

  const handleEditConsultation = (
    consultation: ServiceConsultation,
  ) => {
    setSelectedConsultation(
      consultation,
    );

    setActiveTab(
      "consultations",
    );

    setIsConsultationOpen(
      true,
    );
  };

  // ============================================================
  // CLOSE CONSULTATION
  // ============================================================

  const handleCloseConsultation = () => {
    if (
      isSubmittingConsultation
    ) {
      return;
    }

    setIsConsultationOpen(
      false,
    );

    setSelectedConsultation(
      null,
    );
  };

  // ============================================================
  // CREATE / UPDATE CONSULTATION
  // ============================================================

  const handleConsultationSubmit =
    async (
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

      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      if (
        !selectedConsultation.id
      ) {
        result =
          await createConsultation({
            serviceRequestId:
              selectedConsultation.serviceRequestId,

            scheduledAt,

            meetingLink,

            notes:
              notes.trim() ||
              null,
          });
      }

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      else {
        result =
          await updateConsultation(
            selectedConsultation.id,
            {
              scheduledAt,

              meetingLink,

              notes:
                notes.trim() ||
                null,

              status,
            },
          );
      }

      if (!result) {
        return;
      }

      // --------------------------------------------------------
      // Close modal
      // --------------------------------------------------------

      setIsConsultationOpen(
        false,
      );

      setSelectedConsultation(
        null,
      );

      // --------------------------------------------------------
      // Refresh data
      // --------------------------------------------------------

      await Promise.all([
        getServiceRequests(),
        getConsultations(),
      ]);
    };

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalServices =
    services.length;

  const activeServices =
    services.filter(
      (service) =>
        service.isActive,
    ).length;

  const totalRequests =
    serviceRequests.length;

  const pendingRequests =
    serviceRequests.filter(
      (request) =>
        request.status ===
        "Pending",
    ).length;

  const totalConsultations =
    consultations.length;

  // ------------------------------------------------------------
  // TRAINING REQUESTS
  // ------------------------------------------------------------

  const trainingRequests =
    serviceRequests.filter(
      (request) =>
        request.resolutionType ===
        "Training",
    );

  const totalTrainingRequests =
    trainingRequests.length;

  const pendingTrainingRequests =
    trainingRequests.filter(
      (request) =>
        request.status ===
        "Pending",
    ).length;

  // ============================================================
  // TAB CONFIG
  // ============================================================

  const tabs: Array<{
    id: ServiceTab;
    label: string;
    count: number;
  }> = [
    {
      id: "services",
      label: "Services",
      count: totalServices,
    },

    {
      id: "requests",
      label: "Requests",
      count: totalRequests,
    },

    {
      id: "consultations",
      label: "Consultations",
      count: totalConsultations,
    },

    {
      id: "training",
      label: "Training",
      count: totalTrainingRequests,
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <ServiceHeader
        onCreate={
          handleCreate
        }
      />

      {/* ======================================================
          ERROR
      ======================================================= */}

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

      {/* ======================================================
          QUICK OVERVIEW
      ======================================================= */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {/* SERVICES */}

        <OverviewCard
          label="Services"
          value={
            totalServices
          }
          description={`${activeServices} active`}
          active={
            activeTab ===
            "services"
          }
          onClick={() =>
            setActiveTab(
              "services",
            )
          }
        />

        {/* REQUESTS */}

        <OverviewCard
          label="Requests"
          value={
            totalRequests
          }
          description={`${pendingRequests} pending review`}
          active={
            activeTab ===
            "requests"
          }
          onClick={() =>
            setActiveTab(
              "requests",
            )
          }
        />

        {/* CONSULTATIONS */}

        <OverviewCard
          label="Consultations"
          value={
            totalConsultations
          }
          description="All consultation sessions"
          active={
            activeTab ===
            "consultations"
          }
          onClick={() =>
            setActiveTab(
              "consultations",
            )
          }
        />

        {/* TRAINING */}

        <OverviewCard
          label="Training"
          value={
            totalTrainingRequests
          }
          description={`${pendingTrainingRequests} pending`}
          active={
            activeTab ===
            "training"
          }
          onClick={() =>
            setActiveTab(
              "training",
            )
          }
        />

      </div>

      {/* ======================================================
          MAIN MANAGEMENT PANEL
      ======================================================= */}

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">

        {/* ====================================================
            TABS
        ===================================================== */}

        <div className="border-b border-[#e7e9ec] px-5 pt-4 sm:px-6">

          <div className="flex items-center gap-1 overflow-x-auto">

            {tabs.map(
              (tab) => {
                const isActive =
                  activeTab ===
                  tab.id;

                return (
                  <button
                    key={
                      tab.id
                    }
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab.id,
                      )
                    }
                    className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-semibold transition ${
                      isActive
                        ? "text-[#17191c]"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >

                    {tab.label}

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-[#17191c] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {
                        tab.count
                      }
                    </span>

                    {isActive && (
                      <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#17191c]" />
                    )}

                  </button>
                );
              },
            )}

          </div>

        </div>

        {/* ====================================================
            TAB CONTENT
        ===================================================== */}

        <div className="p-5 sm:p-6">

          {/* ==================================================
              SERVICES
          =================================================== */}

          {activeTab ===
            "services" && (
            <ServiceTable
              services={
                services
              }
              isLoading={
                isLoading
              }
              search={
                search
              }
              onSearchChange={
                handleSearchChange
              }
              onClearSearch={
                handleClearSearch
              }
              onEdit={
                handleEdit
              }
              onDelete={
                handleDelete
              }
            />
          )}

          {/* ==================================================
              REQUESTS
          =================================================== */}

          {activeTab ===
            "requests" && (
            <ServiceRequestTable
              requests={
                serviceRequests
              }
              isLoading={
                isLoading
              }
              onReview={
                handleReviewRequest
              }
            />
          )}

          {/* ==================================================
              CONSULTATIONS
          =================================================== */}

          {activeTab ===
            "consultations" && (
            <ServiceConsultationTable
              consultations={
                consultations
              }
              isLoading={
                isLoadingConsultations
              }
              onEdit={
                handleEditConsultation
              }
            />
          )}

          {/* ==================================================
              TRAINING
          =================================================== */}

          {activeTab ===
            "training" && (
            <ServiceTrainingTable
              requests={
                serviceRequests
              }
              isLoading={
                isLoading
              }
              onView={
                handleReviewRequest
              }
            />
          )}

        </div>

      </section>

      {/* ======================================================
          CREATE / EDIT SERVICE MODAL
      ======================================================= */}

      <ServiceFormModal
        open={
          isFormOpen
        }
        service={
          selectedService
        }
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
          DELETE SERVICE
      ======================================================= */}

      <DeleteServiceDialog
        service={
          isDeleteOpen
            ? serviceToDelete
            : null
        }
        isDeleting={
          isDeleting
        }
        onCancel={
          handleCloseDelete
        }
        onConfirm={
          handleConfirmDelete
        }
      />

      {/* ======================================================
          REQUEST REVIEW
      ======================================================= */}

      <ServiceRequestReviewModal
        open={
          isReviewOpen
        }
        request={
          selectedRequest
        }
        isSubmitting={
          isUpdatingRequest
        }
        onClose={
          handleCloseReview
        }
        onSubmit={
          handleRequestReview
        }
      />

      {/* ======================================================
          CONSULTATION
      ======================================================= */}

      <ServiceConsultationModal
        open={
          isConsultationOpen
        }
        consultation={
          selectedConsultation
        }
        isSubmitting={
          isSubmittingConsultation
        }
        onClose={
          handleCloseConsultation
        }
        onSubmit={
          handleConsultationSubmit
        }
      />

    </div>
  );
}

// ============================================================
// OVERVIEW CARD
// ============================================================

function OverviewCard({
  label,
  value,
  description,
  active,
  onClick,
}: {
  label: string;
  value: number;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`group rounded-2xl border bg-white p-4 text-left transition ${
        active
          ? "border-[#17191c] shadow-sm"
          : "border-[#e7e9ec] hover:border-gray-300 hover:shadow-sm"
      }`}
    >

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[#17191c]">
            {value}
          </p>

        </div>

        <div
          className={`mt-1 h-2 w-2 rounded-full ${
            active
              ? "bg-[#17191c]"
              : "bg-gray-200 group-hover:bg-gray-400"
          }`}
        />

      </div>

      <p className="mt-2 text-[11px] text-gray-400">
        {description}
      </p>

    </button>
  );
}