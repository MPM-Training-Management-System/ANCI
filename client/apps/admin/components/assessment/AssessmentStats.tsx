"use client";

interface AssessmentStatsProps {
  stats: {
    total: number;
    published: number;
    drafts: number;
  };
  assessmentType: "written" | "practical";
}

export default function AssessmentStats({
  stats,
  assessmentType,
}: AssessmentStatsProps) {
  return (
    <section>
      <div className="mb-4">
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-gray-400
          "
        >
          Overview
        </p>

        <h2
          className="
            mt-1
            text-lg
            font-bold
            text-[#111827]
          "
        >
          {assessmentType === "written"
            ? "Written"
            : "Practical"}{" "}
          Assessment Summary
        </h2>
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
      >
        <StatCard
          label="Total"
          value={stats.total}
          description="Assessments"
          icon="AS"
        />

        <StatCard
          label="Published"
          value={stats.published}
          description="Live"
          icon="✓"
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          label="Drafts"
          value={stats.drafts}
          description="Unpublished"
          icon="D"
          iconClass="bg-gray-100 text-gray-600"
        />
      </div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;
  iconClass?: string;
}

function StatCard({
  label,
  value,
  description,
  icon,
  iconClass = "bg-gray-100 text-gray-700",
}: StatCardProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#e7e9ec]
        bg-white
        p-5
        shadow-[0_2px_12px_rgba(0,0,0,0.025)]
      "
    >
      <div className="flex items-start justify-between">
        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-sm
            font-bold
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <span className="text-xs text-gray-400">
          {label}
        </span>
      </div>

      <p
        className="
          mt-5
          text-3xl
          font-bold
          tracking-tight
          text-[#111827]
        "
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}