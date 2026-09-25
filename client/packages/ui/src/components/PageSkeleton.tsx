import { cn } from "@repo/lib";

type PageSkeletonProps = {
  statCards?: number;

  showHeader?: boolean;

  showCharts?: boolean;
  chartCount?: number;

  showTable?: boolean;
  tableRows?: number;
  tableColumns?: number;

  className?: string;
};

export function PageSkeleton({
  statCards = 0,

  showHeader = true,

  showCharts = false,
  chartCount = 2,

  showTable = false,
  tableRows = 6,
  tableColumns = 5,

  className,
}: PageSkeletonProps) {
  return (
    <div
      className={cn(
        "min-h-full bg-slate-50 p-4 sm:p-6",
        className,
      )}
    >
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}
        {showHeader && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
              <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="h-10 w-28 shrink-0 animate-pulse rounded-xl bg-slate-200" />
          </div>
        )}

        {/* STAT CARDS */}
        {statCards > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: statCards }).map((_, index) => (
              <div
                key={`stat-${index}`}
                className="h-[150px] animate-pulse rounded-2xl border border-slate-200 bg-white"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="h-3 w-24 rounded bg-slate-200" />

                      <div className="mt-3 h-8 w-20 rounded bg-slate-200" />

                      <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
                    </div>

                    <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHARTS */}
        {showCharts && (
          <div
            className={cn(
              "mt-5 grid gap-5",
              chartCount > 1
                ? "lg:grid-cols-2"
                : "grid-cols-1",
            )}
          >
            {Array.from({
              length: chartCount,
            }).map((_, index) => (
              <div
                key={`chart-${index}`}
                className="h-[430px] animate-pulse rounded-2xl border border-slate-200 bg-white"
              >
                <div className="p-5">
                  <div className="h-4 w-40 rounded bg-slate-200" />

                  <div className="mt-2 h-3 w-64 rounded bg-slate-100" />

                  <div className="mt-8 h-[330px] rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TABLE */}
        {showTable && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">

            {/* TABLE HEADER */}
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

                  <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="flex gap-2">
                  <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-100" />

                  <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
            </div>

            {/* SEARCH / FILTERS */}
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100 sm:max-w-sm" />

                <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {Array.from({
                      length: tableColumns,
                    }).map((_, index) => (
                      <th
                        key={`th-${index}`}
                        className="px-5 py-4 text-left"
                      >
                        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {Array.from({
                    length: tableRows,
                  }).map((_, rowIndex) => (
                    <tr
                      key={`row-${rowIndex}`}
                      className="border-b border-slate-100 last:border-0"
                    >
                      {Array.from({
                        length: tableColumns,
                      }).map((_, columnIndex) => (
                        <td
                          key={`cell-${rowIndex}-${columnIndex}`}
                          className="px-5 py-4"
                        >
                          {columnIndex === 0 ? (
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-100" />

                              <div className="space-y-2">
                                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />

                                <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
                              </div>
                            </div>
                          ) : columnIndex === tableColumns - 1 ? (
                            <div className="flex justify-end">
                              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                            </div>
                          ) : (
                            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />

              <div className="flex gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}