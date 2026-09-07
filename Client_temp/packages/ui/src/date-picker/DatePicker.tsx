"use client";

import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "../components/button";
import { Calendar } from "./Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./Popover";

import type { DatePickerProps } from "./type";

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-start font-normal"
        >
          <CalendarDays className="mr-2 h-4 w-4" />

          {value ? format(value, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}