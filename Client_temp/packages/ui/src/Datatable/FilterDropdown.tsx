"use client";

import { Filter } from "lucide-react";

import { Button } from "../components/button";
import { DatePicker } from "../date-picker/DatePicker";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";

import type { FilterDropdownProps } from "./filter.type";

export function FilterDropdown({
  title = "Filters",
  fields,
  onChange,
  onApply,
  onReset,
}: FilterDropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80"
      >
        <DropdownMenuLabel>{title}</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="space-y-4 p-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>

              {field.type === "select" ? (
                <Select
                  value={(field.value as string) ?? ""}
                  onValueChange={(value) =>
                    onChange(field.key, value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={`Select ${field.label}`}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <DatePicker
                  value={field.value as Date | undefined}
                  onChange={(date) =>
                    onChange(field.key, date)
                  }
                  placeholder={`Select ${field.label}`}
                />
              )}
            </div>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="flex justify-end gap-2 p-2">
          <Button
            variant="ghost"
            onClick={onReset}
          >
            Reset
          </Button>

          <Button onClick={onApply}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}