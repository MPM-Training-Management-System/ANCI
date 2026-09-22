"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  CreateService,
  Service,
  UpdateService,
} from "@repo/types";

import {
  ClipboardList,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";
import { StatCard } from "@repo/ui/index";

import { ServiceHeader } from "@/components/Services/ServiceHeader";
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

  // ============================================================
  // MODAL STATES
  // ============================================================

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [serviceToDelete, setServiceToDelete] =
    useState<Service | null>(null);

  // ============================================================
  // FILTER STATES
  // ============================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  // ============================================================
  // LOAD SERVICES
  // ============================================================

  useEffect(() => {
    void getServices();

    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const handleCloseForm = () => {
    if (isCreating || isUpdating) {
      return;
    }

    setIsFormOpen(false);
    setSelectedService(null);
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    data: CreateService | UpdateService
  ) => {
    // UPDATE
    if (selectedService) {
      const result = await updateService(
        selectedService.id,
        data as UpdateService
      );

      if (result) {
        setIsFormOpen(false);
        setSelectedService(null);

        await getServices();
      }

      return;
    }

    // CREATE
    const result = await createService(
      data as CreateService
    );

    if (result) {
      setIsFormOpen(false);
      setSelectedService(null);

      await getServices();
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = (
    service: Service
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

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) {
      return;
    }

    const success =
      await deleteService(
        serviceToDelete.id
      );

    if (success) {
      setIsDeleteOpen(false);
      setServiceToDelete(null);

      await getServices();
    }
  };

  // ============================================================
  // FILTER OPTIONS
  // ============================================================

  const categories = Array.from(
    new Set(
      services
        .map(
          (service) =>
            service.category
        )
        .filter(Boolean)
    )
  );

  // ============================================================
  // FILTERED SERVICES
  // ============================================================

  const filteredServices =
    services.filter((service) => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      const matchesSearch =
        !query ||
        service.name
          .toLowerCase()
          .includes(query) ||
        service.serviceCode
          .toLowerCase()
          .includes(query) ||
        service.category
          .toLowerCase()
          .includes(query) ||
        (service.description ?? "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        service.category ===
          categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (
          statusFilter === "active" &&
          service.isActive
        ) ||
        (
          statusFilter === "inactive" &&
          !service.isActive
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });

  // ============================================================
  // FILTER STATE
  // ============================================================

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // ============================================================
  // STATS
  // ============================================================

  const totalServices =
    services.length;

  const activeServices =
    services.filter(
      (service) =>
        service.isActive
    ).length;

  const inactiveServices =
    totalServices -
    activeServices;

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ServiceHeader
          onCreate={handleCreate}
        />

        {/* STATISTICS */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
          "
        >
          <StatCard
            title="Total Services"
            value="—"
            description="Loading services..."
            variant="primary"
          />

          <StatCard
            title="Active Services"
            value="—"
            description="Loading services..."
            variant="success"
          />
        </div>

        {/* CARD SKELETONS */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <ServiceCardSkeleton
              key={index}
            />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <ServiceHeader
        onCreate={handleCreate}
      />

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
          "
        >
          <div
            className="
              mt-0.5
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-red-100
              text-[10px]
              font-bold
              text-red-600
            "
          >
            !
          </div>

          <p
            className="
              text-sm
              font-medium
              text-red-700
            "
          >
            {error}
          </p>
        </div>
      )}

      {/* ========================================================
          STATISTICS
      ======================================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
        "
      >
        <StatCard
          title="Total Services"
          value={totalServices}
          description={`${activeServices} active`}
          variant="primary"
        />

        <StatCard
          title="Active Services"
          value={activeServices}
          description={
            inactiveServices > 0
              ? `${inactiveServices} inactive`
              : "Currently available services"
          }
          variant="success"
        />
      </div>




      {services.length === 0 ? (
        <EmptyServices
          onCreate={handleCreate}
        />
      ) : (
        <>
        {/* ======================================================
    SEARCH + FILTERS
====================================================== */}

<section
  className="
    rounded-2xl
    border
    border-gray-200
    bg-white
    p-4
    shadow-sm
  "
>
  <div
    className="
      flex
      flex-col
      gap-3
      lg:flex-row
      lg:items-center
    "
  >
    {/* ==================================================
        SEARCH
    ================================================== */}

    <div
      className="
        relative
        w-full
        lg:flex-1
      "
    >
      <Search
        className="
          pointer-events-none
          absolute
          left-3.5
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-gray-400
        "
      />

      <input
        type="text"
        value={searchQuery}
        onChange={(event) =>
          setSearchQuery(
            event.target.value
          )
        }
        placeholder="Search services..."
        className="
          h-11
          w-full
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          pl-10
          pr-10
          text-sm
          text-gray-900
          outline-none
          transition
          placeholder:text-gray-400
          focus:border-gray-400
          focus:bg-white
          focus:ring-2
          focus:ring-gray-100
        "
      />

      {searchQuery && (
        <button
          type="button"
          onClick={() =>
            setSearchQuery("")
          }
          className="
            absolute
            right-3
            top-1/2
            flex
            h-6
            w-6
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-gray-400
            transition
            hover:bg-gray-200
            hover:text-gray-700
          "
          aria-label="Clear search"
        >
          <X
            className="
              h-3.5
              w-3.5
            "
          />
        </button>
      )}
    </div>

    {/* ==================================================
        FILTER CONTROLS
    ================================================== */}

    <div
      className="
        flex
        w-full
        items-center
        gap-2
        lg:w-auto
        lg:shrink-0
      "
    >
      {/* FILTER LABEL */}

      <div
        className="
          hidden
          items-center
          gap-2
          whitespace-nowrap
          text-xs
          font-semibold
          text-gray-500
          xl:flex
        "
      >
        <SlidersHorizontal
          className="
            h-4
            w-4
          "
        />

        Filters
      </div>

      {/* CATEGORY */}

      <select
        value={categoryFilter}
        onChange={(event) =>
          setCategoryFilter(
            event.target.value
          )
        }
        className="
          h-11
          min-w-0
          flex-1
          rounded-xl
          border
          border-gray-200
          bg-white
          px-3
          text-xs
          font-medium
          text-gray-700
          outline-none
          transition
          focus:border-gray-400
          focus:ring-2
          focus:ring-gray-100
          sm:w-[170px]
          sm:flex-none
        "
      >
        <option value="all">
          All Categories
        </option>

        {categories.map(
          (category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          )
        )}
      </select>

      {/* STATUS */}

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(
            event.target.value
          )
        }
        className="
          h-11
          min-w-0
          flex-1
          rounded-xl
          border
          border-gray-200
          bg-white
          px-3
          text-xs
          font-medium
          text-gray-700
          outline-none
          transition
          focus:border-gray-400
          focus:ring-2
          focus:ring-gray-100
          sm:w-[130px]
          sm:flex-none
        "
      >
        <option value="all">
          All Status
        </option>

        <option value="active">
          Active
        </option>

        <option value="inactive">
          Inactive
        </option>
      </select>

      {/* CLEAR */}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="
            inline-flex
            h-11
            shrink-0
            items-center
            justify-center
            gap-1.5
            rounded-xl
            px-3
            text-xs
            font-semibold
            text-gray-500
            transition
            hover:bg-gray-100
            hover:text-gray-900
          "
        >
          <X
            className="
              h-3.5
              w-3.5
            "
          />

          <span className="hidden sm:inline">
            Clear
          </span>
        </button>
      )}
    </div>
  </div>

  {/* ======================================================
      FILTER RESULT
  ====================================================== */}

  <div
    className="
      mt-4
      flex
      items-center
      justify-between
      border-t
      border-gray-100
      pt-3
    "
  >
    <p
      className="
        text-xs
        text-gray-500
      "
    >
      Showing{" "}
      <span
        className="
          font-semibold
          text-gray-900
        "
      >
        {filteredServices.length}
      </span>{" "}
      of{" "}
      <span
        className="
          font-semibold
          text-gray-900
        "
      >
        {services.length}
      </span>{" "}
      services
    </p>

    {hasActiveFilters && (
      <p
        className="
          text-xs
          text-gray-400
        "
      >
        Filters applied
      </p>
    )}
  </div>
</section>

          {/* ====================================================
              FILTERED EMPTY STATE
          ==================================================== */}

          {filteredServices.length === 0 ? (
            <FilteredEmptyServices
              onClear={clearFilters}
            />
          ) : (
            /* ==================================================
                SERVICE CARDS
            ================================================== */

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {filteredServices.map(
                (service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          CREATE / EDIT MODAL
      ======================================================== */}

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

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

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
    </div>
  );
}

// ============================================================
// SERVICE CARD
// ============================================================

interface ServiceCardProps {
  service: Service;
  onEdit: (
    service: Service
  ) => void;
  onDelete: (
    service: Service
  ) => void;
}

function ServiceCard({
  service,
  onEdit,
  onDelete,
}: ServiceCardProps) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <div
        className="
          relative
          h-52
          overflow-hidden
          bg-gray-100
        "
      >
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.name}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-gray-100
              to-gray-200
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-white
                shadow-sm
              "
            >
              <ImageIcon
                className="
                  h-7
                  w-7
                  text-gray-400
                "
              />
            </div>
          </div>
        )}

        {/* IMAGE OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/45
            via-transparent
            to-transparent
            opacity-70
          "
        />

        {/* STATUS */}

        <div
          className="
            absolute
            left-4
            top-4
            flex
            items-center
            gap-2
          "
        >
          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-1.5
              text-[10px]
              font-bold
              shadow-sm
              backdrop-blur-md
              ${
                service.isActive
                  ? "bg-white/90 text-emerald-700"
                  : "bg-white/90 text-gray-500"
              }
            `}
          >
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  service.isActive
                    ? "bg-emerald-500"
                    : "bg-gray-400"
                }
              `}
            />

            {service.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </div>

        {/* CATEGORY */}

        <div
          className="
            absolute
            bottom-4
            left-4
            right-4
          "
        >
          <span
            className="
              inline-flex
              rounded-full
              bg-white/90
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-gray-700
              shadow-sm
              backdrop-blur-md
            "
          >
            {service.category}
          </span>
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="p-5">

        {/* SERVICE CODE */}

        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-gray-400
          "
        >
          {service.serviceCode}
        </p>

        {/* NAME */}

        <h3
          className="
            mt-1
            line-clamp-2
            text-lg
            font-bold
            leading-tight
            text-gray-900
          "
        >
          {service.name}
        </h3>

        {/* DESCRIPTION */}

        <p
          className="
            mt-2
            line-clamp-3
            min-h-[60px]
            text-sm
            leading-5
            text-gray-500
          "
        >
          {service.description ||
            "No description provided for this service."}
        </p>

        {/* ====================================================
            META
        ==================================================== */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            border-t
            border-gray-100
            pt-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              text-gray-500
            "
          >
            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-gray-100
              "
            >
              <ClipboardList
                className="
                  h-3.5
                  w-3.5
                  text-gray-500
                "
              />
            </div>

            <span>
              {service.requirements?.length ??
                0}{" "}
              {service.requirements?.length ===
              1
                ? "requirement"
                : "requirements"}
            </span>
          </div>

          {service.requiresTraining && (
            <span
              className="
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-blue-700
              "
            >
              Training Required
            </span>
          )}
        </div>

        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-2
          "
        >
          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              onEdit(service)
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-200
              bg-white
              px-3
              py-2.5
              text-xs
              font-semibold
              text-gray-600
              transition
              hover:bg-gray-50
              hover:text-gray-900
            "
          >
            <Pencil
              className="
                h-3.5
                w-3.5
              "
            />

            Edit
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() =>
              onDelete(service)
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-3
              py-2.5
              text-xs
              font-semibold
              text-red-600
              transition
              hover:bg-red-100
            "
          >
            <Trash2
              className="
                h-3.5
                w-3.5
              "
            />

            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// EMPTY SERVICES
// ============================================================

function EmptyServices({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-gray-300
        bg-gradient-to-br
        from-gray-50
        to-white
        px-6
        py-16
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-gray-100
        "
      >
        <ImageIcon
          className="
            h-7
            w-7
            text-gray-400
          "
        />
      </div>

      <h3
        className="
          mt-5
          text-lg
          font-bold
          text-gray-900
        "
      >
        No services yet
      </h3>

      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-sm
          leading-6
          text-gray-500
        "
      >
        Start building your service catalog
        by adding the first service offered
        by ACE NextGen Consultancy Inc.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="
          mt-6
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-[#17191c]
          px-5
          py-3
          text-xs
          font-semibold
          text-white
          transition
          hover:bg-black
        "
      >
        <Plus
          className="
            h-4
            w-4
          "
        />

        Create First Service
      </button>
    </div>
  );
}

// ============================================================
// FILTERED EMPTY SERVICES
// ============================================================

function FilteredEmptyServices({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-gray-300
        bg-gradient-to-br
        from-gray-50
        to-white
        px-6
        py-14
        text-center
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-gray-100
        "
      >
        <Search
          className="
            h-6
            w-6
            text-gray-400
          "
        />
      </div>

      <h3
        className="
          mt-4
          text-base
          font-bold
          text-gray-900
        "
      >
        No services found
      </h3>

      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-sm
          leading-6
          text-gray-500
        "
      >
        We couldn't find any services
        matching your current search
        or filters.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          py-2.5
          text-xs
          font-semibold
          text-gray-700
          shadow-sm
          transition
          hover:bg-gray-50
          hover:text-gray-900
        "
      >
        <X
          className="
            h-3.5
            w-3.5
          "
        />

        Clear Filters
      </button>
    </div>
  );
}

// ============================================================
// SERVICE CARD SKELETON
// ============================================================

function ServiceCardSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
      "
    >
      {/* IMAGE */}

      <div
        className="
          h-52
          animate-pulse
          bg-gray-200
        "
      />

      <div className="p-5">

        {/* CODE */}

        <div
          className="
            h-3
            w-20
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        {/* TITLE */}

        <div
          className="
            mt-3
            h-5
            w-3/4
            animate-pulse
            rounded
            bg-gray-200
          "
        />

        {/* DESCRIPTION */}

        <div
          className="
            mt-3
            space-y-2
          "
        >
          <div
            className="
              h-3
              w-full
              animate-pulse
              rounded
              bg-gray-100
            "
          />

          <div
            className="
              h-3
              w-5/6
              animate-pulse
              rounded
              bg-gray-100
            "
          />

          <div
            className="
              h-3
              w-2/3
              animate-pulse
              rounded
              bg-gray-100
            "
          />
        </div>

        {/* META */}

        <div
          className="
            mt-5
            h-8
            w-32
            animate-pulse
            rounded
            bg-gray-100
          "
        />

        {/* BUTTONS */}

        <div
          className="
            mt-4
            flex
            gap-2
          "
        >
          <div
            className="
              h-10
              flex-1
              animate-pulse
              rounded-xl
              bg-gray-100
            "
          />

          <div
            className="
              h-10
              flex-1
              animate-pulse
              rounded-xl
              bg-gray-100
            "
          />
        </div>
      </div>
    </div>
  );
}