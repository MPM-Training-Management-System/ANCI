"use client";

import { Avatar } from "@repo/ui/index";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-700">
        Dashboard
      </h2>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">
            Ralph Joed
          </p>

          <p className="text-xs text-gray-500">
            Administrator
          </p>
        </div>

        <Avatar
          size="sm"
          fallback="RJ"
        />
      </div>
    </header>
  );
}