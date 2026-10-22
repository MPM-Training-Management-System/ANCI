"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";

import { useTrainingGrade } from "@repo/hooks";

import {
  DataTable,
  PageSection,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  Button,
  StatGrid,
} from "@repo/ui/index";

import { columns } from "./columns";
import { RotateCcw } from "lucide-react";

export default function GradeCalculationPage() {
  const {
    grades,
    isLoading,
    error,
    loadAllGrades,
    reset
  } = useTrainingGrade(api);

  const handleRefresh = useCallback(async () => {
    reset();
  
    await Promise.all([
      loadAllGrades(),
   
    ]);
  }, [
    reset,
    loadAllGrades,

  ]);

  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");

  useEffect(() => {
    loadAllGrades();
  }, [loadAllGrades]);

  
const batches = useMemo(() => {
  const uniqueBatches = new Map<string, string>();

  grades.forEach((grade) => {
    const programName = grade.name?.trim() || "Unknown Training Program";
    const batchCode = grade.programCode?.trim();

    if (!batchCode) return;

    // Display: Training Program Name - Training Batch
    const label = `${programName} - ${batchCode}`;

    uniqueBatches.set(label, batchCode);
  });

  return Array.from(uniqueBatches.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}, [grades]);

  const filteredGrades = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return grades.filter((grade) => {
      const matchesSearch =
        !keyword ||
        grade.participantName
          .toLowerCase()
          .includes(keyword) ||
        grade.programCode
          .toLowerCase()
          .includes(keyword);

      const matchesBatch =
        batchFilter === "all" ||
        grade.programCode === batchFilter;

      return matchesSearch && matchesBatch;
    });
  }, [grades, search, batchFilter]);

  const passedCount = filteredGrades.filter(
    (grade) => grade.isPassed
  ).length;

  const failedCount =
    filteredGrades.length - passedCount;

  const averageGrade =
    filteredGrades.length > 0
      ? filteredGrades.reduce(
          (sum, grade) =>
            sum + grade.overallGrade,
          0
        ) / filteredGrades.length
      : 0;

  return (
    <div className="space-y-6">
      <PageSection
        title="Grade Calculation"
        description="View training grades across all batches and participants."
        actions={
          <Button
          onClick={handleRefresh}
          >

            <RotateCcw
                      className={`h-4 w-4 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          title="Total Participants"
          value={filteredGrades.length}
          variant="primary"
        />

        <StatCard
          title="Passed"
          value={passedCount}
          variant="success"
        />

        <StatCard
          title="Failed"
          value={failedCount}
          variant="danger"
        />

        <StatCard
          title="Average Grade"
          value={averageGrade.toFixed(2)}
          variant="primary"
        />
      </StatGrid>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredGrades}
        searchable
        searchPlaceholder="Search participant or batch..."
        toolbar={
         <Select
  value={batchFilter}
  onValueChange={setBatchFilter}
>
  <SelectTrigger>
    <SelectValue placeholder="All Batches" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">All Batches</SelectItem>

    {batches.map((batch) => (
      <SelectItem key={batch.label} value={batch.value}>
        {batch.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
        }
        loading={isLoading}
       
      />
    </div>
  );
}