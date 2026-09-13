
"use client";

interface ServiceHeaderProps {
  onCreate: () => void;
}

export function ServiceHeader({
  onCreate,
}: ServiceHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Services
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage the services offered by ACE NextGen Consultancy Inc.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        + Add Service
      </button>
    </div>
  );
}

