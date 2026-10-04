"use client";

import { NavbarTitleProps } from "./types";

export default function NavbarTitle({
  title = "Dashboard",
  subtitle = "Welcome back! Here's what's happening today.",
}: NavbarTitleProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <h1 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
        {title}
      </h1>

      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
        {subtitle}
      </p>
    </div>
  );
}