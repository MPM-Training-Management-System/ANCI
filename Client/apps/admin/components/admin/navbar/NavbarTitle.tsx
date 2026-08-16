"use client";

import { NavbarTitleProps } from "./types";

export default function NavbarTitle({
  title = "Dashboard",
  subtitle = "Welcome back! Here's what's happening today.",
}: NavbarTitleProps) {
  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-bold tracking-tight text-gray-900">
        {title}
      </h1>

      <p className="mt-0.5 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}