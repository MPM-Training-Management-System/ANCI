"use client";

interface AssessmentTypeTabsProps {
  value: "written" | "practical";
  onChange: (
    value: "written" | "practical",
  ) => void;
  writtenCount: number;
  practicalCount: number;
}

export default function AssessmentTypeTabs({
  value,
  onChange,
  writtenCount,
  practicalCount,
}: AssessmentTypeTabsProps) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-[#e7e9ec]
        bg-white
        p-2
        shadow-[0_2px_12px_rgba(0,0,0,0.025)]
      "
    >
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            onChange("written")
          }
          className={`
            flex
            items-center
            justify-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            transition
            ${
              value === "written"
                ? "bg-[#111827] text-white"
                : "text-gray-500 hover:bg-gray-50"
            }
          `}
        >
          <span className="text-base">
            📝
          </span>

          Written

          <span
            className={`
              rounded-full
              px-2
              py-0.5
              text-[10px]
              ${
                value === "written"
                  ? "bg-white/10 text-white"
                  : "bg-gray-100 text-gray-500"
              }
            `}
          >
            {writtenCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChange("practical")
          }
          className={`
            flex
            items-center
            justify-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            transition
            ${
              value === "practical"
                ? "bg-[#111827] text-white"
                : "text-gray-500 hover:bg-gray-50"
            }
          `}
        >
          <span className="text-base">
            🎯
          </span>

          Practical

          <span
            className={`
              rounded-full
              px-2
              py-0.5
              text-[10px]
              ${
                value === "practical"
                  ? "bg-white/10 text-white"
                  : "bg-gray-100 text-gray-500"
              }
            `}
          >
            {practicalCount}
          </span>
        </button>
      </div>
    </section>
  );
}