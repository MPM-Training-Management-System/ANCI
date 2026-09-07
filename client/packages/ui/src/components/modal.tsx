"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@repo/lib";
import { Button } from "./button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      {/* ======================================================
          OVERLAY
      ====================================================== */}

      <div
        className="absolute inset-0"
        onMouseDown={(event) => {
          if (
            closeOnOverlayClick &&
            event.target === event.currentTarget
          ) {
            onClose();
          }
        }}
      />

      {/* ======================================================
          MODAL
      ====================================================== */}

      <div
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
          sizes[size]
        )}
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        {(title || description) && (
          <div className="flex shrink-0 items-start justify-between border-b border-[#eef0f2] px-6 py-5">

            <div className="min-w-0 pr-4">

              {title && (
                <h2 className="text-xl font-bold tracking-tight text-[#17191c]">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {description}
                </p>
              )}

            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

          </div>
        )}

        {/* ====================================================
            BODY
        ==================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        {footer && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-[#eef0f2] bg-white px-6 py-5">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}