"use client";

import { Plus } from "lucide-react";
import type { DataTableActionButton } from "./type";

interface DataTableHeaderProps {
  title?: string;
  description?: string;
  addButton?: DataTableActionButton;
}

export function DataTableHeader({
  title,
  description,
  addButton,
}: DataTableHeaderProps) {
  // Huwag mag-render kung walang content
  if (!title && !description && !addButton) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 md:flex-row md:items-center md:justify-between">

      {/* Left */}
      <div>
        {title && (
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
        )}

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {/* Right */}
      {addButton && (
        <button
          onClick={addButton.onClick}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-emerald-600
            px-4
            py-2
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-emerald-700
            active:scale-95
          "
        >
          {addButton.icon ?? <Plus size={18} />}

          {addButton.label}
        </button>
      )}
    </div>
  );
}