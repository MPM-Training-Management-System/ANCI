"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/index";
import { SidebarItemProps } from "./types";

export default function SidebarItem({
  item,
  collapsed,
}: SidebarItemProps) {
  const pathname = usePathname();

  const Icon = item.icon;

  const active =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

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
          active ? "text-yellow-400" : ""
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

  if (!collapsed) {
    return content;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>

        <TooltipContent side="right">
          {item.title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}