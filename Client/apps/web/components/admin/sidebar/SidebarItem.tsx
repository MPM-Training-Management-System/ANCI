"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/index";

import { Lock } from "lucide-react";

import { SidebarItemProps } from "./types";

export default function SidebarItem({
  item,
  collapsed,
  locked = false,
}: SidebarItemProps & {
  locked?: boolean;
}) {
  const pathname = usePathname();

  const Icon = item.icon;

  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" &&
      pathname.startsWith(item.href));

  
   

  const lockedContent = (
    <div
      className={`
        group relative flex items-center rounded-xl
        transition-all duration-200
        cursor-not-allowed
        opacity-45
        ${
          collapsed
            ? "justify-center h-12 w-12 mx-auto"
            : "gap-3 px-4 py-3"
        }
      `}
    >
      <Icon
        size={20}
        className="shrink-0"
      />

      {!collapsed && (
        <>
          <span className="truncate text-sm font-medium">
            {item.title}
          </span>

          <Lock
            size={15}
            className="ml-auto shrink-0 text-white/50"
          />
        </>
      )}
    </div>
  );

  /*
   * =========================================================
   * NORMAL ITEM
   * =========================================================
   */

  const content = (
    <Link
      href={item.href}
      className={`
        group relative flex items-center rounded-xl transition-all duration-200
        ${
          collapsed
            ? "justify-center h-12 w-12 mx-auto"
            : "gap-3 px-4 py-3"
        }
        ${
          active
            ? "bg-white/10 text-white shadow-sm"
            : "text-white/70 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      {/* Active Indicator */}

      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-yellow-400" />
      )}

      <Icon
        size={20}
        className={`shrink-0 ${
          active
            ? "text-yellow-400"
            : ""
        }`}
      />

      {!collapsed && (
        <span className="truncate text-sm font-medium">
          {item.title}
        </span>
      )}

      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );

  /*
   * =========================================================
   * COLLAPSED TOOLTIP
   * =========================================================
   */

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {locked
              ? lockedContent
              : content}
          </TooltipTrigger>

          <TooltipContent side="right">
            {locked
              ? `${item.title} - Awaiting approval`
              : item.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return locked
    ? lockedContent
    : content;
}