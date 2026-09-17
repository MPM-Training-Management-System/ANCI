"use client";

interface ServiceHeaderProps {
  onCreate: () => void;
}

export function ServiceHeader({
  onCreate,
}: ServiceHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      
      <div className="min-w-0">

        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-gray-400">
          <span>
            Administration
          </span>

          <span>
            /
          </span>

          <span className="text-gray-600">
            Services
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#17191c] sm:text-3xl">
          Service Management
        </h1>

        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
          Manage services, review client requests,
          and handle consultation schedules from one
          place.
        </p>

      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0b3768] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#082d56] focus:outline-none focus:ring-2 focus:ring-[#0b3768]/20"
      >
        <span className="text-base leading-none">
          +
        </span>

        Add Service
      </button>

    </header>
  );
}