"use client";

interface DataTableHeaderProps {
  title?: string;
  description?: string;
}

export function DataTableHeader({
  title,
  description,
}: DataTableHeaderProps) {
  if (!title && !description) {
    return null;
  }

  return (
    <div className="w-full min-w-0 border-b border-gray-200 bg-white px-5 py-5 sm:px-6 sm:py-6">
      <div className="min-w-0 max-w-4xl">
        {title && (
          <h2 className="break-words text-lg font-bold leading-7 tracking-tight text-gray-900 sm:text-xl">
            {title}
          </h2>
        )}

        {description && (
          <p className="mt-2 max-w-3xl break-words text-sm leading-6 text-gray-500 sm:text-[15px]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
