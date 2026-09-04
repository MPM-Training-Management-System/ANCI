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
        h-10 w-10
        sm:h-11 sm:w-11
        lg:h-13 lg:w-13

        rounded-lg
        sm:rounded-xl

        border
        border-gray-200
        bg-white
        text-gray-700
        shadow-sm

        transition-all
        hover:bg-gray-100
        hover:text-[#002B5C]

        active:scale-95

        shrink-0
      "
      aria-label={
        collapsed
          ? "Open sidebar"
          : "Close sidebar"
      }
    >
      {collapsed ? (
        <PanelLeftOpen
          className="
            h-5 w-5
            sm:h-6 sm:w-6
            lg:h-[30px] lg:w-[30px]
          "
        />
      ) : (
        <PanelLeftClose
          className="
            h-5 w-5
            sm:h-6 sm:w-6
            lg:h-[30px] lg:w-[30px]
          "
        />
      )}
    </Button>
  );
}