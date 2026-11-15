
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import { useTrainingGrade } from "@repo/hooks";

export function useGradeCalculation() {
  const {
    grades,
    isLoading,
    error,
    loadAllGrades,
    reset,
  } = useTrainingGrade(api);

  // Batch filter state
  const [batchFilter, setBatchFilter] = useState("all");

  // Load grades when the page mounts.
  useEffect(() => {
    void loadAllGrades();
  }, [loadAllGrades]);

  // Refresh grades
  const handleRefresh = useCallback(async () => {
    reset();
    await loadAllGrades();
  }, [reset, loadAllGrades]);

  // Unique batch options
  const batches = useMemo(() => {
    const uniqueBatches = new Map<string, string>();

    grades.forEach((grade) => {
      const programName =
        grade.name?.trim() || "Unknown Training Program";

      const batchCode = grade.programCode?.trim();

      if (!batchCode) return;

      const label = `${programName} - ${batchCode}`;

      uniqueBatches.set(label, batchCode);
    });

    return Array.from(uniqueBatches.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [grades]);

  // Filter grades by selected batch
  const filteredGrades = useMemo(() => {
    return grades.filter((grade) => {
      return (
        batchFilter === "all" ||
        grade.programCode === batchFilter
      );
    });
  }, [grades, batchFilter]);

  // Grade statistics
  const passedCount = useMemo(
    () => filteredGrades.filter((grade) => grade.isPassed).length,
    [filteredGrades],
  );

  const failedCount = filteredGrades.length - passedCount;

  const averageGrade = useMemo(() => {
    if (filteredGrades.length === 0) return 0;

    const total = filteredGrades.reduce(
      (sum, grade) => sum + grade.overallGrade,
      0,
    );

    return total / filteredGrades.length;
  }, [filteredGrades]);

  return {
    grades,
    isLoading,
    error,

    batchFilter,
    setBatchFilter,
    batches,
    filteredGrades,

    passedCount,
    failedCount,
    averageGrade,

    handleRefresh,
  };
}
