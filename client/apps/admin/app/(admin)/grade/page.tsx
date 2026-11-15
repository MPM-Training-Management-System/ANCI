
"use client";

import {
  RotateCcw,
} from "lucide-react";

import {
  Button,
  DataTable,
  PageSection,
  StatCard,
  StatGrid,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/index";

import { columns } from "./columns";
import { useGradeCalculation } from "@/hooks/GradeCalculationHooks";

export default function GradeCalculationPage() {
  const {
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
  } = useGradeCalculation();

  return (
    <div className="space-y-6">
      <PageSection
        title="Grade Calculation"
        description="View training grades across all batches and participants."
        actions={
          <Button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isLoading}
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

      {/* STATISTICS */}

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

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* GRADE TABLE */}

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
              <SelectItem value="all">
                All Batches
              </SelectItem>

              {batches.map((batch) => (
                <SelectItem
                  key={batch.label}
                  value={batch.value}
                >
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
