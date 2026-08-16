"use client";

import { MoreHorizontal } from "lucide-react";

export interface RowAction {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface RowActionsProps {
  actions: RowAction[];
}

export function RowActions({
  actions,
}: RowActionsProps) {
  return (
    <div className="relative group flex justify-end">
      <details className="relative">
        <summary
          className="
            flex
            h-9
            w-9
            cursor-pointer
            list-none
            items-center
            justify-center
            rounded-lg
            border
            transition
            hover:bg-muted
          "
        >
          <MoreHorizontal className="h-4 w-4" />
        </summary>

        <div
          className="
            absolute
            right-0
            z-50
            mt-2
            w-52
            overflow-hidden
            rounded-xl
            border
            bg-white
            shadow-lg
          "
        >
          {actions.map((action, index) => (
            <button
              key={index}
              disabled={action.disabled}
              onClick={action.onClick}
              className={`
                flex
                w-full
                items-center
                gap-3
                px-4
                py-2.5
                text-sm
                transition
                hover:bg-gray-100
                disabled:opacity-50
                ${
                  action.danger
                    ? "text-red-600"
                    : "text-gray-700"
                }
              `}
            >
              {action.icon}

              {action.label}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}