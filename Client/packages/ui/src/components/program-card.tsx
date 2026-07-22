"use client";

import { ReactNode } from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card } from "./card";
import { cn } from "@repo/lib";

interface ProgramCardProps {
  image: string;
  title: string;
  description: string;

  category: string;
  reference: string;

  status: string;
  statusColor?: "primary" | "success" | "warning" | "danger";

  enrolled: number;
  capacity: number;

  onView?: () => void;
  onEdit?: () => void;

  imageOverlay?: ReactNode;
}

const statusStyles = {
  primary: "bg-blue-100 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export function ProgramCard({
  image,
  title,
  description,
  category,
  reference,
  status,
  statusColor = "primary",
  enrolled,
  capacity,
  onEdit,
  onView,
  imageOverlay,
}: ProgramCardProps) {
  return (
    <Card className="overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
        />

        <div className="absolute right-4 top-4">
          <Badge className={cn(statusStyles[statusColor])}>
            {status}
          </Badge>
        </div>

        {imageOverlay}
      </div>

      {/* Body */}
      <div className="space-y-5 p-6">

        <div className="flex items-center gap-2">
          <Badge >
            {category}
          </Badge>

          <span className="text-xs text-muted-foreground">
            • Ref: {reference}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-semibold">
            {title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between border-t pt-5">

          <div>
            <p className="text-xs text-muted-foreground">
              Enrollment
            </p>

            <p className="text-xl font-bold">
              {enrolled}

              <span className="text-sm font-normal text-muted-foreground">
                {" "} / {capacity}
              </span>
            </p>
          </div>

          <div className="flex gap-2">

            <Button
              size="icon"
              variant="outline"
              onClick={onEdit}
            >
              ✏️
            </Button>

            <Button
              onClick={onView}
            >
              View Details
            </Button>

          </div>

        </div>

      </div>

    </Card>
  );
}