"use client";

import { useEffect } from "react";

import { serviceApi } from "@/lib/api";
import { useService } from "@repo/hooks";

import { ServiceTrainingTable } from "@/components/Services/ServiceTrainingTable";
import { PageSection, StatCard, StatGrid } from "@repo/ui/index";
import { Clock3, GraduationCap } from "lucide-react";

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
        <PageSection
        title=" Training Requests"
        description=" Manage service requests resolved for training."
        ></PageSection>

    <StatGrid>
        <StatCard
        icon={GraduationCap}
        title="Training Request"
        value={trainingRequests.length}
        variant="primary"
        ></StatCard>
        <StatCard
        title="Pending"
        value={pendingTrainingRequests}
        icon={Clock3}
        variant="warning"
        ></StatCard>
    </StatGrid>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

     

      <section className="overflow-hidden rounded-2xl border border-[#e7e9ec] bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <ServiceTrainingTable
            requests={trainingRequests}
            isLoading={isLoading}
            onView={() => {
        
            }}
          />
        </div>
      </section>
    </div>
  );
}