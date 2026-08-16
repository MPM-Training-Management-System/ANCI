"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@repo/ui/index";
import { NavbarCollapseProps } from "./types";

export default function NavbarCollapse({
  collapsed,
  setCollapsed,
}: NavbarCollapseProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setCollapsed(!collapsed)}
      className="
        h-13
        w-13
        rounded-xl
        border
        border-gray-200
        bg-white
        text-gray-700
        shadow-sm
        transition-all
        hover:bg-gray-100
        hover:text-[#002B5C]
      "
    >
      {collapsed ? (
        <PanelLeftOpen size={30} />
      ) : (
        <PanelLeftClose size={30} />
      )}
    </Button>
  );
}