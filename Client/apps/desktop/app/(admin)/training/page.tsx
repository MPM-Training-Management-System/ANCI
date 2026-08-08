"use client";

import TrainingPage from "@/components/admin/training-programs/TrainingPage";
import { DataTable } from "@repo/ui/index";
import { useTraining } from "@/hooks/useTraining";
import { columns } from "./columns";

export default function Training() {
  const { trainings, loading, error } = useTraining();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <>
      <TrainingPage />
    </>
  );
}