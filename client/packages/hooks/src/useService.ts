import {
  useCallback,
  useState,
} from "react";

import { ServiceApi } from "@repo/api";

import type {
  CreateService,
  CreateServiceRequest,
  Service,
  ServiceRequest,
  UpdateService,
  UpdateServiceRequestStatus,
} from "@repo/types";

export function useService(
  serviceApi: ServiceApi
) {
  // =========================
  // SERVICES STATE
  // =========================

  const [services, setServices] =
    useState<Service[]>([]);

  const [service, setService] =
    useState<Service | null>(null);

  // =========================
  // SERVICE REQUEST STATE
  // =========================

  const [serviceRequests, setServiceRequests] =
    useState<ServiceRequest[]>([]);

  const [serviceRequest, setServiceRequest] =
    useState<ServiceRequest | null>(null);

  // =========================
  // LOADING STATES
  // =========================

  const [isLoading, setIsLoading] =
    useState(false);

  const [isCreating, setIsCreating] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isRequesting, setIsRequesting] =
    useState(false);

  const [isUpdatingRequest, setIsUpdatingRequest] =
    useState(false);

  // =========================
  // ERROR
  // =========================

  const [error, setError] =
    useState<string | null>(null);

  // =========================
  // GET SERVICES
  // =========================

  const getServices = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await serviceApi.getAll();

        setServices(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load services.";

        setError(message);

        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [serviceApi]
  );

  // =========================
  // GET SERVICE
  // =========================

  const getService = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          await serviceApi.getById(id);

        setService(data);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load service.";

        setError(message);

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [serviceApi]
  );

  // =========================
  // CREATE SERVICE
  // =========================

  const createService = useCallback(
    async (
      data: CreateService
    ) => {
      setIsCreating(true);
      setError(null);

      try {
        const created =
          await serviceApi.create(data);

        setServices((current) => [
          ...current,
          created,
        ]);

        return created;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create service.";

        setError(message);

        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [serviceApi]
  );

  // =========================
  // UPDATE SERVICE
  // =========================

  const updateService = useCallback(
    async (
      id: string,
      data: UpdateService
    ) => {
      setIsUpdating(true);
      setError(null);

      try {
        const updated =
          await serviceApi.update(
            id,
            data
          );

        setServices((current) =>
          current.map((item) =>
            item.id === id
              ? updated
              : item
          )
        );

        setService(updated);

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update service.";

        setError(message);

        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [serviceApi]
  );

  // =========================
  // DELETE SERVICE
  // =========================

  const deleteService = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      setError(null);

      try {
        await serviceApi.delete(id);

        setServices((current) =>
          current.filter(
            (item) => item.id !== id
          )
        );

        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete service.";

        setError(message);

        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [serviceApi]
  );

  // =========================
  // CREATE SERVICE REQUEST
  // =========================

  const createServiceRequest =
    useCallback(
      async (
        data: CreateServiceRequest
      ) => {
        setIsRequesting(true);
        setError(null);

        try {
          const created =
            await serviceApi.createRequest(
              data
            );

          setServiceRequest(created);

          setServiceRequests((current) => [
            created,
            ...current,
          ]);

          return created;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to create service request.";

          setError(message);

          return null;
        } finally {
          setIsRequesting(false);
        }
      },
      [serviceApi]
    );

  // =========================
  // GET SERVICE REQUESTS
  // =========================

  const getServiceRequests =
    useCallback(
      async () => {
        setIsLoading(true);
        setError(null);

        try {
          const data =
            await serviceApi.getRequests();

          setServiceRequests(data);

          return data;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load service requests.";

          setError(message);

          return [];
        } finally {
          setIsLoading(false);
        }
      },
      [serviceApi]
    );

  // =========================
  // GET SERVICE REQUEST
  // =========================

  const getServiceRequest =
    useCallback(
      async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
          const data =
            await serviceApi.getRequestById(
              id
            );

          setServiceRequest(data);

          return data;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load service request.";

          setError(message);

          return null;
        } finally {
          setIsLoading(false);
        }
      },
      [serviceApi]
    );

  // =========================
  // UPDATE REQUEST STATUS
  // =========================

  const updateServiceRequestStatus =
    useCallback(
      async (
        id: string,
        data: UpdateServiceRequestStatus
      ) => {
        setIsUpdatingRequest(true);
        setError(null);

        try {
          const updated =
            await serviceApi.updateRequestStatus(
              id,
              data
            );

          setServiceRequests((current) =>
            current.map((item) =>
              item.id === id
                ? updated
                : item
            )
          );

          setServiceRequest(updated);

          return updated;
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to update service request.";

          setError(message);

          return null;
        } finally {
          setIsUpdatingRequest(false);
        }
      },
      [serviceApi]
    );

  // =========================
  // RESET
  // =========================

  const reset = useCallback(() => {
    setServices([]);
    setService(null);

    setServiceRequests([]);
    setServiceRequest(null);

    setError(null);
  }, []);

  // =========================
  // RETURN
  // =========================

  return {
    // Services
    services,
    service,

    // Service requests
    serviceRequests,
    serviceRequest,

    // Loading
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isRequesting,
    isUpdatingRequest,

    // Error
    error,

    // Service actions
    getServices,
    getService,
    createService,
    updateService,
    deleteService,

    // Service request actions
    createServiceRequest,
    getServiceRequests,
    getServiceRequest,
    updateServiceRequestStatus,

    // Reset
    reset,
  };
}