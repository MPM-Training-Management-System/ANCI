"use client";

interface DataTableLoadingProps {
  columns: number;
  rows?: number;
}

export function DataTableLoading({
  columns,
  rows = 5,
}: DataTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td
              key={columnIndex}
              className="border-b px-5 py-4"
            >
              <div className="h-4 w-full rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}