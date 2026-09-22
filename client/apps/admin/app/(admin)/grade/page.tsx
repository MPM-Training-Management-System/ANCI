"use client";

import {
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
  StatGrid,
} from "@repo/ui/index";

import { columns } from "./columns";

export default function GradeCalculationPage() {
  const {
    grades,
    isLoading,
    error,
    loadAllGrades,
  } = useTrainingGrade(api);

  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");

  useEffect(() => {
    loadAllGrades();
  }, [loadAllGrades]);

  const batches = useMemo(() => {
    return Array.from(
      new Set(
        grades.map((grade) => grade.batchCode)
      )
    );
  }, [grades]);

  const filteredGrades = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return grades.filter((grade) => {
      const matchesSearch =
        !keyword ||
        grade.participantName
          .toLowerCase()
          .includes(keyword) ||
        grade.batchCode
          .toLowerCase()
          .includes(keyword);

      const matchesBatch =
        batchFilter === "all" ||
        grade.batchCode === batchFilter;

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
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All Batches
              </SelectItem>

              {batches.map((batch) => (
                <SelectItem
                  key={batch}
                  value={batch}
                >
                  {batch}
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