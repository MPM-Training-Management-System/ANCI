"use client";

import { useEffect } from "react";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceTrainingTable } from "@/components/Services/ServiceTrainingTable";

export default function ServiceTrainingPage() {
  const {
    serviceRequests,
    isLoading,
    error,
    getServiceRequests,
  } = useService(serviceApi);

  useEffect(() => {
    void getServiceRequests();

    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trainingRequests =
    serviceRequests.filter(
      (request) =>
        request.resolutionType ===
        "Training",
    );

  const pendingTrainingRequests =
    trainingRequests.filter(
      (request) =>
        request.status === "Pending",
    ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#17191c]">
          Training Requests
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage service requests resolved for training.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">
            Training Requests
          </p>

          <p className="mt-1 text-2xl font-bold text-[#17191c]">
            {trainingRequests.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-[#17191c]">
            {pendingTrainingRequests}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <ServiceTrainingTable
            requests={trainingRequests}
            isLoading={isLoading}
            onView={() => {
              // Add navigation/modal behavior here
              // when the training request details flow is defined.
            }}
          />
        </div>
      </section>
    </div>
  );
}