"use client";

import {
  Badge,
  Button,
  Card,
} from "@repo/ui/index";

import {
  CalendarDays,
  Users,
  UserRound,
  BookOpen,
  Eye,
  Pencil,
} from "lucide-react";

interface TrainingCardProps {
  code: string;
  title: string;
  category: string;
  description: string;
  trainer: string;
  participants: number;
  capacity: number;
  startDate: string;
  endDate: string;
  status: "Draft" | "Open" | "Ongoing" | "Completed";
  image?: string;
  onView?: () => void;
  onEdit?: () => void;
}

export function TrainingCard({
  code,
  title,
  category,
  description,
  trainer,
  participants,
  capacity,
  startDate,
  endDate,
  status,
  image,
  onView,
  onEdit,
}: TrainingCardProps) {
  return (
    <Card className="overflow-hidden p-0">

      {/* Image */}

      <div className="relative">

        <img
          src={
            image ??
            "https://placehold.co/600x300?text=Training"
          }
          alt={title}
          className="h-48 w-full object-cover"
        />

        <div className="absolute right-4 top-4">

          <Badge>{status}</Badge>

        </div>

      </div>

      {/* Body */}

      <div className="space-y-5 p-5">

        <div>

          <p className="text-xs text-muted-foreground">
            {code}
          </p>

          <h3 className="mt-1 text-xl font-semibold">
            {title}
          </h3>

          <Badge >
            {category}
          </Badge>

        </div>

        <p className="line-clamp-3 text-sm text-muted-foreground">
          {description}
        </p>

        <div className="space-y-3 text-sm">

          <div className="flex items-center gap-2">
            <UserRound size={16} />
            <span>{trainer}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              {participants} / {capacity} Participants
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            <span>
              {startDate} - {endDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen size={16} />
            <span>{category}</span>
          </div>

        </div>

        <div className="flex justify-end gap-2 pt-2">

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>

          <Button
            size="sm"
            onClick={onView}
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>

        </div>

      </div>

    </Card>
  );
}