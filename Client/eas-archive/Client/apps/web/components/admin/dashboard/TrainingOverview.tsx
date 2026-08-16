"use client";

import { SectionCard, Badge } from "@repo/ui/index";

export default function TrainingOverview() {
  return (
    <SectionCard
      title="Training Overview"
      description="Monthly training analytics"
      actionLabel="This Month"
    >
      <div className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Completed 87
          </Badge>

          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            In Progress 64
          </Badge>

          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Not Started 32
          </Badge>
        </div>

        {/* Chart Placeholder */}
        <div className="flex h-[320px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          <div className="text-center">
            <h3 className="font-semibold text-slate-700">
              Training Analytics Chart
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Recharts / Chart.js will be integrated here.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}