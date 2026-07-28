"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@repo/lib";


  export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",

        caption:
          "flex justify-center items-center relative",

        caption_label:
          "text-sm font-semibold",

        nav: "flex items-center gap-1",

        nav_button:
          "h-8 w-8 rounded-md border hover:bg-gray-100",

        table: "w-full border-collapse",

        head_row: "flex",

        head_cell:
          "text-gray-500 rounded-md w-9 font-medium text-xs",

        row: "flex w-full mt-2",

        cell:
          "h-9 w-9 text-center text-sm p-0 relative",

        day:
          "h-9 w-9 rounded-md hover:bg-gray-100 transition",

        day_selected:
          "bg-blue-600 text-white hover:bg-blue-600",

        day_today:
          "border border-blue-500",

        day_outside:
          "text-gray-300",

        day_disabled:
          "text-gray-300",

        ...classNames,
      }}
      {...props}
    />
  );
}