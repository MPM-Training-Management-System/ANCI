"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import type { SidebarItemProps } from "./types";

export default function SidebarItem({
  item,
  collapsed,
}: SidebarItemProps) {
  const pathname = usePathname();

  const hasChildren =
    !!item.children && item.children.length > 0;

  const isChildActive =
    hasChildren &&
    item.children?.some(
      (child) =>
        child.href &&
        (pathname === child.href ||
          pathname.startsWith(`${child.href}/`))
    );

  const isActive =
    !!item.href &&
    (pathname === item.href ||
      pathname.startsWith(`${item.href}/`));

  const [open, setOpen] = useState(
    Boolean(isChildActive)
  );

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  /*
   * =========================================================
   * COLLAPSED SIDEBAR
   * =========================================================
   */

  if (collapsed) {
    if (hasChildren) {
      return (
        <div className="group relative">
          <button
            type="button"
            className={[
              "flex h-10 w-full items-center justify-center rounded-lg",
              "text-white/70 transition-all duration-200",
              "hover:bg-white/10 hover:text-white",
              isChildActive
                ? "bg-white/10 text-white"
                : "",
            ].join(" ")}
            aria-label={item.title}
          >
            <item.icon className="h-5 w-5 shrink-0" />
          </button>

          {/* Tooltip */}
          <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {item.title}
          </div>
        </div>
      );
    }

    return (
      <Link
        href={item.href ?? "#"}
        className={[
          "group relative flex h-10 w-full items-center justify-center rounded-lg",
          "text-white/70 transition-all duration-200",
          "hover:bg-white/10 hover:text-white",
          isActive
            ? "bg-white/10 text-white"
            : "",
        ].join(" ")}
      >
        <item.icon className="h-5 w-5 shrink-0" />

        {/* Tooltip */}
        <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          {item.title}
        </div>
      </Link>
    );
  }

  /*
   * =========================================================
   * GROUP / PARENT ITEM
   * =========================================================
   */

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={[
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
            "text-sm font-medium transition-all duration-200",
            "text-white/70 hover:bg-white/10 hover:text-white",
            isChildActive
              ? "bg-white/5 text-white"
              : "",
          ].join(" ")}
        >
          <item.icon className="h-5 w-5 shrink-0" />

          <span className="flex-1 text-left">
            {item.title}
          </span>

          <ChevronDown
            className={[
              "h-4 w-4 shrink-0 transition-transform duration-200",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {/* Children */}
        {open && (
          <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
            {item.children?.map((child, index) => {
              const childActive =
                !!child.href &&
                (pathname === child.href ||
                  pathname.startsWith(`${child.href}/`));

              return (
                <Link
                  key={`${item.title}-${child.title}-${index}`}
                  href={child.href ?? "#"}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2",
                    "text-sm transition-all duration-200",
                    childActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <child.icon className="h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {child.title}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /*
   * =========================================================
   * NORMAL ITEM
   * =========================================================
   */

  return (
    <Link
      href={item.href ?? "#"}
      className={[
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
        "text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-white/10 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <item.icon className="h-5 w-5 shrink-0" />

      <span className="truncate">
        {item.title}
      </span>
    </Link>
  );
}