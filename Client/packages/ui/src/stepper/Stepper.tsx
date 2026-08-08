"use client";

import { Check } from "lucide-react";

import { cn } from "@repo/lib";

import type { StepperProps } from "./type";

export function Stepper({
  steps,
  currentStep,
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between w-full",
        className
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;

        const completed = stepNumber < currentStep;
        const active = stepNumber === currentStep;

        return (
          <div
            key={step}
            className="flex flex-1 items-center"
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",

                  completed &&
                    "border-primary bg-primary text-white",

                  active &&
                    "border-primary bg-white text-primary",

                  !completed &&
                    !active &&
                    "border-gray-300 bg-white text-gray-400"
                )}
              >
                {completed ? (
                  <Check className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>

              <span
                className={cn(
                  "mt-3 text-sm font-medium whitespace-nowrap",

                  active && "text-primary",

                  completed && "text-gray-900",

                  !completed &&
                    !active &&
                    "text-gray-400"
                )}
              >
                {step}
              </span>
            </div>

            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "mx-4 mt-5 h-[2px] flex-1",

                  completed
                    ? "bg-primary"
                    : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}